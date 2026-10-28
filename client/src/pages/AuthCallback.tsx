import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { consumeAuthReturn } from "@/lib/auth-return";
import { initialAuthUrlError, RESET_PASSWORD_PATH, useAuth } from "@/contexts/AuthContext";
import { trackAuth } from "@/lib/auth-analytics";

export default function AuthCallback() {
    const { user, loading, recoveryPending } = useAuth();
    const navigate = useNavigate();
    const navigated = useRef(false);

    useEffect(() => {
        if (loading || navigated.current) return;
        navigated.current = true;
        if (user && recoveryPending) {
            trackAuth("password_reset_link_open", { source: "web_callback", user_id: user.id });
            navigate(RESET_PASSWORD_PATH, { replace: true });
        } else if (user) {
            trackAuth("auth_callback_success", { source: "web_callback", user_id: user.id });
            navigate(consumeAuthReturn(), { replace: true });
        } else {
            const code = initialAuthUrlError();
            trackAuth("auth_callback_error", { source: "web_callback", error_code: code ?? "no_session" });
            toast.error(code === "otp_expired"
                ? "This email link has expired or was already used. Please request a new one."
                : "We could not sign you in with that link. Please try again.");
            navigate(code === "otp_expired" ? "/?auth_error=expired" : "/?auth_error=1", { replace: true });
        }
    }, [loading, user, recoveryPending, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="flex flex-col items-center gap-3 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="text-sm">Signing you in…</p>
            </div>
        </div>
    );
}
