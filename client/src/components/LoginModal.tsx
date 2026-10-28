import { useEffect, useRef, useState } from "react";
import { Loader2, Mail, CheckCircle2, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "react-router-dom";
import { rememberAuthReturn } from "@/lib/auth-return";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { trackAuth } from "@/lib/auth-analytics";
import { isValidEmail, MIN_PASSWORD_LENGTH, passwordProblem } from "@/lib/auth-errors";

interface Props {
    open: boolean;
    onClose: () => void;
    reason?: string;
    initialView?: "signin" | "signup";
}

type View = "signin" | "signup" | "magic" | "forgot";
type Sent = { kind: "magic" | "confirm" | "reset"; email: string };

const TITLES: Record<View, string> = {
    signin: "Sign in",
    signup: "Create your free account",
    magic: "Get a magic link",
    forgot: "Reset your password",
};

export default function LoginModal({ open, onClose, reason, initialView = "signin" }: Props) {
    const { signInWithEmail, signUpWithPassword, signInWithPassword, resendConfirmation, sendPasswordReset, configured, user } = useAuth();
    const [view, setView] = useState<View>(initialView);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState<Sent | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [errorCode, setErrorCode] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const location = useLocation();
    const source = location.pathname;
    const openedRef = useRef(false);

    useEffect(() => { if (open && user) onClose(); }, [open, user, onClose]);

    useEffect(() => {
        if (open && !openedRef.current) {
            openedRef.current = true;
            setView(initialView);
            trackAuth("auth_modal_open", { view: initialView, source });
        }
        if (!open) openedRef.current = false;
    }, [open, initialView, source]);

    const switchView = (next: View) => {
        setView(next);
        setError(null);
        setErrorCode(null);
        setNotice(null);
        setPassword("");
        trackAuth("auth_view_change", { view: next, source });
    };

    const rememberReturn = () => rememberAuthReturn(location.pathname + location.search + location.hash);

    const fail = (message: string, code?: string) => {
        setError(message);
        setErrorCode(code ?? null);
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanEmail = email.trim().toLowerCase();
        setError(null);
        setErrorCode(null);
        setNotice(null);
        if (!isValidEmail(cleanEmail)) {
            fail("Please enter a valid email address.");
            return;
        }
        if (view === "signup") {
            const problem = passwordProblem(password);
            if (problem) {
                fail(problem);
                return;
            }
        }
        if (view === "signin" && !password) {
            fail("Please enter your password.");
            return;
        }

        setLoading(true);
        try {
            if (view === "signin") {
                trackAuth("signin_submit", { method: "password", source });
                const { error, code, userId } = await signInWithPassword(cleanEmail, password);
                if (error) {
                    trackAuth("signin_error", { method: "password", error_code: code, source });
                    fail(error, code);
                } else {
                    trackAuth("signin_success", { method: "password", source, user_id: userId });
                }
            } else if (view === "signup") {
                trackAuth("signup_submit", { method: "password", source });
                rememberReturn();
                const { error, code, needsConfirmation, userId } = await signUpWithPassword(cleanEmail, password);
                if (error) {
                    trackAuth("signup_error", { method: "password", error_code: code, source });
                    fail(error, code);
                } else {
                    trackAuth("signup_success", { method: "password", source, user_id: userId });
                    if (needsConfirmation) setSent({ kind: "confirm", email: cleanEmail });
                }
            } else if (view === "magic") {
                trackAuth("magic_link_submit", { method: "magic_link", source });
                const { error, code } = await signInWithEmail(cleanEmail);
                if (error) {
                    trackAuth("magic_link_error", { method: "magic_link", error_code: code, source });
                    fail(error, code);
                } else {
                    trackAuth("magic_link_sent", { method: "magic_link", source });
                    rememberReturn();
                    setSent({ kind: "magic", email: cleanEmail });
                }
            } else {
                trackAuth("password_reset_request", { source });
                const { error, code } = await sendPasswordReset(cleanEmail);
                if (error) {
                    trackAuth("password_reset_error", { error_code: code, source });
                    fail(error, code);
                } else {
                    trackAuth("password_reset_sent", { source });
                    rememberReturn();
                    setSent({ kind: "reset", email: cleanEmail });
                }
            }
        } catch {
            fail("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const resend = async () => {
        const cleanEmail = email.trim().toLowerCase();
        setLoading(true);
        trackAuth("confirmation_resend", { source });
        const { error } = await resendConfirmation(cleanEmail);
        setLoading(false);
        if (error) fail(error);
        else {
            setError(null);
            setErrorCode(null);
            setNotice(`We sent a new confirmation link to ${cleanEmail}.`);
        }
    };

    const sentCopy = sent && {
        magic: { title: "Check your email", body: <>We sent a magic link to <strong>{sent.email}</strong>. Tap it to finish signing in.</> },
        confirm: { title: "Confirm your email", body: <>We sent a confirmation link to <strong>{sent.email}</strong>. Tap it to activate your account, then you are in.</> },
        reset: { title: "Check your email", body: <>If an account exists for <strong>{sent.email}</strong>, we sent a link to choose a new password. It expires in 1 hour.</> },
    }[sent.kind];

    const submitLabel = { signin: "Sign in", signup: "Create account", magic: "Email me a magic link", forgot: "Send reset link" }[view];
    const loadingLabel = { signin: "Signing in...", signup: "Creating account...", magic: "Sending...", forgot: "Sending..." }[view];
    const usesPassword = view === "signin" || view === "signup";

    return (
        <Dialog open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
            <DialogContent
                // Keep clear of the iPhone Duo's right status column (safe-area inset is 0 elsewhere).
                style={{ width: "min(28rem, calc(100% - 2rem - env(safe-area-inset-right)))", marginLeft: "calc(env(safe-area-inset-right) / -2)" }}
                className="z-[100] max-w-md rounded-2xl border-slate-200 bg-white p-6 space-y-3 dark:border-slate-800 dark:bg-slate-900">
                <DialogTitle className="text-lg font-semibold">{sentCopy ? sentCopy.title : TITLES[view]}</DialogTitle>
                <DialogDescription className={sent ? "sr-only" : undefined}>
                    {view === "forgot" ? "We'll email you a secure link." : view === "magic" ? "Sign in without a password." : "Save your progress with a free account."}
                </DialogDescription>
                {reason && !sent && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-sm text-emerald-800 dark:text-emerald-300">
                        {reason}
                    </div>
                )}

                {!configured ? (
                    <div className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                        Sign-in is not available right now. Please try again later.
                    </div>
                ) : sent && sentCopy ? (
                    <div className="space-y-3 text-center py-4">
                        <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-600 dark:text-emerald-400" />
                        <p className="text-sm text-slate-600 dark:text-slate-400">{sentCopy.body}</p>
                        <p className="text-xs text-slate-500">
                            Didn't arrive? Check spam, or{" "}
                            <button
                                type="button"
                                onClick={() => {
                                    setSent(null);
                                    setError(null);
                                }}
                                className="text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                                try again
                            </button>.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={submit} className="space-y-4" noValidate>
                        {usesPassword && (
                            <div role="tablist" aria-label="Account" className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                                {(["signin", "signup"] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        role="tab"
                                        aria-selected={view === tab}
                                        onClick={() => view !== tab && switchView(tab)}
                                        className={`h-9 rounded-lg text-sm font-medium transition-colors ${view === tab
                                            ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                                            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
                                    >
                                        {tab === "signin" ? "Sign in" : "Create account"}
                                    </button>
                                ))}
                            </div>
                        )}

                        {view === "magic" && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Enter your email and we'll send you a secure sign-in link. No password needed. New here? The link creates your free account.
                            </p>
                        )}
                        {view === "forgot" && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Enter the email you use for Mastering Quran and we'll send you a link to choose a new password.
                            </p>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <Input
                                aria-label="Email address"
                                autoComplete="email"
                                inputMode="email"
                                autoCapitalize="none"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                                className="pl-10 h-11"
                                required
                            />
                        </div>

                        {usesPassword && (
                            <div className="space-y-1.5">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                    <Input
                                        aria-label="Password"
                                        autoComplete={view === "signup" ? "new-password" : "current-password"}
                                        type={showPassword ? "text" : "password"}
                                        placeholder={view === "signup" ? "Create a password" : "Password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-11 h-11"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {view === "signup" ? (
                                    <p className="text-xs text-slate-500">At least {MIN_PASSWORD_LENGTH} characters, with letters and numbers.</p>
                                ) : (
                                    <div className="text-right">
                                        <button type="button" onClick={() => switchView("forgot")} className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline">
                                            Forgot password?
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {error && (
                            <div role="alert" className="text-sm text-red-600 dark:text-red-400 space-y-1">
                                <p>{error}</p>
                                {errorCode === "email_not_confirmed" && (
                                    <button type="button" onClick={resend} disabled={loading} className="text-emerald-700 dark:text-emerald-400 hover:underline">
                                        Resend confirmation email
                                    </button>
                                )}
                                {(errorCode === "user_already_exists" || errorCode === "email_exists") && (
                                    <button type="button" onClick={() => switchView("signin")} className="text-emerald-700 dark:text-emerald-400 hover:underline">
                                        Go to sign in
                                    </button>
                                )}
                            </div>
                        )}
                        {notice && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">{notice}</p>}

                        <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11">
                            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {loadingLabel}</> : submitLabel}
                        </Button>

                        {usesPassword ? (
                            <>
                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                    <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" /> or <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                                </div>
                                <Button type="button" variant="outline" onClick={() => switchView("magic")} className="w-full h-11 gap-2">
                                    <Mail className="h-4 w-4" /> Email me a magic link instead
                                </Button>
                            </>
                        ) : (
                            <p className="text-center text-sm">
                                <button type="button" onClick={() => switchView("signin")} className="text-emerald-700 dark:text-emerald-400 hover:underline">
                                    Back to sign in with a password
                                </button>
                            </p>
                        )}

                        <p className="text-xs text-center text-slate-500">
                            By continuing you agree to the <a href="/terms" className="underline">Terms</a> and <a href="/privacy" className="underline">Privacy Policy</a>.
                        </p>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
