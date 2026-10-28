// Quran quotation checker for Ask Wali.
// Finds verse references and Arabic passages in model output, compares them with the
// canonical Quran.com text (Uthmani and Imla'i scripts), and either confirms, corrects
// (only when the intended verse is unambiguous) or marks each one "could not verify".
// Normalisation is only used for comparison; text shown to users is never normalised.

import { SURAHS } from "./quran-surahs";

export type QuoteStatus = "verified" | "corrected" | "unverified";

export interface QuoteCheck {
    kind: "arabic" | "reference";
    status: QuoteStatus;
    /** The text as it now appears in the answer (after any correction). */
    text: string;
    /** What the model wrote, when it was corrected. */
    original?: string;
    /** Verse key or range the quote was checked against, e.g. "2:255" or "112:1-4". */
    reference?: string;
    note?: string;
}

export interface VerseText {
    uthmani: string;
    imlaei?: string;
}

export interface QuranLookup {
    /** Resolves the canonical text of each key that exists; unknown keys are left out. */
    verses(keys: string[]): Promise<Map<string, VerseText>>;
    /** Verse keys that best match an Arabic query, most relevant first. */
    search(query: string): Promise<string[]>;
}

// ─────────────────────────────── Normalisation ───────────────────────────────

const ARABIC_CHAR = "\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDF9\\uFDFC-\\uFDFF\\uFE70-\\uFEFF";
// Honorific ligatures (ﷺ, ﷻ) are left out of ARABIC_CHAR so "Allah ﷻ" never reads as a quote.
const ARABIC_RUN = new RegExp(`[${ARABIC_CHAR}](?:[${ARABIC_CHAR} \\t\\u00A0]*[${ARABIC_CHAR}])?`, "g");
const HAS_ARABIC = new RegExp(`[${ARABIC_CHAR}]`);

const MIN_QUOTE_WORDS = 3;
// Correcting a reference to wherever else a phrase occurs is only safe for longer passages.
const MIN_WORDS_TO_MOVE_REFERENCE = 6;

/**
 * Base skeleton: no vowels, tatweel, Quranic annotation marks, verse numbers or bidi controls.
 * Hamza seats on alef are folded, but ى/ي and ة/ه are kept apart because they can change the word
 * (هدى "guidance" vs هدي "offering"); spelling differences between scripts come from comparing
 * against both the Uthmani and the Imla'i text instead.
 */
function skeleton(word: string, daggerAlef: "" | "ا"): string {
    return word
        .normalize("NFKC")
        .replace(/[‌-‏؜﻿]/g, "")
        .replace(/ٰ/g, daggerAlef)
        .replace(/[ً-ٟـۖ-ۭ࣓-ࣿ]/g, "")
        .replace(/[٠-٩۰-۹﴾﴿۝۞()]/g, "")
        .replace(/^ءا/, "ا")
        .replace(/[أإآٱ]/g, "ا")
        .replace(/[^ء-ي]/g, "");
}

/** Every acceptable comparison form of one canonical word (dagger alef may or may not be written). */
function variants(word: string): string[] {
    const a = skeleton(word, "");
    const b = skeleton(word, "ا");
    return a === b ? [a] : [a, b];
}

export function normalizeArabic(text: string): string {
    return text
        .split(/\s+/)
        .map((w) => skeleton(w, ""))
        .filter(Boolean)
        .join(" ");
}

function modelWords(text: string): string[] {
    return text
        .split(/\s+/)
        .map((w) => skeleton(w, "ا"))
        .filter(Boolean);
}

// ─────────────────────────────── References ───────────────────────────────

export interface Reference {
    start: number;
    end: number;
    surah: number;
    ayahStart: number;
    ayahEnd: number;
    /** Span of the "S:A" digits, replaced on correction so the rest of the citation keeps its wording. */
    numStart?: number;
    numEnd?: number;
    /** Surah implied by a name in the citation, when one was given. */
    namedSurah?: number;
    problem?: string;
}

