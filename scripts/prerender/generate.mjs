// Runs after `vite build`. Writes one static HTML page per surah (/quran/2) and per
// ayah (/quran/2/255) from the committed snapshot, extends the sitemap with them,
// and replaces the catch-all SPA rewrite with per-route rewrites plus a real 404.
//
// Each page is the built index.html with its own <head> tags and the verse text
// already inside #root, so crawlers and link previews see real content. React
// replaces #root on load and the reader takes over at the same URL.
import fs from "node:fs";
import path from "node:path";
import { renderPrayerPages } from "./prayer-pages.mjs";

// The Capacitor apps bundle dist/public, and 6,000+ crawler pages don't belong there.
if (process.env.SKIP_PRERENDER) {
    console.log("SKIP_PRERENDER set: no prerendered pages, sitemap entries or _redirects");
    process.exit(0);
}

const ROOT = path.resolve(import.meta.dirname, "..", "..");
const DIST = path.join(ROOT, "dist", "public");
const ORIGIN = "https://masteringquran.com";
const snapshot = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "data", "quran-snapshot.json"), "utf8"));
const namesData = JSON.parse(fs.readFileSync(path.join(ROOT, "client", "src", "data", "names.json"), "utf8"));
const template = fs.readFileSync(path.join(DIST, "index.html"), "utf8");

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Titles and descriptions must match what client/src/pages/Quran.tsx sets after load.
const surahTitle = s => `Surah ${s.nameSimple} (${s.number}) - Arabic, Translation and Tafsir | Mastering Quran`;
const ayahTitle = (s, a) => `Surah ${s.nameSimple} ${s.number}:${a} - Translation and Tafsir | Mastering Quran`;
const surahDescription = s =>
    `Read Surah ${s.nameSimple} (${s.nameTranslated}), chapter ${s.number} of the Quran, ${s.versesCount} verses, in Arabic with English translation, word-by-word study, audio recitation and 10 tafsirs.`;
const ayahDescription = (s, a) =>
    `Read Quran ${s.number}:${a} from Surah ${s.nameSimple} in Arabic with English translation, word-by-word study, audio recitation and 10 tafsirs.`;

function setHead(html, { title, description, pathname, jsonLd, noindex }) {
    const url = `${ORIGIN}${pathname}`;
    const swaps = [
        [/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`],
        [/(<meta name="description" content=")[^"]*(")/, `$1${esc(description)}$2`],
        [/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`],
        [/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(description)}$2`],
        [/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`],
        [/(<meta property="og:type" content=")[^"]*(")/, `$1article$2`],
        [/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(title)}$2`],
        [/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(description)}$2`],
        [/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`],
    ];
    for (const [re, rep] of swaps) {
        if (!re.test(html)) throw new Error(`template is missing ${re}`);
        html = html.replace(re, rep);
    }
    const extra = [
        noindex ? `<meta name="robots" content="noindex" />` : "",
        jsonLd ? `<script type="application/ld+json" data-page-json-ld>${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>` : "",
        `<style>${STYLE}</style>`,
    ].join("");
    return html.replace("</head>", `${extra}</head>`);
}

const setBody = (html, body) => {
    if (!html.includes('<div id="root"></div>')) throw new Error("template is missing empty #root");
    return html.replace('<div id="root"></div>', `<div id="root"><main class="mqp">${body}</main></div>`);
};

// Minimal styling for the moment before the app loads (and for no-JS visitors).
const STYLE = `.mqp{max-width:760px;margin:0 auto;padding:32px 16px 64px;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#0f172a;line-height:1.6}.mqp a{color:#047857}.mqp nav{font-size:14px;margin-bottom:16px}.mqp h1{font-size:28px;line-height:1.25;margin:0 0 4px}.mqp .meta{color:#475569;font-size:14px;margin:0 0 24px}.mqp .ar{font-size:30px;line-height:2.1;text-align:right;margin:0 0 12px}.mqp .en{font-size:17px;margin:0}.mqp .src{color:#64748b;font-size:13px}.mqp section{border-top:1px solid #e2e8f0;padding:20px 0}.mqp blockquote{margin:8px 0;padding-left:14px;border-left:3px solid #a7f3d0}.mqp .pager{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:24px}.mqp ol{list-style:none;padding:0;margin:0}.mqp .names{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.mqp .names li{border:1px solid #e2e8f0;border-radius:12px;padding:14px}.mqp .names h2{font-size:17px;margin:0}.mqp .names .ar{font-size:26px;margin:0}.mqp .names .en{font-size:14px}.mqp table{border-collapse:collapse;width:100%;font-size:14px}.mqp th,.mqp td{padding:6px 8px;text-align:right;border-bottom:1px solid #e2e8f0;white-space:nowrap}.mqp th:first-child,.mqp td:first-child{text-align:left}@media(max-width:560px){.mqp .names{grid-template-columns:1fr}}@media(prefers-color-scheme:dark){.mqp{color:#e2e8f0}.mqp .meta,.mqp .src{color:#94a3b8}.mqp a{color:#34d399}.mqp section,.mqp .names li{border-color:#1e293b}}`;

const crumbs = items => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, p], i) => ({
        "@type": "ListItem",
        position: i + 1,
        name,
        item: `${ORIGIN}${p}`,
    })),
});

