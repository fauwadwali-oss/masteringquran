import { supabase } from "@/lib/supabase";

export interface StreakInfo {
    currentStreak: number;
    longestStreak: number;
    todayRead: boolean;
}

function dayStr(d: Date): string {
    return d.toISOString().slice(0, 10); // YYYY-MM-DD UTC
}

export async function recordReading(userId: string, verseKey: string): Promise<void> {
    const today = dayStr(new Date());
    // Upsert today's activity row, bumping verses_read by 1
    const { data: existing } = await supabase
        .from("mq_reading_activity")
        .select("*")
        .eq("user_id", userId)
        .eq("day", today)
        .maybeSingle();
    if (existing) {
        await supabase
            .from("mq_reading_activity")
            .update({
                verses_read: (existing.verses_read as number) + 1,
                last_verse_key: verseKey,
            })
            .eq("id", (existing as any).id);
    } else {
        await supabase.from("mq_reading_activity").insert({
            user_id: userId,
            day: today,
            verses_read: 1,
            last_verse_key: verseKey,
        });
    }
}

export async function getStreak(userId: string): Promise<StreakInfo> {
    // Fetch last 365 days of activity
    const sinceIso = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data, error } = await supabase
        .from("mq_reading_activity")
        .select("day")
        .eq("user_id", userId)
        .gte("day", sinceIso)
        .order("day", { ascending: false });
    if (error) throw error;

    const days = new Set<string>((data ?? []).map((r: any) => r.day as string));
    const today = dayStr(new Date());
    const todayRead = days.has(today);

    // Walk back from today (or yesterday if not read today) to find current streak
    let currentStreak = 0;
    const cursor = new Date();
    if (!todayRead) {
        cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    while (days.has(dayStr(cursor))) {
        currentStreak += 1;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    // Longest streak over the last year
    const sorted = Array.from(days).sort();
    let longest = 0;
    let run = 0;
    let prev: Date | null = null;
    for (const d of sorted) {
        const cur = new Date(d + "T00:00:00Z");
        if (prev && (cur.getTime() - prev.getTime()) === 24 * 60 * 60 * 1000) {
            run += 1;
        } else {
            run = 1;
        }
        if (run > longest) longest = run;
        prev = cur;
    }

    return {
        currentStreak,
        longestStreak: Math.max(longest, currentStreak),
        todayRead,
    };
}
