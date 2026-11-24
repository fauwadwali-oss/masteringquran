import { describe, expect, it } from "vitest";
import { appShortcutPath } from "@/lib/app-shortcuts";
import verses from "../ios/App/QuranWidget/verses.json";
import android from "../android/app/src/main/assets/widget/verses.json";
import snapshot from "../scripts/prerender/data/quran-snapshot.json";

describe("widget links", () => {
    it("opens real verses and nothing else", () => {
        expect(appShortcutPath("masteringquran://open/quran/2/255")).toBe("/quran/2/255");
        expect(appShortcutPath("masteringquran://open/quran/2/287")).toBeNull();
        expect(appShortcutPath("masteringquran://open/quran/115/1")).toBeNull();
        expect(appShortcutPath("masteringquran://auth/callback?code=x")).toBeNull();
        expect(appShortcutPath("masteringquran://open/../account")).toBeNull();
    });
});

describe("widget verses", () => {
    it("match the Quran snapshot exactly on both platforms", () => {
        expect(android).toEqual(verses);
        for (const v of verses) {
            const source = (snapshot as any).surahs[v.s - 1].verses[v.a - 1];
            expect([source.n, source.ar, source.en]).toEqual([v.a, v.ar, v.en]);
            expect(appShortcutPath(`masteringquran://open/quran/${v.s}/${v.a}`)).toBe(`/quran/${v.s}/${v.a}`);
        }
    });
});
