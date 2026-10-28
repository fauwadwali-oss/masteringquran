// Shared by the Pages Functions: CORS for the website and the iOS/Android apps,
// and checking the caller's Supabase access token.

export interface SupabaseEnv {
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
}

export interface SupabaseUser {
    id: string;
    email?: string;
    created_at: string;
    email_confirmed_at?: string | null;
    user_metadata?: Record<string, unknown>;
}

const DEFAULT_SUPABASE_URL = "https://hlhtvstvblvdixygchil.supabase.co";
// Public anon key (also shipped in the web bundle); access is protected by RLS.
const DEFAULT_SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsaHR2c3R2Ymx2ZGl4eWdjaGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMzU2MjAsImV4cCI6MjA3ODkxMTYyMH0.XCf-2149qp6UBXt8sOeuK-pHilBB3sBKApsphBUcGhE";

const ALLOWED_ORIGINS = new Set([
    "https://masteringquran.com",
    "https://www.masteringquran.com",
    "capacitor://localhost", // iOS app
    "https://localhost", // Android app
    "http://localhost:5173",
]);

export function corsHeaders(request: Request): Record<string, string> {
    const origin = request.headers.get("Origin") ?? "";
    return ALLOWED_ORIGINS.has(origin)
        ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Headers": "Authorization, Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS", Vary: "Origin" }
        : {};
}

export function jsonResponse(request: Request, status: number, body: Record<string, unknown>): Response {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders(request) } });
}

export function preflight(request: Request): Response {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export function supabaseConfig(env: SupabaseEnv) {
    return { url: env.SUPABASE_URL || DEFAULT_SUPABASE_URL, anonKey: env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY };
}

export function bearerToken(request: Request): string | null {
    return request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") || null;
}

/** The signed-in user for this request, or null if the token is missing or invalid. */
export async function getSupabaseUser(request: Request, env: SupabaseEnv): Promise<SupabaseUser | null> {
    const token = bearerToken(request);
    if (!token) return null;
    const { url, anonKey } = supabaseConfig(env);
    const res = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } });
    return res.ok ? ((await res.json()) as SupabaseUser) : null;
}
