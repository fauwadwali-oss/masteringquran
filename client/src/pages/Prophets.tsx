import { useMemo, useState } from "react";
import { ArrowLeft, Sparkles, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import VerseInline from "@/components/VerseInline";
import ProphetHadithBrowser from "@/components/ProphetHadithBrowser";
import {
    PROPHETS,
    PROPHET_HADITH_TERMS,
    HADITH_NARRATOR_EXCLUSIONS,
    type Prophet,
} from "@/lib/content/prophets";

export default function Prophets() {
    const [selected, setSelected] = useState<Prophet | null>(null);
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        if (!query.trim()) return PROPHETS;
        const q = query.toLowerCase();
        return PROPHETS.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.arabic.includes(query) ||
                (p.people?.toLowerCase().includes(q) ?? false) ||
                (p.title?.toLowerCase().includes(q) ?? false),
        );
    }, [query]);

    if (selected) return <ProphetDetail prophet={selected} onBack={() => setSelected(null)} />;

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-white dark:from-slate-950 dark:to-slate-900 py-10 px-4">
            <SEO
                title="Stories of the 25 Prophets in the Quran, Mastering Quran"
                description="Explore the lives, lessons, and Quranic references of the 25 prophets named in the Quran, from Adam to Muhammad ﷺ."
            />
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider font-semibold">The 25 Named Prophets</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Stories of the Prophets</h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        The 25 messengers named in the Quran, their lives, their people, and the lessons for every believer.
                    </p>
                </div>

                <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by name, people, or title…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    {filtered.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setSelected(p)}
                            className="text-left"
                        >
                            <Card className="border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-md transition-all bg-white dark:bg-slate-900">
                                <CardContent className="p-4 space-y-1.5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">{p.name}</h3>
                                            {p.title && (
                                                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">{p.title}</p>
                                            )}
                                        </div>
                                        <span className="text-xl font-amiri text-emerald-800 dark:text-emerald-300">{p.arabic}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2">{p.summary}</p>
                                    {p.people && (
                                        <p className="text-[11px] text-slate-400 pt-1">
                                            Sent to: <span className="text-slate-600 dark:text-slate-400">{p.people}</span>
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </button>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <p className="text-center text-sm text-slate-500 py-8">No prophets match your search.</p>
                )}
            </div>
        </div>
    );
}

function ProphetDetail({ prophet, onBack }: { prophet: Prophet; onBack: () => void }) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-white dark:from-slate-950 dark:to-slate-900 py-10 px-4">
            <SEO
                title={`${prophet.name} (${prophet.arabic}), Stories of the Prophets`}
                description={prophet.summary}
            />
            <div className="max-w-3xl mx-auto space-y-6">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                >
                    <ArrowLeft className="h-4 w-4" /> All prophets
                </button>

                <Card className="border border-emerald-200 dark:border-emerald-900/40 bg-white dark:bg-slate-900">
                    <CardContent className="p-6 md:p-8 space-y-5">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{prophet.name}</h1>
                                {prophet.title && (
                                    <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">{prophet.title}</p>
                                )}
                            </div>
                            <span className="text-4xl md:text-5xl font-amiri text-emerald-800 dark:text-emerald-300">{prophet.arabic}</span>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs">
                            {prophet.era && (
                                <Badge variant="secondary" className="font-normal">
                                    📅 {prophet.era}
                                </Badge>
                            )}
                            {prophet.people && (
                                <Badge variant="secondary" className="font-normal">
                                    👥 {prophet.people}
                                </Badge>
                            )}
                            {prophet.mainSurah && (
                                <Badge variant="secondary" className="font-normal">
                                    📖 Main surah: {prophet.mainSurah}
                                </Badge>
                            )}
                        </div>

                        <div>
                            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Story</h3>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{prophet.summary}</p>
                        </div>

                        <div>
                            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Lessons</h3>
                            <ul className="space-y-2">
                                {prophet.lessons.map((lesson, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                        <span className="text-emerald-600 mt-0.5">✦</span>
                                        <span>{lesson}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                                Key Verses ({prophet.keyVerses.length})
                            </h3>
                            <div className="space-y-3">
                                {prophet.keyVerses.map((v) => (
                                    <VerseInline key={v} verseKey={v} />
                                ))}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-3">Tap any reference to open the verse in the Quran reader.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Hadith browser, Bukhari / Muslim */}
                <ProphetHadithBrowser
                    prophetId={prophet.id}
                    prophetName={prophet.name}
                    searchTerms={PROPHET_HADITH_TERMS[prophet.id] ?? []}
                    narratorExclusions={HADITH_NARRATOR_EXCLUSIONS[prophet.id] ?? []}
                />
            </div>
        </div>
    );
}
