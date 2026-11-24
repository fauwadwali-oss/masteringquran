// Hadith numbering, gradings and search, shared by the site and the Ask Wali function.
// Keep this file free of "@/" imports and browser APIs so functions/ can import it.

/** Pinned to a commit so source text can only change through a reviewed code change. */
export const ISLAMIC_DATA_BASE =
    "https://cdn.jsdelivr.net/gh/fauwadwali-oss/nwv-islamic-data@938def77f89802b9a6781d65e1e01e8a33f4e70a";

export const HADITH_COLLECTION_NAMES: Record<string, string> = {
    bukhari: "Sahih al-Bukhari",
    muslim: "Sahih Muslim",
    abudawud: "Sunan Abi Dawud",
    tirmidhi: "Jami' at-Tirmidhi",
    nasai: "Sunan an-Nasa'i",
    ibnmajah: "Sunan Ibn Majah",
    malik: "Muwatta Malik",
    nawawi: "40 Hadith of an-Nawawi",
    qudsi: "40 Hadith Qudsi",
    dehlawi: "40 Hadith of Shah Waliullah",
};

export interface HadithGrade {
    name?: string;
    grade?: string;
}

export interface HadithRecord {
    /** The dataset's running index. For Sahih Muslim this is NOT the published number. */
    hadithnumber: number | string;
    /** Published number; "1907.01" means 1907a. Missing on some Sahih Muslim entries. */
    arabicnumber?: number | string;
    text: string;
    grades?: HadithGrade[];
    reference?: { book: number; hadith: number };
}

/** The number readers know the hadith by ("1907a"), or null when the source has none. */
export function publishedNumber(h: Pick<HadithRecord, "hadithnumber" | "arabicnumber">, collection: string): string | null {
    if (collection !== "muslim") return String(h.hadithnumber);
    if (h.arabicnumber === undefined || h.arabicnumber === null || h.arabicnumber === "") return null;
    const [base, part] = String(h.arabicnumber).split(".");
    if (!part) return base;
    const n = parseInt(part.padEnd(2, "0"), 10);
    return n >= 1 && n <= 26 ? `${base}${String.fromCharCode(96 + n)}` : base;
}

export function hadithCitation(h: HadithRecord, collection: string): string {
    const number = publishedNumber(h, collection);
    const name = HADITH_COLLECTION_NAMES[collection] ?? collection;
    return number ? `${name} ${number}` : `${name} (no published number in this edition)`;
}

/** Collections whose numbers match sunnah.com's. Muwatta Malik and the Forty collections are numbered differently there. */
const SUNNAH_COLLECTIONS = new Set(["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah"]);

export function sunnahUrl(h: HadithRecord, collection: string): string | null {
    const number = publishedNumber(h, collection);
    return number && SUNNAH_COLLECTIONS.has(collection) ? `https://sunnah.com/${collection}:${number}` : null;
}

/** Does this entry carry the published number asked for? "1907" matches 1907, 1907a, 1907b… */
export function matchesPublishedNumber(h: HadithRecord, collection: string, wanted: string | number): boolean {
    const number = publishedNumber(h, collection);
    if (!number) return false;
    const w = String(wanted).trim().toLowerCase();
    return number === w || (/^\d+$/.test(w) && number.replace(/[a-z]$/, "") === w);
}

const WEAK = /\b(?:da'?if|weak|mawdu'?|maudu'?|fabricated|munkar|shadh|batil)\b/i;
const FABRICATED = /\b(?:mawdu'?|maudu'?|fabricated|batil)\b/i;
const SOUND = /\b(?:sahih|hasan)\b/i;

export type GradeSummary = "sound" | "weak" | "fabricated" | "differs" | "ungraded";

/** What the graders recorded in the source dataset say, taken together. */
export function gradeSummary(grades: HadithGrade[] | undefined): GradeSummary {
    const labels = (grades ?? []).map((g) => g.grade ?? "").filter((g) => WEAK.test(g) || SOUND.test(g));
    if (!labels.length) return "ungraded";
    const weak = labels.filter((g) => WEAK.test(g));
    if (!weak.length) return "sound";
    if (weak.length < labels.length) return "differs";
    return weak.every((g) => FABRICATED.test(g)) ? "fabricated" : "weak";
}

export const GRADE_SUMMARY_LABEL: Record<GradeSummary, string> = {
    sound: "Graded sahih or hasan",
    weak: "Graded weak (da'if)",
    fabricated: "Graded fabricated (mawdu')",
    differs: "Scholars differ: some grade it weak",
    ungraded: "No grading in this dataset",
};

const STOP = new Set("a an the of in on to for and or is are was be about what does do say says hadith prophet value find with from by that this".split(" "));
const stem = (w: string) => w.replace(/(?:ies)$/, "y").replace(/(?:s)$/, "");

/** Matches the exact phrase first, then entries containing every meaningful word. */
export function searchHadith<T extends { text?: string }>(list: T[], query: string, limit = 5): T[] {
    const phrase = query.trim().toLowerCase();
    if (!phrase) return [];
    const withText = list.filter((h) => h.text?.trim());
    const exact = withText.filter((h) => h.text!.toLowerCase().includes(phrase));
    if (exact.length >= limit) return exact.slice(0, limit);
    const words = phrase.split(/[^a-z0-9']+/).filter((w) => w.length > 2 && !STOP.has(w)).map(stem);
    if (!words.length) return exact.slice(0, limit);
    const seen = new Set(exact);
    const rest = withText.filter((h) => {
        if (seen.has(h)) return false;
        const t = h.text!.toLowerCase();
        return words.every((w) => t.includes(w));
    });
    return [...exact, ...rest].slice(0, limit);
}
