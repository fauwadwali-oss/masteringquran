import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Single Supabase client for Mastering Quran.
// Shared with nusratwaliventures (same project, different tables prefixed mq_).
// Future iOS/Android/React Native apps should use the same URL + anon key + RLS.

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
    "https://hlhtvstvblvdixygchil.supabase.co";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!anonKey) {
    console.warn(
        "VITE_SUPABASE_ANON_KEY not set. Auth and personalization features will not work until you add it to Cloudflare Pages env vars.",
    );
}

export const supabase: SupabaseClient = createClient(url, anonKey || "", {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // handles magic-link redirect
    },
});

export const isSupabaseConfigured = (): boolean => Boolean(anonKey);
