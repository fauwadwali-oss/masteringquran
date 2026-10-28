import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Clock, ExternalLink, Moon, RotateCcw, Sun, Sunrise, Sunset, HandHeart, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import { cn } from "@/lib/utils";
import {
    ADHKAR,
    ROUTINES,
    countFor,
    firstUnfinished,
    increment,
    loadProgress,
    localDay,
    resetDhikr,
    resetRoutine,
    routineAdhkar,
    routineProgress,
    saveProgress,
    type AdhkarProgress,
    type Dhikr,
    type Routine,
    type RoutineId,
} from "@/lib/adhkar";

const ICONS: Record<RoutineId, LucideIcon> = { morning: Sunrise, evening: Sunset, sleep: Moon, waking: Sun, salah: HandHeart, day: Clock };

function useProgress() {
    const [progress, setProgress] = useState<AdhkarProgress>(() => loadProgress(new Date()));
    const update = useCallback((fn: (p: AdhkarProgress) => AdhkarProgress) => {
        setProgress(prev => {
            const next = fn(prev);
            saveProgress(next);
            return next;
        });
    }, []);
    // A page left open past midnight, or brought back the next day, starts the new day.
    useEffect(() => {
        const refresh = () => setProgress(prev => (prev.date === loadProgress(new Date()).date ? prev : loadProgress(new Date())));
        document.addEventListener("visibilitychange", refresh);
        const timer = window.setInterval(refresh, 60_000);
        return () => {
            document.removeEventListener("visibilitychange", refresh);
            window.clearInterval(timer);
        };
    }, []);
    return [progress, update] as const;
}

function buzz(pattern: number | number[]) {
    try { navigator.vibrate?.(pattern); } catch { /* Not every device can vibrate. */ }
}

function SourceLine({ d }: { d: Dhikr }) {
    const sameHadith = d.evidence.reference === d.reference;
    return (
        <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <p>
                <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-teal-700 hover:underline dark:text-teal-400">
                    {d.reference} <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
                {d.grades.length > 0 && <span> · Grades: {d.grades.join(" · ")}</span>}
            </p>
            <p>
                <span className="font-medium text-slate-600 dark:text-slate-300">{d.count > 1 ? `Why ${d.count} times, and when: ` : "When to say it: "}</span>
                "{d.evidence.quote.join(" … ")}"{" "}
                {sameHadith ? (
                    <span>({d.reference})</span>
                ) : (
                    <a href={d.evidence.url} target="_blank" rel="noopener noreferrer" className="font-medium text-teal-700 hover:underline dark:text-teal-400">
                        ({d.evidence.reference}{d.evidence.grades.length > 0 ? `, ${d.evidence.grades[0]}` : ""})
                    </a>
                )}
            </p>
            {d.note && (
                <p>
                    <span className="font-medium text-slate-600 dark:text-slate-300">Note: </span>
                    {d.note}
                </p>
            )}
            <p>
                {d.translation ? "English" : "Transliteration"} quoted from the {d.englishEdition}.
                {d.narrationOmitted && " The … marks a narrator's comment left out."}
            </p>
        </div>
    );
}

function DhikrText({ d, large }: { d: Dhikr; large?: boolean }) {
    return (
        <>
            <p
                className={cn("font-amiri whitespace-pre-line text-right leading-loose text-slate-900 dark:text-slate-100", large ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl")}
                dir="rtl"
                lang="ar"
            >
                {d.arabic}
            </p>
            {d.transliteration && <p className="text-sm italic text-slate-500 dark:text-slate-400">{d.transliteration}</p>}
            {d.translation && <p className="whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-300">{d.translation}</p>}
        </>
    );
}

function CountBadge({ done, target }: { done: number; target: number }) {
    const finished = done >= target;
    return (
        <span
            className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium tabular-nums",
                finished
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/40 dark:bg-teal-950/40 dark:text-teal-400",
            )}
        >
            {finished && <Check className="h-3 w-3" aria-hidden />}
            {done} / {target}
        </span>
    );
}

