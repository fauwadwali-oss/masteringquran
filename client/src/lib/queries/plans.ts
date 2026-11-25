// Reading-plan progress: kept on this device so it works offline, and copied to the
// reader's account so it follows them to other devices.

import { supabase } from "@/lib/supabase";
import { mergeProgress, sameProgress, type PlanProgress } from "@/lib/plan-progress";

export type { PlanProgress };

const key = (userId: string, planId: string) => `mq_plan_${userId}_${planId}`;

export function getLocalProgress(userId: string, planId: string): PlanProgress | null {
    try {
        const raw = localStorage.getItem(key(userId, planId));
        if (!raw) return null;
        const p = JSON.parse(raw);
        return { plan_id: planId, started_at: p.started_at ?? null, completed_days: p.completed_days ?? [], reset_at: p.reset_at ?? null };
    } catch {
        return null;
    }
}

function setLocalProgress(userId: string, progress: PlanProgress): void {
    try {
        localStorage.setItem(key(userId, progress.plan_id), JSON.stringify(progress));
    } catch {
        /* storage blocked: the account copy still works */
    }
}

/** The newest reset wins even if this device's clock is behind. */
const after = (iso: string | null) => new Date(Math.max(Date.now(), iso ? Date.parse(iso) + 1 : 0)).toISOString();

export function startPlan(userId: string, planId: string, current: PlanProgress | null): PlanProgress {
    const progress: PlanProgress = { plan_id: planId, started_at: after(current?.reset_at ?? null), completed_days: [], reset_at: current?.reset_at ?? null };
    setLocalProgress(userId, progress);
    return progress;
}

export function markDayComplete(userId: string, current: PlanProgress, day: number): PlanProgress {
    const progress = { ...current, completed_days: Array.from(new Set([...current.completed_days, day])).sort((a, b) => a - b) };
    setLocalProgress(userId, progress);
    return progress;
}

export function resetPlan(userId: string, current: PlanProgress): PlanProgress {
    const progress: PlanProgress = { plan_id: current.plan_id, started_at: null, completed_days: [], reset_at: after(current.started_at) };
    setLocalProgress(userId, progress);
    return progress;
}

/** Combines `shown` with the account's copy, saves the result in both places, and returns it. */
export async function syncPlan(userId: string, planId: string, shown: () => PlanProgress | null): Promise<PlanProgress | null> {
    const { data, error } = await supabase
        .from("mq_plan_progress")
        .select("plan_id, started_at, completed_days, reset_at")
        .eq("user_id", userId)
        .eq("plan_id", planId)
        .maybeSingle();
    if (error) throw error;
    const remote = (data as PlanProgress | null) ?? null;
    // Read what is shown only now, so a day marked during the request is kept.
    const merged = mergeProgress(shown(), remote);
    if (!merged) return null;
    setLocalProgress(userId, merged);
    if (!sameProgress(merged, remote)) {
        const { error: saveError } = await supabase
            .from("mq_plan_progress")
            .upsert({ user_id: userId, ...merged, updated_at: new Date().toISOString() }, { onConflict: "user_id,plan_id" });
        if (saveError) throw saveError;
    }
    return merged;
}
