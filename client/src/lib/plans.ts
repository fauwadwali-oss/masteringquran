// Curated reading plans — static definitions shared by web and future mobile apps.
// Each plan defines a sequence of daily reading ranges by verse_key or juz.

export type PlanSegment =
    | { kind: "juz"; juz: number; label: string }
    | { kind: "surah"; surah: number; label: string }
    | { kind: "range"; from: string; to: string; label: string }; // "2:255" .. "2:257"

export interface ReadingPlan {
    id: string;
    name: string;
    duration_days: number;
    blurb: string;
    emoji: string;
    days: PlanSegment[];
}

// Helper: build a 30-day "1 Juz per day" plan
const thirtyJuzPlan: ReadingPlan = {
    id: "30-day-juz",
    name: "Complete Quran in 30 days",
    duration_days: 30,
    blurb: "One Juz per day — the classic monthly completion, often paired with Ramadan.",
    emoji: "🌙",
    days: Array.from({ length: 30 }, (_, i) => ({
        kind: "juz" as const,
        juz: i + 1,
        label: `Juz ${i + 1}`,
    })),
};

// "1 Juz per week" — 30-week plan for steady-paced readers
const thirtyWeekJuzPlan: ReadingPlan = {
    id: "30-week-juz",
    name: "One Juz per week",
    duration_days: 210, // 30 weeks × 7 days
    blurb: "Steady, sustainable — one Juz per week across seven months.",
    emoji: "📅",
    days: Array.from({ length: 30 }, (_, i) => ({
        kind: "juz" as const,
        juz: i + 1,
        label: `Week ${i + 1}: Juz ${i + 1}`,
    })),
};

// "Surah-a-day" — first 60 short surahs in a 60-day plan
const shortSurahsPlan: ReadingPlan = {
    id: "short-surahs-60",
    name: "60 short Surahs (Juz 30 + 29)",
    duration_days: 60,
    blurb: "Day-by-day through the last two Juz — perfect for families with children.",
    emoji: "✨",
    days: Array.from({ length: 60 }, (_, i) => {
        // Starts from Surah 55 (Ar-Rahman) through 114
        const surah = 55 + i;
        return { kind: "surah" as const, surah, label: `Surah ${surah}` };
    }),
};

// Ramadan — 30 days × 1 Juz (same as 30-day, but framed for Ramadan)
const ramadanPlan: ReadingPlan = {
    id: "ramadan",
    name: "Ramadan: 1 Juz per day",
    duration_days: 30,
    blurb: "Complete the Quran over the blessed month, one Juz each day.",
    emoji: "🌙",
    days: Array.from({ length: 30 }, (_, i) => ({
        kind: "juz" as const,
        juz: i + 1,
        label: `Night ${i + 1}: Juz ${i + 1}`,
    })),
};

// Half-Quran in a week — 7 days of 4 Juz each (intensive)
const sevenDayHalfPlan: ReadingPlan = {
    id: "7-day-half",
    name: "First half in 7 days",
    duration_days: 7,
    blurb: "For retreats or i'tikaf — 15 Juz across 7 days, roughly two Juz plus per day.",
    emoji: "🏔️",
    days: [
        { kind: "range", from: "1:1", to: "2:141", label: "Day 1: Fatiha + first 141 of al-Baqarah" },
        { kind: "range", from: "2:142", to: "2:252", label: "Day 2: Baqarah 142-252" },
        { kind: "range", from: "2:253", to: "3:92", label: "Day 3: End of Baqarah + first half of Al Imran" },
        { kind: "range", from: "3:93", to: "4:87", label: "Day 4: Al Imran + first of An-Nisa" },
        { kind: "range", from: "4:88", to: "5:82", label: "Day 5: End of An-Nisa + half of Al-Ma'ida" },
        { kind: "range", from: "5:83", to: "6:110", label: "Day 6: Ma'ida + half of Al-An'am" },
        { kind: "range", from: "6:111", to: "7:206", label: "Day 7: End of An'am + Al-A'raf" },
    ],
};

