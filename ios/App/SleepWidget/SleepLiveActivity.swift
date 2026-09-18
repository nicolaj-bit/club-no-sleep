import SwiftUI
import WidgetKit
import ActivityKit
import AppIntents

/// Live Activity'en for søvnloggen: den boks der ligger på låseskærmen med en
/// tæller der løber, og én knap der går begge veje.
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
                // Samme opbygning som låseskærmen: teksten til venstre,
                // tælleren til højre, knappen nedenunder.
                DynamicIslandExpandedRegion(.leading) {
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
                    toggleButton(context: context)
                }
            } compactLeading: {
                // Tomt med vilje — ikonet er fjernet, tælleren står til højre.
                EmptyView()
            } compactTrailing: {
                timer(from: context.state.phaseStart)
                    .monospacedDigit()
                    .frame(maxWidth: 44)
            } minimal: {
                timer(from: context.state.phaseStart)
                    .monospacedDigit()
            }
        }
    }

    // MARK: - Låseskærm

    @ViewBuilder
    private func lockScreen(
        context: ActivityViewContext<SleepActivityAttributes>
    ) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            // Teksten går helt ud til venstre kant; tælleren bliver stående til
            // højre i samme størrelse som før. HStack centrerer dem lodret i
            // forhold til hinanden.
            HStack(spacing: 10) {
                Text(title(for: context.state))
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.white)

                Spacer(minLength: 8)

                timer(from: context.state.phaseStart)
                    .font(.system(.title2, design: .rounded).monospacedDigit())
                    .foregroundStyle(.white)
            }

            toggleButton(context: context)
        }
        .padding(16)
    }

    // MARK: - Knap

    /// Én knap, der går begge veje. Teksten og handlingen følger tilstanden, og
    /// intentet aflæser selv tilstanden igen, når det køres.
    ///
    /// Knappen fylder hele bredden og er høj med vilje: den bruges om natten,
    /// med én hånd, i mørke.
    ///
    /// Her er der bevidst ingen Afslut-knap — loggen afsluttes inde i appen.
    /// Notifikationen har den stadig, for dér kan knapperne ikke skifte tekst
    /// med tilstanden, og den er eneste overflade på Android og på iPhones uden
    /// Live Activity.
    ///
    /// `Button(intent:)` kræver iOS 17. På 16.1–16.x tegnes aktiviteten uden
    /// knap; dér bruger appen i stedet den almindelige notifikation.
    @ViewBuilder
    private func toggleButton(
        context: ActivityViewContext<SleepActivityAttributes>
    ) -> some View {
        if #available(iOS 17.0, *) {
            Button(intent: SleepPhaseToggleIntent()) {
                Text(buttonTitle(for: context.state))
                    .font(.headline)
                    .frame(maxWidth: .infinity, minHeight: 44)
                    .padding(.vertical, 6)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.borderedProminent)
            .tint(.white.opacity(0.22))
            .foregroundStyle(.white)
        }
    }

    // MARK: - Tekst

    /// Hvad knappen gør, hvis man trykker nu — ikke hvad der gælder lige nu.
    private func buttonTitle(for state: SleepActivityAttributes.ContentState) -> String {
        state.isAwake ? "Sover igen" : "Barnet er vågent"
    }

    private func title(for state: SleepActivityAttributes.ContentState) -> String {
        state.isAwake ? "Barnet er vågent" : "Søvnlog kører"
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