const { translation, tafsir } = snapshot;
const surahs = snapshot.surahs;
const write = (rel, html) => {
    const file = path.join(DIST, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
};

// Public landing pages should not send crawlers, link unfurlers, or no-JavaScript
// readers an empty app shell with the homepage canonical URL. These concise
// first-response summaries are replaced by the interactive app in browsers.
const publicPages = [
    {
        pathname: "/",
        title: "Mastering Quran | Read, Learn, and Understand the Holy Quran",
        description: "Read the Quran with translation, audio and tafsir. Learn Arabic through 12 free lessons, browse hadith, and build a daily study habit.",
        heading: "Mastering Quran",
        lede: "Read with understanding, learn Quranic Arabic step by step, and build a daily study habit. The site is free to study and has no ads.",
        sections: [
            ["Read and understand", "Read all 114 surahs with Arabic text, identified translations, word-by-word study, recitation audio, and ten English tafsir editions."],
            ["Learn Quranic Arabic", "Follow a twelve-lesson path from Arabic letters and vowel marks to vocabulary, grammar, roots, writing, and guided surah reading."],
            ["Daily study tools", "Browse sourced hadith and duas, prayer times, the Names of Allah, reading plans, quizzes, flash cards, and reminders."],
        ],
        links: [["Read the Quran", "/quran/1"], ["Start learning Arabic", "/learn-arabic"], ["Browse hadith", "/hadith"], ["Review sources", "/sources"]],
    },
    {
        pathname: "/hadith",
        title: "Hadith Library | Sahih Bukhari, Muslim, and More",
        description: "Browse ten English hadith collections including Sahih al-Bukhari, Sahih Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah, Muwatta Malik, and Forty Hadith compilations.",
        heading: "Hadith Collections",
        lede: "Browse ten English collection datasets drawn from the six main books and other classical compilations. Collection, book, number, and available grades are shown with each entry.",
        sections: [["The six major collections", "Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud, Jami' at-Tirmidhi, Sunan an-Nasa'i, and Sunan Ibn Majah."], ["Other compilations", "Muwatta Malik, Forty Hadith of an-Nawawi, Forty Hadith Qudsi, and Forty Hadith of Shah Waliullah."]],
        links: [["Browse the hadith library", "/hadith"], ["Hadith sources", "/sources"]],
    },
    {
        pathname: "/duas",
        title: "Duas from the Quran and Sunnah | Mastering Quran",
        description: "Browse 126 supplications quoted from the Quran and hadith collections, organized into 27 categories with references and available grading.",
        heading: "Duas and Supplications",
        lede: "Study 126 supplications across 27 categories. Each entry identifies its Quran or hadith source and includes grading information when the source dataset provides it.",
        sections: [["Sourced text", "Arabic, transliteration where available, English meaning, and a direct source reference are presented together."], ["Search by need", "Browse categories including worship, forgiveness, protection, family, travel, morning, evening, and daily life."]],
        links: [["Browse all duas", "/duas"], ["Review the source methodology", "/sources"]],
    },
    {
        pathname: "/adhkar",
        title: "Morning and Evening Adhkar with a Counter | Mastering Quran",
        description: "Daily adhkar routines for the morning, evening, before sleep, on waking, after salah and through the day, with a tap counter. Each dhikr is quoted from the Quran or hadith with its reference and count.",
        heading: "Adhkar Routines",
        lede: "Six daily routines following Hisn al-Muslim. Say each dhikr one at a time with a counter that starts fresh every day.",
        sections: [["Sourced text and counts", "Arabic, English or transliteration, the reference with its grading, and the words of the hadith that give each count and time."], ["Six routines", "Morning, evening, before sleep, on waking, after each obligatory prayer, and adhkar counted across the day."]],
        links: [["Open the adhkar routines", "/adhkar"], ["Browse all duas", "/duas"], ["Review the source methodology", "/sources"]],
    },
    {
        pathname: "/learn-arabic",
        title: "Learn Quranic Arabic from Zero | Mastering Quran",
        description: "Learn Quranic Arabic from zero with a 12-lesson path covering letters, harakat, tajweed, vocabulary, grammar, roots, writing, and five surahs.",
        heading: "Learn Arabic from Zero",
        lede: "A twelve-lesson Quran-first path from recognizing Arabic letters to reading complete surahs, with progress saving available through a free account.",
        sections: [["Foundations", "Learn all 28 letters, their joined shapes, short vowels, tanween, sukun, shaddah, and madd."], ["Reading and meaning", "Practice tajweed foundations, common Quranic vocabulary, grammar, roots, writing, and guided surah reading."]],
        links: [["Begin with Arabic letters", "/learn-arabic/letters"], ["View the curriculum", "/learn-arabic"]],
    },
    {
        pathname: "/prophets",
        title: "Stories of the 25 Prophets in the Quran | Mastering Quran",
        description: "Explore the lives, lessons, and Quranic references of the 25 prophets named in the Quran, from Adam to Muhammad ﷺ.",
        heading: "Stories of the Prophets",
        lede: "Explore the 25 prophets named in the Quran, their people, major events, lessons, and linked Quranic references.",
        sections: [["Follow the references", "Each profile connects the narrative to relevant Quran passages and available hadith material."], ["Study the lessons", "Search by prophet, people, or title and examine recurring themes such as faith, patience, repentance, justice, and mercy."]],
        links: [["Explore the prophets", "/prophets"], ["Read the Quran", "/quran"]],
    },
    {
        pathname: "/seerah",
        title: "Seerah of Prophet Muhammad ﷺ | Mastering Quran",
        description: "Study the life of Prophet Muhammad ﷺ through a chronological seerah with Quranic references, key events, locations, and lessons.",
        heading: "The Seerah of Prophet Muhammad ﷺ",
        lede: "A chronological study of the Prophet's life, from Arabia before Islam and the first revelation through the Madinan period and final pilgrimage.",
        sections: [["Chronological chapters", "Follow major events, dates, locations, people, and themes in sequence."], ["Quran connections", "Open related verses while studying events and their enduring lessons."]],
        links: [["Study the Seerah", "/seerah"], ["Browse Quran topics", "/topics"]],
    },
    {
        pathname: "/hajj",
        title: "Hajj and Umrah Step-by-Step Guide | Mastering Quran",
        description: "A step-by-step study guide to Hajj and Umrah covering rites, locations, days, and relevant duas from ihram through the farewell tawaf.",
        heading: "Hajj and Umrah",
        lede: "Study the sequence of Hajj and Umrah rites, their locations, timing, practical notes, and relevant supplications.",
        sections: [["Umrah", "Review ihram, tawaf, sa'i, and completion in order."], ["Hajj", "Follow the days and stations of Hajj from ihram through Mina, Arafah, Muzdalifah, the stoning rites, sacrifice, tawaf, and departure."]],
        links: [["Open the pilgrimage guide", "/hajj"], ["Browse duas", "/duas"]],
    },
    {
        pathname: "/glossary",
        title: "Islamic Glossary | Mastering Quran",
        description: "Search more than 120 Islamic terms with Arabic, transliteration, definitions, categories, and related concepts.",
        heading: "Islamic Glossary",
        lede: "A searchable reference of more than 120 terms covering worship, theology, Quran and revelation, ethics, jurisprudence, community, history, and daily practice.",
        sections: [["Arabic and transliteration", "Each entry presents the term in English and Arabic with a clear transliteration."], ["Definitions in context", "Definitions, related concepts, and categories help connect unfamiliar vocabulary across the site."]],
        links: [["Search the glossary", "/glossary"], ["Learn Quranic Arabic", "/learn-arabic"]],
    },
    {
        pathname: "/about",
        title: "About Mastering Quran",
        description: "Learn what Mastering Quran provides, how its Quran, hadith, tafsir, dua, prayer, and Arabic-learning data are sourced, and how to report a correction.",
        heading: "About Mastering Quran",
        lede: "Mastering Quran is a free, ad-free study platform for reading the Quran, learning Quranic Arabic, browsing sourced hadith and duas, and developing a consistent study habit.",
        sections: [["Learning tools", "Read and listen to the Quran, open identified translations and tafsirs, study Arabic, save notes and bookmarks, and use daily practice tools."], ["Scope and responsibility", "The site supports study and reflection. It does not replace qualified scholars or teachers for personal rulings, fatwas, or urgent guidance."]],
        links: [["Read the methodology", "/sources"], ["Frequently asked questions", "/faq"]],
    },
    {
        pathname: "/sources",
        title: "Sources and Methodology | Mastering Quran",
        description: "Review the Quran, translation, tafsir, hadith, dua, prayer-time, and Arabic-language sources used by Mastering Quran.",
        heading: "Sources and Methodology",
        lede: "See where the site's Quran text, translations, recitations, tafsirs, hadith, duas, prayer calculations, and Arabic-language material come from.",
        sections: [["Traceable editions", "Translations, tafsirs, hadith collections, and source datasets are named so readers can identify the edition being presented."], ["Corrections and limitations", "AI-supported answers can make mistakes and should be checked against their cited references. The site provides a route for reporting corrections."]],
        links: [["Review all sources", "/sources"], ["Ask a question", "/ask"], ["About the project", "/about"]],
    },
];
const publicPagePaths = new Set(publicPages.map(page => page.pathname));

for (const page of publicPages) {
    const sections = page.sections.map(([heading, copy]) => `<section><h2>${esc(heading)}</h2><p>${esc(copy)}</p></section>`).join("");
    const links = page.links.map(([label, href]) => `<li><a href="${esc(href)}">${esc(label)}</a></li>`).join("");
    const body = `<nav><a href="/">Mastering Quran</a></nav><h1>${esc(page.heading)}</h1><p class="meta">${esc(page.lede)}</p>${sections}<section><h2>Continue studying</h2><ul>${links}</ul></section>`;
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": page.pathname === "/" ? "WebSite" : "CollectionPage",
        name: page.heading,
        url: `${ORIGIN}${page.pathname}`,
        description: page.description,
        isPartOf: page.pathname === "/" ? undefined : { "@type": "WebSite", name: "Mastering Quran", url: ORIGIN },
    };
    const html = setBody(setHead(template, { title: page.title, description: page.description, pathname: page.pathname, jsonLd }), body);
    write(page.pathname === "/" ? "index.html" : `${page.pathname.slice(1)}/index.html`, html);
}

