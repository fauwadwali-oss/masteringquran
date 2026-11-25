// What the tools looked up, in the shape the Ask Wali page shows under an answer.

export type AskSource =
    | { kind: "hadith"; citation: string; grading?: string }
    | { kind: "tafsir"; name: string; reference: string };

export const TAFSIR_NAMES: Record<string, string> = {
    "en-tafisr-ibn-kathir": "Tafsir Ibn Kathir (abridged)",
    "en-al-jalalayn": "Tafsir al-Jalalayn",
    "en-tafsir-maarif-ul-quran": "Ma'arif al-Quran, Mufti Muhammad Shafi",
    "en-tazkirul-quran": "Tazkirul Quran, Wahiduddin Khan",
    "en-tafsir-ibn-abbas": "Tanwir al-Miqbas (attributed to Ibn Abbas)",
    "en-al-qushairi-tafsir": "Tafsir al-Qushayri",
    "en-tafsir-al-tustari": "Tafsir al-Tustari",
    "en-kashani-tafsir": "Tafsir al-Kashani",
    "en-kashf-al-asrar-tafsir": "Kashf al-Asrar",
    "en-asbab-al-nuzul-by-al-wahidi": "Asbab al-Nuzul, al-Wahidi",
};

export function sourcesFrom(tool: string, result: unknown): AskSource[] {
    const r = result as any;
    if (!r || r.error) return [];
    if (tool === "get_hadith" || tool === "search_hadith_collection") {
        return (r.hadith ?? r.matches ?? []).map((h: any) => ({ kind: "hadith", citation: h.citation, grading: h.grading }));
    }
    if (tool === "get_tafsir" && r.text) return [{ kind: "tafsir", name: r.name, reference: r.reference }];
    if (tool === "get_duas_by_category") {
        return (r.duas ?? [])
            .filter((d: any) => d.grades !== undefined && d.reference)
            .map((d: any) => ({ kind: "hadith", citation: d.reference, grading: d.grades?.length ? d.grades.join("; ") : undefined }));
    }
    if (tool === "get_99_names") return [{ kind: "hadith", citation: "Jami' at-Tirmidhi 3507", grading: "The list of names is graded weak (da'if)" }];
    return [];
}
