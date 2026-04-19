import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, HandCoins, Shield, Users, BookOpen, Sun, CloudRain, Sparkles, Scale, Anchor, Flame, Leaf, Star, Wallet, UserCheck, BookCheck, Swords, MessageSquare, AlertTriangle, Compass, Search, Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";

// Hand-curated topic list with key verse references. Each topic has 3-6 representative ayahs.
// References are (surah:ayah). Source: classical topical indexes (Fadlullah, Hamka, Yusuf Ali index).
interface Topic {
    id: string;
    name: string;
    arabic?: string;
    icon: any;
    color: string;
    description: string;
    verses: string[]; // verse_keys
}

const TOPICS: Topic[] = [
    { id: "mercy", name: "Mercy", arabic: "الرَّحْمَة", icon: Heart, color: "emerald", description: "Allah's boundless compassion toward His creation.", verses: ["1:3", "6:54", "7:156", "39:53", "21:107"] },
    { id: "patience", name: "Patience", arabic: "الصَّبْر", icon: Anchor, color: "blue", description: "Sabr — endurance in trial, restraint in hardship.", verses: ["2:153", "2:155", "3:200", "103:3", "16:126"] },
    { id: "charity", name: "Charity", arabic: "الصَّدَقَة", icon: HandCoins, color: "amber", description: "Zakat, sadaqah, and the ethic of giving.", verses: ["2:177", "2:261", "2:274", "9:103", "63:10"] },
    { id: "prayer", name: "Prayer", arabic: "الصَّلَاة", icon: BookCheck, color: "indigo", description: "Salah as the pillar of worship.", verses: ["2:3", "2:45", "20:14", "29:45", "107:4"] },
    { id: "tawhid", name: "Oneness of Allah", arabic: "التَّوْحِيد", icon: Sparkles, color: "purple", description: "La ilaha illa Allah — the heart of the Quran.", verses: ["112:1", "2:255", "3:18", "59:22", "39:67"] },
    { id: "justice", name: "Justice", arabic: "العَدْل", icon: Scale, color: "slate", description: "'Adl — the divine demand for fairness.", verses: ["4:135", "5:8", "16:90", "57:25", "4:58"] },
    { id: "forgiveness", name: "Forgiveness", arabic: "المَغْفِرَة", icon: Shield, color: "teal", description: "Allah's promise to forgive the repentant.", verses: ["39:53", "4:110", "2:199", "24:22", "3:133"] },
    { id: "gratitude", name: "Gratitude", arabic: "الشُّكْر", icon: Sun, color: "yellow", description: "Shukr — recognizing blessings and thanking the Giver.", verses: ["14:7", "2:152", "31:12", "34:13", "16:18"] },
    { id: "paradise", name: "Paradise", arabic: "الجَنَّة", icon: Leaf, color: "emerald", description: "Jannah — the garden promised to the righteous.", verses: ["2:25", "13:35", "18:107", "47:15", "76:12"] },
    { id: "hellfire", name: "Hellfire", arabic: "النَّار", icon: Flame, color: "rose", description: "Jahannam — warning for those who reject guidance.", verses: ["2:24", "9:49", "40:71", "78:21", "104:6"] },
    { id: "family", name: "Family", arabic: "الأَهْل", icon: Users, color: "pink", description: "Parents, spouse, children — rights and duties.", verses: ["17:23", "4:1", "31:14", "46:15", "66:6"] },
    { id: "knowledge", name: "Knowledge", arabic: "العِلْم", icon: BookOpen, color: "blue", description: "Seeking ilm as an act of worship.", verses: ["39:9", "58:11", "96:1", "20:114", "35:28"] },
    { id: "trust", name: "Trust in Allah", arabic: "التَّوَكُّل", icon: Shield, color: "indigo", description: "Tawakkul — placing one's affairs with Allah.", verses: ["3:159", "8:2", "65:3", "11:123", "9:51"] },
    { id: "guidance", name: "Guidance", arabic: "الهِدَايَة", icon: Compass, color: "emerald", description: "Hidayah — the straight path and the light of the Quran.", verses: ["1:6", "2:2", "6:125", "17:9", "42:52"] },
    { id: "humility", name: "Humility", arabic: "التَّوَاضُع", icon: Star, color: "violet", description: "Modesty before Allah and gentleness with people.", verses: ["25:63", "31:18", "17:37", "7:55", "23:2"] },
    { id: "wealth", name: "Wealth & Provision", arabic: "الرِّزْق", icon: Wallet, color: "amber", description: "Rizq — lawful earning, spending, and the danger of greed.", verses: ["2:188", "4:32", "17:26", "62:10", "102:1"] },
    { id: "truthfulness", name: "Truthfulness", arabic: "الصِّدْق", icon: UserCheck, color: "teal", description: "Sidq — honesty in speech, in dealings, in faith.", verses: ["9:119", "33:35", "39:33", "49:15", "57:19"] },
    { id: "reflection", name: "Reflection", arabic: "التَّفَكُّر", icon: BookOpen, color: "blue", description: "Contemplating creation and the signs of Allah.", verses: ["3:191", "13:3", "30:8", "38:29", "88:17"] },
    { id: "dua", name: "Supplication", arabic: "الدُّعَاء", icon: MessageSquare, color: "teal", description: "Calling on Allah in humility and need.", verses: ["2:186", "40:60", "7:55", "25:77", "7:180"] },
    { id: "repentance", name: "Repentance", arabic: "التَّوْبَة", icon: Shield, color: "indigo", description: "Tawbah — returning to Allah after error.", verses: ["66:8", "9:104", "24:31", "110:3", "2:222"] },
    { id: "jihad-nafs", name: "Striving (of the Self)", arabic: "الجِهَاد", icon: Swords, color: "slate", description: "Jihad al-nafs — struggle against one's own lower self.", verses: ["29:69", "22:78", "9:20", "25:52", "49:15"] },
    { id: "warnings", name: "Warnings", arabic: "النَّذِير", icon: AlertTriangle, color: "orange", description: "Admonitions for the heedless.", verses: ["2:6", "7:179", "35:37", "39:21", "74:35"] },
    { id: "nature", name: "Nature & Creation", arabic: "الخَلْق", icon: CloudRain, color: "sky", description: "Ayat — cosmic signs pointing to the Creator.", verses: ["2:164", "13:2", "30:22", "36:33", "78:6"] },
];

