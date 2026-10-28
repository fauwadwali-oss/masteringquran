import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, BookOpen, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import { DUAS, DUA_CATEGORIES, searchDuas, type Dua, type DuaCategory } from "@/lib/islamic-data";

// Dua categories that have a matching adhkar routine with a counter.
const ROUTINE_FOR_CATEGORY: Record<string, string> = { "morning-evening": "morning", sleep: "sleep", prayer: "salah" };

function DuaCard({ d, showCategory }: { d: Dua; showCategory?: boolean }) {
    const category = DUA_CATEGORIES.find((c) => c.id === d.category);
    return (
        <Card id={d.id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 scroll-mt-24">
            <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{d.title}</h3>
                    <div className="flex flex-wrap gap-2">
                        {showCategory && category && (
                            <span className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                {category.name}
                            </span>
                        )}
                        {d.count && d.count > 1 && (
                            <span className="text-xs bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 px-2 py-1 rounded-full border border-teal-200 dark:border-teal-900/40">
                                ×{d.count}
                            </span>
                        )}
                    </div>
                </div>
                <p className="font-amiri text-2xl md:text-3xl leading-loose text-slate-900 dark:text-slate-100 text-right" dir="rtl" lang="ar">
                    {d.arabic}
                </p>
                {d.transliteration && <p className="text-sm italic text-slate-500 dark:text-slate-400">{d.transliteration}</p>}
                {d.translation && <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{d.translation}</p>}
                <div className="space-y-1 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-teal-700 hover:underline dark:text-teal-400">
                            {d.reference} <ExternalLink className="h-3 w-3" aria-hidden />
                        </a>
                        {d.gradingDiffers && (
                            <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                Grading differs
                            </span>
                        )}
                    </p>
                    {d.grades.length > 0 && <p>Grades: {d.grades.join(" · ")}</p>}
                    <p>
                        {d.translation ? "English" : "Transliteration"} quoted from the {d.englishEdition}.
                        {!d.translation && " That translation gives this dua in transliteration only."}
                        {d.narrationOmitted && " The … marks a narrator's comment left out."}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export default function Duas() {
    const [params, setParams] = useSearchParams();
    const targetCategory = params.get("category");
    const targetDua = params.get("dua");
    const selected = DUA_CATEGORIES.find((c) => c.id === targetCategory) ?? null;
    const setSelected = (category: DuaCategory | null) => setParams(category ? { category: category.id } : {});
    const [search, setSearch] = useState("");

    const counts = useMemo(() => {
        const m = new Map<string, number>();
        for (const d of DUAS) m.set(d.category, (m.get(d.category) ?? 0) + 1);
        return m;
    }, []);

    const globalResults = useMemo(() => (selected ? [] : searchDuas(search)), [search, selected]);

    const categoryDuas = useMemo(() => {
        if (!selected) return [];
        const inCategory = DUAS.filter((d) => d.category === selected.id);
        if (targetDua) {
            const one = inCategory.filter((d) => d.id === targetDua);
            if (one.length) return one;
        }
        if (!search.trim()) return inCategory;
        const ids = new Set(searchDuas(search).map((d) => d.id));
        return inCategory.filter((d) => ids.has(d.id));
    }, [selected, targetDua, search]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50/30 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 font-sans">
            <SEO
                title={selected ? `${selected.name} - Duas - Mastering Quran` : "Duas from the Quran and Sunnah - Mastering Quran"}
                description={`${DUAS.length} supplications quoted exactly from the Quran and the hadith collections, each with its reference and grading.`}
            />
            <section className="py-12 px-4 md:px-6">
                <div className="max-w-4xl mx-auto">
                    {selected && (
                        <Button
                            variant="ghost"
                            className="mb-6 gap-2 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30"
                            onClick={() => {
                                setSelected(null);
                                setSearch("");
                            }}
                        >
                            <ArrowLeft className="h-4 w-4" /> All categories
                        </Button>
                    )}

                    <div className="mb-8">
                        <PageHero
                            eyebrow={selected ? "Dua category" : "Daily supplications"}
                            title={selected ? selected.name : "Duas & Supplications"}
                            description={
                                selected
                                    ? `${counts.get(selected.id) ?? 0} duas, each quoted from its source.`
                                    : `${DUAS.length} supplications quoted exactly from the Quran and the hadith collections, each with its reference.`
                            }
                            icon={BookOpen}
                            accent="teal"
                        />
                    </div>

                    {(!selected || ROUTINE_FOR_CATEGORY[selected.id]) && (
                        <Link
                            to={selected ? `/adhkar?routine=${ROUTINE_FOR_CATEGORY[selected.id]}` : "/adhkar"}
                            className="mb-6 flex min-h-11 items-center justify-between gap-3 rounded-xl border border-teal-200 bg-teal-50/60 px-4 py-3 text-sm text-teal-800 hover:border-teal-400 dark:border-teal-900/40 dark:bg-teal-950/30 dark:text-teal-300"
                        >
                            <span>Say the daily adhkar one at a time, with a counter for each.</span>
                            <span className="shrink-0 font-semibold">Open adhkar routines</span>
                        </Link>
                    )}

                    {targetDua && selected && (
                        <button onClick={() => setSelected(selected)} className="mb-4 min-h-11 font-semibold text-teal-700 dark:text-teal-300 hover:underline">
                            Browse all {selected.name} duas
                        </button>
                    )}

                    <div className="max-w-md mx-auto mb-8">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <Input
                                placeholder={selected ? "Search these duas…" : "Search all duas, e.g. sleep, travel, forgiveness…"}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-11 bg-white dark:bg-slate-800 rounded-xl"
                            />
                        </div>
                    </div>

                    {!selected &&
                        (search.trim() ? (
                            <>
                                <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                                    {globalResults.length} {globalResults.length === 1 ? "dua matches" : "duas match"} "{search}"
                                </p>
                                {globalResults.length === 0 && (
                                    <Card className="p-12 text-center">
                                        <p className="text-slate-500">No duas match this search. Try different words or browse the categories.</p>
                                    </Card>
                                )}
                                <div className="space-y-4">
                                    {globalResults.map((d) => (
                                        <DuaCard key={d.id} d={d} showCategory />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {DUA_CATEGORIES.map((c) => (
                                    <Card
                                        key={c.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setSelected(c)}
                                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelected(c)}
                                        className="cursor-pointer group border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-teal-400 dark:hover:border-teal-500 transition-all hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                                                    <BookOpen className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                                </div>
                                                <span className="text-xs text-slate-400">{counts.get(c.id) ?? 0} duas</span>
                                            </div>
                                            <CardTitle className="text-lg font-semibold mt-2">{c.name}</CardTitle>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        ))}

                    {selected && (
                        <div className="space-y-5">
                            {categoryDuas.length === 0 ? (
                                <Card className="p-12 text-center">
                                    <p className="text-slate-500">No duas match this filter.</p>
                                </Card>
                            ) : (
                                categoryDuas.map((d) => <DuaCard key={d.id} d={d} />)
                            )}
                        </div>
                    )}

                    <p className="text-center mt-12 text-xs leading-relaxed text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        Every Arabic, English and transliteration text is quoted exactly from its source: the Quran (Uthmani text, Saheeh International) and the hadith editions of fawazahmed0/hadith-api (public domain). English editions use their own wording; grades are shown as recorded in those editions.
                    </p>
                </div>
            </section>
        </div>
    );
}
