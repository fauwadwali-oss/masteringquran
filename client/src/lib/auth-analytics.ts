// Records each step of sign-up, sign-in and password reset.
// Two sinks: GA4 (web funnel reports) and the first-party mq_auth_events table
// (works in the iOS/Android apps too, where GA may not load).
// Never records email addresses or passwords.

const SESSION_KEY = "mq-auth-flow-id";

export type AuthMethod = "password" | "magic_link";

export type AuthStep =
    | "auth_modal_open"
    | "auth_view_change"
    | "signup_submit"
    | "signup_success"
    | "signup_error"
    | "signin_submit"
    | "signin_success"
    | "signin_error"
    | "magic_link_submit"
    | "magic_link_sent"
    | "magic_link_error"
    | "confirmation_resend"
    | "password_reset_request"
    | "password_reset_sent"
    | "password_reset_error"
    | "password_reset_link_open"
    | "password_update_submit"
    | "password_update_success"
    | "password_update_error"
    | "auth_callback_success"
    | "auth_callback_error"
    | "welcome_email_sent"
    | "sign_out";

export interface AuthEventParams {
    method?: AuthMethod;
    view?: string;
    error_code?: string;
    source?: string;
    user_id?: string | null;
}

function platform(): string {
    const capacitor = (window as typeof window & { Capacitor?: { getPlatform?: () => string } }).Capacitor;
    return capacitor?.getPlatform?.() ?? "web";
}

// Groups one person's steps in a single attempt without identifying them.
function flowId(): string {
    try {
        let id = sessionStorage.getItem(SESSION_KEY);
        if (!id) {
            id = crypto.randomUUID();
            sessionStorage.setItem(SESSION_KEY, id);
        }
        return id;
    } catch {
        return "no-storage";
    }
}

export function trackAuth(step: AuthStep, params: AuthEventParams = {}): void {
    if (typeof window === "undefined") return;
    const plat = platform();
    const path = window.location.pathname;

    window.gtag?.("event", step, {
        auth_method: params.method,
        auth_view: params.view,
        auth_error: params.error_code,
        auth_source: params.source,
        app_platform: plat,
    });

    void import("@/lib/supabase")
        .then(({ supabase }) =>
            supabase.from("mq_auth_events").insert({
                step,
                method: params.method ?? null,
                view: params.view ?? null,
                error_code: params.error_code ?? null,
                source: params.source ?? null,
                user_id: params.user_id ?? null,
                flow_id: flowId(),
                platform: plat,
                path,
            }),
        )
        .catch(() => { /* Analytics must never break sign-in. */ });
}
