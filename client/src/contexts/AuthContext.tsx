// Auth provider — cross-platform session management via Supabase.
// Same contract works in React Native with @supabase/supabase-js.

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { hasStoredSupabaseSession, isSupabaseConfigured } from "@/lib/supabase-config";

interface AuthContextValue {
    user: User | null;
    session: Session | null;
    loading: boolean;
    configured: boolean;
    signInWithEmail: (email: string, redirectTo?: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
}

const Ctx = createContext<AuthContextValue | null>(null);
const MOBILE_AUTH_CALLBACK = "masteringquran://auth/callback";

function getAuthParams(url: string) {
    const normalizedUrl = url.replace("#", "?");
    const params = new URL(normalizedUrl).searchParams;
    return {
        code: params.get("code"),
        accessToken: params.get("access_token"),
        refreshToken: params.get("refresh_token"),
    };
}

async function completeMobileSignIn(client: SupabaseClient, url: string): Promise<Session | null> {
    const { code, accessToken, refreshToken } = getAuthParams(url);

    if (code) {
        const { data, error } = await client.auth.exchangeCodeForSession(code);
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

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const configured = isSupabaseConfigured();

    useEffect(() => {
        if (!configured) {
            setLoading(false);
            return;
        }
        const capacitor = (window as typeof window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
        const nativePlatform = Boolean(capacitor?.isNativePlatform?.());
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
            const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
            unsubscribe = () => authListener.subscription.unsubscribe();

            if (!nativePlatform) return;
            const { App: CapacitorApp } = await import("@capacitor/app");
            const finish = async (url: string) => {
                if (!url.startsWith(MOBILE_AUTH_CALLBACK)) return;
                try {
                    const newSession = await completeMobileSignIn(supabase, url);
                    if (newSession) setSession(newSession);
                    window.history.replaceState({}, "", "/");
                } catch (error) {
                    console.error("Could not complete mobile sign-in", error);
                    window.history.replaceState({}, "", "/?auth_error=1");
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

    const signInWithEmail = async (email: string, redirectTo?: string): Promise<{ error: string | null }> => {
        if (!configured) return { error: "Auth is not configured. Please try again later." };
        const capacitor = (window as typeof window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
        const emailRedirectTo = redirectTo || (capacitor?.isNativePlatform?.() ? MOBILE_AUTH_CALLBACK : `${window.location.origin}/auth/callback`);
        const { supabase } = await import("@/lib/supabase");
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo, shouldCreateUser: true },
        });
        return { error: error?.message ?? null };
    };

    const signOut = async (): Promise<void> => {
        if (!configured) return;
        const { supabase } = await import("@/lib/supabase");
        await supabase.auth.signOut();
    };

    return (
        <Ctx.Provider
            value={{
                user: session?.user ?? null,
                session,
                loading,
                configured,
                signInWithEmail,
                signOut,
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