// Highlight verses — 30 days of "greatest ayahs"
const fortyGreatestPlan: ReadingPlan = {
    id: "40-greatest-ayahs",
    name: "40 Essential Verses",
    duration_days: 40,
    blurb: "Forty days, forty pivotal ayahs — each with a moment to pause and reflect.",
    emoji: "💎",
    days: [
        { kind: "range", from: "1:1", to: "1:7", label: "Al-Fatihah in full" },
        { kind: "range", from: "2:255", to: "2:255", label: "Ayat al-Kursi (2:255)" },
        { kind: "range", from: "2:286", to: "2:286", label: "Last ayah of Baqarah (2:286)" },
        { kind: "range", from: "3:8", to: "3:9", label: "Dua of the firm-footed (3:8-9)" },
        { kind: "range", from: "3:190", to: "3:195", label: "Signs for people of understanding (3:190-195)" },
        { kind: "range", from: "4:36", to: "4:36", label: "Rights of kin, neighbors, traveler (4:36)" },
        { kind: "range", from: "6:160", to: "6:160", label: "Multiplied rewards (6:160)" },
        { kind: "range", from: "7:23", to: "7:23", label: "Dua of Adam (7:23)" },
        { kind: "range", from: "7:143", to: "7:143", label: "Moses on Mount Sinai (7:143)" },
        { kind: "range", from: "9:40", to: "9:40", label: "Do not grieve, Allah is with us (9:40)" },
        { kind: "range", from: "11:114", to: "11:114", label: "Good erases bad (11:114)" },
        { kind: "range", from: "13:11", to: "13:11", label: "Allah does not change a people... (13:11)" },
        { kind: "range", from: "13:28", to: "13:28", label: "Hearts find rest in remembrance (13:28)" },
        { kind: "range", from: "14:7", to: "14:7", label: "If you are grateful, I will give you more (14:7)" },
        { kind: "range", from: "17:23", to: "17:24", label: "Treatment of parents (17:23-24)" },
        { kind: "range", from: "17:80", to: "17:80", label: "Dua for an honorable entry and exit (17:80)" },
        { kind: "range", from: "18:10", to: "18:10", label: "Dua of the youth of the Cave (18:10)" },
        { kind: "range", from: "18:46", to: "18:46", label: "Lasting good deeds (18:46)" },
        { kind: "range", from: "19:41", to: "19:50", label: "Story of Ibrahim and his father (19:41-50)" },
        { kind: "range", from: "20:25", to: "20:28", label: "Musa's dua for speech (20:25-28)" },
        { kind: "range", from: "20:114", to: "20:114", label: "Dua for increase in knowledge (20:114)" },
        { kind: "range", from: "21:87", to: "21:87", label: "Dua of Yunus (21:87)" },
        { kind: "range", from: "24:35", to: "24:35", label: "Ayat an-Nur (24:35)" },
        { kind: "range", from: "25:63", to: "25:77", label: "Qualities of servants of the Most Merciful (25:63-77)" },
        { kind: "range", from: "29:69", to: "29:69", label: "Those who strive are guided (29:69)" },
        { kind: "range", from: "31:12", to: "31:19", label: "Advice of Luqman (31:12-19)" },
        { kind: "range", from: "33:35", to: "33:35", label: "Ten qualities of believing men and women (33:35)" },
        { kind: "range", from: "33:70", to: "33:71", label: "Right speech and forgiveness (33:70-71)" },
        { kind: "range", from: "36:1", to: "36:12", label: "Beginning of Ya-Sin" },
        { kind: "range", from: "39:53", to: "39:53", label: "Never despair of Allah's mercy (39:53)" },
        { kind: "range", from: "41:30", to: "41:35", label: "Repel evil with what is better (41:30-35)" },
        { kind: "range", from: "49:12", to: "49:13", label: "Don't backbite (49:12-13)" },
        { kind: "range", from: "55:1", to: "55:13", label: "Opening of Ar-Rahman" },
        { kind: "range", from: "57:20", to: "57:20", label: "Life of this world (57:20)" },
        { kind: "range", from: "59:22", to: "59:24", label: "Closing names of Al-Hashr (59:22-24)" },
        { kind: "range", from: "64:11", to: "64:11", label: "No calamity except by Allah's leave (64:11)" },
        { kind: "range", from: "65:2", to: "65:3", label: "Provision from unexpected places (65:2-3)" },
        { kind: "range", from: "94:1", to: "94:8", label: "Surah Ash-Sharh in full" },
        { kind: "range", from: "112:1", to: "112:4", label: "Surah al-Ikhlas" },
        { kind: "range", from: "113:1", to: "114:6", label: "Al-Falaq and An-Nas (the Mu'awwidhatayn)" },
    ],
};

export const READING_PLANS: ReadingPlan[] = [
    thirtyJuzPlan,
    thirtyWeekJuzPlan,
    shortSurahsPlan,
    ramadanPlan,
    sevenDayHalfPlan,
    fortyGreatestPlan,
];

export const getPlanById = (id: string): ReadingPlan | undefined =>
    READING_PLANS.find((p) => p.id === id);
