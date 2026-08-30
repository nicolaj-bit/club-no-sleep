import Foundation
import Capacitor

/// Capacitor-plugin, så websiden i Base44 kan starte, opdatere og stoppe
/// Live Activity'en.
///
/// Kaldes fra JavaScript som `SleepLiveActivity.start({ ... })`. Se
/// `src/lib/sleepLiveActivity.js`.
@objc(SleepLiveActivityPlugin)
public class SleepLiveActivityPlugin: CAPPlugin, CAPBridgedPlugin {

    public let identifier = "SleepLiveActivityPlugin"
    public let jsName = "SleepLiveActivity"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isSupported", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "update", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "end", returnType: CAPPluginReturnPromise)
    ]

    /// Der startes kun en Live Activity, hvis knappen rent faktisk kan komme med.
    ///
    /// Selve aktiviteten findes fra 16.1, men de interaktive knapper kræver App
    /// Intents, altså iOS 17. På 16.x ville brugeren få en boks på låseskærmen
    /// helt uden knap, og så er den almindelige notifikation bedre — dér ligger
    /// knapperne trods alt under et langt tryk.
    private static var isLiveActivitySupported: Bool {
        guard #available(iOS 17.0, *) else { return false }
        return SleepLiveActivityController.areActivitiesEnabled
    }

    @objc func isSupported(_ call: CAPPluginCall) {
        call.resolve(["supported": Self.isLiveActivitySupported])
    }

    @objc func start(_ call: CAPPluginCall) {
        guard #available(iOS 17.0, *), Self.isLiveActivitySupported else {
            call.resolve(["started": false])
            return
        }

        let sessionId = call.getString("sessionId")
        let isAwake = call.getBool("isAwake") ?? false
        let phaseStart = Self.parseDate(call.getString("phaseStart")) ?? Date()
        let sessionStart = Self.parseDate(call.getString("sessionStart")) ?? phaseStart

        let started = SleepLiveActivityController.start(
            sessionId: sessionId,
            sessionStart: sessionStart,
            phaseStart: phaseStart,
            isAwake: isAwake
        )
        call.resolve(["started": started])
    }

    @objc func update(_ call: CAPPluginCall) {
        guard #available(iOS 17.0, *), Self.isLiveActivitySupported else {
            call.resolve()
            return
        }

        let isAwake = call.getBool("isAwake") ?? false
        let phaseStart = Self.parseDate(call.getString("phaseStart")) ?? Date()

        SleepLiveActivityController.update(isAwake: isAwake, phaseStart: phaseStart)
        call.resolve()
    }

    @objc func end(_ call: CAPPluginCall) {
        guard #available(iOS 16.1, *) else {
            call.resolve()
            return
        }
        // Afslut alt, ikke kun den aktuelle: har appen været slået ihjel, kan
        // der ligge en aktivitet tilbage, som vi ikke har en reference til.
        SleepLiveActivityController.endAll()
        call.resolve()
    }

    // MARK: - Hjælpere

    /// JavaScript sender tidspunkter som ISO-strenge fra `toISOString()`, altså
    /// med brøkdele af sekunder. Ældre strenge uden brøkdele skal også kunne
    /// læses, så der forsøges med begge formater.
    private static func parseDate(_ value: String?) -> Date? {
        guard let value = value, !value.isEmpty else { return nil }

        let withFraction = ISO8601DateFormatter()
        withFraction.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = withFraction.date(from: value) { return date }

        let plain = ISO8601DateFormatter()
        plain.formatOptions = [.withInternetDateTime]
        return plain.date(from: value)
    }
}
