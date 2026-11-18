import Foundation

#if canImport(ActivityKit)
import ActivityKit

/// Beskriver den Live Activity, der ligger på låseskærmen, mens en søvnlog kører.
///
/// Deles mellem app-targetet og widget-extensionen: appen starter og opdaterer
/// aktiviteten, widgeten tegner den. Begge skal bruge præcis samme type, ellers
/// kan iOS ikke parre dem.
///
/// App-targetet har deployment target 15.0, så typen er markeret 16.1 og bliver
/// kun rørt bag en tilgængelighedskontrol. Widget-extensionen har sit eget
/// target på 16.1 og kan bruge den frit.
@available(iOS 16.1, *)
struct SleepActivityAttributes: ActivityAttributes {

    /// Den del der ændrer sig undervejs.
    public struct ContentState: Codable, Hashable {
        /// Om barnet er vågent lige nu. Styrer både teksten og om knappen vises.
        var isAwake: Bool
        /// Starten på den aktuelle periode. Tælleren løber fra dette tidspunkt.
        ///
        /// Den tælles ikke op af os: SwiftUI's `Text(timerInterval:)` regner selv
        /// videre ud fra tidsstemplet, så tælleren er rigtig, uden at appen skal
        /// være vågen for at opdatere den.
        var phaseStart: Date
    }

    /// Id på søvnloggen, så knappen kan sende handlingen for den rigtige session.
    var sessionId: String?
    /// Hele sessionens starttidspunkt.
    var sessionStart: Date

    // MARK: - Tekster
    //
    // Teksterne tegnes af Swift, men vælges af web-laget og sættes én gang, når
    // aktiviteten starter. Det er med vilje, at de ligger her og ikke i
    // ContentState: knappen på låseskærmen kører i widget-extensionen uden at
    // JavaScript er i gang, så den skal kunne slå teksten op selv.
    //
    // Er de tomme — fordi aktiviteten er startet af en ældre udgave af appen —
    // falder widgeten tilbage til de danske tekster.

    /// Overskrift når barnet er vågent.
    var titleAwake: String?
    /// Overskrift når barnet sover.
    var titleSleeping: String?
    /// Knaptekst mens barnet er vågent (et tryk betyder "sover igen").
    var buttonWhenAwake: String?
    /// Knaptekst mens barnet sover (et tryk betyder "barnet er vågent").
    var buttonWhenSleeping: String?
}
#endif
