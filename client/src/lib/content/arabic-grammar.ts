// Milestone 3, foundational Arabic grammar for Quran study.
// Nine sections covering pronouns, the definite article, gender, number
// (singular/dual/plural), verb tenses, imperative, noun cases, possessive
// constructions (idaafa), and attached pronouns.
// Portable pure-data module.

export interface GrammarRow {
    arabic: string;
    transliteration: string;
    english: string;
    note?: string;
}

export interface GrammarTable {
    title: string;
    columns: string[];
    rows: GrammarRow[][];   // each row is an array parallel to columns; arabic=rows[i][c].arabic
    // actually simpler: provide a generic Table as 2D array of cells below
}

// Generic cell-grid table for easy rendering
export interface GrammarCell {
    arabic?: string;
    transliteration?: string;
    english?: string;
    header?: boolean;
}

export interface GrammarSection {
    id: string;
    title: string;
    subtitle: string;
    explanation: string;           // 2-4 sentences of prose
    table?: GrammarCell[][];       // optional table of forms
    exampleVerse?: {
        verseKey: string;
        arabic: string;
        english: string;
        highlight?: string;        // the grammatical form to highlight
    };
    additionalNotes?: string[];
}

export const GRAMMAR_SECTIONS: GrammarSection[] = [
    // ─────────────────────────────────────────── 1. Personal Pronouns ──
    {
        id: "pronouns",
        title: "Personal Pronouns",
        subtitle: "The detached pronouns, I, you, he, she, we, they",
        explanation:
            "Arabic has 12 standalone personal pronouns, distinguishing between singular, dual, and plural, and between masculine and feminine. English only has 7 (I, you, he, she, it, we, they). Learning these is the first step to understanding how Arabic talks about people.",
        table: [
            [{ header: true, english: "Person" }, { header: true, arabic: "Arabic" }, { header: true, english: "Transliteration" }, { header: true, english: "English" }],
            [{ english: "1st singular" }, { arabic: "أَنَا" }, { transliteration: "ana" }, { english: "I" }],
            [{ english: "1st plural" }, { arabic: "نَحْنُ" }, { transliteration: "nahnu" }, { english: "we" }],
            [{ english: "2nd singular masc." }, { arabic: "أَنْتَ" }, { transliteration: "anta" }, { english: "you (male)" }],
            [{ english: "2nd singular fem." }, { arabic: "أَنْتِ" }, { transliteration: "anti" }, { english: "you (female)" }],
            [{ english: "2nd dual" }, { arabic: "أَنْتُمَا" }, { transliteration: "antuma" }, { english: "you two" }],
            [{ english: "2nd plural masc." }, { arabic: "أَنْتُمْ" }, { transliteration: "antum" }, { english: "you all (male)" }],
            [{ english: "2nd plural fem." }, { arabic: "أَنْتُنَّ" }, { transliteration: "antunna" }, { english: "you all (female)" }],
            [{ english: "3rd singular masc." }, { arabic: "هُوَ" }, { transliteration: "huwa" }, { english: "he" }],
            [{ english: "3rd singular fem." }, { arabic: "هِيَ" }, { transliteration: "hiya" }, { english: "she" }],
            [{ english: "3rd dual" }, { arabic: "هُمَا" }, { transliteration: "huma" }, { english: "those two" }],
            [{ english: "3rd plural masc." }, { arabic: "هُمْ" }, { transliteration: "hum" }, { english: "they (male)" }],
            [{ english: "3rd plural fem." }, { arabic: "هُنَّ" }, { transliteration: "hunna" }, { english: "they (female)" }],
        ],
        exampleVerse: {
            verseKey: "112:1",
            arabic: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
            english: "Say: He is Allah, the One.",
            highlight: "هُوَ",
        },
        additionalNotes: [
            "In Arabic, 'he' and 'she' are used for all nouns, never 'it'. Every noun has a gender.",
            "The dual form (two people) is a distinctive feature of Arabic. English doesn't have it.",
        ],
    },

    // ─────────────────────────────────────────── 2. Definite Article ──
    {
        id: "definite-article",
        title: "The Definite Article (ال)",
        subtitle: "How to say 'the' in Arabic",
        explanation:
            "Arabic has only ONE definite article: ال (al-), meaning 'the'. It's attached to the front of nouns, never standing alone. There's no indefinite article ('a' or 'an'), a noun without ال is automatically indefinite.",
        table: [
            [{ header: true, english: "Indefinite" }, { header: true, english: "Definite (with ال)" }, { header: true, english: "Meaning" }],
            [{ arabic: "كِتَاب" }, { arabic: "الكِتَاب" }, { english: "book → the book" }],
            [{ arabic: "بَيْت" }, { arabic: "البَيْت" }, { english: "house → the house" }],
            [{ arabic: "نَاس" }, { arabic: "النَّاس" }, { english: "people → the people" }],
            [{ arabic: "شَمْس" }, { arabic: "الشَّمْس" }, { english: "sun → the sun" }],
            [{ arabic: "عَالَم" }, { arabic: "العَالَم" }, { english: "world → the world" }],
        ],
        exampleVerse: {
            verseKey: "1:2",
            arabic: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَالَمِينَ",
            english: "All praise is for Allah, Lord of the worlds.",
            highlight: "ٱلْحَمْدُ",
        },
        additionalNotes: [
            "Notice the ل (L) sound sometimes disappears. When ال is followed by a 'sun letter' (ت ث د ذ ر ز س ش ص ض ط ظ ل ن), the L is silent and the next letter is doubled: الشَّمْس (ash-shams, not al-shams).",
            "The other 14 letters are called 'moon letters', with those the L is pronounced clearly: القَمَر (al-qamar, 'the moon').",
        ],
    },

    // ─────────────────────────────────────────── 3. Gender ──
    {
        id: "gender",
        title: "Noun Gender",
        subtitle: "Every Arabic noun is masculine or feminine",
        explanation:
            "Arabic has only two grammatical genders: masculine and feminine. Most feminine nouns end in ة (called 'taa marbuta', the tied taa). Some common feminine words don't have this marker but are treated as feminine by convention (شَمْس sun, أُمّ mother, أَرْض earth).",
        table: [
            [{ header: true, english: "Masculine" }, { header: true, english: "Feminine (with ة)" }, { header: true, english: "Meaning" }],
            [{ arabic: "مُسْلِم" }, { arabic: "مُسْلِمَة" }, { english: "Muslim man / woman" }],
            [{ arabic: "مُؤْمِن" }, { arabic: "مُؤْمِنَة" }, { english: "believer (m/f)" }],
            [{ arabic: "طَالِب" }, { arabic: "طَالِبَة" }, { english: "student (m/f)" }],
            [{ arabic: "كَبِير" }, { arabic: "كَبِيرَة" }, { english: "big (m/f)" }],
            [{ arabic: "صَالِح" }, { arabic: "صَالِحَة" }, { english: "righteous (m/f)" }],
        ],
        exampleVerse: {
            verseKey: "33:35",
            arabic: "إِنَّ ٱلْمُسْلِمِينَ وَٱلْمُسْلِمَاتِ",
            english: "Indeed, the Muslim men and the Muslim women...",
            highlight: "ٱلْمُسْلِمَاتِ",
        },
        additionalNotes: [
            "Important feminine words without ة: شَمْس (sun), نَفْس (soul), أَرْض (earth), أُمّ (mother), بِنْت (daughter), يَد (hand), عَيْن (eye).",
            "Body parts that come in pairs are usually feminine (عَيْن eye, يَد hand, رِجْل foot).",
        ],
    },

    // ─────────────────────────────────────────── 4. Singular, Dual, Plural ──
    {
        id: "number",
        title: "Singular, Dual, Plural",
        subtitle: "Arabic's three-way number system",
        explanation:
            "Arabic distinguishes between one, TWO, and three-or-more. English only has singular and plural. The dual uses predictable suffixes: ـَان (-aan) or ـَيْن (-ayn). Plurals come in two types: 'sound' plurals (predictable suffixes) and 'broken' plurals (the word's internal pattern changes), which must be memorized.",
        table: [
            [{ header: true, english: "Singular (1)" }, { header: true, english: "Dual (2)" }, { header: true, english: "Plural (3+)" }, { header: true, english: "Meaning" }],
            [{ arabic: "مُسْلِم" }, { arabic: "مُسْلِمَانِ" }, { arabic: "مُسْلِمُونَ" }, { english: "Muslim(s)" }],
            [{ arabic: "كِتَاب" }, { arabic: "كِتَابَانِ" }, { arabic: "كُتُب" }, { english: "book(s), plural is BROKEN" }],
            [{ arabic: "وَلَد" }, { arabic: "وَلَدَانِ" }, { arabic: "أَوْلَاد" }, { english: "boy(s), broken plural" }],
            [{ arabic: "يَوْم" }, { arabic: "يَوْمَانِ" }, { arabic: "أَيَّام" }, { english: "day(s), broken plural" }],
            [{ arabic: "بَيْت" }, { arabic: "بَيْتَانِ" }, { arabic: "بُيُوت" }, { english: "house(s), broken plural" }],
        ],
        additionalNotes: [
            "Sound masculine plural: add ـُونَ (nom.) or ـِينَ (acc./gen.). مُسْلِم → مُسْلِمُونَ / مُسْلِمِينَ.",
            "Sound feminine plural: add ـَات. مُسْلِمَة → مُسْلِمَات.",
            "Broken plurals change the word's internal vowels (like English 'man → men', 'foot → feet') and follow ~40 patterns that you memorize with each word.",
        ],
    },

    // ─────────────────────────────────────────── 5. Present Tense ──
    {
        id: "present",
        title: "Present Tense Verbs",
        subtitle: "al-Fi'l al-Mudari', the ongoing / habitual / future action",
        explanation:
            "The Arabic present tense covers what English expresses as 'he writes', 'he is writing', and often 'he will write'. It's formed by adding prefixes (and sometimes suffixes) to the verb's 3-letter root. Below are the 13 conjugations of 'to write' (root: ك ت ب).",
        table: [
            [{ header: true, english: "Person" }, { header: true, arabic: "Arabic" }, { header: true, english: "Transliteration" }, { header: true, english: "Meaning" }],
            [{ english: "I" }, { arabic: "أَكْتُبُ" }, { transliteration: "aktubu" }, { english: "I write" }],
            [{ english: "we" }, { arabic: "نَكْتُبُ" }, { transliteration: "naktubu" }, { english: "we write" }],
            [{ english: "you (m)" }, { arabic: "تَكْتُبُ" }, { transliteration: "taktubu" }, { english: "you write (to a man)" }],
            [{ english: "you (f)" }, { arabic: "تَكْتُبِينَ" }, { transliteration: "taktubeena" }, { english: "you write (to a woman)" }],
            [{ english: "you 2" }, { arabic: "تَكْتُبَانِ" }, { transliteration: "taktubani" }, { english: "you two write" }],
            [{ english: "you (pl m)" }, { arabic: "تَكْتُبُونَ" }, { transliteration: "taktuboona" }, { english: "you all write (men)" }],
            [{ english: "you (pl f)" }, { arabic: "تَكْتُبْنَ" }, { transliteration: "taktubna" }, { english: "you all write (women)" }],
            [{ english: "he" }, { arabic: "يَكْتُبُ" }, { transliteration: "yaktubu" }, { english: "he writes" }],
            [{ english: "she" }, { arabic: "تَكْتُبُ" }, { transliteration: "taktubu" }, { english: "she writes" }],
            [{ english: "they 2" }, { arabic: "يَكْتُبَانِ" }, { transliteration: "yaktubani" }, { english: "those two write (m)" }],
            [{ english: "they (pl m)" }, { arabic: "يَكْتُبُونَ" }, { transliteration: "yaktuboona" }, { english: "they write (men)" }],
            [{ english: "they (pl f)" }, { arabic: "يَكْتُبْنَ" }, { transliteration: "yaktubna" }, { english: "they write (women)" }],
        ],
        exampleVerse: {
            verseKey: "2:3",
            arabic: "ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ",
            english: "Those who believe in the unseen",
            highlight: "يُؤْمِنُونَ",
        },
        additionalNotes: [
            "Notice that 'you (m)' and 'she' use the same form: تَكْتُبُ. Context tells you which.",
            "The three prefixes are: أ (I), ن (we), ت (you, she), ي (he, they).",
        ],
    },

    // ─────────────────────────────────────────── 6. Past Tense ──
    {
        id: "past",
        title: "Past Tense Verbs",
        subtitle: "al-Fi'l al-Madi, the completed action",
        explanation:
            "The Arabic past tense is marked by suffixes attached to the verb. The base form (3rd singular masculine) is simply the root with short vowels: كَتَبَ kataba 'he wrote'. All other forms add suffixes.",
        table: [
            [{ header: true, english: "Person" }, { header: true, arabic: "Arabic" }, { header: true, english: "Transliteration" }, { header: true, english: "Meaning" }],
            [{ english: "I" }, { arabic: "كَتَبْتُ" }, { transliteration: "katabtu" }, { english: "I wrote" }],
            [{ english: "we" }, { arabic: "كَتَبْنَا" }, { transliteration: "katabna" }, { english: "we wrote" }],
            [{ english: "you (m)" }, { arabic: "كَتَبْتَ" }, { transliteration: "katabta" }, { english: "you wrote (m)" }],
            [{ english: "you (f)" }, { arabic: "كَتَبْتِ" }, { transliteration: "katabti" }, { english: "you wrote (f)" }],
            [{ english: "you (pl m)" }, { arabic: "كَتَبْتُمْ" }, { transliteration: "katabtum" }, { english: "you all wrote (m)" }],
            [{ english: "you (pl f)" }, { arabic: "كَتَبْتُنَّ" }, { transliteration: "katabtunna" }, { english: "you all wrote (f)" }],
            [{ english: "he" }, { arabic: "كَتَبَ" }, { transliteration: "kataba" }, { english: "he wrote (base form)" }],
            [{ english: "she" }, { arabic: "كَتَبَتْ" }, { transliteration: "katabat" }, { english: "she wrote" }],
            [{ english: "they (pl m)" }, { arabic: "كَتَبُوا" }, { transliteration: "katabu" }, { english: "they wrote (m)" }],
            [{ english: "they (pl f)" }, { arabic: "كَتَبْنَ" }, { transliteration: "katabna" }, { english: "they wrote (f)" }],
        ],
        exampleVerse: {
            verseKey: "96:1",
            arabic: "ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِي خَلَقَ",
            english: "Read, in the name of your Lord who created.",
            highlight: "خَلَقَ",
        },
    },

    // ─────────────────────────────────────────── 7. Imperative ──
    {
        id: "imperative",
        title: "The Imperative (Command)",
        subtitle: "al-Amr, telling someone to do something",
        explanation:
            "To command someone to do an action, Arabic has a dedicated form (al-Amr). It's derived from the present tense by dropping the 'you' prefix and adding an initial alif with a supporting vowel (usually kasra). Example: تَكْتُبُ 'you write' → اُكْتُبْ 'write!'",
        table: [
            [{ header: true, english: "To whom" }, { header: true, arabic: "Arabic" }, { header: true, english: "Transliteration" }, { header: true, english: "Meaning" }],
            [{ english: "to a man" }, { arabic: "اُكْتُبْ" }, { transliteration: "uktub" }, { english: "write! (m)" }],
            [{ english: "to a woman" }, { arabic: "اُكْتُبِي" }, { transliteration: "uktubi" }, { english: "write! (f)" }],
            [{ english: "to two" }, { arabic: "اُكْتُبَا" }, { transliteration: "uktuba" }, { english: "write! (two)" }],
            [{ english: "to many men" }, { arabic: "اُكْتُبُوا" }, { transliteration: "uktubu" }, { english: "write! (men)" }],
            [{ english: "to many women" }, { arabic: "اُكْتُبْنَ" }, { transliteration: "uktubna" }, { english: "write! (women)" }],
        ],
        exampleVerse: {
            verseKey: "96:1",
            arabic: "ٱقْرَأْ بِٱسْمِ رَبِّكَ",
            english: "Read, in the name of your Lord",
            highlight: "ٱقْرَأْ",
        },
        additionalNotes: [
            "The first word revealed to the Prophet Muhammad ﷺ was an imperative: اِقْرَأْ iqra' ('read!').",
            "Commands like قُلْ (say!), كُلُوا (eat!), ٱدْخُلُوا (enter!) appear throughout the Quran.",
        ],
    },

    // ─────────────────────────────────────────── 8. Noun Cases ──
    {
        id: "cases",
        title: "The Three Noun Cases",
        subtitle: "Nominative, Accusative, Genitive",
        explanation:
            "Arabic nouns change their ending based on their function in the sentence. This is called 'i'rab' (declension). There are three cases: nominative (marfu', for subjects), accusative (mansub, for objects), and genitive (majrur, for nouns after prepositions or in possession). For most nouns, the case is marked by a single short vowel on the last letter.",
        table: [
            [{ header: true, english: "Case" }, { header: true, english: "Arabic name" }, { header: true, english: "Marker" }, { header: true, english: "Used for" }],
            [{ english: "Nominative" }, { arabic: "مَرْفُوع" }, { english: "ُ (damma) or ٌ (tanween damm)" }, { english: "Subject, predicate" }],
            [{ english: "Accusative" }, { arabic: "مَنْصُوب" }, { english: "َ (fatha) or ً (tanween fath)" }, { english: "Direct object, adverbial" }],
            [{ english: "Genitive" }, { arabic: "مَجْرُور" }, { english: "ِ (kasra) or ٍ (tanween kasr)" }, { english: "After prepositions, in possession" }],
        ],
        exampleVerse: {
            verseKey: "1:1",
            arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
            english: "In the name of Allah, the Most Compassionate, the Most Merciful.",
            highlight: "ٱللَّهِ",
        },
        additionalNotes: [
            "In 'Bismillah', every word is genitive (majrur, with kasra) because they follow the preposition بِ (bi, 'in').",
            "The rules of i'rab are a huge topic, but once you recognize the three endings, you can start tracking which noun is doing what in a verse.",
            "Some nouns are 'diptotes' (non-fully-declined), meaning they don't take tanween and use fatha for both accusative and genitive. Most proper names are diptotes.",
        ],
    },

    // ─────────────────────────────────────────── 9. Possessive Suffixes ──
    {
        id: "possessive",
        title: "Possessive Suffixes (Attached Pronouns)",
        subtitle: "How to say 'my', 'your', 'his', 'her'",
        explanation:
            "Arabic doesn't use separate words for 'my', 'your', etc. Instead, it attaches short suffixes to the end of a noun. كِتَاب kitab 'book' → كِتَابِي kitabi 'my book'. These are called 'attached pronouns' (al-dama'ir al-muttasilah).",
        table: [
            [{ header: true, english: "Suffix" }, { header: true, arabic: "Arabic" }, { header: true, english: "Transliteration" }, { header: true, english: "Meaning" }],
            [{ english: "my" }, { arabic: "ـِي" }, { transliteration: "-i" }, { english: "كِتَابِي, my book" }],
            [{ english: "our" }, { arabic: "ـَنَا" }, { transliteration: "-na" }, { english: "كِتَابُنَا, our book" }],
            [{ english: "your (m)" }, { arabic: "ـَكَ" }, { transliteration: "-ka" }, { english: "كِتَابُكَ, your book (m)" }],
            [{ english: "your (f)" }, { arabic: "ـَكِ" }, { transliteration: "-ki" }, { english: "كِتَابُكِ, your book (f)" }],
            [{ english: "your (pl m)" }, { arabic: "ـَكُمْ" }, { transliteration: "-kum" }, { english: "كِتَابُكُمْ, your book (men)" }],
            [{ english: "your (pl f)" }, { arabic: "ـَكُنَّ" }, { transliteration: "-kunna" }, { english: "كِتَابُكُنَّ, your book (women)" }],
            [{ english: "his" }, { arabic: "ـَهُ" }, { transliteration: "-hu" }, { english: "كِتَابُهُ, his book" }],
            [{ english: "her" }, { arabic: "ـَهَا" }, { transliteration: "-ha" }, { english: "كِتَابُهَا, her book" }],
            [{ english: "their (m)" }, { arabic: "ـَهُمْ" }, { transliteration: "-hum" }, { english: "كِتَابُهُمْ, their book (m)" }],
            [{ english: "their (f)" }, { arabic: "ـَهُنَّ" }, { transliteration: "-hunna" }, { english: "كِتَابُهُنَّ, their book (f)" }],
        ],
        exampleVerse: {
            verseKey: "1:5",
            arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
            english: "You alone we worship, and You alone we ask for help.",
            highlight: "إِيَّاكَ",
        },
        additionalNotes: [
            "These same suffixes also attach to verbs to make them objects: رَأَيْتُهُ ra'aytuhu 'I saw him'.",
            "They also attach to prepositions: عَلَيْكَ 'alayka 'upon you', لَهُ lahu 'for him'.",
        ],
    },
];
