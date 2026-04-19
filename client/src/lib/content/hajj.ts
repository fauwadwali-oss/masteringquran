// Step-by-step Hajj & Umrah guide with duas.
// Sources: Manasik al-Hajj (Ibn Baz), authentic ahadith, standard Hanafi/Shafi'i manaasik.
// Portable pure-data module, no React deps.

export interface HajjStep {
    id: string;
    number: number;
    name: string;                   // English name
    arabic?: string;                // Arabic name
    location?: string;              // Where this step is performed
    day?: string;                   // e.g. "8th of Dhul Hijjah", for Hajj specifically
    description: string;            // 2-4 sentences explaining what to do
    dua?: {
        arabic: string;
        translit?: string;
        translation: string;
        note?: string;
    };
    tips?: string[];
}

export interface HajjGuide {
    id: string;
    title: string;
    subtitle: string;
    overview: string;
    steps: HajjStep[];
}

// ============================================================
// UMRAH
// ============================================================
export const UMRAH: HajjGuide = {
    id: "umrah",
    title: "'Umrah, The Lesser Pilgrimage",
    subtitle: "Can be performed at any time of year",
    overview: "'Umrah consists of four rites: entering the state of ihram with intention, performing tawaf of the Ka'bah, walking between Safa and Marwah (sa'i), and shaving or trimming the hair. It is highly recommended but not obligatory; the Prophet ﷺ said: 'An 'umrah to the next 'umrah is expiation for what is between them.'",
    steps: [
        {
            id: "umrah-ihram",
            number: 1,
            name: "Enter the state of Ihram",
            arabic: "الإِحْرَام",
            location: "At the miqat (boundary station) on the way to Mecca, or inside if already in the Haram",
            description: "Perform ghusl (full bath), wear the two white unstitched garments (men) or modest regular dress (women), perform two raka'at if permissible, then make the intention for 'Umrah and begin the talbiyah. From this moment, restrictions of ihram begin: no perfume, no cutting hair or nails, no covering the head (men), no marital relations, no hunting.",
            dua: {
                arabic: "لَبَّيْكَ اللَّهُمَّ عُمْرَةً",
                translit: "Labbayka Allahumma 'umrah",
                translation: "Here I am, O Allah, for 'Umrah.",
                note: "Intention (niyyah) said once at the miqat. Immediately follow with the talbiyah below.",
            },
            tips: [
                "Miqats: Dhul Hulayfah (from Medina), Al-Juhfah (from Syria/Egypt), Qarn al-Manazil (from Najd/Riyadh), Yalamlam (from Yemen), Dhat 'Irq (from Iraq).",
                "Those flying in should make ihram before crossing the miqat, usually announced by the crew.",
                "Women menstruating may enter ihram and perform all rites except tawaf until the period ends.",
            ],
        },
        {
            id: "umrah-talbiyah",
            number: 2,
            name: "Recite the Talbiyah",
            arabic: "التَّلْبِيَة",
            location: "From ihram until the start of tawaf",
            description: "Continuously recite the talbiyah, loudly for men, quietly for women, as you journey toward Mecca. The talbiyah is the anthem of the pilgrim and should be on the tongue until the moment you begin the first circuit of tawaf.",
            dua: {
                arabic: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ",
                translit: "Labbayka Allahumma labbayk, labbayka la sharika laka labbayk, inna-l-hamda wan-ni'mata laka wal-mulk, la sharika lak",
                translation: "Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Truly all praise, favor, and sovereignty are Yours. You have no partner.",
            },
        },
        {
            id: "umrah-tawaf",
            number: 3,
            name: "Tawaf, Circumambulate the Ka'bah",
            arabic: "الطَّوَاف",
            location: "The Mataf (the marble area around the Ka'bah), Masjid al-Haram",
            description: "Upon entering the mosque with the right foot, approach the Ka'bah. Begin at the corner of the Black Stone (Hajar al-Aswad), point toward it, say 'Bismillah, Allahu akbar,' and begin the first of seven circuits, keeping the Ka'bah on your left. Men perform idtiba' (exposing the right shoulder) and raml (brisk walking) in the first three circuits. Recite du'a freely throughout; between the Yemeni Corner and the Black Stone, say the du'a below. After seven circuits, pray two raka'at behind Maqam Ibrahim if possible, then drink Zamzam.",
            dua: {
                arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
                translit: "Rabbana atina fid-dunya hasanah wa fil-akhirati hasanah wa qina 'adhaban-nar",
                translation: "Our Lord, grant us good in this world and good in the hereafter, and protect us from the punishment of the Fire. (2:201)",
                note: "Recite especially between the Yemeni Corner and the Black Stone.",
            },
            tips: [
                "Seven full circuits is one tawaf.",
                "Touch or kiss the Black Stone only if safely possible; otherwise point toward it and say 'Allahu akbar.'",
                "There is no required du'a, speak to Allah in any language.",
                "If fatigued, wheelchairs are available; the upper floor is less crowded.",
            ],
        },
        {
            id: "umrah-sai",
            number: 4,
            name: "Sa'i, Walk between Safa and Marwah",
            arabic: "السَّعْي",
            location: "The Mas'a (the enclosed corridor between the two hills) inside Masjid al-Haram",
            description: "Go to Safa, face the Ka'bah, raise your hands, and say 'Allahu akbar' three times, followed by the du'a below. Then walk to Marwah. Men should jog between the two green markers; women walk the entire distance. Upon reaching Marwah, face the Ka'bah again and repeat the du'a. Safa to Marwah is one circuit; Marwah to Safa is another. Complete seven one-way circuits (ending at Marwah).",
            dua: {
                arabic: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ",
                translit: "Inna-s-Safa wal-Marwata min sha'a'irillah",
                translation: "Indeed, Safa and Marwah are among the symbols of Allah. (2:158)",
                note: "Recited upon reaching Safa the first time. Follow with: 'Nabda'u bima bada'a Allahu bih', 'We begin with what Allah began with.'",
            },
            tips: [
                "Seven one-way trips, not round trips, you end at Marwah.",
                "This commemorates Hajar's running in search of water for baby Isma'il.",
                "There is no ritual du'a between Safa and Marwah, make du'a freely.",
            ],
        },
        {
            id: "umrah-halq",
            number: 5,
            name: "Halq or Taqsir, Shave or trim the hair",
            arabic: "الحَلْق / التَّقْصِير",
            location: "Anywhere in the Haram boundary",
            description: "Men shave their heads (halq, preferred) or trim evenly around (taqsir). Women trim a fingertip's length from the ends of their hair. This act releases you from the state of ihram, perfume, regular clothing, and normal life resume.",
            tips: [
                "The Prophet ﷺ prayed three times for those who shaved, and once for those who trimmed.",
                "'Umrah is now complete, but the reward of every du'a made during it remains.",
            ],
        },
    ],
};