function ProgressBar({ value, label }: { value: number; label: string }) {
    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)}>
            <div className="h-full rounded-full bg-teal-500 transition-[width] duration-300" style={{ width: `${value * 100}%` }} />
        </div>
    );
}

/** A ring that fills as the count approaches its target; the whole circle is the tap target. */
function TapCounter({ done, target, onTap, pulse }: { done: number; target: number; onTap: () => void; pulse: number }) {
    const r = 54;
    const circumference = 2 * Math.PI * r;
    const finished = done >= target;
    return (
        <button
            type="button"
            onClick={onTap}
            aria-label={finished ? `Done, ${done} of ${target}` : `Count, ${done} of ${target}`}
            className={cn(
                "relative mx-auto flex h-36 w-36 touch-manipulation sm:h-44 sm:w-44 select-none items-center justify-center rounded-full bg-white shadow-xl shadow-teal-900/10 outline-none ring-teal-400 transition-transform duration-100 focus-visible:ring-4 active:scale-95 dark:bg-slate-900",
                finished && "bg-emerald-50 dark:bg-emerald-950/40",
            )}
        >
            <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
                <circle cx="60" cy="60" r={r} fill="none" strokeWidth="8" className="stroke-slate-100 dark:stroke-slate-800" />
                <circle
                    cx="60"
                    cy="60"
                    r={r}
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - Math.min(done / target, 1))}
                    className={cn("transition-[stroke-dashoffset] duration-200", finished ? "stroke-emerald-500" : "stroke-teal-500")}
                />
            </svg>
            {/* Keyed on every tap so the number briefly grows: feedback where vibration is not available. */}
            <span key={pulse} className="relative flex flex-col items-center animate-in zoom-in-110 duration-150">
                {finished ? <Check className="h-12 w-12 text-emerald-600 dark:text-emerald-400" aria-hidden /> : <span className="text-4xl font-bold tabular-nums sm:text-5xl text-slate-900 dark:text-white">{done}</span>}
                <span className="mt-1 text-sm text-slate-500 dark:text-slate-400">{finished ? "Done" : `of ${target}`}</span>
            </span>
        </button>
    );
}

