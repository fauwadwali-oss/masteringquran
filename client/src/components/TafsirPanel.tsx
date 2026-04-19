import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface TafsirPanelProps {
    surah: number;
    ayah: number;
    slug: string;
    editionName: string;
}

const DATA_BASE = "https://cdn.jsdelivr.net/gh/fauwadwali-oss/nwv-islamic-data@main";

// Strip HTML/Markdown artifacts that occasionally appear in the source data
const cleanTafsirText = (text: string): string =>
    text
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>\s*<p>/gi, "\n\n")
        .replace(/<[^>]+>/g, "")
        .trim();

export default function TafsirPanel({ surah, ayah, slug, editionName }: TafsirPanelProps) {
    const [text, setText] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setNotFound(false);
        setText(null);

        const url = `${DATA_BASE}/tafsir/${slug}/${surah}/${ayah}.json`;
        fetch(url)
            .then(async (r) => {
                if (!r.ok) {
                    if (cancelled) return;
                    setNotFound(true);
                    setLoading(false);
                    return;
                }
                const data = await r.json();
                if (cancelled) return;
                setText(cleanTafsirText(data.text || ""));
                setLoading(false);
            })
            .catch(() => {
                if (cancelled) return;
                setNotFound(true);
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [surah, ayah, slug]);

    return (
        <div className="mt-2 p-5 rounded-xl bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-950/20 dark:to-slate-900 border border-amber-200/60 dark:border-amber-900/30">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    Tafsir — {editionName}
                </p>
            </div>
            {loading ? (
                <div className="flex items-center gap-2 py-2 text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading tafsir…</span>
                </div>
            ) : notFound ? (
                <div className="flex items-center gap-2 py-2 text-slate-500">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">No commentary available for this verse in this edition.</span>
                </div>
            ) : (
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[15px] whitespace-pre-wrap">
                    {text}
                </p>
            )}
        </div>
    );
}
