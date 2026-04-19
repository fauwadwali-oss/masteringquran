import { useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle, Search, BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SEO from "@/components/SEO";

interface Category {
    id: string;
    name: string;
    description: string;
    count: number;
}

interface Dua {
    id: number;
    title: string;
    category: string;
    arabic: string;
    transliteration: string;
    translation: string;
    source?: string;
    repeat?: number;
}

export default function Duas() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selected, setSelected] = useState<Category | null>(null);
    const [duas, setDuas] = useState<Dua[]>([]);
    const [loadingCats, setLoadingCats] = useState(true);
    const [loadingDuas, setLoadingDuas] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("https://ummahapi.com/api/duas/categories")
            .then(async (r) => {
                if (!r.ok) throw new Error("failed");
                const d: any = await r.json();
                setCategories(d.data?.categories || []);
                setLoadingCats(false);
            })
            .catch(() => {
                setError("Failed to load categories. Please try again.");
                setLoadingCats(false);
            });
    }, []);

    useEffect(() => {
        if (!selected) return;
        setLoadingDuas(true);
        setDuas([]);
        setSearch("");
        fetch(`https://ummahapi.com/api/duas/category/${encodeURIComponent(selected.id)}`)
            .then(async (r) => {
                if (!r.ok) throw new Error("failed");
                const d: any = await r.json();
                setDuas(d.data?.duas || []);
                setLoadingDuas(false);
            })
            .catch(() => {
                setError("Failed to load duas from this category.");
                setLoadingDuas(false);
            });
    }, [selected]);

    const filteredCats = useMemo(() => {
        if (!search.trim() || selected) return categories;
        const q = search.toLowerCase();
        return categories.filter(
            (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q),
        );
    }, [categories, search, selected]);

    const filteredDuas = useMemo(() => {
        if (!search.trim()) return duas;
        const q = search.toLowerCase();
        return duas.filter(
            (d) =>
                d.title?.toLowerCase().includes(q) ||
                d.translation?.toLowerCase().includes(q) ||
                d.transliteration?.toLowerCase().includes(q),
        );
    }, [duas, search]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-teal-50/30 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 font-sans">
            <SEO
                title={selected ? `${selected.name} - Duas - Mastering Quran` : "Duas - Mastering Quran"}
                description="Authentic supplications (duas) from the Quran and Sunnah across 27 categories: morning adhkar, evening adhkar, wudu, travel, food, sleep, and more."
            />
            <section className="py-12 px-6">
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

                    <div className="text-center mb-8 space-y-2">
                        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {selected ? selected.name : "Duas & Supplications"}
                        </h1>
                        {selected ? (
                            <p className="text-slate-600 dark:text-slate-300">{selected.description}</p>
                        ) : (
                            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                                126 authentic supplications from the Quran and Sunnah across 27 categories.
                            </p>
                        )}
                    </div>

                    {/* Search */}
                    <div className="max-w-md mx-auto mb-8">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <Input
                                placeholder={selected ? "Search duas by word…" : "Search categories…"}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-11 bg-white dark:bg-slate-800 rounded-xl"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-center py-12">
                            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Category picker */}
                    {!selected && (
                        <>
                            {loadingCats ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3">
                                    <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
                                    <p className="text-slate-500">Loading categories…</p>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredCats.map((c) => (
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
                                                    <span className="text-xs text-slate-400 font-mono">{c.count} duas</span>
                                                </div>
                                                <CardTitle className="text-lg font-semibold mt-2">{c.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <CardDescription className="text-sm">{c.description}</CardDescription>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Dua list */}
                    {selected && (
                        <>
                            {loadingDuas ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3">
                                    <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
                                    <p className="text-slate-500">Loading duas…</p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {filteredDuas.length === 0 ? (
                                        <Card className="p-12 text-center">
                                            <p className="text-slate-500">No duas match this filter.</p>
                                        </Card>
                                    ) : (
                                        filteredDuas.map((d) => (
                                            <Card key={d.id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                <CardContent className="p-6 space-y-4">
                                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{d.title}</h3>
                                                        {d.repeat && d.repeat > 1 && (
                                                            <span className="text-xs bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 px-2 py-1 rounded-full border border-teal-200 dark:border-teal-900/40">
                                                                Repeat ×{d.repeat}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="font-amiri text-2xl md:text-3xl leading-loose text-slate-900 dark:text-slate-100 text-right" dir="rtl">
                                                        {d.arabic}
                                                    </p>
                                                    <p className="text-sm italic text-slate-500 dark:text-slate-400">{d.transliteration}</p>
                                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{d.translation}</p>
                                                    {d.source && (
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-mono pt-2 border-t border-slate-100 dark:border-slate-800">
                                                            Source: {d.source}
                                                        </p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    <p className="text-center mt-12 text-xs text-slate-500 dark:text-slate-400">
                        Data from{" "}
                        <a href="https://ummahapi.com" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                            UmmahAPI
                        </a>.
                    </p>
                </div>
            </section>
        </div>
    );
}
