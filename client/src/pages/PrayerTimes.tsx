import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BellRing, Compass, MapPin, Moon, Pencil, Sun, Sunrise, Sunset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadPrayerCalendar } from "@/lib/prayer-ics";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEO from "@/components/SEO";
import LocationPicker from "@/components/LocationPicker";
import FastingChoice from "@/components/FastingChoice";
import {
    HUB_DESCRIPTION,
    HUB_TITLE,
    METHODS,
    cityDescription,
    cityTitle,
    countryName,
    PRAYERS,
    PRAYER_ARABIC,
    PRAYER_LABELS,
    currentAndNext,
    defaultSettings,
    fastTimes,
    formatCountdown,
    formatTime,
    loadCities,
    loadPlace,
    loadSettings,
    placeLabel,
    qiblaBearing,
    savePlace,
    saveSettings,
    timesFor,
    ymdInZone,
    type MadhabId,
    type MethodId,
    type Place,
    type PrayerKey,
    type PrayerSettings,
} from "@/lib/prayer";
import { hijriDate } from "@/lib/hijri";

const ICONS: Record<PrayerKey, typeof Sun> = { fajr: Sunrise, sunrise: Sun, dhuhr: Sun, asr: Sun, maghrib: Sunset, isha: Moon };

const POPULAR: [string, string][] = [
    ["makkah-sa", "Makkah"], ["madinah-sa", "Madinah"], ["london-gb", "London"], ["new-york-city-us", "New York"],
    ["houston-us", "Houston"], ["chicago-us", "Chicago"], ["toronto-ca", "Toronto"], ["birmingham-gb", "Birmingham"],
    ["karachi-pk", "Karachi"], ["lahore-pk", "Lahore"], ["dhaka-bd", "Dhaka"], ["dubai-ae", "Dubai"],
    ["istanbul-tr", "Istanbul"], ["cairo-eg", "Cairo"], ["jakarta-id", "Jakarta"], ["kuala-lumpur-my", "Kuala Lumpur"],
];

const compassPoint = (deg: number) => ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(deg / 45) % 8];

