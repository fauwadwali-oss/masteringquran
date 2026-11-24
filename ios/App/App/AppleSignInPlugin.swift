import AuthenticationServices
import Capacitor
import CryptoKit

// Sign in with Apple through the system sheet. Returns the identity token and the raw nonce,
// which Supabase checks against the hash inside the token.
@objc(AppleSignInPlugin)
class AppleSignInPlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "AppleSignInPlugin"
    let jsName = "AppleSignIn"
    let pluginMethods: [CAPPluginMethod] = [CAPPluginMethod(name: "authorize", returnType: CAPPluginReturnPromise)]

    private var call: CAPPluginCall?
    private var nonce = ""

    @objc func authorize(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard self.call == nil else {
                call.reject("Sign in is already open", "busy")
                return
            }
            var bytes = [UInt8](repeating: 0, count: 32)
            guard SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes) == errSecSuccess else {
                call.reject("Could not start sign in", "failed")
                return
            }
            self.call = call
            self.nonce = bytes.map { String(format: "%02x", $0) }.joined()
            let request = ASAuthorizationAppleIDProvider().createRequest()
            request.requestedScopes = [.fullName, .email]
            request.nonce = SHA256.hash(data: Data(self.nonce.utf8)).map { String(format: "%02x", $0) }.joined()
            let controller = ASAuthorizationController(authorizationRequests: [request])
            controller.delegate = self
            controller.presentationContextProvider = self
            controller.performRequests()
        }
    }

    private func finish(_ body: (CAPPluginCall) -> Void) {
        guard let call = call else { return }
        self.call = nil
        body(call)
    }
}

extension AppleSignInPlugin: ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        bridge?.viewController?.view.window ?? ASPresentationAnchor()
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        finish { call in
            guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
                  let tokenData = credential.identityToken,
                  let token = String(data: tokenData, encoding: .utf8) else {
                call.reject("Apple did not return a sign-in token", "failed")
                return
            }
            let code = credential.authorizationCode.flatMap { String(data: $0, encoding: .utf8) }
            let name = credential.fullName.map { PersonNameComponentsFormatter().string(from: $0) } ?? ""
            call.resolve(["identityToken": token, "nonce": self.nonce, "authorizationCode": code ?? "", "name": name])
        }
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        finish { call in
            if (error as? ASAuthorizationError)?.code == .canceled {
                call.reject("Cancelled", "cancelled")
            } else {
                call.reject("Apple sign-in did not complete", "failed")
            }
        }
    }
}
