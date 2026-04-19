// Milestone 4, daily-use Arabic, numbers, time, greetings, du'as.
// Portable pure-data module, no React deps.

export interface NumberEntry {
    value: number | string;
    arabic: string;
    arabicNumeral?: string;  // Eastern Arabic numeral (٠ ١ ٢...)
    transliteration: string;
    note?: string;
}

// Cardinal numbers, masculine form shown. Gender agreement in Arabic
// numbers 3-10 is famously inverted; a full treatment belongs in advanced grammar.
export const CARDINALS: NumberEntry[] = [
    { value: 0, arabicNumeral: "٠", arabic: "صِفْر", transliteration: "sifr" },
    { value: 1, arabicNumeral: "١", arabic: "وَاحِد", transliteration: "wahid" },
    { value: 2, arabicNumeral: "٢", arabic: "اِثْنَان", transliteration: "ithnaan" },
    { value: 3, arabicNumeral: "٣", arabic: "ثَلَاثَة", transliteration: "thalathah" },
    { value: 4, arabicNumeral: "٤", arabic: "أَرْبَعَة", transliteration: "arba'ah" },
    { value: 5, arabicNumeral: "٥", arabic: "خَمْسَة", transliteration: "khamsah" },
    { value: 6, arabicNumeral: "٦", arabic: "سِتَّة", transliteration: "sittah" },
    { value: 7, arabicNumeral: "٧", arabic: "سَبْعَة", transliteration: "sab'ah" },
    { value: 8, arabicNumeral: "٨", arabic: "ثَمَانِيَة", transliteration: "thamaniyah" },
    { value: 9, arabicNumeral: "٩", arabic: "تِسْعَة", transliteration: "tis'ah" },
    { value: 10, arabicNumeral: "١٠", arabic: "عَشَرَة", transliteration: "'asharah" },
    { value: 11, arabicNumeral: "١١", arabic: "أَحَدَ عَشَر", transliteration: "ahada 'ashar" },
    { value: 12, arabicNumeral: "١٢", arabic: "اِثْنَا عَشَر", transliteration: "ithna 'ashar" },
    { value: 13, arabicNumeral: "١٣", arabic: "ثَلَاثَةَ عَشَر", transliteration: "thalathata 'ashar" },
    { value: 14, arabicNumeral: "١٤", arabic: "أَرْبَعَةَ عَشَر", transliteration: "arba'ata 'ashar" },
    { value: 15, arabicNumeral: "١٥", arabic: "خَمْسَةَ عَشَر", transliteration: "khamsata 'ashar" },
    { value: 20, arabicNumeral: "٢٠", arabic: "عِشْرُون", transliteration: "'ishrun" },
    { value: 30, arabicNumeral: "٣٠", arabic: "ثَلَاثُون", transliteration: "thalathun" },
    { value: 40, arabicNumeral: "٤٠", arabic: "أَرْبَعُون", transliteration: "arba'un" },
    { value: 50, arabicNumeral: "٥٠", arabic: "خَمْسُون", transliteration: "khamsun" },
    { value: 60, arabicNumeral: "٦٠", arabic: "سِتُّون", transliteration: "sittun" },
    { value: 70, arabicNumeral: "٧٠", arabic: "سَبْعُون", transliteration: "sab'un" },
    { value: 80, arabicNumeral: "٨٠", arabic: "ثَمَانُون", transliteration: "thamanun" },
    { value: 90, arabicNumeral: "٩٠", arabic: "تِسْعُون", transliteration: "tis'un" },
    { value: 100, arabicNumeral: "١٠٠", arabic: "مِئَة", transliteration: "mi'ah" },
    { value: 1000, arabicNumeral: "١٠٠٠", arabic: "أَلْف", transliteration: "alf" },
];

