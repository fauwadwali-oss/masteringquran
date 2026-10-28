// Prayer times, qibla and Hijri dates, all calculated on the device.
// Prayer times and qibla: the open-source adhan library (MIT). Hijri dates: the
// browser's built-in Umm al-Qura calendar. Cities: GeoNames (CC BY 4.0), built by
// scripts/prayer/build_cities.py into /data/cities.json.
import { CalculationMethod, CalculationParameters, Coordinates, Madhab, PrayerTimes, Qibla, HighLatitudeRule } from "adhan";

export type MethodId =
    | "MuslimWorldLeague"
    | "NorthAmerica"
    | "Egyptian"
    | "Karachi"
    | "UmmAlQura"
    | "Dubai"
    | "MoonsightingCommittee"
    | "Kuwait"
    | "Qatar"
    | "Singapore"
    | "Tehran"
    | "Turkey";

export const METHODS: { id: MethodId; label: string }[] = [
    { id: "MuslimWorldLeague", label: "Muslim World League" },
    { id: "NorthAmerica", label: "ISNA (North America)" },
    { id: "Karachi", label: "University of Islamic Sciences, Karachi" },
    { id: "Egyptian", label: "Egyptian General Authority of Survey" },
    { id: "UmmAlQura", label: "Umm al-Qura, Makkah" },
    { id: "MoonsightingCommittee", label: "Moonsighting Committee Worldwide" },
    { id: "Dubai", label: "Dubai" },
    { id: "Kuwait", label: "Kuwait" },
    { id: "Qatar", label: "Qatar" },
    { id: "Singapore", label: "Singapore, Malaysia, Indonesia" },
    { id: "Tehran", label: "Institute of Geophysics, Tehran" },
    { id: "Turkey", label: "Diyanet, Turkey" },
];

export type MadhabId = "Shafi" | "Hanafi";

/** Whose Suhoor and Iftar times to show. Asked once, never guessed from the country. */
export type FastingId = "sunni" | "shia";

export interface PrayerSettings {
    method: MethodId;
    madhab: MadhabId;
    hour12: boolean;
    fasting?: FastingId;
}

export interface Place {
    name: string;
    region?: string;
    countryCode?: string;
    latitude: number;
    longitude: number;
    timeZone: string;
    slug?: string;
    hasPage?: boolean;
}

const METHOD_BY_COUNTRY: Record<string, MethodId> = {
    US: "NorthAmerica", CA: "NorthAmerica",
    PK: "Karachi", IN: "Karachi", BD: "Karachi", AF: "Karachi", LK: "Karachi", NP: "Karachi",
    EG: "Egyptian", SD: "Egyptian", LY: "Egyptian", SY: "Egyptian", LB: "Egyptian", IQ: "Egyptian", JO: "Egyptian", PS: "Egyptian",
    SA: "UmmAlQura", YE: "UmmAlQura", BH: "UmmAlQura", OM: "UmmAlQura",
    AE: "Dubai", KW: "Kuwait", QA: "Qatar",
    SG: "Singapore", MY: "Singapore", ID: "Singapore", BN: "Singapore",
    IR: "Tehran", TR: "Turkey", AZ: "Turkey",
    GB: "MoonsightingCommittee", IE: "MoonsightingCommittee",
};
const HANAFI_COUNTRIES = new Set(["PK", "IN", "BD", "AF", "TR", "AZ", "UZ", "TJ", "KZ", "KG", "TM"]);

/** Sensible defaults for a country: the method its mosques most often use. */
export function defaultSettings(countryCode?: string): PrayerSettings {
    const cc = (countryCode || "").toUpperCase();
    return {
        method: METHOD_BY_COUNTRY[cc] ?? "MuslimWorldLeague",
        madhab: HANAFI_COUNTRIES.has(cc) ? "Hanafi" : "Shafi",
        hour12: !["TR", "AZ", "IR", "DE", "FR", "NL", "BE", "ES", "IT", "SE", "NO", "DK", "RU"].includes(cc),
    };
}

export const PRAYERS = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const;
export type PrayerKey = (typeof PRAYERS)[number];
export const PRAYER_LABELS: Record<PrayerKey, string> = {
    fajr: "Fajr", sunrise: "Sunrise", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha",
};
export const PRAYER_ARABIC: Record<PrayerKey, string> = {
    fajr: "الفجر", sunrise: "الشروق", dhuhr: "الظهر", asr: "العصر", maghrib: "المغرب", isha: "العشاء",
};

/** Calendar date (y, m, d) as it is right now in a time zone. */
export function ymdInZone(when: Date, timeZone: string): [number, number, number] {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(when);
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
    return [get("year"), get("month"), get("day")];
}

function params(settings: PrayerSettings, latitude: number) {
    const p = CalculationMethod[settings.method]();
    p.madhab = settings.madhab === "Hanafi" ? Madhab.Hanafi : Madhab.Shafi;
    // Above ~48° Isha and Fajr can disappear in summer; adhan's twilight-angle rule keeps them sane.
    if (Math.abs(latitude) >= 48) p.highLatitudeRule = HighLatitudeRule.TwilightAngle;
    return p;
}

