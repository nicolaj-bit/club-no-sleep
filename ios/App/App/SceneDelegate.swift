import UIKit
import Capacitor

/// Scene-delegate — iOS 27 kræver, at apps bygget med Xcode 27 bruger den
/// scene-baserede opstartsmodel. Uden denne klasse bliver appen dræbt af
/// systemet ved opstart ("NoSceneLifecycleAdoption").
///
/// Vinduet skabes automatisk af UIKit ud fra Main.storyboard, fordi
/// UISceneStoryboardFile i Info.plist peger på den. Denne klasse sørger
/// primært for, at links og brugeraktiviteter stadig når Capacitor og Meta,
/// som ellers ikke længere ser dem, nu når app-delegatens open url-metoder
/// ikke bliver kaldt.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
        // Koldstart via link: URL'en kommer ikke i launchOptions, men her.
        for context in connectionOptions.urlContexts {
            forwardOpen(url: context.url)
        }
        for activity in connectionOptions.userActivities {
            forwardActivity(activity)
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        for context in URLContexts {
            forwardOpen(url: context.url)
        }
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        forwardActivity(userActivity)
    }

    // MARK: - Livscyklus
    //
    // Disse to stod før i AppDelegate som applicationDidBecomeActive og
    // applicationDidEnterBackground. Med den scene-baserede opstartsmodel
    // kalder iOS dem ikke længere dér — scenen får dem i stedet. Flyttes de
    // tilbage, holder begge dele op med at virke uden at noget fejler.

    func sceneDidBecomeActive(_ scene: UIScene) {
        // Capacitor kan have overskrevet vores notification-delegate og
        // kategorier undervejs. install() er idempotent og sætter dem på plads
        // igen, og sender samtidig eventuelle handlinger fra køen af sted.
        SleepLockScreenActions.shared.install()
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
        // Det er FØRST OG FREMMEST denne rydning, der virker.
        //
        // Rydningen er asynkron, og ved kold opstart når den sjældent at blive
        // færdig, før webviewet begynder at hente siden. Rydder vi derimod, når
        // appen går i baggrunden, er der god tid — og næste opstart er ren.
        // Rydningen i didFinishLaunchingWithOptions er stadig med, så en app,
        // der aldrig har været i baggrunden, også bliver ryddet.
        AppDelegate.clearWebViewCache()
    }

    // MARK: - Videresendelse

    /// Samme håndtering som AppDelegate.application(_:open:options:): Meta
    /// skal have URL'en for AEM-rapportering, og Capacitor skal kunne sende
    /// appUrlOpen til JavaScript.
    private func forwardOpen(url: URL) {
        let app = UIApplication.shared
        MetaEventsController.application(app, open: url, options: [:])
        _ = ApplicationDelegateProxy.shared.application(app, open: url, options: [:])
    }

    private func forwardActivity(_ activity: NSUserActivity) {
        _ = ApplicationDelegateProxy.shared.application(
            UIApplication.shared,
            continue: activity,
            restorationHandler: { _ in }
        )
    }
}