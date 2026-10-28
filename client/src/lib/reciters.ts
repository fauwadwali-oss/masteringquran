// Reciter catalogue, reviewed against the Quran.com API (Oct 2026).
// Data: client/src/data/reciters.json. Re-check with `node scripts/reciters/verify.mjs`.
//
// - verseAudioId: v4 `recitations/{id}` (one file per verse).
// - chapterAudioId: v4 `chapter_recitations/{id}` and QDC `audio/reciters/{id}` (one file per surah).
// - wordTimings: QDC chapter audio has word segments for every verse.
// - "slow": whole-surah audio for surahs 1, 18, 36, 67, 78 and 112 runs at least 1.35x
//   the murattal median (about 64 minutes). Al-Husary 90, Al-Husary teaching 102.
//   Mujawwad is slow by nature and has its own filter instead.
//
// Left out, because verse AND chapter audio must both work:
// - 8 Al-Minshawi (Mujawwad): chapter files return 404.
// - 11 Mohamed al-Tablawi: chapter audio is a different reciter (Abdul Muhsin al-Qasim).
// - 97 Yasser ad-Dussary, 161 Khalifah Al Tunaiji, 168 Al-Minshawi with children,
//   173 Alafasy (streaming): chapter audio only, no verse files.
import data from "@/data/reciters.json";

export type ReciterStyle = "murattal" | "mujawwad" | "muallim";
export type ReciterTag = "slow" | "verse-by-verse" | "children";

export interface Reciter {
    /** Saved in mq-player-settings. Matches the old v4 recitation ids, so saved choices keep working. */
    id: string;
    verseAudioId: number;
    chapterAudioId: number;
    name: string;
    arabicName: string;
    style: ReciterStyle;
    tags: ReciterTag[];
    wordTimings: boolean;
}

export const RECITERS = data as Reciter[];

export const DEFAULT_RECITER = "3";

export type ReciterFilter = "all" | "slow" | "learning" | "mujawwad";

export const RECITER_FILTERS: { id: ReciterFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "slow", label: "Slow" },
    { id: "learning", label: "For learning" },
    { id: "mujawwad", label: "Mujawwad" },
];

export function matchesFilter(r: Reciter, filter: ReciterFilter): boolean {
    switch (filter) {
        case "slow": return r.tags.includes("slow");
        case "learning": return r.tags.includes("verse-by-verse") || r.tags.includes("children");
        case "mujawwad": return r.style === "mujawwad";
        default: return true;
    }
}

export function getReciter(id: string): Reciter {
    return RECITERS.find((r) => r.id === id) ?? RECITERS.find((r) => r.id === DEFAULT_RECITER)!;
}

export const verseAudioId = (id: string) => getReciter(id).verseAudioId;
export const chapterAudioId = (id: string) => getReciter(id).chapterAudioId;

export function reciterName(id: string): string {
    return RECITERS.find((r) => r.id === id)?.name ?? "Quran recitation";
}

/** Short labels shown next to a reciter in the picker. */
export function reciterBadges(r: Reciter): string[] {
    const badges: string[] = [];
    if (r.style === "muallim") badges.push("Teaching");
    if (r.style === "mujawwad") badges.push("Mujawwad");
    if (r.tags.includes("slow")) badges.push("Slow");
    if (r.tags.includes("children")) badges.push("Good for children");
    return badges;
}
