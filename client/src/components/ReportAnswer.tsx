import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrl } from "@/lib/api";

const REASONS = [
    ["offensive", "Offensive or harmful"],
    ["incorrect", "Incorrect"],
    ["source", "Wrong quote or source"],
    ["other", "Something else"],
] as const;

/** Lets a reader report an AI answer without leaving the page. */
export default function ReportAnswer({ question, answer }: { question: string; answer: string }) {
    const { session } = useAuth();
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [busy, setBusy] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const send = async () => {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch(apiUrl("/api/report"), {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
                body: JSON.stringify({ reason, details, question, answer }),
            });
            if (res.ok) setSent(true);
            else setError(((await res.json().catch(() => null)) as { error?: string } | null)?.error ?? "Your report could not be sent. Please try again.");
        } catch {
            setError("Your report could not be sent. Please check your connection and try again.");
        } finally {
            setBusy(false);
        }
    };

    return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <button
                        type="button"
                        className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <Flag className="h-3.5 w-3.5" aria-hidden /> {sent ? "Reported" : "Report answer"}
                    </button>
                </DialogTrigger>
                <DialogContent
                    // Keep clear of the iPhone Duo's right status column (safe-area inset is 0 elsewhere).
                    style={{ width: "min(28rem, calc(100% - 2rem - env(safe-area-inset-right)))", marginLeft: "calc(env(safe-area-inset-right) / -2)" }}
                    className="z-[100] max-h-[85dvh] max-w-md overflow-y-auto rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                >
                    <DialogTitle>{sent ? "Report sent" : "Report this answer"}</DialogTitle>
                    <DialogDescription>
                        {sent
                            ? "Thank you. We will review this answer."
                            : "We receive this question and answer with your report, and keep them linked to your account so we can review it."}
                    </DialogDescription>
                    {sent ? (
                        <Button onClick={() => setOpen(false)}>Done</Button>
                    ) : (
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void send(); }}>
                            <fieldset className="space-y-1">
                                <legend className="mb-1 text-sm font-medium">What is wrong?</legend>
                                {REASONS.map(([value, label]) => (
                                    <label key={value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <input type="radio" name="reason" value={value} checked={reason === value} onChange={() => setReason(value)} className="h-4 w-4 accent-emerald-600" />
                                        {label}
                                    </label>
                                ))}
                            </fieldset>
                            <label className="block text-sm font-medium">
                                Details (optional)
                                <textarea
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    maxLength={1000}
                                    rows={3}
                                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-base font-normal dark:border-slate-700 dark:bg-slate-900"
                                />
                            </label>
                            {error && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p>}
                            <Button type="submit" disabled={!reason || busy} className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send report
                            </Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
    );
}
