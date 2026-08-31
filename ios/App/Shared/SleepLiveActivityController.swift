import Foundation

#if canImport(ActivityKit)
import ActivityKit

/// Starter, opdaterer og afslutter Live Activity'en for søvnloggen.
///
/// Bruger kun ActivityKit og Foundation, så den kan kompileres ind i både appen
/// og widget-extensionen. Appen styrer aktiviteten via Capacitor-plugin'et;
/// extensionen rører den fra knappens intent, som kører i appens proces.
@available(iOS 16.1, *)
enum SleepLiveActivityController {

    /// Live Activities kan være slået fra i Indstillinger for hver enkelt app.
    static var areActivitiesEnabled: Bool {
        ActivityAuthorizationInfo().areActivitiesEnabled
    }

    private static var current: Activity<SleepActivityAttributes>? {
        Activity<SleepActivityAttributes>.activities.first
    }

    // MARK: - Start

    /// Starter aktiviteten. Kører der allerede en, opdateres den i stedet, så vi
    /// aldrig ender med to tællere på låseskærmen.
    @discardableResult
    static func start(sessionId: String?,
                      sessionStart: Date,
                      phaseStart: Date,
                      isAwake: Bool) -> Bool {

        guard areActivitiesEnabled else {
            NSLog("[CNS-LIVE] Live Activities er slået fra for appen")
            return false
        }

        if current != nil {
            update(isAwake: isAwake, phaseStart: phaseStart)
            return true
        }

        let attributes = SleepActivityAttributes(sessionId: sessionId, sessionStart: sessionStart)
        let state = SleepActivityAttributes.ContentState(isAwake: isAwake, phaseStart: phaseStart)

        do {
            if #available(iOS 16.2, *) {
                _ = try Activity.request(
                    attributes: attributes,
                    content: ActivityContent(state: state, staleDate: nil),
                    pushType: nil
                )
            } else {
                _ = try Activity.request(
                    attributes: attributes,
                    contentState: state,
                    pushType: nil
                )
            }
            NSLog("[CNS-LIVE] Live Activity startet")
            return true
        } catch {
            NSLog("[CNS-LIVE] kunne ikke starte Live Activity: %@", error.localizedDescription)
            return false
        }
    }

    // MARK: - Opdatering

    /// Selve opdateringen. Skal kunne ventes på: knappens intent har kun et
    /// kort øjeblik, før iOS må suspendere appen igen, og fyrer man opdateringen
    /// af sted i en løsrevet Task, kan låseskærmen nå at gå i stå, før den er
    /// nået igennem.
    static func apply(isAwake: Bool, phaseStart: Date) async {
        guard let activity = current else { return }
        let state = SleepActivityAttributes.ContentState(isAwake: isAwake, phaseStart: phaseStart)

        if #available(iOS 16.2, *) {
            await activity.update(ActivityContent(state: state, staleDate: nil))
        } else {
            await activity.update(using: state)
        }
        NSLog("[CNS-LIVE] Live Activity opdateret (vågen: %@)", isAwake ? "ja" : "nej")
    }

    /// Til kald fra Capacitor-plugin'et, hvor appen er i forgrunden og der ikke
    /// er noget at vente på.
    static func update(isAwake: Bool, phaseStart: Date) {
        Task { await apply(isAwake: isAwake, phaseStart: phaseStart) }
    }

    /// Det, aktiviteten viser lige nu.
    ///
    /// Knappens intent skal spørge her frem for at bruge en værdi, der blev sat,
    /// da knappen blev tegnet — ellers sender et hurtigt dobbelttryk den samme
    /// handling to gange i stedet for at skifte tilbage.
    static func currentSnapshot() -> (sessionId: String?, isAwake: Bool)? {
        guard let activity = current else { return nil }
        return (activity.attributes.sessionId, currentState(of: activity).isAwake)
    }

    // MARK: - Afslutning

    /// `activity.content` findes først i 16.2. På 16.1 hedder den `contentState`.
    private static func currentState(
        of activity: Activity<SleepActivityAttributes>
    ) -> SleepActivityAttributes.ContentState {
        if #available(iOS 16.2, *) {
            return activity.content.state
        } else {
            return activity.contentState
        }
    }

    static func end() {
        guard let activity = current else { return }
        let state = currentState(of: activity)

        Task {
            if #available(iOS 16.2, *) {
                await activity.end(
                    ActivityContent(state: state, staleDate: nil),
                    dismissalPolicy: .immediate
                )
            } else {
                await activity.end(using: state, dismissalPolicy: .immediate)
            }
            NSLog("[CNS-LIVE] Live Activity afsluttet")
        }
    }

    /// Afslutter alt, der måtte ligge tilbage fra en tidligere kørsel — for
    /// eksempel hvis appen blev slået ihjel, mens en søvnlog kørte.
    static func endAll() {
        for activity in Activity<SleepActivityAttributes>.activities {
            let state = currentState(of: activity)
            Task {
                if #available(iOS 16.2, *) {
                    await activity.end(
                        ActivityContent(state: state, staleDate: nil),
                        dismissalPolicy: .immediate
                    )
                } else {
                    await activity.end(using: state, dismissalPolicy: .immediate)
                }
            }
        }
    }
}
#endif