export type DayTimes = Record<PrayerKey, Date>;

/** Prayer times for the calendar day y-m-d at a place. */
export function timesFor(place: Place, settings: PrayerSettings, [y, m, d]: [number, number, number]): DayTimes {
    const t = new PrayerTimes(new Coordinates(place.latitude, place.longitude), new Date(y, m - 1, d), params(settings, place.latitude));
    return { fajr: t.fajr, sunrise: t.sunrise, dhuhr: t.dhuhr, asr: t.asr, maghrib: t.maghrib, isha: t.isha };
}

// Fasting times, for every day (not only Ramadan).
// Sunni: Suhoor ends at Fajr and Iftar is at Maghrib, both from the chosen method (so they
// match the prayer list, including a method's own Maghrib margin). Tehran's Maghrib is
// already the later Shia one, so Sunni Iftar falls back to sunset there.
// Shia (Jafari, Leva Research Institute, Qom; praytimes.org/docs/methods): Fajr with
// the sun 16° below the horizon, and Maghrib at 4° below, once the eastern redness has
// gone, so Iftar comes some minutes after sunset.
export interface FastTimes {
    suhoorEnds: Date;
    iftar: Date;
}

function jafariParams(latitude: number) {
    const p = new CalculationParameters("Other", 16, 14, 0, 4);
    if (Math.abs(latitude) >= 48) p.highLatitudeRule = HighLatitudeRule.TwilightAngle;
    return p;
}

export function fastTimes(place: Place, settings: PrayerSettings, [y, m, d]: [number, number, number]): { sunni: FastTimes; shia: FastTimes } {
    const coords = new Coordinates(place.latitude, place.longitude);
    const date = new Date(y, m - 1, d);
    const sunni = new PrayerTimes(coords, date, params(settings, place.latitude));
    const shia = new PrayerTimes(coords, date, jafariParams(place.latitude));
    return {
        sunni: { suhoorEnds: sunni.fajr, iftar: settings.method === "Tehran" ? sunni.sunset : sunni.maghrib },
        shia: { suhoorEnds: shia.fajr, iftar: shia.maghrib },
    };
}

export function addDays([y, m, d]: [number, number, number], n: number): [number, number, number] {
    const dt = new Date(Date.UTC(y, m - 1, d + n));
    return [dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate()];
}

/** The prayer whose time is in effect now and the next one (rolling over to tomorrow's Fajr). */
export function currentAndNext(place: Place, settings: PrayerSettings, now = new Date()) {
    const today = ymdInZone(now, place.timeZone);
    const t = timesFor(place, settings, today);
    const order: PrayerKey[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
    const nextKey = order.find((k) => t[k] > now);
    if (nextKey) {
        const idx = order.indexOf(nextKey);
        return { today: t, current: idx > 0 ? order[idx - 1] : ("isha" as PrayerKey), next: nextKey, nextAt: t[nextKey] };
    }
    const tomorrow = timesFor(place, settings, addDays(today, 1));
    return { today: t, current: "isha" as PrayerKey, next: "fajr" as PrayerKey, nextAt: tomorrow.fajr };
}

export function formatTime(d: Date, timeZone: string, hour12: boolean) {
    return d.toLocaleTimeString("en-US", { timeZone, hour: "numeric", minute: "2-digit", hour12 });
}

export function formatCountdown(ms: number) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m ${String(s).padStart(2, "0")}s`;
}

export function qiblaBearing(latitude: number, longitude: number) {
    return Qibla(new Coordinates(latitude, longitude));
}

export function countryName(cc?: string) {
    if (!cc) return "";
    try {
        return new Intl.DisplayNames(["en"], { type: "region" }).of(cc) || cc;
    } catch {
        return cc;
    }
}

export function placeLabel(p: Place) {
    if (p.countryCode === "US" && p.region) return `${p.name}, ${p.region}`;
    return [p.name, countryName(p.countryCode)].filter(Boolean).join(", ");
}

// City page title and description; scripts/prerender/prayer-pages.mjs uses the same functions.
export const cityTitle = (p: Place) => `Prayer Times in ${placeLabel(p)} Today | Mastering Quran`;
export const cityDescription = (p: Place) =>
    `Today's Fajr, Sunrise, Dhuhr, Asr, Maghrib and Isha times in ${placeLabel(p)}, with a countdown to the next prayer, a monthly timetable and the Qibla direction.`;

export const HUB_TITLE = "Prayer Times Today for Your City | Mastering Quran";
export const HUB_DESCRIPTION =
    "Accurate Fajr, Dhuhr, Asr, Maghrib and Isha times for any city, with a countdown to the next prayer, a monthly timetable, 12 calculation methods and Hanafi or Shafi Asr.";

// ---- saved preferences (per browser; the page works without storage) ----

const SETTINGS_KEY = "mq-prayer-settings";
const PLACE_KEY = "mq-prayer-place";

function read<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}
function write(key: string, value: unknown) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* private mode or blocked storage */
    }
}

