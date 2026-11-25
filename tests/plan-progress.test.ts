import { describe, expect, it } from "vitest";
import { mergeProgress, sameProgress, type PlanProgress } from "@/lib/plan-progress";

const p = (started_at: string | null, completed_days: number[], reset_at: string | null = null): PlanProgress => ({ plan_id: "x", started_at, completed_days, reset_at });

describe("reading plan progress across devices", () => {
    it("keeps days done on either device and the earlier start", () => {
        expect(mergeProgress(p("2026-11-02T00:00:00Z", [1, 3]), p("2026-11-01T00:00:00Z", [1, 2]))).toEqual(p("2026-11-01T00:00:00Z", [1, 2, 3]));
    });
    it("does not bring back days from before a reset", () => {
        const reset = p(null, [], "2026-11-05T00:00:00Z");
        expect(mergeProgress(p("2026-11-01T00:00:00Z", [1, 2]), reset)).toEqual(reset);
        expect(mergeProgress(reset, p("2026-11-01T00:00:00Z", [1, 2]))).toEqual(reset);
    });
    it("keeps a run started after the reset", () => {
        expect(mergeProgress(p("2026-11-06T00:00:00Z", [1], "2026-11-05T00:00:00Z"), p("2026-11-01T00:00:00Z", [1, 2, 3]))).toEqual(p("2026-11-06T00:00:00Z", [1], "2026-11-05T00:00:00Z"));
    });
    it("takes the only copy there is, and compares times across formats", () => {
        expect(mergeProgress(null, p("2026-11-01T00:00:00Z", [4]))?.completed_days).toEqual([4]);
        expect(sameProgress(p("2026-11-01T00:00:00.000Z", [1]), p("2026-11-01T00:00:00+00:00", [1]))).toBe(true);
    });
});
