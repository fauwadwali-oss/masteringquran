import { useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";

interface Name {
    number: number;
    arabic: string;
    transliteration: string;
    english: string;
    meaning?: string;
}

export default function Names() {
    const [names, setNames] = useState<Name[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("https://ummahapi.com/api/asma-ul-husna")
            .then(async (r) => {
                if (!r.ok) throw new Error("failed");
                const d: any = await r.json();
                const list: Name[] = Array.isArray(d.data) ? d.data : d.data?.names || [];
                setNames(list);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load the 99 Names. Please try again.");
                setLoading(false);
            });
    }, []);

    const filtered = useMemo(() => {
        if (!search.trim()) return names;
        const q = search.toLowerCase();
        return names.filter(
            (n) =>
                n.transliteration?.toLowerCase().includes(q) ||
                n.english?.toLowerCase().includes(q) ||
                n.meaning?.toLowerCase().includes(q),
        );
    }, [names, search]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 font-sans">
            <SEO
                title="99 Names of Allah - Mastering Quran"
                description="The Asma ul-Husna — Allah's 99 beautiful names with Arabic, transliteration, English meaning, and reflection."
            />
            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-10 space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 rounded-full border border-amber-200 dark:border-amber-800">
                            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Asma ul-Husna</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                            99 Names of Allah
                        </h1>
                        <p className="font-amiri text-2xl text-amber-700 dark:text-amber-400" dir="rtl">
                            الأسماء الحسنى
                        </p>
                        <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                            Allah ﷻ has the most beautiful names; so call upon Him by them. (Quran 7:180)
                        </p>
                    </div>

                    {/* Search */}
                    <div className="max-w-md mx-auto mb-10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <Input
                                placeholder="Search by transliteration or meaning…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-11 bg-white dark:bg-slate-800 rounded-xl"
                            />
                        </div>
                    </div>

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
                            <p className="text-slate-500">Loading the 99 Names…</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-16">
                            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                {filtered.length} of {names.length} {filtered.length === 1 ? "name" : "names"}
                            </p>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filtered.map((n) => (
                                    <Card
                                        key={n.number}
                                        className="border border-amber-100 dark:border-amber-900/30 bg-gradient-to-br from-white to-amber-50/40 dark:from-slate-900 dark:to-amber-950/10 hover:shadow-lg transition-shadow"
                                    >
                                        <CardContent className="p-5 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-semibold text-xs">
                                                    {n.number}
                                                </span>
                                                <p className="font-amiri text-3xl text-amber-800 dark:text-amber-300 leading-tight" dir="rtl">
                                                    {n.arabic}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white italic">{n.transliteration}</p>
                                                <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">{n.english}</p>
                                            </div>
                                            {n.meaning && (
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                                    {n.meaning}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}

                    <p className="text-center mt-12 text-xs text-slate-500 dark:text-slate-400">
                        Data from{" "}
                        <a href="https://ummahapi.com" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
                            UmmahAPI
                        </a>.
                    </p>
                </div>
            </section>
        </div>
    );
}
