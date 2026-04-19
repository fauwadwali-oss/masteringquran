import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Library, Heart, Star, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface VerseOfDay {
    verse_key: string;
    arabic: string;
    english: string;
    surahName: string;
}
interface HadithOfDay {
    collection: string;
    number: string;
    text: string;
}
interface DuaOfDay {
    title: string;
    category: string;
    translation: string;
}
interface NameOfDay {
    number: number;
    arabic: string;
    transliteration: string;
    english: string;
}
interface NextEvent {
    name: string;
    hijri_date: string;
    days_until?: number;
}

const clampText = (s: string, n = 220): string => (s && s.length > n ? s.slice(0, n).trim() + "…" : s || "");

export default function TodayStrip() {
    const [verse, setVerse] = useState<VerseOfDay | null>(null);
    const [hadith, setHadith] = useState<HadithOfDay | null>(null);
    const [dua, setDua] = useState<DuaOfDay | null>(null);
    const [name, setName] = useState<NameOfDay | null>(null);
    const [event, setEvent] = useState<NextEvent | null>(null);

    useEffect(() => {
        // Random verse — Quran.com (Yusuf Ali translation)
        fetch("https://api.quran.com/api/v4/verses/random?translations=22&language=en&fields=text_uthmani")
            .then((r) => r.json())
            .then((d: any) => {
                const v = d.verse;
                if (!v) return;
                setVerse({
                    verse_key: v.verse_key,
                    arabic: v.text_uthmani,
                    english: v.translations?.[0]?.text || "",
                    surahName: `Surah ${v.verse_key.split(":")[0]}`,
                });
            })
            .catch(() => { });

        // Random hadith — UmmahAPI
        fetch("https://ummahapi.com/api/hadith/random")
            .then((r) => r.json())
            .then((d: any) => {
                const h = d.data;
                if (!h) return;
                setHadith({
                    collection: h.collection_name || h.collection || "",
                    number: String(h.hadithnumber || ""),
                    text: h.english || h.text || "",
                });
            })
            .catch(() => { });

        // Random dua — UmmahAPI
        fetch("https://ummahapi.com/api/duas/random")
            .then((r) => r.json())
            .then((d: any) => {
                const du = d.data;
                if (!du) return;
                setDua({
                    title: du.title,
                    category: du.category_info?.name || du.category,
                    translation: du.translation,
                });
            })
            .catch(() => { });

        // 99 Name of the day (day of year 1-365 mod 99 + 1 gives a rotation)
        const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        const nameNumber = ((day - 1) % 99) + 1;
        fetch(`https://ummahapi.com/api/asma-ul-husna/${nameNumber}`)
            .then((r) => r.json())
            .then((d: any) => {
                const n = d.data?.name || d.data;
                if (!n) return;
                setName({
                    number: n.number,
                    arabic: n.arabic,
                    transliteration: n.transliteration,
                    english: n.english,
                });
            })
            .catch(() => { });

        // Next Islamic event
        fetch("https://ummahapi.com/api/islamic-events")
            .then((r) => r.json())
            .then((d: any) => {
                const next = d.data?.next_event;
                if (next) {
                    setEvent({
                        name: next.name,
                        hijri_date: next.hijri_date,
                        days_until: next.days_until,
                    });
                }
            })
            .catch(() => { });
    }, []);

    return (
        <section className="py-12 px-6 bg-gradient-to-b from-white via-emerald-50/20 to-white dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950 border-t border-slate-100 dark:border-slate-800">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Today</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                            A few things to reflect on
                        </h2>
                    </div>
                    {event && (
                        <Link to="/calendar" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors">
                            <Calendar className="h-3.5 w-3.5" />
                            Next: {event.name} · {event.hijri_date}
                        </Link>
                    )}
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Verse of the day */}
                    <Link to={verse ? `/quran` : "#"} className="group">
                        <Card className="h-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xl transition-all">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                    <BookOpen className="h-4 w-4" />
                                    <p className="text-xs font-semibold uppercase tracking-wider">Verse of the day</p>
                                </div>
                                {verse ? (
                                    <>
                                        <p className="font-amiri text-2xl leading-loose text-slate-900 dark:text-slate-100 text-right line-clamp-2" dir="rtl">
                                            {clampText(verse.arabic, 80)}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4">
                                            {clampText(verse.english, 160)}
                                        </p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">— Quran {verse.verse_key}</p>
                                    </>
                                ) : (
                                    <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-slate-300" /></div>
                                )}
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Hadith of the day */}
                    <Link to="/hadith" className="group">
                        <Card className="h-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xl transition-all">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                    <Library className="h-4 w-4" />
                                    <p className="text-xs font-semibold uppercase tracking-wider">Hadith of the day</p>
                                </div>
                                {hadith ? (
                                    <>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-6">
                                            {clampText(hadith.text, 280)}
                                        </p>
                                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">— {hadith.collection} #{hadith.number}</p>
                                    </>
                                ) : (
                                    <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-slate-300" /></div>
                                )}
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Dua of the day */}
                    <Link to="/duas" className="group">
                        <Card className="h-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-xl transition-all">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
                                    <Heart className="h-4 w-4" />
                                    <p className="text-xs font-semibold uppercase tracking-wider">Dua of the day</p>
                                </div>
                                {dua ? (
                                    <>
                                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{dua.title}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-5">
                                            {clampText(dua.translation, 220)}
                                        </p>
                                        <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">— {dua.category}</p>
                                    </>
                                ) : (
                                    <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-slate-300" /></div>
                                )}
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Name of the day */}
                    <Link to="/names" className="group">
                        <Card className="h-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xl transition-all">
                            <CardContent className="p-5 space-y-3 text-center">
                                <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-400">
                                    <Star className="h-4 w-4" />
                                    <p className="text-xs font-semibold uppercase tracking-wider">Today's Name</p>
                                </div>
                                {name ? (
                                    <>
                                        <p className="font-amiri text-4xl text-amber-800 dark:text-amber-300 leading-tight" dir="rtl">
                                            {name.arabic}
                                        </p>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white italic">{name.transliteration}</p>
                                            <p className="text-sm text-amber-600 dark:text-amber-400">{name.english}</p>
                                        </div>
                                        <p className="text-xs text-slate-400 font-mono">#{name.number} of 99</p>
                                    </>
                                ) : (
                                    <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-slate-300" /></div>
                                )}
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </section>
    );
}
