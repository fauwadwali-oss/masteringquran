// Auth provider — cross-platform session management via Supabase.
// Same contract works in React Native with @supabase/supabase-js.

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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
        return () => subscription.unsubscribe();
    }, [configured]);

    const signInWithEmail = async (email: string, redirectTo?: string): Promise<{ error: string | null }> => {
        if (!configured) return { error: "Auth is not configured. Please try again later." };
        const emailRedirectTo = redirectTo || `${window.location.origin}/auth/callback`;
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
