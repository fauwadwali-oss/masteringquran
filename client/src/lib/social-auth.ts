// Google and Apple sign-in. A button is offered only while its provider is switched on in Supabase.
import { createClient, type Session } from "@supabase/supabase-js";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase-config";

export type SocialProvider = "google" | "apple";

interface AppleCredential {
    identityToken: string;
    nonce: string;
    authorizationCode: string;
    name: string;
}

const AppleSignIn = registerPlugin<{ authorize(): Promise<AppleCredential> }>("AppleSignIn");

export const isIosApp = () => Capacitor.getPlatform() === "ios";

// Apple on the web and Android needs a Services ID and secret in Supabase; the iPhone app does not.
const APPLE_WEB_ENABLED = import.meta.env.VITE_APPLE_WEB_SIGNIN === "1";

let enabled: Promise<SocialProvider[]> | null = null;

export function enabledProviders(): Promise<SocialProvider[]> {
    enabled ??= fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_ANON_KEY } })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then(({ external }: { external?: Record<string, boolean> }) => {
            const list: SocialProvider[] = [];
            if (external?.apple && (isIosApp() || APPLE_WEB_ENABLED)) list.push("apple");
            if (external?.google) list.push("google");
            return list;
        })
        .catch(() => {
            enabled = null; // Offline: ask again next time.
            return [];
        });
    return enabled;
}

/** The system Apple sheet. Throws an error with code "cancelled" when the reader closes it. */
export const appleCredential = () => AppleSignIn.authorize();

// In the apps the browser hands back a one-time code, which only works together with the secret
// this client keeps on the device. Other apps registering the same link cannot use it.
function pkceClient() {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { flowType: "pkce", storageKey: "mq-oauth", persistSession: true, autoRefreshToken: false, detectSessionInUrl: false },
    });
}

export async function openProviderInBrowser(provider: SocialProvider, redirectTo: string): Promise<void> {
    const { data, error } = await pkceClient().auth.signInWithOAuth({ provider, options: { redirectTo, skipBrowserRedirect: true } });
    if (error) throw error;
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url: data.url, presentationStyle: "popover" });
}

export async function closeProviderBrowser(): Promise<void> {
    try {
        const { Browser } = await import("@capacitor/browser");
        await Browser.close();
    } catch { /* Not open, or already closed by the system (Android). */ }
}

export async function exchangeProviderCode(code: string): Promise<Session> {
    const { data, error } = await pkceClient().auth.exchangeCodeForSession(code);
    try {
        localStorage.removeItem("mq-oauth"); // The main client keeps the session from here.
    } catch { /* Storage is blocked. */ }
    if (error) throw error;
    return data.session;
}
