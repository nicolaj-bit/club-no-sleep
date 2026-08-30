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
}
#endif
