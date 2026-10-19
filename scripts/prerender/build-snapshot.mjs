// Builds the verse snapshot that scripts/prerender/generate.mjs turns into static
// surah and ayah pages. Run it by hand when the source data changes, then commit
// the output; the Pages build reads only the committed snapshot (no network).
//
//   node scripts/prerender/build-snapshot.mjs /path/to/nwv-islamic-data
//
// Sources:
//   - Uthmani text + Saheeh International (resource 20): Quran.com API v4
//   - Tafsir al-Jalalayn excerpt: nwv-islamic-data/tafsir/en-al-jalalayn/<s>/<a>.json
import fs from "node:fs";
import path from "node:path";

const dataRepo = process.argv[2];
if (!dataRepo || !fs.existsSync(path.join(dataRepo, "tafsir", "en-al-jalalayn"))) {
    console.error("usage: node scripts/prerender/build-snapshot.mjs /path/to/nwv-islamic-data");
    process.exit(1);
}

const API = "https://api.quran.com/api/v4";
const TRANSLATION_ID = 20; // Saheeh International
const EXCERPT_MAX = 320;
const outFile = path.join(import.meta.dirname, "data", "quran-snapshot.json");

async function getJson(url) {
    for (let attempt = 1; ; attempt++) {
        const res = await fetch(url);
        if (res.ok) return res.json();
        if (attempt >= 4) throw new Error(`${res.status} ${url}`);
        await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
}

const cleanTranslation = (text) =>
    (text || "").replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

// The excerpt is an exact leading substring of the tafsir text, cut at the last
// sentence end (or failing that, the last word) that fits in EXCERPT_MAX.
function excerpt(text) {
    const t = (text || "").replace(/\s+/g, " ").trim();
    if (t.length <= EXCERPT_MAX) return { text: t, truncated: false };
    const head = t.slice(0, EXCERPT_MAX);
    const sentenceEnd = Math.max(head.lastIndexOf(". "), head.lastIndexOf("; "));
    if (sentenceEnd > EXCERPT_MAX * 0.5) return { text: head.slice(0, sentenceEnd + 1), truncated: true };
    return { text: head.slice(0, head.lastIndexOf(" ")), truncated: true };
}

function readTafsir(surah, ayah) {
    const file = path.join(dataRepo, "tafsir", "en-al-jalalayn", String(surah), `${ayah}.json`);
    if (!fs.existsSync(file)) return null;
    const { text } = JSON.parse(fs.readFileSync(file, "utf8"));
    return text ? excerpt(text) : null;
}

const { chapters } = await getJson(`${API}/chapters?language=en`);
const surahs = [];
for (const c of chapters) {
    const { verses } = await getJson(
        `${API}/verses/by_chapter/${c.id}?translations=${TRANSLATION_ID}&fields=text_uthmani&per_page=300`,
    );
    if (verses.length !== c.verses_count) throw new Error(`surah ${c.id}: ${verses.length}/${c.verses_count} verses`);
    surahs.push({
        number: c.id,
        nameArabic: c.name_arabic,
        nameSimple: c.name_simple,
        nameTranslated: c.translated_name?.name || "",
        revelation: c.revelation_place === "makkah" ? "Meccan" : "Medinan",
        versesCount: c.verses_count,
        verses: verses.map((v) => ({
            n: v.verse_number,
            ar: v.text_uthmani,
            en: cleanTranslation(v.translations?.[0]?.text),
            juz: v.juz_number,
            page: v.page_number,
            tafsir: readTafsir(c.id, v.verse_number),
        })),
    });
    process.stdout.write(`\r${c.id}/114`);
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(
    outFile,
    JSON.stringify({
        generatedAt: new Date().toISOString().slice(0, 10),
        translation: { id: TRANSLATION_ID, name: "Saheeh International" },
        tafsir: { slug: "en-al-jalalayn", name: "Tafsir al-Jalalayn" },
        surahs,
    }),
);
const total = surahs.reduce((n, s) => n + s.verses.length, 0);
const missing = surahs.flatMap((s) => s.verses.filter((v) => !v.tafsir).map((v) => `${s.number}:${v.n}`));
console.log(`\nwrote ${outFile}: ${surahs.length} surahs, ${total} verses, ${missing.length} without tafsir`);
if (missing.length) console.log("no tafsir:", missing.slice(0, 30).join(" "));
