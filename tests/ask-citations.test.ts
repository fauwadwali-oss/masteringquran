import { describe, expect, it } from "vitest";
import { checkHadith, findCitations } from "@/lib/citations";
import { sourcesFrom } from "../functions/_lib/ask-sources";

describe("Ask Wali references", () => {
    it("links Quran references and leaves impossible ones alone", () => {
        const c = findCitations("Mercy (Quran 7:156) and (2:255-257; 3:8), not (Quran 2:999) or at 10:30.");
        expect(c.map((x) => [x.text, x.to])).toEqual([
            ["Quran 7:156", "/quran/7/156"],
            ["2:255-257", "/quran/2/255"],
            ["3:8", "/quran/3/8"],
        ]);
    });
    it("links hadith whatever apostrophe is used", () => {
        const c = findCitations("(Jami` at-Tirmidhi 3391) (Jami’ at-Tirmidhi 3391) (Sahih Muslim 1907a) (40 Hadith of an-Nawawi 1)");
        expect(c.map((x) => x.to)).toEqual([
            "/hadith?collection=tirmidhi&hadith=3391",
            "/hadith?collection=tirmidhi&hadith=3391",
            "/hadith?collection=muslim&hadith=1907a",
            "/hadith?collection=nawawi&hadith=1",
        ]);
    });
    it("flags a hadith number that was never looked up", () => {
        const sources = [{ kind: "hadith" as const, citation: "Sahih Muslim 1907a", grading: "In a sahih collection" }];
        const r = checkHadith("(Sahih Muslim 1907a) (Sahih al-Bukhari 9999) (Sahih Muslim 1907b)", sources);
        expect(r.map((x) => !!x.source)).toEqual([true, false, false]);
    });
    it("reports gradings and nothing for failed lookups", () => {
        expect(sourcesFrom("get_hadith", { error: "x" })).toEqual([]);
        expect(sourcesFrom("search_hadith_collection", { matches: [{ citation: "Sunan Abi Dawud 1", grading: "Graded weak (da'if)" }] })).toEqual([
            { kind: "hadith", citation: "Sunan Abi Dawud 1", grading: "Graded weak (da'if)" },
        ]);
    });
});
