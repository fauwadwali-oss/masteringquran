import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchAllVerses } from "../client/src/lib/fetch-verses";

const serve = (records: number, perPage = 300, drop = 0) =>
    vi.stubGlobal("fetch", async (url: string) => {
        const n = Number(new URL(url).searchParams.get("page"));
        const all = Array.from({ length: records }, (_, i) => ({ id: i + 1 }));
        const verses = all.slice((n - 1) * perPage, n * perPage);
        return { ok: true, json: async () => ({ verses: n === 2 ? verses.slice(drop) : verses, pagination: { total_pages: Math.ceil(records / perPage), total_records: records } }) };
    });

afterEach(() => vi.unstubAllGlobals());

describe("fetchAllVerses", () => {
    it("reads every page, in order", async () => {
        serve(1606);
        const v = await fetchAllVerses("https://x.test/v?a=1");
        expect(v).toHaveLength(1606);
        expect(v[1605].id).toBe(1606);
    });
    it("makes one request for a short section", async () => {
        serve(7);
        expect(await fetchAllVerses("https://x.test/v")).toHaveLength(7);
    });
    it("fails instead of showing a section with verses missing", async () => {
        serve(564, 300, 3);
        await expect(fetchAllVerses("https://x.test/v")).rejects.toThrow();
    });
});