export default function PrayerTimes() {
    const { city } = useParams<{ city?: string }>();
    const navigate = useNavigate();
    const [place, setPlace] = useState<Place | null>(() => (city ? null : loadPlace()));
    const [cityMissing, setCityMissing] = useState(false);
    const [savedSettings, setSavedSettings] = useState<PrayerSettings | null>(() => loadSettings());
    const [editing, setEditing] = useState(false);
    const [mode, setMode] = useState<"today" | "month">("today");
    const [now, setNow] = useState(() => new Date());

    // City pages: resolve the slug from the city list.
    useEffect(() => {
        if (!city) {
            setCityMissing(false);
            setPlace(loadPlace());
            return;
        }
        let cancelled = false;
        loadCities()
            .then((cities) => {
                if (cancelled) return;
                const found = cities.find((c) => c.slug === city) ?? null;
                setCityMissing(!found);
                setPlace(found);
            })
            .catch(() => !cancelled && setCityMissing(true));
        return () => {
            cancelled = true;
        };
    }, [city]);

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    // The user's own choices win; otherwise follow what mosques in that country usually use.
    const settings = savedSettings ?? defaultSettings(place?.countryCode);
    const updateSettings = (patch: Partial<PrayerSettings>) => {
        const next = { ...settings, ...patch };
        setSavedSettings(next);
        saveSettings(next);
    };

    const choose = (p: Place) => {
        savePlace(p);
        setEditing(false);
        if (p.hasPage && p.slug) navigate(`/prayer-times/${p.slug}`);
        else {
            if (city) navigate("/prayer-times");
            setPlace(p);
        }
    };

    const info = useMemo(() => (place ? currentAndNext(place, settings, now) : null), [place, settings, now]);
    const today = place ? ymdInZone(now, place.timeZone) : null;
    const monthRows = useMemo(() => {
        if (!place || mode !== "month" || !today) return [];
        const [y, m] = today;
        const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
        return Array.from({ length: days }, (_, i) => {
            const ymd: [number, number, number] = [y, m, i + 1];
            return { ymd, times: timesFor(place, settings, ymd), fast: fastTimes(place, settings, ymd) };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [place, settings, mode, today?.[0], today?.[1]]);

    const todayFast = useMemo(
        () => (place && today ? fastTimes(place, settings, today) : null),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [place, settings, today?.[0], today?.[1], today?.[2]],
    );

    const fmt = (d: Date) => formatTime(d, place!.timeZone, settings.hour12);
    const dateLine = place
        ? now.toLocaleDateString("en-US", { timeZone: place.timeZone, weekday: "long", month: "long", day: "numeric", year: "numeric" })
        : now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    const hijri = hijriDate(now, place?.timeZone);
    const qibla = place ? qiblaBearing(place.latitude, place.longitude) : null;

    // Share of the day between today's Fajr and Isha that has passed, for the progress bar.
    const progress = info
        ? Math.min(1, Math.max(0, (now.getTime() - info.today.fajr.getTime()) / (info.today.isha.getTime() - info.today.fajr.getTime())))
        : 0;

    return (
        <div className="min-h-screen font-sans">
            {/* On a city page, keep the prerendered head until the city has loaded. */}
            {(!city || place) && (
                <SEO
                    title={city && place ? cityTitle(place) : HUB_TITLE}
                    description={city && place ? cityDescription(place) : HUB_DESCRIPTION}
                    canonicalPath={city ? `/prayer-times/${city}` : "/prayer-times"}
                />
            )}
            <section className="px-4 py-10 md:py-14">
                <div className="mx-auto max-w-3xl space-y-6">
                    <header className="space-y-2 text-center">
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                            {hijri}
                            {hijri && " · "}
                            {dateLine}
                        </p>
                        <h1 className="text-4xl font-bold leading-tight text-slate-950 dark:text-white md:text-5xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {place ? `Prayer times in ${place.name}` : "Prayer Times"}
                        </h1>
                        {place && (
                            <p className="flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                                <MapPin className="h-3.5 w-3.5" aria-hidden />
                                {placeLabel(place)}
                                <button type="button" onClick={() => setEditing((e) => !e)} className="ml-2 inline-flex items-center gap-1 font-medium text-emerald-700 hover:underline dark:text-emerald-400">
                                    <Pencil className="h-3.5 w-3.5" aria-hidden /> Change
                                </button>
                            </p>
                        )}
                    </header>

                    {cityMissing && (
                        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                            We don't have a page for that city. Search for it below.
                        </p>
                    )}

                    {(!place || editing) && (
                        <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 md:p-6">
                            {!place && (
                                <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
                                    Find your city to see today's prayer times. Times are calculated on your device, and your location is never sent anywhere.
                                </p>
                            )}
                            <LocationPicker onSelect={choose} autoFocus={editing} />
                            {!place && (
                                <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Popular cities</p>
                                    <div className="flex flex-wrap gap-2">
                                        {POPULAR.map(([slug, name]) => (
                                            <Link key={slug} to={`/prayer-times/${slug}`} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:text-emerald-300">
                                                {name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {place && info && (
                        <>
                            {/* Next prayer */}
                            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 p-6 text-white shadow-xl shadow-emerald-950/20 md:p-8" aria-live="polite">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium uppercase tracking-wider text-emerald-200/80">Next prayer</p>
                                        <p className="mt-1 text-4xl font-bold md:text-5xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                                            {PRAYER_LABELS[info.next]}
                                        </p>
                                        <p className="mt-1 text-emerald-100/90">at {fmt(info.nextAt)}</p>
                                    </div>
                                    <p className="text-3xl text-emerald-100/90 md:text-4xl" style={{ fontFamily: "'Amiri', serif" }} lang="ar" dir="rtl">
                                        {PRAYER_ARABIC[info.next]}
                                    </p>
                                </div>
                                <p className="mt-6 text-3xl font-semibold tabular-nums tracking-tight md:text-4xl">in {formatCountdown(info.nextAt.getTime() - now.getTime())}</p>
                                <div className="mt-6" aria-hidden>
                                    <div className="relative h-1.5 rounded-full bg-white/15">
                                        <div className="absolute inset-y-0 left-0 rounded-full bg-emerald-300" style={{ width: `${progress * 100}%` }} />
                                        <div className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-900 bg-white" style={{ left: `${progress * 100}%` }} />
                                    </div>
                                    <div className="relative mt-2 h-4 text-[11px] text-emerald-100/70">
                                        {(() => {
                                            // Labels at each prayer's real position; drop one that would collide (Isha always stays).
                                            const span = info.today.isha.getTime() - info.today.fajr.getTime();
                                            const kept: { k: PrayerKey; at: number }[] = [];
                                            for (const k of ["fajr", "dhuhr", "asr", "maghrib", "isha"] as PrayerKey[]) {
                                                const at = (info.today[k].getTime() - info.today.fajr.getTime()) / span;
                                                const last = kept[kept.length - 1];
                                                if (last && at - last.at < 0.16) {
                                                    if (k === "isha") kept[kept.length - 1] = { k, at };
                                                    continue;
                                                }
                                                kept.push({ k, at });
                                            }
                                            return kept.map(({ k, at }) => (
                                                <span key={k} className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full" style={{ left: `${at * 100}%` }}>
                                                    {PRAYER_LABELS[k]}
                                                </span>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <Tabs value={mode} onValueChange={(v) => setMode(v as "today" | "month")}>
                                <TabsList className="mx-auto grid max-w-xs grid-cols-2 rounded-xl">
                                    <TabsTrigger value="today" className="rounded-lg">Today</TabsTrigger>
                                    <TabsTrigger value="month" className="rounded-lg">This month</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {mode === "today" && (
                                <ol className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
                                    {PRAYERS.map((k) => {
                                        const Icon = ICONS[k];
                                        const isNext = k === info.next && info.nextAt.getTime() === info.today[k].getTime();
                                        const isNow = k === info.current && k !== "sunrise" && now >= info.today.fajr;
                                        return (
                                            <li
                                                key={k}
                                                className={`flex items-center justify-between px-5 py-4 ${isNext ? "bg-emerald-50 dark:bg-emerald-950/30" : ""} ${k === "sunrise" ? "text-slate-500 dark:text-slate-400" : ""}`}
                                            >
                                                <span className="flex items-center gap-3">
                                                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${isNext ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                                                        <Icon className="h-4.5 w-4.5" aria-hidden />
                                                    </span>
                                                    <span>
                                                        <span className={`block font-semibold ${k === "sunrise" ? "" : "text-slate-900 dark:text-white"}`}>{PRAYER_LABELS[k]}</span>
                                                        {isNext && <span className="block text-xs font-medium text-emerald-700 dark:text-emerald-400">Next</span>}
                                                        {isNow && !isNext && <span className="block text-xs text-slate-500 dark:text-slate-400">Now</span>}
                                                    </span>
                                                </span>
                                                <span className={`text-lg tabular-nums ${isNext ? "font-bold text-emerald-800 dark:text-emerald-300" : "font-semibold text-slate-700 dark:text-slate-200"}`}>
                                                    {fmt(info.today[k])}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ol>
                            )}

                            {mode === "today" && todayFast && (
                                <section aria-labelledby="fast-heading" className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900/50 dark:bg-amber-950/20 md:p-6">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <h2 id="fast-heading" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                                            <Moon className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" aria-hidden />
                                            Suhoor and Iftar today
                                        </h2>
                                        {settings.fasting && <FastingChoice value={settings.fasting} onChange={(fasting) => updateSettings({ fasting })} />}
                                    </div>
                                    {settings.fasting ? (
                                        <>
                                            <dl className="mt-4 grid grid-cols-2 gap-3">
                                                <div className="rounded-2xl bg-white p-4 dark:bg-slate-900">
                                                    <dt className="text-xs text-slate-600 dark:text-slate-400">Suhoor ends</dt>
                                                    <dd className="whitespace-nowrap text-xl font-semibold tabular-nums text-slate-900 dark:text-white">{fmt(todayFast[settings.fasting].suhoorEnds)}</dd>
                                                </div>
                                                <div className="rounded-2xl bg-white p-4 dark:bg-slate-900">
                                                    <dt className="text-xs text-slate-600 dark:text-slate-400">Iftar</dt>
                                                    <dd className="whitespace-nowrap text-xl font-semibold tabular-nums text-amber-700 dark:text-amber-400">{fmt(todayFast[settings.fasting].iftar)}</dd>
                                                </div>
                                            </dl>
                                            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                                                {settings.fasting === "sunni"
                                                    ? "Suhoor ends at Fajr and Iftar is at Maghrib, from your calculation method."
                                                    : "Jafari times: Maghrib comes after the redness in the east fades, a little after sunset."}{" "}
                                                Many people stop eating a few minutes early; follow your local mosque.
                                            </p>
                                        </>
                                    ) : (
                                        <div className="mt-3 space-y-3">
                                            <p className="text-sm text-slate-600 dark:text-slate-300">Which Suhoor and Iftar times do you follow?</p>
                                            <FastingChoice onChange={(fasting) => updateSettings({ fasting })} />
                                        </div>
                                    )}
                                </section>
                            )}

                            {mode === "month" && (
                                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <caption className="sr-only">Prayer times in {place.name} this month</caption>
                                            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                                                <tr>
                                                    <th className="px-3 py-3 text-left font-semibold">Date</th>
                                                    {PRAYERS.map((k) => (
                                                        <th key={k} className={`px-3 py-3 text-right font-semibold ${k === "sunrise" ? "hidden sm:table-cell" : ""}`}>{PRAYER_LABELS[k]}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {monthRows.map(({ ymd, times }) => {
                                                    const isToday = today && ymd[2] === today[2];
                                                    const d = new Date(Date.UTC(ymd[0], ymd[1] - 1, ymd[2], 12));
                                                    return (
                                                        <tr key={ymd[2]} className={`border-t border-slate-100 dark:border-slate-800 ${isToday ? "bg-emerald-50 font-semibold dark:bg-emerald-950/30" : ""}`}>
                                                            <td className="px-3 py-2 whitespace-nowrap text-slate-900 dark:text-white">
                                                                {d.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short", day: "numeric" })}
                                                            </td>
                                                            {PRAYERS.map((k) => (
                                                                <td key={k} className={`px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300 ${k === "sunrise" ? "hidden sm:table-cell" : ""}`}>
                                                                    {fmt(times[k])}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {mode === "month" && (
                                <div className="overflow-hidden rounded-3xl border border-amber-200 bg-white dark:border-amber-900/50 dark:bg-slate-900">
                                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4">
                                        <h2 className="font-semibold text-slate-900 dark:text-white">Suhoor and Iftar this month</h2>
                                        <FastingChoice value={settings.fasting} onChange={(fasting) => updateSettings({ fasting })} />
                                    </div>
                                    {settings.fasting ? (
                                        <div className="mt-3 overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <caption className="sr-only">{settings.fasting === "sunni" ? "Sunni" : "Shia"} Suhoor and Iftar times in {place.name} this month</caption>
                                                <thead className="bg-amber-50 text-slate-600 dark:bg-amber-950/30 dark:text-slate-300">
                                                    <tr>
                                                        <th className="px-3 py-3 text-left font-semibold">Date</th>
                                                        <th className="px-3 py-3 text-right font-semibold">Suhoor ends</th>
                                                        <th className="px-3 py-3 text-right font-semibold">Iftar</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {monthRows.map(({ ymd, fast }) => {
                                                        const isToday = today && ymd[2] === today[2];
                                                        const d = new Date(Date.UTC(ymd[0], ymd[1] - 1, ymd[2], 12));
                                                        const t = fast[settings.fasting!];
                                                        return (
                                                            <tr key={ymd[2]} className={`border-t border-slate-100 dark:border-slate-800 ${isToday ? "bg-amber-50 font-semibold dark:bg-amber-950/30" : ""}`}>
                                                                <td className="px-3 py-2 whitespace-nowrap text-slate-900 dark:text-white">
                                                                    {d.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short", day: "numeric" })}
                                                                </td>
                                                                <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">{fmt(t.suhoorEnds)}</td>
                                                                <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-amber-700 dark:text-amber-400">{fmt(t.iftar)}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">Choose Sunni or Shia to see this month's Suhoor and Iftar times.</p>
                                    )}
                                </div>
                            )}

                            {/* Settings */}
                            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:p-6">
                                <div className="mb-4 flex items-baseline justify-between gap-3">
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Calculation</h2>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">{savedSettings ? "Saved on this device" : `Usual method in ${countryName(place.countryCode) || "your area"}`}</span>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="space-y-1.5">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Method</span>
                                        <Select value={settings.method} onValueChange={(v) => updateSettings({ method: v as MethodId })}>
                                            <SelectTrigger className="h-11 w-full rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {METHODS.map((m) => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </label>
                                    <label className="space-y-1.5">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Asr</span>
                                        <Select value={settings.madhab} onValueChange={(v) => updateSettings({ madhab: v as MadhabId })}>
                                            <SelectTrigger className="h-11 w-full rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Shafi">Standard (Shafi, Maliki, Hanbali)</SelectItem>
                                                <SelectItem value="Hanafi">Hanafi (later Asr)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </label>
                                </div>
                                <label className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    24-hour clock
                                    <Switch checked={!settings.hour12} onCheckedChange={(on) => updateSettings({ hour12: !on })} />
                                </label>
                            </div>

                            {/* Reminders */}
                            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between md:p-6">
                                <div className="flex items-start gap-3">
                                    <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden />
                                    <div>
                                        <h2 className="font-semibold text-slate-900 dark:text-white">Prayer reminders</h2>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Add the next 30 days to your phone's calendar. It alerts you at each prayer, even with this site closed.
                                        </p>
                                    </div>
                                </div>
                                <Button onClick={() => downloadPrayerCalendar(place, settings)} className="shrink-0 bg-emerald-700 text-white hover:bg-emerald-800">
                                    Add to calendar
                                </Button>
                            </div>

                            {qibla !== null && (
                                <Link to="/qibla" className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white px-5 py-4 transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800">
                                    <span className="flex items-center gap-3">
                                        <Compass className="h-5 w-5 text-emerald-700 dark:text-emerald-400" aria-hidden />
                                        <span className="text-slate-700 dark:text-slate-200">Qibla from {place.name}</span>
                                    </span>
                                    <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{qibla.toFixed(1)}° {compassPoint(qibla)}</span>
                                </Link>
                            )}
                        </>
                    )}

                    <p className="pt-4 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        Calculated on your device with the open-source{" "}
                        <a href="https://github.com/batoulapps/adhan-js" target="_blank" rel="noopener noreferrer" className="underline">adhan</a> library.
                        City data from{" "}
                        <a href="https://www.geonames.org/" target="_blank" rel="noopener noreferrer" className="underline">GeoNames</a>.
                        Your local mosque's timetable may differ by a few minutes.
                    </p>
                </div>
            </section>
        </div>
    );
}
