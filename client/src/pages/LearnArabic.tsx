import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, ChevronRight, GraduationCap, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { LESSONS } from "@/lib/content/arabic-foundations";
import { listCompletedLessons, type LessonProgress } from "@/lib/queries/learn-progress";

export default function LearnArabic() {
    const { user } = useAuth();
    const [completed, setCompleted] = useState<Record<string, LessonProgress>>({});

    useEffect(() => {
        listCompletedLessons(user?.id ?? null)
            .then((rows) => {
                const map: Record<string, LessonProgress> = {};
                for (const r of rows) map[r.lesson_id] = r;
                setCompleted(map);
            })
            .catch(() => {});
    }, [user]);

    const doneCount = LESSONS.filter((l) => completed[l.id]).length;
    const percent = Math.round((doneCount / LESSONS.length) * 100);

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_34%),linear-gradient(180deg,#ecfdf5_0%,#ffffff_42%,#f8fafc_100%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_58%,#020617_100%)]">
            <SEO
                title="Learn Arabic from Zero, Mastering Quran"
                description="Learn to read Arabic and recite the Quran from zero. Noorani Qaida curriculum, 28 letters, harakat, tajweed, and your first surah."
            />
            <div className="mx-auto max-w-5xl space-y-8">
                {/* Header */}
                <div className="overflow-hidden rounded-[2rem] border border-emerald-200/70 bg-white/80 shadow-2xl shadow-emerald-900/10 backdrop-blur dark:border-emerald-900/40 dark:bg-slate-950/70">
                    <div className="grid gap-8 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
                        <div className="space-y-4 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                                <Sparkles className="h-4 w-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Milestone 1, Foundations</span>
                            </div>
                            <h1 className="text-4xl font-bold leading-tight text-slate-950 dark:text-white md:text-6xl">
                                Learn Arabic from Zero
                            </h1>
                            <p className="mx-auto max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 md:mx-0">
                                The path from never having seen an Arabic letter to reading your first full surah of the Quran, taught the way Muslims have learned for centuries.
                            </p>
                            <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs font-semibold text-slate-600 dark:text-slate-300 md:justify-start">
                                <span className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">12 lessons</span>
                                <span className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">Noorani Qaida</span>
                                <span className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">Quran-first practice</span>
                            </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-emerald-200/70 bg-gradient-to-br from-emerald-900 via-[#0B2545] to-slate-950 p-5 text-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-emerald-200/80">Lesson preview</p>
                                    <p className="mt-1 font-semibold">Letters to recitation</p>
                                </div>
                                <GraduationCap className="h-8 w-8 text-amber-200" />
                            </div>
                            <div className="py-6 text-center">
                                <p className="font-amiri text-8xl leading-none text-amber-200" dir="rtl">ا</p>
                                <p className="mt-3 text-sm text-emerald-100">Alif · the first step</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div className="rounded-2xl bg-white/10 p-3">
                                    <p className="text-lg font-bold">28</p>
                                    <p className="text-slate-300">letters</p>
                                </div>
                                <div className="rounded-2xl bg-white/10 p-3">
                                    <p className="text-lg font-bold">175</p>
                                    <p className="text-slate-300">words</p>
                                </div>
                                <div className="rounded-2xl bg-white/10 p-3">
                                    <p className="text-lg font-bold">5</p>
                                    <p className="text-slate-300">surahs</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress / Sign-in prompt */}
                {user ? (
                    <Card className="border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white dark:border-emerald-900/40 dark:from-emerald-950/20 dark:to-slate-900">
                        <CardContent className="p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                        Your progress
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                                        {doneCount} of {LESSONS.length} lessons
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-emerald-600">{percent}%</p>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Complete</p>
                                </div>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                            {doneCount === LESSONS.length && (
                                <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-lg px-3 py-2 text-sm font-semibold">
                                    <GraduationCap className="h-4 w-4" /> Mashā'Allāh, you've completed the foundation.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border border-amber-200 bg-gradient-to-br from-amber-50/70 to-white dark:border-amber-900/40 dark:from-amber-950/20 dark:to-slate-900">
                        <CardContent className="p-5 space-y-2">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                Sign in to track your progress
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                All lessons are free to browse. Sign in to save which lessons you've completed and pick up where you left off across devices.
                            </p>
                            <div>
                                <Link
                                    to="/ask"
                                    className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                                >
                                    Sign in →
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Lesson list */}
                <div className="grid gap-3 md:grid-cols-2">
                    {LESSONS.map((lesson) => {
                        const done = !!completed[lesson.id];
                        // Sequential unlocking: lesson N is unlocked if lesson N-1 is done, or if it's lesson 1
                        const prevDone = lesson.number === 1 || !!completed[LESSONS[lesson.number - 2]?.id];
                        return (
                            <Link
                                key={lesson.id}
                                to={`/learn-arabic/${lesson.slug}`}
                                className={`block group ${!prevDone && !done ? "opacity-60" : ""}`}
                            >
                                <Card
                                    className={`border transition-all hover:-translate-y-0.5 ${
                                        done
                                            ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20"
                                            : prevDone
                                            ? "border-slate-200 hover:border-emerald-300 hover:shadow-md dark:border-slate-800"
                                            : "border-slate-200 dark:border-slate-800"
                                    }`}
                                >
                                    <CardContent className="p-5 flex items-center gap-4">
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                                            done
                                                ? "bg-emerald-500 text-white"
                                                : "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                                        }`}>
                                            {done ? <CheckCircle2 className="h-6 w-6" /> : lesson.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Lesson {lesson.number}
                                                </span>
                                                <span className="text-[10px] text-slate-400">·</span>
                                                <span className="text-[10px] text-slate-400">~{lesson.estimatedMinutes} min</span>
                                            </div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white mt-0.5">{lesson.title}</h3>
                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{lesson.subtitle}</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 flex-shrink-0" />
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {/* Journey map */}
                <Card className="border border-emerald-100 dark:border-emerald-900/40">
                    <CardContent className="p-5 text-sm text-slate-600 dark:text-slate-400 space-y-2">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                            <BookOpen className="h-4 w-4" /> The full curriculum at a glance
                        </div>
                        <p className="text-xs leading-relaxed">
                            Twelve lessons across seven milestones, from zero Arabic to reading five full surahs of the Quran.
                            Lessons 1-6 are Noorani Qaida foundations (letters, shapes, harakat, tanween & madd, tajweed, first surah).
                            Lesson 7 is the 175 most common Quranic words across 11 themes.
                            Lesson 8 is grammar, pronouns, verb tenses, noun cases.
                            Lesson 9 is everyday Arabic, numbers, days, greetings, du'as.
                            Lesson 10 is the root system with 30 foundational Quranic roots and 200+ derivations.
                            Lesson 11 is writing practice with an interactive tracing canvas.
                            Lesson 12 is your graduation, all five short surahs fully tap-to-read, culminating in a certificate when every lesson is complete.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
