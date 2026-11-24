import { afterEach, describe, expect, it, vi } from "vitest";
import { claimQuestion, parseAskBody } from "../functions/_lib/ask-input";

const ask = (b: unknown) => parseAskBody(JSON.stringify(b));

describe("Ask Wali input", () => {
    it("rejects empty, long and malformed questions", () => {
        expect(ask({ message: " " }).ok).toBe(false);
        expect(ask({ message: "x".repeat(2001) }).ok).toBe(false);
        expect(ask(null).ok).toBe(false);
        expect(parseAskBody("{").ok).toBe(false);
        expect(parseAskBody("x".repeat(130_000)).ok).toBe(false);
    });
    it("keeps only alternating text turns", () => {
        const r = ask({ message: "q", history: [{ role: "system", content: "x" }, { role: "assistant", content: "a" }, { role: "user", content: "1" }, { role: "user", content: "2" }, { role: "assistant", content: "b" }, { role: "user", content: [{}] }, { role: "user", content: "3" }] });
        expect(r.ok && r.history).toEqual([{ role: "user", content: "2" }, { role: "assistant", content: "b" }]);
    });
});

describe("daily limit", () => {
    afterEach(() => vi.unstubAllGlobals());
    const req = new Request("https://x/", { headers: { Authorization: "Bearer t" } });
    it("passes the database's answer through and fails closed", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => Response.json({ allowed: false, used: 5, limit: 5 })));
        expect(await claimQuestion(req, {})).toEqual({ allowed: false, used: 5, limit: 5 });
        vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 404 })));
        expect(await claimQuestion(req, {})).toBeNull();
        vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("down"); }));
        expect(await claimQuestion(req, {})).toBeNull();
    });
});
