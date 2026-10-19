import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, ArrowRightLeft, AlertCircle } from "lucide-react";
import { HIJRI_MONTHS, formatHijri, hijriToGregorian, todayYmd, upcomingEvents } from "@/lib/hijri";
import { toHijri } from "@/lib/prayer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEO from "@/components/SEO";
import MoonPhaseWidget from "@/components/MoonPhaseWidget";

export default function CalendarPage() {
    const today = todayYmd();
    const todayHijri = toHijri(today);
    const events = useMemo(() => upcomingEvents(today), [today[0], today[1], today[2]]);

    // Converter
    const [direction, setDirection] = useState<"g2h" | "h2g">("g2h");
    const [gDate, setGDate] = useState(() => today.map((n, i) => String(n).padStart(i ? 2 : 4, "0")).join("-"));
    const [hYear, setHYear] = useState(todayHijri.year);
    const [hMonth, setHMonth] = useState(todayHijri.month);
    const [hDay, setHDay] = useState(todayHijri.day);
    const [converted, setConverted] = useState<string | null>(null);
    const [convertErr, setConvertErr] = useState<string | null>(null);

    const convert = () => {
        setConverted(null);
        setConvertErr(null);
        if (direction === "g2h") {
            const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(gDate);
            if (!m) return setConvertErr("Enter a valid date.");
            setConverted(formatHijri(toHijri([+m[1], +m[2], +m[3]])));
        } else {
            const g = hijriToGregorian(hYear, hMonth, hDay);
            if (!g) return setConvertErr("That Hijri date doesn't exist in the Umm al-Qura calendar (some months have 29 days).");
            setConverted(new Date(Date.UTC(g[0], g[1] - 1, g[2], 12)).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long", year: "numeric", month: "long", day: "numeric" }));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50/30 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 font-sans">
            <SEO
                title="Islamic Calendar - Mastering Quran"
                description="Hijri-Gregorian date converter, upcoming Islamic events, and a reference for the 12 Islamic months."
            />
            <section className="py-12 px-6">
                <div className="max-w-5xl mx-auto space-y-10">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-full border border-indigo-200 dark:border-indigo-800">
                            <CalendarIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Islamic Calendar</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Calendar & Events
                        </h1>
                        <p className="text-base text-slate-600 dark:text-slate-300">
                            Today: <span className="font-semibold">{formatHijri(todayHijri)}</span>
                        </p>
                    </div>

                    {/* Converter */}
                    <Card className="border border-indigo-200 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/40 to-white dark:from-indigo-950/10 dark:to-slate-900">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Hijri ↔ Gregorian Converter</h2>
                                <Tabs value={direction} onValueChange={(v) => setDirection(v as any)}>
                                    <TabsList>
                                        <TabsTrigger value="g2h">Gregorian → Hijri</TabsTrigger>
                                        <TabsTrigger value="h2g">Hijri → Gregorian</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            {direction === "g2h" ? (
                                <div className="flex gap-3 flex-wrap items-end">
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="text-xs text-slate-500 font-medium">Gregorian date</label>
                                        <Input type="date" value={gDate} onChange={(e) => setGDate(e.target.value)} className="mt-1 h-11" />
                                    </div>
                                    <Button onClick={convert} className="bg-indigo-600 hover:bg-indigo-700 text-white h-11">
                                        <ArrowRightLeft className="h-4 w-4" />
                                        <span className="ml-2">Convert</span>
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-3 flex-wrap items-end">
                                    <div className="flex-1 min-w-[100px]">
                                        <label className="text-xs text-slate-500 font-medium">Hijri year</label>
                                        <Input type="number" value={hYear} onChange={(e) => setHYear(parseInt(e.target.value) || todayHijri.year)} className="mt-1 h-11" />
                                    </div>
                                    <div className="flex-1 min-w-[80px]">
                                        <label className="text-xs text-slate-500 font-medium">Month</label>
                                        <Input type="number" min={1} max={12} value={hMonth} onChange={(e) => setHMonth(parseInt(e.target.value) || 1)} className="mt-1 h-11" />
                                    </div>
                                    <div className="flex-1 min-w-[80px]">
                                        <label className="text-xs text-slate-500 font-medium">Day</label>
                                        <Input type="number" min={1} max={30} value={hDay} onChange={(e) => setHDay(parseInt(e.target.value) || 1)} className="mt-1 h-11" />
                                    </div>
                                    <Button onClick={convert} className="bg-indigo-600 hover:bg-indigo-700 text-white h-11">
                                        <ArrowRightLeft className="h-4 w-4" />
                                        <span className="ml-2">Convert</span>
                                    </Button>
                                </div>
                            )}

                            {converted && (
                                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40">
                                    <p className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold uppercase tracking-wider">Result</p>
                                    <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">{converted}</p>
                                </div>
                            )}
                            {convertErr && (
                                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" /> {convertErr}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Moon phase widget */}
                    <MoonPhaseWidget />

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Upcoming Islamic Events
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {events.map((e) => (
                                <Card key={e.hijri} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                    <CardContent className="p-4 space-y-1">
                                        <p className="font-semibold text-slate-900 dark:text-white">{e.name}</p>
                                        <p className="text-sm text-indigo-600 dark:text-indigo-400">
                                            {e.hijri} · {new Date(Date.UTC(e.date[0], e.date[1] - 1, e.date[2], 12)).toLocaleDateString("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" })}
                                        </p>
                                        <p className="text-xs text-slate-500">{e.daysUntil === 0 ? "Today" : e.daysUntil === 1 ? "Tomorrow" : `in ${e.daysUntil} days`}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                            The 12 Islamic Months
                        </h2>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {HIJRI_MONTHS.map((m) => (
                                <Card key={m.number} className={`border bg-white dark:bg-slate-900 ${m.number === todayHijri.month ? "border-indigo-300 dark:border-indigo-700" : "border-slate-200 dark:border-slate-800"}`}>
                                    <CardContent className="p-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-400">#{m.number}</span>
                                            {m.number === todayHijri.month && <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">This month</span>}
                                        </div>
                                        <p className="font-semibold text-slate-900 dark:text-white">{m.name}</p>
                                        <p className="text-lg text-indigo-700 dark:text-indigo-400" style={{ fontFamily: "'Amiri', serif" }} lang="ar" dir="rtl">{m.arabic}</p>
                                        {m.note && <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{m.note}</p>}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                        Dates follow the Umm al-Qura calendar, calculated on your device. Communities that follow local moon sighting may be a day earlier or later.
                    </p>
                </div>
            </section>
        </div>
    );
}
