// Checks every reciter in client/src/data/reciters.json against the live Quran.com API:
// verse files (count + first/middle/last file), chapter files, and QDC word timings.
// Run: node scripts/reciters/verify.mjs
import { readFileSync } from "node:fs";

const reciters = JSON.parse(readFileSync(new URL("../../client/src/data/reciters.json", import.meta.url), "utf8"));
const AYAHS = { 1: 7, 2: 286, 36: 83, 114: 6 };
const abs = (u) => (u.startsWith("http") ? u : u.startsWith("//") ? `https:${u}` : `https://verses.quran.com/${u}`);
const status = async (u) => { try { return (await fetch(abs(u), { method: "HEAD" })).status; } catch (e) { return String(e); } };
async function get(u) {
    for (let attempt = 0; ; attempt++) {
        const r = await fetch(u);
        if (r.ok) return r.json();
        if (r.status === 429 && attempt < 3) { await new Promise((ok) => setTimeout(ok, 2000 * (attempt + 1))); continue; }
        throw new Error(`${r.status} ${u}`);
    }
}

async function check(r) {
    const problems = [];
    let timed = 0, total = 0;
    for (const [surah, ayahs] of Object.entries(AYAHS)) {
        const files = (await get(`https://api.quran.com/api/v4/recitations/${r.verseAudioId}/by_chapter/${surah}?per_page=300`)).audio_files ?? [];
        if (files.length !== ayahs) problems.push(`verse files for surah ${surah}: ${files.length}/${ayahs}`);
        for (const f of files.length ? [files[0], files[files.length >> 1], files.at(-1)] : []) {
            const s = await status(f.url);
            if (s !== 200) problems.push(`verse ${f.verse_key}: ${s}`);
        }
        const url = (await get(`https://api.quran.com/api/v4/chapter_recitations/${r.chapterAudioId}/${surah}`)).audio_file?.audio_url;
        const s = url ? await status(url) : "missing";
        if (s !== 200) problems.push(`chapter ${surah}: ${s}`);
        const timings = (await get(`https://api.quran.com/api/qdc/audio/reciters/${r.chapterAudioId}/audio_files?chapter=${surah}&segments=true`)).audio_files?.[0]?.verse_timings ?? [];
        total += ayahs;
        timed += timings.filter((v) => v.segments?.length).length;
    }
    if (r.wordTimings !== (timed === total)) problems.push(`wordTimings is ${r.wordTimings} but ${timed}/${total} verses have segments`);
    return problems;
}

let failed = 0;
for (const r of reciters) {
    const problems = await check(r).catch((e) => [`request failed: ${e.message}`]);
    if (problems.length) failed++;
    console.log(`${problems.length ? "FAIL" : "ok  "} ${r.id.padStart(3)} ${r.name}${problems.length ? "\n     " + problems.join("\n     ") : ""}`);
}
process.exit(failed ? 1 : 0);
