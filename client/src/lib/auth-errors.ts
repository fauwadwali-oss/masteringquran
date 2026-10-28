// Turns Supabase auth errors into short, plain messages for people.
// Codes: https://supabase.com/docs/guides/auth/debugging/error-codes

export interface AuthResult {
    error: string | null;
    code?: string;
    userId?: string;
}

interface SupabaseLikeError {
    message: string;
    code?: string;
    status?: number;
    reasons?: string[];
}

export const MIN_PASSWORD_LENGTH = 8;

const MESSAGES: Record<string, string> = {
    invalid_credentials: "Email or password is incorrect. If you usually sign in with a magic link, use Forgot password to set a password, or email yourself a magic link.",
    email_not_confirmed: "Please confirm your email first. We sent you a link when you signed up.",
    user_already_exists: "This email already has an account. Sign in instead, or use Forgot password to set a new password.",
    email_exists: "This email already has an account. Sign in instead, or use Forgot password to set a new password.",
    weak_password: `Please choose a stronger password: at least ${MIN_PASSWORD_LENGTH} characters, mixing letters and numbers.`,
    same_password: "Your new password must be different from your current one.",
    over_email_send_rate_limit: "We have sent too many emails to this address. Please wait a few minutes and try again.",
    over_request_rate_limit: "Too many attempts. Please wait a minute and try again.",
    email_address_invalid: "Please enter a valid email address.",
    validation_failed: "Please check your email address and try again.",
    signup_disabled: "New sign-ups are paused right now. Please try again later.",
    otp_expired: "This link has expired or was already used. Please request a new one.",
    session_not_found: "Your reset link has expired. Please request a new one.",
    session_expired: "Your session has expired. Please request a new link.",
    bad_jwt: "Your session has expired. Please request a new link.",
    refresh_token_not_found: "Your session has expired. Please request a new link.",
    reauthentication_needed: "For your security, please request a new password reset link.",
};

export function describeAuthError(error: SupabaseLikeError): AuthResult {
    const code = error.code ?? (error.status === 429 ? "over_request_rate_limit" : undefined);
    if (code && MESSAGES[code]) return { error: MESSAGES[code], code };
    if (/fetch|network/i.test(error.message)) {
        return { error: "We could not reach the server. Check your connection and try again.", code: "network" };
    }
    return { error: "Something went wrong. Please try again.", code: code ?? "unknown" };
}

export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/** Client-side check before we ask Supabase. Returns a message, or null when the password is fine. */
export function passwordProblem(password: string): string | null {
    if (password.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "Mix letters and numbers.";
    if (password.length > 72) return "Use 72 characters or fewer.";
    return null;
}
