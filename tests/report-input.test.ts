import { describe, expect, it } from "vitest";
import { parseReport } from "../functions/_lib/report-input";

const ok = { reason: "incorrect", details: " d ", question: "q", answer: "a" };

describe("parseReport", () => {
    it("accepts and trims a report", () => expect(parseReport(JSON.stringify(ok))).toEqual({ ...ok, details: "d" }));
    it("rejects bad JSON, unknown reasons and missing answers", () => {
        for (const raw of ["", "null", "[]", JSON.stringify({ ...ok, reason: "toString" }), JSON.stringify({ ...ok, answer: " " })]) expect(parseReport(raw)).toBeNull();
    });
    it("clips long text by characters and drops null bytes, which Postgres refuses", () => {
        const r = parseReport(JSON.stringify({ ...ok, details: "😀".repeat(1500), question: "a\u0000b" }))!;
        expect(Array.from(r.details)).toHaveLength(1000);
        expect(r.question).toBe("ab");
    });
});