function nameKey(raw: string): string {
    return raw
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/^(?:al|an|ar|as|at|ad|adh|az|ash|ath|aal)[-\s'’]+/, "")
        .replace(/[^a-z]/g, "")
        .replace(/ee/g, "i")
        .replace(/oo/g, "u")
        .replace(/(.)\1+/g, "$1")
        .replace(/h$/, "");
}

const SURAH_BY_NAME = new Map<string, number>();
SURAHS.forEach(([name], i) => SURAH_BY_NAME.set(nameKey(name), i + 1));
const ALIASES: Record<string, number> = {
    "fatiha": 1, "imran": 3, "aliimran": 3, "alimran": 3, "nisa": 4, "maida": 5, "anam": 6, "araf": 7,
    "tauba": 9, "tawba": 9, "baraa": 9, "isra": 17, "baniisrail": 17, "mariam": 19, "taha": 20,
    "hajj": 22, "muminun": 23, "nur": 24, "furqan": 25, "shuara": 26, "naml": 27, "qasas": 28, "ankabut": 29,
    "rum": 30, "luqman": 31, "sajda": 32, "ahzab": 33, "saba": 34, "fatir": 35, "yasin": 36, "yaseen": 36,
    "safat": 37, "sad": 38, "zumar": 39, "mumin": 40, "ghafir": 40, "fusilat": 41, "hamimsajda": 41,
    "shura": 42, "zukhruf": 43, "dukhan": 44, "jathiya": 45, "ahqaf": 46, "fath": 48, "hujurat": 49,
    "dhariyat": 51, "tur": 52, "najm": 53, "qamar": 54, "rahman": 55, "waqia": 56, "hadid": 57,
    "mujadila": 58, "hashr": 59, "mumtahina": 60, "saf": 61, "jumua": 62, "jumuah": 62, "munafiqun": 63,
    "taghabun": 64, "talaq": 65, "tahrim": 66, "mulk": 67, "qalam": 68, "haqa": 69, "maarij": 70,
    "muzamil": 73, "mudathir": 74, "qiyama": 75, "insan": 76, "dahr": 76, "mursalat": 77, "naba": 78,
    "naziat": 79, "abasa": 80, "takwir": 81, "infitar": 82, "mutafifin": 83, "inshiqaq": 84, "buruj": 85,
    "tariq": 86, "ala": 87, "ghashiya": 88, "fajr": 89, "balad": 90, "shams": 91, "lail": 92, "layl": 92,
    "duha": 93, "sharh": 94, "inshirah": 94, "tin": 95, "alaq": 96, "qadr": 97, "bayina": 98, "zalzala": 99,
    "adiyat": 100, "qaria": 101, "takathur": 102, "asr": 103, "humaza": 104, "fil": 105, "quraish": 106,
    "quraysh": 106, "maun": 107, "kauthar": 108, "kawthar": 108, "kafirun": 109, "nasr": 110, "masad": 111,
    "lahab": 111, "ikhlas": 112, "falaq": 113, "nas": 114,
};
for (const [alias, n] of Object.entries(ALIASES)) SURAH_BY_NAME.set(nameKey(alias), n);

export function surahFromName(raw: string): number | undefined {
    // The name pattern can pick up a word before the name ("and Al-Baqarah"), so try shorter tails too.
    const words = raw.trim().split(/\s+/);
    for (let i = 0; i < words.length; i++) {
        const n = SURAH_BY_NAME.get(nameKey(words.slice(i).join(" ")));
        if (n) return n;
    }
    return undefined;
}

const NUM = String.raw`(\d{1,3})\s*[:.]\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?`;
// Bare "(3.5)" is too often a number, so citations without "Quran" or a surah name need a colon.
const NUM_COLON = String.raw`(\d{1,3})\s*:\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?`;
const NAME = String.raw`((?:[Aa][a-z]{0,2}[-\s'’])?[A-Z][A-Za-z'’ʿʾāīūḥṣḍṭẓ]*(?:[-\s'’][A-Za-z'’ʿʾāīūḥṣḍṭẓ]+)?)`;
const VERSE_WORD = String.raw`(?:verses?|ayahs?|ayat|ayas?|āyah|v\.)`;
const REF_PATTERNS: { re: RegExp; kind: "num" | "name-num" | "name-verse" }[] = [
    { re: new RegExp(String.raw`\b(?:Qur['’]?an|Q)\.?\s*,?\s*` + NUM + String.raw`(?!\s*[AaPp]\.?[Mm]\b)`, "g"), kind: "num" },
    { re: new RegExp(String.raw`[(\[]` + NUM_COLON + String.raw`[)\]]`, "g"), kind: "num" },
    // Case-insensitive so "surah al-ikhlas 1" counts; the name must still resolve to a real surah.
    { re: new RegExp(String.raw`(?:\b(?:Surah|Surat|Sura)\s+)?` + NAME + String.raw`[,]?\s*[(\[]?` + NUM_COLON, "gi"), kind: "name-num" },
    { re: new RegExp(String.raw`\b(?:Surah|Surat|Sura)\s+` + NAME + String.raw`[,]?\s*(?:` + VERSE_WORD + String.raw`\s*)?(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?\b(?!\s*:)`, "gi"), kind: "name-verse" },
];

export function findReferences(text: string): Reference[] {
    const found: Reference[] = [];
    for (const { re, kind } of REF_PATTERNS) {
        re.lastIndex = 0;
        for (let m: RegExpExecArray | null; (m = re.exec(text)); ) {
            let ref: Reference | undefined;
            if (kind === "num") {
                const [s, a, b] = [m[1], m[2], m[3]].map((x) => (x ? Number(x) : undefined));
                const digits = m[0].search(/\d/);
                ref = { start: m.index, end: m.index + m[0].length, surah: s!, ayahStart: a!, ayahEnd: b ?? a!, numStart: m.index + digits, numEnd: m.index + m[0].replace(/[)\]]$/, "").length };
            } else if (kind === "name-num") {
                const named = surahFromName(m[1]);
                const hasSurahWord = /^(?:Surah|Surat|Sura)\s/i.test(m[0]);
                // "Al-Baqarah 2:255" counts; an arbitrary capitalised word before "3:4" does not.
                if (!named && !hasSurahWord) continue;
                const [s, a, b] = [m[2], m[3], m[4]].map((x) => (x ? Number(x) : undefined));
                const end = m.index + m[0].length;
                const numLength = m[0].match(new RegExp(NUM_COLON + "$"))![0].length;
                ref = { start: m.index, end, surah: s!, ayahStart: a!, ayahEnd: b ?? a!, namedSurah: named, numStart: end - numLength, numEnd: end };
            } else {
                const named = surahFromName(m[1]);
                if (!named) continue;
                const a = Number(m[2]);
                ref = { start: m.index, end: m.index + m[0].length, surah: named, ayahStart: a, ayahEnd: m[3] ? Number(m[3]) : a, namedSurah: named };
            }
            found.push(ref);
        }
    }
    // Overlapping matches from different patterns: keep the earliest, then the longest.
    found.sort((x, y) => x.start - y.start || y.end - x.end);
    const out: Reference[] = [];
    for (const r of found) {
        if (out.length && r.start < out[out.length - 1].end) continue;
        r.problem = referenceProblem(r);
        out.push(r);
    }
    return out;
}

