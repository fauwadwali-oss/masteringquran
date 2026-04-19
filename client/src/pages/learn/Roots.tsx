import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import LessonLayout from "@/components/LessonLayout";
import ArabicAudioButton from "@/components/ArabicAudioButton";
import { cn } from "@/lib/utils";
import { ROOTS, type ArabicRoot } from "@/lib/content/arabic-roots";

const CATEGORIES = [
    "All",
    "Worship",
    "Divine Attributes",
    "Knowledge & Speech",
    "Character",
    "Action",
    "Perception",
    "Body & Self",
    "Creation",
] as const;

export default function LearnRoots() {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
    const [expandedId, setExpandedId] = useState<string | null>(ROOTS[0]?.id ?? null);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return ROOTS.filter((r) => {
            if (category !== "All" && r.category !== category) return false;
            if (!q) return true;
            return (
                r.root.includes(query) ||
                r.coreMeaning.toLowerCase().includes(q) ||
                r.explanation.toLowerCase().includes(q) ||
                r.derivations.some(
                    (d) =>
                        d.transliteration.toLowerCase().includes(q) ||
                        d.meaning.toLowerCase().includes(q) ||
                        d.arabic.includes(query),
                )
            );
        });
    }, [query, category]);

    return (
        <LessonLayout lessonId="roots">
            <Card>
                <CardContent className="p-5 space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <p>
                        Every Arabic word is built from a <strong>3-letter root</strong> (sometimes 4). Once you see the root, dozens of related words make sudden sense, kataba (he wrote), kitab (book), katib (writer), maktaba (library), maktub (written), all from ك-ت-ب.
                    </p>
                    <p>
                        This is why Arabic is said to have an algebra. The root is the variable; <strong>vowel patterns</strong> (called 'wazn') are the operations. Fill in any root into a known pattern and you produce a predictable word.
                    </p>
                    <p>
                        Below are {ROOTS.length} of the most pedagogically useful Quranic roots. Tap any card to see every derivation we've indexed, with an example verse for each. Mastering these roots unlocks a huge portion of Quranic language.
                    </p>
                </CardContent>
            </Card>

            {/* Search + filter */}
            <Card>
                <CardContent className="p-4 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search root, meaning, or derived word..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {CATEGORIES.map((c) => (
                            <button
                                key={c}
                                onClick={() => setCategory(c)}
                                className={cn(
                                    "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border",
                                    category === c
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
                Showing {filtered.length} of {ROOTS.length} roots
            </p>

            {/* Root cards */}
            <div className="space-y-3">
                {filtered.map((r) => (
                    <RootCard
                        key={r.id}
                        root={r}
                        expanded={expandedId === r.id}
                        onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    />
                ))}
            </div>

            {filtered.length === 0 && (
                <p className="text-center text-sm text-slate-500 py-8">No roots match your search.</p>
            )}
        </LessonLayout>
    );
}

function RootCard({
    root, expanded, onToggle,
}: {
    root: ArabicRoot;
    expanded: boolean;
    onToggle: () => void;
}) {
    return (
        <Card
            className={cn(
                "border transition-all bg-white dark:bg-slate-900",
                expanded ? "border-emerald-300 dark:border-emerald-800 shadow-md" : "border-slate-200 dark:border-slate-800",
            )}
        >
            <button onClick={onToggle} className="w-full text-left">
                <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-start gap-4">
                            <span className="font-amiri text-4xl text-emerald-700 dark:text-emerald-400 leading-none" dir="rtl">
                                {root.root}
                            </span>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    {root.category}
                                </p>
                                <p className="font-semibold text-slate-900 dark:text-white">{root.coreMeaning}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {root.derivations.length} derivations
                                    {root.quranCount && ` · appears ~${root.quranCount} times in the Quran`}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </button>

            {expanded && (
                <div className="px-5 pb-5 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{root.explanation}</p>

                    <div className="space-y-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> Derivations
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {root.derivations.map((d, i) => (
                                <div
                                    key={i}
                                    className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-amiri text-xl text-slate-900 dark:text-white" dir="rtl">{d.arabic}</p>
                                            <p className="text-[11px] italic text-slate-500">{d.transliteration}</p>
                                        </div>
                                        <ArabicAudioButton text={d.arabic} size="sm" />
                                    </div>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">{d.meaning}</p>
                                    <div className="flex items-center justify-between gap-2 text-[10px] mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                                        {d.form && (
                                            <span className="text-slate-400 italic">{d.form}</span>
                                        )}
                                        {d.exampleVerse && (
                                            <Link
                                                to={`/quran?verse=${d.exampleVerse}`}
                                                className="inline-flex items-center gap-0.5 text-emerald-700 dark:text-emerald-400 hover:underline"
                                            >
                                                <BookOpen className="h-2.5 w-2.5" /> {d.exampleVerse}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
