import { describe, expect, it } from "vitest";
import {
    ADHKAR,
    PROGRESS_KEY,
    ROUTINES,
    countFor,
    emptyProgress,
    firstUnfinished,
    increment,
    loadProgress,
    localDay,
    resetDhikr,
    resetRoutine,
    routineAdhkar,
    routineProgress,
    saveProgress,
    type RoutineId,
} from "@/lib/adhkar";

const COUNT_WORDS: Record<number, string> = { 3: "three", 33: "thirty-three", 34: "thirty-four", 100: "hundred" };

describe("adhkar data", () => {
    it("has the five routines, each with adhkar", () => {
        expect(ROUTINES.map(r => r.id)).toEqual(["morning", "evening", "sleep", "waking", "salah"]);
        for (const r of ROUTINES) {
            expect(routineAdhkar(r.id).length).toBeGreaterThan(0);
            expect(routineAdhkar(r.id).map(d => d.id).sort()).toEqual(ADHKAR.filter(d => d.routines.includes(r.id)).map(d => d.id).sort());
        }
        expect(routineAdhkar("sleep")[0].id).toBe("sleep-three-quls");
        expect(routineAdhkar("sleep").at(-1)!.id).toBe("sleep-aslamtu");
    });

    it("every dhikr has Arabic, some English, a source and a known routine", () => {
        const routines = new Set(ROUTINES.map(r => r.id));
        for (const d of ADHKAR) {
            expect(d.arabic.trim().length).toBeGreaterThan(5);
            expect(d.translation || d.transliteration).toBeTruthy();
            expect(d.reference).toMatch(/^(Quran \d+(:\d+(-\d+)?)?(, \d+(:\d+(-\d+)?)?)*|Sahih|Sunan|Jami)/);
            expect(d.url).toMatch(/^https:\/\/(sunnah\.com|quran\.com)\//);
            expect(d.englishEdition).toBeTruthy();
            expect(d.routines.length).toBeGreaterThan(0);
            for (const r of d.routines) expect(routines.has(r)).toBe(true);
        }
    });

    it("cites a hadith for when to say every dhikr and how many times", () => {
        for (const d of ADHKAR) {
            expect(d.evidence.reference).toMatch(/^(Sahih|Sunan|Jami)/);
            expect(d.evidence.url).toMatch(/^https:\/\/sunnah\.com\//);
            expect(d.evidence.quote.length).toBeGreaterThan(0);
            for (const q of d.evidence.quote) expect(q.trim().length).toBeGreaterThan(10);
        }
    });

    it("has positive whole counts, each stated in the evidence when above one", () => {
        for (const d of ADHKAR) {
            expect(Number.isInteger(d.count)).toBe(true);
            expect(d.count).toBeGreaterThan(0);
            if (d.count > 1) expect(d.evidence.quote.join(" ")).toContain(COUNT_WORDS[d.count]);
        }
    });

    it("includes nothing that a grader in the source edition grades weak", () => {
        for (const d of ADHKAR) {
            for (const g of [...d.grades, ...d.evidence.grades]) expect(g.toLowerCase()).not.toMatch(/da'?if|mawdu|munkar/);
        }
    });

    it("has no duplicate ids, and no routine repeats a text", () => {
        expect(new Set(ADHKAR.map(d => d.id)).size).toBe(ADHKAR.length);
        for (const r of ROUTINES) {
            const texts = routineAdhkar(r.id).map(d => d.arabic);
            expect(new Set(texts).size).toBe(texts.length);
        }
    });

    it("carries no invisible direction marks, and no em dashes in our own copy", () => {
        for (const d of ADHKAR) {
            expect(d.arabic).not.toMatch(/[‎‏]/);
            expect(d.title).not.toContain("—");
        }
        for (const r of ROUTINES) expect(`${r.name} ${r.description}`).not.toContain("—");
    });

    it("keeps the counts the hadith give for the well-known adhkar", () => {
        const byId = (id: string) => ADHKAR.find(d => d.id === id)!;
        expect(byId("bismillah-la-yadurr").count).toBe(3);
        expect(byId("subhanallah-wa-bihamdihi-100").count).toBe(100);
        expect(byId("sleep-takbir-34").count).toBe(34);
        expect(byId("salah-takbir-33").count).toBe(33);
        expect(byId("salah-tamam-al-miah").count).toBe(1);
        expect(byId("sleep-ayat-al-kursi").reference).toBe("Quran 2:255");
        expect(byId("sleep-ayat-al-kursi").evidence.reference).toBe("Sahih al-Bukhari 2311");
    });
});

describe("daily counter progress", () => {
    const morning: RoutineId = "morning";
    const three = ADHKAR.find(d => d.id === "bismillah-la-yadurr")!;
    const day1 = new Date(2026, 9, 28, 8, 0);
    const day1Late = new Date(2026, 9, 28, 23, 59);
    const day2 = new Date(2026, 9, 29, 0, 1);

    it("counts up to the target and no further", () => {
        let p = emptyProgress(day1);
        for (let i = 0; i < 5; i++) p = increment(p, morning, three, day1);
        expect(countFor(p, morning, three)).toBe(3);
    });

    it("keeps each routine's count separate for a dhikr in two routines", () => {
        const p = increment(emptyProgress(day1), morning, three, day1);
        expect(countFor(p, morning, three)).toBe(1);
        expect(countFor(p, "evening", three)).toBe(0);
    });

    it("resets at the viewer's local midnight", () => {
        expect(localDay(day1)).toBe("2026-10-28");
        expect(localDay(day1Late)).toBe("2026-10-28");
        const p = increment(emptyProgress(day1), morning, three, day1Late);
        expect(countFor(p, morning, three)).toBe(1);
        const next = increment(p, morning, three, day2);
        expect(next.date).toBe("2026-10-29");
        expect(countFor(next, morning, three)).toBe(1);
    });

    it("saves to and loads from storage, dropping an earlier day or a broken entry", () => {
        const values = new Map<string, string>();
        const storage = { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => void values.set(k, v) };
        const p = increment(emptyProgress(day1), morning, three, day1);
        saveProgress(p, storage);
        expect(loadProgress(day1Late, storage)).toEqual(p);
        expect(loadProgress(day2, storage)).toEqual(emptyProgress(day2));
        values.set(PROGRESS_KEY, "{not json");
        expect(loadProgress(day1, storage)).toEqual(emptyProgress(day1));
        const failing = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
        expect(loadProgress(day1, failing)).toEqual(emptyProgress(day1));
        expect(() => saveProgress(p, failing)).not.toThrow();
    });

    it("reports routine progress and where to continue", () => {
        const items = routineAdhkar(morning);
        let p = emptyProgress(day1);
        expect(routineProgress(p, morning)).toEqual({ done: 0, total: items.length, complete: false });
        expect(firstUnfinished(p, morning)).toBe(0);
        for (let i = 0; i < items[0].count; i++) p = increment(p, morning, items[0], day1);
        expect(routineProgress(p, morning).done).toBe(1);
        expect(firstUnfinished(p, morning)).toBe(1);
        for (const d of items) for (let i = 0; i < d.count; i++) p = increment(p, morning, d, day1);
        expect(routineProgress(p, morning).complete).toBe(true);
        expect(firstUnfinished(p, morning)).toBe(items.length - 1);
        p = resetDhikr(p, morning, items[2]);
        expect(firstUnfinished(p, morning)).toBe(2);
        p = resetRoutine(p, morning);
        expect(routineProgress(p, morning).done).toBe(0);
    });
});
