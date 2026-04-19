// Foundations of reading Arabic (Noorani Qaida curriculum + tajweed essentials).
// Hand-curated from classical sources. Portable pure-data — no React deps.

export interface ArabicLetter {
    order: number;              // 1-28
    char: string;               // isolated form, e.g. "ا"
    name: string;               // Arabic name, e.g. "ألف"
    transliteration: string;    // English, e.g. "Alif"
    latinSound: string;         // closest English phonetic, e.g. "'a' as in 'apple' (long)"
    makhraj: string;            // articulation point description
    initial: string;            // shape when word-initial
    medial: string;             // shape when word-medial
    final: string;              // shape when word-final
    exampleWord: string;        // simple word starting with this letter
    exampleWordMeaning: string; // English translation of the example
    noJoinNext?: boolean;       // true for letters that don't join the following letter (ا د ذ ر ز و)
}

export const LETTERS: ArabicLetter[] = [
    { order: 1, char: "ا", name: "ألف", transliteration: "Alif", latinSound: "Long 'aa' (like 'father')", makhraj: "From the deepest part of the throat; the mother of all sounds", initial: "ا", medial: "ـا", final: "ـا", exampleWord: "أَب", exampleWordMeaning: "father", noJoinNext: true },
    { order: 2, char: "ب", name: "باء", transliteration: "Ba", latinSound: "'b' as in 'boy'", makhraj: "Both lips together", initial: "بـ", medial: "ـبـ", final: "ـب", exampleWord: "بَاب", exampleWordMeaning: "door" },
    { order: 3, char: "ت", name: "تاء", transliteration: "Ta", latinSound: "'t' as in 'tea'", makhraj: "Tip of tongue against upper front teeth", initial: "تـ", medial: "ـتـ", final: "ـت", exampleWord: "تَمْر", exampleWordMeaning: "dates (fruit)" },
    { order: 4, char: "ث", name: "ثاء", transliteration: "Tha", latinSound: "'th' as in 'think'", makhraj: "Tip of tongue between upper and lower teeth", initial: "ثـ", medial: "ـثـ", final: "ـث", exampleWord: "ثَوْب", exampleWordMeaning: "garment" },
    { order: 5, char: "ج", name: "جيم", transliteration: "Jim", latinSound: "'j' as in 'jar'", makhraj: "Middle of tongue against hard palate", initial: "جـ", medial: "ـجـ", final: "ـج", exampleWord: "جَمَل", exampleWordMeaning: "camel" },
    { order: 6, char: "ح", name: "حاء", transliteration: "Ha (soft)", latinSound: "Whispered 'h' from deep in throat (no English equivalent)", makhraj: "Middle of the throat", initial: "حـ", medial: "ـحـ", final: "ـح", exampleWord: "حَقّ", exampleWordMeaning: "truth / right" },
    { order: 7, char: "خ", name: "خاء", transliteration: "Kha", latinSound: "'ch' as in German 'Bach' or Scottish 'loch'", makhraj: "Upper throat, rolled air", initial: "خـ", medial: "ـخـ", final: "ـخ", exampleWord: "خُبْز", exampleWordMeaning: "bread" },
    { order: 8, char: "د", name: "دال", transliteration: "Dal", latinSound: "'d' as in 'day'", makhraj: "Tip of tongue against upper front teeth", initial: "د", medial: "ـد", final: "ـد", exampleWord: "دَار", exampleWordMeaning: "house", noJoinNext: true },
    { order: 9, char: "ذ", name: "ذال", transliteration: "Dhal", latinSound: "'th' as in 'this'", makhraj: "Tip of tongue between upper and lower teeth, voiced", initial: "ذ", medial: "ـذ", final: "ـذ", exampleWord: "ذَهَب", exampleWordMeaning: "gold", noJoinNext: true },
    { order: 10, char: "ر", name: "راء", transliteration: "Ra", latinSound: "Rolled 'r' (like Spanish 'perro')", makhraj: "Tip of tongue against ridge above upper teeth", initial: "ر", medial: "ـر", final: "ـر", exampleWord: "رَبّ", exampleWordMeaning: "Lord", noJoinNext: true },
    { order: 11, char: "ز", name: "زاي", transliteration: "Zay", latinSound: "'z' as in 'zoo'", makhraj: "Tip of tongue near lower front teeth", initial: "ز", medial: "ـز", final: "ـز", exampleWord: "زَيْت", exampleWordMeaning: "oil", noJoinNext: true },
    { order: 12, char: "س", name: "سين", transliteration: "Sin", latinSound: "'s' as in 'sun'", makhraj: "Tip of tongue near lower front teeth, no voice", initial: "سـ", medial: "ـسـ", final: "ـس", exampleWord: "سَمَاء", exampleWordMeaning: "sky" },
    { order: 13, char: "ش", name: "شين", transliteration: "Shin", latinSound: "'sh' as in 'ship'", makhraj: "Middle of tongue against hard palate, air released", initial: "شـ", medial: "ـشـ", final: "ـش", exampleWord: "شَمْس", exampleWordMeaning: "sun" },
    { order: 14, char: "ص", name: "صاد", transliteration: "Sad", latinSound: "Emphatic 's' — deep, throaty 's'", makhraj: "Tip of tongue near lower teeth + back of tongue raised", initial: "صـ", medial: "ـصـ", final: "ـص", exampleWord: "صَبْر", exampleWordMeaning: "patience" },
    { order: 15, char: "ض", name: "ضاد", transliteration: "Dad", latinSound: "Emphatic 'd' — unique to Arabic; called 'the letter of the Quran'", makhraj: "Side of tongue against upper molars", initial: "ضـ", medial: "ـضـ", final: "ـض", exampleWord: "ضَوْء", exampleWordMeaning: "light" },
    { order: 16, char: "ط", name: "طاء", transliteration: "Ta (emphatic)", latinSound: "Emphatic 't' — deep, throaty 't'", makhraj: "Tip of tongue against upper teeth + tongue raised", initial: "طـ", medial: "ـطـ", final: "ـط", exampleWord: "طَيْر", exampleWordMeaning: "bird" },
    { order: 17, char: "ظ", name: "ظاء", transliteration: "Dha (emphatic)", latinSound: "Emphatic 'th' — like 'this' but deeper", makhraj: "Tip of tongue between teeth + tongue raised", initial: "ظـ", medial: "ـظـ", final: "ـظ", exampleWord: "ظِلّ", exampleWordMeaning: "shade" },
    { order: 18, char: "ع", name: "عين", transliteration: "'Ayn", latinSound: "Deep throat sound, no English equivalent", makhraj: "Middle of the throat", initial: "عـ", medial: "ـعـ", final: "ـع", exampleWord: "عَيْن", exampleWordMeaning: "eye / spring" },
    { order: 19, char: "غ", name: "غين", transliteration: "Ghayn", latinSound: "Gargled 'g' (like French 'r' in 'Paris')", makhraj: "Upper throat, voiced version of kha", initial: "غـ", medial: "ـغـ", final: "ـغ", exampleWord: "غَيْم", exampleWordMeaning: "cloud" },
    { order: 20, char: "ف", name: "فاء", transliteration: "Fa", latinSound: "'f' as in 'foot'", makhraj: "Upper teeth touching lower lip", initial: "فـ", medial: "ـفـ", final: "ـف", exampleWord: "فَجْر", exampleWordMeaning: "dawn" },
    { order: 21, char: "ق", name: "قاف", transliteration: "Qaf", latinSound: "Deep 'k' from back of throat", makhraj: "Deepest part of tongue against soft palate (uvula)", initial: "قـ", medial: "ـقـ", final: "ـق", exampleWord: "قَلْب", exampleWordMeaning: "heart" },
    { order: 22, char: "ك", name: "كاف", transliteration: "Kaf", latinSound: "'k' as in 'king'", makhraj: "Back of tongue against soft palate (just forward of qaf)", initial: "كـ", medial: "ـكـ", final: "ـك", exampleWord: "كِتَاب", exampleWordMeaning: "book" },
    { order: 23, char: "ل", name: "لام", transliteration: "Lam", latinSound: "'l' as in 'love'", makhraj: "Sides of tongue against upper molars and front gum", initial: "لـ", medial: "ـلـ", final: "ـل", exampleWord: "لَيْل", exampleWordMeaning: "night" },
    { order: 24, char: "م", name: "ميم", transliteration: "Mim", latinSound: "'m' as in 'moon'", makhraj: "Both lips together, nasal passage open", initial: "مـ", medial: "ـمـ", final: "ـم", exampleWord: "مَاء", exampleWordMeaning: "water" },
    { order: 25, char: "ن", name: "نون", transliteration: "Nun", latinSound: "'n' as in 'night'", makhraj: "Tip of tongue against front gum, nasal passage open", initial: "نـ", medial: "ـنـ", final: "ـن", exampleWord: "نُور", exampleWordMeaning: "light" },
    { order: 26, char: "ه", name: "هاء", transliteration: "Ha (light)", latinSound: "'h' as in 'hello'", makhraj: "Deepest part of the throat, gentle breath", initial: "هـ", medial: "ـهـ", final: "ـه", exampleWord: "هَوَاء", exampleWordMeaning: "air" },
    { order: 27, char: "و", name: "واو", transliteration: "Waw", latinSound: "'w' as in 'water' (or long 'oo' with sukun)", makhraj: "Both lips rounded", initial: "و", medial: "ـو", final: "ـو", exampleWord: "وَرْد", exampleWordMeaning: "rose", noJoinNext: true },
    { order: 28, char: "ي", name: "ياء", transliteration: "Ya", latinSound: "'y' as in 'yes' (or long 'ee' with sukun)", makhraj: "Middle of tongue against hard palate", initial: "يـ", medial: "ـيـ", final: "ـي", exampleWord: "يَد", exampleWordMeaning: "hand" },
];

