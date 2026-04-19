import { useEffect, useState } from "react";
import { Loader2, AlertCircle, MapPin, Moon, Sun, Sunrise, Sunset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";

interface Location {
    latitude: number;
    longitude: number;
    label?: string;
}

interface PrayerTimes {
    imsak?: string;
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
}

interface PrayerData {
    date: string;
    timezone: string;
    calculation_method: string;
    madhab: string;
    prayer_times: PrayerTimes;
    hijri?: { formatted?: string; date?: string };
}

const METHODS = [
    "MuslimWorldLeague",
    "ISNA",
    "Egyptian",
    "Karachi",
    "UmmAlQura",
    "Dubai",
    "MoonsightingCommittee",
    "NorthAmerica",
    "Kuwait",
    "Qatar",
    "Singapore",
    "Tehran",
    "Turkey",
];

const MADHABS = ["Shafi", "Hanafi"];

const PRAYER_ORDER: { key: keyof PrayerTimes; label: string; icon: typeof Sunrise }[] = [
    { key: "imsak", label: "Imsak", icon: Moon },
    { key: "fajr", label: "Fajr", icon: Sunrise },
    { key: "sunrise", label: "Sunrise", icon: Sun },
    { key: "dhuhr", label: "Dhuhr", icon: Sun },
    { key: "asr", label: "Asr", icon: Sun },
    { key: "maghrib", label: "Maghrib", icon: Sunset },
    { key: "isha", label: "Isha", icon: Moon },
];

export default function PrayerTimes() {
    const [location, setLocation] = useState<Location | null>(null);
    const [data, setData] = useState<PrayerData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [method, setMethod] = useState("MuslimWorldLeague");
    const [madhab, setMadhab] = useState("Shafi");
    const [hijri, setHijri] = useState<string | null>(null);

    const requestLocation = () => {
        setError(null);
        if (!navigator.geolocation) {
            setError("Your browser does not support location. Enter coordinates manually.");
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({
                    latitude: Number(pos.coords.latitude.toFixed(4)),
                    longitude: Number(pos.coords.longitude.toFixed(4)),
                });
            },
            (err) => {
                setLoading(false);
                setError(
                    err.code === 1
                        ? "Location permission denied. You'll need to allow location access to use this page."
                        : "Could not determine your location.",
                );
            },
            { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
        );
    };

    useEffect(() => {
        if (!location) return;
        setLoading(true);
        setError(null);
        const url = `https://ummahapi.com/api/prayer-times?latitude=${location.latitude}&longitude=${location.longitude}&madhab=${madhab}&method=${method}`;
        fetch(url)
            .then(async (r) => {
                if (!r.ok) throw new Error(`status ${r.status}`);
                const d: any = await r.json();
                // Shape: either top-level fields or .data
                const payload = d.data || d;
                setData({
                    date: payload.date,
                    timezone: payload.timezone,
                    calculation_method: payload.calculation_method,
                    madhab: payload.madhab,
                    prayer_times: payload.prayer_times,
                });
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to fetch prayer times. Please try again.");
                setLoading(false);
            });
    }, [location, method, madhab]);

    // Fetch Hijri date once
    useEffect(() => {
        fetch("https://ummahapi.com/api/today-hijri")
            .then((r) => r.json())
            .then((d: any) => setHijri(d?.data?.hijri?.formatted || null))
            .catch(() => { });
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50/30 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 font-sans">
            <SEO
                title="Prayer Times - Mastering Quran"
                description="Accurate five daily prayer times for your location, with multiple calculation methods and Hanafi/Shafi madhab support."
            />
            <section className="py-12 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8 space-y-2">
                        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Prayer Times
                        </h1>
                        {hijri && <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{hijri}</p>}
                        <p className="text-slate-600 dark:text-slate-300">Five daily prayers, calculated for your location.</p>
                    </div>

                    {!location && (
                        <Card className="border border-indigo-200 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/60 to-white dark:from-indigo-950/20 dark:to-slate-900">
                            <CardContent className="p-8 text-center space-y-4">
                                <div className="w-14 h-14 mx-auto bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center">
                                    <MapPin className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Share your location</h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                                    We use your browser's location to calculate accurate prayer times. Your coordinates are never stored or sent to our servers.
                                </p>
                                <Button onClick={requestLocation} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Locating…</> : "Use my location"}
                                </Button>
                                {error && <p className="text-sm text-red-600 dark:text-red-400 pt-2">{error}</p>}
                            </CardContent>
                        </Card>
                    )}

                    {location && (
                        <>
                            {/* Controls */}
                            <div className="grid sm:grid-cols-2 gap-4 mb-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Calculation Method</label>
                                    <Select value={method} onValueChange={setMethod}>
                                        <SelectTrigger className="h-11 bg-white dark:bg-slate-800 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {METHODS.map((m) => (
                                                <SelectItem key={m} value={m}>{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Madhab (for Asr)</label>
                                    <Select value={madhab} onValueChange={setMadhab}>
                                        <SelectTrigger className="h-11 bg-white dark:bg-slate-800 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MADHABS.map((m) => (
                                                <SelectItem key={m} value={m}>{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {loading && (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                    <p className="text-slate-500 text-sm">Calculating…</p>
                                </div>
                            )}

                            {error && !loading && (
                                <div className="text-center py-8">
                                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                                    <p className="text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            {data && !loading && (
                                <>
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-5 text-xs text-slate-500 dark:text-slate-400">
                                        <span>{data.date} · {data.timezone}</span>
                                        <span>
                                            {location.latitude.toFixed(3)}, {location.longitude.toFixed(3)} · {data.calculation_method} · {data.madhab}
                                        </span>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {PRAYER_ORDER.map(({ key, label, icon: Icon }) => {
                                            const time = data.prayer_times[key];
                                            if (!time) return null;
                                            const isMain = key === "fajr" || key === "dhuhr" || key === "asr" || key === "maghrib" || key === "isha";
                                            return (
                                                <Card
                                                    key={key}
                                                    className={
                                                        isMain
                                                            ? "border-2 border-indigo-200 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/60 to-white dark:from-indigo-950/20 dark:to-slate-900"
                                                            : "border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60"
                                                    }
                                                >
                                                    <CardContent className="p-5 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMain ? "bg-indigo-100 dark:bg-indigo-900/40" : "bg-slate-200 dark:bg-slate-800"}`}>
                                                                <Icon className={`h-5 w-5 ${isMain ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"}`} />
                                                            </div>
                                                            <span className={`font-semibold ${isMain ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                                                                {label}
                                                            </span>
                                                        </div>
                                                        <span className={`font-mono text-lg font-semibold ${isMain ? "text-indigo-700 dark:text-indigo-300" : "text-slate-500 dark:text-slate-400"}`}>
                                                            {time}
                                                        </span>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>

                                    <div className="text-center mt-8">
                                        <Button variant="ghost" size="sm" onClick={requestLocation}>
                                            Update location
                                        </Button>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    <p className="text-center mt-12 text-xs text-slate-500 dark:text-slate-400">
                        Data from{" "}
                        <a href="https://ummahapi.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                            UmmahAPI
                        </a>.
                    </p>
                </div>
            </section>
        </div>
    );
}
