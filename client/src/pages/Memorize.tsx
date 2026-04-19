import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Target, BookOpen, Flame, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { listAll, listByStatus, getDueForReview, MemorizationEntry, MemorizationStatus } from "@/lib/queries/memorization";
import RequireAuth from "@/components/RequireAuth";

const STATUS_COLORS: Record<MemorizationStatus, string> = {
    new: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    learning: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    memorized: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    review_due: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
};

const STATUS_LABELS: Record<MemorizationStatus, string> = {
    new: "New",
    learning: "Learning",
    memorized: "Memorized",
    review_due: "Review due",
};

function Inner() {
    const { user } = useAuth();
    const [all, setAll] = useState<MemorizationEntry[]>([]);
    const [due, setDue] = useState<MemorizationEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        Promise.all([listAll(user.id), getDueForReview(user.id)]).then(([allRows, dueRows]) => {
            setAll(allRows);
            setDue(dueRows);
            setLoading(false);
        });
    }, [user]);

    const counts = {
        new: all.filter((x) => x.status === "new").length,
        learning: all.filter((x) => x.status === "learning").length,
        memorized: all.filter((x) => x.status === "memorized").length,
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            <SEO title="Memorization (Hifz) - Mastering Quran" description="Track your Quran memorization with spaced-repetition reviews." />
            <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center gap-3">
                        <Target className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Memorization
                        </h1>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-3 gap-3">
                                <Card className="p-4 text-center">
                                    <BookOpen className="h-5 w-5 mx-auto text-slate-500 mb-1" />
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{counts.new + counts.learning}</p>
                                    <p className="text-xs text-slate-500">In progress</p>
                                </Card>
                                <Card className="p-4 text-center">
                                    <CheckCircle2 className="h-5 w-5 mx-auto text-emerald-600 mb-1" />
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{counts.memorized}</p>
                                    <p className="text-xs text-slate-500">Memorized</p>
                                </Card>
                                <Card className="p-4 text-center">
                                    <Flame className="h-5 w-5 mx-auto text-rose-500 mb-1" />
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{due.length}</p>
                                    <p className="text-xs text-slate-500">Review due</p>
                                </Card>
                            </div>

                            {due.length > 0 && (
                                <div className="space-y-3">
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-rose-500" />
                                        Review these today
                                    </h2>
                                    <div className="space-y-2">
                                        {due.map((m) => (
                                            <Card key={m.id} className="border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/10">
                                                <CardContent className="p-4 flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold text-slate-900 dark:text-white">Quran {m.verse_key}</p>
                                                        <p className="text-xs text-slate-500">Last reviewed {m.last_reviewed_at ? new Date(m.last_reviewed_at).toLocaleDateString() : "never"}</p>
                                                    </div>
                                                    <Button asChild size="sm" variant="outline">
                                                        <Link to="/quran">Review →</Link>
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {all.length === 0 ? (
                                <Card className="p-12 text-center">
                                    <p className="text-slate-500 mb-4">Start memorizing by opening any verse and marking it.</p>
                                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        <Link to="/quran">Open the Quran</Link>
                                    </Button>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">All tracked verses</h2>
                                    <div className="space-y-2">
                                        {all.map((m) => (
                                            <Card key={m.id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                <CardContent className="p-4 flex items-center justify-between flex-wrap gap-2">
                                                    <Link to="/quran" className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
                                                        Quran {m.verse_key}
                                                    </Link>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[m.status]}`}>
                                                            {STATUS_LABELS[m.status]}
                                                        </span>
                                                        {m.last_reviewed_at && (
                                                            <span className="text-xs text-slate-400">
                                                                {new Date(m.last_reviewed_at).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}

export default function Memorize() {
    return <RequireAuth reason="Sign in to track your Quran memorization and spaced-repetition reviews."><Inner /></RequireAuth>;
}
