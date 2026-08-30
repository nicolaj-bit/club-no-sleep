import Foundation
import UIKit
import UserNotifications

/// Håndterer knaptryk på søvnlog-notifikationen direkte i native kode.
///
/// Baggrund: appen kører i Capacitor remote mode, hvor hele websiden hentes fra
/// base44.app. Når iOS vækker appen kort i baggrunden for at behandle et
/// knaptryk på låseskærmen, når webviewet næsten aldrig at loade siden inden for
/// det tidsrum, iOS giver. Håndteres trykket i JavaScript, går det derfor tabt.
/// Her sendes handlingen direkte fra Swift, uden at webviewet involveres.
///
/// Selve afsendelsen og køen over handlinger, der endnu ikke er nået frem,
/// ligger i `SleepActionSender`, som deles med widget-extensionen. Denne klasse
/// står kun for notifikationerne: kategorien med knapperne, delegate-kæden og
/// baggrundsopgaven, der holder appen i live, mens kaldet er undervejs.
@objc final class SleepLockScreenActions: NSObject, UNUserNotificationCenterDelegate {

    @objc static let shared = SleepLockScreenActions()

    // MARK: - Konstanter

    /// Skal være identisk med actionTypeId i src/lib/sleepNotifications.js
    static let categoryId = "SLEEP_SESSION"
    static let actionAwake = SleepActionSender.actionAwake
    static let actionEnd = SleepActionSender.actionEnd

    /// Den delegate Capacitor selv har sat. Alt vi ikke håndterer, sendes videre
    /// hertil, så appens øvrige notifikationer opfører sig præcis som før.
    private var forwardTo: UNUserNotificationCenterDelegate?

    // MARK: - Opsætning

    /// Kaldes fra AppDelegate. Er idempotent og må gerne kaldes flere gange.
    @objc func install() {
        registerCategory()

        // Capacitor sætter selv delegate, når broen bygges — altså efter
        // didFinishLaunching. Vi lægger os derfor bagerst i køen og gemmer
        // den delegate der allerede står der.
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            let center = UNUserNotificationCenter.current()
            if !(center.delegate === self) {
                self.forwardTo = center.delegate
                center.delegate = self
                NSLog("[CNS-NATIVE] delegate installeret, videresender til %@",
                      String(describing: type(of: self.forwardTo)))
            }
            self.flushQueue()
        }
    }

    /// Registrerer kategorien med de to knapper. Ingen af dem har
    /// `.foreground`, så iOS behandler trykket uden at brugeren skal låse op.
    private func registerCategory() {
        let awake = UNNotificationAction(
            identifier: Self.actionAwake,
            title: "Barnet er vågent",
            options: []
        )
        let end = UNNotificationAction(
            identifier: Self.actionEnd,
            title: "Afslut log",
            options: [.destructive]
        )
        let category = UNNotificationCategory(
            identifier: Self.categoryId,
            actions: [awake, end],
            intentIdentifiers: [],
            options: []
        )

        let center = UNUserNotificationCenter.current()
        center.getNotificationCategories { existing in
            // Bevar alle andre kategorier — vi erstatter kun vores egen.
            var merged = existing.filter { $0.identifier != Self.categoryId }
            merged.insert(category)
            center.setNotificationCategories(merged)
            NSLog("[CNS-NATIVE] kategori registreret: %@", Self.categoryId)
        }
    }

    // MARK: - UNUserNotificationCenterDelegate

    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                didReceive response: UNNotificationResponse,
                                withCompletionHandler completionHandler: @escaping () -> Void) {

        let category = response.notification.request.content.categoryIdentifier
        let actionId = response.actionIdentifier

        if category == Self.categoryId,
           actionId == Self.actionAwake || actionId == Self.actionEnd {

            let sessionId = Self.findSessionId(in: response.notification.request.content.userInfo)
            NSLog("[CNS-NATIVE] knap trykket: %@ (session %@)", actionId, sessionId ?? "ukendt")

            handle(action: actionId, sessionId: sessionId, completion: completionHandler)
            return
        }

        if let forward = forwardTo {
            forward.userNotificationCenter?(center,
                                            didReceive: response,
                                            withCompletionHandler: completionHandler)
        } else {
            completionHandler()
        }
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification,
                                withCompletionHandler completionHandler:
                                    @escaping (UNNotificationPresentationOptions) -> Void) {
        if let forward = forwardTo {
            forward.userNotificationCenter?(center,
                                            willPresent: notification,
                                            withCompletionHandler: completionHandler)
        } else {
            if #available(iOS 14.0, *) {
                completionHandler([.banner, .sound, .badge])
            } else {
                completionHandler([.alert, .sound, .badge])
            }
        }
    }

    // MARK: - Handling

    /// Selve afsendelsen og køen ligger i SleepActionSender, som deles med
    /// widget-extensionen. Her holder vi kun appen i live, mens kaldet er
    /// undervejs — UIApplication findes ikke i en extension.
    private func handle(action: String, sessionId: String?, completion: @escaping () -> Void) {
        var bgTask = UIBackgroundTaskIdentifier.invalid
        bgTask = UIApplication.shared.beginBackgroundTask(withName: "cns-sleep-action") {
            UIApplication.shared.endBackgroundTask(bgTask)
            bgTask = .invalid
        }

        SleepActionSender.perform(action: action, sessionId: sessionId) { _ in
            if bgTask != .invalid {
                UIApplication.shared.endBackgroundTask(bgTask)
                bgTask = .invalid
            }
            completion()
        }
    }

    // MARK: - Kø

    /// Sender ventende handlinger igen. Kaldes ved appstart.
    @objc func flushQueue() {
        SleepActionSender.flushQueue()
    }

    // MARK: - Hjælpere

    /// Capacitor pakker `extra` forskelligt afhængigt af version, så vi leder
    /// efter session_id både øverst og ét niveau nede.
    private static func findSessionId(in userInfo: [AnyHashable: Any]) -> String? {
        if let direct = userInfo["session_id"] as? String { return direct }
        for (_, value) in userInfo {
            if let nested = value as? [AnyHashable: Any],
               let found = nested["session_id"] as? String {
                return found
            }
        }
        return nil
    }
}
