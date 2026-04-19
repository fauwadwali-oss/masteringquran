import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Loader2, Search, AlertCircle, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";

const DATA_BASE = "https://cdn.jsdelivr.net/gh/fauwadwali-oss/nwv-islamic-data@main";

interface Collection {
    slug: string;
    name: string;
    arabic: string;
    count: number;
    description: string;
}

const COLLECTIONS: Collection[] = [
    { slug: "bukhari", name: "Sahih al-Bukhari", arabic: "صحيح البخاري", count: 7589, description: "The most rigorously authenticated collection, compiled by Imam al-Bukhari." },
    { slug: "muslim", name: "Sahih Muslim", arabic: "صحيح مسلم", count: 7563, description: "The second most authentic collection, compiled by Imam Muslim ibn al-Hajjaj." },
    { slug: "abudawud", name: "Sunan Abi Dawud", arabic: "سنن أبي داود", count: 5274, description: "Focused on hadith related to legal rulings, compiled by Abu Dawud as-Sijistani." },
    { slug: "tirmidhi", name: "Jami' at-Tirmidhi", arabic: "جامع الترمذي", count: 3998, description: "A comprehensive work with commentary on chains of narration, by Imam at-Tirmidhi." },
    { slug: "nasai", name: "Sunan an-Nasa'i", arabic: "سنن النسائي", count: 5765, description: "Known for its strictness in authentication, compiled by Imam an-Nasa'i." },
    { slug: "ibnmajah", name: "Sunan Ibn Majah", arabic: "سنن ابن ماجه", count: 4343, description: "The sixth of the six canonical collections (Kutub as-Sittah)." },
    { slug: "malik", name: "Muwatta Malik", arabic: "الموطأ", count: 1858, description: "The earliest surviving hadith and fiqh collection, by Imam Malik ibn Anas." },
    { slug: "nawawi", name: "40 Hadith of an-Nawawi", arabic: "الأربعون النووية", count: 42, description: "Imam an-Nawawi's curated 42 foundational hadiths." },
    { slug: "qudsi", name: "40 Hadith Qudsi", arabic: "الأحاديث القدسية", count: 40, description: "Sacred hadiths in which the Prophet ﷺ quotes Allah directly." },
    { slug: "dehlawi", name: "40 Hadith of Shah Waliullah", arabic: "أربعون حديثاً للدهلوي", count: 40, description: "Forty foundational hadiths selected by Shah Waliullah Dehlawi." },
];

interface Hadith {
    hadithnumber: number | string;
    arabicnumber: number | string;
    text: string;
    grades?: Array<{ name?: string; grade?: string }>;
    reference?: { book: number; hadith: number };
}

interface CollectionData {
    metadata: {
        name: string;
        sections?: Record<string, string>;
        section_details?: Record<string, { hadithnumber_first: number; hadithnumber_last: number }>;
    };
    hadiths: Hadith[];
}

const PAGE_SIZE = 10;