// Public FAQ: ship the questions and answers in the first response so search
// engines and no-JavaScript readers do not receive an empty app shell.
const faqItems = [
    [
        "Is Mastering Quran really free?",
        "Yes. The site has no ads, no paywalls, no advertising tracking, and no account requirement for core features. A free account adds synced bookmarks, notes, and memorization tracking.",
    ],
    [
        "Which Quran translations are available?",
        "There are 17 selectable resources across 7 languages, including a Latin transliteration. The selected translation or transliteration edition is identified in the reader.",
    ],
    [
        "Which tafsirs are included?",
        "Ten English tafsir editions are available, including abridged Ibn Kathir, al-Jalalayn, Ma'arif al-Qur'an, Tazkirul Quran, and the other editions named on the Sources page.",
    ],
    [
        "Which hadith collections are included?",
        "Ten English collection datasets are available. Collection, book, number, and grade are shown where the source dataset provides them.",
    ],
    [
        "How does the AI avoid fabricated citations?",
        "The AI is required to fetch Quran, hadith, or tafsir source text before making factual claims and to show references. Users should still open and verify the cited sources.",
    ],
    [
        "What is the AI scoped to?",
        "The AI is scoped to Quran text and meaning, authentic hadith, and classical tafsir. It declines fatwas, personal religious guidance, theological disputes, and matters requiring qualified scholarly judgment.",
    ],
    [
        "Does Mastering Quran replace a qualified scholar?",
        "No. Mastering Quran supports learning and reflection. It does not replace qualified teachers, scholars, or local religious authorities for personal rulings, fatwas, or urgent guidance.",
    ],
];
const faqPath = "/faq";
const faqDescription = "Answers about Mastering Quran translations, tafsir editions, hadith collections, AI citations, privacy, and source methodology.";
const faqBody = `<nav><a href="/">Mastering Quran</a> / FAQ</nav><h1>Frequently asked questions</h1><p class="meta">Translations, tafsir, hadith, AI citations, and study boundaries.</p>${faqItems.map(([q, a]) => `<section><h2>${esc(q)}</h2><p>${esc(a)}</p></section>`).join("")}<p><a href="/sources">Review sources and methodology</a></p>`;
write(
    "faq.html",
    setBody(
        setHead(template, {
            title: "FAQ - Mastering Quran",
            description: faqDescription,
            pathname: faqPath,
            jsonLd: {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: faqItems.map(([q, a]) => ({
                    "@type": "Question",
                    name: q,
                    acceptedAnswer: { "@type": "Answer", text: a },
                })),
            },
        }),
        faqBody
    )
);

