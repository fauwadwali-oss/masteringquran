import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { LESSONS, type Lesson } from "@/lib/content/arabic-foundations";
import {
    listCompletedLessons,
    markLessonComplete,
    NotSignedInError,
    type LessonProgress,
} from "@/lib/queries/learn-progress";
import { toast } from "sonner";

interface Props {
    lessonId: string;
    children: React.ReactNode;
    seoTitle?: string;
    seoDescription?: string;
}

export default function LessonLayout({ lessonId, children, seoTitle, seoDescription }: Props) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [completed, setCompleted] = useState<Record<string, LessonProgress>>({});
    const [marking, setMarking] = useState(false);

    const lesson = LESSONS.find((l) => l.id === lessonId) as Lesson;
    const lessonIndex = LESSONS.findIndex((l) => l.id === lessonId);
    const nextLesson = lessonIndex >= 0 && lessonIndex < LESSONS.length - 1 ? LESSONS[lessonIndex + 1] : null;
    const prevLesson = lessonIndex > 0 ? LESSONS[lessonIndex - 1] : null;
    const isDone = !!completed[lessonId];
    const percent = Math.round(((lessonIndex + 1) / LESSONS.length) * 100);

    useEffect(() => {
        listCompletedLessons(user?.id ?? null)
            .then((rows) => {
                const m: Record<string, LessonProgress> = {};
                for (const r of rows) m[r.lesson_id] = r;
                setCompleted(m);
            })
            .catch(() => {});
    }, [user]);

    const onComplete = async () => {
        if (!user) {
            toast.error("Sign in to save your progress across devices.", {
                action: { label: "Sign in", onClick: () => navigate("/ask") },
            });
            return;
        }
        setMarking(true);
        try {
            await markLessonComplete(user.id, lessonId);
            setCompleted((prev) => ({
                ...prev,
                [lessonId]: { lesson_id: lessonId, completed_at: new Date().toISOString(), score: null },
            }));
            toast.success(nextLesson ? "Lesson complete. On to the next one." : "Foundation complete. Mashā'Allāh!");
            if (nextLesson) {
                setTimeout(() => navigate(`/learn-arabic/${nextLesson.slug}`), 600);
            } else {
                setTimeout(() => navigate(`/learn-arabic`), 600);
            }
        } catch (e: any) {
            if (e instanceof NotSignedInError) {
                toast.error("Sign in to save your progress.");
            } else {
                toast.error(e?.message ?? "Couldn't save progress");
            }
        } finally {
            setMarking(false);
        }
    };

    if (!lesson) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-500">Lesson not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_34%),linear-gradient(180deg,#ecfdf5_0%,#ffffff_42%,#f8fafc_100%)] px-4 py-8 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_58%,#020617_100%)]">
            <SEO
                title={seoTitle ?? `${lesson.title}, Learn Arabic`}
                description={seoDescription ?? lesson.subtitle}
            />
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <Link
                        to="/learn-arabic"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600"
                    >
                        <ArrowLeft className="h-4 w-4" /> All lessons
                    </Link>
                    {isDone && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                            <CheckCircle2 className="h-4 w-4" /> Completed
                        </span>
                    )}
                </div>

                {/* Header */}
                <div className="overflow-hidden rounded-[2rem] border border-emerald-200/70 bg-white/85 p-5 shadow-xl shadow-emerald-900/5 backdrop-blur dark:border-emerald-900/40 dark:bg-slate-950/70 md:p-7">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                            Lesson {lesson.number} of {LESSONS.length} · ~{lesson.estimatedMinutes} min
                        </div>
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{percent}% through foundations</div>
                    </div>
                    <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-2xl dark:bg-emerald-950/50">
                            {lesson.emoji}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-3xl font-bold leading-tight text-slate-950 dark:text-white md:text-5xl">
                                {lesson.title}
                            </h1>
                            <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">{lesson.subtitle}</p>
                        </div>
                    </div>
                </div>

                {/* Lesson content */}
                <div className="space-y-5">{children}</div>

                {/* Bottom actions */}
                <Card className="sticky bottom-4 z-20 border-emerald-200 bg-white/90 shadow-2xl shadow-emerald-900/10 backdrop-blur dark:border-emerald-900/40 dark:bg-slate-950/90">
                    <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4 md:p-5">
                        <div>
                            {prevLesson ? (
                                <Link to={`/learn-arabic/${prevLesson.slug}`}>
                                    <Button variant="outline" size="sm" className="rounded-full">
                                        <ArrowLeft className="h-3.5 w-3.5" /> {prevLesson.title}
                                    </Button>
                                </Link>
                            ) : null}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Button onClick={onComplete} disabled={marking} className="rounded-full">
                                {marking ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                {isDone ? "Mark again" : "Mark as complete"}
                            </Button>
                            {nextLesson && (
                                <Link to={`/learn-arabic/${nextLesson.slug}`}>
                                    <Button variant="outline" className="rounded-full">
                                        Next: {nextLesson.title}
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
