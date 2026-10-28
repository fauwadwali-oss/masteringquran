import { describe, expect, it } from "vitest";
import {
    chapterAudioId,
    DEFAULT_RECITER,
    getReciter,
    matchesFilter,
    RECITER_FILTERS,
    reciterBadges,
    RECITERS,
    verseAudioId,
} from "@/lib/reciters";

describe("reciter manifest", () => {
    it("has unique ids and unique audio sources", () => {
        const ids = RECITERS.map((r) => r.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(new Set(RECITERS.map((r) => r.verseAudioId)).size).toBe(RECITERS.length);
        expect(new Set(RECITERS.map((r) => r.chapterAudioId)).size).toBe(RECITERS.length);
    });

    it("gives every reciter the required fields", () => {
        for (const r of RECITERS) {
            expect(r.id).toMatch(/^\d+$/);
            expect(Number.isInteger(r.verseAudioId) && r.verseAudioId > 0).toBe(true);
            expect(Number.isInteger(r.chapterAudioId) && r.chapterAudioId > 0).toBe(true);
            expect(r.name.trim()).not.toBe("");
            expect(r.arabicName).toMatch(/[؀-ۿ]/);
            expect(["murattal", "mujawwad", "muallim"]).toContain(r.style);
            expect(Array.isArray(r.tags)).toBe(true);
            for (const t of r.tags) expect(["slow", "verse-by-verse", "children"]).toContain(t);
            expect(typeof r.wordTimings).toBe("boolean");
        }
    });

    it("keeps every reciter the old picker could save", () => {
        for (const id of ["3", "7", "6", "9", "2", "10", "4", "5"]) expect(RECITERS.some((r) => r.id === id)).toBe(true);
        expect(RECITERS.some((r) => r.id === DEFAULT_RECITER)).toBe(true);
    });

    it("falls back to the default for an unknown id", () => {
        expect(getReciter("999").id).toBe(DEFAULT_RECITER);
        expect(verseAudioId("999")).toBe(getReciter(DEFAULT_RECITER).verseAudioId);
        expect(chapterAudioId("12")).toBe(12);
    });

    it("has at least one reciter for every filter chip", () => {
        for (const f of RECITER_FILTERS) expect(RECITERS.filter((r) => matchesFilter(r, f.id)).length).toBeGreaterThan(0);
        expect(RECITERS.filter((r) => matchesFilter(r, "all"))).toHaveLength(RECITERS.length);
    });

    it("has no em dashes in user-facing text", () => {
        const text = [...RECITERS.flatMap((r) => [r.name, r.arabicName, ...reciterBadges(r)]), ...RECITER_FILTERS.map((f) => f.label)];
        for (const t of text) expect(t).not.toContain("—");
    });
});