export default function Hadith() {
    const [selected, setSelected] = useState<Collection | null>(null);
    const [data, setData] = useState<CollectionData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedBook, setSelectedBook] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (!selected) return;
        setLoading(true);
        setError(null);
        setData(null);
        setPage(1);
        setSelectedBook("all");
        setSearch("");

        fetch(`${DATA_BASE}/hadith/editions/eng-${selected.slug}.min.json`)
            .then(async (r) => {
                if (!r.ok) throw new Error("failed");
                const j: CollectionData = await r.json();
                setData(j);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load this collection. Please try again.");
                setLoading(false);
            });
    }, [selected]);

    // Filter hadiths by book + search
    const filtered = useMemo(() => {
        if (!data) return [] as Hadith[];
        let list = data.hadiths;
        if (selectedBook !== "all") {
            const bookNum = parseInt(selectedBook);
            list = list.filter((h) => h.reference?.book === bookNum);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((h) => h.text?.toLowerCase().includes(q));
        }
        return list;
    }, [data, selectedBook, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Book options
    const bookOptions = useMemo(() => {
        if (!data?.metadata?.sections) return [] as Array<{ value: string; label: string; range: string }>;
        return Object.entries(data.metadata.sections)
            .filter(([k]) => k !== "0" && data.metadata.sections![k])
            .map(([k, v]) => {
                const detail = data.metadata.section_details?.[k];
                const range = detail ? `${detail.hadithnumber_first}–${detail.hadithnumber_last}` : "";
                return { value: k, label: `${k}. ${v}`, range };
            });
    }, [data]);

    useEffect(() => {
        setPage(1);
    }, [selectedBook, search]);

    // === Picker view ===
    if (!selected) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 font-sans">
                <SEO
                    title="Hadith Collections - Mastering Quran"
                    description="Browse authentic English hadith collections including Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud, and more."
                />
                <section className="py-16 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12 space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-full border border-emerald-200 dark:border-emerald-800">
                                <Library className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Authentic Sunnah</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Hadith Collections
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                                Ten canonical English hadith collections, drawn from the six main books (Kutub as-Sittah) and other classical compilations.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {COLLECTIONS.map((c) => (
                                <Card
                                    key={c.slug}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setSelected(c)}
                                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelected(c)}
                                    className="cursor-pointer group relative overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-slate-900"
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/50 dark:to-emerald-900/30 rounded-xl flex items-center justify-center">
                                                <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <Badge variant="secondary" className="text-xs">{c.count.toLocaleString()} hadith</Badge>
                                        </div>
                                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white mt-3">
                                            {c.name}
                                        </CardTitle>
                                        <p className="font-amiri text-lg text-emerald-700 dark:text-emerald-400" dir="rtl">
                                            {c.arabic}
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {c.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <p className="text-center mt-10 text-xs text-slate-500 dark:text-slate-400">
                            Text sourced from the{" "}
                            <a href="https://github.com/fauwadwali-oss/nwv-islamic-data" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                                nwv-islamic-data
                            </a>{" "}
                            mirror of{" "}
                            <a href="https://github.com/fawazahmed0/hadith-api" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                                fawazahmed0/hadith-api
                            </a>.
                        </p>
                    </div>
                </section>
            </div>
        );
    }

    // === Reader view ===
    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 font-sans">
            <SEO
                title={`${selected.name} - Hadith - Mastering Quran`}
                description={`Read ${selected.name} — ${selected.description}`}
            />
            <section className="py-10 px-6">
                <div className="max-w-4xl mx-auto">
                    <Button
                        variant="ghost"
                        className="mb-6 gap-2 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        onClick={() => setSelected(null)}
                    >
                        <ArrowLeft className="h-4 w-4" /> All collections
                    </Button>

                    <div className="text-center mb-10 space-y-2">
                        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {selected.name}
                        </h1>
                        <p className="font-amiri text-2xl md:text-3xl text-emerald-700 dark:text-emerald-400" dir="rtl">
                            {selected.arabic}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {selected.count.toLocaleString()} hadiths
                        </p>
                    </div>

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                            <p className="text-slate-500">Loading collection… (this one is large, it may take a moment)</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-16">
                            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {data && !loading && !error && (
                        <>
                            {/* Controls */}
                            <div className="grid sm:grid-cols-2 gap-4 mb-8">
                                {bookOptions.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Book</label>
                                        <Select value={selectedBook} onValueChange={setSelectedBook}>
                                            <SelectTrigger className="h-11 bg-white dark:bg-slate-800 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[400px]">
                                                <SelectItem value="all">All books ({data.hadiths.length.toLocaleString()} hadiths)</SelectItem>
                                                {bookOptions.map((b) => (
                                                    <SelectItem key={b.value} value={b.value}>
                                                        {b.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Search within collection</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                        <Input
                                            placeholder="e.g. intention, mercy, prayer…"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10 h-11 bg-white dark:bg-slate-800 rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                {filtered.length.toLocaleString()} {filtered.length === 1 ? "result" : "results"}
                                {search ? ` matching "${search}"` : ""}
                            </p>

                            <div className="space-y-4">
                                {pageItems.length === 0 ? (
                                    <Card className="p-12 text-center">
                                        <p className="text-slate-500">No hadiths match this filter.</p>
                                    </Card>
                                ) : (
                                    pageItems.map((h, i) => (
                                        <Card key={`${h.hadithnumber}-${i}`} className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                            <CardContent className="p-6 space-y-3">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className="inline-flex items-center justify-center min-w-10 h-10 px-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
                                                        #{h.hadithnumber}
                                                    </span>
                                                    {h.reference && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Book {h.reference.book} · Hadith {h.reference.hadith}
                                                        </Badge>
                                                    )}
                                                    {Array.isArray(h.grades) && h.grades.length > 0 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {h.grades[0]?.grade || h.grades[0]?.name || "Graded"}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-[15px] whitespace-pre-wrap">
                                                    {h.text}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-10">
                                    <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm text-slate-600 dark:text-slate-400 px-4">
                                        Page {page} of {totalPages}
                                    </span>
                                    <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
