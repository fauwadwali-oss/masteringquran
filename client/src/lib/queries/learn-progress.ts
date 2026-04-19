// Lesson completion tracking for Learn Arabic.
// Sign-in required: anonymous users browse freely but progress is not tracked.

import { supabase } from "@/lib/supabase";

export interface LessonProgress {
    lesson_id: string;
    completed_at: string;
    score: number | null;
}

export async function listCompletedLessons(userId: string | null): Promise<LessonProgress[]> {
    if (!userId) return [];
    const { data, error } = await supabase
        .from("mq_learn_progress")
        .select("lesson_id, completed_at, score")
        .eq("user_id", userId);
    if (error) throw error;
    return (data as LessonProgress[]) ?? [];
}

export class NotSignedInError extends Error {
    constructor() {
        super("Sign in to save your progress");
        this.name = "NotSignedInError";
    }
}

export async function markLessonComplete(
    userId: string | null,
    lessonId: string,
    score: number | null = null,
): Promise<void> {
    if (!userId) throw new NotSignedInError();
    const { error } = await supabase
        .from("mq_learn_progress")
        .upsert(
            {
                user_id: userId,
                lesson_id: lessonId,
                completed_at: new Date().toISOString(),
                score,
            },
            { onConflict: "user_id,lesson_id" },
        );
    if (error) throw error;
}

export async function resetLessonProgress(userId: string | null): Promise<void> {
    if (!userId) return;
    const { error } = await supabase.from("mq_learn_progress").delete().eq("user_id", userId);
    if (error) throw error;
}
