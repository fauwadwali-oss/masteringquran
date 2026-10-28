// Cloudflare Pages Function: sends one welcome email to a newly confirmed account.
// The client calls this after sign-in with the user's Supabase access token.
// Only accounts created on or after WELCOME_CUTOFF get it, so existing users are
// never emailed. user_metadata.welcome_sent_at makes it send once.

import { WELCOME_HTML, WELCOME_TEXT } from "../_lib/welcome-email";

interface Env {
    RESEND_API_KEY?: string;
    WELCOME_FROM?: string;
    WELCOME_CUTOFF?: string;
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
}

interface SupabaseUser {
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
const DEFAULT_CUTOFF = "2026-10-28T00:00:00Z";
const DEFAULT_FROM = "Mastering Quran <hello@masteringquran.com>";
const ALLOWED_ORIGINS = new Set([
    "https://masteringquran.com",
    "https://www.masteringquran.com",
    "capacitor://localhost", // iOS app
    "https://localhost", // Android app
    "http://localhost:5173",
]);

function cors(request: Request): Record<string, string> {
    const origin = request.headers.get("Origin") ?? "";
    return ALLOWED_ORIGINS.has(origin)
        ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Headers": "Authorization, Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS", Vary: "Origin" }
        : {};
}

function json(request: Request, status: number, body: Record<string, unknown>): Response {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...cors(request) } });
}

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => new Response(null, { status: 204, headers: cors(request) });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    if (!env.RESEND_API_KEY) return json(request, 503, { error: "welcome email not configured" });
    const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return json(request, 401, { error: "missing token" });

    const supabaseUrl = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const anonKey = env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
    const authHeaders = { apikey: anonKey, Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: authHeaders });
    if (!userRes.ok) return json(request, 401, { error: "invalid token" });
    const user = (await userRes.json()) as SupabaseUser;

    const cutoff = Date.parse(env.WELCOME_CUTOFF || DEFAULT_CUTOFF);
    if (!user.email || !user.email_confirmed_at) return json(request, 200, { sent: false, reason: "not_confirmed" });
    if (Date.parse(user.created_at) < cutoff) return json(request, 200, { sent: false, reason: "existing_account" });
    if (user.user_metadata?.welcome_sent_at) return json(request, 200, { sent: false, reason: "already_sent" });

    // Claim first so a double call can't send twice; undo if the send fails.
    const mark = (value: string | null) =>
        fetch(`${supabaseUrl}/auth/v1/user`, { method: "PUT", headers: authHeaders, body: JSON.stringify({ data: { welcome_sent_at: value } }) });
    if (!(await mark(new Date().toISOString())).ok) return json(request, 502, { error: "could not record welcome" });

    const sendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            from: env.WELCOME_FROM || DEFAULT_FROM,
            to: [user.email],
            subject: "Welcome to Mastering Quran",
            html: WELCOME_HTML,
            text: WELCOME_TEXT,
            tags: [{ name: "type", value: "welcome" }],
        }),
    });
    if (!sendRes.ok) {
        await mark(null);
        return json(request, 502, { error: "send failed" });
    }
    return json(request, 200, { sent: true });
};
