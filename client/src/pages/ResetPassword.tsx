import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import { consumeAuthReturn } from "@/lib/auth-return";
import { trackAuth } from "@/lib/auth-analytics";
import { MIN_PASSWORD_LENGTH, passwordProblem } from "@/lib/auth-errors";

export default function ResetPassword() {
    const { user, loading, updatePassword } = useAuth();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [show, setShow] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const problem = passwordProblem(password);
        if (problem) {
            setError(problem);
            return;
        }
        if (password !== confirm) {
            setError("The two passwords don't match.");
            return;
        }
        setSaving(true);
        trackAuth("password_update_submit", { user_id: user?.id });
        const { error, code } = await updatePassword(password);
        setSaving(false);
        if (error) {
            trackAuth("password_update_error", { error_code: code, user_id: user?.id });
            setError(error);
        } else {
            trackAuth("password_update_success", { user_id: user?.id });
            setDone(true);
        }
    };

    let body: React.ReactNode;
    if (loading) {
        body = <Loader2 className="h-8 w-8 mx-auto animate-spin text-emerald-600" />;
    } else if (done) {
        body = (
            <div className="space-y-4 text-center">
                <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-600 dark:text-emerald-400" />
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Password updated</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">You're signed in. Next time, sign in with your email and new password.</p>
                <Button onClick={() => navigate(consumeAuthReturn(), { replace: true })} className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white">
                    Continue
                </Button>
            </div>
        );
    } else if (!user) {
        body = (
            <div className="space-y-4 text-center">
                <KeyRound className="h-10 w-10 mx-auto text-slate-400" />
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">This reset link has expired</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Reset links work once and expire after 1 hour. Request a new one and open it on this device.</p>
                <Button onClick={() => setShowLogin(true)} className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white">
                    Request a new link
                </Button>
                <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
            </div>
        );
    } else {
        body = (
            <form onSubmit={submit} className="space-y-4" noValidate>
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Choose a new password</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">For <strong>{user.email}</strong></p>
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                        aria-label="New password"
                        autoComplete="new-password"
                        type={show ? "text" : "password"}
                        placeholder="New password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                        className="pl-10 pr-11 h-11"
                    />
                    <button
                        type="button"
                        onClick={() => setShow((v) => !v)}
                        aria-label={show ? "Hide password" : "Show password"}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                        aria-label="Confirm new password"
                        autoComplete="new-password"
                        type={show ? "text" : "password"}
                        placeholder="Type it again"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="pl-10 h-11"
                    />
                </div>
                <p className="text-xs text-slate-500">At least {MIN_PASSWORD_LENGTH} characters, with letters and numbers.</p>
                {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                <Button type="submit" disabled={saving} className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white">
                    {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save new password"}
                </Button>
            </form>
        );
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {body}
            </div>
        </div>
    );
}
