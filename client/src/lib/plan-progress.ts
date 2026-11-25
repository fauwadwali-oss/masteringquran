// Combining reading-plan progress from this device and the reader's account.

export interface PlanProgress {
    plan_id: string;
    /** null after a reset, until the plan is started again. */
    started_at: string | null;
    completed_days: number[]; // 1-indexed
    reset_at: string | null;
}

/** Days done on either device are kept, unless the plan was reset after that run began. */
export function mergeProgress(a: PlanProgress | null, b: PlanProgress | null): PlanProgress | null {
    if (!a || !b) return a ?? b;
    const time = (s: string | null) => (s ? Date.parse(s) : -Infinity);
    const reset_at = time(a.reset_at) >= time(b.reset_at) ? a.reset_at : b.reset_at;
    const live = [a, b].filter((p) => p.started_at && time(p.started_at) > time(reset_at));
    return {
        plan_id: a.plan_id,
        started_at: live.map((p) => p.started_at!).sort((x, y) => time(x) - time(y))[0] ?? null,
        completed_days: Array.from(new Set(live.flatMap((p) => p.completed_days))).sort((x, y) => x - y),
        reset_at,
    };
}
