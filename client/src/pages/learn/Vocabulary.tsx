import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen, Shuffle, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LessonLayout from "@/components/LessonLayout";
import ArabicAudioButton from "@/components/ArabicAudioButton";
import { cn } from "@/lib/utils";
import { VOCAB_WORDS, VOCAB_CATEGORIES, type VocabCategory, type VocabWord } from "@/lib/content/quranic-vocab";

type Tab = "browse" | "flashcards";
type FilterCategory = VocabCategory | "All";

export default function LearnVocabulary() {
    const [tab, setTab] = useState<Tab>("browse");
    const [filter, setFilter] = useState<FilterCategory>("All");
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return VOCAB_WORDS.filter((w) => {
            if (filter !== "All" && w.category !== filter) return false;
            if (!q) return true;
            return (
                w.transliteration.toLowerCase().includes(q) ||
                w.meaning.toLowerCase().includes(q) ||
                w.arabic.includes(query) ||
                (w.root ?? "").includes(query)
            );
        });
    }, [filter, query]);

    return (
        <LessonLayout lessonId="vocabulary">
            <Card>
                <CardContent className="p-5 space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <p>
                        This is the vocabulary core of the Quran. Studies of word frequency (e.g. at the{" "}
                        <a href="https://corpus.quran.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-emerald-400 hover:underline">
                            Quranic Arabic Corpus
                        </a>
                        ) show that the top ~200 words cover roughly <strong>70% of the Quran by count</strong>. Learn these and most of what you read will have a familiar anchor.
                    </p>
                    <p>
                        Words are grouped into 11 themes. Most have a trilateral <strong>root</strong>, the 3-letter skeleton from which every related word is derived (you'll see the root everywhere once you start noticing them).
                    </p>
                </CardContent>
            </Card>

            {/* Mode switcher */}
            <div className="flex justify-center">
                <div className="inline-flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
                    {(["browse", "flashcards"] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={cn(
                                "px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                                tab === t
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "text-slate-600 dark:text-slate-400 hover:text-emerald-600",
                            )}
                        >
                            {t === "browse" ? "Browse all" : "Flashcards"}
                        </button>
                    ))}
                </div>
            </div>

            {tab === "browse" ? (
                <BrowseMode filtered={filtered} filter={filter} setFilter={setFilter} query={query} setQuery={setQuery} />
            ) : (
                <FlashcardMode words={filtered.length ? filtered : VOCAB_WORDS} />
            )}
        </LessonLayout>
    );
}

