// Milestone 2, the most frequent and foundational Quranic vocabulary.
// Hand-curated across 10 themes, ~175 words covering a very large portion of
// recurring Quranic language. Each word has its Arabic form, transliteration,
// root letters (when applicable), English meaning, and an example verse
// reference where the word appears clearly.
// Portable pure-data module, no React deps.

export type VocabCategory =
    | "Allah & Divine Names"
    | "Prophets & Messengers"
    | "Quran & Scripture"
    | "Worship & Spirituality"
    | "Hereafter & Judgment"
    | "Creation & Nature"
    | "Family & People"
    | "Virtues & Character"
    | "Vices & Warnings"
    | "Common Verbs"
    | "Everyday Nouns";

export interface VocabWord {
    id: string;               // slug
    arabic: string;           // the word itself
    transliteration: string;  // e.g. "Allah"
    root?: string;            // trilateral root, e.g. "ر ب ب"
    meaning: string;          // English
    exampleVerse?: string;    // verse_key where this word appears
    notes?: string;           // optional etymology / usage note
    category: VocabCategory;
}

export const VOCAB_WORDS: VocabWord[] = [
    // ─────────────────────────────────────────── ALLAH & DIVINE NAMES ──
    { id: "allah", arabic: "ٱللَّٰه", transliteration: "Allah", meaning: "God, the one and only", exampleVerse: "1:1", category: "Allah & Divine Names", notes: "The proper name of God in Arabic." },
    { id: "rabb", arabic: "رَبّ", transliteration: "Rabb", root: "ر ب ب", meaning: "Lord, Master, Sustainer", exampleVerse: "1:2", category: "Allah & Divine Names" },
    { id: "ilah", arabic: "إِلَٰه", transliteration: "Ilah", root: "أ ل ه", meaning: "god (the concept of a deity)", exampleVerse: "2:163", category: "Allah & Divine Names" },
    { id: "ahad", arabic: "أَحَد", transliteration: "Ahad", meaning: "One, the Unique", exampleVerse: "112:1", category: "Allah & Divine Names" },
    { id: "wahid", arabic: "وَاحِد", transliteration: "Wahid", meaning: "One", exampleVerse: "2:163", category: "Allah & Divine Names" },
    { id: "rahman", arabic: "الرَّحْمَٰن", transliteration: "Ar-Rahman", root: "ر ح م", meaning: "The Most Compassionate", exampleVerse: "1:3", category: "Allah & Divine Names" },
    { id: "rahim", arabic: "الرَّحِيم", transliteration: "Ar-Rahim", root: "ر ح م", meaning: "The Most Merciful", exampleVerse: "1:3", category: "Allah & Divine Names" },
    { id: "malik", arabic: "المَلِك", transliteration: "Al-Malik", root: "م ل ك", meaning: "The King, Sovereign", exampleVerse: "1:4", category: "Allah & Divine Names" },
    { id: "khaliq", arabic: "الخَالِق", transliteration: "Al-Khaliq", root: "خ ل ق", meaning: "The Creator", exampleVerse: "59:24", category: "Allah & Divine Names" },
    { id: "razzaq", arabic: "الرَّزَّاق", transliteration: "Ar-Razzaq", root: "ر ز ق", meaning: "The Provider", exampleVerse: "51:58", category: "Allah & Divine Names" },
    { id: "alim", arabic: "العَلِيم", transliteration: "Al-'Alim", root: "ع ل م", meaning: "The All-Knowing", exampleVerse: "2:32", category: "Allah & Divine Names" },
    { id: "hakim", arabic: "الحَكِيم", transliteration: "Al-Hakim", root: "ح ك م", meaning: "The All-Wise", exampleVerse: "2:32", category: "Allah & Divine Names" },
    { id: "aziz", arabic: "العَزِيز", transliteration: "Al-'Aziz", root: "ع ز ز", meaning: "The Almighty", exampleVerse: "2:209", category: "Allah & Divine Names" },
    { id: "ghafur", arabic: "الغَفُور", transliteration: "Al-Ghafur", root: "غ ف ر", meaning: "The Most Forgiving", exampleVerse: "2:173", category: "Allah & Divine Names" },
    { id: "wadud", arabic: "الوَدُود", transliteration: "Al-Wadud", root: "و د د", meaning: "The Most Loving", exampleVerse: "85:14", category: "Allah & Divine Names" },
    { id: "quddus", arabic: "القُدُّوس", transliteration: "Al-Quddus", root: "ق د س", meaning: "The Most Holy", exampleVerse: "59:23", category: "Allah & Divine Names" },
    { id: "salam", arabic: "السَّلَام", transliteration: "As-Salam", root: "س ل م", meaning: "The Peace", exampleVerse: "59:23", category: "Allah & Divine Names" },
    { id: "nur", arabic: "النُّور", transliteration: "An-Nur", root: "ن و ر", meaning: "The Light", exampleVerse: "24:35", category: "Allah & Divine Names" },
    { id: "haqq", arabic: "الحَقّ", transliteration: "Al-Haqq", root: "ح ق ق", meaning: "The Truth", exampleVerse: "22:6", category: "Allah & Divine Names" },
    { id: "shakur", arabic: "الشَّكُور", transliteration: "Ash-Shakur", root: "ش ك ر", meaning: "The Most Appreciative", exampleVerse: "35:30", category: "Allah & Divine Names" },

    // ──────────────────────────────────── PROPHETS & MESSENGERS ──
    { id: "nabi", arabic: "نَبِيّ", transliteration: "Nabi", root: "ن ب أ", meaning: "prophet", exampleVerse: "33:40", category: "Prophets & Messengers" },
    { id: "rasul", arabic: "رَسُول", transliteration: "Rasul", root: "ر س ل", meaning: "messenger", exampleVerse: "48:29", category: "Prophets & Messengers" },
    { id: "muhammad", arabic: "مُحَمَّد", transliteration: "Muhammad", meaning: "Muhammad ﷺ (the final prophet)", exampleVerse: "48:29", category: "Prophets & Messengers" },
    { id: "ibrahim", arabic: "إِبْرَاهِيم", transliteration: "Ibrahim", meaning: "Abraham", exampleVerse: "2:124", category: "Prophets & Messengers" },
    { id: "musa", arabic: "مُوسَى", transliteration: "Musa", meaning: "Moses", exampleVerse: "20:11", category: "Prophets & Messengers" },
    { id: "isa", arabic: "عِيسَى", transliteration: "'Isa", meaning: "Jesus", exampleVerse: "3:45", category: "Prophets & Messengers" },
    { id: "nuh", arabic: "نُوح", transliteration: "Nuh", meaning: "Noah", exampleVerse: "71:1", category: "Prophets & Messengers" },
    { id: "adam", arabic: "آدَم", transliteration: "Adam", meaning: "Adam (the first human)", exampleVerse: "2:31", category: "Prophets & Messengers" },
    { id: "yusuf", arabic: "يُوسُف", transliteration: "Yusuf", meaning: "Joseph", exampleVerse: "12:4", category: "Prophets & Messengers" },
    { id: "yunus", arabic: "يُونُس", transliteration: "Yunus", meaning: "Jonah", exampleVerse: "21:87", category: "Prophets & Messengers" },

    // ──────────────────────────────────── QURAN & SCRIPTURE ──
    { id: "quran-word", arabic: "قُرْآن", transliteration: "Qur'an", root: "ق ر أ", meaning: "recitation, the Book", exampleVerse: "12:2", category: "Quran & Scripture" },
    { id: "kitab", arabic: "كِتَاب", transliteration: "Kitab", root: "ك ت ب", meaning: "book, scripture", exampleVerse: "2:2", category: "Quran & Scripture" },
    { id: "ayah", arabic: "آيَة", transliteration: "Ayah", meaning: "sign, verse", exampleVerse: "2:106", category: "Quran & Scripture" },
    { id: "surah", arabic: "سُورَة", transliteration: "Surah", meaning: "chapter (of the Quran)", exampleVerse: "2:23", category: "Quran & Scripture" },
    { id: "dhikr", arabic: "ذِكْر", transliteration: "Dhikr", root: "ذ ك ر", meaning: "remembrance, reminder", exampleVerse: "15:9", category: "Quran & Scripture" },
    { id: "furqan", arabic: "فُرْقَان", transliteration: "Furqan", root: "ف ر ق", meaning: "criterion (that distinguishes truth from falsehood)", exampleVerse: "25:1", category: "Quran & Scripture" },
    { id: "huda", arabic: "هُدَى", transliteration: "Huda", root: "ه د ي", meaning: "guidance", exampleVerse: "2:2", category: "Quran & Scripture" },
    { id: "bayan", arabic: "بَيَان", transliteration: "Bayan", root: "ب ي ن", meaning: "clarification, clear statement", exampleVerse: "3:138", category: "Quran & Scripture" },
    { id: "burhan", arabic: "بُرْهَان", transliteration: "Burhan", meaning: "proof, clear evidence", exampleVerse: "4:174", category: "Quran & Scripture" },
    { id: "haqq-truth", arabic: "حَقّ", transliteration: "Haqq", root: "ح ق ق", meaning: "truth, right", exampleVerse: "17:81", category: "Quran & Scripture" },
    { id: "batil", arabic: "بَاطِل", transliteration: "Batil", root: "ب ط ل", meaning: "falsehood, vain", exampleVerse: "17:81", category: "Quran & Scripture" },
    { id: "ilm", arabic: "عِلْم", transliteration: "'Ilm", root: "ع ل م", meaning: "knowledge", exampleVerse: "20:114", category: "Quran & Scripture" },
    { id: "hikmah", arabic: "حِكْمَة", transliteration: "Hikmah", root: "ح ك م", meaning: "wisdom", exampleVerse: "2:269", category: "Quran & Scripture" },
    { id: "bayyinah", arabic: "بَيِّنَة", transliteration: "Bayyinah", meaning: "clear proof", exampleVerse: "98:1", category: "Quran & Scripture" },
    { id: "wahy", arabic: "وَحْي", transliteration: "Wahy", meaning: "revelation", exampleVerse: "42:52", category: "Quran & Scripture" },

    // ──────────────────────────────────── WORSHIP & SPIRITUALITY ──
    { id: "salah", arabic: "صَلَاة", transliteration: "Salah", root: "ص ل و", meaning: "prayer (the five daily prayers)", exampleVerse: "2:43", category: "Worship & Spirituality" },
    { id: "zakah", arabic: "زَكَاة", transliteration: "Zakah", root: "ز ك و", meaning: "obligatory alms, purification", exampleVerse: "2:43", category: "Worship & Spirituality" },
    { id: "sawm", arabic: "صَوْم", transliteration: "Sawm", root: "ص و م", meaning: "fasting", exampleVerse: "2:183", category: "Worship & Spirituality" },
    { id: "hajj-word", arabic: "حَجّ", transliteration: "Hajj", root: "ح ج ج", meaning: "pilgrimage to Mecca", exampleVerse: "2:196", category: "Worship & Spirituality" },
    { id: "ibadah", arabic: "عِبَادَة", transliteration: "'Ibadah", root: "ع ب د", meaning: "worship, servitude to Allah", exampleVerse: "51:56", category: "Worship & Spirituality" },
    { id: "dua", arabic: "دُعَاء", transliteration: "Du'a", root: "د ع و", meaning: "supplication, calling upon Allah", exampleVerse: "40:60", category: "Worship & Spirituality" },
    { id: "tasbih", arabic: "تَسْبِيح", transliteration: "Tasbih", root: "س ب ح", meaning: "glorification (of Allah)", exampleVerse: "17:44", category: "Worship & Spirituality" },
    { id: "sujud", arabic: "سُجُود", transliteration: "Sujud", root: "س ج د", meaning: "prostration", exampleVerse: "22:18", category: "Worship & Spirituality" },
    { id: "ruku", arabic: "رُكُوع", transliteration: "Ruku'", root: "ر ك ع", meaning: "bowing (in prayer)", exampleVerse: "2:43", category: "Worship & Spirituality" },
    { id: "sabr", arabic: "صَبْر", transliteration: "Sabr", root: "ص ب ر", meaning: "patience, perseverance", exampleVerse: "2:153", category: "Worship & Spirituality" },
    { id: "shukr", arabic: "شُكْر", transliteration: "Shukr", root: "ش ك ر", meaning: "gratitude", exampleVerse: "14:7", category: "Worship & Spirituality" },
    { id: "tawakkul", arabic: "تَوَكُّل", transliteration: "Tawakkul", root: "و ك ل", meaning: "reliance upon Allah", exampleVerse: "3:159", category: "Worship & Spirituality" },
    { id: "ikhlas", arabic: "إِخْلَاص", transliteration: "Ikhlas", root: "خ ل ص", meaning: "sincerity", exampleVerse: "98:5", category: "Worship & Spirituality" },
    { id: "iman", arabic: "إِيمَان", transliteration: "Iman", root: "أ م ن", meaning: "faith, belief", exampleVerse: "49:7", category: "Worship & Spirituality" },
    { id: "islam-word", arabic: "إِسْلَام", transliteration: "Islam", root: "س ل م", meaning: "submission to Allah", exampleVerse: "3:19", category: "Worship & Spirituality" },
    { id: "ihsan", arabic: "إِحْسَان", transliteration: "Ihsan", root: "ح س ن", meaning: "excellence in worship", exampleVerse: "16:90", category: "Worship & Spirituality" },
    { id: "taqwa", arabic: "تَقْوَى", transliteration: "Taqwa", root: "و ق ي", meaning: "God-consciousness, piety", exampleVerse: "2:2", category: "Worship & Spirituality" },
    { id: "tawbah", arabic: "تَوْبَة", transliteration: "Tawbah", root: "ت و ب", meaning: "repentance", exampleVerse: "2:222", category: "Worship & Spirituality" },
    { id: "istighfar", arabic: "اِسْتِغْفَار", transliteration: "Istighfar", root: "غ ف ر", meaning: "seeking forgiveness", exampleVerse: "71:10", category: "Worship & Spirituality" },
    { id: "jihad", arabic: "جِهَاد", transliteration: "Jihad", root: "ج ه د", meaning: "struggle, striving (for Allah's sake)", exampleVerse: "9:41", category: "Worship & Spirituality" },

    // ──────────────────────────────────── HEREAFTER & JUDGMENT ──
    { id: "jannah", arabic: "جَنَّة", transliteration: "Jannah", root: "ج ن ن", meaning: "paradise, garden", exampleVerse: "2:25", category: "Hereafter & Judgment" },
    { id: "nar", arabic: "نَار", transliteration: "Nar", root: "ن و ر", meaning: "fire (often hellfire)", exampleVerse: "2:24", category: "Hereafter & Judgment" },
    { id: "firdaws", arabic: "فِرْدَوْس", transliteration: "Firdaws", meaning: "the highest paradise", exampleVerse: "23:11", category: "Hereafter & Judgment" },
    { id: "jahannam", arabic: "جَهَنَّم", transliteration: "Jahannam", meaning: "Hellfire", exampleVerse: "78:21", category: "Hereafter & Judgment" },
    { id: "ridwan", arabic: "رِضْوَان", transliteration: "Ridwan", root: "ر ض و", meaning: "divine pleasure, approval", exampleVerse: "9:72", category: "Hereafter & Judgment" },
    { id: "adhab", arabic: "عَذَاب", transliteration: "'Adhab", meaning: "punishment, torment", exampleVerse: "2:10", category: "Hereafter & Judgment" },
    { id: "ajr", arabic: "أَجْر", transliteration: "Ajr", root: "أ ج ر", meaning: "reward, wage", exampleVerse: "2:62", category: "Hereafter & Judgment" },
    { id: "thawab", arabic: "ثَوَاب", transliteration: "Thawab", root: "ث و ب", meaning: "reward, recompense", exampleVerse: "3:148", category: "Hereafter & Judgment" },
    { id: "qiyamah", arabic: "قِيَامَة", transliteration: "Qiyamah", root: "ق و م", meaning: "resurrection, rising up", exampleVerse: "75:1", category: "Hereafter & Judgment" },
    { id: "akhirah", arabic: "آخِرَة", transliteration: "Akhirah", root: "أ خ ر", meaning: "the hereafter, last life", exampleVerse: "2:4", category: "Hereafter & Judgment" },
    { id: "dunya", arabic: "دُنْيَا", transliteration: "Dunya", root: "د ن و", meaning: "this world, the lower life", exampleVerse: "2:201", category: "Hereafter & Judgment" },
    { id: "qabr", arabic: "قَبْر", transliteration: "Qabr", root: "ق ب ر", meaning: "grave", exampleVerse: "22:7", category: "Hereafter & Judgment" },
    { id: "bath", arabic: "بَعْث", transliteration: "Ba'th", root: "ب ع ث", meaning: "resurrection, raising from the dead", exampleVerse: "22:5", category: "Hereafter & Judgment" },
    { id: "hisab", arabic: "حِسَاب", transliteration: "Hisab", root: "ح س ب", meaning: "reckoning, account", exampleVerse: "2:202", category: "Hereafter & Judgment" },
    { id: "mizan", arabic: "مِيزَان", transliteration: "Mizan", root: "و ز ن", meaning: "scale, balance", exampleVerse: "21:47", category: "Hereafter & Judgment" },

    // ──────────────────────────────────── CREATION & NATURE ──
    { id: "sama", arabic: "سَمَاء", transliteration: "Sama'", root: "س م و", meaning: "sky, heaven", exampleVerse: "2:22", category: "Creation & Nature" },
    { id: "ard", arabic: "أَرْض", transliteration: "Ard", root: "أ ر ض", meaning: "earth, land", exampleVerse: "2:22", category: "Creation & Nature" },
    { id: "jabal", arabic: "جَبَل", transliteration: "Jabal", root: "ج ب ل", meaning: "mountain", exampleVerse: "59:21", category: "Creation & Nature" },
    { id: "bahr", arabic: "بَحْر", transliteration: "Bahr", root: "ب ح ر", meaning: "sea", exampleVerse: "17:70", category: "Creation & Nature" },
    { id: "nahr", arabic: "نَهْر", transliteration: "Nahr", root: "ن ه ر", meaning: "river", exampleVerse: "2:25", category: "Creation & Nature" },
    { id: "shams", arabic: "شَمْس", transliteration: "Shams", root: "ش م س", meaning: "sun", exampleVerse: "91:1", category: "Creation & Nature" },
    { id: "qamar", arabic: "قَمَر", transliteration: "Qamar", root: "ق م ر", meaning: "moon", exampleVerse: "91:2", category: "Creation & Nature" },
    { id: "najm", arabic: "نَجْم", transliteration: "Najm", root: "ن ج م", meaning: "star", exampleVerse: "53:1", category: "Creation & Nature" },
    { id: "rih", arabic: "رِيح", transliteration: "Rih", root: "ر و ح", meaning: "wind", exampleVerse: "15:22", category: "Creation & Nature" },
    { id: "matar", arabic: "مَطَر", transliteration: "Matar", root: "م ط ر", meaning: "rain", exampleVerse: "26:173", category: "Creation & Nature" },
    { id: "shajar", arabic: "شَجَر", transliteration: "Shajar", root: "ش ج ر", meaning: "tree", exampleVerse: "28:30", category: "Creation & Nature" },
    { id: "nabat", arabic: "نَبَات", transliteration: "Nabat", root: "ن ب ت", meaning: "plant, vegetation", exampleVerse: "20:53", category: "Creation & Nature" },
    { id: "insan", arabic: "إِنْسَان", transliteration: "Insan", root: "أ ن س", meaning: "human being", exampleVerse: "95:4", category: "Creation & Nature" },
    { id: "ruh", arabic: "رُوح", transliteration: "Ruh", root: "ر و ح", meaning: "spirit, soul", exampleVerse: "17:85", category: "Creation & Nature" },
    { id: "nafs", arabic: "نَفْس", transliteration: "Nafs", root: "ن ف س", meaning: "soul, self, person", exampleVerse: "91:7", category: "Creation & Nature" },
    { id: "yad", arabic: "يَد", transliteration: "Yad", root: "ي د ي", meaning: "hand", exampleVerse: "48:10", category: "Creation & Nature" },
    { id: "ayn", arabic: "عَيْن", transliteration: "'Ayn", root: "ع ي ن", meaning: "eye, spring", exampleVerse: "2:60", category: "Creation & Nature" },
    { id: "qalb", arabic: "قَلْب", transliteration: "Qalb", root: "ق ل ب", meaning: "heart", exampleVerse: "50:37", category: "Creation & Nature" },
    { id: "ma", arabic: "مَاء", transliteration: "Ma'", root: "م و ه", meaning: "water", exampleVerse: "21:30", category: "Creation & Nature" },
    { id: "nur-light", arabic: "نُور", transliteration: "Nur", root: "ن و ر", meaning: "light", exampleVerse: "24:35", category: "Creation & Nature" },

    // ──────────────────────────────────── FAMILY & PEOPLE ──
    { id: "ab", arabic: "أَب", transliteration: "Ab", root: "أ ب و", meaning: "father", exampleVerse: "12:4", category: "Family & People" },
    { id: "umm", arabic: "أُمّ", transliteration: "Umm", root: "أ م م", meaning: "mother", exampleVerse: "46:15", category: "Family & People" },
    { id: "akh", arabic: "أَخ", transliteration: "Akh", root: "أ خ و", meaning: "brother", exampleVerse: "49:10", category: "Family & People" },
    { id: "ukht", arabic: "أُخْت", transliteration: "Ukht", root: "أ خ و", meaning: "sister", exampleVerse: "4:176", category: "Family & People" },
    { id: "ibn", arabic: "اِبْن", transliteration: "Ibn", root: "ب ن ي", meaning: "son", exampleVerse: "2:40", category: "Family & People" },
    { id: "bint", arabic: "بِنْت", transliteration: "Bint", root: "ب ن ي", meaning: "daughter", exampleVerse: "33:35", category: "Family & People" },
    { id: "zawj", arabic: "زَوْج", transliteration: "Zawj", root: "ز و ج", meaning: "spouse (husband or wife, pair)", exampleVerse: "2:35", category: "Family & People" },
    { id: "ahl", arabic: "أَهْل", transliteration: "Ahl", root: "أ ه ل", meaning: "family, people of", exampleVerse: "33:33", category: "Family & People" },
    { id: "qawm", arabic: "قَوْم", transliteration: "Qawm", root: "ق و م", meaning: "people, nation", exampleVerse: "11:25", category: "Family & People" },
    { id: "ummah", arabic: "أُمَّة", transliteration: "Ummah", root: "أ م م", meaning: "nation, community", exampleVerse: "2:143", category: "Family & People" },
    { id: "nas", arabic: "نَاس", transliteration: "Nas", root: "ن و س", meaning: "mankind, people", exampleVerse: "114:1", category: "Family & People" },
    { id: "rajul", arabic: "رَجُل", transliteration: "Rajul", root: "ر ج ل", meaning: "man", exampleVerse: "28:20", category: "Family & People" },
    { id: "imra", arabic: "اِمْرَأَة", transliteration: "Imra'ah", root: "م ر أ", meaning: "woman", exampleVerse: "3:35", category: "Family & People" },
    { id: "walad", arabic: "وَلَد", transliteration: "Walad", root: "و ل د", meaning: "child, boy", exampleVerse: "19:19", category: "Family & People" },
    { id: "jar", arabic: "جَار", transliteration: "Jar", root: "ج و ر", meaning: "neighbor", exampleVerse: "4:36", category: "Family & People" },

    // ──────────────────────────────────── VIRTUES & CHARACTER ──
    { id: "hubb", arabic: "حُبّ", transliteration: "Hubb", root: "ح ب ب", meaning: "love", exampleVerse: "5:54", category: "Virtues & Character" },
    { id: "rahmah", arabic: "رَحْمَة", transliteration: "Rahmah", root: "ر ح م", meaning: "mercy", exampleVerse: "21:107", category: "Virtues & Character" },
    { id: "karam", arabic: "كَرَم", transliteration: "Karam", root: "ك ر م", meaning: "generosity, nobility", exampleVerse: "49:13", category: "Virtues & Character" },
    { id: "adl", arabic: "عَدْل", transliteration: "'Adl", root: "ع د ل", meaning: "justice", exampleVerse: "16:90", category: "Virtues & Character" },
    { id: "hilm", arabic: "حِلْم", transliteration: "Hilm", root: "ح ل م", meaning: "forbearance, clemency", exampleVerse: "2:225", category: "Virtues & Character" },
    { id: "amanah", arabic: "أَمَانَة", transliteration: "Amanah", root: "أ م ن", meaning: "trust, trustworthiness", exampleVerse: "33:72", category: "Virtues & Character" },
    { id: "sidq", arabic: "صِدْق", transliteration: "Sidq", root: "ص د ق", meaning: "truthfulness, honesty", exampleVerse: "39:33", category: "Virtues & Character" },
    { id: "tawadu", arabic: "تَوَاضُع", transliteration: "Tawadu'", root: "و ض ع", meaning: "humility", exampleVerse: "25:63", category: "Virtues & Character" },
    { id: "khashyah", arabic: "خَشْيَة", transliteration: "Khashyah", root: "خ ش ي", meaning: "awe, reverential fear", exampleVerse: "35:28", category: "Virtues & Character" },
    { id: "haya", arabic: "حَيَاء", transliteration: "Haya'", root: "ح ي ي", meaning: "modesty, shyness", category: "Virtues & Character", notes: "A core Islamic virtue mentioned in hadith as 'a branch of faith.'" },
    { id: "fadl", arabic: "فَضْل", transliteration: "Fadl", root: "ف ض ل", meaning: "favor, bounty, grace", exampleVerse: "2:64", category: "Virtues & Character" },
    { id: "barakah", arabic: "بَرَكَة", transliteration: "Barakah", root: "ب ر ك", meaning: "blessing", exampleVerse: "7:96", category: "Virtues & Character" },
    { id: "salah-righteousness", arabic: "صَلَاح", transliteration: "Salah", root: "ص ل ح", meaning: "righteousness, uprightness", exampleVerse: "27:19", category: "Virtues & Character" },
    { id: "birr", arabic: "بِرّ", transliteration: "Birr", root: "ب ر ر", meaning: "righteousness, devotion to parents", exampleVerse: "2:177", category: "Virtues & Character" },
    { id: "ihsan-kind", arabic: "إِحْسَان", transliteration: "Ihsan (kindness)", root: "ح س ن", meaning: "doing good to others", exampleVerse: "17:23", category: "Virtues & Character" },

    // ──────────────────────────────────── VICES & WARNINGS ──
    { id: "kufr", arabic: "كُفْر", transliteration: "Kufr", root: "ك ف ر", meaning: "disbelief, ingratitude", exampleVerse: "2:6", category: "Vices & Warnings" },
    { id: "shirk", arabic: "شِرْك", transliteration: "Shirk", root: "ش ر ك", meaning: "associating partners with Allah", exampleVerse: "31:13", category: "Vices & Warnings" },
    { id: "nifaq", arabic: "نِفَاق", transliteration: "Nifaq", root: "ن ف ق", meaning: "hypocrisy", exampleVerse: "9:77", category: "Vices & Warnings" },
    { id: "zulm", arabic: "ظُلْم", transliteration: "Zulm", root: "ظ ل م", meaning: "injustice, oppression, wrongdoing", exampleVerse: "31:13", category: "Vices & Warnings" },
    { id: "kadhib", arabic: "كَذِب", transliteration: "Kadhib", root: "ك ذ ب", meaning: "lying", exampleVerse: "39:3", category: "Vices & Warnings" },
    { id: "hasad", arabic: "حَسَد", transliteration: "Hasad", root: "ح س د", meaning: "envy", exampleVerse: "113:5", category: "Vices & Warnings" },
    { id: "kibr", arabic: "كِبْر", transliteration: "Kibr", root: "ك ب ر", meaning: "arrogance, pride", exampleVerse: "40:35", category: "Vices & Warnings" },
    { id: "fisq", arabic: "فِسْق", transliteration: "Fisq", root: "ف س ق", meaning: "transgression, sinful disobedience", exampleVerse: "2:197", category: "Vices & Warnings" },
    { id: "baghy", arabic: "بَغْي", transliteration: "Baghy", root: "ب غ ي", meaning: "oppression, transgression", exampleVerse: "16:90", category: "Vices & Warnings" },
    { id: "fitnah", arabic: "فِتْنَة", transliteration: "Fitnah", root: "ف ت ن", meaning: "trial, temptation, civil strife", exampleVerse: "2:191", category: "Vices & Warnings" },
    { id: "riba", arabic: "رِبَا", transliteration: "Riba", root: "ر ب و", meaning: "usury, interest", exampleVerse: "2:275", category: "Vices & Warnings" },
    { id: "ghayba", arabic: "غَيْبَة", transliteration: "Ghaybah", root: "غ ي ب", meaning: "backbiting", exampleVerse: "49:12", category: "Vices & Warnings" },
    { id: "israf", arabic: "إِسْرَاف", transliteration: "Israf", root: "س ر ف", meaning: "extravagance, wastefulness", exampleVerse: "7:31", category: "Vices & Warnings" },
    { id: "bukhl", arabic: "بُخْل", transliteration: "Bukhl", root: "ب خ ل", meaning: "miserliness, stinginess", exampleVerse: "47:38", category: "Vices & Warnings" },
    { id: "ghadab", arabic: "غَضَب", transliteration: "Ghadab", root: "غ ض ب", meaning: "anger, wrath", exampleVerse: "1:7", category: "Vices & Warnings" },

    // ──────────────────────────────────── COMMON VERBS ──
    { id: "qala", arabic: "قَالَ", transliteration: "Qala", root: "ق و ل", meaning: "he said", exampleVerse: "2:30", category: "Common Verbs", notes: "Appears ~1700 times in the Quran." },
    { id: "faala", arabic: "فَعَلَ", transliteration: "Fa'ala", root: "ف ع ل", meaning: "he did", exampleVerse: "18:29", category: "Common Verbs" },
    { id: "khalaqa", arabic: "خَلَقَ", transliteration: "Khalaqa", root: "خ ل ق", meaning: "he created", exampleVerse: "96:1", category: "Common Verbs" },
    { id: "alima", arabic: "عَلِمَ", transliteration: "'Alima", root: "ع ل م", meaning: "he knew", exampleVerse: "2:30", category: "Common Verbs" },
    { id: "ra-a", arabic: "رَأَى", transliteration: "Ra'a", root: "ر أ ي", meaning: "he saw", exampleVerse: "53:11", category: "Common Verbs" },
    { id: "samia", arabic: "سَمِعَ", transliteration: "Sami'a", root: "س م ع", meaning: "he heard", exampleVerse: "58:1", category: "Common Verbs" },
    { id: "amila", arabic: "عَمِلَ", transliteration: "'Amila", root: "ع م ل", meaning: "he worked, he did (a deed)", exampleVerse: "99:7", category: "Common Verbs" },
    { id: "dhahaba", arabic: "ذَهَبَ", transliteration: "Dhahaba", root: "ذ ه ب", meaning: "he went", exampleVerse: "12:17", category: "Common Verbs" },
    { id: "jaa", arabic: "جَاءَ", transliteration: "Ja'a", root: "ج ي أ", meaning: "he came", exampleVerse: "17:81", category: "Common Verbs" },
    { id: "kana", arabic: "كَانَ", transliteration: "Kana", root: "ك و ن", meaning: "he was (copula)", exampleVerse: "3:97", category: "Common Verbs", notes: "One of the most common verbs in the Quran." },
    { id: "akala", arabic: "أَكَلَ", transliteration: "Akala", root: "أ ك ل", meaning: "he ate", exampleVerse: "2:35", category: "Common Verbs" },
    { id: "shariba", arabic: "شَرِبَ", transliteration: "Shariba", root: "ش ر ب", meaning: "he drank", exampleVerse: "2:60", category: "Common Verbs" },
    { id: "kataba", arabic: "كَتَبَ", transliteration: "Kataba", root: "ك ت ب", meaning: "he wrote", exampleVerse: "2:282", category: "Common Verbs" },
    { id: "qara-a", arabic: "قَرَأَ", transliteration: "Qara'a", root: "ق ر أ", meaning: "he read, recited", exampleVerse: "96:1", category: "Common Verbs" },
    { id: "dhakara", arabic: "ذَكَرَ", transliteration: "Dhakara", root: "ذ ك ر", meaning: "he remembered, mentioned", exampleVerse: "2:152", category: "Common Verbs" },
    { id: "nasiya", arabic: "نَسِيَ", transliteration: "Nasiya", root: "ن س ي", meaning: "he forgot", exampleVerse: "20:115", category: "Common Verbs" },
    { id: "arada", arabic: "أَرَادَ", transliteration: "Arada", root: "ر و د", meaning: "he wanted, intended", exampleVerse: "2:185", category: "Common Verbs" },
    { id: "wajada", arabic: "وَجَدَ", transliteration: "Wajada", root: "و ج د", meaning: "he found", exampleVerse: "28:23", category: "Common Verbs" },
    { id: "amana", arabic: "آمَنَ", transliteration: "Amana", root: "أ م ن", meaning: "he believed", exampleVerse: "2:62", category: "Common Verbs" },
    { id: "nazala", arabic: "نَزَلَ", transliteration: "Nazala", root: "ن ز ل", meaning: "he descended / it was revealed", exampleVerse: "2:23", category: "Common Verbs" },
    { id: "sajada", arabic: "سَجَدَ", transliteration: "Sajada", root: "س ج د", meaning: "he prostrated", exampleVerse: "2:34", category: "Common Verbs" },
    { id: "kafara", arabic: "كَفَرَ", transliteration: "Kafara", root: "ك ف ر", meaning: "he disbelieved, concealed", exampleVerse: "2:6", category: "Common Verbs" },
    { id: "zalama", arabic: "ظَلَمَ", transliteration: "Zalama", root: "ظ ل م", meaning: "he wronged, was unjust", exampleVerse: "2:35", category: "Common Verbs" },
    { id: "ghafara", arabic: "غَفَرَ", transliteration: "Ghafara", root: "غ ف ر", meaning: "he forgave", exampleVerse: "39:53", category: "Common Verbs" },
    { id: "rahima", arabic: "رَحِمَ", transliteration: "Rahima", root: "ر ح م", meaning: "he had mercy", exampleVerse: "12:53", category: "Common Verbs" },

    // ──────────────────────────────────── EVERYDAY NOUNS ──
    { id: "bayt", arabic: "بَيْت", transliteration: "Bayt", root: "ب ي ت", meaning: "house, home", exampleVerse: "2:125", category: "Everyday Nouns" },
    { id: "taam", arabic: "طَعَام", transliteration: "Ta'am", root: "ط ع م", meaning: "food", exampleVerse: "5:5", category: "Everyday Nouns" },
    { id: "sabil", arabic: "سَبِيل", transliteration: "Sabil", root: "س ب ل", meaning: "way, path (of Allah)", exampleVerse: "2:154", category: "Everyday Nouns" },
    { id: "tariq", arabic: "طَرِيق", transliteration: "Tariq", root: "ط ر ق", meaning: "road, path", exampleVerse: "86:1", category: "Everyday Nouns" },
    { id: "sirat", arabic: "صِرَاط", transliteration: "Sirat", meaning: "straight path", exampleVerse: "1:6", category: "Everyday Nouns" },
    { id: "makan", arabic: "مَكَان", transliteration: "Makan", root: "ك و ن", meaning: "place, location", exampleVerse: "19:16", category: "Everyday Nouns" },
    { id: "zaman", arabic: "زَمَان", transliteration: "Zaman", meaning: "time, era", category: "Everyday Nouns" },
    { id: "yawm", arabic: "يَوْم", transliteration: "Yawm", root: "ي و م", meaning: "day", exampleVerse: "1:4", category: "Everyday Nouns", notes: "Appears ~400 times in the Quran." },
    { id: "layl", arabic: "لَيْل", transliteration: "Layl", root: "ل ي ل", meaning: "night", exampleVerse: "97:1", category: "Everyday Nouns" },
    { id: "nahar", arabic: "نَهَار", transliteration: "Nahar", root: "ن ه ر", meaning: "daytime", exampleVerse: "3:190", category: "Everyday Nouns" },
    { id: "sanah", arabic: "سَنَة", transliteration: "Sanah", root: "س ن و", meaning: "year", exampleVerse: "2:96", category: "Everyday Nouns" },
    { id: "shahr", arabic: "شَهْر", transliteration: "Shahr", root: "ش ه ر", meaning: "month", exampleVerse: "2:185", category: "Everyday Nouns" },
    { id: "saah", arabic: "سَاعَة", transliteration: "Sa'ah", root: "س و ع", meaning: "hour, the Hour (of Judgment)", exampleVerse: "22:1", category: "Everyday Nouns" },
    { id: "hayah", arabic: "حَيَاة", transliteration: "Hayah", root: "ح ي ي", meaning: "life", exampleVerse: "2:28", category: "Everyday Nouns" },
    { id: "mawt", arabic: "مَوْت", transliteration: "Mawt", root: "م و ت", meaning: "death", exampleVerse: "3:185", category: "Everyday Nouns" },
    { id: "masjid", arabic: "مَسْجِد", transliteration: "Masjid", root: "س ج د", meaning: "mosque (place of prostration)", exampleVerse: "2:144", category: "Everyday Nouns" },
    { id: "kaaba", arabic: "كَعْبَة", transliteration: "Ka'bah", root: "ك ع ب", meaning: "the Ka'bah in Mecca", exampleVerse: "5:95", category: "Everyday Nouns" },
    { id: "makkah", arabic: "مَكَّة", transliteration: "Makkah", meaning: "Mecca", exampleVerse: "48:24", category: "Everyday Nouns" },
    { id: "madinah", arabic: "مَدِينَة", transliteration: "Madinah", root: "م د ن", meaning: "city, Medina", exampleVerse: "9:101", category: "Everyday Nouns" },
    { id: "rizq", arabic: "رِزْق", transliteration: "Rizq", root: "ر ز ق", meaning: "provision, sustenance", exampleVerse: "2:3", category: "Everyday Nouns" },
];

export const VOCAB_CATEGORIES: VocabCategory[] = [
    "Allah & Divine Names",
    "Prophets & Messengers",
    "Quran & Scripture",
    "Worship & Spirituality",
    "Hereafter & Judgment",
    "Creation & Nature",
    "Family & People",
    "Virtues & Character",
    "Vices & Warnings",
    "Common Verbs",
    "Everyday Nouns",
];