function referenceProblem(r: Reference): string | undefined {
    const surah = SURAHS[r.surah - 1];
    if (!surah) return `There is no surah ${r.surah} in the Quran.`;
    if (r.ayahStart < 1 || r.ayahEnd > surah[1] || r.ayahEnd < r.ayahStart)
        return `Surah ${surah[0]} has ${surah[1]} verses, so ${refLabel(r)} does not exist.`;
    if (r.namedSurah && r.namedSurah !== r.surah)
        return `The surah name and number do not match (Surah ${SURAHS[r.namedSurah - 1][0]} is surah ${r.namedSurah}).`;
    return undefined;
}

function refLabel(r: { surah: number; ayahStart: number; ayahEnd: number }): string {
    return r.ayahEnd !== r.ayahStart ? `${r.surah}:${r.ayahStart}-${r.ayahEnd}` : `${r.surah}:${r.ayahStart}`;
}

function rangeKeys(surah: number, from: number, to: number): string[] {
    const count = SURAHS[surah - 1]?.[1] ?? 0;
    const keys: string[] = [];
    for (let a = Math.max(1, from); a <= Math.min(to, count); a++) keys.push(`${surah}:${a}`);
    return keys;
}

export function referenceKeys(r: Reference): string[] {
    return r.problem ? [] : rangeKeys(r.surah, r.ayahStart, r.ayahEnd);
}

