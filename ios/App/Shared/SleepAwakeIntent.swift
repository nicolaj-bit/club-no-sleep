import Foundation

#if canImport(AppIntents)
import AppIntents

/// Knappen "Barnet er vågent" i Live Activity'en.
///
/// `LiveActivityIntent` kræver iOS 17. Til gengæld kører iOS den i **appens**
/// proces i baggrunden, uden at appen kommer i forgrunden og uden at brugeren
/// skal låse op — præcis det, der ikke kunne lade sig gøre med et knaptryk på en
/// almindelig notifikation.
///
/// Typen kompileres ind i både appen og widget-extensionen: extensionen skal
/// kunne se den for at kunne tegne knappen, appen for at kunne udføre den.
@available(iOS 17.0, *)
struct SleepAwakeIntent: LiveActivityIntent {

    static var title: LocalizedStringResource = "Barnet er vågent"
    static var description = IntentDescription(
        "Markerer at barnet er vågnet, uden at åbne appen."
    )

    /// Må ikke åbne appen. Hele pointen er, at trykket kan tages fra låseskærmen.
    static var openAppWhenRun: Bool = false

    @Parameter(title: "Session")
    var sessionId: String

    init() {
        self.sessionId = ""
    }

    init(sessionId: String?) {
        self.sessionId = sessionId ?? ""
    }

    func perform() async throws -> some IntentResult {
        let id = sessionId.isEmpty ? nil : sessionId

        // Vis med det samme at trykket er registreret. Sker det først, når
        // netværkskaldet er ovre, når brugeren at trykke igen.
        #if canImport(ActivityKit)
        SleepLiveActivityController.markAwake()
        #endif

        await withCheckedContinuation { (continuation: CheckedContinuation<Void, Never>) in
            SleepActionSender.perform(action: SleepActionSender.actionAwake, sessionId: id) { _ in
                continuation.resume()
            }
        }

        return .result()
    }
}
#endif