// The six letters that don't join the letter that follows them.
export const NON_JOINING_LETTERS = ["ا", "د", "ذ", "ر", "ز", "و"];

// ──────────────────────────────────────────────────────────────────────
// HARAKAT — the vowel marks
// ──────────────────────────────────────────────────────────────────────
export interface Haraka {
    id: string;
    arabic: string;             // the mark above/below a letter, e.g. "بَ"
    name: string;               // Arabic name
    transliteration: string;    // English name
    description: string;
    shortSound: string;         // e.g. "a"
    exampleChar: string;        // ba with this mark, e.g. "بَ"
    exampleTransliteration: string; // e.g. "ba"
    longerExample: { arabic: string; latin: string; meaning: string }; // real word
}

export const HARAKAT: Haraka[] = [
    {
        id: "fatha",
        arabic: "بَ",
        name: "فَتْحَة",
        transliteration: "Fatha",
        description: "A small diagonal line above the letter. Gives the sound of a short 'a'.",
        shortSound: "a",
        exampleChar: "بَ",
        exampleTransliteration: "ba",
        longerExample: { arabic: "نَصَرَ", latin: "nasara", meaning: "he helped" },
    },
    {
        id: "kasra",
        arabic: "بِ",
        name: "كَسْرَة",
        transliteration: "Kasra",
        description: "A small diagonal line below the letter. Gives the sound of a short 'i' (like 'it').",
        shortSound: "i",
        exampleChar: "بِ",
        exampleTransliteration: "bi",
        longerExample: { arabic: "عِلْم", latin: "'ilm", meaning: "knowledge" },
    },
    {
        id: "damma",
        arabic: "بُ",
        name: "ضَمَّة",
        transliteration: "Damma",
        description: "A small 'waw' shape above the letter. Gives the sound of a short 'u' (like 'put').",
        shortSound: "u",
        exampleChar: "بُ",
        exampleTransliteration: "bu",
        longerExample: { arabic: "كُتُب", latin: "kutub", meaning: "books" },
    },
    {
        id: "sukun",
        arabic: "بْ",
        name: "سُكُون",
        transliteration: "Sukun",
        description: "A small circle above the letter. Means NO vowel — the letter is pronounced without a following vowel sound.",
        shortSound: "(silent)",
        exampleChar: "بْ",
        exampleTransliteration: "b",
        longerExample: { arabic: "اِقْرَأ", latin: "iqra'", meaning: "read! (the first revealed word)" },
    },
];

