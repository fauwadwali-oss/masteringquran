import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Calendar, CheckCircle2, ArrowLeft, Play, RotateCcw, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SEO from "@/components/SEO";
import { READING_PLANS, ReadingPlan, PlanSegment, getPlanById } from "@/lib/plans";
import { useAuth } from "@/contexts/AuthContext";
import { getLocalProgress, startPlan, markDayComplete, resetPlan, PlanProgress } from "@/lib/queries/plans";

function PlanDetail({ plan, onBack }: { plan: ReadingPlan; onBack: () => void }) {
    const { user } = useAuth();
    const [progress, setProgress] = useState<PlanProgress | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!user) return;
        setProgress(getLocalProgress(user.id, plan.id));
    }, [user, plan.id]);

    const start = async () => {
        if (!user) return;
        setBusy(true);
        const p = await startPlan(user.id, plan.id);
        setProgress(p);
        setBusy(false);
    };

    const reset = () => {
        if (!user) return;
        if (!confirm("Reset progress? This cannot be undone.")) return;
        resetPlan(user.id, plan.id);
        setProgress(null);
    };

    const complete = (day: number) => {
        if (!user) return;
        const p = markDayComplete(user.id, plan.id, day);
        setProgress({ ...p });
    };

    const completedCount = progress?.completed_days.length ?? 0;
    const percent = Math.round((completedCount / plan.days.length) * 100);
    const nextDay = progress ? (progress.completed_days.length > 0 ? Math.max(...progress.completed_days) + 1 : 1) : 1;

    return (
        <div className="space-y-6">
            <Button variant="ghost" className="gap-2" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" /> All plans
            </Button>

            <div className="text-center space-y-3">
                <div className="text-5xl">{plan.emoji}</div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {plan.name}
                </h1>
                <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto">{plan.blurb}</p>
                <div className="flex items-center justify-center gap-3 text-xs text-slate-500">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">{plan.days.length} days</span>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">{plan.duration_days} day span</span>
                </div>
            </div>

            {!user ? (
                <Card className="p-8 text-center">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">Sign in to start and track your progress across devices.</p>
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Link to="/ask">Sign in</Link>
                    </Button>
                </Card>
            ) : !progress ? (
                <Card className="p-8 text-center space-y-3">
                    <p className="text-slate-600 dark:text-slate-400">You haven't started this plan yet.</p>
                    <Button onClick={start} disabled={busy} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Play className="mr-2 h-4 w-4" /> Start plan
                    </Button>
                </Card>
            ) : (
                <>
                    <Card className="border border-emerald-200 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/60 to-white dark:from-emerald-950/20 dark:to-slate-900">
                        <CardContent className="p-5 space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {completedCount} of {plan.days.length} days done
                                </p>
                                <Button variant="ghost" size="sm" onClick={reset} className="text-xs text-slate-500 gap-1">
                                    <RotateCcw className="h-3 w-3" /> Reset
                                </Button>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all" style={{ width: `${percent}%` }} />
                            </div>
                            <p className="text-xs text-slate-500">{percent}% complete · Started {new Date(progress.started_at).toLocaleDateString()}</p>
                        </CardContent>
                    </Card>

                    <div className="space-y-2">
                        {plan.days.map((seg, i) => {
                            const dayNum = i + 1;
                            const done = progress.completed_days.includes(dayNum);
                            const isNext = dayNum === nextDay && !done;
                            return (
                                <Card
                                    key={i}
                                    className={
                                        done
                                            ? "border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/10"
                                            : isNext
                                                ? "border-2 border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-900"
                                                : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                                    }
                                >
                                    <CardContent className="p-4 flex items-center justify-between gap-3">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold flex-shrink-0 ${done ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                                                {done ? <CheckCircle2 className="h-4 w-4" /> : dayNum}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{seg.label}</p>
                                                <PlanLink seg={seg} />
                                            </div>
                                        </div>
                                        {!done && (
                                            <Button size="sm" variant="outline" onClick={() => complete(dayNum)} className="flex-shrink-0">
                                                Mark done
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

function PlanLink({ seg }: { seg: PlanSegment }) {
    // Link to /quran; we don't deep-link into specific verse yet but the reader remembers lastViewedSurah
    let preview = "";
    if (seg.kind === "juz") preview = `Juz ${seg.juz}`;
    else if (seg.kind === "surah") preview = `Surah ${seg.surah}`;
    else if (seg.kind === "range") preview = `${seg.from} → ${seg.to}`;
    return (
        <Link to="/quran" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
            {preview} ↗
        </Link>
    );
}

export default function Plans() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selected = selectedId ? getPlanById(selectedId) : null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            <SEO
                title={selected ? `${selected.name} - Reading Plan` : "Reading Plans - Mastering Quran"}
                description="Curated Quran reading plans: 30-day, Ramadan, weekly, and themed plans to sustain your daily connection."
            />
            <section className="py-12 px-6">
                <div className="max-w-3xl mx-auto">
                    {selected ? (
                        <PlanDetail plan={selected} onBack={() => setSelectedId(null)} />
                    ) : (
                        <>
                            <div className="text-center mb-8 space-y-2">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-full border border-emerald-200 dark:border-emerald-800">
                                    <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Stay connected</span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Reading Plans
                                </h1>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Pick a rhythm that fits your life. Mark each day complete to track progress.
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                {READING_PLANS.map((plan) => (
                                    <Card
                                        key={plan.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setSelectedId(plan.id)}
                                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedId(plan.id)}
                                        className="cursor-pointer border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                        <CardHeader>
                                            <div className="text-3xl mb-2">{plan.emoji}</div>
                                            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">{plan.name}</CardTitle>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Calendar className="h-3 w-3" />
                                                <span>{plan.days.length} days</span>
                                                <span>·</span>
                                                <BookOpen className="h-3 w-3" />
                                                <span>{plan.duration_days} day span</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-sm">{plan.blurb}</CardDescription>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
