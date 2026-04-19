import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallback() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            navigate(user ? "/" : "/?auth_error=1", { replace: true });
        }
    }, [loading, user, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="flex flex-col items-center gap-3 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="text-sm">Signing you in…</p>
            </div>
        </div>
    );
}
