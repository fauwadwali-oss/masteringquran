// Auth provider — cross-platform session management via Supabase.
// Same contract works in React Native with @supabase/supabase-js.

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { hasStoredSupabaseSession, isSupabaseConfigured } from "@/lib/supabase-config";
import { describeAuthError, type AuthResult } from "@/lib/auth-errors";
import { trackAuth } from "@/lib/auth-analytics";
import { toast } from "sonner";
import { apiUrl } from "@/lib/api";
import { appShortcutPath } from "@/lib/app-shortcuts";
import { appleCredential, closeProviderBrowser, exchangeProviderCode, isIosApp, openProviderInBrowser, type SocialProvider } from "@/lib/social-auth";
import { clearLocalStudyData } from "@/lib/local-data";

interface AuthContextValue {
    user: User | null;
    session: Session | null;
    loading: boolean;
    configured: boolean;
    /** True while the user arrived from a password reset link and still needs to choose a new password. */
    recoveryPending: boolean;
    signInWithEmail: (email: string, redirectTo?: string) => Promise<AuthResult>;
    /** Google or Apple. On the web this leaves the page; in the apps it opens the system browser or Apple sheet. */
    signInWithProvider: (provider: SocialProvider) => Promise<AuthResult & { cancelled?: boolean }>;
    signUpWithPassword: (email: string, password: string) => Promise<AuthResult & { needsConfirmation?: boolean }>;
    signInWithPassword: (email: string, password: string) => Promise<AuthResult>;
    resendConfirmation: (email: string) => Promise<AuthResult>;
    sendPasswordReset: (email: string) => Promise<AuthResult>;
    updatePassword: (password: string) => Promise<AuthResult>;
    signOut: () => Promise<void>;
    /** Permanently deletes the signed-in account and its data. */
    deleteAccount: () => Promise<AuthResult & { appleStillLinked?: boolean }>;
}

const Ctx = createContext<AuthContextValue | null>(null);
const MOBILE_AUTH_CALLBACK = "masteringquran://auth/callback";
export const RESET_PASSWORD_PATH = "/auth/reset-password";
// The page URL as it was on load, before supabase-js strips auth tokens or errors from it.
const INITIAL_URL = typeof window !== "undefined" ? window.location.href : "";

