// Finds Quran and hadith references in an Ask Wali answer so they can be opened.
import { HADITH_COLLECTION_NAMES } from "@/lib/hadith";
import { getSurah } from "@/lib/surah-list";

export type AskSource =
    | { kind: "hadith"; citation: string; grading?: string }
    | { kind: "tafsir"; name: string; reference: string };

export interface Citation {
    kind: "quran" | "hadith";
    /** Where the linkable text starts and ends. */
    start: number;
    end: number;
    text: string;
    to: string;
}

const plain = (s: string) => s.toLowerCase().replace(/[`'’‘ʿʾ]/g, "").replace(/\s+/g, " ").trim();
const SLUG_BY_NAME = new Map(Object.entries(HADITH_COLLECTION_NAMES).map(([slug, name]) => [plain(name), slug]));
const NAMES = Object.values(HADITH_COLLECTION_NAMES)
    .sort((a, b) => b.length - a.length)
    .map((n) => n.replace(/'/g, "[`'’‘ʿʾ]?").replace(/\s+/g, "\\s+"))
    .join("|");
const HADITH_RE = new RegExp(`(${NAMES}),?\\s+(?:(?:no\\.|number|hadith)\\s*)?#?(\\d{1,5}[a-z]?)\\b`, "gi");
// No lookbehind: older iPhones cannot parse it.
const QURAN_RE = /(\bQur['’]?an\s+|[([;]\s?)(\d{1,3}):(\d{1,3})(?:\s*[-–]\s*\d{1,3})?(?!\d|:)/gi;

function matches(re: RegExp, text: string): RegExpExecArray[] {
    const out: RegExpExecArray[] = [];
    re.lastIndex = 0;
    for (let m = re.exec(text); m; m = re.exec(text)) out.push(m);
    return out;
}

export function findCitations(text: string): Citation[] {
    const found: Citation[] = [];
    for (const m of matches(HADITH_RE, text)) {
        const slug = SLUG_BY_NAME.get(plain(m[1]));
        if (slug) found.push({ kind: "hadith", start: m.index, end: m.index + m[0].length, text: m[0], to: `/hadith?collection=${slug}&hadith=${m[2].toLowerCase()}` });
    }
    for (const m of matches(QURAN_RE, text)) {
        const surah = Number(m[2]);
        const ayah = Number(m[3]);
        // A leading bracket or semicolon is not part of the link; the word "Quran" is.
        const skip = /^[([;]/.test(m[1]) ? m[1].length : 0;
        const info = surah >= 1 && surah <= 114 ? getSurah(surah) : undefined;
        if (info && ayah >= 1 && ayah <= info.ayahs) {
            found.push({ kind: "quran", start: m.index + skip, end: m.index + m[0].length, text: m[0].slice(skip), to: `/quran/${surah}/${ayah}` });
        }
    }
    return found.sort((a, b) => a.start - b.start);
}

const hadithKey = (to: string) => to.slice(to.indexOf("?"));

/** Hadith cited in the answer, each with what was looked up for it (none if nothing was). */
export function checkHadith(text: string, sources: AskSource[]): { citation: Citation; source?: AskSource & { kind: "hadith" } }[] {
    const known = new Map<string, AskSource & { kind: "hadith" }>();
    for (const s of sources) {
        if (s.kind !== "hadith") continue;
        const c = findCitations(s.citation).find((x) => x.kind === "hadith");
        if (!c) continue;
        known.set(hadithKey(c.to), s);
    }
    const seen = new Set<string>();
    const out: { citation: Citation; source?: AskSource & { kind: "hadith" } }[] = [];
    for (const citation of findCitations(text)) {
        if (citation.kind !== "hadith") continue;
        const key = hadithKey(citation.to);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ citation, source: known.get(key) });
    }
    return out;
}
