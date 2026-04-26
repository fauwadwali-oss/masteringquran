import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, GraduationCap, Heart, Library, Loader2, Search as SearchIcon, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GLOSSARY } from "@/lib/content/glossary";
import { LESSONS } from "@/lib/content/arabic-foundations";
import { VOCAB_WORDS } from "@/lib/content/quranic-vocab";
import { ROOTS } from "@/lib/content/arabic-roots";

type Result = {
    type: "Quran" | "Hadith" | "Dua" | "Glossary" | "Arabic" | "Topic";
    title: string;
    body: string;
    to: string;
};

const HADITH_STARTERS: Result[] = [
    { type: "Hadith", title: "Intentions", body: "Actions are only by intentions. Search hadith collections for intention, sincerity, and deeds.", to: "/hadith" },
    { type: "Hadith", title: "Learning Quran", body: "The best of you are those who learn the Quran and teach it.", to: "/hadith" },
    { type: "Hadith", title: "Mercy", body: "Explore narrations on mercy, gentleness, compassion, and forgiveness.", to: "/hadith" },
];

const DUA_STARTERS: Result[] = [
    { type: "Dua", title: "Forgiveness", body: "Search duas for forgiveness, repentance, and Allah's mercy.", to: "/duas" },
    { type: "Dua", title: "Morning and evening", body: "Find daily adhkar and protective supplications.", to: "/duas" },
    { type: "Dua", title: "Knowledge", body: "Rabbi zidni ilma: My Lord, increase me in knowledge.", to: "/duas" },
];

const TOPIC_STARTERS: Result[] = [
    { type: "Topic", title: "Patience", body: "Curated Quran topics for sabr, hardship, and trust in Allah.", to: "/topics" },
    { type: "Topic", title: "Charity", body: "Verses and reminders about sadaqah, zakat, and generosity.", to: "/topics" },
    { type: "Topic", title: "Prayer", body: "Explore salah, khushu, qibla, and daily prayer practice.", to: "/topics" },
];

export default function Search() {
    const [query, setQuery] = useState("");
    const [quranResults, setQuranResults] = useState<Result[]>([]);
    const [loadingQuran, setLoadingQuran] = useState(false);

    const localResults = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];

        const glossary = GLOSSARY.filter((item) =>
            [item.term, item.arabic, item.category, item.definition].join(" ").toLowerCase().includes(q),
        ).slice(0, 8).map<Result>((item) => ({
            type: "Glossary",
            title: item.term,
            body: item.definition,
            to: `/glossary?term=${item.id}`,
        }));

        const lessons = LESSONS.filter((lesson) =>
            [lesson.title, lesson.subtitle, lesson.slug].join(" ").toLowerCase().includes(q),
        ).slice(0, 6).map<Result>((lesson) => ({
            type: "Arabic",
            title: lesson.title,
            body: lesson.subtitle,
            to: `/learn-arabic/${lesson.slug}`,
        }));

        const vocab = VOCAB_WORDS.filter((word) =>
            [word.arabic, word.transliteration, word.meaning, word.root, word.category].join(" ").toLowerCase().includes(q),
        ).slice(0, 6).map<Result>((word) => ({
            type: "Arabic",
            title: `${word.transliteration} · ${word.arabic}`,
            body: word.meaning,
            to: "/learn-arabic/vocabulary",
        }));

        const roots = ROOTS.filter((root) =>
            [root.root, root.coreMeaning, root.explanation, root.category, ...root.derivations.map((d) => `${d.arabic} ${d.meaning}`)].join(" ").toLowerCase().includes(q),
        ).slice(0, 4).map<Result>((root) => ({
            type: "Arabic",
            title: `Root ${root.root}`,
            body: root.coreMeaning,
            to: "/learn-arabic/roots",
        }));

        const starters = [...HADITH_STARTERS, ...DUA_STARTERS, ...TOPIC_STARTERS].filter((item) =>
            [item.title, item.body, item.type].join(" ").toLowerCase().includes(q),
        );

        return [...glossary, ...lessons, ...vocab, ...roots, ...starters];
    }, [query]);

    const searchQuran = async () => {
        const q = query.trim();
        if (!q) return;
        setLoadingQuran(true);
        try {
            const res = await fetch(`https://api.quran.com/api/v4/search?q=${encodeURIComponent(q)}&size=8&language=en`);
            const data = await res.json();
            const rows = (data.search?.results || []).slice(0, 8).map((match: any) => ({
                type: "Quran" as const,
                title: `Quran ${match.verse_key}`,
                body: (match.text || "").replace(/<[^>]+>/g, ""),
                to: `/quran?verse=${match.verse_key}`,
            }));
            setQuranResults(rows);
        } finally {
            setLoadingQuran(false);
        }
    };

    const results = [...quranResults, ...localResults];

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_34%),linear-gradient(180deg,#ecfdf5_0%,#ffffff_44%,#f8fafc_100%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_58%,#020617_100%)]">
            <SEO title="Search Mastering Quran" description="Search Quran, hadith, duas, glossary terms, Arabic lessons, and topics from one place." />
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <SearchIcon className="h-4 w-4" />
                        Global search
                    </div>
                    <h1 className="mt-4 text-4xl font-bold text-slate-950 dark:text-white md:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Search everything in one place.
                    </h1>
                </div>

                <Card className="border-emerald-200/80 bg-white/90 shadow-xl shadow-emerald-900/5 dark:border-emerald-900/40 dark:bg-slate-950/70">
                    <CardContent className="p-4">
                        <form
                            className="flex flex-col gap-2 sm:flex-row"
                            onSubmit={(e) => {
                                e.preventDefault();
                                searchQuran();
                            }}
                        >
                            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search mercy, salah, tajweed, patience, 2:255..." className="h-12 rounded-xl bg-white dark:bg-slate-900" />
                            <Button type="submit" className="h-12 rounded-xl">
                                {loadingQuran ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchIcon className="h-4 w-4" />}
                                Search Quran
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {!query.trim() ? (
                    <div className="grid gap-3 md:grid-cols-3">
                        <Starter icon={BookOpen} title="Quran" body="Search verses by English meaning." />
                        <Starter icon={Heart} title="Duas and hadith" body="Find practice-focused reminders." />
                        <Starter icon={GraduationCap} title="Arabic lessons" body="Jump into vocabulary, roots, and lessons." />
                    </div>
                ) : results.length ? (
                    <div className="grid gap-3 md:grid-cols-2">
                        {results.map((result, index) => (
                            <Link key={`${result.type}-${result.title}-${index}`} to={result.to} className="group rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/80">
                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                                    <ResultIcon type={result.type} />
                                    {result.type}
                                </div>
                                <p className="font-semibold text-slate-950 group-hover:text-emerald-800 dark:text-white dark:group-hover:text-emerald-200">{result.title}</p>
                                <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{result.body}</p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-10 text-center text-slate-500">No local matches yet. Try Search Quran for a broader verse search.</CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

function ResultIcon({ type }: { type: Result["type"] }) {
    const Icon = type === "Arabic" ? GraduationCap : type === "Glossary" ? Library : type === "Dua" ? Heart : type === "Topic" ? Sparkles : BookOpen;
    return <Icon className="h-4 w-4" />;
}

function Starter({ icon: Icon, title, body }: { icon: typeof BookOpen; title: string; body: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-900/70">
            <Icon className="h-6 w-6 text-emerald-600" />
            <p className="mt-3 font-semibold text-slate-950 dark:text-white">{title}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{body}</p>
        </div>
    );
}
