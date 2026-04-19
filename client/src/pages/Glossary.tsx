import { useMemo, useState } from "react";
import { Search, BookMarked, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import SEO from "@/components/SEO";
import { GLOSSARY, type GlossaryCategory, type GlossaryTerm } from "@/lib/content/glossary";

const CATEGORIES: (GlossaryCategory | "All")[] = [
    "All",
    "Pillars & Worship",
    "Theology",
    "Quran & Revelation",
    "Prayer & Rites",
    "Ethics & Character",
    "Jurisprudence",
    "Community & Society",
    "Eschatology",
    "Daily Practice",
    "Seerah & History",
];

export default function Glossary() {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<GlossaryCategory | "All">("All");
    const [selected, setSelected] = useState<GlossaryTerm | null>(null);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return GLOSSARY.filter((t) => {
            if (category !== "All" && t.category !== category) return false;
            if (!q) return true;
            return (
                t.term.toLowerCase().includes(q) ||
                t.arabic.includes(query) ||
                t.definition.toLowerCase().includes(q) ||
                t.id.includes(q)
            );
        }).sort((a, b) => a.term.localeCompare(b.term));
    }, [query, category]);

    const termById = (id: string) => GLOSSARY.find((t) => t.id === id);

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-white dark:from-slate-950 dark:to-slate-900 py-10 px-4">
            <SEO
                title="Islamic Glossary — Mastering Quran"
                description="A searchable glossary of over 120 Islamic terms — from Shahadah to Zakat, Tawhid to Tashahhud — with Arabic, transliteration, and clear definitions."
            />
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <BookMarked className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider font-semibold">Glossary</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Islamic Glossary</h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        {GLOSSARY.length} terms covering worship, theology, fiqh, ethics, and daily practice.
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="relative max-w-lg mx-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search term, Arabic, or definition…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                                    category === cat
                                        ? "bg-emerald-600 text-white border-emerald-600"
                                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-emerald-300",
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="text-center text-xs text-slate-500">
                    Showing {filtered.length} of {GLOSSARY.length} terms
                </p>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((t) => (
                        <button key={t.id} onClick={() => setSelected(t)} className="text-left">
                            <Card className="border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-md transition-all bg-white dark:bg-slate-900 h-full">
                                <CardContent className="p-4 space-y-1.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{t.term}</h3>
                                        <span className="text-lg font-amiri text-emerald-800 dark:text-emerald-300 leading-none">
                                            {t.arabic}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{t.definition}</p>
                                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium pt-1">
                                        {t.category}
                                    </p>
                                </CardContent>
                            </Card>
                        </button>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <p className="text-center text-sm text-slate-500 py-8">No terms match your search.</p>
                )}
            </div>

            {selected && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-150"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-5 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 space-y-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selected.term}</h2>
                                    {selected.plural && (
                                        <p className="text-xs text-slate-500 mt-0.5">plural: {selected.plural}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-3xl font-amiri text-emerald-800 dark:text-emerald-300 text-right leading-tight">
                                {selected.arabic}
                            </p>
                            <Badge variant="secondary" className="font-normal text-xs">
                                {selected.category}
                            </Badge>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selected.definition}</p>
                            {selected.relatedTerms && selected.relatedTerms.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                        Related terms
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selected.relatedTerms
                                            .map(termById)
                                            .filter((t): t is GlossaryTerm => !!t)
                                            .map((rt) => (
                                                <button
                                                    key={rt.id}
                                                    onClick={() => setSelected(rt)}
                                                    className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-100 transition-colors"
                                                >
                                                    {rt.term}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
