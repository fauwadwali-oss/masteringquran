import { useEffect, useMemo, useState } from "react";
import { Loader2, ExternalLink, BookOpen, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Same CDN the Hadith page uses.
const DATA_BASE = "https://cdn.jsdelivr.net/gh/fauwadwali-oss/nwv-islamic-data@main";

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
    };
    hadiths: Hadith[];
}

type CollectionSlug = "bukhari" | "muslim" | "both";

// Module-level cache so the large JSONs are fetched at most once per session.
const COLLECTION_CACHE = new Map<string, CollectionData>();
const INFLIGHT = new Map<string, Promise<CollectionData>>();

async function loadCollection(slug: "bukhari" | "muslim"): Promise<CollectionData> {
    const cached = COLLECTION_CACHE.get(slug);
    if (cached) return cached;
    const inflight = INFLIGHT.get(slug);
    if (inflight) return inflight;
    const p = (async () => {
        const r = await fetch(`${DATA_BASE}/hadith/editions/eng-${slug}.min.json`);
        if (!r.ok) throw new Error(`Failed to load ${slug}`);
        const data: CollectionData = await r.json();
        COLLECTION_CACHE.set(slug, data);
        return data;
    })();
    INFLIGHT.set(slug, p);
    try {
        return await p;
    } finally {
        INFLIGHT.delete(slug);
    }
}

// Case-insensitive whole-word-ish match. We use simple substring matching because
// the JSON payload doesn't tokenize — but wrap the hits with HTML-safe highlighting.
function matchesAnyTerm(text: string, terms: string[]): boolean {
    if (!text) return false;
    const lo = text.toLowerCase();
    return terms.some((t) => lo.includes(t.toLowerCase()));
}

function isNarratorOnly(text: string, exclusions: string[], searchTerms: string[]): boolean {
    if (!exclusions.length) return false;
    const hits = exclusions.filter((ex) => text.includes(ex));
    if (!hits.length) return false;
    // If the text contains an exclusion phrase but no search term OUTSIDE that phrase,
    // it's narrator-only noise. Rough heuristic: strip out exclusion phrases and see
    // if any search term still matches in the remainder.
    let remainder = text;
    for (const ex of hits) {
        remainder = remainder.split(ex).join("");
    }
    return !matchesAnyTerm(remainder, searchTerms);
}

