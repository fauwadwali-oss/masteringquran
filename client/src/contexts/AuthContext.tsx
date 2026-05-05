// Auth provider — cross-platform session management via Supabase.
// Same contract works in React Native with @supabase/supabase-js.

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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

function getEmailRedirectTo() {
    return Capacitor.isNativePlatform() ? MOBILE_AUTH_CALLBACK : `${window.location.origin}/auth/callback`;
}

function getAuthParams(url: string) {
    const normalizedUrl = url.replace("#", "?");
    const params = new URL(normalizedUrl).searchParams;
    return {
        code: params.get("code"),
        accessToken: params.get("access_token"),
        refreshToken: params.get("refresh_token"),
    };
}

async function completeMobileSignIn(url: string): Promise<Session | null> {
    const { code, accessToken, refreshToken } = getAuthParams(url);

    if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
        return data.session ?? null;
    }

    if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
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
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session ?? null);
            setLoading(false);
        });
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession);
        });

        let appUrlListener: { remove: () => Promise<void> } | null = null;

        if (Capacitor.isNativePlatform()) {
            CapacitorApp.addListener("appUrlOpen", async ({ url }) => {
                if (!url.startsWith(MOBILE_AUTH_CALLBACK)) return;
                try {
                    const newSession = await completeMobileSignIn(url);
                    if (newSession) setSession(newSession);
                    window.history.replaceState({}, "", "/");
                } catch (error) {
                    console.error("Could not complete mobile sign-in", error);
                    window.history.replaceState({}, "", "/?auth_error=1");
                }
            }).then((listener) => {
                appUrlListener = listener;
            });

            CapacitorApp.getLaunchUrl().then(async (launchUrl) => {
                const url = launchUrl?.url;
                if (!url?.startsWith(MOBILE_AUTH_CALLBACK)) return;
                try {
                    const newSession = await completeMobileSignIn(url);
                    if (newSession) setSession(newSession);
                    window.history.replaceState({}, "", "/");
                } catch (error) {
                    console.error("Could not complete launch sign-in", error);
                    window.history.replaceState({}, "", "/?auth_error=1");
                }
            });
        }

        return () => {
            subscription.unsubscribe();
            void appUrlListener?.remove();
        };
    }, [configured]);

    const signInWithEmail = async (email: string, redirectTo?: string): Promise<{ error: string | null }> => {
        if (!configured) return { error: "Auth is not configured. Please try again later." };
        const emailRedirectTo = redirectTo || getEmailRedirectTo();
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo, shouldCreateUser: true },
        });
        return { error: error?.message ?? null };
    };

    const signOut = async (): Promise<void> => {
        if (!configured) return;
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