// ============================================================
// HAJJ
// ============================================================
export const HAJJ: HajjGuide = {
    id: "hajj",
    title: "Hajj, The Greater Pilgrimage",
    subtitle: "Performed in Dhul Hijjah, 8th through 13th",
    overview: "Hajj is the fifth pillar of Islam, obligatory once in a lifetime on every Muslim who is financially and physically able. It must be performed between the 8th and 13th of Dhul Hijjah. This guide follows Hajj Tamattu', the most common form today, which means performing 'Umrah first, exiting ihram, then re-entering ihram for Hajj on the 8th.",
    steps: [
        {
            id: "hajj-umrah-first",
            number: 1,
            name: "(Optional) Perform 'Umrah first (Tamattu')",
            location: "Mecca, before the 8th of Dhul Hijjah",
            description: "If performing Hajj Tamattu', you arrive before Hajj and perform a complete 'Umrah (all 5 steps above). After trimming your hair, you exit ihram and live normally until the 8th of Dhul Hijjah. A sacrifice (hadi) is obligatory for tamattu' pilgrims.",
            tips: [
                "Tamattu' is the form the Prophet ﷺ encouraged for those who had not brought a sacrificial animal.",
                "Other forms: Ifrad (Hajj only, no 'Umrah) and Qiran (Hajj and 'Umrah in one ihram).",
            ],
        },
        {
            id: "hajj-ihram-8",
            number: 2,
            name: "Enter Ihram for Hajj",
            arabic: "الإِحْرَام لِلْحَجّ",
            location: "Your residence in Mecca",
            day: "8th of Dhul Hijjah (Yawm at-Tarwiyah)",
            description: "On the morning of the 8th, perform ghusl, wear ihram, and make the intention for Hajj. Recite the talbiyah and proceed to Mina.",
            dua: {
                arabic: "لَبَّيْكَ اللَّهُمَّ حَجًّا",
                translit: "Labbayka Allahumma hajja",
                translation: "Here I am, O Allah, for Hajj.",
            },
        },
        {
            id: "hajj-mina-1",
            number: 3,
            name: "Proceed to Mina",
            arabic: "مِنَى",
            location: "Valley of Mina, ~8km from Mecca",
            day: "8th of Dhul Hijjah",
            description: "Travel to Mina and pray Dhuhr, 'Asr, Maghrib, 'Isha (each at its own time but shortened, 4-raka'at prayers to 2). Stay overnight in Mina (sunnah) and pray Fajr of the 9th there. Most of the day is spent in dhikr, Quran, and du'a.",
            tips: [
                "The 8th is called Yawm at-Tarwiyah ('Day of Quenching Thirst'), historically pilgrims stocked water here before Arafah.",
                "Tents in Mina are organized by country; follow your group.",
            ],
        },
        {
            id: "hajj-arafah",
            number: 4,
            name: "Wuquf at 'Arafah, the peak of Hajj",
            arabic: "الوُقُوف بِعَرَفَة",
            location: "Plain of 'Arafah, ~20km east of Mecca",
            day: "9th of Dhul Hijjah (Yawm 'Arafah)",
            description: "After sunrise on the 9th, proceed from Mina to 'Arafah. After midday, pray Dhuhr and 'Asr together shortened (at the time of Dhuhr). Then stand, in any posture, though standing is best, in du'a, tasbih, and istighfar until sunset. The Prophet ﷺ said: 'Hajj is 'Arafah.' Missing this standing invalidates the entire Hajj.",
            dua: {
                arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
                translit: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir",
                translation: "There is no god but Allah alone, without partner. To Him belongs all sovereignty and all praise, and He is over all things capable.",
                note: "The Prophet ﷺ said: 'The best of du'a is the du'a of the Day of 'Arafah, and the best I and the prophets before me have said is: La ilaha illallahu...' (Tirmidhi). Repeat abundantly.",
            },
            tips: [
                "Fasting on the Day of 'Arafah (for non-pilgrims) expiates sins of the previous and coming year (Muslim).",
                "Pilgrims on Hajj do NOT fast on this day, standing and du'a take precedence.",
                "Allah boasts of the pilgrims to the angels on this day.",
                "Face the qiblah when making du'a; raise the hands; ask for everything.",
            ],
        },
        {
            id: "hajj-muzdalifah",
            number: 5,
            name: "Night at Muzdalifah",
            arabic: "مُزْدَلِفَة",
            location: "Open plain between 'Arafah and Mina",
            day: "Night of 9th/10th Dhul Hijjah",
            description: "After sunset, leave 'Arafah for Muzdalifah, do not pray Maghrib until you arrive. Upon arrival, pray Maghrib and 'Isha combined and shortened. Sleep in the open under the sky. Collect 49 (or 70 if staying extra days) pebbles for the stoning of the jamarat, about the size of chickpeas.",
            dua: {
                arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ أَنْ تَرْزُقَنِي فِي هَذَا الْمَقَامِ جَوَامِعَ الْخَيْرِ كُلِّهِ",
                translit: "Allahumma inni as'aluka an tarzuqani fi hadhal-maqami jawami'al-khayri kullih",
                translation: "O Allah, I ask You in this station for the totality of all good.",
                note: "Recite at Al-Mash'ar al-Haram (the sacred monument) within Muzdalifah.",
            },
            tips: [
                "Pray Fajr of the 10th early and make du'a facing the qiblah until it is nearly sunrise.",
                "The elderly, children, and women may proceed to Mina after midnight.",
            ],
        },
        {
            id: "hajj-jamarat-1",
            number: 6,
            name: "Stone the Jamarat al-'Aqabah",
            arabic: "جَمْرَة الْعَقَبَة",
            location: "Mina, the largest of the three pillars",
            day: "10th of Dhul Hijjah (Yawm an-Nahr)",
            description: "After sunrise on the 10th, proceed to Mina. Stone ONLY the largest jamarah (al-'Aqabah, closest to Mecca) with seven pebbles, one at a time, saying 'Allahu akbar' with each throw. Stop the talbiyah at the first pebble.",
            dua: {
                arabic: "اللَّهُ أَكْبَر",
                translit: "Allahu akbar",
                translation: "Allah is the Greatest., Say with each pebble.",
            },
            tips: [
                "Aim for the pillar or the basin around it, hitting the pillar is not required.",
                "Do not throw shoes, umbrellas, or large stones.",
                "Only the 'Aqabah pillar is stoned on the 10th. The other two pillars are stoned on the 11th, 12th, (and 13th if staying).",
            ],
        },
        {
            id: "hajj-sacrifice",
            number: 7,
            name: "Sacrifice (Hadi / Qurbani)",
            arabic: "الهَدْي",
            location: "Mina or via pre-paid voucher system",
            day: "10th of Dhul Hijjah",
            description: "Offer the sacrificial animal, sheep, goat, or a 1/7 share of a cow or camel. For Tamattu' and Qiran pilgrims, this is obligatory. Most pilgrims today pay for the sacrifice through authorized agencies (bank voucher) and the meat is distributed to the poor.",
            tips: [
                "Commemorates Ibrahim's willingness to sacrifice Isma'il, 'We ransomed him with a great sacrifice' (37:107).",
                "One-third for self, one-third for friends/family, one-third for the poor is traditional.",
            ],
        },
        {
            id: "hajj-halq-1",
            number: 8,
            name: "Halq or Taqsir",
            arabic: "الحَلْق / التَّقْصِير",
            location: "Mina",
            day: "10th of Dhul Hijjah",
            description: "Men shave or trim; women trim a fingertip's length. This is the first exit from ihram (at-Tahallul al-Awwal), everything is now permitted except marital relations.",
        },
        {
            id: "hajj-tawaf-ifadah",
            number: 9,
            name: "Tawaf al-Ifadah",
            arabic: "طَوَاف الإِفَاضَة",
            location: "Masjid al-Haram, Mecca",
            day: "10th of Dhul Hijjah (may be delayed to 11-13th)",
            description: "Travel to Mecca and perform seven circuits of tawaf around the Ka'bah (the pillar of Hajj), two raka'at behind Maqam Ibrahim, drink Zamzam, and perform sa'i between Safa and Marwah (for Tamattu' pilgrims, Ifrad and Qiran pilgrims who did sa'i after Tawaf al-Qudum do not repeat it). This is the final pillar after which marital relations become permissible (at-Tahallul ath-Thani).",
            tips: [
                "Tawaf al-Ifadah is a rukn (pillar), without it, Hajj is incomplete.",
                "Many defer it to the 11th or 12th to avoid the 10th's peak crowds.",
            ],
        },
        {
            id: "hajj-mina-days",
            number: 10,
            name: "The Days of Tashriq, stone all three pillars",
            arabic: "أَيَّام التَّشْرِيق",
            location: "Mina",
            day: "11th, 12th (and optional 13th) of Dhul Hijjah",
            description: "Spend these days in Mina. Each afternoon (after Dhuhr), stone the three jamarat in order: small (Ula), middle (Wusta), then large ('Aqabah), seven pebbles at each, saying 'Allahu akbar' with each throw. At the small and middle pillars, move aside after stoning, face the qiblah, and make lengthy du'a. No du'a after the 'Aqabah. Eat, rest, and make dhikr in between.",
            tips: [
                "Those in a hurry may leave on the 12th after stoning (before sunset), called Nafr al-Awwal.",
                "Staying the 13th (Nafr ath-Thani) follows the Prophet's ﷺ example.",
                "Sleeping in Mina on these nights is obligatory (wajib) for most schools.",
            ],
        },
        {
            id: "hajj-farewell",
            number: 11,
            name: "Tawaf al-Wada', the Farewell Tawaf",
            arabic: "طَوَاف الوَدَاع",
            location: "Masjid al-Haram, Mecca",
            day: "Before leaving Mecca",
            description: "The last act of Hajj. Before departing Mecca for home, perform seven more circuits of tawaf around the Ka'bah. The Prophet ﷺ said: 'Let none of you leave until his last act is tawaf of the House.' Women in menstruation are exempt.",
            dua: {
                arabic: "اللَّهُمَّ الْبَيْتَ بَيْتُكَ وَالْعَبْدَ عَبْدُكَ وَابْنُ عَبْدِكَ...",
                translit: "Allahumma al-baytu baytuk wal-'abdu 'abduk wabnu 'abdik...",
                translation: "O Allah, the House is Your House, and the slave is Your slave and the son of Your slave...",
                note: "Make abundant du'a, this is your farewell to the House of Allah. Ask for another visit, in good health, with greater iman.",
            },
            tips: [
                "No sa'i required after Tawaf al-Wada'.",
                "Visit Medina and Masjid an-Nabawi if you haven't already, not part of Hajj itself, but a beloved sunnah.",
            ],
        },
    ],
};

// ============================================================
// INDEX
// ============================================================
export const GUIDES: HajjGuide[] = [UMRAH, HAJJ];