// ──────────────────────────────────────────────────────────────────────
// TANWEEN — double harakat that add a terminal 'n' sound
// ──────────────────────────────────────────────────────────────────────
export interface Tanween {
    id: string;
    arabic: string;             // example letter with this tanween
    name: string;
    transliteration: string;
    sound: string;              // e.g. "an"
    description: string;
    example: { arabic: string; latin: string; meaning: string };
}

export const TANWEEN_MARKS: Tanween[] = [
    {
        id: "tanween-fath",
        arabic: "بً",
        name: "تَنْوِين فَتْح",
        transliteration: "Tanween Fath",
        sound: "an",
        description: "Double fatha. Written as two diagonal lines above the letter. Adds an 'n' sound at the end: 'ba' becomes 'ban'.",
        example: { arabic: "كِتَابًا", latin: "kitaban", meaning: "a book (indefinite, accusative)" },
    },
    {
        id: "tanween-kasr",
        arabic: "بٍ",
        name: "تَنْوِين كَسْر",
        transliteration: "Tanween Kasr",
        sound: "in",
        description: "Double kasra. Written as two diagonal lines below the letter. 'bi' becomes 'bin'.",
        example: { arabic: "كِتَابٍ", latin: "kitabin", meaning: "a book (indefinite, genitive)" },
    },
    {
        id: "tanween-damm",
        arabic: "بٌ",
        name: "تَنْوِين ضَمّ",
        transliteration: "Tanween Damm",
        sound: "un",
        description: "Double damma. Written as two 'waw' shapes above the letter. 'bu' becomes 'bun'.",
        example: { arabic: "كِتَابٌ", latin: "kitabun", meaning: "a book (indefinite, nominative)" },
    },
];

