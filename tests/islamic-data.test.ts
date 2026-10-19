import { describe, expect, it } from "vitest";
import { DUAS, DUA_CATEGORIES, NAMES, NAMES_SOURCE, searchDuas } from "@/lib/islamic-data";

describe("99 Names", () => {
    it("has 99 names numbered in order, starting with Allah", () => {
        expect(NAMES).toHaveLength(99);
        expect(NAMES.map((n) => n.number)).toEqual(Array.from({ length: 99 }, (_, i) => i + 1));
        expect(NAMES[0].transliteration).toBe("Allāh");
        expect(NAMES[98].transliteration).toBe("Aṣ-Ṣabūr");
    });

    it("names the source of every English rendering", () => {
        for (const n of NAMES) expect(n.english === null).toBe(n.englishSource === null);
        expect(NAMES.filter((n) => n.english === null).map((n) => n.transliteration)).toEqual(["Al-Wājid", "Aḍ-Ḍār"]);
    });

    it("always pairs Az-Zahir and Al-Batin with the Prophet's explanation", () => {
        for (const t of ["Aẓ-Ẓāhir", "Al-Bāṭin"]) {
            const n = NAMES.find((x) => x.transliteration === t)!;
            expect(n.explanation).toBeTruthy();
            expect(n.englishSource).toBe("Sahih Muslim 2713");
        }
    });

    it("states that the enumeration is weak", () => {
        expect(NAMES_SOURCE.listGrade).toMatch(/da'if/);
    });
});

describe("duas", () => {
    it("every dua has Arabic, some English, a reference and a known category", () => {
        const cats = new Set(DUA_CATEGORIES.map((c) => c.id));
        for (const d of DUAS) {
            expect(d.arabic.length).toBeGreaterThan(5);
            expect(d.translation || d.transliteration).toBeTruthy();
            expect(d.reference).toMatch(/^(Quran \d+:\d+|Sahih|Sunan|Jami)/);
            expect(d.url).toMatch(/^https:\/\/(sunnah\.com|quran\.com)\//);
            expect(cats.has(d.category)).toBe(true);
        }
        expect(new Set(DUAS.map((d) => d.id)).size).toBe(DUAS.length);
    });

    it("carries no invisible direction marks", () => {
        for (const d of DUAS) expect(d.arabic).not.toMatch(/[‎‏]/);
    });

    it("searches titles and English", () => {
        expect(searchDuas("rain").map((d) => d.id)).toContain("rain");
        expect(searchDuas("Laylat").map((d) => d.id)).toContain("laylat-al-qadr");
    });
});
