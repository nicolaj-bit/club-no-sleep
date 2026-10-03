import Foundation
import UIKit
import AppTrackingTransparency

// FacebookCore og FacebookAEM er navnene i Swift Package Manager. Dette
// projekt bruger CocoaPods som alle de andre afhængigheder, og der hedder de
// FBSDKCoreKit og FBAEMKit. Det er præcis samme kode: SPM-modulet FacebookCore
// består af én linje, «@_exported import FBSDKCoreKit».
//
// FBAEMKit skal ikke importeres. AEM-rapporteringen kører inde i
// ApplicationDelegate — pakken skal blot være med, og den står i Podfile.
import FBSDKCoreKit

/// Opsætning af Metas SDK og alt, der har med sporingstilladelsen at gøre.
///
/// Appen kører i Capacitor remote mode: hele brugerfladen hentes fra
/// base44.app. Websiden kan derfor ikke selv kalde SDK'et — det ligger i den
/// native app. Broen imellem er `MetaEventsPlugin`, og den bruger denne fil.
///
/// Hele formålet er at kunne se, om annoncer på Facebook og Instagram fører til
/// installationer og køb. Intet andet.
enum MetaEventsController {

    private static let tag = "CNS-META"

    // MARK: - Er SDK'et sat op?

    /// App-id'et står i Info.plist som `$(FACEBOOK_APP_ID)` og bliver skrevet
    /// ind ved build af `ios/App/ci_scripts/inject_meta_config.sh`, som læser
    /// det fra en miljøvariabel. Id'et står altså aldrig i repoet.
    ///
    /// Er det ikke skrevet ind — f.eks. ved en lokal build uden miljøvariabler
    /// — står der stadig teksten `$(FACEBOOK_APP_ID)`. Så skal SDK'et slet
    /// ikke startes: et forkert app-id giver støj i Metas Events Manager og
    /// netværkskald, der aldrig kan lykkes. Derfor tjekkes det, at værdien kun
    /// består af cifre.
    private static var configuredAppID: String? {
        guard
            let raw = Bundle.main.object(forInfoDictionaryKey: "FacebookAppID") as? String,
            !raw.isEmpty,
            raw.allSatisfy({ $0.isNumber })
        else { return nil }
        return raw
    }

    static var isConfigured: Bool { configuredAppID != nil }

    // MARK: - Opstart

    /// Kaldes fra `AppDelegate.didFinishLaunchingWithOptions`.
    static func applicationDidFinishLaunching(
        _ application: UIApplication,
        launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) {
        guard isConfigured else {
            NSLog("[\(tag)] FacebookAppID mangler i Info.plist — SDK'et startes ikke")
            return
        }

        // Rækkefølgen er det vigtigste i hele filen.
        //
        // De tre flag skal stå, FØR SDK'et initialiseres. Gør de ikke det, har
        // SDK'et allerede logget den første hændelse og slået annonce-id'et op,
        // inden brugeren er blevet spurgt om lov. Flagene sættes her i koden og
        // bevidst ikke i Info.plist, netop fordi de skal kunne skiftes igen,
        // når brugeren har svaret.
        Settings.shared.isAutoLogAppEventsEnabled = false
        Settings.shared.isAdvertiserIDCollectionEnabled = false
        Settings.shared.isAdvertiserTrackingEnabled = false

        ApplicationDelegate.shared.application(
            application,
            didFinishLaunchingWithOptions: launchOptions
        )

        // Har brugeren svaret på dialogen i en tidligere session, gælder svaret
        // stadig. Så skal flagene rettes nu og ikke først, når websiden er
        // færdig med at loade og kalder requestTracking igen.
        apply(status: trackingStatus)
    }

    /// Kaldes fra `AppDelegate.application(_:open:options:)`.
    ///
    /// Metas AEM-rapportering (Aggregated Event Measurement) hænger på dette
    /// kald. Det er den måde, Meta kan henføre et køb til en annonce, når
    /// brugeren har sagt nej til sporing — altså præcis det tilfælde, hvor der
    /// ikke er noget enheds-id at gå efter.
    @discardableResult
    static func application(
        _ application: UIApplication,
        open url: URL,
        options: [UIApplication.OpenURLOptionsKey: Any]
    ) -> Bool {
        guard isConfigured else { return false }
        return ApplicationDelegate.shared.application(application, open: url, options: options)
    }

    // MARK: - Sporingstilladelse

    /// Deployment target er 15.0, så App Tracking Transparency (iOS 14+) findes
    /// altid. Derfor ingen `#available`-forgreninger her.
    static var trackingStatus: ATTrackingManager.AuthorizationStatus {
        ATTrackingManager.trackingAuthorizationStatus
    }

    static func name(for status: ATTrackingManager.AuthorizationStatus) -> String {
        switch status {
        case .authorized: return "authorized"
        case .denied: return "denied"
        case .restricted: return "restricted"
        case .notDetermined: return "notDetermined"
        @unknown default: return "notDetermined"
        }
    }

