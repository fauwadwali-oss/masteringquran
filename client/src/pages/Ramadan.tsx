import { useEffect, useState } from "react";
import { Loader2, AlertCircle, MapPin, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";

interface Location { latitude: number; longitude: number }
interface RamadanDay {
    day: number;
    date: string;
    hijri_date?: string;
    day_name?: string;
    suhoor: string;
    iftar: string;
}
interface RamadanData {
    year: number;
    hijri_year: number;
    ramadan_start: string;
    ramadan_end: string;
    total_days: number;
    timezone: string;
    days: RamadanDay[];
}

export default function Ramadan() {
    const [location, setLocation] = useState<Location | null>(null);
    const [data, setData] = useState<RamadanData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [year, setYear] = useState(new Date().getFullYear());

    const requestLocation = () => {
        setError(null);
        if (!navigator.geolocation) {
            setError("Your browser does not support location.");
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => setLocation({
                latitude: Number(pos.coords.latitude.toFixed(4)),
                longitude: Number(pos.coords.longitude.toFixed(4)),
            }),
            (err) => {
                setLoading(false);
                setError(
                    err.code === 1
                        ? "Location permission denied. Allow location access to see your Ramadan timetable."
                        : "Could not determine your location.",
                );
            },
        );
    };

    useEffect(() => {
        if (!location) return;
        setLoading(true);
        setError(null);
        fetch(`https://ummahapi.com/api/ramadan/${year}?latitude=${location.latitude}&longitude=${location.longitude}`)
            .then(async (r) => {
                if (!r.ok) throw new Error("failed");
                const d: any = await r.json();
                const payload = d.data || d;
                // Extract days: UmmahAPI returns ramadan_days array
                const days: RamadanDay[] = (payload.ramadan_days || []).map((x: any, i: number) => ({
                    day: i + 1,
                    date: x.date || x.gregorian_date || "",
                    hijri_date: x.hijri_date,
                    day_name: x.day_name,
                    suhoor: x.prayer_times?.imsak || x.prayer_times?.fajr || x.suhoor || "",
                    iftar: x.prayer_times?.maghrib || x.iftar || "",
                }));
                setData({
                    year: payload.year,
                    hijri_year: payload.hijri_year,
                    ramadan_start: payload.ramadan_start,
                    ramadan_end: payload.ramadan_end,
                    total_days: payload.total_days || days.length,
                    timezone: payload.timezone,
                    days,
                });
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to fetch Ramadan timetable.");
                setLoading(false);
            });
    }, [location, year]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 font-sans">
            <SEO
                title="Ramadan Timetable - Mastering Quran"
                description="Suhoor and Iftar times for every day of Ramadan, calculated for your location."
            />
            <section className="py-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-8 space-y-2">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 rounded-full border border-amber-200 dark:border-amber-800">
                            <Moon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Blessed month</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Ramadan Timetable
                        </h1>
                        <p className="text-slate-600 dark:text-slate-300">Suhoor and Iftar times for every day of Ramadan {year}, calculated for your location.</p>
                    </div>

                    {!location && (
                        <Card className="border border-amber-200 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/60 to-white dark:from-amber-950/20 dark:to-slate-900">
                            <CardContent className="p-8 text-center space-y-4">
                                <div className="w-14 h-14 mx-auto bg-amber-100 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center">
                                    <MapPin className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Share your location</h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                                    Ramadan timings depend on where you are. We don't store your coordinates.
                                </p>
                                <Button onClick={requestLocation} disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white">
                                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Locating…</> : "Use my location"}
                                </Button>
                                {error && <p className="text-sm text-red-600 dark:text-red-400 pt-2">{error}</p>}
                            </CardContent>
                        </Card>
                    )}

                    {location && loading && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                            <p className="text-slate-500 text-sm">Calculating Ramadan schedule…</p>
                        </div>
                    )}

                    {error && !loading && location && (
                        <div className="text-center py-8">
                            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {data && !loading && (
                        <>
                            {/* Summary */}
                            <Card className="border-2 border-amber-200 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/70 to-white dark:from-amber-950/20 dark:to-slate-900 mb-6">
                                <CardContent className="p-6 grid sm:grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider">Begins</p>
                                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{data.ramadan_start}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider">Ends</p>
                                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{data.ramadan_end}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider">{data.hijri_year} AH · {data.total_days} days</p>
                                        <p className="text-lg font-semibold text-amber-700 dark:text-amber-400">{data.timezone}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Days table */}
                            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-800/60">
                                            <tr>
                                                <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Day</th>
                                                <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                                                <th className="text-right px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Suhoor ends</th>
                                                <th className="text-right px-4 py-3 font-semibold text-amber-700 dark:text-amber-400">Iftar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.days.map((d) => (
                                                <tr key={d.day} className="border-t border-slate-100 dark:border-slate-800 hover:bg-amber-50/40 dark:hover:bg-amber-950/10 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">#{d.day}</td>
                                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                                        <div className="font-mono text-xs">{d.date}</div>
                                                        {d.hijri_date && <div className="text-[11px] text-slate-400">{d.hijri_date}</div>}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">{d.suhoor || "—"}</td>
                                                    <td className="px-4 py-3 text-right font-mono font-semibold text-amber-700 dark:text-amber-400">{d.iftar || "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>

                            <div className="flex items-center justify-center gap-3 mt-6">
                                <Button variant="outline" size="sm" onClick={() => setYear(year - 1)}>Previous year</Button>
                                <span className="text-sm text-slate-500 dark:text-slate-400">{year}</span>
                                <Button variant="outline" size="sm" onClick={() => setYear(year + 1)}>Next year</Button>
                            </div>
                        </>
                    )}

                    <p className="text-center mt-10 text-xs text-slate-500 dark:text-slate-400">
                        Data from{" "}
                        <a href="https://ummahapi.com" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
                            UmmahAPI
                        </a>.
                    </p>
                </div>
            </section>
        </div>
    );
}
