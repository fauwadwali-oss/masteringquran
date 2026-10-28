// Cloudflare Pages Function: sends one welcome email to a newly confirmed account.
// The client calls this after sign-in with the user's Supabase access token.
// Only accounts created on or after WELCOME_CUTOFF get it, so existing users are
// never emailed. user_metadata.welcome_sent_at makes it send once.

import { WELCOME_HTML, WELCOME_TEXT } from "../_lib/welcome-email";
import { bearerToken, getSupabaseUser, jsonResponse as json, preflight, supabaseConfig, type SupabaseEnv } from "../_lib/auth";

interface Env extends SupabaseEnv {
    RESEND_API_KEY?: string;
    WELCOME_FROM?: string;
    WELCOME_CUTOFF?: string;
}

const DEFAULT_CUTOFF = "2026-10-28T00:00:00Z";
const DEFAULT_FROM = "Mastering Quran <hello@masteringquran.com>";

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => preflight(request);

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    if (!env.RESEND_API_KEY) return json(request, 503, { error: "welcome email not configured" });
    const user = await getSupabaseUser(request, env);
    if (!user) return json(request, 401, { error: "invalid token" });
    const { url: supabaseUrl, anonKey } = supabaseConfig(env);
    const authHeaders = { apikey: anonKey, Authorization: `Bearer ${bearerToken(request)}`, "Content-Type": "application/json" };

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
