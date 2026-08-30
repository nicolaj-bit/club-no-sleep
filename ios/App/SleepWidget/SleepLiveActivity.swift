import SwiftUI
import WidgetKit
import ActivityKit
import AppIntents

/// Live Activity'en for søvnloggen: den boks der ligger på låseskærmen med en
/// tæller der løber, og knappen "Barnet er vågent".
///
/// Tælleren opdateres af systemet ud fra `phaseStart`. Hverken appen eller
/// widgeten skal være vågen for at den løber videre — der sendes altså ingen
/// opdateringer bare for at tælle sekunder.
struct SleepLiveActivity: Widget {

    var body: some WidgetConfiguration {
        ActivityConfiguration(for: SleepActivityAttributes.self) { context in
            lockScreen(context: context)
                .activityBackgroundTint(Color.black.opacity(0.6))
                .activitySystemActionForegroundColor(.white)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: context.state.isAwake ? "sun.max.fill" : "moon.zzz.fill")
                        .foregroundStyle(.white)
                }
                DynamicIslandExpandedRegion(.center) {
                    Text(title(for: context.state))
                        .font(.caption)
                        .foregroundStyle(.white)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    timer(from: context.state.phaseStart)
                        .font(.system(.title3, design: .rounded).monospacedDigit())
                        .foregroundStyle(.white)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    awakeButton(context: context)
                }
            } compactLeading: {
                Image(systemName: context.state.isAwake ? "sun.max.fill" : "moon.zzz.fill")
            } compactTrailing: {
                timer(from: context.state.phaseStart)
                    .monospacedDigit()
                    .frame(maxWidth: 44)
            } minimal: {
                Image(systemName: context.state.isAwake ? "sun.max.fill" : "moon.zzz.fill")
            }
        }
    }

    // MARK: - Låseskærm

    @ViewBuilder
    private func lockScreen(
        context: ActivityViewContext<SleepActivityAttributes>
    ) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 10) {
                Image(systemName: context.state.isAwake ? "sun.max.fill" : "moon.zzz.fill")
                    .font(.title3)
                    .foregroundStyle(.white)

                VStack(alignment: .leading, spacing: 2) {
                    Text(title(for: context.state))
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.white)
                    Text(subtitle(for: context.state))
                        .font(.caption2)
                        .foregroundStyle(.white.opacity(0.7))
                }

                Spacer(minLength: 8)

                timer(from: context.state.phaseStart)
                    .font(.system(.title2, design: .rounded).monospacedDigit())
                    .foregroundStyle(.white)
            }

            awakeButton(context: context)
        }
        .padding(16)
    }

    // MARK: - Knap

    /// Knappen vises kun, mens barnet sover — er det allerede markeret vågent,
    /// er der intet at trykke på.
    ///
    /// `Button(intent:)` kræver iOS 17. På 16.1–16.x tegnes aktiviteten uden
    /// knap; dér bruger appen i stedet den almindelige notifikation, hvis
    /// knapper ligger under et langt tryk.
    @ViewBuilder
    private func awakeButton(
        context: ActivityViewContext<SleepActivityAttributes>
    ) -> some View {
        if !context.state.isAwake {
            if #available(iOS 17.0, *) {
                Button(intent: SleepAwakeIntent(sessionId: context.attributes.sessionId)) {
                    Text("Barnet er vågent")
                        .font(.subheadline.weight(.semibold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 6)
                }
                .buttonStyle(.borderedProminent)
                .tint(.white.opacity(0.22))
                .foregroundStyle(.white)
            }
        }
    }

    // MARK: - Tekst

    private func title(for state: SleepActivityAttributes.ContentState) -> String {
        state.isAwake ? "Barnet er vågent" : "Søvnlog kører"
    }

    private func subtitle(for state: SleepActivityAttributes.ContentState) -> String {
        state.isAwake ? "Vågen siden" : "Sover siden"
    }

    /// Tæller opad fra `start`. Vinduet på et døgn er blot en øvre grænse for,
    /// hvor længe systemet skal tælle — en søvnlog bliver aldrig så lang.
    private func timer(from start: Date) -> Text {
        Text(
            timerInterval: start...start.addingTimeInterval(60 * 60 * 24),
            countsDown: false
        )
    }
}