// Ordinal numbers, 1st through 10th
export const ORDINALS: NumberEntry[] = [
    { value: "1st", arabic: "أَوَّل", transliteration: "awwal" },
    { value: "2nd", arabic: "ثَانِي", transliteration: "thani" },
    { value: "3rd", arabic: "ثَالِث", transliteration: "thalith" },
    { value: "4th", arabic: "رَابِع", transliteration: "rabi'" },
    { value: "5th", arabic: "خَامِس", transliteration: "khamis" },
    { value: "6th", arabic: "سَادِس", transliteration: "sadis" },
    { value: "7th", arabic: "سَابِع", transliteration: "sabi'" },
    { value: "8th", arabic: "ثَامِن", transliteration: "thamin" },
    { value: "9th", arabic: "تَاسِع", transliteration: "tasi'" },
    { value: "10th", arabic: "عَاشِر", transliteration: "'ashir" },
];

// ──────────────────────────────────────────────────────────────────────
// DAYS & TIME
// ──────────────────────────────────────────────────────────────────────
export interface DayEntry {
    arabic: string;
    transliteration: string;
    english: string;
    note?: string;
}

export const DAYS: DayEntry[] = [
    { arabic: "يَوْمُ الأَحَد", transliteration: "Yawm al-Ahad", english: "Sunday", note: "literally 'day one'" },
    { arabic: "يَوْمُ الاِثْنَيْن", transliteration: "Yawm al-Ithnayn", english: "Monday", note: "literally 'day two'" },
    { arabic: "يَوْمُ الثُّلَاثَاء", transliteration: "Yawm ath-Thulatha'", english: "Tuesday", note: "literally 'day three'" },
    { arabic: "يَوْمُ الأَرْبَعَاء", transliteration: "Yawm al-Arbi'a'", english: "Wednesday", note: "literally 'day four'" },
    { arabic: "يَوْمُ الخَمِيس", transliteration: "Yawm al-Khamis", english: "Thursday", note: "literally 'day five'" },
    { arabic: "يَوْمُ الجُمُعَة", transliteration: "Yawm al-Jumu'ah", english: "Friday", note: "'day of gathering', the sacred Friday prayer day" },
    { arabic: "يَوْمُ السَّبْت", transliteration: "Yawm as-Sabt", english: "Saturday", note: "'day of rest', from the same root as 'Sabbath'" },
];

// Hijri (Islamic lunar) months
export const HIJRI_MONTHS: DayEntry[] = [
    { arabic: "مُحَرَّم", transliteration: "Muharram", english: "1st month", note: "Sacred month, 'Ashura is the 10th" },
    { arabic: "صَفَر", transliteration: "Safar", english: "2nd month" },
    { arabic: "رَبِيع الأَوَّل", transliteration: "Rabi' al-Awwal", english: "3rd month", note: "Month of the Prophet ﷺ's birth and passing" },
    { arabic: "رَبِيع الثَّانِي", transliteration: "Rabi' ath-Thani", english: "4th month" },
    { arabic: "جُمَادَى الأُولَى", transliteration: "Jumada al-Ula", english: "5th month" },
    { arabic: "جُمَادَى الآخِرَة", transliteration: "Jumada al-Akhirah", english: "6th month" },
    { arabic: "رَجَب", transliteration: "Rajab", english: "7th month", note: "Sacred month" },
    { arabic: "شَعْبَان", transliteration: "Sha'ban", english: "8th month" },
    { arabic: "رَمَضَان", transliteration: "Ramadan", english: "9th month", note: "Month of fasting" },
    { arabic: "شَوَّال", transliteration: "Shawwal", english: "10th month", note: "'Id al-Fitr is on the 1st" },
    { arabic: "ذُو القَعْدَة", transliteration: "Dhul Qa'dah", english: "11th month", note: "Sacred month" },
    { arabic: "ذُو الحِجَّة", transliteration: "Dhul Hijjah", english: "12th month", note: "Sacred month; Hajj and 'Id al-Adha" },
];