// ──────────────────────────────────────────────────────────────────────
// MADD — elongation of a vowel
// ──────────────────────────────────────────────────────────────────────
export interface MaddRule {
    id: string;
    name: string;
    transliteration: string;
    description: string;
    counts: string;                   // e.g. "2 counts" / "4-6 counts"
    example: { arabic: string; latin: string; meaning: string };
}

export const MADD_RULES: MaddRule[] = [
    {
        id: "madd-tabi3i",
        name: "المَدّ الطَّبِيعِي",
        transliteration: "Madd Tabi'i (Natural)",
        description: "The basic elongation: fatha + alif, kasra + ya, or damma + waw. Hold the vowel for 2 counts.",
        counts: "2 counts",
        example: { arabic: "قَالَ", latin: "qaala", meaning: "he said" },
    },
    {
        id: "madd-muttasil",
        name: "مَدّ مُتَّصِل",
        transliteration: "Madd Muttasil (Connected)",
        description: "Madd letter followed by a hamza (ء) in the SAME word. Hold for 4-5 counts.",
        counts: "4-5 counts",
        example: { arabic: "السَّمَاءَ", latin: "as-samaaa'", meaning: "the sky" },
    },
    {
        id: "madd-munfasil",
        name: "مَدّ مُنْفَصِل",
        transliteration: "Madd Munfasil (Separated)",
        description: "Madd letter at the end of a word followed by a hamza (ء) at the start of the NEXT word. Hold for 2 or 4-5 counts.",
        counts: "2 or 4-5 counts",
        example: { arabic: "يَا أَيُّهَا", latin: "yaaa ayyuhaa", meaning: "O you [who believe]" },
    },
    {
        id: "madd-lazim",
        name: "مَدّ لَازِم",
        transliteration: "Madd Lazim (Obligatory)",
        description: "Madd letter followed by a letter with shaddah or sukun. Hold for 6 counts.",
        counts: "6 counts",
        example: { arabic: "الضَّالِّين", latin: "ad-daaaaalleen", meaning: "those who have gone astray (Al-Fatiha 1:7)" },
    },
];

// ──────────────────────────────────────────────────────────────────────
// TAJWEED RULES
// ──────────────────────────────────────────────────────────────────────
export interface TajweedRule {
    id: string;
    name: string;
    transliteration: string;
    summary: string;
    when: string;                     // when this rule applies
    howToRecite: string;              // how it sounds
    example: { arabic: string; ref?: string; meaning: string };
}

