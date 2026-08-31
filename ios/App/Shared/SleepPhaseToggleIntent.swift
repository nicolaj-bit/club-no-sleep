import Foundation

#if canImport(AppIntents)
import AppIntents

/// Knappen i Live Activity'en.
///
/// Der er kun én knap, og den går begge veje: sover barnet, markerer den det
/// vågent; er barnet vågent, markerer den at det sover igen.
///
/// `LiveActivityIntent` kræver iOS 17. Til gengæld kører iOS den i **appens**
/// proces i baggrunden, uden at appen kommer i forgrunden og uden at brugeren
/// skal låse op.
///
/// Typen kompileres ind i både appen og widget-extensionen: extensionen skal
/// kunne se den for at kunne tegne knappen, appen for at kunne udføre den.
@available(iOS 17.0, *)
struct SleepPhaseToggleIntent: LiveActivityIntent {

    static var title: LocalizedStringResource = "Skift søvntilstand"
    static var description = IntentDescription(
        "Markerer at barnet er vågnet eller sover igen, uden at åbne appen."
    )

    /// Må ikke åbne appen. Hele pointen er, at trykket kan tages fra låseskærmen.
    static var openAppWhenRun: Bool = false

    /// Skal kunne køre, mens telefonen er låst.
    ///
    /// Standarden for et AppIntent er `.requiresAuthentication`, og så beder iOS
    /// om adgangskode, før knappen udføres — altså præcis den oplåsning, knappen
    /// skulle gøre overflødig.
    static var authenticationPolicy: IntentAuthenticationPolicy = .alwaysAllowed

    init() {}

    func perform() async throws -> some IntentResult {
        #if canImport(ActivityKit)
        // Tilstanden aflæses HER, på det tidspunkt knappen køres — ikke fra en
        // parameter, der blev sat, da knappen blev tegnet. Trykker man to gange
        // hurtigt efter hinanden, læser andet tryk den tilstand, første tryk
        // lige har sat, og sender derfor den modsatte handling frem for at
        // gentage den samme.
        guard let snapshot = SleepLiveActivityController.currentSnapshot() else {
            NSLog("[CNS-LIVE] ingen aktiv Live Activity — trykket ignoreres")
            return .result()
        }

        let nowAwake = !snapshot.isAwake
        let action = nowAwake ? SleepActionSender.actionAwake : SleepActionSender.actionSleeping

        // Vend knappen og statusteksten med det samme, så låseskærmen svarer på
        // trykket, længe før netværkskaldet er ovre.
        await SleepLiveActivityController.apply(isAwake: nowAwake, phaseStart: Date())

        await withCheckedContinuation { (continuation: CheckedContinuation<Void, Never>) in
            SleepActionSender.perform(action: action, sessionId: snapshot.sessionId) { _ in
                continuation.resume()
            }
        }
        #endif

        return .result()
    }
}
#endif