interface VerseFetched {
    verse_key: string;
    arabic: string;
    english: string;
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-600 dark:text-emerald-400", border: "hover:border-emerald-400" },
    blue: { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-600 dark:text-blue-400", border: "hover:border-blue-400" },
    amber: { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-600 dark:text-amber-400", border: "hover:border-amber-400" },
    indigo: { bg: "bg-indigo-100 dark:bg-indigo-900/40", text: "text-indigo-600 dark:text-indigo-400", border: "hover:border-indigo-400" },
    purple: { bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-600 dark:text-purple-400", border: "hover:border-purple-400" },
    slate: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", border: "hover:border-slate-400" },
    teal: { bg: "bg-teal-100 dark:bg-teal-900/40", text: "text-teal-600 dark:text-teal-400", border: "hover:border-teal-400" },
    yellow: { bg: "bg-yellow-100 dark:bg-yellow-900/40", text: "text-yellow-600 dark:text-yellow-400", border: "hover:border-yellow-400" },
    rose: { bg: "bg-rose-100 dark:bg-rose-900/40", text: "text-rose-600 dark:text-rose-400", border: "hover:border-rose-400" },
    pink: { bg: "bg-pink-100 dark:bg-pink-900/40", text: "text-pink-600 dark:text-pink-400", border: "hover:border-pink-400" },
    violet: { bg: "bg-violet-100 dark:bg-violet-900/40", text: "text-violet-600 dark:text-violet-400", border: "hover:border-violet-400" },
    orange: { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-600 dark:text-orange-400", border: "hover:border-orange-400" },
    sky: { bg: "bg-sky-100 dark:bg-sky-900/40", text: "text-sky-600 dark:text-sky-400", border: "hover:border-sky-400" },
};

const cleanText = (s: string): string => (s || "").replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]+>/g, "").trim();

export default function Topics() {
    const [selected, setSelected] = useState<Topic | null>(null);
    const [verses, setVerses] = useState<VerseFetched[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!selected) return;
        setLoading(true);
        setVerses([]);
        Promise.all(
            selected.verses.map((key) =>
                fetch(`https://api.quran.com/api/v4/verses/by_key/${key}?translations=22&language=en&fields=text_uthmani`)
                    .then((r) => r.json())
                    .then((d: any) => ({
                        verse_key: d.verse.verse_key,
                        arabic: d.verse.text_uthmani,
                        english: cleanText(d.verse.translations?.[0]?.text || ""),
                    }))
                    .catch(() => null),
            ),
        )
            .then((arr) => {
                setVerses(arr.filter(Boolean) as VerseFetched[]);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [selected]);

    const filtered = useMemo(() => {
        if (!search.trim()) return TOPICS;
        const q = search.toLowerCase();
        return TOPICS.filter((t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }, [search]);

    if (selected) {
        const c = COLOR_MAP[selected.color];
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
                <SEO
                    title={`${selected.name} in the Quran - Mastering Quran`}
                    description={`Key verses about ${selected.name.toLowerCase()} in the Holy Quran.`}
                />
                <section className="py-12 px-6">
                    <div className="max-w-3xl mx-auto">
                        <Button variant="ghost" className="mb-6 gap-2" onClick={() => setSelected(null)}>
                            <ArrowLeft className="h-4 w-4" /> All topics
                        </Button>

                        <div className="text-center mb-10 space-y-3">
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${c.bg} mx-auto`}>
                                <selected.icon className={`h-7 w-7 ${c.text}`} />
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                                {selected.name}
                            </h1>
                            {selected.arabic && <p className="font-amiri text-2xl text-emerald-700 dark:text-emerald-400" dir="rtl">{selected.arabic}</p>}
                            <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto">{selected.description}</p>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {verses.map((v, i) => (
                                    <Card key={i} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                        <CardContent className="p-6 space-y-3">
                                            <p className={`text-xs font-semibold uppercase tracking-wider ${c.text}`}>Quran {v.verse_key}</p>
                                            <p className="font-amiri text-2xl md:text-3xl leading-loose text-slate-900 dark:text-slate-100 text-right" dir="rtl">
                                                {v.arabic}
                                            </p>
                                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                                {v.english}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <p className="text-center mt-10 text-xs text-slate-500 dark:text-slate-400">
                            A curated selection — the Quran contains far more on this theme.{" "}
                            <Link to="/ask" className="text-emerald-600 hover:underline">Ask the AI</Link> for deeper exploration.
                        </p>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            <SEO
                title="Topics in the Quran - Mastering Quran"
                description="Browse the Holy Quran by topic: mercy, patience, charity, prayer, family, justice, and more."
            />
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10 space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Topical index</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Topics in the Quran
                        </h1>
                        <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                            Start with a theme and let the verses guide you. Each topic opens a curated set of key ayahs.
                        </p>
                    </div>

                    <div className="max-w-md mx-auto mb-10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <Input
                                placeholder="Search topics…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-11 bg-white dark:bg-slate-800 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((t) => {
                            const c = COLOR_MAP[t.color];
                            return (
                                <Card
                                    key={t.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setSelected(t)}
                                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelected(t)}
                                    className={`cursor-pointer border-2 border-slate-200 dark:border-slate-700 ${c.border} dark:${c.border} bg-white dark:bg-slate-900 transition-all hover:shadow-xl hover:-translate-y-1`}
                                >
                                    <CardContent className="p-5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center`}>
                                                <t.icon className={`h-5 w-5 ${c.text}`} />
                                            </div>
                                            <span className="text-xs text-slate-400 font-mono">{t.verses.length} verses</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{t.name}</h3>
                                            {t.arabic && <p className="font-amiri text-base text-slate-500 dark:text-slate-400" dir="rtl">{t.arabic}</p>}
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}
