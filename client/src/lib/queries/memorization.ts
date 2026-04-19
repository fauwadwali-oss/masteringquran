import { supabase } from "@/lib/supabase";

export type MemorizationStatus = "new" | "learning" | "memorized" | "review_due";

export interface MemorizationEntry {
    id: string;
    user_id: string;
    verse_key: string;
    surah: number;
    ayah: number;
    status: MemorizationStatus;
    confidence: number;
    last_reviewed_at: string | null;
    next_review_at: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Simple SM-2-inspired spaced repetition.
 * confidence 0 → 1 day, 1 → 3 days, 2 → 7 days, 3 → 14 days, 4 → 30 days, 5 → 90 days.
 */
const INTERVALS_DAYS = [1, 3, 7, 14, 30, 90];

function nextReview(confidence: number): string {
    const c = Math.max(0, Math.min(5, Math.round(confidence)));
    const ms = INTERVALS_DAYS[c] * 24 * 60 * 60 * 1000;
    return new Date(Date.now() + ms).toISOString();
}

export async function setStatus(
    userId: string,
    surah: number,
    ayah: number,
    status: MemorizationStatus,
    confidence?: number,
): Promise<MemorizationEntry> {
    const verse_key = `${surah}:${ayah}`;
    const now = new Date().toISOString();
    const conf = confidence ?? (status === "memorized" ? 3 : status === "learning" ? 1 : 0);
    const row = {
        user_id: userId,
        verse_key,
        surah,
        ayah,
        status,
        confidence: conf,
        last_reviewed_at: now,
        next_review_at: status === "memorized" ? nextReview(conf) : null,
        updated_at: now,
    };
    const { data, error } = await supabase
        .from("mq_memorization")
        .upsert(row, { onConflict: "user_id,verse_key" })
        .select()
        .single();
    if (error) throw error;
    return data as MemorizationEntry;
}

export async function getEntry(userId: string, verseKey: string): Promise<MemorizationEntry | null> {
    const { data, error } = await supabase
        .from("mq_memorization")
        .select("*")
        .eq("user_id", userId)
        .eq("verse_key", verseKey)
        .maybeSingle();
    if (error) throw error;
    return (data as MemorizationEntry) ?? null;
}

export async function listByStatus(userId: string, status: MemorizationStatus): Promise<MemorizationEntry[]> {
    const { data, error } = await supabase
        .from("mq_memorization")
        .select("*")
        .eq("user_id", userId)
        .eq("status", status)
        .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data as MemorizationEntry[]) ?? [];
}

export async function getDueForReview(userId: string): Promise<MemorizationEntry[]> {
    const { data, error } = await supabase
        .from("mq_memorization")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "memorized")
        .lte("next_review_at", new Date().toISOString())
        .order("next_review_at", { ascending: true });
    if (error) throw error;
    return (data as MemorizationEntry[]) ?? [];
}

export async function listAll(userId: string): Promise<MemorizationEntry[]> {
    const { data, error } = await supabase
        .from("mq_memorization")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data as MemorizationEntry[]) ?? [];
}

export async function removeEntry(userId: string, verseKey: string): Promise<void> {
    const { error } = await supabase
        .from("mq_memorization")
        .delete()
        .eq("user_id", userId)
        .eq("verse_key", verseKey);
    if (error) throw error;
}
