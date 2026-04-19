import { useEffect, useState } from "react";
import { Loader2, Sparkles, Scroll } from "lucide-react";

interface Neighbor {
    key: string;
    sim: number;
    shared_roots?: string[];
}
interface SimilarIndex {
    [verseKey: string]: Neighbor[];
}

interface VerseLite {
    verse_key: string;
    arabic: string;
    english: string;
}

interface Props {
    verseKey: string;
}

const DATA_BASE = "https://cdn.jsdelivr.net/gh/fauwadwali-oss/nwv-islamic-data@main";

// Lazy singleton cache for the two big JSONs (shared across verse cards)
let semanticCache: Promise<SimilarIndex> | null = null;
let rootsCache: Promise<SimilarIndex> | null = null;
const verseTextCache = new Map<string, VerseLite>();

function loadSemantic(): Promise<SimilarIndex> {
    if (!semanticCache) {
        semanticCache = fetch(`${DATA_BASE}/similar/semantic.json`).then((r) => r.json());
    }
    return semanticCache;
}
function loadRoots(): Promise<SimilarIndex> {
    if (!rootsCache) {
        rootsCache = fetch(`${DATA_BASE}/similar/roots.json`).then((r) => r.json());
    }
    return rootsCache;
}

async function fetchVerseLite(key: string): Promise<VerseLite | null> {
    if (verseTextCache.has(key)) return verseTextCache.get(key)!;
    try {
        const r = await fetch(`https://api.quran.com/api/v4/verses/by_key/${key}?translations=22&language=en&fields=text_uthmani`);
        if (!r.ok) return null;
        const d: any = await r.json();
        const clean = (s: string) => (s || "").replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]+>/g, "").trim();
        const v: VerseLite = {
            verse_key: d.verse.verse_key,
            arabic: d.verse.text_uthmani,
            english: clean(d.verse.translations?.[0]?.text || ""),
        };
        verseTextCache.set(key, v);
        return v;
    } catch {
        return null;
    }
}

// Map Buckwalter root letters back to Arabic letters
const BW_TO_AR: Record<string, string> = {
    A: "ا", b: "ب", t: "ت", v: "ث", j: "ج", H: "ح", x: "خ", d: "د", "*": "ذ",
    r: "ر", z: "ز", s: "س", "$": "ش", S: "ص", D: "ض", T: "ط", Z: "ظ", E: "ع",
    g: "غ", f: "ف", q: "ق", k: "ك", l: "ل", m: "م", n: "ن", h: "ه", w: "و",
    y: "ي", Y: "ى", "'": "ء",
};
const rootToArabic = (r: string): string =>
    r.split("").map((c) => BW_TO_AR[c] || c).join("");

export default function SimilarVersesPanel({ verseKey }: Props) {
    const [semantic, setSemantic] = useState<Neighbor[] | null>(null);
    const [roots, setRoots] = useState<Neighbor[] | null>(null);
    const [loaded, setLoaded] = useState<Record<string, VerseLite | null>>({});
    const [loadingIndexes, setLoadingIndexes] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoadingIndexes(true);
        Promise.all([loadSemantic(), loadRoots()])
            .then(([sem, rt]) => {
                if (cancelled) return;
                setSemantic(sem[verseKey] || []);
                setRoots(rt[verseKey] || []);
                setLoadingIndexes(false);
            })
            .catch(() => {
                if (cancelled) return;
                setLoadingIndexes(false);
            });
        return () => { cancelled = true; };
    }, [verseKey]);

    // Lazy-fetch text for each neighbor
    useEffect(() => {
        const neighbors = [...(semantic || []), ...(roots || [])];
        const keys = Array.from(new Set(neighbors.map((n) => n.key)));
        keys.forEach((k) => {
            if (!(k in loaded)) {
                fetchVerseLite(k).then((v) => setLoaded((prev) => ({ ...prev, [k]: v })));
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [semantic, roots]);

    if (loadingIndexes) {
        return (
            <div className="flex items-center gap-2 py-3 text-slate-500 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading similar verses…
            </div>
        );
    }

    const renderNeighbor = (n: Neighbor) => {
        const v = loaded[n.key];
        return (
            <div key={n.key} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Quran {n.key}</span>
                    {n.shared_roots && n.shared_roots.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {n.shared_roots.slice(0, 4).map((r) => (
                                <span key={r} className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-900/40">
                                    <span className="font-amiri">{rootToArabic(r)}</span>
                                    <span className="font-mono text-slate-400 text-[10px]">{r}</span>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                {v ? (
                    <>
                        <p className="font-amiri text-lg leading-relaxed text-slate-900 dark:text-slate-100 text-right mb-2 line-clamp-2" dir="rtl">
                            {v.arabic}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                            {v.english}
                        </p>
                    </>
                ) : (
                    <div className="flex items-center gap-2 text-xs text-slate-400"><Loader2 className="h-3 w-3 animate-spin" /> loading…</div>
                )}
            </div>
        );
    };

    return (
        <div className="mt-3 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
            {semantic && semantic.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                            Similar in meaning
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                        {semantic.slice(0, 4).map(renderNeighbor)}
                    </div>
                </div>
            )}

            {roots && roots.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Scroll className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                            Shares Arabic roots with
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                        {roots.slice(0, 4).map(renderNeighbor)}
                    </div>
                </div>
            )}

            {semantic?.length === 0 && roots?.length === 0 && (
                <p className="text-sm text-slate-500">No similar verses found for this ayah.</p>
            )}
        </div>
    );
}
