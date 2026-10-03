import Foundation
import Capacitor

/// Capacitor-plugin, så websiden i Base44 kan sende hændelser til Meta.
///
/// Kaldes fra JavaScript som `MetaEvents.logEvent({ ... })`. Se
/// `src/lib/metaEvents.js`, som også lægger det hele på `window.MetaEvents`.
///
/// Android-plugin'et har præcis samme jsName og de samme metoder, så den samme
/// JavaScript virker på begge platforme. `requestTracking` findes derfor også
/// på Android — der svarer den blot `unavailable`, for Android har ingen
/// tilsvarende dialog.
///
/// Pluginet skal registreres i hånden i `MainViewController.capacitorDidLoad`.
/// Capacitor 8 finder kun plugins, der kommer fra en npm-pakke.
@objc(MetaEventsPlugin)
public class MetaEventsPlugin: CAPPlugin, CAPBridgedPlugin {

    public let identifier = "MetaEventsPlugin"
    public let jsName = "MetaEvents"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "logEvent", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "logPurchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestTracking", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getTrackingStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getAnonymousId", returnType: CAPPluginReturnPromise)
    ]

    @objc func logEvent(_ call: CAPPluginCall) {
        guard let name = call.getString("name"), !name.isEmpty else {
            call.reject("name mangler")
            return
        }
        MetaEventsController.logEvent(name: name, params: Self.params(from: call))
        call.resolve(["logged": MetaEventsController.isConfigured])
    }

    @objc func logPurchase(_ call: CAPPluginCall) {
        guard let amount = call.getDouble("amount") else {
            call.reject("amount mangler")
            return
        }
        // Meta kræver en valuta. Uden den bliver beløbet ikke regnet med i
        // annoncernes afkast, så der gættes ikke — der siges fra.
        guard let currency = call.getString("currency"), currency.count == 3 else {
            call.reject("currency skal være en ISO-kode på tre bogstaver, f.eks. DKK")
            return
        }
        MetaEventsController.logPurchase(
            amount: amount,
            currency: currency.uppercased(),
            params: Self.params(from: call)
        )
        call.resolve(["logged": MetaEventsController.isConfigured])
    }

    @objc func requestTracking(_ call: CAPPluginCall) {
        MetaEventsController.requestTracking { status, prompted in
            call.resolve(["status": status, "prompted": prompted])
        }
    }

    /// Er SDK'et ikke sat op, svares «unavailable» — samme svar som Android.
    /// Så viser websiden ikke en forespørgsel, der ikke fører nogen steder.
    @objc func getTrackingStatus(_ call: CAPPluginCall) {
        guard MetaEventsController.isConfigured else {
            call.resolve(["status": "unavailable"])
            return
        }
        call.resolve(["status": MetaEventsController.name(for: MetaEventsController.trackingStatus)])
    }

    @objc func getAnonymousId(_ call: CAPPluginCall) {
        call.resolve(["anonymousId": MetaEventsController.anonymousID ?? ""])
    }

    private static func params(from call: CAPPluginCall) -> [String: Any] {
        guard let params = call.getObject("params") else { return [:] }
        return params.mapValues { $0 as Any }
    }
}
