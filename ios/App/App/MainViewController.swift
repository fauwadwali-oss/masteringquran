import UIKit
import Capacitor

// The storyboard's view controller: registers plugins that live in the app itself.
class MainViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(AppleSignInPlugin())
    }
}
