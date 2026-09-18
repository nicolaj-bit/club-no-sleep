import UIKit
import Capacitor
import WebKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Knapper på søvnlog-notifikationen håndteres i native kode, fordi
        // webviewet i remote mode ikke når at loade inden for det tidsrum,
        // iOS giver til at behandle et knaptryk. Se SleepLockScreenActions.
        SleepLockScreenActions.shared.install()

        // Appen henter hele brugerfladen fra base44.app, og webviewets diskcache
        // overlever appstart. Uden det her kan brugeren sidde med en uger gammel
        // udgave af siden, længe efter at Base44 er publiceret.
        clearWebViewCache()

        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Det er FØRST OG FREMMEST denne rydning, der virker.
        //
        // Rydningen er asynkron, og ved kold opstart når den sjældent at blive
        // færdig, før webviewet begynder at hente siden. Rydder vi derimod, når
        // appen går i baggrunden, er der god tid — og næste opstart er ren.
        // Rydningen i didFinishLaunchingWithOptions er stadig med, så en app,
        // der aldrig har været i baggrunden, også bliver ryddet.
        clearWebViewCache()
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Capacitor kan have overskrevet vores notification-delegate og
        // kategorier undervejs. install() er idempotent og sætter dem på plads
        // igen, og sender samtidig eventuelle handlinger fra køen af sted.
        SleepLockScreenActions.shared.install()
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    // MARK: - Webview-cache

    /// Rydder webviewets cache, så appen altid viser den publicerede udgave af
    /// siden.
    ///
    /// ⚠️ Listen herunder må IKKE udvides med lagringstyper.
    ///
    /// `WKWebsiteDataTypeLocalStorage`, `WKWebsiteDataTypeCookies`,
    /// `WKWebsiteDataTypeIndexedDBDatabases` og
    /// `WKWebsiteDataTypeSessionStorage` er bevidst udeladt. Brugerens login og
    /// Capacitor Preferences ligger dér. Ryddes de, bliver alle brugere logget
    /// ud ved hver opstart, og `cns_native_token` til låseskærmens knapper
    /// forsvinder — så holder søvnloggen op med at virke fra låseskærmen.
    ///
    /// Det ser ud som oplagt oprydning at tage resten med. Det er det ikke.
    private func clearWebViewCache() {
        let cacheTypes: Set<String> = [
            WKWebsiteDataTypeDiskCache,
            WKWebsiteDataTypeMemoryCache,
            WKWebsiteDataTypeOfflineWebApplicationCache,
            WKWebsiteDataTypeFetchCache,
            WKWebsiteDataTypeServiceWorkerRegistrations
        ]

        WKWebsiteDataStore.default().removeData(
            ofTypes: cacheTypes,
            modifiedSince: Date(timeIntervalSince1970: 0)
        ) {
            NSLog("[CNS-CACHE] webview-cache ryddet")
        }
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