function highlightTerms(text: string, terms: string[]): string {
    // Return plain text with <mark> around each term match. For rendering we'll
    // feed this into dangerouslySetInnerHTML — safe because text is from our
    // trusted CDN JSON and we don't inject user input here.
    let out = text;
    // Sort by length desc so longer phrases match first
    const sorted = [...terms].sort((a, b) => b.length - a.length);
    for (const t of sorted) {
        const re = new RegExp(`(${escapeRegExp(t)})`, "gi");
        out = out.replace(
            re,
            '<mark class="bg-emerald-200/80 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-200 rounded px-0.5">$1</mark>',
        );
    }
    return out;
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Grade badge color based on common classifications in fawazahmed0's data.
function gradeBadge(grade?: string): { label: string; color: string } | null {
    if (!grade) return null;
    const g = grade.toLowerCase();
    if (g.includes("sahih") || g.includes("authentic")) return { label: grade, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" };
    if (g.includes("hasan") || g.includes("good")) return { label: grade, color: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300" };
    if (g.includes("daif") || g.includes("da'if") || g.includes("weak")) return { label: grade, color: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" };
    return { label: grade, color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" };
}

interface Props {
    prophetId: string;
    prophetName: string;
    searchTerms: string[];               // e.g. ["Abraham", "Ibrahim"]
    narratorExclusions?: string[];       // e.g. ["Abu Musa"]
}

const PAGE_SIZE = 8;

export default function ProphetHadithBrowser({
    prophetId,
    prophetName,
    searchTerms,
    narratorExclusions = [],
}: Props) {
    // Special case flag: Muhammad ﷺ appears in virtually every hadith as the narrator.
    // For him, we render a "browse all collections" card instead of filtered results.
    const isMuhammadCase = prophetId === "muhammad" || !searchTerms.length;

    const [collection, setCollection] = useState<CollectionSlug>("bukhari");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [bukhariData, setBukhariData] = useState<CollectionData | null>(null);
    const [muslimData, setMuslimData] = useState<CollectionData | null>(null);
    const [page, setPage] = useState(1);

    // Load the selected collection(s). Skip for Muhammad case since we won't use the data.
    useEffect(() => {
        if (isMuhammadCase) return;
        let cancelled = false;
        setLoading(true);
        setErr(null);
        setPage(1);
        const needed: Array<"bukhari" | "muslim"> =
            collection === "both" ? ["bukhari", "muslim"] :
            collection === "bukhari" ? ["bukhari"] : ["muslim"];
        Promise.all(needed.map(loadCollection))
            .then((datas) => {
                if (cancelled) return;
                needed.forEach((slug, i) => {
                    if (slug === "bukhari") setBukhariData(datas[i]);
                    if (slug === "muslim") setMuslimData(datas[i]);
                });
                setLoading(false);
            })
            .catch(() => {
                if (!cancelled) {
                    setErr("Couldn't load the hadith collections. Try again later.");
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [collection, isMuhammadCase]);

    // Filter hadiths by search terms in text, excluding narrator-only matches
    const matches = useMemo(() => {
        const out: Array<{ collection: "bukhari" | "muslim"; h: Hadith }> = [];
        if (isMuhammadCase) return out;
        const push = (data: CollectionData | null, slug: "bukhari" | "muslim") => {
            if (!data) return;
            for (const h of data.hadiths) {
                if (!matchesAnyTerm(h.text, searchTerms)) continue;
                if (isNarratorOnly(h.text, narratorExclusions, searchTerms)) continue;
                out.push({ collection: slug, h });
            }
        };
        if (collection === "bukhari" || collection === "both") push(bukhariData, "bukhari");
        if (collection === "muslim" || collection === "both") push(muslimData, "muslim");
        return out;
    }, [collection, bukhariData, muslimData, searchTerms, narratorExclusions, isMuhammadCase]);

    // After all hooks, we can early-return for the Muhammad case.
    if (isMuhammadCase) {
        return (
            <Card className="border border-indigo-200 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/40 to-white dark:from-indigo-950/20 dark:to-slate-900">
                <CardContent className="p-5 space-y-2">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-indigo-600" />
                        <h3 className="font-semibold text-slate-900 dark:text-white">Hadiths from Prophet Muhammad ﷺ</h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Every authenticated hadith is a narration from the Prophet Muhammad ﷺ. Browse the full collections of Sahih al-Bukhari and Sahih Muslim, over 15,000 hadiths combined, organized by book and chapter.
                    </p>
                    <div className="flex gap-2 pt-2 flex-wrap">
                        <a
                            href="/hadith"
                            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-700 dark:text-indigo-400 hover:underline"
                        >
                            Open all collections <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
    const pageItems = matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <Card className="border border-indigo-200 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/40 to-white dark:from-indigo-950/20 dark:to-slate-900">
            <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-indigo-600" />
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                            Hadiths mentioning {prophetName}
                        </h3>
                    </div>
                    <Select value={collection} onValueChange={(v: CollectionSlug) => setCollection(v)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bukhari">Sahih al-Bukhari</SelectItem>
                            <SelectItem value="muslim">Sahih Muslim</SelectItem>
                            <SelectItem value="both">Both collections</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <p className="text-xs text-slate-500">
                    Searching: {searchTerms.join(", ")}
                </p>

                {loading && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 py-6 justify-center">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading hadith collection...
                    </div>
                )}

                {err && (
                    <div className="flex items-center gap-2 text-sm text-rose-600 py-4">
                        <AlertCircle className="h-4 w-4" /> {err}
                    </div>
                )}

                {!loading && !err && matches.length === 0 && (
                    <p className="text-sm text-slate-500 py-4 text-center">
                        No hadiths found mentioning {prophetName} in this collection.
                    </p>
                )}

                {!loading && !err && matches.length > 0 && (
                    <>
                        <p className="text-xs text-slate-500">
                            Found <strong>{matches.length}</strong> hadith{matches.length === 1 ? "" : "s"}.
                            Showing {(page - 1) * PAGE_SIZE + 1},{Math.min(page * PAGE_SIZE, matches.length)}.
                        </p>
                        <div className="space-y-3">
                            {pageItems.map(({ collection: c, h }) => (
                                <HadithCard
                                    key={`${c}-${h.hadithnumber}`}
                                    collection={c}
                                    hadith={h}
                                    searchTerms={searchTerms}
                                />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" /> Previous
                                </Button>
                                <span className="text-xs text-slate-500">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                >
                                    Next <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function HadithCard({
    collection,
    hadith,
    searchTerms,
}: {
    collection: "bukhari" | "muslim";
    hadith: Hadith;
    searchTerms: string[];
}) {
    const collectionName = collection === "bukhari" ? "Sahih al-Bukhari" : "Sahih Muslim";
    const sunnahUrl = `https://sunnah.com/${collection}:${hadith.hadithnumber}`;
    const grade = hadith.grades?.[0]?.grade;
    const gradeInfo = gradeBadge(grade);

    return (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-indigo-700 dark:text-indigo-400">{collectionName}</span>
                    <span className="text-slate-400">#{hadith.hadithnumber}</span>
                    {hadith.reference && (
                        <span className="text-slate-400">
                            (Book {hadith.reference.book}, Hadith {hadith.reference.hadith})
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {gradeInfo && (
                        <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded", gradeInfo.color)}>
                            {gradeInfo.label}
                        </span>
                    )}
                    <a
                        href={sunnahUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-slate-500 hover:text-indigo-600 inline-flex items-center gap-0.5"
                        title="View on sunnah.com"
                    >
                        sunnah.com <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                </div>
            </div>
            <p
                className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: highlightTerms(hadith.text, searchTerms) }}
            />
        </div>
    );
}