// Times of day
export const TIMES_OF_DAY: DayEntry[] = [
    { arabic: "فَجْر", transliteration: "Fajr", english: "Dawn (first prayer)" },
    { arabic: "شُرُوق", transliteration: "Shuruq", english: "Sunrise" },
    { arabic: "صَبَاح", transliteration: "Sabah", english: "Morning" },
    { arabic: "ضُحَى", transliteration: "Duha", english: "Mid-morning" },
    { arabic: "ظُهْر", transliteration: "Dhuhr", english: "Noon (second prayer)" },
    { arabic: "عَصْر", transliteration: "'Asr", english: "Afternoon (third prayer)" },
    { arabic: "غُرُوب", transliteration: "Ghurub", english: "Sunset" },
    { arabic: "مَغْرِب", transliteration: "Maghrib", english: "Just after sunset (fourth prayer)" },
    { arabic: "عِشَاء", transliteration: "'Isha", english: "Night (fifth prayer)" },
    { arabic: "لَيْل", transliteration: "Layl", english: "Night" },
];

// ──────────────────────────────────────────────────────────────────────
// GREETINGS & COMMON PHRASES
// ──────────────────────────────────────────────────────────────────────
export interface PhraseEntry {
    arabic: string;
    transliteration: string;
    english: string;
    context: string;   // when to use
}

export const GREETINGS: PhraseEntry[] = [
    {
        arabic: "السَّلَامُ عَلَيْكُم",
        transliteration: "As-salamu 'alaykum",
        english: "Peace be upon you",
        context: "Standard greeting when you meet someone",
    },
    {
        arabic: "وَعَلَيْكُمُ السَّلَام",
        transliteration: "Wa 'alaykumu s-salam",
        english: "And peace be upon you",
        context: "Response to the greeting. Full: wa 'alaykumu s-salam wa rahmatullahi wa barakatuh",
    },
    {
        arabic: "السَّلَامُ عَلَيْكُم وَرَحْمَةُ اللهِ وَبَرَكَاتُه",
        transliteration: "As-salamu 'alaykum wa rahmatullahi wa barakatuh",
        english: "Peace, Allah's mercy, and His blessings be upon you",
        context: "Fuller form of the greeting, used in prayer and more formal settings",
    },
    {
        arabic: "أَهْلًا وَسَهْلًا",
        transliteration: "Ahlan wa sahlan",
        english: "Welcome",
        context: "Welcoming a guest",
    },
    {
        arabic: "كَيْفَ حَالُك",
        transliteration: "Kayfa haluk",
        english: "How are you?",
        context: "Casual greeting. Feminine: kayfa haluki",
    },
    {
        arabic: "بِخَيْر الحَمْدُ لِلَّه",
        transliteration: "Bi-khayr, alhamdulillah",
        english: "Fine, praise be to Allah",
        context: "Typical response to 'how are you'",
    },
    {
        arabic: "تُصْبِحُ عَلَى خَيْر",
        transliteration: "Tusbihu 'ala khayr",
        english: "May you wake to goodness",
        context: "Said at night, 'good night'",
    },
    {
        arabic: "صَبَاحُ الخَيْر",
        transliteration: "Sabah al-khayr",
        english: "Good morning",
        context: "Morning greeting",
    },
    {
        arabic: "مَسَاءُ الخَيْر",
        transliteration: "Masa' al-khayr",
        english: "Good evening",
        context: "Afternoon / evening greeting",
    },
    {
        arabic: "مَعَ السَّلَامَة",
        transliteration: "Ma'a as-salamah",
        english: "Go in peace / goodbye",
        context: "Farewell",
    },
];

