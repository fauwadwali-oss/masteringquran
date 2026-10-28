// Adhkar routines (morning, evening, sleep, waking, after salah) and the daily
// counter progress. The texts are exact excerpts of cited sources; see
// scripts/islamic-data/build_adhkar.py for how they are built and checked.
import adhkarData from "@/data/adhkar.json";

export type RoutineId = "morning" | "evening" | "sleep" | "waking" | "salah";

export interface Routine {
    id: RoutineId;
    name: string;
    description: string;
    /** Dhikr ids in the order they are said. */
    adhkar: string[];
}

export interface Dhikr {
    id: string;
    routines: RoutineId[];
    title: string;
    arabic: string;
    translation?: string;
    transliteration?: string;
    reference: string;
    url: string;
    grades: string[];
    englishEdition: string;
    narrationOmitted?: boolean;
    count: number;
    /** The hadith that says when to say it and how many times, quoted word for word. */
    evidence: { reference: string; url: string; quote: string[]; grades: string[] };
}

export const ROUTINES = adhkarData.routines as Routine[];
export const ADHKAR = adhkarData.adhkar as Dhikr[];

const BY_ID = new Map(ADHKAR.map(d => [d.id, d]));

export function routineAdhkar(routine: RoutineId): Dhikr[] {
    return (ROUTINES.find(r => r.id === routine)?.adhkar ?? []).flatMap(id => BY_ID.get(id) ?? []);
}

/** Counts said today, per routine and dhikr. The same dhikr counts separately in each routine. */
export interface AdhkarProgress {
    date: string;
    counts: Partial<Record<RoutineId, Record<string, number>>>;
}

export const PROGRESS_KEY = "mq_adhkar_progress_v1";

/** The viewer's local calendar day, so progress resets at their own midnight. */
export function localDay(now: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function emptyProgress(now: Date): AdhkarProgress {
    return { date: localDay(now), counts: {} };
}

/** Today's saved progress, or a fresh day when nothing is saved, it is from an earlier day, or storage fails. */
export function loadProgress(now: Date, storage: Pick<Storage, "getItem"> | undefined = globalThis.localStorage): AdhkarProgress {
    try {
        const saved = JSON.parse(storage?.getItem(PROGRESS_KEY) ?? "null");
        if (saved && saved.date === localDay(now) && saved.counts && typeof saved.counts === "object") return saved;
    } catch { /* A broken entry starts the day over. */ }
    return emptyProgress(now);
}

export function saveProgress(progress: AdhkarProgress, storage: Pick<Storage, "setItem"> | undefined = globalThis.localStorage) {
    try { storage?.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch { /* Counting still works without storage. */ }
}

export function countFor(progress: AdhkarProgress, routine: RoutineId, d: Dhikr): number {
    return Math.min(progress.counts[routine]?.[d.id] ?? 0, d.count);
}

/** One more repetition, never past the target. Starts a new day first when the date has changed. */
export function increment(progress: AdhkarProgress, routine: RoutineId, d: Dhikr, now: Date): AdhkarProgress {
    const base = progress.date === localDay(now) ? progress : emptyProgress(now);
    const next = Math.min(countFor(base, routine, d) + 1, d.count);
    return { ...base, counts: { ...base.counts, [routine]: { ...base.counts[routine], [d.id]: next } } };
}

export function resetDhikr(progress: AdhkarProgress, routine: RoutineId, d: Dhikr): AdhkarProgress {
    const rest = { ...progress.counts[routine] };
    delete rest[d.id];
    return { ...progress, counts: { ...progress.counts, [routine]: rest } };
}

export function resetRoutine(progress: AdhkarProgress, routine: RoutineId): AdhkarProgress {
    const counts = { ...progress.counts };
    delete counts[routine];
    return { ...progress, counts };
}

export function routineProgress(progress: AdhkarProgress, routine: RoutineId) {
    const items = routineAdhkar(routine);
    const done = items.filter(d => countFor(progress, routine, d) >= d.count).length;
    return { done, total: items.length, complete: items.length > 0 && done === items.length };
}

/** The first dhikr not yet finished today, or the last one when the routine is complete. */
export function firstUnfinished(progress: AdhkarProgress, routine: RoutineId): number {
    const items = routineAdhkar(routine);
    const i = items.findIndex(d => countFor(progress, routine, d) < d.count);
    return i < 0 ? Math.max(items.length - 1, 0) : i;
}
