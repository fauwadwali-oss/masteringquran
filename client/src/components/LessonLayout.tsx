import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
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
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-white dark:from-slate-950 dark:to-slate-900 py-8 px-4">
            <SEO
                title={seoTitle ?? `${lesson.title}, Learn Arabic`}
                description={seoDescription ?? lesson.subtitle}
            />
            <div className="max-w-3xl mx-auto space-y-6">
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
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Lesson {lesson.number} of {LESSONS.length} · ~{lesson.estimatedMinutes} min
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                        {lesson.emoji} {lesson.title}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">{lesson.subtitle}</p>
                </div>

                {/* Lesson content */}
                <div className="space-y-5">{children}</div>

                {/* Bottom actions */}
                <Card className="border-emerald-200 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/60 to-white dark:from-emerald-950/20 dark:to-slate-900">
                    <CardContent className="p-5 flex flex-wrap gap-2 items-center justify-between">
                        <div>
                            {prevLesson ? (
                                <Link to={`/learn-arabic/${prevLesson.slug}`}>
                                    <Button variant="outline" size="sm">
                                        <ArrowLeft className="h-3.5 w-3.5" /> {prevLesson.title}
                                    </Button>
                                </Link>
                            ) : null}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Button onClick={onComplete} disabled={marking}>
                                {marking ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                {isDone ? "Mark again" : "Mark as complete"}
                            </Button>
                            {nextLesson && (
                                <Link to={`/learn-arabic/${nextLesson.slug}`}>
                                    <Button variant="outline">
                                        Next: {nextLesson.title}
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