    /// Spørger brugeren om lov til sporing.
    ///
    /// Dialogen vises kun, hvis appen er i forgrunden og aktiv. Er den ikke
    /// det, smider iOS kaldet væk — og brugeren bliver så aldrig spurgt igen,
    /// for systemet regner spørgsmålet som stillet. Derfor siges der nej her,
    /// og `prompted: false` sendes tilbage, så websiden kan prøve igen senere
    /// i stedet for at skrive ned, at brugeren er blevet spurgt.
    static func requestTracking(completion: @escaping (_ status: String, _ prompted: Bool) -> Void) {
        // Både UIApplication.shared og ATT-dialogen må kun røres fra
        // hovedtråden, og Capacitor kalder plugin-metoder fra en baggrundstråd.
        // Uden dette hop crasher appen i det øjeblik, websiden spørger.
        DispatchQueue.main.async {
            let current = trackingStatus

            guard isConfigured else {
                completion(name(for: current), false)
                return
            }

            // Allerede svaret. iOS viser ikke dialogen to gange.
            guard current == .notDetermined else {
                apply(status: current)
                completion(name(for: current), false)
                return
            }

            guard UIApplication.shared.applicationState == .active else {
                NSLog("[\(tag)] appen er ikke aktiv — dialogen vises ikke nu")
                completion(name(for: current), false)
                return
            }

            ATTrackingManager.requestTrackingAuthorization { status in
                DispatchQueue.main.async {
                    apply(status: status)
                    NSLog("[\(tag)] sporingssvar: \(name(for: status))")
                    completion(name(for: status), true)
                }
            }
        }
    }

    /// Hvad brugerens svar betyder for SDK'et.
    ///
    /// - **Ja:** Meta må bruge enhedens annonce-id (IDFA), og automatisk
    ///   logning slås til.
    /// - **Nej eller spærret:** enheds-id må ikke sendes, men anonyme
    ///   hændelser er i orden. Derfor slås `isAutoLogAppEventsEnabled` til,
    ///   mens `isAdvertiserIDCollectionEnabled` og
    ///   `isAdvertiserTrackingEnabled` bliver slået fra. Køb kan stadig måles
    ///   — bare uden at kunne kobles til en bestemt person.
    /// - **Endnu ikke spurgt:** der logges ikke automatisk. Appen venter.
    static func apply(status: ATTrackingManager.AuthorizationStatus) {
        guard isConfigured else { return }

        switch status {
        case .authorized:
            Settings.shared.isAdvertiserIDCollectionEnabled = true
            Settings.shared.isAdvertiserTrackingEnabled = true
            Settings.shared.isAutoLogAppEventsEnabled = true
        case .denied, .restricted:
            Settings.shared.isAdvertiserIDCollectionEnabled = false
            Settings.shared.isAdvertiserTrackingEnabled = false
            Settings.shared.isAutoLogAppEventsEnabled = true
        case .notDetermined:
            Settings.shared.isAdvertiserIDCollectionEnabled = false
            Settings.shared.isAdvertiserTrackingEnabled = false
            Settings.shared.isAutoLogAppEventsEnabled = false
        @unknown default:
            Settings.shared.isAdvertiserIDCollectionEnabled = false
            Settings.shared.isAdvertiserTrackingEnabled = false
            Settings.shared.isAutoLogAppEventsEnabled = false
        }
    }

    // MARK: - Hændelser

    /// Metas anonyme id for denne installation.
    ///
    /// Det er den nøgle, RevenueCat skal have, for at deres køb kan lægges
    /// oven i de hændelser, appen selv sender. Det er ikke et enheds-id og
    /// følger ikke brugeren på tværs af apps.
    static var anonymousID: String? {
        guard isConfigured else { return nil }
        return AppEvents.shared.anonymousID
    }

    static func logEvent(name eventName: String, params: [String: Any]) {
        guard isConfigured, !eventName.isEmpty else { return }
        AppEvents.shared.logEvent(AppEvents.Name(eventName), parameters: parameters(from: params))
    }

    static func logPurchase(amount: Double, currency: String, params: [String: Any]) {
        guard isConfigured else { return }
        AppEvents.shared.logPurchase(
            amount: amount,
            currency: currency,
            parameters: parameters(from: params)
        )
    }

    /// Meta tager kun tekst og tal som parameterværdier. Alt andet bliver
    /// skrevet om til tekst frem for at blive smidt væk — så kan vi se det i
    /// Events Manager og rette det, i stedet for at lede efter noget, der
    /// forsvandt uden spor.
    private static func parameters(from params: [String: Any]) -> [AppEvents.ParameterName: Any] {
        var result: [AppEvents.ParameterName: Any] = [:]
        for (key, value) in params where !key.isEmpty {
            if let text = value as? String {
                result[AppEvents.ParameterName(key)] = text
            } else if let number = value as? NSNumber {
                result[AppEvents.ParameterName(key)] = number
            } else {
                result[AppEvents.ParameterName(key)] = String(describing: value)
            }
        }
        return result
    }
}