// ─────────────────────────────── Arabic passages ───────────────────────────────

export interface Passage {
    start: number;
    end: number;
    text: string;
    words: string[];
    /** Fewer than three words: checked against its own citation only, never searched or rewritten. */
    short?: boolean;
}

// A citation straight after the Arabic, e.g. "ٱلرَّحْمَٰنُ (Quran 55:1)".
const CITATION_NEXT = /^[\s*_"'”»)\]]*[(\[]?\s*(?:Qur['’]?an|Q\b|Surah|Surat|Sura|\d{1,3}\s*:)/i;

export function findArabicPassages(text: string): Passage[] {
    const out: Passage[] = [];
    ARABIC_RUN.lastIndex = 0;
    for (let m: RegExpExecArray | null; (m = ARABIC_RUN.exec(text)); ) {
        const words = modelWords(m[0]);
        const end = m.index + m[0].length;
        // One or two words are only a quote when a citation follows at once; otherwise they are terms like تقوى.
        const short = words.length > 0 && words.length < MIN_QUOTE_WORDS && CITATION_NEXT.test(text.slice(end, end + 24));
        if (words.length >= MIN_QUOTE_WORDS || short) out.push({ start: m.index, end, text: m[0], words, short });
    }
    return out;
}

// ─────────────────────────────── Matching ───────────────────────────────

interface CanonSeq {
    words: string[][]; // comparison variants per position
    display: string[]; // canonical words as written (pause marks kept with the word before)
    keys: string[]; // verse key per position
}

function tokens(text: string): { display: string; forms: string[] }[] {
    const out: { display: string; forms: string[] }[] = [];
    for (const raw of text.trim().split(/\s+/)) {
        const forms = variants(raw).filter(Boolean);
        if (forms.length) out.push({ display: raw, forms });
        else if (out.length) out[out.length - 1].display += " " + raw; // pause mark or verse sign
    }
    return out;
}

/** Up to two sequences: Uthmani (merged with Imla'i spelling per word when they align) and plain Imla'i. */
function canonSequences(keys: string[], verses: Map<string, VerseText>): CanonSeq[] {
    const primary: CanonSeq = { words: [], display: [], keys: [] };
    const imlaei: CanonSeq = { words: [], display: [], keys: [] };
    let imlaeiComplete = true;
    for (const key of keys) {
        const v = verses.get(key);
        if (!v) continue;
        const u = tokens(v.uthmani);
        const i = v.imlaei ? tokens(v.imlaei) : undefined;
        u.forEach((t, n) => {
            const forms = i && i.length === u.length ? [...new Set([...t.forms, ...i[n].forms])] : t.forms;
            primary.words.push(forms);
            primary.display.push(t.display);
            primary.keys.push(key);
        });
        if (!i) imlaeiComplete = false;
        else
            i.forEach((t) => {
                imlaei.words.push(t.forms);
                imlaei.display.push(t.display);
                imlaei.keys.push(key);
            });
    }
    return imlaeiComplete && imlaei.words.length ? [primary, imlaei] : [primary];
}

interface Match {
    seq: CanonSeq;
    start: number;
    end: number; // exclusive
    distance: number;
}

/** Best approximate occurrence of the model's words inside a canonical sequence (word-level edit distance). */
function bestMatch(words: string[], seq: CanonSeq): Match | undefined {
    const n = seq.words.length;
    const m = words.length;
    if (!n) return undefined;
    let prev = new Array<number>(n + 1).fill(0);
    let prevStart = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
        const cur = new Array<number>(n + 1);
        const curStart = new Array<number>(n + 1);
        cur[0] = i;
        curStart[0] = 0;
        for (let j = 1; j <= n; j++) {
            const same = seq.words[j - 1].includes(words[i - 1]) ? 0 : 1;
            let best = prev[j - 1] + same;
            let start = prevStart[j - 1];
            if (prev[j] + 1 < best) [best, start] = [prev[j] + 1, prevStart[j]];
            if (cur[j - 1] + 1 < best) [best, start] = [cur[j - 1] + 1, curStart[j - 1]];
            cur[j] = best;
            curStart[j] = start;
        }
        prev = cur;
        prevStart = curStart;
    }
    let bestJ = 1;
    for (let j = 2; j <= n; j++) if (prev[j] < prev[bestJ]) bestJ = j;
    return { seq, start: prevStart[bestJ], end: bestJ, distance: prev[bestJ] };
}