for (const s of surahs) {
    const prev = surahs[s.number - 2];
    const next = surahs[s.number];
    const surahPath = `/quran/${s.number}`;

    // Surah page: every verse, each linking to its own page.
    const verseList = s.verses
        .map(
            v =>
                `<li><section id="ayah-${s.number}-${v.n}"><p class="ar" lang="ar" dir="rtl">${esc(v.ar)}</p><p class="en"><a href="${surahPath}/${v.n}">${s.number}:${v.n}</a> ${esc(v.en)}</p></section></li>`
        )
        .join("");
    const surahBody =
        `<nav><a href="/">Mastering Quran</a> / <a href="/quran">Quran</a> / Surah ${esc(s.nameSimple)}</nav>` +
        `<h1>Surah ${esc(s.nameSimple)} <span lang="ar" dir="rtl">${esc(s.nameArabic)}</span></h1>` +
        `<p class="meta">${esc(s.nameTranslated)} · Chapter ${s.number} · ${s.versesCount} verses · ${s.revelation}</p>` +
        `<p class="src">Translation: ${esc(translation.name)}</p>` +
        `<ol>${verseList}</ol>` +
        `<div class="pager">${prev ? `<a href="/quran/${prev.number}">Previous: Surah ${esc(prev.nameSimple)}</a>` : "<span></span>"}${next ? `<a href="/quran/${next.number}">Next: Surah ${esc(next.nameSimple)}</a>` : ""}</div>`;
    write(
        `quran/${s.number}.html`,
        setBody(
            setHead(template, {
                title: surahTitle(s),
                description: surahDescription(s),
                pathname: surahPath,
                jsonLd: crumbs([
                    ["Quran", "/quran"],
                    [`Surah ${s.nameSimple}`, surahPath],
                ]),
            }),
            surahBody
        )
    );

    // Ayah pages.
    for (const v of s.verses) {
        const ayahPath = `${surahPath}/${v.n}`;
        const prevAyah = v.n > 1 ? `${surahPath}/${v.n - 1}` : prev ? `/quran/${prev.number}/${prev.versesCount}` : null;
        const nextAyah = v.n < s.versesCount ? `${surahPath}/${v.n + 1}` : next ? `/quran/${next.number}/1` : null;
        const tafsirBlock = v.tafsir
            ? `<section><h2>Tafsir</h2><blockquote>${esc(v.tafsir.text)}${v.tafsir.truncated ? " …" : ""}</blockquote>` +
              `<p class="src">Excerpt from ${esc(tafsir.name)}, commentary on ${s.number}:${v.n}, via Quran.com. The reader has the full commentary and 9 more tafsirs.</p></section>`
            : "";
        const body =
            `<nav><a href="/">Mastering Quran</a> / <a href="/quran">Quran</a> / <a href="${surahPath}">Surah ${esc(s.nameSimple)}</a> / ${s.number}:${v.n}</nav>` +
            `<h1>Surah ${esc(s.nameSimple)} ${s.number}:${v.n}</h1>` +
            `<p class="meta">${esc(s.nameTranslated)} · Verse ${v.n} of ${s.versesCount} · Juz ${v.juz} · Page ${v.page}</p>` +
            `<section><p class="ar" lang="ar" dir="rtl">${esc(v.ar)}</p><p class="en">${esc(v.en)}</p><p class="src">Translation: ${esc(translation.name)}</p></section>` +
            tafsirBlock +
            `<div class="pager">${prevAyah ? `<a href="${prevAyah}">Previous verse</a>` : "<span></span>"}<a href="${surahPath}">All of Surah ${esc(s.nameSimple)}</a>${nextAyah ? `<a href="${nextAyah}">Next verse</a>` : ""}</div>`;
        write(
            `quran/${s.number}/${v.n}.html`,
            setBody(
                setHead(template, {
                    title: ayahTitle(s, v.n),
                    description: ayahDescription(s, v.n),
                    pathname: ayahPath,
                    jsonLd: crumbs([
                        ["Quran", "/quran"],
                        [`Surah ${s.nameSimple}`, surahPath],
                        [`${s.number}:${v.n}`, ayahPath],
                    ]),
                }),
                body
            )
        );
    }
}

