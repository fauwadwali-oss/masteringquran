import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./supabase-config";

// Single Supabase client for Mastering Quran.
// Shared with nusratwaliventures (same project, different tables prefixed mq_).
// Future iOS/Android/React Native apps should use the same URL + anon key + RLS.

if (!SUPABASE_ANON_KEY) {
    console.warn(
        "VITE_SUPABASE_ANON_KEY not set. Auth and personalization features are disabled until it's added to the Cloudflare Pages env vars.",
    );
}

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});

export { isSupabaseConfigured };