function bestOf(words: string[], seqs: CanonSeq[]): Match | undefined {
    let best: Match | undefined;
    for (const s of seqs) {
        const m = bestMatch(words, s);
        if (m && (!best || m.distance < best.distance)) best = m;
    }
    return best;
}

/** Close enough to treat as a misquote of this exact place: at most a quarter of the words differ. */
function isNear(words: string[], m: Match): boolean {
    const allowed = Math.max(1, Math.floor(words.length * 0.25));
    return words.length >= 4 && m.distance <= allowed && Math.abs(m.end - m.start - words.length) <= allowed;
}

function matchRef(m: Match): string {
    const first = m.seq.keys[m.start];
    const last = m.seq.keys[m.end - 1];
    if (first === last) return first;
    const [s1, a1] = first.split(":");
    const [s2, a2] = last.split(":");
    return s1 === s2 ? `${s1}:${a1}-${a2}` : `${first}-${last}`;
}

function matchText(m: Match): string {
    return m.seq.display.slice(m.start, m.end).join(" ");
}

// ─────────────────────────────── Checking a block of text ───────────────────────────────

export interface CheckResult {
    text: string;
    quotes: QuoteCheck[];
    refs: Reference[];
}

const LOOKUP_FAILED = "The Quran text could not be checked right now.";

/** Quick test used by the stream gate: Arabic that may be a quote but has no citation in this block yet. */
export function hasUncitedArabic(text: string): boolean {
    return HAS_ARABIC.test(text) && findArabicPassages(text).length > 0 && findReferences(text).length === 0;
}

export function hasQuranContent(text: string): boolean {
    return findReferences(text).length > 0 || (HAS_ARABIC.test(text) && findArabicPassages(text).length > 0);
}