// 99 Names: render the complete sourced list for crawlers and no-JavaScript visitors.
const namesPath = "/names";
const namesTitle = "99 Names of Allah (Asma ul-Husna) | Mastering Quran";
const namesDescription =
    "Explore the traditional 99 Names of Allah list in Arabic with transliteration and sourced English renderings, plus clear notes on the hadith evidence.";
const namesItems = namesData.names
    .map(
        name =>
            `<li id="name-${name.number}"><span class="src">${name.number} of 99</span>` +
            `<p class="ar" lang="ar" dir="rtl">${esc(name.arabic)}</p>` +
            `<h2>${esc(name.transliteration)}</h2>` +
            (name.english ? `<p class="en">${esc(name.english)}</p>` : "") +
            (name.explanation ? `<blockquote>${esc(name.explanation)}</blockquote>` : "") +
            `<p class="src">Source: ${esc(name.englishSource || "No reliable sourced English rendering")}</p></li>`
    )
    .join("");
const namesBody =
    `<nav><a href="/">Mastering Quran</a> / 99 Names of Allah</nav>` +
    `<h1>99 Names of Allah <span lang="ar" dir="rtl">الأسماء الحسنى</span></h1>` +
    `<p class="meta">Arabic, transliteration and sourced English renderings</p>` +
    `<p>“And to Allāh belong the best names, so invoke Him by them.” <a href="/quran/7/180">Quran 7:180</a>, Saheeh International.</p>` +
    `<section><h2>What is this list?</h2><p>This page presents the traditional enumeration in <a href="https://sunnah.com/tirmidhi:3507">Jami\` at-Tirmidhi 3507</a>. The hadith that Allah has ninety-nine names is authentic (<a href="https://sunnah.com/bukhari:7392">Sahih al-Bukhari 7392</a> and <a href="https://sunnah.com/muslim:2677a">Sahih Muslim 2677</a>), but those narrations do not enumerate the names.</p><p>The Tirmidhi enumeration is graded <em>da'if</em> (weak). This page does not claim that Allah's names are limited to only ninety-nine. Each English rendering identifies its source; where no reliable sourced rendering was available, none is supplied.</p></section>` +
    `<p class="src">99 of 99 names</p><ol class="names">${namesItems}</ol>`;
const namesJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "99 Names of Allah (Asma ul-Husna)",
    description: "The traditional 99-name enumeration in Jami` at-Tirmidhi 3507, with Arabic, transliteration and sourced English renderings.",
    numberOfItems: namesData.names.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: namesData.names.map(name => ({
        "@type": "ListItem",
        position: name.number,
        url: `${ORIGIN}/names#name-${name.number}`,
        name: name.transliteration,
        ...(name.english ? { description: name.english } : {}),
    })),
};
write(
    "names.html",
    setBody(
        setHead(template, {
            title: namesTitle,
            description: namesDescription,
            pathname: namesPath,
            jsonLd: namesJsonLd,
        }),
        namesBody
    )
);

const prayer = await renderPrayerPages({
    ROOT,
    ORIGIN,
    template,
    setHead,
    setBody,
    esc,
    write,
});

// Sitemap: keep the hand-written static routes, add every surah, ayah and city page.
const sitemapFile = path.join(DIST, "sitemap.xml");
const sitemap = fs.readFileSync(sitemapFile, "utf8");
const entries = surahs
    .flatMap(s => [
        `  <url><loc>${ORIGIN}/quran/${s.number}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
        ...s.verses.map(v => `  <url><loc>${ORIGIN}/quran/${s.number}/${v.n}</loc><changefreq>yearly</changefreq><priority>0.6</priority></url>`),
    ])
    .join("\n");
fs.writeFileSync(sitemapFile, sitemap.replace("</urlset>", `${entries}\n${prayer.sitemap.join("\n")}\n</urlset>`));

// Routing: rewrite only the app's real routes to the SPA shell, so unknown paths
// get 404.html with a 404 status instead of a soft 200. /quran/S and /quran/S/A
// are served by the static files above; an out-of-range one is a true 404.
const appSource = fs.readFileSync(path.join(ROOT, "client", "src", "App.tsx"), "utf8");
const routes = [...appSource.matchAll(/<Route path="([^"]+)"/g)]
    .map(m => m[1])
    .filter(p => p !== "*" && p !== namesPath && !publicPagePaths.has(p) && !p.includes(":") && !prayer.staticRoutes.has(p));
if (routes.length < 20) throw new Error(`only found ${routes.length} routes in App.tsx`);
fs.writeFileSync(
    path.join(DIST, "_redirects"),
    routes
        .filter(p => p !== faqPath)
        .map(p => `${p} / 200`)
        .join("\n") + "\n"
);

write(
    "404.html",
    setHead(template, {
        title: "Page Not Found - Mastering Quran",
        description: "The page you are looking for does not exist.",
        pathname: "/404",
        noindex: true,
    }).replace(/<link rel="canonical"[^>]*>\s*/, "")
);

const total = surahs.reduce((n, s) => n + s.verses.length, 0);
console.log(
    `prerendered ${surahs.length} surah, ${total} ayah, 99 Names, ${prayer.count} prayer-time and ${prayer.count} Ramadan ${prayer.ramadanYear} city pages; ${routes.length} SPA routes; 404.html`
);
