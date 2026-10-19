// Hijri months, yearly Islamic events and date conversion, all local.
// Dates use the browser's Umm al-Qura calendar; communities that follow moon
// sighting can be a day earlier or later.
import { addDays, toHijri } from "@/lib/prayer";

export const HIJRI_MONTHS: { number: number; name: string; arabic: string; note?: string }[] = [
    { number: 1, name: "Muharram", arabic: "مُحَرَّم", note: "One of the four sacred months (9:36). Ashura falls on the 10th." },
    { number: 2, name: "Safar", arabic: "صَفَر" },
    { number: 3, name: "Rabi al-Awwal", arabic: "رَبِيع الأَوَّل", note: "The month of the Prophet's ﷺ birth according to most historians." },
    { number: 4, name: "Rabi al-Thani", arabic: "رَبِيع الآخِر" },
    { number: 5, name: "Jumada al-Ula", arabic: "جُمَادَى الأُولَى" },
    { number: 6, name: "Jumada al-Akhirah", arabic: "جُمَادَى الآخِرَة" },
    { number: 7, name: "Rajab", arabic: "رَجَب", note: "One of the four sacred months (9:36)." },
    { number: 8, name: "Sha'ban", arabic: "شَعْبَان", note: "The month before Ramadan, in which the Prophet ﷺ fasted often (Sahih al-Bukhari 1969)." },
    { number: 9, name: "Ramadan", arabic: "رَمَضَان", note: "The month of fasting, in which the Quran was revealed (2:185)." },
    { number: 10, name: "Shawwal", arabic: "شَوَّال", note: "Begins with Eid al-Fitr. Fasting six days of it is recommended (Sahih Muslim 1164)." },
    { number: 11, name: "Dhu al-Qa'dah", arabic: "ذُو القَعْدَة", note: "One of the four sacred months (9:36)." },
    { number: 12, name: "Dhu al-Hijjah", arabic: "ذُو الحِجَّة", note: "One of the four sacred months (9:36): Hajj, the Day of Arafah and Eid al-Adha." },
];

export const ISLAMIC_EVENTS: { name: string; month: number; day: number }[] = [
    { name: "Islamic New Year", month: 1, day: 1 },
    { name: "Day of Ashura", month: 1, day: 10 },
    { name: "Mawlid an-Nabi", month: 3, day: 12 },
    { name: "Isra and Mi'raj", month: 7, day: 27 },
    { name: "Mid-Sha'ban", month: 8, day: 15 },
    { name: "Ramadan begins", month: 9, day: 1 },
    { name: "Last ten nights of Ramadan", month: 9, day: 21 },
    { name: "Eid al-Fitr", month: 10, day: 1 },
    { name: "Day of Arafah", month: 12, day: 9 },
    { name: "Eid al-Adha", month: 12, day: 10 },
];

type YMD = [number, number, number];

export const hijriMonthName = (m: number) => HIJRI_MONTHS[m - 1]?.name ?? String(m);
export const formatHijri = (h: { day: number; month: number; year: number }) => `${h.day} ${hijriMonthName(h.month)} ${h.year} AH`;

export function todayYmd(): YMD {
    const n = new Date();
    return [n.getFullYear(), n.getMonth() + 1, n.getDate()];
}

/** Gregorian date of a Hijri date, or null if that Hijri day doesn't exist (e.g. a 30th in a 29-day month). */
export function hijriToGregorian(year: number, month: number, day: number): YMD | null {
    // Rough position from the Hijri epoch (16 July 622), then step to the exact day.
    const approxDays = Math.floor((year - 1) * 354.367 + (month - 1) * 29.53 + (day - 1));
    const epoch = Date.UTC(622, 6, 16);
    const approx = new Date(epoch + approxDays * 86_400_000);
    let d: YMD = addDays([approx.getUTCFullYear(), approx.getUTCMonth() + 1, approx.getUTCDate()], -20);
    for (let i = 0; i < 40; i++) {
        const h = toHijri(d);
        if (h.year === year && h.month === month && h.day === day) return d;
        d = addDays(d, 1);
    }
    return null;
}

/** The next occurrences of the yearly events, soonest first, starting today. */
export function upcomingEvents(from: YMD = todayYmd(), count = ISLAMIC_EVENTS.length) {
    const h = toHijri(from);
    const fromTime = Date.UTC(from[0], from[1] - 1, from[2]);
    const out: { name: string; hijri: string; date: YMD; daysUntil: number }[] = [];
    for (const year of [h.year, h.year + 1]) {
        for (const e of ISLAMIC_EVENTS) {
            const g = hijriToGregorian(year, e.month, e.day);
            if (!g) continue;
            const daysUntil = Math.round((Date.UTC(g[0], g[1] - 1, g[2]) - fromTime) / 86_400_000);
            if (daysUntil < 0) continue;
            out.push({ name: e.name, hijri: `${e.day} ${hijriMonthName(e.month)} ${year} AH`, date: g, daysUntil });
        }
    }
    return out.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, count);
}
