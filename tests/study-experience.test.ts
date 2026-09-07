import { afterEach, describe, expect, it, vi } from "vitest";
import { dailyIndex, dailyVerseKey } from "../client/src/lib/daily-selection";
import { safeReturnPath, rememberAuthReturn, consumeAuthReturn } from "../client/src/lib/auth-return";

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("daily selections", () => {
    it("keeps the same selection throughout a UTC day and advances at midnight", () => {
        const morning = new Date("2026-09-07T00:00:00Z");
        const evening = new Date("2026-09-07T23:59:59.999Z");
        const tomorrow = new Date("2026-09-08T00:00:00Z");
        expect(dailyIndex(morning, 42)).toBe(dailyIndex(evening, 42));
        expect(dailyIndex(tomorrow, 42)).toBe((dailyIndex(morning, 42) + 1) % 42);
        expect(dailyIndex(new Date("2026-09-07T20:00:00-04:00"), 42)).toBe(dailyIndex(tomorrow, 42));
    });
    it("maps chapter boundaries and wraps without an invalid verse", () => {
        const chapters = [{ id: 1, verses_count: 7 }, { id: 2, verses_count: 286 }];
        const day = (n: number) => new Date(n * 86_400_000);
        expect(dailyVerseKey(day(0), chapters)).toBe("1:1");
        expect(dailyVerseKey(day(6), chapters)).toBe("1:7");
        expect(dailyVerseKey(day(7), chapters)).toBe("2:1");
        expect(dailyVerseKey(day(292), chapters)).toBe("2:286");
        expect(dailyVerseKey(day(293), chapters)).toBe("1:1");
        expect(() => dailyVerseKey(day(0), [])).toThrow();
    });
});

describe("sign-in return destination", () => {
    it.each(["https://evil.example", "//evil.example", "/\\evil.example", "/\nevil.example", "/auth/callback", null])("rejects unsafe destination %s", value => {
        expect(safeReturnPath(value)).toBe("/");
    });
    it("preserves internal lesson and verse destinations", () => {
        expect(safeReturnPath("/learn-arabic/letters")).toBe("/learn-arabic/letters");
        expect(safeReturnPath("/quran?verse=2:255#ayah-2-255")).toBe("/quran?verse=2:255#ayah-2-255");
    });
    it("consumes the destination once and expires stale requests", () => {
        const values = new Map<string, string>();
        vi.stubGlobal("localStorage", { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => values.set(k, v), removeItem: (k: string) => values.delete(k) });
        vi.useFakeTimers();
        rememberAuthReturn("/learn-arabic/letters");
        expect(consumeAuthReturn()).toBe("/learn-arabic/letters");
        expect(consumeAuthReturn()).toBe("/");
        rememberAuthReturn("/learn-arabic/letters");
        vi.advanceTimersByTime(3_600_001);
        expect(consumeAuthReturn()).toBe("/");
    });
    it("allows sign-in to continue when storage is blocked", () => {
        vi.stubGlobal("localStorage", { setItem: () => { throw new Error("blocked"); }, getItem: () => { throw new Error("blocked"); } });
        expect(() => rememberAuthReturn("/learn-arabic")).not.toThrow();
        expect(consumeAuthReturn()).toBe("/");
    });
});
