import UIKit
import Capacitor

// Apps built with the iOS 27 SDK must use the UIScene lifecycle or they fail to launch.
// The window comes from Main.storyboard (UISceneStoryboardFile in Info.plist).
class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        // Cold launch from a deep link or universal link: forward it so App.getLaunchUrl() still works
        if let urlContext = connectionOptions.urlContexts.first {
            openURL(urlContext)
        }
        if let userActivity = connectionOptions.userActivities.first {
            continueUserActivity(userActivity)
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        if let urlContext = URLContexts.first {
            openURL(urlContext)
        }
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        continueUserActivity(userActivity)
    }

    private func openURL(_ urlContext: UIOpenURLContext) {
        var options: [UIApplication.OpenURLOptionsKey: Any] = [:]
        options[.sourceApplication] = urlContext.options.sourceApplication
        options[.annotation] = urlContext.options.annotation
        options[.openInPlace] = urlContext.options.openInPlace
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, open: urlContext.url, options: options)
    }

    private func continueUserActivity(_ userActivity: NSUserActivity) {
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
    }
}
