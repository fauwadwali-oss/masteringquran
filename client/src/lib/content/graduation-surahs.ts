// Milestone 7, the graduation surahs.
// Five short, iconic surahs every Muslim learns first. Each is fully
// broken out word-by-word with transliteration and meaning, ready for
// tap-to-read practice. Quran.com word audio provides real reciter audio.
// Portable pure-data module.

export interface GradSurahWord {
    arabic: string;
    transliteration: string;
    meaning: string;
    note?: string;
}

export interface GradSurahVerse {
    verseKey: string;
    words: GradSurahWord[];
    fullArabic: string;
    fullTranslation: string;
}

export interface GradSurah {
    surahNumber: number;
    nameArabic: string;
    nameTranslit: string;
    nameEnglish: string;
    description: string;
    verses: GradSurahVerse[];
}

export const GRADUATION_SURAHS: GradSurah[] = [
    // ───────────────────────────────── AL-FATIHA (1), 7 verses ──
    {
        surahNumber: 1,
        nameArabic: "الفَاتِحَة",
        nameTranslit: "Al-Fatihah",
        nameEnglish: "The Opening",
        description:
            "The opening chapter of the Quran and recited in every rak'ah of every prayer, at least 17 times a day for a practicing Muslim. Called 'The Mother of the Book' (Umm al-Kitab).",
        verses: [
            {
                verseKey: "1:1",
                fullArabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
                fullTranslation: "In the Name of Allah, the Most Compassionate, the Most Merciful.",
                words: [
                    { arabic: "بِسْمِ", transliteration: "bismi", meaning: "in the name of" },
                    { arabic: "اللَّهِ", transliteration: "Allahi", meaning: "Allah" },
                    { arabic: "الرَّحْمَٰنِ", transliteration: "ar-Rahmani", meaning: "the Most Compassionate" },
                    { arabic: "الرَّحِيمِ", transliteration: "ar-Rahim", meaning: "the Most Merciful" },
                ],
            },
            {
                verseKey: "1:2",
                fullArabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
                fullTranslation: "All praise is for Allah, Lord of all worlds.",
                words: [
                    { arabic: "الْحَمْدُ", transliteration: "alhamdu", meaning: "all praise" },
                    { arabic: "لِلَّهِ", transliteration: "lillahi", meaning: "is for Allah" },
                    { arabic: "رَبِّ", transliteration: "Rabbi", meaning: "Lord of" },
                    { arabic: "الْعَالَمِينَ", transliteration: "al-'alamin", meaning: "the worlds" },
                ],
            },
            {
                verseKey: "1:3",
                fullArabic: "الرَّحْمَٰنِ الرَّحِيمِ",
                fullTranslation: "The Most Compassionate, the Most Merciful.",
                words: [
                    { arabic: "الرَّحْمَٰنِ", transliteration: "ar-Rahmani", meaning: "the Most Compassionate" },
                    { arabic: "الرَّحِيمِ", transliteration: "ar-Rahim", meaning: "the Most Merciful" },
                ],
            },
            {
                verseKey: "1:4",
                fullArabic: "مَالِكِ يَوْمِ الدِّينِ",
                fullTranslation: "Master of the Day of Judgment.",
                words: [
                    { arabic: "مَالِكِ", transliteration: "maliki", meaning: "Master of" },
                    { arabic: "يَوْمِ", transliteration: "yawmi", meaning: "the Day of" },
                    { arabic: "الدِّينِ", transliteration: "ad-din", meaning: "Judgment" },
                ],
            },
            {
                verseKey: "1:5",
                fullArabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
                fullTranslation: "You alone we worship, and You alone we ask for help.",
                words: [
                    { arabic: "إِيَّاكَ", transliteration: "iyyaka", meaning: "You alone" },
                    { arabic: "نَعْبُدُ", transliteration: "na'budu", meaning: "we worship" },
                    { arabic: "وَإِيَّاكَ", transliteration: "wa iyyaka", meaning: "and You alone" },
                    { arabic: "نَسْتَعِينُ", transliteration: "nasta'in", meaning: "we ask for help" },
                ],
            },
            {
                verseKey: "1:6",
                fullArabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
                fullTranslation: "Guide us to the Straight Path.",
                words: [
                    { arabic: "اهْدِنَا", transliteration: "ihdina", meaning: "guide us" },
                    { arabic: "الصِّرَاطَ", transliteration: "as-sirata", meaning: "the path" },
                    { arabic: "الْمُسْتَقِيمَ", transliteration: "al-mustaqim", meaning: "the straight" },
                ],
            },
            {
                verseKey: "1:7",
                fullArabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
                fullTranslation: "The path of those You have blessed, not of those who earned wrath, nor of those who went astray.",
                words: [
                    { arabic: "صِرَاطَ", transliteration: "sirata", meaning: "path of" },
                    { arabic: "الَّذِينَ", transliteration: "alladhina", meaning: "those whom" },
                    { arabic: "أَنْعَمْتَ", transliteration: "an'amta", meaning: "You have blessed" },
                    { arabic: "عَلَيْهِمْ", transliteration: "'alayhim", meaning: "upon them" },
                    { arabic: "غَيْرِ", transliteration: "ghayri", meaning: "not of" },
                    { arabic: "الْمَغْضُوبِ", transliteration: "al-maghdubi", meaning: "those with wrath" },
                    { arabic: "عَلَيْهِمْ", transliteration: "'alayhim", meaning: "upon them" },
                    { arabic: "وَلَا", transliteration: "wa la", meaning: "and not" },
                    { arabic: "الضَّالِّينَ", transliteration: "ad-dalleen", meaning: "the astray", note: "classic madd lazim, hold 6 counts" },
                ],
            },
        ],
    },

    // ───────────────────────────────── AL-KAWTHAR (108), 3 verses ──
    {
        surahNumber: 108,
        nameArabic: "الكَوْثَر",
        nameTranslit: "Al-Kawthar",
        nameEnglish: "The Abundance",
        description:
            "The shortest surah of the Quran, only 3 verses. Revealed to comfort the Prophet ﷺ after the death of his son and the taunts of his enemies. 'Al-Kawthar' is also the name of a river of abundance in Paradise.",
        verses: [
            {
                verseKey: "108:1",
                fullArabic: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ",
                fullTranslation: "Indeed We have granted you abundance.",
                words: [
                    { arabic: "إِنَّا", transliteration: "inna", meaning: "indeed We" },
                    { arabic: "أَعْطَيْنَاكَ", transliteration: "a'taynaka", meaning: "have granted you" },
                    { arabic: "الْكَوْثَرَ", transliteration: "al-kawthar", meaning: "abundance / Al-Kawthar (the river)" },
                ],
            },
            {
                verseKey: "108:2",
                fullArabic: "فَصَلِّ لِرَبِّكَ وَانْحَرْ",
                fullTranslation: "So pray to your Lord and sacrifice (to Him alone).",
                words: [
                    { arabic: "فَصَلِّ", transliteration: "fa salli", meaning: "so pray" },
                    { arabic: "لِرَبِّكَ", transliteration: "li rabbika", meaning: "to your Lord" },
                    { arabic: "وَانْحَرْ", transliteration: "wanhar", meaning: "and sacrifice" },
                ],
            },
            {
                verseKey: "108:3",
                fullArabic: "إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ",
                fullTranslation: "Indeed, your enemy is the one cut off (without posterity).",
                words: [
                    { arabic: "إِنَّ", transliteration: "inna", meaning: "indeed" },
                    { arabic: "شَانِئَكَ", transliteration: "shani'aka", meaning: "your hater / enemy" },
                    { arabic: "هُوَ", transliteration: "huwa", meaning: "he is" },
                    { arabic: "الْأَبْتَرُ", transliteration: "al-abtar", meaning: "the one cut off" },
                ],
            },
        ],
    },

    // ───────────────────────────────── AL-IKHLAS (112), 4 verses ──
    {
        surahNumber: 112,
        nameArabic: "الإِخْلَاص",
        nameTranslit: "Al-Ikhlas",
        nameEnglish: "The Sincerity",
        description:
            "A concise statement of tawhid (the oneness of Allah). The Prophet ﷺ said it is equal to one-third of the Quran in reward because it captures the core of creed.",
        verses: [
            {
                verseKey: "112:1",
                fullArabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
                fullTranslation: "Say: He is Allah, the One.",
                words: [
                    { arabic: "قُلْ", transliteration: "qul", meaning: "say!", note: "qalqalah on ق" },
                    { arabic: "هُوَ", transliteration: "huwa", meaning: "He is" },
                    { arabic: "اللَّهُ", transliteration: "Allahu", meaning: "Allah" },
                    { arabic: "أَحَدٌ", transliteration: "ahad", meaning: "the One" },
                ],
            },
            {
                verseKey: "112:2",
                fullArabic: "اللَّهُ الصَّمَدُ",
                fullTranslation: "Allah, the Eternal, the Absolute.",
                words: [
                    { arabic: "اللَّهُ", transliteration: "Allahu", meaning: "Allah" },
                    { arabic: "الصَّمَدُ", transliteration: "as-samad", meaning: "the Self-Sufficient / the Eternal Refuge" },
                ],
            },
            {
                verseKey: "112:3",
                fullArabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
                fullTranslation: "He neither begets nor was He begotten.",
                words: [
                    { arabic: "لَمْ", transliteration: "lam", meaning: "not" },
                    { arabic: "يَلِدْ", transliteration: "yalid", meaning: "He begets" },
                    { arabic: "وَلَمْ", transliteration: "wa lam", meaning: "and not" },
                    { arabic: "يُولَدْ", transliteration: "yulad", meaning: "was He begotten", note: "qalqalah on د" },
                ],
            },
            {
                verseKey: "112:4",
                fullArabic: "وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
                fullTranslation: "And there is none comparable to Him.",
                words: [
                    { arabic: "وَلَمْ", transliteration: "wa lam", meaning: "and not" },
                    { arabic: "يَكُنْ", transliteration: "yakun", meaning: "has been" },
                    { arabic: "لَهُ", transliteration: "lahu", meaning: "to Him" },
                    { arabic: "كُفُوًا", transliteration: "kufuwan", meaning: "equal / comparable" },
                    { arabic: "أَحَدٌ", transliteration: "ahad", meaning: "anyone" },
                ],
            },
        ],
    },

    // ───────────────────────────────── AL-FALAQ (113), 5 verses ──
    {
        surahNumber: 113,
        nameArabic: "الفَلَق",
        nameTranslit: "Al-Falaq",
        nameEnglish: "The Daybreak",
        description:
            "The first of the two mu'awwidhat (surahs of refuge). Recited morning and evening for protection from every kind of evil.",
        verses: [
            {
                verseKey: "113:1",
                fullArabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
                fullTranslation: "Say: I seek refuge in the Lord of daybreak.",
                words: [
                    { arabic: "قُلْ", transliteration: "qul", meaning: "say!", note: "qalqalah on ق" },
                    { arabic: "أَعُوذُ", transliteration: "a'udhu", meaning: "I seek refuge" },
                    { arabic: "بِرَبِّ", transliteration: "birabbi", meaning: "in the Lord of" },
                    { arabic: "الْفَلَقِ", transliteration: "al-falaq", meaning: "the daybreak" },
                ],
            },
            {
                verseKey: "113:2",
                fullArabic: "مِنْ شَرِّ مَا خَلَقَ",
                fullTranslation: "From the evil of what He has created.",
                words: [
                    { arabic: "مِنْ", transliteration: "min", meaning: "from" },
                    { arabic: "شَرِّ", transliteration: "sharri", meaning: "the evil of" },
                    { arabic: "مَا", transliteration: "ma", meaning: "what" },
                    { arabic: "خَلَقَ", transliteration: "khalaq", meaning: "He created" },
                ],
            },
            {
                verseKey: "113:3",
                fullArabic: "وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ",
                fullTranslation: "And from the evil of darkness as it settles.",
                words: [
                    { arabic: "وَمِنْ", transliteration: "wa min", meaning: "and from" },
                    { arabic: "شَرِّ", transliteration: "sharri", meaning: "the evil of" },
                    { arabic: "غَاسِقٍ", transliteration: "ghasiq", meaning: "darkness" },
                    { arabic: "إِذَا", transliteration: "idha", meaning: "when" },
                    { arabic: "وَقَبَ", transliteration: "waqab", meaning: "it settles", note: "qalqalah on ق and ب" },
                ],
            },
            {
                verseKey: "113:4",
                fullArabic: "وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ",
                fullTranslation: "And from the evil of those who blow upon knots (witchcraft).",
                words: [
                    { arabic: "وَمِنْ", transliteration: "wa min", meaning: "and from" },
                    { arabic: "شَرِّ", transliteration: "sharri", meaning: "the evil of" },
                    { arabic: "النَّفَّاثَاتِ", transliteration: "an-naffathati", meaning: "the (witches) who blow" },
                    { arabic: "فِي", transliteration: "fi", meaning: "in / on" },
                    { arabic: "الْعُقَدِ", transliteration: "al-'uqad", meaning: "the knots", note: "qalqalah on د" },
                ],
            },
            {
                verseKey: "113:5",
                fullArabic: "وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ",
                fullTranslation: "And from the evil of the envier when he envies.",
                words: [
                    { arabic: "وَمِنْ", transliteration: "wa min", meaning: "and from" },
                    { arabic: "شَرِّ", transliteration: "sharri", meaning: "the evil of" },
                    { arabic: "حَاسِدٍ", transliteration: "hasid", meaning: "an envier" },
                    { arabic: "إِذَا", transliteration: "idha", meaning: "when" },
                    { arabic: "حَسَدَ", transliteration: "hasad", meaning: "he envies", note: "qalqalah on د" },
                ],
            },
        ],
    },

    // ───────────────────────────────── AN-NAS (114), 6 verses ──
    {
        surahNumber: 114,
        nameArabic: "النَّاس",
        nameTranslit: "An-Nas",
        nameEnglish: "The Mankind",
        description:
            "The final surah of the Quran and the second of the mu'awwidhat. Seeks refuge in Allah from the whisperer that tempts both humans and jinn. The closing of the Book.",
        verses: [
            {
                verseKey: "114:1",
                fullArabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
                fullTranslation: "Say: I seek refuge in the Lord of mankind.",
                words: [
                    { arabic: "قُلْ", transliteration: "qul", meaning: "say!", note: "qalqalah on ق" },
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
                    { arabic: "شَرِّ", transliteration: "sharri", meaning: "the evil of" },
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
                fullTranslation: "From jinn and mankind.",
                words: [
                    { arabic: "مِنَ", transliteration: "mina", meaning: "from" },
                    { arabic: "الْجِنَّةِ", transliteration: "al-jinnati", meaning: "the jinn" },
                    { arabic: "وَالنَّاسِ", transliteration: "wan-nas", meaning: "and mankind" },
                ],
            },
        ],
    },
];
