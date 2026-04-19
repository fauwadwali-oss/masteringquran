import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

interface Props {
    surahNumber: number;
    surahName: string;
}

export default function ChapterInfoPanel({ surahNumber, surahName }: Props) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setOpen(false);
        setText(null);
        setLoaded(false);
    }, [surahNumber]);

    const loadAndOpen = () => {
        if (loaded) {
            setOpen((o) => !o);
            return;
        }
        setOpen(true);
        fetch(`https://api.quran.com/api/v4/chapters/${surahNumber}/info?language=en`)
            .then(async (r) => {
                if (!r.ok) throw new Error("failed");
                const d: any = await r.json();
                const info = d.chapter_info || {};
                // Strip any HTML
                const raw = info.short_text || info.text || "";
                const stripped = raw.replace(/<[^>]+>/g, "").trim();
                setText(stripped || "No background available.");
                setLoaded(true);
            })
            .catch(() => {
                setText("Failed to load chapter background.");
                setLoaded(true);
            });
    };

    return (
        <div className="mb-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
            <button
                type="button"
                onClick={loadAndOpen}
                className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
                <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    About {surahName}
                </span>
                {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>
            {open && (
                <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {text || <span className="text-slate-400">Loading…</span>}
                </div>
            )}
        </div>
    );
}
