import { useState } from "react";
import { Loader2, Mail, CheckCircle2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
    open: boolean;
    onClose: () => void;
    reason?: string;
}

export default function LoginModal({ open, onClose, reason }: Props) {
    const { signInWithEmail, configured } = useAuth();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!open) return null;

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        setError(null);
        const { error } = await signInWithEmail(email.trim());
        setLoading(false);
        if (error) setError(error);
        else setSent(true);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sign in</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {reason && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-sm text-emerald-800 dark:text-emerald-300">
                        {reason}
                    </div>
                )}

                {!configured ? (
                    <div className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                        Auth is not configured yet. Please try again later.
                    </div>
                ) : sent ? (
                    <div className="space-y-3 text-center py-4">
                        <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-600 dark:text-emerald-400" />
                        <p className="font-semibold text-slate-900 dark:text-white">Check your email</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            We sent a magic link to <strong>{email}</strong>. Click it to finish signing in.
                        </p>
                        <p className="text-xs text-slate-500">
                            Didn't arrive? Check spam, or{" "}
                            <button
                                type="button"
                                onClick={() => {
                                    setSent(false);
                                    setError(null);
                                }}
                                className="text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                                try again
                            </button>.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={submit} className="space-y-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Enter your email and we'll send you a secure sign-in link. No password needed. Free forever.
                        </p>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <Input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                                className="pl-10 h-11"
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                        <Button type="submit" disabled={loading || !email.trim()} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11">
                            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</> : "Email me a magic link"}
                        </Button>
                        <p className="text-xs text-center text-slate-500">
                            By signing in you agree to the <a href="/terms" className="underline">Terms</a> and <a href="/privacy" className="underline">Privacy Policy</a>.
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
