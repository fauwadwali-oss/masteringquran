// Validation and the daily limit for /api/ask.
import { bearerToken, supabaseConfig, type SupabaseEnv } from "./auth";

export const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY_MESSAGES = 10;
const MAX_HISTORY_CHARS = 6000;
const MAX_BODY_CHARS = 120_000;

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export type ParsedAsk = { ok: true; message: string; history: ChatMessage[] } | { ok: false; status: number; error: string };

export function parseAskBody(raw: string): ParsedAsk {
    if (raw.length > MAX_BODY_CHARS) return { ok: false, status: 413, error: "That conversation is too long. Please reload and start a new one." };
    let body: any;
    try {
        body = JSON.parse(raw);
    } catch {
        return { ok: false, status: 400, error: "Invalid JSON body" };
    }
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) return { ok: false, status: 400, error: "Please type a question." };
    if (message.length > MAX_MESSAGE_CHARS) return { ok: false, status: 400, error: `Please keep your question under ${MAX_MESSAGE_CHARS.toLocaleString("en-US")} characters.` };
    const history: ChatMessage[] = [];
    for (const m of Array.isArray(body.history) ? body.history.slice(-MAX_HISTORY_MESSAGES) : []) {
        if ((m?.role !== "user" && m?.role !== "assistant") || typeof m.content !== "string" || !m.content.trim()) continue;
        // Turns must alternate and start with the user; keep the later of two in a row.
        if (history.length && history[history.length - 1].role === m.role) history.pop();
        if (!history.length && m.role === "assistant") continue;
        history.push({ role: m.role, content: m.content.slice(0, MAX_HISTORY_CHARS) });
    }
    if (history.length && history[history.length - 1].role === "user") history.pop();
    return { ok: true, message, history };
}

export interface Quota {
    allowed: boolean;
    used: number;
    limit: number;
}

/** Spends one of today's questions. null means the limit could not be checked, so the caller must not answer. */
export async function claimQuestion(request: Request, env: SupabaseEnv): Promise<Quota | null> {
    const { url, anonKey } = supabaseConfig(env);
    try {
        const res = await fetch(`${url}/rest/v1/rpc/mq_claim_ai_question`, {
            method: "POST",
            headers: { apikey: anonKey, Authorization: `Bearer ${bearerToken(request)}`, "Content-Type": "application/json" },
            body: "{}",
        });
        if (!res.ok) return null;
        const q = (await res.json()) as Quota;
        return typeof q?.allowed === "boolean" ? q : null;
    } catch {
        return null;
    }
}
