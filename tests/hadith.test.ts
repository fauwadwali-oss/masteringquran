import { describe, expect, it } from "vitest";
import { gradeSummary, hadithCitation, matchesPublishedNumber, publishedNumber, searchHadith, sunnahUrl } from "@/lib/hadith";

const h = (hadithnumber: number, arabicnumber?: string, text = "x") => ({ hadithnumber, arabicnumber, text });

describe("hadith numbers", () => {
    it("uses the published Sahih Muslim number, never the dataset index", () => {
        expect(publishedNumber(h(4927, "1907.01"), "muslim")).toBe("1907a");
        expect(publishedNumber(h(98, "9"), "muslim")).toBe("9");
        expect(publishedNumber(h(7, "5.1"), "muslim")).toBe("5j");
        expect(publishedNumber(h(1350), "muslim")).toBeNull();
        expect(hadithCitation(h(1350), "muslim")).not.toContain("1350");
        expect(sunnahUrl(h(4927, "1907.01"), "muslim")).toBe("https://sunnah.com/muslim:1907a");
        expect(sunnahUrl(h(1350), "muslim")).toBeNull();
        expect(publishedNumber(h(52), "bukhari")).toBe("52");
    });
    it("finds every part of a number", () => {
        expect(matchesPublishedNumber(h(4927, "1907.01"), "muslim", "1907")).toBe(true);
        expect(matchesPublishedNumber(h(4927, "1907.01"), "muslim", "1907A")).toBe(true);
        expect(matchesPublishedNumber(h(1907, "701.02"), "muslim", 1907)).toBe(false);
    });
});

describe("gradings", () => {
    it("never hides a weak grading behind a sound one", () => {
        expect(gradeSummary([{ grade: "Sahih" }, { grade: "Daif" }])).toBe("differs");
        expect(gradeSummary([{ grade: "Very Daif" }])).toBe("weak");
        expect(gradeSummary([{ grade: "Mawdu" }])).toBe("fabricated");
        expect(gradeSummary([{ grade: "Mauquf Daif" }])).toBe("weak");
        expect(gradeSummary([{ grade: "Hasan Sahih" }])).toBe("sound");
        expect(gradeSummary([{ grade: "-" }])).toBe("ungraded");
        expect(gradeSummary([])).toBe("ungraded");
    });
});

describe("hadith search", () => {
    const list = [h(1, "1", "Actions are by intentions"), h(2, "2", "Charity with a good intention"), h(3, "3", "")];
    it("falls back to keywords", () => {
        expect(searchHadith(list, "value of intentions").map((x) => x.hadithnumber)).toEqual([1, 2]);
        expect(searchHadith(list, "good charity").map((x) => x.hadithnumber)).toEqual([2]);
        expect(searchHadith(list, "the of")).toEqual([]);
    });
});
