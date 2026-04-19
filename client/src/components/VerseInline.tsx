import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerseInlineData {
    verseKey: string;
    arabic: string;
    translation: string;
    surahName?: string;
    surahEnglish?: string;
}

// In-memory cache so expanding/collapsing detail views doesn't re-fetch.
const VERSE_CACHE = new Map<string, VerseInlineData>();
const INFLIGHT = new Map<string, Promise<VerseInlineData>>();

async function fetchVerseInline(verseKey: string): Promise<VerseInlineData> {
    const cached = VERSE_CACHE.get(verseKey);
    if (cached) return cached;
    const inflight = INFLIGHT.get(verseKey);
    if (inflight) return inflight;

    const p = (async () => {
        // Translation 203 = Al-Hilali & Khan
        const r = await fetch(
            `https://api.quran.com/api/v4/verses/by_key/${verseKey}?translations=203&language=en&fields=text_uthmani`,
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        const v = j?.verse;
        if (!v) throw new Error("Verse not found");
        const translation = (v.translations?.[0]?.text ?? "")
            .replace(/<sup[^>]*>.*?<\/sup>/g, "")
            .replace(/<[^>]+>/g, "")
            .trim();
        const data: VerseInlineData = {
            verseKey: v.verse_key,
            arabic: v.text_uthmani,
            translation,
        };
        VERSE_CACHE.set(verseKey, data);
        return data;
    })();
    INFLIGHT.set(verseKey, p);
    try {
        const data = await p;
        return data;
    } finally {
        INFLIGHT.delete(verseKey);
    }
}

interface Props {
    verseKey: string;       // "2:255"
    compact?: boolean;      // smaller padding/type for seerah
}

export default function VerseInline({ verseKey, compact = false }: Props) {
    const [data, setData] = useState<VerseInlineData | null>(VERSE_CACHE.get(verseKey) ?? null);
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(!data);

    useEffect(() => {
        if (data) return;
        let cancelled = false;
        setLoading(true);
        setErr(null);
        fetchVerseInline(verseKey)
            .then((d) => {
                if (!cancelled) {
                    setData(d);
                    setLoading(false);
                }
            })
            .catch((e) => {
                if (!cancelled) {
                    setErr(e?.message ?? "Couldn't load verse");
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [verseKey, data]);

    return (
        <div
            className={cn(
                "rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/60 to-white dark:from-emerald-950/20 dark:to-slate-900",
                compact ? "p-3" : "p-4",
            )}
        >
            <div className="flex items-center justify-between gap-2 mb-2">
                <Link
                    to={`/quran?verse=${verseKey}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                    <BookOpen className="h-3.5 w-3.5" />
                    Quran {verseKey}
                </Link>
                <Link
                    to={`/quran?verse=${verseKey}`}
                    className="text-[10px] uppercase tracking-wider text-slate-400 hover:text-emerald-600 inline-flex items-center gap-1"
                    aria-label="Open in Quran reader"
                >
                    Open <ExternalLink className="h-2.5 w-2.5" />
                </Link>
            </div>

            {loading && (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading verse…
                </div>
            )}

            {err && (
                <p className="text-xs text-rose-500 py-1">
                    Couldn't load {verseKey}. <Link to={`/quran?verse=${verseKey}`} className="underline">Open in reader →</Link>
                </p>
            )}

            {data && !loading && !err && (
                <div className="space-y-2">
                    <p
                        className={cn(
                            "font-amiri text-slate-900 dark:text-white text-right leading-[2.1]",
                            compact ? "text-lg md:text-xl" : "text-xl md:text-2xl",
                        )}
                        dir="rtl"
                    >
                        {data.arabic}
                    </p>
                    <p
                        className={cn(
                            "text-slate-700 dark:text-slate-300 leading-relaxed italic",
                            compact ? "text-xs" : "text-sm",
                        )}
                    >
                        &ldquo;{data.translation}&rdquo;
                    </p>
                    <p className="text-[10px] text-slate-400">Al-Hilali &amp; Khan</p>
                </div>
            )}
        </div>
    );
}
