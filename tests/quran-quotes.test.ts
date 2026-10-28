import { describe, expect, it } from "vitest";
import {
    QuoteStream,
    checkQuranQuotes,
    createQuranComLookup,
    findReferences,
    normalizeArabic,
    type QuranLookup,
    type VerseText,
} from "../functions/_lib/quran-quotes";
import fixture from "./fixtures/quran-verses.json";

// Real Quran.com text (Uthmani + Imla'i) for 1:1-7, 2:255-256, 3:2 and 112:1-4.
const VERSES = fixture as Record<string, VerseText>;
const IKHLAS_1_2 = `${VERSES["112:1"].uthmani.trim()} ${VERSES["112:2"].uthmani}`;

function fakeLookup(opts: { fail?: boolean } = {}): QuranLookup & { searches: string[] } {
    const searches: string[] = [];
    return {
        searches,
        async verses(keys) {
            if (opts.fail) throw new Error("offline");
            return new Map(keys.filter((k) => VERSES[k]).map((k) => [k, VERSES[k]]));
        },
        async search(query) {
            if (opts.fail) throw new Error("offline");
            searches.push(query);
            const words = query.split(" ");
            return Object.entries(VERSES)
                .map(([k, v]) => {
                    const verse = new Set(normalizeArabic(v.imlaei ?? v.uthmani).split(" "));
                    return [k, words.filter((w) => verse.has(normalizeArabic(w))).length] as const;
                })
                .filter(([, hits]) => hits >= Math.ceil(words.length / 2))
                .sort((a, b) => b[1] - a[1])
                .map(([k]) => k);
        },
    };
}

const statuses = (quotes: { kind: string; status: string }[]) => quotes.map((q) => `${q.kind}:${q.status}`);

describe("normalizeArabic", () => {
    it("treats Uthmani and Imla'i spellings of the Basmala as the same text", () => {
        expect(normalizeArabic(VERSES["1:1"].uthmani)).toBe(normalizeArabic(VERSES["1:1"].imlaei!));
        expect(normalizeArabic("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ")).toBe("بسم الله الرحمن الرحيم");
    });

    it("drops tatweel, pause marks and verse numbers but keeps the letters", () => {
        expect(normalizeArabic("ٱللَّهُ ٱلصَّمَدُ ۚ ﴿٢﴾")).toBe("الله الصمد");
        expect(normalizeArabic("إِلَـٰهَ")).toBe("اله");
    });
});

describe("findReferences", () => {
    it("reads the common citation styles", () => {
        const refs = findReferences(
            "See (Quran 2:255), Quran 112:1-4, (1:5), Al-Baqarah 2:256, Surah Al-Ikhlas, verse 1 and Surah al-Fatiha 7.",
        );
        expect(refs.map((r) => [r.surah, r.ayahStart, r.ayahEnd])).toEqual([
            [2, 255, 255],
            [112, 1, 4],
            [1, 5, 5],
            [2, 256, 256],
            [112, 1, 1],
            [1, 7, 7],
        ]);
        expect(refs.every((r) => !r.problem)).toBe(true);
    });

    it("reads bracketed and lower-case citations", () => {
        const refs = findReferences("[2:255] and surah al-ikhlas 1 and al-baqarah 2:256");
        expect(refs.map((r) => [r.surah, r.ayahStart])).toEqual([[2, 255], [112, 1], [2, 256]]);
    });

    it("ignores clock times, decimals and hadith numbers", () => {
        expect(findReferences("Fajr is at 5:12 AM, Asr at (3:45 pm), see section (3.5) and (Bukhari #1).")).toEqual([]);
    });

    it("flags references that do not exist or whose name and number disagree", () => {
        const [a, b, c, d] = findReferences("(Quran 2:300) (Quran 115:1) Al-Baqarah 3:2 (Quran 2:7-3)");
        expect(a.problem).toMatch(/286 verses/);
        expect(b.problem).toMatch(/no surah 115/);
        expect(c.problem).toMatch(/do not match/);
        expect(d.problem).toBeTruthy();
    });
});