// ────────────────────────────────────────────────────────────────────────
// Browse mode
// ────────────────────────────────────────────────────────────────────────
function BrowseMode({
    filtered, filter, setFilter, query, setQuery,
}: {
    filtered: VocabWord[];
    filter: FilterCategory;
    setFilter: (v: FilterCategory) => void;
    query: string;
    setQuery: (v: string) => void;
}) {
    return (
        <>
            {/* Search + filter */}
            <Card>
                <CardContent className="p-4 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by Arabic, transliteration, meaning, or root..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {(["All", ...VOCAB_CATEGORIES] as FilterCategory[]).map((c) => (
                            <button
                                key={c}
                                onClick={() => setFilter(c)}
                                className={cn(
                                    "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border",
                                    filter === c
                                        ? "bg-emerald-600 text-white border-emerald-600"
                                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-emerald-300",
                                )}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <p className="text-center text-xs text-slate-500">
                Showing {filtered.length} of {VOCAB_WORDS.length} words
            </p>

            {/* Word grid */}
            <div className="grid gap-3 sm:grid-cols-2">
                {filtered.map((w) => (
                    <Card key={w.id} className="border border-slate-200 dark:border-slate-800 hover:border-emerald-300 transition-colors">
                        <CardContent className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="font-amiri text-3xl text-slate-900 dark:text-white" dir="rtl">{w.arabic}</p>
                                    <p className="text-xs italic text-slate-500 mt-0.5">{w.transliteration}</p>
                                </div>
                                <ArabicAudioButton text={w.arabic} size="md" />
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{w.meaning}</p>
                            <div className="flex items-center justify-between gap-2 text-[10px] pt-1 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-slate-400">
                                    {w.root && <>Root: <span className="font-amiri text-sm text-emerald-700 dark:text-emerald-400" dir="rtl">{w.root}</span></>}
                                </span>
                                {w.exampleVerse && (
                                    <Link
                                        to={`/quran?verse=${w.exampleVerse}`}
                                        className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline"
                                    >
                                        <BookOpen className="h-3 w-3" /> {w.exampleVerse}
                                    </Link>
                                )}
                            </div>
                            {w.notes && (
                                <p className="text-[11px] text-slate-500 italic leading-relaxed border-l-2 border-emerald-200 dark:border-emerald-900 pl-2 mt-2">
                                    {w.notes}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filtered.length === 0 && (
                <p className="text-center text-sm text-slate-500 py-8">No words match.</p>
            )}
        </>
    );
}

// ────────────────────────────────────────────────────────────────────────
// Flashcard mode
// ────────────────────────────────────────────────────────────────────────
function FlashcardMode({ words }: { words: VocabWord[] }) {
    const [deck, setDeck] = useState(() => [...words].sort(() => Math.random() - 0.5));
    const [idx, setIdx] = useState(0);
    const [flipped, setFlipped] = useState(false);

    const current = deck[idx];

    const next = () => {
        setFlipped(false);
        setIdx((i) => (i + 1) % deck.length);
    };
    const prev = () => {
        setFlipped(false);
        setIdx((i) => (i - 1 + deck.length) % deck.length);
    };
    const shuffle = () => {
        setDeck([...words].sort(() => Math.random() - 0.5));
        setIdx(0);
        setFlipped(false);
    };

    if (!current) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                    Card {idx + 1} of {deck.length} · {current.category}
                </p>
                <Button variant="outline" size="sm" onClick={shuffle}>
                    <Shuffle className="h-3.5 w-3.5" /> Shuffle
                </Button>
            </div>

            <Card
                onClick={() => setFlipped((f) => !f)}
                className="border-2 border-emerald-200 dark:border-emerald-900/40 cursor-pointer bg-gradient-to-br from-emerald-50/60 to-white dark:from-emerald-950/20 dark:to-slate-900 select-none"
            >
                <CardContent className="p-10 min-h-[240px] flex flex-col items-center justify-center gap-4 text-center">
                    {!flipped ? (
                        <>
                            <p className="font-amiri text-7xl text-slate-900 dark:text-white leading-none" dir="rtl">
                                {current.arabic}
                            </p>
                            <p className="text-xs text-slate-400 italic">tap to reveal</p>
                        </>
                    ) : (
                        <>
                            <p className="font-amiri text-5xl text-slate-900 dark:text-white" dir="rtl">{current.arabic}</p>
                            <div>
                                <p className="text-sm italic text-slate-500">{current.transliteration}</p>
                                <p className="text-xl font-semibold text-slate-900 dark:text-white mt-1">{current.meaning}</p>
                            </div>
                            {current.root && (
                                <p className="text-xs text-slate-500">Root: <span className="font-amiri text-lg text-emerald-700 dark:text-emerald-400" dir="rtl">{current.root}</span></p>
                            )}
                            <div className="flex items-center gap-3 pt-2">
                                <div onClick={(e) => e.stopPropagation()}>
                                    <ArabicAudioButton text={current.arabic} size="lg" />
                                </div>
                                {current.exampleVerse && (
                                    <Link
                                        to={`/quran?verse=${current.exampleVerse}`}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <BookOpen className="h-3 w-3" /> See in Quran ({current.exampleVerse})
                                    </Link>
                                )}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="flex items-center justify-between gap-3">
                <Button variant="outline" onClick={prev}>← Previous</Button>
                <Button variant="ghost" size="sm" onClick={() => setFlipped(false)} className="text-slate-500">
                    <RotateCcw className="h-3.5 w-3.5" /> Reset flip
                </Button>
                <Button onClick={next}>Next →</Button>
            </div>
        </div>
    );
}
