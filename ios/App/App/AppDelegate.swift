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
        Self.clearWebViewCache()

        // Metas SDK. Starter med automatisk logning og annonce-id slået FRA og
        // venter på, at brugeren svarer på sporingsdialogen efter onboarding.
        MetaEventsController.applicationDidFinishLaunching(application, launchOptions: launchOptions)

        return true
    }

    // ⚠️ Her stod før applicationWillResignActive, applicationDidEnterBackground,
    // applicationWillEnterForeground og applicationDidBecomeActive.
    //
    // De er FJERNET med vilje. Når appen bruger den scene-baserede
    // opstartsmodel — og det gør den, se UIApplicationSceneManifest i
    // Info.plist — kalder iOS dem ikke længere på app-delegaten. Scenen får
    // dem i stedet. Arbejdet ligger nu i sceneDidBecomeActive og
    // sceneDidEnterBackground i SceneDelegate.swift.
    //
    // Læg dem ikke tilbage her. De ville se fuldstændig rigtige ud og aldrig
    // blive kaldt. scripts/check-ios-scene-lifecycle.mjs fejler, hvis de
    // dukker op igen.

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
    static func clearWebViewCache() {
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

        // Metas AEM-rapportering hænger på dette kald — det er dén vej, et køb
        // kan henføres til en annonce, når brugeren har sagt nej til sporing.
        // Svaret bruges ikke: Capacitor skal stadig have sit eget svar, og
        // begge kan have brug for samme url.
        MetaEventsController.application(app, open: url, options: options)

        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
