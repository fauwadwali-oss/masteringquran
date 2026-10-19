import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Moon, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import LocationPicker from "@/components/LocationPicker";
import {
    defaultSettings,
    formatTime,
    loadPlace,
    loadSettings,
    placeLabel,
    ramadanDates,
    savePlace,
    timesFor,
    ymdInZone,
    type Place,
} from "@/lib/prayer";

// The Ramadan to show by default: this year's if it hasn't ended yet, otherwise next year's.
function defaultYear(today: [number, number, number]) {
    const days = ramadanDates(today[0]);
    const last = days[days.length - 1]?.ymd;
    const ended = last && (today[1] > last[1] || (today[1] === last[1] && today[2] > last[2]));
    return ended ? today[0] + 1 : today[0];
}

const fmtDate = ([y, m, d]: [number, number, number], opts: Intl.DateTimeFormatOptions) =>
    new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("en-US", { timeZone: "UTC", ...opts });

export default function Ramadan() {
    const [place, setPlace] = useState<Place | null>(() => loadPlace());
    const [editing, setEditing] = useState(false);
    const today = ymdInZone(new Date(), place?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [year, setYear] = useState(() => defaultYear(today));
    const settings = loadSettings() ?? defaultSettings(place?.countryCode);

    const days = useMemo(() => ramadanDates(year), [year]);
    const rows = useMemo(
        () => (place ? days.map((d) => ({ ...d, times: timesFor(place, settings, d.ymd) })) : []),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [days, place, settings.method, settings.madhab],
    );
    const isToday = (ymd: [number, number, number]) => ymd[0] === today[0] && ymd[1] === today[1] && ymd[2] === today[2];
    const fmt = (d: Date) => formatTime(d, place!.timeZone, settings.hour12);

    const choose = (p: Place) => {
        savePlace(p);
        setPlace(p);
        setEditing(false);
    };

    const first = days[0];
    const last = days[days.length - 1];

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 font-sans">
            <SEO
                title={`Ramadan ${year} Timetable: Suhoor and Iftar Times | Mastering Quran`}
                description={`Suhoor and Iftar times for every day of Ramadan ${year}${first ? ` (${first.hijriYear} AH)` : ""}, for any city.`}
            />
            <section className="py-12 px-4 md:px-6">
                <div className="max-w-5xl mx-auto space-y-6">
                    <PageHero
                        eyebrow="Blessed month"
                        title={`Ramadan ${year}`}
                        description={
                            first && last
                                ? `Expected ${fmtDate(first.ymd, { weekday: "long", month: "long", day: "numeric" })} to ${fmtDate(last.ymd, { month: "long", day: "numeric", year: "numeric" })}, ${first.hijriYear} AH.`
                                : "Suhoor and Iftar times for every day of Ramadan."
                        }
                        icon={Moon}
                        accent="amber"
                    />

                    {place && !editing && (
                        <p className="flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                            <MapPin className="h-3.5 w-3.5" aria-hidden />
                            {placeLabel(place)}
                            <button type="button" onClick={() => setEditing(true)} className="ml-2 inline-flex items-center gap-1 font-medium text-amber-700 hover:underline dark:text-amber-400">
                                <Pencil className="h-3.5 w-3.5" aria-hidden /> Change
                            </button>
                        </p>
                    )}

                    {(!place || editing) && (
                        <Card className="border border-amber-200 dark:border-amber-900/40">
                            <CardContent className="p-5 md:p-6">
                                {!place && (
                                    <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
                                        Find your city to see Suhoor and Iftar times. They are calculated on your device, and your location is never sent anywhere.
                                    </p>
                                )}
                                <LocationPicker onSelect={choose} accent="amber" autoFocus={editing} />
                            </CardContent>
                        </Card>
                    )}

                    {place && rows.length > 0 && (
                        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <caption className="sr-only">Ramadan {year} Suhoor and Iftar times in {place.name}</caption>
                                    <thead className="bg-slate-50 dark:bg-slate-800/60">
                                        <tr>
                                            <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Ramadan</th>
                                            <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                                            <th className="text-right px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Suhoor ends (Fajr)</th>
                                            <th className="text-right px-4 py-3 font-semibold text-amber-700 dark:text-amber-400">Iftar (Maghrib)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((d) => (
                                            <tr
                                                key={d.hijriDay}
                                                className={`border-t border-slate-100 dark:border-slate-800 ${isToday(d.ymd) ? "bg-amber-50 font-semibold dark:bg-amber-950/30" : d.hijriDay >= 21 && d.hijriDay % 2 === 1 ? "bg-amber-50/40 dark:bg-amber-950/10" : ""}`}
                                            >
                                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                                                    {d.hijriDay}
                                                    {d.hijriDay >= 21 && d.hijriDay % 2 === 1 && (
                                                        <span className="ml-2 text-[11px] font-normal text-amber-700 dark:text-amber-400">odd night</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{fmtDate(d.ymd, { weekday: "short", month: "short", day: "numeric" })}</td>
                                                <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">{fmt(d.times.fajr)}</td>
                                                <td className="px-4 py-3 text-right tabular-nums font-semibold text-amber-700 dark:text-amber-400">{fmt(d.times.maghrib)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    <div className="flex items-center justify-center gap-3">
                        <Button variant="outline" size="sm" onClick={() => setYear(year - 1)}>Ramadan {year - 1}</Button>
                        <Button variant="outline" size="sm" onClick={() => setYear(year + 1)}>Ramadan {year + 1}</Button>
                    </div>

                    <p className="text-center pt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        Dates follow the Umm al-Qura calendar. Ramadan begins with the moon sighting, so your community may start a day earlier or later.
                        Times use the calculation method set on the <Link to="/prayer-times" className="underline">prayer times</Link> page and are calculated on your device.
                        Many people stop eating a few minutes before Fajr; follow your local mosque.
                    </p>
                </div>
            </section>
        </div>
    );
}
