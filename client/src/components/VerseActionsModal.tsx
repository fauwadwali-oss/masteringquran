import { useEffect, useState } from "react";
import { Loader2, X, NotebookText, Target, CheckCircle2, BookOpen, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getNote, upsertNote, deleteNote } from "@/lib/queries/notes";
import { getEntry, setStatus, removeEntry, MemorizationStatus } from "@/lib/queries/memorization";
import LoginModal from "@/components/LoginModal";

interface Props {
    surah: number;
    ayah: number;
    onClose: () => void;
}

const STATUS_BUTTONS: Array<{ key: MemorizationStatus | "none"; label: string; icon: any; color: string }> = [
    { key: "none", label: "Not tracking", icon: X, color: "slate" },
    { key: "new", label: "New", icon: BookOpen, color: "slate" },
    { key: "learning", label: "Learning", icon: Flame, color: "amber" },
    { key: "memorized", label: "Memorized", icon: CheckCircle2, color: "emerald" },
];

export default function VerseActionsModal({ surah, ayah, onClose }: Props) {
    const { user } = useAuth();
    const verseKey = `${surah}:${ayah}`;
    const [note, setNote] = useState("");
    const [noteId, setNoteId] = useState<string | null>(null);
    const [status, setStatusState] = useState<MemorizationStatus | "none">("none");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
    const [showLogin, setShowLogin] = useState(false);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        Promise.all([getNote(user.id, verseKey), getEntry(user.id, verseKey)]).then(([n, m]) => {
            if (n) {
                setNote(n.body);
                setNoteId(n.id);
            }
            if (m) setStatusState(m.status);
            setLoading(false);
        });
    }, [user, verseKey]);

    const save = async () => {
        if (!user) {
            setShowLogin(true);
            return;
        }
        setSaving(true);
        setSaveStatus("idle");
        try {
            if (note.trim()) {
                await upsertNote(user.id, verseKey, note.trim());
            } else if (noteId) {
                await deleteNote(user.id, verseKey);
            }
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
            setSaveStatus("error");
        } finally {
            setSaving(false);
        }
    };

    const setHifzStatus = async (s: MemorizationStatus | "none") => {
        if (!user) {
            setShowLogin(true);
            return;
        }
        if (s === "none") {
            await removeEntry(user.id, verseKey);
            setStatusState("none");
            return;
        }
        await setStatus(user.id, surah, ayah, s);
        setStatusState(s);
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
                <div
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                        <div>
                            <p className="text-xs text-slate-500">Quran {verseKey}</p>
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Notes &amp; memorization</h3>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {!user ? (
                        <div className="p-6 text-center space-y-4">
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Sign in to save notes and track memorization across devices.
                            </p>
                            <Button onClick={() => setShowLogin(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                Sign in
                            </Button>
                        </div>
                    ) : loading ? (
                        <div className="p-12 flex justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                        </div>
                    ) : (
                        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                            {/* Note */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    <NotebookText className="h-3.5 w-3.5" /> Your note
                                </label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Reflections, cross-references, things to remember…"
                                    rows={4}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg resize-none focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500 text-slate-900 dark:text-slate-100"
                                />
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-slate-400">
                                        {saveStatus === "saved" ? "✓ Saved" : saveStatus === "error" ? "Save failed" : "Private to your account"}
                                    </p>
                                    <Button onClick={save} disabled={saving} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save note"}
                                    </Button>
                                </div>
                            </div>

                            {/* Memorization */}
                            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    <Target className="h-3.5 w-3.5" /> Memorization
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {STATUS_BUTTONS.map((s) => {
                                        const Icon = s.icon;
                                        const active = status === s.key;
                                        return (
                                            <button
                                                key={s.key}
                                                onClick={() => setHifzStatus(s.key)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${active
                                                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                                                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                    }`}
                                            >
                                                <Icon className="h-3.5 w-3.5" /> {s.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-slate-400">
                                    Marking as "Memorized" schedules it for spaced-repetition review.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <LoginModal open={showLogin} onClose={() => setShowLogin(false)} reason="Sign in to save notes and track memorization." />
        </>
    );
}