export const TAJWEED_RULES: TajweedRule[] = [
    {
        id: "noon-sakin-idhhar",
        name: "الإِظْهَار",
        transliteration: "Idhhar (Clear pronunciation)",
        summary: "When noon sakin (نْ) or tanween is followed by a throat letter (ء ه ع ح غ خ), pronounce the noon clearly with no nasal sound.",
        when: "Noon sakin or tanween + one of: ء ه ع ح غ خ",
        howToRecite: "Noon is pronounced clearly, no extension, no merging.",
        example: { arabic: "مَنْ عَمِلَ", ref: "41:33", meaning: "whoever does" },
    },
    {
        id: "noon-sakin-idgham",
        name: "الإِدْغَام",
        transliteration: "Idgham (Merging)",
        summary: "When noon sakin or tanween is followed by one of 6 letters (ي ر م ل و ن), the noon merges into the next letter. 4 of these have ghunna (nasal sound), 2 don't.",
        when: "Noon sakin or tanween + one of: ي ر م ل و ن",
        howToRecite: "With ghunna (ي ن م و): merge with a 2-count nasal hum. Without ghunna (ل ر): merge directly.",
        example: { arabic: "مَن يَعْمَلْ", ref: "99:7", meaning: "whoever does" },
    },
    {
        id: "noon-sakin-iqlab",
        name: "الإِقْلَاب",
        transliteration: "Iqlab (Flipping)",
        summary: "When noon sakin or tanween is followed by ب, the noon is converted to a meem sound with ghunna.",
        when: "Noon sakin or tanween + ب",
        howToRecite: "Noon becomes a soft 'm' sound with 2-count nasal hum.",
        example: { arabic: "مِنۢ بَعْدِ", ref: "2:27", meaning: "after" },
    },
    {
        id: "noon-sakin-ikhfa",
        name: "الإِخْفَاء",
        transliteration: "Ikhfa (Concealing)",
        summary: "When noon sakin or tanween is followed by any of the remaining 15 letters, the noon is partially hidden with ghunna. This is the most common rule.",
        when: "Noon sakin or tanween + any of 15 remaining letters (t, th, j, d, dh, z, s, sh, s, d, t, dh, f, q, k)",
        howToRecite: "Noon is lightly pronounced with a 2-count nasal hum while preparing the next letter.",
        example: { arabic: "أَنْتَ", ref: "2:107", meaning: "you (singular)" },
    },
    {
        id: "qalqalah",
        name: "القَلْقَلَة",
        transliteration: "Qalqalah (Echoing)",
        summary: "Five letters (ق ط ب ج د) produce a subtle 'echo' or bounce when they have sukun. Pronounced more strongly at the end of a verse.",
        when: "Any of 'qutbu jadin' letters (ق ط ب ج د) with sukun",
        howToRecite: "A small bounce — like the letter is gently echoed without adding a vowel.",
        example: { arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ", ref: "112:1", meaning: "Say: He is Allah, the One (note the bounce on the ق of قُلْ and the د of أَحَد)" },
    },
];

// ──────────────────────────────────────────────────────────────────────
// GRADUATION: Surah An-Nas (114) — the beginner's first complete surah
// 6 verses, simple vocabulary, common phrases.
// Each word broken out with meaning + any tajweed notes.
// ──────────────────────────────────────────────────────────────────────
export interface SurahWord {
    arabic: string;
    transliteration: string;
    meaning: string;
    note?: string; // e.g. "ikhfa here"
}

export interface SurahVerse {
    verseKey: string;
    words: SurahWord[];
    fullArabic: string;
    fullTranslation: string;
}

export const FIRST_SURAH: { surahNumber: number; name: string; nameTranslit: string; verses: SurahVerse[] } = {
    surahNumber: 114,
    name: "النَّاس",
    nameTranslit: "An-Nas (Mankind)",
    verses: [
        {
            verseKey: "114:1",
            fullArabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
            fullTranslation: "Say: I seek refuge in the Lord of mankind.",
            words: [
                { arabic: "قُلْ", transliteration: "qul", meaning: "say", note: "qalqalah on ق" },
                { arabic: "أَعُوذُ", transliteration: "a'udhu", meaning: "I seek refuge" },
                { arabic: "بِرَبِّ", transliteration: "birabbi", meaning: "in the Lord of" },
                { arabic: "النَّاسِ", transliteration: "an-nas", meaning: "mankind" },
            ],
        },
        {
            verseKey: "114:2",
            fullArabic: "مَلِكِ النَّاسِ",
            fullTranslation: "The King of mankind.",
            words: [
                { arabic: "مَلِكِ", transliteration: "maliki", meaning: "King of" },
                { arabic: "النَّاسِ", transliteration: "an-nas", meaning: "mankind" },
            ],
        },
        {
            verseKey: "114:3",
            fullArabic: "إِلَهِ النَّاسِ",
            fullTranslation: "The God of mankind.",
            words: [
                { arabic: "إِلَهِ", transliteration: "ilahi", meaning: "God of" },
                { arabic: "النَّاسِ", transliteration: "an-nas", meaning: "mankind" },
            ],
        },
        {
            verseKey: "114:4",
            fullArabic: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
            fullTranslation: "From the evil of the whisperer who withdraws.",
            words: [
                { arabic: "مِن", transliteration: "min", meaning: "from" },
                { arabic: "شَرِّ", transliteration: "sharri", meaning: "evil of" },
                { arabic: "الْوَسْوَاسِ", transliteration: "al-waswas", meaning: "the whisperer" },
                { arabic: "الْخَنَّاسِ", transliteration: "al-khannas", meaning: "who withdraws" },
            ],
        },
        {
            verseKey: "114:5",
            fullArabic: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ",
            fullTranslation: "Who whispers in the breasts of mankind.",
            words: [
                { arabic: "الَّذِي", transliteration: "alladhi", meaning: "who" },
                { arabic: "يُوَسْوِسُ", transliteration: "yuwaswisu", meaning: "whispers" },
                { arabic: "فِي", transliteration: "fi", meaning: "in" },
                { arabic: "صُدُورِ", transliteration: "suduri", meaning: "breasts of" },
                { arabic: "النَّاسِ", transliteration: "an-nas", meaning: "mankind" },
            ],
        },
        {
            verseKey: "114:6",
            fullArabic: "مِنَ الْجِنَّةِ وَالنَّاسِ",
            fullTranslation: "From the jinn and mankind.",
            words: [
                { arabic: "مِنَ", transliteration: "mina", meaning: "from" },
                { arabic: "الْجِنَّةِ", transliteration: "al-jinnati", meaning: "the jinn" },
                { arabic: "وَالنَّاسِ", transliteration: "wan-nas", meaning: "and mankind" },
            ],
        },
    ],
};

// ──────────────────────────────────────────────────────────────────────
// LESSON REGISTRY
// ──────────────────────────────────────────────────────────────────────
export interface Lesson {
    id: string;
    number: number;
    slug: string;           // for the URL path
    title: string;
    subtitle: string;
    estimatedMinutes: number;
    emoji: string;
}

export const LESSONS: Lesson[] = [
    // Milestone 1, Noorani Qaida foundations
    { id: "letters", number: 1, slug: "letters", title: "The 28 Arabic Letters", subtitle: "Learn each letter, its name, sound, and articulation point.", estimatedMinutes: 15, emoji: "🔤" },
    { id: "shapes", number: 2, slug: "shapes", title: "Letter Shapes", subtitle: "How letters change form depending on position in a word (isolated, initial, medial, final).", estimatedMinutes: 10, emoji: "✍️" },
    { id: "harakat", number: 3, slug: "harakat", title: "Harakat, The Vowel Marks", subtitle: "Fatha, kasra, damma, sukun, the marks that give letters their vowel sounds.", estimatedMinutes: 10, emoji: "◌" },
    { id: "tanween-madd", number: 4, slug: "tanween-madd", title: "Tanween & Madd", subtitle: "Nunation (the 'n' sound) and elongation (holding the vowel).", estimatedMinutes: 10, emoji: "⏱️" },
    { id: "tajweed", number: 5, slug: "tajweed", title: "Essential Tajweed Rules", subtitle: "The five foundational rules of Quranic recitation.", estimatedMinutes: 15, emoji: "🎶" },
    { id: "first-surah", number: 6, slug: "first-surah", title: "Read Your First Surah", subtitle: "Apply everything you learned to recite Surah An-Nas, word by word.", estimatedMinutes: 15, emoji: "🎓" },
    // Milestone 2, vocabulary
    { id: "vocabulary", number: 7, slug: "vocabulary", title: "Quranic Vocabulary", subtitle: "175 most common Quranic words in 11 themes, covering ~70% of what you'll read.", estimatedMinutes: 30, emoji: "📚" },
    // Milestone 3, grammar
    { id: "grammar", number: 8, slug: "grammar", title: "Grammar Basics", subtitle: "Pronouns, the definite article, verb tenses, noun cases, possessive suffixes.", estimatedMinutes: 25, emoji: "🧩" },
];
