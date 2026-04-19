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
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-white dark:from-slate-950 dark:to-slate-900 py-10 px-4">
            <SEO
                title="Learn Arabic from Zero, Mastering Quran"
                description="Learn to read Arabic and recite the Quran from zero. Noorani Qaida curriculum, 28 letters, harakat, tajweed, and your first surah."
            />
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider font-semibold">Milestone 1, Foundations</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Learn Arabic from Zero</h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        The path from never having seen an Arabic letter to reading your first full surah of the Quran, taught the way Muslims have learned for centuries.
                    </p>
                </div>

                {/* Progress / Sign-in prompt */}
                {user ? (
                    <Card className="border border-emerald-200 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900">
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
                    <Card className="border border-amber-200 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-slate-900">
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
                <div className="space-y-3">
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
                                    className={`border transition-all ${
                                        done
                                            ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20"
                                            : prevDone
                                            ? "border-slate-200 dark:border-slate-800 hover:border-emerald-300 hover:shadow-md"
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

                {/* What's next */}
                <Card className="border-slate-100 dark:border-slate-800">
                    <CardContent className="p-5 text-sm text-slate-600 dark:text-slate-400 space-y-2">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                            <BookOpen className="h-4 w-4" /> Coming next, beyond the current 8 lessons
                        </div>
                        <p className="text-xs leading-relaxed">
                            <strong>Milestone 4:</strong> Numbers, days, greetings, common phrases.<br/>
                            <strong>Milestone 5:</strong> The root system, one root, all the words derived from it across the Quran.<br/>
                            <strong>Milestone 6:</strong> Interactive letter tracing (writing practice).<br/>
                            <strong>Milestone 7:</strong> Reading graduation, full tap-to-read of Al-Fatiha, An-Nas, Al-Falaq, Al-Ikhlas, Al-Kawthar.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
