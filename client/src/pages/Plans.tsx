import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { BookOpen, Calendar, CheckCircle2, ArrowLeft, Play, RotateCcw, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SEO from "@/components/SEO";
import { READING_PLANS, ReadingPlan, PlanSegment, getPlanById } from "@/lib/plans";
import { useAuth } from "@/contexts/AuthContext";
import { getLocalProgress, startPlan, markDayComplete, resetPlan, syncPlan, PlanProgress } from "@/lib/queries/plans";
import { mergeProgress } from "@/lib/plan-progress";
import RequireAuth from "@/components/RequireAuth";

function PlanDetail({ plan, onBack }: { plan: ReadingPlan; onBack: () => void }) {
    const { user } = useAuth();
    const userId = user?.id;
    const [saved, setSaved] = useState<PlanProgress | null>(null);
    const [sync, setSync] = useState<"loading" | "saved" | "offline">("loading");
    const latest = useRef<PlanProgress | null>(null);
    const queue = useRef<Promise<void>>(Promise.resolve());
    const mounted = useRef(true);
    // After a reset the record stays (so other devices learn of it) but the plan is not running.
    const progress = saved?.started_at ? { ...saved, started_at: saved.started_at } : null;

    const show = useCallback((p: PlanProgress | null) => {
        latest.current = p;
        setSaved(p);
    }, []);

    // One at a time, so a slower earlier save cannot undo a later one.
    const runSync = useCallback(() => {
        if (!userId) return;
        queue.current = queue.current.then(async () => {
            try {
                const merged = await syncPlan(userId, plan.id, () => latest.current);
                if (!mounted.current) return;
                // A day marked while this was saving is still in what is shown; its own sync follows.
                show(mergeProgress(latest.current, merged));
                setSync("saved");
            } catch {
                if (mounted.current) setSync("offline");
            }
        });
    }, [userId, plan.id, show]);

    useEffect(() => {
        mounted.current = true;
        if (!userId) return;
        show(getLocalProgress(userId, plan.id));
        runSync();
        const onReturn = () => {
            if (!document.hidden) runSync();
        };
        window.addEventListener("online", onReturn);
        document.addEventListener("visibilitychange", onReturn);
        return () => {
            mounted.current = false;
            window.removeEventListener("online", onReturn);
            document.removeEventListener("visibilitychange", onReturn);
        };
    }, [userId, plan.id, show, runSync]);

    const start = () => {
        if (!userId) return;
        show(startPlan(userId, plan.id, latest.current));
        runSync();
    };

    const reset = () => {
        if (!userId || !latest.current) return;
        if (!confirm("Reset progress on all your devices? This cannot be undone.")) return;
        show(resetPlan(userId, latest.current));
        runSync();
    };

    const complete = (day: number) => {
        if (!userId || !latest.current) return;
        show(markDayComplete(userId, latest.current, day));
        runSync();
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

            {!progress && sync === "loading" ? (
                <Card className="p-8 text-center text-slate-600 dark:text-slate-400" role="status">Checking your progress…</Card>
            ) : !progress ? (
                <Card className="p-8 text-center space-y-3">
                    <p className="text-slate-600 dark:text-slate-400">You haven't started this plan yet.</p>
                    <Button onClick={start} className="bg-emerald-600 hover:bg-emerald-700 text-white">
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
                            {sync === "offline" && (
                                <p role="status" className="text-xs text-amber-700 dark:text-amber-300">
                                    Saved on this device. It will copy to your account when you are back online.
                                </p>
                            )}
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
    let preview = "";
    const to = seg.kind === "surah" ? `/quran/${seg.surah}` : seg.kind === "range" ? `/quran/${seg.from.replace(":", "/")}` : "/quran";
    if (seg.kind === "juz") preview = `Juz ${seg.juz}`;
    else if (seg.kind === "surah") preview = `Surah ${seg.surah}`;
    else if (seg.kind === "range") preview = `${seg.from} → ${seg.to}`;
    return (
        <Link to={to} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
            {preview} ↗
        </Link>
    );
}

function PlansInner() {
    // ?plan=<id> opens a plan directly (e.g. the Ramadan page links to ?plan=ramadan).
    const [params, setParams] = useSearchParams();
    const selectedId = params.get("plan");
    const setSelectedId = (id: string | null) => setParams(id ? { plan: id } : {});
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
                        <PlanDetail key={selected.id} plan={selected} onBack={() => setSelectedId(null)} />
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

export default function Plans() {
    return (
        <RequireAuth reason="Reading plans track your day-by-day progress. Sign in so your progress follows you across devices.">
            <PlansInner />
        </RequireAuth>
    );
}
