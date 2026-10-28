import { describe, expect, it } from "vitest";
import {
    addSurah,
    buildOrder,
    cleanName,
    createPlaylist,
    deletePlaylist,
    mergeWithAccount,
    moveSurah,
    nextPosition,
    removeSurahAt,
    renamePlaylist,
    skipBack,
    skipForward,
    STARTER_PLAYLISTS,
    syncChanges,
    translationAudioUrl,
    type Playlist,
} from "@/lib/playlists";
import { SURAHS, globalAyahNumber } from "@/lib/surah-list";

const make = (surahs: number[] = []) => createPlaylist([], "Test", surahs);

describe("surah list", () => {
    it("has all 114 surahs and 6236 verses", () => {
        expect(SURAHS).toHaveLength(114);
        expect(SURAHS.reduce((t, s) => t + s.ayahs, 0)).toBe(6236);
        expect(SURAHS[17].englishName).toBe("Al-Kahf");
    });

    it("numbers verses from the start of the Quran", () => {
        expect(globalAyahNumber(1, 1)).toBe(1);
        expect(globalAyahNumber(2, 1)).toBe(8);
        expect(globalAyahNumber(2, 255)).toBe(262);
        expect(globalAyahNumber(114, 6)).toBe(6236);
    });

    it("builds translation audio links by global verse number", () => {
        expect(translationAudioUrl("en", 2, 255)).toBe("https://cdn.islamic.network/quran/audio/192/en.walk/262.mp3");
        expect(translationAudioUrl("ur", 1, 1)).toBe("https://cdn.islamic.network/quran/audio/64/ur.khan/1.mp3");
    });
});

describe("editing playlists", () => {
    it("creates with a clean name, valid surahs only, Arabic by default", () => {
        const [list, p] = createPlaylist([], "   Night \n time  ", [67, 0, 32, 999]);
        expect(list).toHaveLength(1);
        expect(p.name).toBe("Night time");
        expect(p.surahs).toEqual([67, 32]);
        expect(p.mode).toBe("arabic");
        expect(cleanName("")).toBe("My playlist");
    });

    it("adds without duplicates, removes, renames and deletes", () => {
        let [list, p] = make([18]);
        list = addSurah(list, p.id, 18);
        list = addSurah(list, p.id, 67);
        expect(list[0].surahs).toEqual([18, 67]);
        list = removeSurahAt(list, p.id, 0);
        expect(list[0].surahs).toEqual([67]);
        list = renamePlaylist(list, p.id, "  ");
        expect(list[0].name).toBe("Test");
        list = renamePlaylist(list, p.id, "Friday");
        expect(list[0].name).toBe("Friday");
        expect(deletePlaylist(list, p.id)).toEqual([]);
    });

    it("reorders and ignores moves out of range", () => {
        const [list, p] = make([1, 2, 3]);
        expect(moveSurah(list, p.id, 0, 2)[0].surahs).toEqual([2, 3, 1]);
        expect(moveSurah(list, p.id, 2, 1)[0].surahs).toEqual([1, 3, 2]);
        expect(moveSurah(list, p.id, 0, 5)[0].surahs).toEqual([1, 2, 3]);
    });

    it("starter ideas only use real surahs", () => {
        for (const s of STARTER_PLAYLISTS) {
            expect(s.surahs.every((n) => n >= 1 && n <= 114)).toBe(true);
            expect(s.note).not.toMatch(/—/);
        }
        expect(STARTER_PLAYLISTS.find((s) => s.key === "juz-amma")!.surahs).toHaveLength(37);
    });
});

describe("play order", () => {
    it("plays in order without shuffle", () => {
        expect(buildOrder(4, false)).toEqual([0, 1, 2, 3]);
    });

    it("shuffles every surah once, starting with the chosen one", () => {
        let seed = 1;
        const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
        const order = buildOrder(10, true, 6, random);
        expect(order[0]).toBe(6);
        expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it("moves on, repeats or stops at the end", () => {
        expect(nextPosition(0, 3, "off")).toBe(1);
        expect(nextPosition(2, 3, "off")).toBeNull();
        expect(nextPosition(2, 3, "all")).toBe(0);
        expect(nextPosition(1, 3, "one")).toBe(1);
        expect(skipForward(2, 3)).toBe(0);
        expect(skipBack(0, 3)).toBe(2);
    });
});

describe("account sync", () => {
    const pl = (id: string, extra: Partial<Playlist> = {}): Playlist => ({ id, name: id, surahs: [1], mode: "arabic", createdAt: 1, ...extra });

    it("keeps unsent device playlists and drops ones deleted elsewhere", () => {
        const local = [pl("a", { synced: true }), pl("b", { synced: true }), pl("c")];
        const remote = [pl("a", { name: "renamed" })];
        const merged = mergeWithAccount(local, remote);
        expect(merged.map((p) => p.id)).toEqual(["a", "c"]);
        expect(merged[0]).toMatchObject({ name: "renamed", synced: true });
        expect(merged[1].synced).toBeFalsy();
    });

    it("sends only what changed", () => {
        const before = [pl("a", { synced: true }), pl("b", { synced: true }), pl("c", { synced: true })];
        const after = [pl("a", { synced: true }), { ...before[1], surahs: [1, 2] }, pl("d")];
        const { upsert, remove } = syncChanges(before, after);
        expect(upsert.map((p) => p.id)).toEqual(["b", "d"]);
        expect(remove).toEqual(["c"]);
    });
});