function FocusMode({ routine, progress, update, start, onExit }: { routine: Routine; progress: AdhkarProgress; update: (fn: (p: AdhkarProgress) => AdhkarProgress) => void; start: number; onExit: () => void }) {
    const items = useMemo(() => routineAdhkar(routine.id), [routine.id]);
    const [index, setIndex] = useState(Math.min(start, items.length - 1));
    const [pulse, setPulse] = useState(0);
    const advanceTimer = useRef<number | undefined>(undefined);
    const d = items[index];
    const done = countFor(progress, routine.id, d);
    const status = routineProgress(progress, routine.id);

    useEffect(() => () => window.clearTimeout(advanceTimer.current), []);
    useEffect(() => {
        window.clearTimeout(advanceTimer.current);
        window.scrollTo({ top: 0 });
    }, [index]);

    const go = useCallback((to: number) => setIndex(Math.max(0, Math.min(items.length - 1, to))), [items.length]);

    const tap = () => {
        // After midnight the saved counts belong to yesterday, so a finished dhikr can be counted again.
        const current = progress.date === localDay(new Date()) ? done : 0;
        if (current >= d.count) return;
        const next = current + 1;
        update(p => increment(p, routine.id, d, new Date()));
        setPulse(n => n + 1);
        if (next < d.count) {
            buzz(10);
            return;
        }
        buzz([30, 60, 30]);
        // Move on to the next unfinished dhikr after a moment, so the finished ring is seen.
        const after = items.findIndex((x, i) => i > index && countFor(progress, routine.id, x) < x.count);
        if (after >= 0) advanceTimer.current = window.setTimeout(() => setIndex(after), 700);
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLElement && e.target.closest("a, input, textarea, select, [contenteditable]")) return;
            if (e.key === "ArrowRight") go(index + 1);
            if (e.key === "ArrowLeft") go(index - 1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [go, index]);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
                <Button variant="ghost" className="-ml-3 gap-2 text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-950/30" onClick={onExit}>
                    <ArrowLeft className="h-4 w-4" /> {routine.name}
                </Button>
                <span className="text-sm tabular-nums text-slate-500 dark:text-slate-400">
                    {index + 1} of {items.length}
                </span>
            </div>
            <div className="space-y-1">
                <ProgressBar value={status.done / status.total} label={`${routine.name} progress today`} />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {status.complete ? "All done for today." : `${status.done} of ${status.total} done today`}
                </p>
            </div>

            <Card className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <CardContent className="space-y-4 p-5 md:p-6">
                    <div className="flex items-start justify-between gap-3">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{d.title}</h2>
                        <CountBadge done={done} target={d.count} />
                    </div>
                    <DhikrText d={d} large />
                    <SourceLine d={d} />
                </CardContent>
            </Card>

            {/* Stays in reach at the bottom of the screen while a long passage is read. */}
            <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-10 space-y-3 rounded-[2rem] border border-slate-200/80 bg-white/90 p-3 shadow-lg sm:p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
                <TapCounter done={done} target={d.count} onTap={tap} pulse={pulse} />
                {/* Three equal columns; on the narrowest screens only the icons show, so the row always fits. */}
                <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" className="min-h-11 min-w-0 gap-1 px-2" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous dhikr">
                        <ChevronLeft className="h-4 w-4" /> <span className="truncate max-[359px]:sr-only">Back</span>
                    </Button>
                    <Button
                        variant="ghost"
                        className="min-h-11 min-w-0 gap-1 px-2 text-slate-500"
                        onClick={() => {
                            window.clearTimeout(advanceTimer.current);
                            update(p => resetDhikr(p, routine.id, d));
                        }}
                        disabled={done === 0}
                        aria-label="Reset this dhikr"
                    >
                        <RotateCcw className="h-4 w-4" /> <span className="truncate max-[359px]:sr-only">Reset</span>
                    </Button>
                    {index < items.length - 1 ? (
                        <Button variant="outline" className="min-h-11 min-w-0 gap-1 px-2" onClick={() => go(index + 1)} aria-label="Next dhikr">
                            <span className="truncate max-[359px]:sr-only">Next</span> <ChevronRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button className="min-h-11 min-w-0 gap-1 bg-teal-600 px-2 text-white hover:bg-teal-700" onClick={onExit}>
                            <Check className="h-4 w-4" /> <span className="truncate max-[359px]:sr-only">Finish</span>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function RoutineList({ routine, progress, update, onStart, onBack }: { routine: Routine; progress: AdhkarProgress; update: (fn: (p: AdhkarProgress) => AdhkarProgress) => void; onStart: (index: number) => void; onBack: () => void }) {
    const items = routineAdhkar(routine.id);
    const status = routineProgress(progress, routine.id);
    const Icon = ICONS[routine.id];
    return (
        <>
            <Button variant="ghost" className="mb-6 gap-2 text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-950/30" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" /> All routines
            </Button>
            <div className="mb-6">
                <PageHero eyebrow="Adhkar routine" title={routine.name} description={`${routine.description} ${items.length} adhkar, each with its source and how many times to say it.`} icon={Icon} accent="teal" />
            </div>
            <div className="mb-6 space-y-3">
                <ProgressBar value={status.done / status.total} label={`${routine.name} progress today`} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-600 dark:text-slate-300">{status.complete ? "All done for today." : `${status.done} of ${status.total} done today`}</p>
                    <div className="flex gap-2">
                        <Button variant="ghost" className="min-h-11 gap-1 text-slate-500" onClick={() => update(p => resetRoutine(p, routine.id))} disabled={status.done === 0 && !progress.counts[routine.id]}>
                            <RotateCcw className="h-4 w-4" /> Reset today
                        </Button>
                        <Button className="min-h-11 bg-teal-600 text-white hover:bg-teal-700" onClick={() => onStart(firstUnfinished(progress, routine.id))}>
                            {status.done === 0 ? "Start counting" : status.complete ? "Go through again" : "Continue"}
                        </Button>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                {items.map((d, i) => (
                    <Card key={d.id} id={d.id} className="scroll-mt-24 border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <CardContent className="space-y-4 p-5 md:p-6">
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{d.title}</h3>
                                <CountBadge done={countFor(progress, routine.id, d)} target={d.count} />
                            </div>
                            <DhikrText d={d} />
                            <SourceLine d={d} />
                            <Button variant="outline" className="min-h-11" onClick={() => onStart(i)}>
                                Count from here
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}

export default function Adhkar() {
    const [params, setParams] = useSearchParams();
    const [progress, update] = useProgress();
    const routine = ROUTINES.find(r => r.id === params.get("routine")) ?? null;
    const focusAt = params.has("focus") ? Math.max(0, Math.floor(Number(params.get("focus")) || 0)) : null;
    const open = (r: Routine | null, focus?: number) => {
        setParams(r ? (focus === undefined ? { routine: r.id } : { routine: r.id, focus: String(focus) }) : {});
        window.scrollTo({ top: 0 });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50/30 via-white to-white font-sans dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
            <SEO
                title={routine ? `${routine.name} adhkar - Mastering Quran` : "Adhkar routines: morning, evening, sleep and after salah - Mastering Quran"}
                description="Daily adhkar with a tap counter: morning, evening, before sleep, on waking and after salah. Every dhikr is quoted from the Quran or the hadith collections, with its reference and the words of the hadith that give its count."
            />
            <section className="px-4 py-12 md:px-6">
                <div className="mx-auto max-w-3xl">
                    {routine && focusAt !== null ? (
                        <FocusMode key={`${routine.id}-${focusAt}`} routine={routine} progress={progress} update={update} start={focusAt} onExit={() => open(routine)} />
                    ) : routine ? (
                        <RoutineList routine={routine} progress={progress} update={update} onStart={i => open(routine, i)} onBack={() => open(null)} />
                    ) : (
                        <>
                            <div className="mb-8">
                                <PageHero
                                    eyebrow="Daily remembrance"
                                    title="Adhkar Routines"
                                    description={`${ADHKAR.length} adhkar in six daily routines, with a counter for each one. Your progress is saved on this device and starts fresh each day.`}
                                    icon={HandHeart}
                                    accent="teal"
                                />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {ROUTINES.map(r => {
                                    const s = routineProgress(progress, r.id);
                                    const Icon = ICONS[r.id];
                                    return (
                                        <Card
                                            key={r.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => open(r)}
                                            onKeyDown={e => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open(r))}
                                            className="group cursor-pointer border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:hover:border-teal-500"
                                        >
                                            <CardContent className="space-y-3 p-5">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/40">
                                                        <Icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                                    </div>
                                                    <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">{s.complete ? "Done today" : `${s.done} of ${s.total} today`}</span>
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{r.name}</h2>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">{r.description}</p>
                                                </div>
                                                <ProgressBar value={s.done / s.total} label={`${r.name} progress today`} />
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    <p className="mx-auto mt-12 max-w-2xl text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        The routines follow Hisn al-Muslim. Every Arabic, English and transliteration text is quoted exactly from its source: the Quran (Uthmani text, Saheeh International) and the hadith editions of fawazahmed0/hadith-api (public domain). Each count and time is quoted from the hadith that gives it. A dhikr from the Sunan is left out when any grader in those editions grades its hadith weak; notes mark where a reading or a chain needs explaining.
                    </p>
                </div>
            </section>
        </div>
    );
}
