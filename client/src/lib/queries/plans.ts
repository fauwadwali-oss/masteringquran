// Plan progress tracking — stored in mq_reading_activity with a JSON sidecar column.
// For simplicity, we store per-plan progress in localStorage keyed by user id.
// When the user signs in on a new device, they resume from wherever Supabase says.

import { supabase } from "@/lib/supabase";

export interface PlanProgress {
    plan_id: string;
    started_at: string;
    completed_days: number[]; // 1-indexed
    last_day: number;
}

const key = (userId: string, planId: string) => `mq_plan_${userId}_${planId}`;

export function getLocalProgress(userId: string, planId: string): PlanProgress | null {
    try {
        const raw = localStorage.getItem(key(userId, planId));
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function setLocalProgress(userId: string, progress: PlanProgress): void {
    localStorage.setItem(key(userId, progress.plan_id), JSON.stringify(progress));
}

export async function startPlan(userId: string, planId: string): Promise<PlanProgress> {
    const progress: PlanProgress = {
        plan_id: planId,
        started_at: new Date().toISOString(),
        completed_days: [],
        last_day: 1,
    };
    setLocalProgress(userId, progress);
    // Also log a reading activity marker
    try {
        await supabase.from("mq_reading_activity").insert({
            user_id: userId,
            day: new Date().toISOString().slice(0, 10),
            verses_read: 0,
            minutes: 0,
            last_verse_key: `plan:${planId}:start`,
        });
    } catch { /* ignore if offline */ }
    return progress;
}

export function markDayComplete(userId: string, planId: string, day: number): PlanProgress {
    const existing = getLocalProgress(userId, planId) || {
        plan_id: planId,
        started_at: new Date().toISOString(),
        completed_days: [],
        last_day: 1,
    };
    if (!existing.completed_days.includes(day)) {
        existing.completed_days = [...existing.completed_days, day].sort((a, b) => a - b);
    }
    existing.last_day = Math.max(existing.last_day, day + 1);
    setLocalProgress(userId, existing);
    return existing;
}

export function resetPlan(userId: string, planId: string): void {
    localStorage.removeItem(key(userId, planId));
}