export async function checkQuranQuotes(
    text: string,
    lookup: QuranLookup,
    contextRefs: Reference[] = [],
): Promise<CheckResult> {
    const refs = findReferences(text);
    const passages = HAS_ARABIC.test(text) ? findArabicPassages(text) : [];
    if (!refs.length && !passages.length) return { text, quotes: [], refs };

    // Each passage is checked against the nearest citation after it, else before it, else the previous block's.
    const cited = new Map<Passage, Reference | undefined>();
    passages.forEach((p, i) => {
        const next = passages[i + 1]?.start ?? Infinity;
        const prevEnd = passages[i - 1]?.end ?? -Infinity;
        const after = refs.find((r) => r.start >= p.end && r.start < next);
        const before = [...refs].reverse().find((r) => r.end <= p.start && r.end > prevEnd);
        cited.set(p, after ?? before ?? contextRefs[contextRefs.length - 1]);
    });

    let verses = new Map<string, VerseText>();
    let lookupFailed = false;
    const wanted = new Set<string>();
    for (const r of cited.values()) if (r) referenceKeys(r).forEach((k) => wanted.add(k));
    try {
        if (wanted.size) verses = await lookup.verses([...wanted]);
    } catch {
        lookupFailed = true;
    }

    const replacements: { start: number; end: number; text: string }[] = [];
    const refStatus = new Map<Reference, QuoteCheck>();
    const items: { at: number; quote: QuoteCheck }[] = [];

    for (const p of passages) {
        const ref = cited.get(p);
        const refInBlock = ref && refs.includes(ref) ? ref : undefined;
        const citedKeys = ref ? referenceKeys(ref) : [];
        const add = (quote: QuoteCheck) => items.push({ at: p.start, quote });

        if (lookupFailed) {
            add({ kind: "arabic", status: "unverified", text: p.text, reference: ref && refLabel(ref), note: LOOKUP_FAILED });
            continue;
        }

        const citedMatch = citedKeys.length ? bestOf(p.words, canonSequences(citedKeys, verses)) : undefined;
        if (citedMatch && citedMatch.distance === 0) {
            add({ kind: "arabic", status: "verified", text: p.text, reference: matchRef(citedMatch) });
            continue;
        }

        if (p.short) {
            add({ kind: "arabic", status: "unverified", text: p.text, reference: ref && refLabel(ref), note: ref ? `Could not verify: this Arabic does not match Quran ${refLabel(ref)}.` : "Could not verify this Arabic." });
            continue;
        }

        let found: { exact?: Match; near?: Match; ambiguous: boolean };
        try {
            found = await searchElsewhere(p.words, lookup);
        } catch {
            add({ kind: "arabic", status: "unverified", text: p.text, reference: ref && refLabel(ref), note: LOOKUP_FAILED });
            continue;
        }

        if (found.exact && !ref) {
            add({ kind: "arabic", status: "verified", text: p.text, reference: matchRef(found.exact) });
            continue;
        }
        const actual = found.exact && matchRef(found.exact);
        // Never move a citation out of the surah it names: "Al-Baqarah 112:1" would be worse than flagging it.
        const sameNamedSurah = !ref?.namedSurah || (actual && Number(actual.split(":")[0]) === ref.namedSurah);
        if (actual && ref && actual !== refLabel(ref) && sameNamedSurah && !found.ambiguous && p.words.length >= MIN_WORDS_TO_MOVE_REFERENCE) {
            if (refInBlock && refInBlock.numStart !== undefined && refInBlock.numEnd !== undefined) {
                replacements.push({ start: refInBlock.numStart, end: refInBlock.numEnd, text: actual });
                refStatus.set(refInBlock, {
                    kind: "reference",
                    status: "corrected",
                    text: text.slice(refInBlock.start, refInBlock.numStart) + actual + text.slice(refInBlock.numEnd, refInBlock.end),
                    original: text.slice(refInBlock.numStart, refInBlock.numEnd),
                    reference: actual,
                    note: `Reference corrected from ${refLabel(refInBlock)} to ${actual} to match the Arabic quoted.`,
                });
                add({ kind: "arabic", status: "verified", text: p.text, reference: actual });
            } else {
                add({ kind: "arabic", status: "verified", text: p.text, reference: actual, note: `This passage is Quran ${actual}${ref ? `, not ${refLabel(ref)}` : ""}.` });
            }
            continue;
        }
        if (citedMatch && isNear(p.words, citedMatch)) {
            const exact = matchText(citedMatch);
            const at = matchRef(citedMatch);
            replacements.push({ start: p.start, end: p.end, text: exact });
            add({ kind: "arabic", status: "corrected", text: exact, original: p.text, reference: at, note: `Arabic replaced with the exact text of Quran ${at}.` });
            continue;
        }
        if (!ref && !found.near && !found.exact) continue; // Arabic that is not presented as Quran (a dua or hadith, say).
        const close = found.near ? matchRef(found.near) : undefined;
        add({
            kind: "arabic",
            status: "unverified",
            text: p.text,
            reference: ref ? refLabel(ref) : close,
            note: ref
                ? `Could not verify: this Arabic does not match Quran ${refLabel(ref)}.`
                : `Could not verify: close to Quran ${close} but not exact.`,
        });
    }

    for (const r of refs) {
        const label = text.slice(r.start, r.end);
        const quote: QuoteCheck =
            refStatus.get(r) ??
            (r.problem
                ? { kind: "reference", status: "unverified", text: label, reference: refLabel(r), note: `Could not verify: ${r.problem}` }
                : { kind: "reference", status: "verified", text: label, reference: refLabel(r) });
        items.push({ at: r.start, quote });
    }

    let out = text;
    for (const r of replacements.sort((a, b) => b.start - a.start)) out = out.slice(0, r.start) + r.text + out.slice(r.end);
    items.sort((a, b) => a.at - b.at);
    return { text: out, quotes: items.map((i) => i.quote), refs };
}

