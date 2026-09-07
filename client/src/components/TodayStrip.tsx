import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Library, Heart, Star, Calendar, Loader2 } from "lucide-react";
import { dailyIndex, dailyVerseKey } from "@/lib/daily-selection";
import { Card, CardContent } from "@/components/ui/card";

interface VerseOfDay {
    verse_key: string;
    arabic: string;
    english: string;
    surahName: string;
}
interface HadithOfDay {
    collection: string;
    slug: string;
    number: string;
    text: string;
}
interface DuaOfDay {
    id: number;
    categoryId: string;
    source?: string;
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

    const [date, setDate] = useState(() => new Date());
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [retry, setRetry] = useState(0);
    const dateKey = date.toISOString().slice(0, 10);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setDate((previous) => {
                const now = new Date();
                return now.toISOString().slice(0, 10) === previous.toISOString().slice(0, 10) ? previous : now;
            });
        }, 30_000);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const day = new Date(`${dateKey}T00:00:00Z`);
        setVerse(null); setHadith(null); setDua(null); setName(null); setEvent(null); setErrors({});
        async function json(url: string) {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) throw new Error("Content unavailable");
            return response.json();
        }
        const failed = (key: string) => { if (!controller.signal.aborted) setErrors(previous => ({ ...previous, [key]: true })); };
        const verseTask = (async () => {
            const { chapters } = await json("https://api.quran.com/api/v4/chapters?language=en");
            const key = dailyVerseKey(day, chapters);
            const { verse: v } = await json(`https://api.quran.com/api/v4/verses/by_key/${key}?translations=22&language=en&fields=text_uthmani`);
            if (!v?.text_uthmani || !v.translations?.[0]?.text) throw new Error("Missing verse");
            setVerse({ verse_key: v.verse_key, arabic: v.text_uthmani, english: v.translations[0].text.replace(/<[^>]+>/g, ""), surahName: `Surah ${key.split(":")[0]}` });
        })().catch(() => failed("verse"));
        const hadithTask = (async () => {
            const data = await json("https://cdn.jsdelivr.net/gh/fauwadwali-oss/nwv-islamic-data@main/hadith/editions/eng-nawawi.min.json");
            const h = data.hadiths[dailyIndex(day, data.hadiths.length)];
            if (!h?.text) throw new Error("Missing hadith");
            setHadith({ collection: data.metadata.name, slug: "nawawi", number: String(h.hadithnumber), text: h.text });
        })().catch(() => failed("hadith"));
        const duaTask = (async () => {
            const { data } = await json("https://ummahapi.com/api/duas/categories");
            const categories = [...data.categories].sort((a, b) => a.id.localeCompare(b.id));
            const category = categories[dailyIndex(day, categories.length)];
            const result = await json(`https://ummahapi.com/api/duas/category/${encodeURIComponent(category.id)}`);
            const duas = [...result.data.duas].sort((a, b) => a.id - b.id);
            const du = duas[dailyIndex(day, duas.length)];
            if (!du?.translation) throw new Error("Missing dua");
            setDua({ id: du.id, categoryId: category.id, title: du.title, category: category.name, translation: du.translation, source: du.source });
        })().catch(() => failed("dua"));
        const nameTask = json(`https://ummahapi.com/api/asma-ul-husna/${dailyIndex(day, 99) + 1}`)
            .then(d => { const n = d.data?.name || d.data; if (!n?.arabic) throw new Error("Missing name"); setName(n); })
            .catch(() => failed("name"));
        const eventTask = json("https://ummahapi.com/api/islamic-events")
            .then(d => setEvent(d.data?.next_event ?? null)).catch(() => {});
        const timeout = window.setTimeout(() => {
            controller.abort();
            setErrors({ verse: true, hadith: true, dua: true, name: true });
        }, 15_000);
        void Promise.allSettled([verseTask, hadithTask, duaTask, nameTask, eventTask]).then(() => window.clearTimeout(timeout));
        return () => { window.clearTimeout(timeout); controller.abort(); };
    }, [dateKey, retry]);

    const placeholder = (key: string) => errors[key]
        ? <p className="py-4 text-sm text-slate-500">Could not load this selection. Open the library or retry below.</p>
        : <div role="status" className="flex justify-center gap-2 py-6 text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /><span>Loading…</span></div>;

    return (
        <section className="py-12 px-6 bg-gradient-to-b from-white via-emerald-50/20 to-white dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950 border-t border-slate-100 dark:border-slate-800">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Today · {dateKey} · UTC</p>
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
                    <Link to={verse ? `/quran?verse=${verse.verse_key}` : "/quran"} className="group">
                        <Card className="h-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xl transition-all">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                    <BookOpen className="h-4 w-4" />
                                    <p className="text-xs font-semibold uppercase tracking-wider">Verse of the day</p>
                                </div>
                                {verse ? (
                                    <>
                                        <p className="font-amiri text-2xl leading-loose text-slate-900 dark:text-slate-100 text-right line-clamp-2" dir="rtl" lang="ar">
                                            {verse.arabic}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4">
                                            {clampText(verse.english, 160)}
                                        </p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">— Quran {verse.verse_key} · Yusuf Ali</p>
                                    </>
                                ) : (
                                    placeholder("verse")
                                )}
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Hadith of the day */}
                    <Link to={hadith ? `/hadith?collection=${hadith.slug}&hadith=${encodeURIComponent(hadith.number)}` : "/hadith"} className="group">
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
                                    placeholder("hadith")
                                )}
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Dua of the day */}
                    <Link to={dua ? `/duas?category=${encodeURIComponent(dua.categoryId)}&dua=${dua.id}` : "/duas"} className="group">
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
                                        <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">— {dua.source || dua.category}</p>
                                    </>
                                ) : (
                                    placeholder("dua")
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
                                        <p className="font-amiri text-4xl text-amber-800 dark:text-amber-300 leading-tight" dir="rtl" lang="ar">
                                            {name.arabic}
                                        </p>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white italic">{name.transliteration}</p>
                                            <p className="text-sm text-amber-600 dark:text-amber-400">{name.english}</p>
                                        </div>
                                        <p className="text-xs text-slate-400 font-mono">#{name.number} of 99</p>
                                    </>
                                ) : (
                                    placeholder("name")
                                )}
                            </CardContent>
                        </Card>
                    </Link>
                </div>
                {((errors.verse && !verse) || (errors.hadith && !hadith) || (errors.dua && !dua) || (errors.name && !name)) && <button onClick={() => setRetry(n => n + 1)} className="mt-4 min-h-11 rounded-lg border border-emerald-300 px-4 text-sm font-semibold text-emerald-800 dark:text-emerald-300">Retry daily selections</button>}
            </div>
        </section>
    );
}
