import UIKit
import Capacitor

/// Appens webview-controller.
///
/// Findes udelukkende for at registrere de Capacitor-plugins, der ligger i selve
/// app-targetet.
///
/// Capacitor 8 gennemsøger ikke længere runtime for CAPPlugin-subklasser.
/// `CapacitorBridge.registerPlugins()` læser kun `packageClassList` fra
/// capacitor.config.json, og den liste genereres af `cap sync` ud fra
/// installerede npm-pakker. Et plugin, der ikke kommer fra en pakke, kommer
/// derfor aldrig med, og JavaScript får beskeden
/// «"SleepLiveActivity" plugin is not implemented on ios».
///
/// Der bruges `registerPluginInstance` og ikke `registerPluginType`:
/// registerPluginType returnerer med det samme, når `autoRegisterPlugins` er
/// sand, og det er den her. registerPluginInstance har ikke den spærre.
class MainViewController: CAPBridgeViewController {

    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(SleepLiveActivityPlugin())
    }
}