/** Looks the passage up by text, then confirms each hit (with its neighbours, for quotes that run over a verse end). */
async function searchElsewhere(words: string[], lookup: QuranLookup): Promise<{ exact?: Match; near?: Match; ambiguous: boolean }> {
    const hits = (await lookup.search(words.slice(0, 10).join(" "))).slice(0, 5);
    if (!hits.length) return { ambiguous: false };
    const windows = hits.map((k) => {
        const [s, a] = k.split(":").map(Number);
        return rangeKeys(s, a - 1, a + 1);
    });
    const verses = await lookup.verses([...new Set(windows.flat())]);
    const exact = new Map<string, Match>();
    let near: Match | undefined;
    for (const keys of windows) {
        const m = bestOf(words, canonSequences(keys, verses));
        if (!m) continue;
        if (m.distance === 0) exact.set(matchRef(m), m);
        else if (isNear(words, m) && (!near || m.distance < near.distance)) near = m;
    }
    const first = exact.values().next().value as Match | undefined;
    return { exact: first, near, ambiguous: exact.size > 1 };
}

// ─────────────────────────────── Streaming gate ───────────────────────────────

function isLeadIn(unit: string): boolean {
    return /:\s*$/.test(unit) && findReferences(unit).length > 0;
}

/**
 * Sits between the model's text stream and the client. Text is released a paragraph at a time,
 * and any paragraph with a citation or Arabic is checked first. Arabic with no citation is held
 * until the next paragraph so a citation on the following line still counts.
 */
export class QuoteStream {
    readonly quotes: QuoteCheck[] = [];
    private buffer = "";
    private held = "";
    private heldCount = 0;
    private chain: Promise<void> = Promise.resolve();
    private lastRefs: Reference[] = [];
    private leadIn = false;

    constructor(
        private readonly lookup: QuranLookup,
        private readonly emit: (text: string) => void,
    ) {}

    push(delta: string): void {
        this.buffer += delta;
        for (let i = this.buffer.indexOf("\n\n"); i !== -1; i = this.buffer.indexOf("\n\n")) {
            let end = i;
            while (this.buffer[end] === "\n") end++;
            const paragraph = this.buffer.slice(0, end);
            this.buffer = this.buffer.slice(end);
            this.paragraph(paragraph);
        }
    }

    /** Releases everything still buffered and resolves once it has all been checked and emitted. */
    async flush(): Promise<void> {
        const rest = this.held + this.buffer;
        this.held = "";
        this.heldCount = 0;
        this.buffer = "";
        if (rest) this.enqueue(rest);
        await this.chain;
    }

    private paragraph(p: string): void {
        const unit = this.held + p;
        // Arabic straight after a lead-in citation belongs to it, so there is nothing to wait for.
        if (hasUncitedArabic(p) && !this.leadIn && this.heldCount < 3) {
            this.held = unit;
            this.heldCount++;
            return;
        }
        this.held = "";
        this.heldCount = 0;
        this.enqueue(unit);
    }

