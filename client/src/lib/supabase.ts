import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Single Supabase client for Mastering Quran.
// Shared with nusratwaliventures (same project, different tables prefixed mq_).
// Future iOS/Android/React Native apps should use the same URL + anon key + RLS.

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
    "https://hlhtvstvblvdixygchil.supabase.co";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Placeholder used if the real key is missing, so createClient() does not
// throw synchronously at module load and crash the whole React tree.
// isSupabaseConfigured() still reports false so auth code skips calls.
const PLACEHOLDER_KEY = "mq-placeholder-not-configured";

if (!anonKey) {
    console.warn(
        "VITE_SUPABASE_ANON_KEY not set. Auth and personalization features are disabled until it's added to the Cloudflare Pages env vars.",
    );
}

export const supabase: SupabaseClient = createClient(url, anonKey || PLACEHOLDER_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: Boolean(anonKey), // only handle magic-link redirect when real key is present
    },
});

export const isSupabaseConfigured = (): boolean => Boolean(anonKey) && anonKey !== PLACEHOLDER_KEY;
