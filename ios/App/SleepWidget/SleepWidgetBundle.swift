import SwiftUI
import WidgetKit

/// Indgangen til widget-extensionen.
///
/// Extensionen indeholder kun Live Activity'en for søvnloggen — ingen widgets
/// til hjemmeskærmen. Targetet har sit eget deployment target på 16.1, fordi
/// ActivityKit ikke findes før da, mens selve appen bliver på 15.0.
@main
struct SleepWidgetBundle: WidgetBundle {
    var body: some Widget {
        SleepLiveActivity()
    }
}