    private enqueue(unit: string): void {
        this.leadIn = isLeadIn(unit);
        // Start the verse fetches now so they overlap with the model writing the next paragraph.
        const keys = HAS_ARABIC.test(unit) ? findReferences(unit).flatMap(referenceKeys) : [];
        const prefetch = keys.length ? this.lookup.verses(keys).catch(() => undefined) : undefined;
        this.chain = this.chain.then(async () => {
            await prefetch;
            if (!hasQuranContent(unit)) {
                this.lastRefs = [];
                this.emit(unit);
                return;
            }
            try {
                const result = await checkQuranQuotes(unit, this.lookup, this.lastRefs);
                this.quotes.push(...result.quotes);
                // A citation carries over only from a lead-in line such as "Allah says (Quran 112:1):".
                this.lastRefs = isLeadIn(unit) ? result.refs.filter((r) => !r.problem) : [];
                this.emit(result.text);
            } catch {
                this.quotes.push({ kind: "reference", status: "unverified", text: unit.trim().slice(0, 80), note: LOOKUP_FAILED });
                this.emit(unit);
            }
        });
    }
}

// ─────────────────────────────── Quran.com lookup ───────────────────────────────

const QURAN_API = "https://api.quran.com/api/v4";
const CACHE_LIMIT = 4000;
const verseCache = new Map<string, Promise<VerseText | undefined>>();

/** Lets verses already fetched by a tool call skip a second request. */
export function seedVerse(key: string, text: VerseText): void {
    if (text.uthmani && text.imlaei && !verseCache.has(key)) verseCache.set(key, Promise.resolve(text));
}

export function createQuranComLookup(fetchImpl: typeof fetch = fetch): QuranLookup {
    const get = async (path: string): Promise<any> => {
        const res = await fetchImpl(`${QURAN_API}${path}`, {
            signal: AbortSignal.timeout(5000),
            // Quran text never changes; let Cloudflare's edge cache hold it for a week.
            cf: { cacheTtl: 604800, cacheEverything: true },
        } as RequestInit);
        if (!res.ok) throw new Error(`Quran.com ${res.status}`);
        return res.json();
    };

    const fetchBatch = async (query: string): Promise<Map<string, VerseText>> => {
        const [u, i] = await Promise.all([get(`/quran/verses/uthmani?${query}`), get(`/quran/verses/imlaei?${query}`)]);
        const out = new Map<string, VerseText>();
        for (const v of u.verses ?? []) out.set(v.verse_key, { uthmani: v.text_uthmani });
        for (const v of i.verses ?? []) {
            const e = out.get(v.verse_key);
            if (e) e.imlaei = v.text_imlaei;
        }
        return out;
    };

    return {
        async verses(keys) {
            if (verseCache.size > CACHE_LIMIT) verseCache.clear();
            // One request pair per surah: a single verse by key, several by fetching the surah.
            const missing = new Map<number, string[]>();
            for (const key of keys) {
                if (verseCache.has(key)) continue;
                const s = Number(key.split(":")[0]);
                missing.set(s, [...(missing.get(s) ?? []), key]);
            }
            for (const [surah, list] of missing) {
                const batch = fetchBatch(list.length === 1 ? `verse_key=${list[0]}` : `chapter_number=${surah}`);
                const all = list.length === 1 ? list : rangeKeys(surah, 1, SURAHS[surah - 1][1]);
                for (const key of all) {
                    if (verseCache.has(key)) continue;
                    const p = batch.then((m) => m.get(key));
                    verseCache.set(key, p);
                    // A failed request or a verse missing from the reply must not poison the cache.
                    p.then((v) => v || verseCache.delete(key), () => verseCache.delete(key));
                }
            }
            const out = new Map<string, VerseText>();
            await Promise.all(
                keys.map(async (k) => {
                    const v = await verseCache.get(k);
                    if (v) out.set(k, v);
                }),
            );
            return out;
        },
        async search(query) {
            const d = await get(`/search?q=${encodeURIComponent(query)}&size=5`);
            return ((d.search?.results ?? []) as { verse_key: string }[]).map((r) => r.verse_key);
        },
    };
}
