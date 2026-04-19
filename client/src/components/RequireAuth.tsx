import { ReactNode, useState } from "react";
import { Loader2, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/LoginModal";

interface Props {
    children: ReactNode;
    reason?: string;
}

export default function RequireAuth({ children, reason }: Props) {
    const { user, loading, configured } = useAuth();
    const [showLogin, setShowLogin] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (user) return <>{children}</>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <Card className="max-w-md w-full border border-emerald-200 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/60 to-white dark:from-emerald-950/20 dark:to-slate-900">
                <CardContent className="p-8 text-center space-y-5">
                    <div className="w-14 h-14 mx-auto bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center">
                        <Lock className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Sign in to continue
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {reason || "This feature requires a free Mastering Quran account."}
                    </p>
                    <div className="flex items-center gap-2 justify-center text-xs text-slate-500 dark:text-slate-400">
                        <Sparkles className="h-3.5 w-3.5" /> Free forever · No password · Magic-link email
                    </div>
                    <Button
                        onClick={() => setShowLogin(true)}
                        disabled={!configured}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11"
                    >
                        Sign in
                    </Button>
                    {!configured && (
                        <p className="text-xs text-amber-700 dark:text-amber-400">Auth not yet configured. Please try again later.</p>
                    )}
                </CardContent>
            </Card>
            <LoginModal open={showLogin} onClose={() => setShowLogin(false)} reason={reason} />
        </div>
    );
}
