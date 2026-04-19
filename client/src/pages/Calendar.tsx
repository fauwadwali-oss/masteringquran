import { useEffect, useState } from "react";
import { Calendar as CalendarIcon, ArrowRightLeft, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEO from "@/components/SEO";

interface Event {
    name: string;
    hijri_date?: string;
    month?: number;
    day?: number;
    days_until?: number;
}
interface Month {
    number: number;
    name_english: string;
    name_arabic?: string;
    days?: number;
    significance?: string;
}

export default function CalendarPage() {
    const [todayHijri, setTodayHijri] = useState<any>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [months, setMonths] = useState<Month[]>([]);
    const [loadingCore, setLoadingCore] = useState(true);

    // Converter
    const [direction, setDirection] = useState<"g2h" | "h2g">("g2h");
    const [gDate, setGDate] = useState(new Date().toISOString().slice(0, 10));
    const [hYear, setHYear] = useState(1447);
    const [hMonth, setHMonth] = useState(1);
    const [hDay, setHDay] = useState(1);
    const [converted, setConverted] = useState<string | null>(null);
    const [convertLoading, setConvertLoading] = useState(false);
    const [convertErr, setConvertErr] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            fetch("https://ummahapi.com/api/today-hijri").then((r) => r.json()),
            fetch("https://ummahapi.com/api/islamic-events").then((r) => r.json()),
            fetch("https://ummahapi.com/api/islamic-months").then((r) => r.json()),
        ])
            .then(([a, b, c]) => {
                setTodayHijri(a.data?.hijri || a.data);
                setEvents((b.data?.events || []).slice(0, 12));
                setMonths(c.data?.months || c.data || []);
                setLoadingCore(false);
            })
            .catch(() => setLoadingCore(false));
    }, []);

    const convert = () => {
        setConverted(null);
        setConvertErr(null);
        setConvertLoading(true);
        const url =
            direction === "g2h"
                ? `https://ummahapi.com/api/hijri-date?date=${gDate}`
                : `https://ummahapi.com/api/gregorian-date?year=${hYear}&month=${hMonth}&day=${hDay}`;
        fetch(url)
            .then(async (r) => {
                if (!r.ok) throw new Error("failed");
                const d: any = await r.json();
                const payload = d.data || d;
                const formatted =
                    direction === "g2h"
                        ? payload.hijri?.formatted || `${payload.hijri?.date}`
                        : payload.gregorian?.formatted || `${payload.gregorian?.date}`;
                setConverted(formatted || "Converted");
                setConvertLoading(false);
            })
            .catch(() => {
                setConvertErr("Conversion failed.");
                setConvertLoading(false);
            });
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
                        {todayHijri && (
                            <p className="text-base text-slate-600 dark:text-slate-300">
                                Today: <span className="font-semibold">{todayHijri.formatted || todayHijri.date}</span>
                            </p>
                        )}
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
                                    <Button onClick={convert} disabled={convertLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white h-11">
                                        {convertLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRightLeft className="h-4 w-4" />}
                                        <span className="ml-2">Convert</span>
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-3 flex-wrap items-end">
                                    <div className="flex-1 min-w-[100px]">
                                        <label className="text-xs text-slate-500 font-medium">Hijri year</label>
                                        <Input type="number" value={hYear} onChange={(e) => setHYear(parseInt(e.target.value) || 1447)} className="mt-1 h-11" />
                                    </div>
                                    <div className="flex-1 min-w-[80px]">
                                        <label className="text-xs text-slate-500 font-medium">Month</label>
                                        <Input type="number" min={1} max={12} value={hMonth} onChange={(e) => setHMonth(parseInt(e.target.value) || 1)} className="mt-1 h-11" />
                                    </div>
                                    <div className="flex-1 min-w-[80px]">
                                        <label className="text-xs text-slate-500 font-medium">Day</label>
                                        <Input type="number" min={1} max={30} value={hDay} onChange={(e) => setHDay(parseInt(e.target.value) || 1)} className="mt-1 h-11" />
                                    </div>
                                    <Button onClick={convert} disabled={convertLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white h-11">
                                        {convertLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRightLeft className="h-4 w-4" />}
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

                    {loadingCore && (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        </div>
                    )}

                    {!loadingCore && (
                        <>
                            {/* Islamic events */}
                            {events.length > 0 && (
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Islamic Events
                                    </h2>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {events.map((e, i) => (
                                            <Card key={i} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                <CardContent className="p-4 space-y-1">
                                                    <p className="font-semibold text-slate-900 dark:text-white">{e.name}</p>
                                                    <p className="text-sm text-indigo-600 dark:text-indigo-400">{e.hijri_date || `${e.month}/${e.day}`}</p>
                                                    {typeof e.days_until === "number" && e.days_until > 0 && (
                                                        <p className="text-xs text-slate-500">in {e.days_until} days</p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Islamic months */}
                            {months.length > 0 && (
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                                        The 12 Islamic Months
                                    </h2>
                                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {months.map((m) => (
                                            <Card key={m.number} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                <CardContent className="p-4 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-mono text-slate-400">#{m.number}</span>
                                                        {m.days && <span className="text-xs text-slate-500">{m.days} days</span>}
                                                    </div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">{m.name_english}</p>
                                                    {m.name_arabic && <p className="font-amiri text-lg text-indigo-700 dark:text-indigo-400" dir="rtl">{m.name_arabic}</p>}
                                                    {m.significance && <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{m.significance}</p>}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <p className="text-center text-xs text-slate-500 dark:text-slate-400">
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