/** Error code from an email link that failed (for example "otp_expired"), if the page was opened from one. */
export function initialAuthUrlError(): string | null {
    if (!/[?#&]error(?:_code)?=/.test(INITIAL_URL)) return null;
    return getAuthParams(INITIAL_URL).errorCode;
}

function isNativePlatform(): boolean {
    const capacitor = (window as typeof window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    return Boolean(capacitor?.isNativePlatform?.());
}

// Every email link (magic link, sign-up confirmation, password reset) lands on the
// same callback that already works, so no new redirect URLs need allow-listing.
function authRedirectUrl(): string {
    return isNativePlatform() ? MOBILE_AUTH_CALLBACK : `${window.location.origin}/auth/callback`;
}

function isRecoveryUrl(url: string): boolean {
    return /[?#&]type=recovery(?:&|$)/.test(url);
}

// Move React Router to a new path from outside the router (deep links).
function routeTo(path: string) {
    window.history.replaceState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
}

function getAuthParams(url: string) {
    const normalizedUrl = url.replace("#", "?");
    const params = new URL(normalizedUrl).searchParams;
    return {
        code: params.get("code"),
        accessToken: params.get("access_token"),
        refreshToken: params.get("refresh_token"),
        errorCode: params.get("error_code") ?? params.get("error"),
    };
}

async function completeMobileSignIn(client: SupabaseClient, url: string): Promise<Session | null> {
    const { code, accessToken, refreshToken } = getAuthParams(url);

    if (code) {
        const { access_token, refresh_token } = await exchangeProviderCode(code);
        const { data, error } = await client.auth.setSession({ access_token, refresh_token });
        if (error) throw error;
        return data.session ?? null;
    }

    if (accessToken && refreshToken) {
        const { data, error } = await client.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        });
        if (error) throw error;
        return data.session ?? null;
    }

    return null;
}

// New accounts only (matches WELCOME_CUTOFF in functions/api/welcome.ts), so existing users are never emailed.
const WELCOME_CUTOFF = Date.parse("2026-10-28T00:00:00Z");

function maybeSendWelcome(session: Session) {
    const user = session.user;
    if (!user.email_confirmed_at || user.user_metadata?.welcome_sent_at) return;
    if (Date.parse(user.created_at) < WELCOME_CUTOFF) return;
    const key = `mq-welcome-tried-${user.id}`;
    try {
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, "1");
    } catch { /* Fall through: the server makes it send once anyway. */ }
    void fetch(apiUrl("/api/welcome"), { method: "POST", headers: { Authorization: `Bearer ${session.access_token}` } })
        .then((res) => (res.ok ? res.json() : null))
        .then((body: { sent?: boolean } | null) => {
            if (body?.sent) trackAuth("welcome_email_sent", { user_id: user.id });
        })
        .catch(() => { /* Welcome email is best effort. */ });
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (session) maybeSendWelcome(session);
    }, [session]);
    // Captured on first render, before supabase-js strips the tokens from the URL.
    const [recoveryPending, setRecoveryPending] = useState(() => isRecoveryUrl(INITIAL_URL));
    const configured = isSupabaseConfigured();

    useEffect(() => {
        if (!configured) {
            setLoading(false);
            return;
        }
        const nativePlatform = isNativePlatform();
        const authCallback = window.location.pathname === "/auth/callback" || /(?:code|access_token|refresh_token)=/.test(window.location.href);
        if (!nativePlatform && !authCallback && !hasStoredSupabaseSession()) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        let unsubscribe: (() => void) | null = null;
        let appUrlListener: { remove: () => Promise<void> } | null = null;
        void import("@/lib/supabase").then(async ({ supabase }) => {
            if (cancelled) return;
            const { data } = await supabase.auth.getSession();
            if (cancelled) return;
            setSession(data.session ?? null);
            setLoading(false);
            const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
                if (event === "PASSWORD_RECOVERY") setRecoveryPending(true);
                setSession(newSession);
            });
            unsubscribe = () => authListener.subscription.unsubscribe();

            if (!nativePlatform) return;
            const { App: CapacitorApp } = await import("@capacitor/app");
            const finish = async (url: string) => {
                const shortcut = appShortcutPath(url);
                if (shortcut) {
                    routeTo(shortcut);
                    return;
                }
                if (!url.startsWith(MOBILE_AUTH_CALLBACK)) return;
                const recovery = isRecoveryUrl(url);
                const { errorCode } = getAuthParams(url);
                void closeProviderBrowser();
                try {
                    // Closed the Google page without signing in.
                    if (errorCode === "access_denied") return;
                    if (errorCode) throw new Error(errorCode);
                    const newSession = await completeMobileSignIn(supabase, url);
                    if (newSession) setSession(newSession);
                    trackAuth(recovery ? "password_reset_link_open" : "auth_callback_success", { source: "deep_link", user_id: newSession?.user.id });
                    if (recovery) {
                        setRecoveryPending(true);
                        routeTo(RESET_PASSWORD_PATH);
                    } else {
                        routeTo("/");
                    }
                } catch (error) {
                    console.error("Could not complete mobile sign-in", error);
                    trackAuth("auth_callback_error", { source: "deep_link", error_code: errorCode ?? "exchange_failed" });
                    toast.error(errorCode === "otp_expired"
                        ? "This email link has expired or was already used. Please request a new one."
                        : "We could not sign you in with that link. Please try again.");
                    routeTo(errorCode === "otp_expired" ? "/?auth_error=expired" : "/?auth_error=1");
                }
            };
            appUrlListener = await CapacitorApp.addListener("appUrlOpen", ({ url }) => void finish(url));
            const launchUrl = await CapacitorApp.getLaunchUrl();
            if (launchUrl?.url) await finish(launchUrl.url);
        }).catch((error) => {
            console.error("Could not initialize authentication", error);
            if (!cancelled) setLoading(false);
        });

        return () => {
            cancelled = true;
            unsubscribe?.();
            void appUrlListener?.remove();
        };
    }, [configured]);

    const signInWithEmail = async (email: string, redirectTo?: string): Promise<AuthResult> => {
        if (!configured) return { error: "Sign-in is not available right now. Please try again later." };
        const { supabase } = await import("@/lib/supabase");
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: redirectTo || authRedirectUrl(), shouldCreateUser: true },
        });
        return error ? describeAuthError(error) : { error: null };
    };

    const signInWithProvider = async (provider: SocialProvider): Promise<AuthResult & { cancelled?: boolean }> => {
        const failed = { error: `${provider === "apple" ? "Apple" : "Google"} sign-in did not finish. Please try again.` };
        if (!configured) return failed;
        try {
            const { supabase } = await import("@/lib/supabase");
            if (provider === "apple" && isIosApp()) {
                const credential = await appleCredential();
                const { data, error } = await supabase.auth.signInWithIdToken({ provider: "apple", token: credential.identityToken, nonce: credential.nonce });
                if (error) return { ...failed, code: error.code };
                // Apple gives the name only the first time, so keep it now.
                if (credential.name) await supabase.auth.updateUser({ data: { full_name: credential.name } }).catch(() => undefined);
                setSession(data.session);
                return { error: null, userId: data.user?.id };
            }
            if (isNativePlatform()) {
                await openProviderInBrowser(provider, MOBILE_AUTH_CALLBACK);
                return { error: null };
            }
            const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: authRedirectUrl() } });
            return error ? { ...failed, code: error.code } : { error: null };
        } catch (e) {
            if ((e as { code?: string })?.code === "cancelled") return { error: null, cancelled: true };
            return failed;
        }
    };

    const signUpWithPassword = async (email: string, password: string) => {
        if (!configured) return { error: "Sign-up is not available right now. Please try again later." };
        const { supabase } = await import("@/lib/supabase");
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: authRedirectUrl() },
        });
        if (error) return { ...describeAuthError(error) };
        // With email confirmation on, Supabase hides existing accounts by returning a
        // user with no identities instead of an error.
        if (data.user && (data.user.identities?.length ?? 0) === 0) {
            return {
                error: "This email already has an account. Sign in instead, or use Forgot password to set a new password.",
                code: "user_already_exists",
            };
        }
        if (data.session) setSession(data.session);
        return { error: null, needsConfirmation: !data.session, userId: data.user?.id };
    };

    const signInWithPassword = async (email: string, password: string): Promise<AuthResult> => {
        if (!configured) return { error: "Sign-in is not available right now. Please try again later." };
        const { supabase } = await import("@/lib/supabase");
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return describeAuthError(error);
        setSession(data.session);
        return { error: null, userId: data.user?.id };
    };

    const resendConfirmation = async (email: string): Promise<AuthResult> => {
        if (!configured) return { error: "Sign-in is not available right now. Please try again later." };
        const { supabase } = await import("@/lib/supabase");
        const { error } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: authRedirectUrl() } });
        return error ? describeAuthError(error) : { error: null };
    };

    const sendPasswordReset = async (email: string): Promise<AuthResult> => {
        if (!configured) return { error: "Password reset is not available right now. Please try again later." };
        const { supabase } = await import("@/lib/supabase");
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: authRedirectUrl() });
        return error ? describeAuthError(error) : { error: null };
    };

    const updatePassword = async (password: string): Promise<AuthResult> => {
        if (!configured) return { error: "Password reset is not available right now. Please try again later." };
        const { supabase } = await import("@/lib/supabase");
        const { data, error } = await supabase.auth.updateUser({ password });
        if (error) return describeAuthError(error);
        setRecoveryPending(false);
        return { error: null, userId: data.user?.id };
    };

    const signOut = async (): Promise<void> => {
        if (!configured) return;
        const { supabase } = await import("@/lib/supabase");
        trackAuth("sign_out", { user_id: session?.user.id });
        await supabase.auth.signOut();
        setRecoveryPending(false);
    };

    const deleteAccount = async (): Promise<AuthResult & { appleStillLinked?: boolean }> => {
        const failed = { error: "We could not delete your account. Please try again, or email us." };
        if (!configured || !session) return failed;
        try {
            const { supabase } = await import("@/lib/supabase");
            // Accounts made with Apple: confirm with Apple and end the app's access there first.
            const usesApple = !!session.user.identities?.some((i) => i.provider === "apple");
            let appleStillLinked = usesApple;
            if (usesApple && isIosApp()) {
                const { authorizationCode } = await appleCredential();
                const res = await fetch(apiUrl("/api/apple-revoke"), {
                    method: "POST",
                    headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ code: authorizationCode }),
                }).catch(() => null);
                if (res?.status === 409) return { error: "That is a different Apple account. Please confirm with the one you use here." };
                // An Apple outage must not trap someone in an account: delete, and say what is left to do.
                appleStillLinked = !res?.ok;
            }
            const { error } = await supabase.rpc("mq_delete_account");
            if (error) return failed;
            // The user no longer exists on the server, so only clear this device.
            await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
            clearLocalStudyData();
            setSession(null);
            return { error: null, appleStillLinked };
        } catch (e) {
            if ((e as { code?: string })?.code === "cancelled") return { error: "Your account was not deleted. Please confirm with Apple to delete it." };
            return failed;
        }
    };

    return (
        <Ctx.Provider
            value={{
                user: session?.user ?? null,
                session,
                loading,
                configured,
                recoveryPending,
                signInWithEmail,
                signInWithProvider,
                signUpWithPassword,
                signInWithPassword,
                resendConfirmation,
                sendPasswordReset,
                updatePassword,
                signOut,
                deleteAccount,
            }}
        >
            {children}
        </Ctx.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