describe("checkQuranQuotes", () => {
    it("verifies an exact Uthmani quote", async () => {
        const text = `Allah ﷻ says: ${VERSES["112:1"].uthmani.trim()} (Quran 112:1)`;
        const r = await checkQuranQuotes(text, fakeLookup());
        expect(r.text).toBe(text);
        expect(statuses(r.quotes)).toEqual(["arabic:verified", "reference:verified"]);
        expect(r.quotes[0].reference).toBe("112:1");
    });

    it("verifies undiacritised and partial quotes", async () => {
        const text = "قل هو الله أحد (Quran 112:1)\n\nالله لا إله إلا هو الحي القيوم (Quran 2:255)";
        const r = await checkQuranQuotes(text, fakeLookup());
        expect(r.text).toBe(text);
        expect(statuses(r.quotes)).toEqual(["arabic:verified", "reference:verified", "arabic:verified", "reference:verified"]);
    });

    it("verifies a quote that runs across a cited range", async () => {
        const text = "قُلْ هُوَ ٱللَّهُ أَحَدٌ ٱللَّهُ ٱلصَّمَدُ لَمْ يَلِدْ وَلَمْ يُولَدْ (Quran 112:1-4)";
        const r = await checkQuranQuotes(text, fakeLookup());
        expect(r.quotes[0]).toMatchObject({ status: "verified", reference: "112:1-3" });
    });

    it("corrects a wrong reference when the Arabic is an exact verse", async () => {
        // Ayat al-Kursi cited as the verse after it.
        const text = "الله لا إله إلا هو الحي القيوم لا تأخذه سنة ولا نوم (Quran 2:256)";
        const r = await checkQuranQuotes(text, fakeLookup());
        expect(r.text).toBe("الله لا إله إلا هو الحي القيوم لا تأخذه سنة ولا نوم (Quran 2:255)");
        expect(r.quotes[1]).toMatchObject({ kind: "reference", status: "corrected", text: "Quran 2:255", original: "2:256" });
        expect(r.quotes[0]).toMatchObject({ kind: "arabic", status: "verified", reference: "2:255" });
    });

    it("replaces a near-miss misquote with the exact Uthmani text and says so", async () => {
        // "واحد" instead of "أحد".
        const text = "قل هو الله واحد الله الصمد (Quran 112:1-2)";
        const r = await checkQuranQuotes(text, fakeLookup());
        expect(r.text).toBe(`${IKHLAS_1_2} (Quran 112:1-2)`);
        expect(r.quotes[0]).toMatchObject({ status: "corrected", original: "قل هو الله واحد الله الصمد", reference: "112:1-2" });
        expect(r.quotes[0].note).toMatch(/exact text of Quran 112:1-2/);
    });

    it("does not rewrite Arabic that is far from the cited verse", async () => {
        const text = "إنما الأعمال بالنيات وإنما لكل امرئ ما نوى (Quran 1:2)";
        const r = await checkQuranQuotes(text, fakeLookup());
        expect(r.text).toBe(text);
        expect(r.quotes[0]).toMatchObject({ kind: "arabic", status: "unverified" });
        expect(r.quotes[0].note).toMatch(/does not match Quran 1:2/);
    });

    it("keeps a short phrase's reference when it is not in the cited verse", async () => {
        const text = "الحمد لله رب العالمين (Quran 1:3)";
        const r = await checkQuranQuotes(text, fakeLookup());
        expect(r.text).toBe(text);
        expect(statuses(r.quotes)).toEqual(["arabic:unverified", "reference:verified"]);
    });

    it("keeps ى/ي apart, so a changed letter is not verified", async () => {
        const text = "اهدنا الصراط المستقيم (Quran 1:6)";
        expect((await checkQuranQuotes(text, fakeLookup())).quotes[0].status).toBe("verified");
        const swapped = "اهدنى الصراط المستقيم (Quran 1:6)";
        expect((await checkQuranQuotes(swapped, fakeLookup())).quotes[0].status).not.toBe("verified");
    });

    it("checks a one-word quote only when a citation follows it", async () => {
        const ok = await checkQuranQuotes("ٱلصَّمَدُ (Quran 112:2)", fakeLookup());
        expect(ok.quotes[0]).toMatchObject({ kind: "arabic", status: "verified" });
        const wrong = await checkQuranQuotes("الصمدية (Quran 112:2)", fakeLookup());
        expect(wrong.quotes[0]).toMatchObject({ kind: "arabic", status: "unverified" });
        expect(wrong.text).toBe("الصمدية (Quran 112:2)");
        const term = await checkQuranQuotes("Taqwa (تقوى) is a theme, see (Quran 112:2).", fakeLookup());
        expect(term.quotes.map((q) => q.kind)).toEqual(["reference"]);
    });

    it("keeps the hamza seats أ and إ apart but accepts a bare alef", async () => {
        expect((await checkQuranQuotes("إن مع العسر يسرا (Quran 112:1)", fakeLookup())).quotes).toHaveLength(2);
        const bare = await checkQuranQuotes("الله لا اله الا هو الحي القيوم (Quran 2:255)", fakeLookup());
        expect(bare.quotes[0].status).toBe("verified");
        const swapped = await checkQuranQuotes("الله لا أله ألا هو الحي القيوم (Quran 2:255)", fakeLookup());
        expect(swapped.quotes[0].status).not.toBe("verified");
    });

    it("checks a one-word quote after a lead-in citation", async () => {
        const r = await checkQuranQuotes("Allah says (Quran 112:2): ٱلصَّمَدُ", fakeLookup());
        expect(r.quotes.map((q) => `${q.kind}:${q.status}`)).toEqual(["reference:verified", "arabic:verified"]);
    });

    it("does not move a citation out of the surah it names", async () => {
        const text = "الله لا إله إلا هو الحي القيوم لا تأخذه سنة ولا نوم (Al-Fatihah 1:4)";
        const r = await checkQuranQuotes(text, fakeLookup());
        expect(r.text).toBe(text);
        expect(r.quotes[0]).toMatchObject({ kind: "arabic", status: "unverified" });
    });

    it("marks references that do not exist", async () => {
        const r = await checkQuranQuotes("Read (Quran 2:300) and (Quran 115:1).", fakeLookup());
        expect(statuses(r.quotes)).toEqual(["reference:unverified", "reference:unverified"]);
        expect(r.quotes[0].note).toMatch(/^Could not verify/);
    });

    it("finds the verse for uncited Arabic, and ignores Arabic that is not Quran", async () => {
        const quran = await checkQuranQuotes("الحمد لله رب العالمين", fakeLookup());
        expect(quran.quotes).toEqual([{ kind: "arabic", status: "verified", text: "الحمد لله رب العالمين", reference: "1:2" }]);
        const dua = await checkQuranQuotes("اللهم إني أسألك العافية في الدنيا والآخرة", fakeLookup());
        expect(dua.quotes).toEqual([]);
    });

    it("does not treat honorifics or single Arabic words as quotes", async () => {
        const lookup = fakeLookup();
        const r = await checkQuranQuotes("Allah ﷻ and the Prophet ﷺ spoke of تقوى.", lookup);
        expect(r.quotes).toEqual([]);
        expect(lookup.searches).toEqual([]);
    });

    it("marks quotes unverified, unchanged, when the Quran text cannot be fetched", async () => {
        const text = "قل هو الله واحد (Quran 112:1)";
        const r = await checkQuranQuotes(text, fakeLookup({ fail: true }));
        expect(r.text).toBe(text);
        expect(r.quotes[0]).toMatchObject({ kind: "arabic", status: "unverified" });
        expect(r.quotes[0].note).toMatch(/could not be checked/);
    });

    it("never uses an em dash in notes shown to users", async () => {
        const r = await checkQuranQuotes(
            "قل هو الله واحد الله الصمد (Quran 112:1-2) الله لا إله إلا هو الحي القيوم لا تأخذه سنة ولا نوم (Quran 2:256) (Quran 2:300) Al-Baqarah 3:2",
            fakeLookup(),
        );
        expect(r.quotes.length).toBeGreaterThan(3);
        for (const q of r.quotes) expect(q.note ?? "").not.toMatch(/—/);
    });
});