export const EXPRESSIONS: PhraseEntry[] = [
    {
        arabic: "بِسْمِ اللهِ",
        transliteration: "Bismillah",
        english: "In the name of Allah",
        context: "Before eating, starting any task, entering the home",
    },
    {
        arabic: "الحَمْدُ لِلَّه",
        transliteration: "Alhamdulillah",
        english: "All praise is due to Allah",
        context: "After eating, sneezing, or any good news. Expresses gratitude.",
    },
    {
        arabic: "سُبْحَانَ اللهِ",
        transliteration: "Subhan Allah",
        english: "Glory be to Allah",
        context: "When amazed or witnessing something beautiful",
    },
    {
        arabic: "اللهُ أَكْبَر",
        transliteration: "Allahu Akbar",
        english: "Allah is the Greatest",
        context: "In prayer, during adhan, in awe, or at 'Id",
    },
    {
        arabic: "لَا إِلَٰهَ إِلَّا اللهُ",
        transliteration: "La ilaha illa Allah",
        english: "There is no deity but Allah",
        context: "The core of tawhid. Said in dhikr and prayer.",
    },
    {
        arabic: "إِنْ شَاءَ اللهُ",
        transliteration: "In sha' Allah",
        english: "If Allah wills",
        context: "When speaking of any future plan (Quran 18:23-24)",
    },
    {
        arabic: "مَا شَاءَ اللهُ",
        transliteration: "Ma sha' Allah",
        english: "As Allah has willed",
        context: "When witnessing something good, to acknowledge it's from Allah",
    },
    {
        arabic: "أَسْتَغْفِرُ اللهَ",
        transliteration: "Astaghfir Allah",
        english: "I seek forgiveness from Allah",
        context: "After any slip, or as a regular dhikr",
    },
    {
        arabic: "جَزَاكَ اللهُ خَيْرًا",
        transliteration: "Jazak Allahu khayran",
        english: "May Allah reward you with good",
        context: "Saying thank you the prophetic way",
    },
    {
        arabic: "بَارَكَ اللهُ فِيكَ",
        transliteration: "Barak Allahu fik",
        english: "May Allah bless you",
        context: "Response to 'jazak Allahu khayran' or as an affectionate blessing",
    },
    {
        arabic: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُون",
        transliteration: "Inna lillahi wa inna ilayhi raji'un",
        english: "Truly we belong to Allah, and to Him we return",
        context: "Said at news of death or a great loss (Quran 2:156)",
    },
    {
        arabic: "الحَمْدُ لِلَّهِ رَبِّ العَالَمِين",
        transliteration: "Alhamdulillahi Rabbi l-'alamin",
        english: "Praise be to Allah, Lord of the worlds",
        context: "The opening of Al-Fatiha, often said as a benediction",
    },
];

// Short du'as for everyday life
export const DAILY_DUAS: PhraseEntry[] = [
    {
        arabic: "بِسْمِ اللهِ",
        transliteration: "Bismillah",
        english: "In the name of Allah",
        context: "Before eating or drinking",
    },
    {
        arabic: "الحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَٰذَا",
        transliteration: "Alhamdulillahi lladhi at'amani hadha",
        english: "All praise to Allah who fed me this",
        context: "After eating",
    },
    {
        arabic: "الحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا",
        transliteration: "Alhamdulillahi lladhi ahyana ba'da ma amatana",
        english: "Praise to Allah who gave us life after He had caused us to die",
        context: "Upon waking up in the morning",
    },
    {
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        transliteration: "Bismika Allahumma amutu wa ahya",
        english: "In Your name, O Allah, I die and I live",
        context: "Before sleeping",
    },
    {
        arabic: "بِسْمِ اللهِ وَلَجْنَا وَبِسْمِ اللهِ خَرَجْنَا",
        transliteration: "Bismillahi walajna wa bismillahi kharajna",
        english: "In Allah's name we enter, in Allah's name we leave",
        context: "Entering the home",
    },
    {
        arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
        transliteration: "Allahumma iftah li abwaba rahmatik",
        english: "O Allah, open for me the gates of Your mercy",
        context: "Entering the mosque",
    },
    {
        arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا",
        transliteration: "Subhana lladhi sakhkhara lana hadha",
        english: "Glory to the One who subjected this to us",
        context: "When boarding a vehicle (Quran 43:13)",
    },
    {
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا",
        transliteration: "Allahumma inni as'aluka 'ilman nafi'an",
        english: "O Allah, I ask You for beneficial knowledge",
        context: "When beginning to study",
    },
    {
        arabic: "رَبِّ زِدْنِي عِلْمًا",
        transliteration: "Rabbi zidni 'ilma",
        english: "My Lord, increase me in knowledge",
        context: "Short du'a for seeking knowledge (Quran 20:114)",
    },
    {
        arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّار",
        transliteration: "Rabbana atina fi d-dunya hasanah...",
        english: "Our Lord, grant us good in this world and the next, and protect us from the Fire",
        context: "The most frequently repeated du'a of the Prophet ﷺ (Quran 2:201)",
    },
];
