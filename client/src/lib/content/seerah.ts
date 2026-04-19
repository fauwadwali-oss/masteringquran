// Chronological biography (seerah) of the Prophet Muhammad ﷺ.
// Organized into 10 chapters covering birth to death. Each chapter lists key events.
// Dates use CE (Common Era) and AH (after Hijra, starting 622 CE).
// Sources: Ibn Ishaq (via Ibn Hisham), Ar-Raheeq Al-Makhtum (Mubarakpuri), authentic hadith.
// Portable pure-data module — no React deps.

export interface SeerahEvent {
    year?: string;           // "570 CE" or "5 BH" or "3 AH"
    location?: string;       // "Mecca", "Medina", etc
    title: string;
    description: string;
    quranRef?: string[];     // related verse_keys if any
}

export interface SeerahChapter {
    id: string;
    title: string;
    period: string;          // "570-610 CE" etc
    summary: string;
    events: SeerahEvent[];
}

export const SEERAH: SeerahChapter[] = [
    {
        id: "arabia-before",
        title: "1. Arabia Before the Prophet ﷺ",
        period: "Context",
        summary: "The world into which Muhammad ﷺ was born was called jahiliyyah — the 'age of ignorance.' The Arabs were a tribal people of the peninsula: masters of language and poetry, but divided into warring clans, burying infant daughters alive, worshipping 360 idols around the Ka'bah that Ibrahim had built for Allah alone. Christianity and Judaism existed on the fringes (Yemen, Najran, Khaybar) but had largely lost their original message. The wider world was ruled by two empires — Byzantine (Christian) to the north and Sasanian Persia (Zoroastrian) to the east — both exhausted by centuries of war.",
        events: [
            {
                title: "The Ka'bah and the Quraysh",
                description: "The Ka'bah in Mecca, rebuilt by Ibrahim and Isma'il as the first house for the worship of Allah, had by the 6th century become a pagan shrine housing 360 idols. The Quraysh, descendants of Isma'il, were its custodians — a position of immense religious and commercial power.",
            },
            {
                year: "~570 CE",
                location: "Mecca",
                title: "The Year of the Elephant",
                description: "Abraha, the Christian Abyssinian viceroy of Yemen, marched on Mecca with an army that included elephants, intending to destroy the Ka'bah. Allah sent birds (ababil) that dropped stones of baked clay, destroying the army. Surah Al-Fil (105) preserves the memory. This was the year the Prophet ﷺ was born.",
                quranRef: ["105:1", "105:2", "105:3", "105:4", "105:5"],
            },
        ],
    },
    {
        id: "birth-early",
        title: "2. Birth, Childhood, and Youth",
        period: "570 – 610 CE",
        summary: "Born as an orphan, raised by his grandfather, then his uncle, the Prophet ﷺ grew up known among the Quraysh as Al-Amin — the Trustworthy. The 40 years before prophethood were not a delay; they were a credentialing — Mecca's entire society was made a witness to his character before a single word of revelation came.",
        events: [
            {
                year: "570 CE",
                location: "Mecca",
                title: "Birth",
                description: "Born in Mecca, in the clan of Banu Hashim of the tribe of Quraysh, a descendant of Isma'il through 'Adnan. His father 'Abdullah had died months earlier. His mother Aminah named him Muhammad — 'the praised one.'",
            },
            {
                year: "570 CE",
                location: "Badiyah (desert)",
                title: "Fostered with Halima",
                description: "As was Arab custom, he was sent to be wet-nursed in the desert by Halima as-Sa'diyyah. Her family saw unusual blessing during his years with them. The incident of the opening of his chest by two angels who washed his heart is reported from this period.",
            },
            {
                year: "576 CE (age 6)",
                location: "Abwa",
                title: "Death of his mother",
                description: "Aminah took him to Medina to visit her family, and on the return journey she died at Abwa. He was taken in by his grandfather 'Abd al-Muttalib.",
            },
            {
                year: "578 CE (age 8)",
                location: "Mecca",
                title: "Death of his grandfather; taken in by Abu Talib",
                description: "'Abd al-Muttalib died and entrusted his grandson to his son Abu Talib — the uncle who would protect him for the next 42 years.",
            },
            {
                year: "~583 CE (age 12)",
                location: "Bosra, Syria",
                title: "Meeting with Bahira the monk",
                description: "Accompanying his uncle on a trade caravan to Syria, the Christian monk Bahira recognized signs of prophethood in him from old scriptures and advised Abu Talib to protect him.",
            },
            {
                year: "~595 CE (age 25)",
                location: "Mecca",
                title: "Marriage to Khadijah",
                description: "The noble and wealthy widow Khadijah bint Khuwaylid, 15 years his senior, proposed to him after he managed her trade caravan to Syria with exceptional honesty. She would be his only wife for 25 years, his first believer, his comforter on the first night of revelation, and the mother of his children.",
            },
            {
                year: "~605 CE (age 35)",
                location: "Mecca",
                title: "Rebuilding the Ka'bah",
                description: "A flood damaged the Ka'bah. When it came time to place the Black Stone, the clans nearly came to blows over the honor. They agreed to accept the first man to enter the mosque as arbiter — Muhammad ﷺ walked in, spread his cloak, placed the stone on it, and had a chief from each clan hold a corner so all lifted it together. He then placed it himself. Conflict averted.",
            },
        ],
    },
    {
        id: "revelation",
        title: "3. The First Revelation",
        period: "610 CE",
        summary: "At 40, the Prophet ﷺ began retreating to the cave of Hira on Jabal an-Nur ('the mountain of light') for meditation. There, on a night in Ramadan, the angel Jibril appeared with the command that would change history.",
        events: [
            {
                year: "610 CE (age 40)",
                location: "Cave of Hira, Mecca",
                title: "Iqra — 'Read!'",
                description: "Jibril pressed him and commanded: 'Iqra!' ('Read! / Recite!'). The Prophet ﷺ answered: 'I am not one who reads.' Three times Jibril pressed him, until finally the first five verses of Surah Al-'Alaq (96) came: 'Read in the name of your Lord who created...' Trembling, he returned home to Khadijah, who wrapped him in a cloak and took him to her cousin Waraqa ibn Nawfal, a Christian scholar, who confirmed this was the same angel who had come to Musa.",
                quranRef: ["96:1", "96:2", "96:3", "96:4", "96:5"],
            },
            {
                year: "610-613 CE",
                location: "Mecca",
                title: "Three years of secret da'wah",
                description: "After a pause in revelation (fatrah) and then its resumption with Surah Al-Muddaththir, the Prophet ﷺ called close family and friends quietly. The first believers (as-Sabiqun al-Awwalun) included Khadijah, Abu Bakr, 'Ali (then a child in his care), Zayd ibn Harithah, 'Uthman ibn 'Affan, Zubayr, Talha, Sa'd ibn Abi Waqqas, 'Abd ar-Rahman ibn 'Awf, and others — mostly young men and the poor.",
                quranRef: ["74:1", "74:2", "74:3", "74:4", "74:5"],
            },
        ],
    },
    {
        id: "meccan",
        title: "4. The Meccan Period — Persecution and Patience",
        period: "613 – 622 CE",
        summary: "When the da'wah became public, Mecca turned on him. For 13 years the Muslims were mocked, beaten, tortured, boycotted, and killed. The Quran of this period is predominantly about tawhid, the Day of Judgment, and the stories of earlier prophets — grounding the believers in cosmic perspective while the world burned around them.",
        events: [
            {
                year: "613 CE",
                location: "Mount Safa, Mecca",
                title: "Public proclamation",
                description: "Commanded by Allah ('proclaim what you are commanded,' 15:94), the Prophet ﷺ stood on Mount Safa and called the clans of Quraysh. He asked if they would believe him if he said an army was about to attack from behind the mountain; they said yes, for he had never lied. He then warned them of Allah's punishment. His uncle Abu Lahab cursed him — and Surah Al-Masad (111) was revealed in response.",
                quranRef: ["15:94", "26:214", "111:1", "111:2"],
            },
            {
                year: "614-615 CE",
                location: "Mecca",
                title: "Torture of the weak",
                description: "Bilal ibn Rabah (an Abyssinian slave) was laid on burning sand with a stone on his chest — he responded only with 'Ahad, Ahad' ('One, One'). Sumayyah bint Khayyat, her husband Yasir, and their son 'Ammar were tortured publicly; Sumayyah was stabbed by Abu Jahl, becoming the first martyr in Islam. Abu Bakr spent his fortune buying and freeing enslaved Muslims.",
            },
            {
                year: "615 CE",
                location: "Abyssinia",
                title: "First migration to Abyssinia",
                description: "Told to seek refuge with the just Christian king An-Najashi, about 80 Muslims migrated to Abyssinia. Quraysh sent 'Amr ibn al-'As and 'Abdullah ibn Abi Rabi'a to demand their return. Ja'far ibn Abi Talib recited Surah Maryam before the king, who wept and refused to hand them over.",
            },
            {
                year: "616-619 CE",
                location: "Valley of Abu Talib, Mecca",
                title: "The boycott",
                description: "Quraysh signed a pact against Banu Hashim, refusing to trade, marry, or speak with them. For nearly three years the clan was besieged in a mountain valley, eating leaves, the children's hunger audible beyond the walls. The pact was eventually broken when termites ate the scroll — leaving only the name of Allah.",
            },
            {
                year: "619 CE",
                location: "Mecca",
                title: "The Year of Sorrow ('Am al-Huzn)",
                description: "Khadijah died — his wife of 25 years, his first believer, his comforter. Months later Abu Talib also died, still protecting him though he never openly embraced Islam. With his emotional and political shields gone, Mecca became unbearable.",
            },
            {
                year: "619 CE",
                location: "Ta'if",
                title: "Journey to Ta'if",
                description: "The Prophet ﷺ walked 60 miles to Ta'if seeking a new protector. Its leaders mocked him and set their children to stone him. Bloodied, he sheltered in a garden and made the du'a of Ta'if: 'O Allah, to You alone I complain of my weakness... if You are not angry with me, I do not care.' Jibril appeared with the angel of the mountains, offering to crush the city — he refused, saying 'perhaps from their loins Allah will bring forth those who worship Him alone.'",
            },
            {
                year: "~620 CE",
                location: "Mecca → Al-Aqsa → the Heavens",
                title: "Al-Isra wal-Mi'raj — the Night Journey",
                description: "In a single night, Jibril brought a steed named Buraq. The Prophet ﷺ was taken from the Ka'bah to Al-Aqsa in Jerusalem, where he led all the prophets in prayer, then ascended through the seven heavens. He met Adam, 'Isa, Yahya, Yusuf, Idris, Harun, Musa, and Ibrahim. He reached Sidrat al-Muntaha and was given the command of the five daily prayers. Surah Al-Isra opens with this event.",
                quranRef: ["17:1", "53:1", "53:18"],
            },
        ],
    },
    {
        id: "hijra",
        title: "5. The Hijra — Migration to Medina",
        period: "622 CE (1 AH)",
        summary: "When the pilgrimage of 620 and 621 brought delegations from Yathrib (Medina) who pledged allegiance to the Prophet ﷺ, the doors of da'wah opened there. The Aws and Khazraj tribes, exhausted by generations of civil war, sought a leader who could unite them. In 622, the Prophet ﷺ ordered his companions to migrate. The Hijra marks year 1 of the Islamic calendar — the birth of the first Muslim state.",
        events: [
            {
                year: "621 CE",
                location: "Aqabah, Mecca",
                title: "Pledges of Aqabah",
                description: "12 men from Medina pledged allegiance at Aqabah (First Pledge). The next year 73 men and 2 women pledged to protect the Prophet ﷺ as they would their own families (Second Pledge). Mus'ab ibn 'Umayr was sent back with them as Islam's first teacher in Medina.",
            },
            {
                year: "622 CE",
                location: "Mecca",
                title: "The plot to kill",
                description: "Quraysh agreed that one man from each clan would strike the Prophet ﷺ simultaneously so no clan could be held responsible for blood. Jibril warned him. He asked 'Ali to sleep in his bed and left with Abu Bakr — unseen, sprinkling dust on the conspirators.",
            },
            {
                year: "622 CE",
                location: "Cave of Thawr",
                title: "Three days in the cave",
                description: "The Prophet ﷺ and Abu Bakr hid in the cave of Thawr. Quraysh trackers reached the mouth of the cave. Abu Bakr wept: 'If they look down at their feet, they will see us.' The Prophet ﷺ answered: 'What do you think of two whose third is Allah?' A spider had spun a web and a dove had laid eggs at the entrance — the trackers turned away. Allah preserved this moment in Surah At-Tawba (9:40).",
                quranRef: ["9:40"],
            },
            {
                year: "622 CE",
                location: "Quba, outskirts of Medina",
                title: "Arrival in Medina",
                description: "After a 12-day journey, the Prophet ﷺ reached Quba and built the first mosque there. He then entered Medina, where the people came out singing 'Tala'a al-Badru 'alayna' ('The full moon has risen over us'). He let his she-camel walk freely — where it knelt became the site of Masjid an-Nabawi.",
            },
        ],
    },
    {
        id: "medinan",
        title: "6. Building the Medinan Community",
        period: "622 – 624 CE (1 – 2 AH)",
        summary: "The first acts in Medina built the architecture of a civilization: a mosque, a brotherhood, and a constitution. In Mecca the message was tawhid; in Medina it became a society.",
        events: [
            {
                year: "1 AH",
                location: "Medina",
                title: "Building Masjid an-Nabawi",
                description: "Built of palm trunks, mud brick, and palm leaves — simple, open, functional. The Prophet ﷺ carried bricks himself alongside the companions. Next to it rose his modest home.",
            },
            {
                year: "1 AH",
                location: "Medina",
                title: "Mu'akhat — Brotherhood",
                description: "He paired each Muhajir (migrant from Mecca) with an Ansari (helper from Medina) as literal brothers, sharing wealth and property. A social technology no civilization had seen — loyalty by faith, not by blood.",
            },
            {
                year: "1 AH",
                location: "Medina",
                title: "The Constitution of Medina",
                description: "A written covenant between the Muslims, the Jewish tribes (Banu Qaynuqa, Banu Nadir, Banu Qurayza), and the remaining pagan Arabs of Medina. All were citizens of one community (ummah) under the Prophet ﷺ's arbitration, free to practice their own faith, bound to defend the city together.",
            },
            {
                year: "2 AH",
                location: "Medina",
                title: "Change of Qiblah",
                description: "For 16 months the Muslims prayed facing Al-Aqsa in Jerusalem. In Rajab of 2 AH Allah commanded them to turn to the Ka'bah in Mecca — the direction set by Ibrahim. Surah Al-Baqarah preserves the moment.",
                quranRef: ["2:142", "2:143", "2:144"],
            },
            {
                year: "2 AH, Ramadan",
                location: "Medina",
                title: "Fasting of Ramadan ordained",
                description: "The obligation of fasting the month of Ramadan was revealed. The first zakat al-fitr was also legislated this year.",
                quranRef: ["2:183", "2:185"],
            },
        ],
    },
    {
        id: "battles",
        title: "7. The Major Battles",
        period: "2 – 5 AH (624 – 627 CE)",
        summary: "Quraysh would not let Medina live in peace. The confiscation of Muhajir property in Mecca, continued hostility, and caravan disputes led to three major battles that tested and forged the young community.",
        events: [
            {
                year: "2 AH (624 CE)",
                location: "Badr, 80 miles southwest of Medina",
                title: "Battle of Badr",
                description: "313 Muslims against ~1,000 Quraysh. A decisive Muslim victory — 14 martyrs, 70 Qurayshi dead, 70 captured. Allah sent angels to fight alongside the believers (3:124-125). Prisoners who could read were freed in exchange for teaching 10 Muslim children. Abu Jahl was killed. This was the furqan (criterion) — the day truth was distinguished from falsehood.",
                quranRef: ["3:123", "3:125", "8:9", "8:17"],
            },
            {
                year: "3 AH (625 CE)",
                location: "Mount Uhud, outside Medina",
                title: "Battle of Uhud",
                description: "3,000 Quraysh came for revenge. The Muslims (700 after 'Abdullah ibn Ubayy withdrew with 300 hypocrites) held the field until the archers posted on the mountain abandoned their position to collect spoils. Khalid ibn al-Walid (still a pagan) led a cavalry charge around the mountain. 70 Muslims were martyred — including Hamza, the Prophet's uncle. The Prophet ﷺ himself was wounded, his tooth broken. A sobering lesson about discipline and obedience.",
                quranRef: ["3:152", "3:153", "3:165", "3:166"],
            },
            {
                year: "5 AH (627 CE)",
                location: "Medina",
                title: "Battle of the Trench (Al-Khandaq / Al-Ahzab)",
                description: "A confederacy of 10,000 — Quraysh, Ghatafan, and Jewish tribes — besieged Medina. On Salman al-Farisi's suggestion, the Muslims dug a trench along the exposed side of the city. The siege lasted nearly a month. Allah sent a freezing wind that overturned the enemy camp and they fled. Surah Al-Ahzab (33) preserves it.",
                quranRef: ["33:9", "33:10", "33:11", "33:25"],
            },
        ],
    },
    {
        id: "hudaybiyya",
        title: "8. The Treaty of Hudaybiyyah",
        period: "6 AH (628 CE)",
        summary: "In the sixth year of Hijra, the Prophet ﷺ saw in a dream that he was performing 'umrah at the Ka'bah. He set out with 1,400 companions. Quraysh blocked them at Hudaybiyyah outside Mecca. What followed looked like defeat but was called in the Quran 'a manifest victory' (48:1).",
        events: [
            {
                year: "6 AH",
                location: "Hudaybiyyah",
                title: "The Pledge of Ridwan",
                description: "Hearing that his envoy 'Uthman had been killed (a rumor, as it turned out), the Prophet ﷺ gathered his companions under a tree and they pledged to fight to the death. Allah said: 'Allah was pleased with the believers when they pledged to you under the tree' (48:18).",
                quranRef: ["48:18"],
            },
            {
                year: "6 AH",
                location: "Hudaybiyyah",
                title: "The Treaty",
                description: "Terms that seemed humiliating: the Muslims would return this year without 'umrah and could come the next year for only 3 days; a 10-year truce; any Meccan who came to Medina without guardian's permission would be returned, but Medinans going to Mecca would not. 'Umar objected. Abu Bakr said: 'He is the Messenger of Allah; he would not disobey Him, and Allah will not let him down.' Revealed on the return: Surah Al-Fath — 'Indeed We have granted you a manifest victory.'",
                quranRef: ["48:1", "48:18", "48:27"],
            },
            {
                year: "7 AH",
                location: "Everywhere",
                title: "Letters to kings",
                description: "With borders secure under the truce, the Prophet ﷺ sent letters to Heraclius (Byzantium), Khosrow (Persia), An-Najashi (Abyssinia), Muqawqis (Egypt), and other rulers inviting them to Islam. Heraclius respected the letter; Khosrow tore his and died soon after; An-Najashi accepted; Muqawqis sent gifts including Mariyah, who would bear the Prophet ﷺ his son Ibrahim.",
            },
            {
                year: "7 AH",
                location: "Khaybar",
                title: "Conquest of Khaybar",
                description: "The Jewish fortress of Khaybar, a center of anti-Muslim conspiracy, was conquered after a siege. 'Ali ibn Abi Talib took the fortress of Qamus. A Jewish woman attempted to poison the Prophet ﷺ; the meat spoke to him, warning him.",
            },
        ],
    },
    {
        id: "conquest",
        title: "9. The Conquest of Mecca",
        period: "8 AH (630 CE)",
        summary: "Quraysh violated the treaty by helping their allies attack a tribe allied with the Muslims. In the month of Ramadan, 8 AH, the Prophet ﷺ marched on Mecca with 10,000 companions — the largest Muslim army yet assembled.",
        events: [
            {
                year: "8 AH, Ramadan",
                location: "Outskirts of Mecca",
                title: "The army of 10,000",
                description: "The Prophet ﷺ kept the movement secret until the last moment, then ordered each man to light a fire at night — from the hills Quraysh saw 10,000 fires and surrendered in their hearts. Abu Sufyan, the chief of Quraysh, came out and accepted Islam.",
            },
            {
                year: "8 AH",
                location: "Mecca",
                title: "Entering Mecca with bowed head",
                description: "The Prophet ﷺ entered the city with his head bowed low to the saddle in humility, not as a conqueror. At the Ka'bah he recited: 'Truth has come, and falsehood has vanished' (17:81), and personally toppled the 360 idols. He declared a general amnesty: 'Go — you are free.' Even those who had killed his uncle Hamza and his cousin were forgiven. Bilal climbed the Ka'bah and gave the adhan for the first time over Mecca.",
                quranRef: ["17:81", "110:1", "110:2", "110:3"],
            },
            {
                year: "8 AH",
                location: "Hunayn / Ta'if",
                title: "Battle of Hunayn and siege of Ta'if",
                description: "The Hawazin tribe attacked the Muslim army after its victory; initial panic gave way to victory (9:25-26). Ta'if was then besieged; though it held, its people embraced Islam the following year — the Prophet ﷺ's du'a at Ta'if ten years earlier was answered.",
                quranRef: ["9:25", "9:26"],
            },
        ],
    },
    {
        id: "final-years",
        title: "10. The Final Years",
        period: "9 – 11 AH (630 – 632 CE)",
        summary: "Arabia came to Islam. Delegations streamed to Medina from every tribe — this became known as 'The Year of Delegations' (9 AH). In 10 AH the Prophet ﷺ performed the only Hajj of his life — the Farewell Hajj — where he delivered the Farewell Sermon. In Rabi' al-Awwal of 11 AH, at age 63, he returned to his Lord.",
        events: [
            {
                year: "9 AH (630 CE)",
                location: "Tabuk (northern Hijaz)",
                title: "Expedition of Tabuk",
                description: "Hearing reports of Byzantine massing in Syria, the Prophet ﷺ led a 30,000-strong expedition in the heat of summer to Tabuk. The Byzantines did not appear. The expedition revealed the hypocrites (munafiqun) in Medina; Surah At-Tawba (the only surah without Bismillah) was revealed on the return.",
                quranRef: ["9:38", "9:40", "9:117"],
            },
            {
                year: "9 AH",
                location: "Medina",
                title: "The Year of Delegations ('Am al-Wufud)",
                description: "Tribes from across Arabia — Ta'if, Najran (Christian), Banu Tamim, Banu Hanifah, and dozens more — sent delegations accepting Islam. Arabia, for the first time in its history, was politically and religiously united.",
            },
            {
                year: "10 AH (632 CE), Dhul Hijjah",
                location: "Arafah, Mecca",
                title: "The Farewell Hajj and Farewell Sermon",
                description: "The Prophet ﷺ performed Hajj with over 100,000 companions. At Arafah he delivered the Farewell Sermon: 'All mankind is from Adam and Hawwa; an Arab has no superiority over a non-Arab, nor a non-Arab over an Arab; nor a white over a black, nor a black over a white — except by taqwa. I am leaving behind two things; if you hold fast to them, you will never go astray: the Book of Allah and my Sunnah.' The final verse was revealed here: 'This day I have perfected your religion for you' (5:3).",
                quranRef: ["5:3"],
            },
            {
                year: "11 AH (632 CE), Rabi' al-Awwal",
                location: "Medina, home of 'A'ishah",
                title: "The Prophet's ﷺ passing",
                description: "He fell ill with fever. For the last days he insisted Abu Bakr lead the prayers. On Monday, 12 Rabi' al-Awwal, at age 63, he died with his head on 'A'ishah's chest, whispering: 'O Allah, the highest companion.' 'Umar refused to believe it until Abu Bakr came out and said: 'Whoever worshipped Muhammad — Muhammad is dead. Whoever worships Allah — Allah is living and does not die,' and recited 3:144. He was buried where he died, in 'A'ishah's room, beside where Abu Bakr and 'Umar would later lie. The mission was complete.",
                quranRef: ["3:144", "39:30", "39:31"],
            },
        ],
    },
];