describe("QuoteStream", () => {
    it("holds uncited Arabic until the citation in the next paragraph, then releases in order", async () => {
        const out: string[] = [];
        const stream = new QuoteStream(fakeLookup(), (t) => out.push(t));
        const answer = "Surah al-Ikhlas opens:\n\nقل هو الله واحد الله الصمد\n\n(Quran 112:1-2)\n\nIt affirms tawhid.";
        for (const ch of answer.match(/.{1,7}/gs)!) stream.push(ch);
        await stream.flush();
        expect(out.join("")).toBe(`Surah al-Ikhlas opens:\n\n${IKHLAS_1_2}\n\n(Quran 112:1-2)\n\nIt affirms tawhid.`);
        expect(out[0]).toBe("Surah al-Ikhlas opens:\n\n");
        expect(statuses(stream.quotes)).toEqual(["arabic:corrected", "reference:verified"]);
    });

    it("applies a lead-in citation to the Arabic that follows it, and only then", async () => {
        const out: string[] = [];
        const stream = new QuoteStream(fakeLookup(), (t) => out.push(t));
        stream.push("Allah ﷻ says (Quran 1:3):\n\nالله لا إله إلا هو الحي القيوم\n\nSee also (Quran 112:2).\n\nالحمد لله رب العالمين");
        await stream.flush();
        expect(stream.quotes.map((q) => [q.status, q.reference])).toEqual([
            ["verified", "1:3"],
            ["unverified", "1:3"],
            ["verified", "112:2"],
            ["verified", "1:2"],
        ]);
    });

    it("passes plain text straight through", async () => {
        const out: string[] = [];
        const stream = new QuoteStream(fakeLookup(), (t) => out.push(t));
        stream.push("Mercy is a central theme.\n\nIt appears often.");
        await stream.flush();
        expect(out).toEqual(["Mercy is a central theme.\n\n", "It appears often."]);
        expect(stream.quotes).toEqual([]);
    });
});

describe("createQuranComLookup", () => {
    it("batches verses from one surah into a single surah request pair and caches them", async () => {
        const calls: string[] = [];
        const fakeFetch = (async (url: string) => {
            calls.push(url);
            const script = url.includes("/imlaei") ? "imlaei" : "uthmani";
            const verses = Object.entries(VERSES)
                .filter(([k]) => k.startsWith("112:"))
                .map(([k, v]) => ({ verse_key: k, [`text_${script}`]: v[script as keyof VerseText] }));
            return new Response(JSON.stringify({ verses }));
        }) as unknown as typeof fetch;
        const lookup = createQuranComLookup(fakeFetch);
        const first = await lookup.verses(["112:1", "112:2"]);
        expect(first.get("112:2")?.imlaei).toBe(VERSES["112:2"].imlaei);
        expect(calls).toHaveLength(2);
        expect(calls[0]).toContain("chapter_number=112");
        await lookup.verses(["112:3", "112:1"]);
        expect(calls).toHaveLength(2);
    });
});
