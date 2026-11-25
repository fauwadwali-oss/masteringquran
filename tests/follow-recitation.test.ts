import { describe, expect, it } from "vitest";
import { fitsInView, isInView } from "@/hooks/useFollowRecitation";

const area = { top: 80, bottom: 700 };

describe("following the recited verse", () => {
    it("counts a long verse as in view while any useful part shows", () => {
        expect(isInView({ top: -900, bottom: 200 }, area)).toBe(true);
        expect(isInView({ top: -900, bottom: 100 }, area)).toBe(false);
    });
    it("needs a very short verse to show in full", () => {
        expect(isInView({ top: 100, bottom: 140 }, area)).toBe(true);
        expect(isInView({ top: 680, bottom: 720 }, area)).toBe(false);
    });
    it("treats a verse under the header or player as not fitting", () => {
        expect(fitsInView({ top: 90, bottom: 600 }, area)).toBe(true);
        expect(fitsInView({ top: 60, bottom: 600 }, area)).toBe(false);
        expect(fitsInView({ top: 300, bottom: 720 }, area)).toBe(false);
    });
});
