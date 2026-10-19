// Public browser configuration. The anon key is intentionally shipped to clients;
// database access is protected by Supabase Row Level Security.
export const SUPABASE_URL =
    (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
    "https://hlhtvstvblvdixygchil.supabase.co";

export const SUPABASE_ANON_KEY =
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsaHR2c3R2Ymx2ZGl4eWdjaGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMzU2MjAsImV4cCI6MjA3ODkxMTYyMH0.XCf-2149qp6UBXt8sOeuK-pHilBB3sBKApsphBUcGhE";

export const isSupabaseConfigured = (): boolean => Boolean(SUPABASE_ANON_KEY);

export function hasStoredSupabaseSession(): boolean {
    if (typeof window === "undefined") return false;
    for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (key?.startsWith("sb-") && key.endsWith("-auth-token") && localStorage.getItem(key)) return true;
    }
    return false;
}
