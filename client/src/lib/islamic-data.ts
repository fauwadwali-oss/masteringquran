// Our own sourced datasets for the 99 Names and the duas. Every Arabic, English and
// transliteration text is an exact excerpt of a cited source; see
// scripts/islamic-data/build_names.py and build_duas.py for how they are built and checked.
import namesData from "@/data/names.json";
import duasData from "@/data/duas.json";

export interface DivineName {
    number: number;
    arabic: string;
    transliteration: string;
    /** null when no reliable sourced English rendering is available. */
    english: string | null;
    englishSource: string | null;
    /** The Prophet's explanation of the name (Sahih Muslim 2713), when available. */
    explanation?: string;
}

export interface Dua {
    id: string;
    category: string;
    title: string;
    arabic: string;
    translation?: string;
    transliteration?: string;
    reference: string;
    url: string;
    grades: string[];
    gradingDiffers: boolean;
    englishEdition: string;
    count?: number;
    narrationOmitted?: boolean;
}

export interface DuaCategory {
    id: string;
    name: string;
}

export const NAMES = namesData.names as DivineName[];
export const NAMES_SOURCE = namesData.source;
export const DUAS = duasData.duas as Dua[];
export const DUA_CATEGORIES = duasData.categories as DuaCategory[];

const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function searchDuas(query: string): Dua[] {
    const q = fold(query.trim());
    if (!q) return [];
    return DUAS.filter((d) =>
        [d.title, d.translation, d.transliteration, d.reference].some((t) => t && fold(t).includes(q)),
    );
}
