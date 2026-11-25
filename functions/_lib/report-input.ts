// Validation for /api/report. The limits match supabase/migrations/007_ai_reports.sql.
export const REPORT_REASONS = { offensive: "Offensive or harmful", incorrect: "Incorrect", source: "Wrong quote or source", other: "Something else" } as const;

export interface AnswerReport {
    reason: keyof typeof REPORT_REASONS;
    details: string;
    question: string;
    answer: string;
}

// Characters as Postgres counts them, which is not the same as String.length.
const clip = (value: unknown, max: number): string => (typeof value === "string" ? Array.from(value.trim().replace(/\u0000/g, "").slice(0, max * 2)).slice(0, max).join("") : "");

export function parseReport(raw: string): AnswerReport | null {
    if (raw.length > 60_000) return null;
    let body: Record<string, unknown> | null;
    try {
        body = JSON.parse(raw);
    } catch {
        return null;
    }
    const reason = body?.reason;
    if (typeof reason !== "string" || !Object.hasOwn(REPORT_REASONS, reason)) return null;
    const answer = clip(body?.answer, 12_000);
    if (!answer) return null;
    return { reason: reason as AnswerReport["reason"], details: clip(body?.details, 1000), question: clip(body?.question, 2000), answer };
}
