import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoginModal from "@/components/LoginModal";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";

export default function Account() {
    const { user, loading, deleteAccount } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [confirm, setConfirm] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    const onDelete = async () => {
        setBusy(true);
        setError(null);
        const result = await deleteAccount();
        setBusy(false);
        if (result.error) setError(result.error);
        else setDone(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-6 font-sans">
            <SEO
                title="Your Account and Data Deletion | Mastering Quran"
                description="Delete your Mastering Quran account and the data saved with it, on the website or in the app."
                canonicalPath="/account"
            />
            <div className="max-w-2xl mx-auto space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Your account
                </h1>

                {done ? (
                    <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                        <p className="font-semibold text-slate-900 dark:text-white">Your account has been deleted.</p>
                        <p className="mt-1 text-sm">You can keep reading without an account. <Link to="/" className="underline">Go to the home page</Link></p>
                    </div>
                ) : (
                    <>
                        {user && <p>Signed in as <strong>{user.email}</strong></p>}
                        <section className="rounded-2xl border border-red-200 bg-white p-6 space-y-4 dark:border-red-900/50 dark:bg-slate-900">
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                                <AlertTriangle className="h-5 w-5 text-red-600" /> Delete account
                            </h2>
                            <p className="text-sm">
                                This permanently deletes your sign-in and everything saved with it: bookmarks, notes, memorization, reading streak, playlists, lesson progress, zakat records, reminders and question counts. It cannot be undone.
                            </p>
                            <p className="text-sm">
                                The same sign-in works on nusratwaliventures.com, so a profile there is deleted too. Sign-in diagnostics are kept without any link to you.
                            </p>
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : user ? (
                                <>
                                    <label className="block text-sm font-medium" htmlFor="confirm-delete">Type DELETE to confirm</label>
                                    <Input id="confirm-delete" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" className="max-w-xs" />
                                    {error && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p>}
                                    <Button variant="destructive" disabled={busy || confirm.trim().toUpperCase() !== "DELETE"} onClick={onDelete}>
                                        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Delete my account
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={() => setShowLogin(true)}>Sign in to delete your account</Button>
                            )}
                            <p className="text-xs text-slate-500">
                                Can't sign in? Email <a className="underline" href="mailto:fauwad@nusratwaliventures.com">fauwad@nusratwaliventures.com</a> from the address on the account.
                            </p>
                        </section>
                    </>
                )}
            </div>
            <LoginModal open={showLogin} onClose={() => setShowLogin(false)} reason="Sign in to manage your account." />
        </div>
    );
}
