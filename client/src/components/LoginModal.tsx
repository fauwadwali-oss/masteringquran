import { useEffect, useState } from "react";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "react-router-dom";
import { rememberAuthReturn } from "@/lib/auth-return";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
    open: boolean;
    onClose: () => void;
    reason?: string;
}

export default function LoginModal({ open, onClose, reason }: Props) {
    const { signInWithEmail, configured, user } = useAuth();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const location = useLocation();
    useEffect(() => { if (open && user) onClose(); }, [open, user, onClose]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const { error } = await signInWithEmail(email.trim());
            if (error) setError(error);
            else {
                rememberAuthReturn(location.pathname + location.search + location.hash);
                setSent(true);
            }
        } catch {
            setError("Could not send the sign-in link. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
            <DialogContent className="z-[100] w-[calc(100%-2rem)] max-w-md rounded-2xl border-slate-200 bg-white p-6 space-y-3 dark:border-slate-800 dark:bg-slate-900">
                <DialogTitle className="text-lg font-semibold">Sign in</DialogTitle>
                <DialogDescription>Save your progress with a free account.</DialogDescription>
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
                                aria-label="Email address"
                                autoComplete="email"
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
            </DialogContent>
        </Dialog>
    );
}