export const loadSettings = () => read<PrayerSettings>(SETTINGS_KEY);
export const saveSettings = (s: PrayerSettings) => write(SETTINGS_KEY, s);
export const loadPlace = () => read<Place>(PLACE_KEY);
export const savePlace = (p: Place) => write(PLACE_KEY, p);

// ---- cities ----

type CityRow = [string, string, string, string, number, number, string, number, number];
let citiesPromise: Promise<Place[]> | null = null;

export function loadCities(): Promise<Place[]> {
    citiesPromise ??= fetch("/data/cities.json")
        .then((r) => {
            if (!r.ok) throw new Error(`cities ${r.status}`);
            return r.json() as Promise<CityRow[]>;
        })
        .then((rows) =>
            rows.map(([slug, name, region, cc, lat, lon, tz, , page]) => ({
                slug, name, region, countryCode: cc, latitude: lat, longitude: lon, timeZone: tz, hasPage: page === 1,
            })),
        )
        .catch((e) => {
            citiesPromise = null;
            throw e;
        });
    return citiesPromise;
}

const ALIASES: Record<string, string> = { mecca: "makkah", medina: "madinah", nyc: "new york city", "new york": "new york city", la: "los angeles" };
const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Cities whose name starts with the query (then contains it), biggest first. List is pre-sorted by population. */
export function searchCities(cities: Place[], query: string, limit = 8): Place[] {
    const q = fold(query.trim());
    if (q.length < 2) return [];
    const target = ALIASES[q] ?? q;
    const starts: Place[] = [];
    const contains: Place[] = [];
    for (const c of cities) {
        const n = fold(c.name);
        if (n.startsWith(target)) starts.push(c);
        else if (n.includes(target) || fold(`${c.name} ${c.region} ${countryName(c.countryCode)}`).includes(target)) contains.push(c);
        if (starts.length >= limit) break;
    }
    return [...starts, ...contains].slice(0, limit);
}

/** Closest city in the list, used to name a GPS position and pick country defaults. */
export function nearestCity(cities: Place[], latitude: number, longitude: number): Place | null {
    let best: Place | null = null;
    let bestD = Infinity;
    for (const c of cities) {
        const d = (c.latitude - latitude) ** 2 + ((c.longitude - longitude) * Math.cos((latitude * Math.PI) / 180)) ** 2;
        if (d < bestD) {
            bestD = d;
            best = c;
        }
    }
    // ~0.5° is roughly 50 km; beyond that the name would mislead.
    return best && bestD < 0.25 ? best : null;
}

// ---- Hijri calendar (Umm al-Qura, via Intl) ----

const hijriParts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", { timeZone: "UTC", day: "numeric", month: "numeric", year: "numeric" });

/** Hijri day, month (1-12) and year for a Gregorian calendar date. */
export function toHijri([y, m, d]: [number, number, number]) {
    const parts = hijriParts.formatToParts(new Date(Date.UTC(y, m - 1, d, 12)));
    const get = (t: string) => parseInt(parts.find((p) => p.type === t)?.value ?? "0", 10);
    return { day: get("day"), month: get("month"), year: get("year") };
}

/** Gregorian dates of the Ramadan (Hijri month 9) that begins in a Gregorian year. */
export function ramadanDates(gregorianYear: number): { ymd: [number, number, number]; hijriDay: number; hijriYear: number }[] {
    let day: [number, number, number] = [gregorianYear, 1, 1];
    // Find the first day of month 9 that falls in this Gregorian year.
    while (day[0] === gregorianYear) {
        const h = toHijri(day);
        if (h.month === 9 && h.day === 1) break;
        day = addDays(day, 1);
    }
    if (day[0] !== gregorianYear) return [];
    const out = [];
    for (;;) {
        const h = toHijri(day);
        if (h.month !== 9) break;
        out.push({ ymd: day, hijriDay: h.day, hijriYear: h.year });
        day = addDays(day, 1);
    }
    return out;
}

/** The Ramadan to show by default: this year's if it hasn't ended yet, otherwise next year's. */
export function upcomingRamadanYear(today: [number, number, number]) {
    const days = ramadanDates(today[0]);
    const last = days[days.length - 1]?.ymd;
    const ended = last && (today[1] > last[1] || (today[1] === last[1] && today[2] > last[2]));
    return ended ? today[0] + 1 : today[0];
}

// Ramadan city page title and description; scripts/prerender/prayer-pages.mjs uses the same functions.
export const ramadanCityTitle = (p: Place, year: number) => `Ramadan ${year} in ${placeLabel(p)}: Suhoor and Iftar Times | Mastering Quran`;
export const ramadanCityDescription = (p: Place, year: number) =>
    `Suhoor (Fajr) and Iftar (Maghrib) times in ${placeLabel(p)} for every day of Ramadan ${year}, with the expected start date and the odd nights of the last ten.`;
export const ramadanHubTitle = (year: number) => `Ramadan ${year}: Dates, Suhoor and Iftar Times | Mastering Quran`;
export const ramadanHubDescription = (year: number) =>
    `When Ramadan ${year} is expected to begin, with Suhoor and Iftar times for every day in any city, a 30-day Quran reading plan and Ramadan duas.`;
