import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Download, Copy, Share2, Loader2, Palette, RefreshCw, ArrowLeft, Check } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SEO from "@/components/SEO";

// ------------ Templates ------------
type Template = {
    id: string;
    name: string;
    bgClass: string;        // tailwind classes for bg
    arabicColor: string;    // tailwind text color
    translationColor: string;
    refColor: string;
    wordmarkColor: string;
    accent: string;         // accent color for divider
};

const TEMPLATES: Template[] = [
    {
        id: "emerald",
        name: "Emerald",
        bgClass: "bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900",
        arabicColor: "text-white",
        translationColor: "text-emerald-50",
        refColor: "text-emerald-300",
        wordmarkColor: "text-emerald-200",
        accent: "bg-emerald-400",
    },
    {
        id: "midnight",
        name: "Midnight",
        bgClass: "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900",
        arabicColor: "text-amber-100",
        translationColor: "text-slate-200",
        refColor: "text-amber-300",
        wordmarkColor: "text-slate-400",
        accent: "bg-amber-400",
    },
    {
        id: "gold",
        name: "Royal Gold",
        bgClass: "bg-gradient-to-br from-[#0B2545] via-[#102a50] to-[#0B2545]",
        arabicColor: "text-[#F4D06F]",
        translationColor: "text-slate-100",
        refColor: "text-[#D4AF37]",
        wordmarkColor: "text-slate-400",
        accent: "bg-[#D4AF37]",
    },
    {
        id: "parchment",
        name: "Parchment",
        bgClass: "bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100",
        arabicColor: "text-emerald-900",
        translationColor: "text-slate-700",
        refColor: "text-emerald-700",
        wordmarkColor: "text-slate-500",
        accent: "bg-emerald-600",
    },
    {
        id: "minimal",
        name: "Minimal White",
        bgClass: "bg-white",
        arabicColor: "text-slate-900",
        translationColor: "text-slate-700",
        refColor: "text-emerald-700",
        wordmarkColor: "text-slate-400",
        accent: "bg-emerald-500",
    },
    {
        id: "sunset",
        name: "Sunset",
        bgClass: "bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500",
        arabicColor: "text-white",
        translationColor: "text-orange-50",
        refColor: "text-amber-100",
        wordmarkColor: "text-orange-100",
        accent: "bg-white",
    },
];

// ------------ Verse interface (Quran.com v4) ------------
interface VerseData {
    verseKey: string;
    arabic: string;
    translation: string;
    surahName: string;
    surahEnglish: string;
    translator: string;
}

// Most popular short verses as a starting suggestion list
const SUGGESTED: string[] = [
    "1:1", "2:255", "2:286", "3:8", "3:26", "13:28", "20:114", "21:87",
    "24:35", "33:56", "39:53", "55:13", "65:3", "94:5", "94:6", "112:1",
];

async function fetchVerse(verseKey: string): Promise<VerseData> {
    // Translation 203 = Al-Hilali & Khan (strictly literal with explanatory parentheticals)
    const r = await fetch(
        `https://api.quran.com/api/v4/verses/by_key/${verseKey}?translations=203&language=en&fields=text_uthmani&word_fields=text_uthmani`,
    );
    const j = await r.json();
    const v = j?.verse;
    if (!v) throw new Error("Verse not found");
    // Also fetch chapter name
    const [surah] = verseKey.split(":");
    const cr = await fetch(`https://api.quran.com/api/v4/chapters/${surah}?language=en`);
    const cj = await cr.json();
    const chapter = cj?.chapter;
    // Strip HTML (footnote <sup> markers, etc.) so the translation is clean text only
    const translation = (v.translations?.[0]?.text ?? "")
        .replace(/<sup[^>]*>.*?<\/sup>/g, "")
        .replace(/<[^>]+>/g, "")
        .trim();
    return {
        verseKey: v.verse_key,
        arabic: v.text_uthmani,
        translation,
        surahName: chapter?.name_arabic ?? "",
        surahEnglish: chapter?.name_simple ?? `Surah ${surah}`,
        translator: "Al-Hilali & Khan",
    };
}

// ------------ Page ------------
export default function Share() {
    const [params, setParams] = useSearchParams();
    const initialVerse = params.get("verse") || "2:255";
    const [verseInput, setVerseInput] = useState(initialVerse);
    const [verse, setVerse] = useState<VerseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [templateId, setTemplateId] = useState<string>(TEMPLATES[0].id);
    const [downloading, setDownloading] = useState(false);
    const [copied, setCopied] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const template = useMemo(
        () => TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0],
        [templateId],
    );

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setErr(null);
        fetchVerse(initialVerse)
            .then((v) => {
                if (!cancelled) {
                    setVerse(v);
                    setLoading(false);
                }
            })
            .catch((e) => {
                if (!cancelled) {
                    setErr(e?.message ?? "Failed to load verse");
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [initialVerse]);

    const loadVerse = (key: string) => {
        const clean = key.trim();
        if (!/^\d{1,3}:\d{1,3}$/.test(clean)) {
            setErr("Use the format surah:ayah (e.g. 2:255)");
            return;
        }
        setParams({ verse: clean });
        setVerseInput(clean);
    };

    const generatePng = async (): Promise<Blob | null> => {
        if (!cardRef.current) return null;
        // Wait for fonts to ensure Arabic and wordmark render
        if (document.fonts && (document.fonts as any).ready) {
            try {
                await (document.fonts as any).ready;
            } catch { /* ignore */ }
        }
        const dataUrl = await htmlToImage.toPng(cardRef.current, {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: undefined,
        });
        const res = await fetch(dataUrl);
        return await res.blob();
    };

    const onDownload = async () => {
        if (!verse) return;
        try {
            setDownloading(true);
            const blob = await generatePng();
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `mastering-quran-${verse.verseKey.replace(":", "-")}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            setErr("Couldn't generate image. Try another template.");
        } finally {
            setDownloading(false);
        }
    };

    const onCopy = async () => {
        try {
            setDownloading(true);
            const blob = await generatePng();
            if (!blob) return;
            // Clipboard API for images
            if ("ClipboardItem" in window && navigator.clipboard?.write) {
                await navigator.clipboard.write([
                    new ClipboardItem({ "image/png": blob }),
                ]);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } else {
                setErr("Copy-image not supported in this browser. Use Download instead.");
            }
        } catch (e) {
            console.error(e);
            setErr("Couldn't copy. Try Download instead.");
        } finally {
            setDownloading(false);
        }
    };

    const onShare = async () => {
        if (!verse) return;
        try {
            setDownloading(true);
            const blob = await generatePng();
            if (!blob) return;
            const file = new File([blob], `mastering-quran-${verse.verseKey}.png`, { type: "image/png" });
            const shareData: ShareData = {
                title: `Quran ${verse.verseKey}`,
                text: `"${verse.translation}", Quran ${verse.verseKey}`,
                files: [file] as any,
            };
            if (navigator.share && navigator.canShare?.(shareData as any)) {
                await navigator.share(shareData);
            } else if (navigator.share) {
                await navigator.share({ title: shareData.title, text: shareData.text });
            } else {
                setErr("Share not supported here, use Download.");
            }
        } catch (e: any) {
            if (e?.name !== "AbortError") {
                console.error(e);
            }
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-white dark:from-slate-950 dark:to-slate-900 py-10 px-4">
            <SEO
                title="Share a Verse as Image, Mastering Quran"
                description="Create beautiful Quran verse images to share. Choose a template, pick a verse, and download or share directly."
            />
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link to="/quran" className="text-sm text-slate-500 hover:text-emerald-600 inline-flex items-center gap-1.5">
                        <ArrowLeft className="h-4 w-4" /> Back to Quran
                    </Link>
                </div>

                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <Share2 className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider font-semibold">Verse Share Studio</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Share a Verse as Image</h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Pick any verse, choose a template, and download or share a beautiful image.
                    </p>
                </div>

                {/* Verse input */}
                <Card>
                    <CardContent className="p-4 space-y-3">
                        <div className="flex gap-2 items-end flex-wrap">
                            <div className="flex-1 min-w-[180px]">
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                    Verse reference (surah:ayah)
                                </label>
                                <Input
                                    value={verseInput}
                                    onChange={(e) => setVerseInput(e.target.value)}
                                    placeholder="e.g. 2:255 or 94:5"
                                    onKeyDown={(e) => e.key === "Enter" && loadVerse(verseInput)}
                                />
                            </div>
                            <Button onClick={() => loadVerse(verseInput)} disabled={loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                Load verse
                            </Button>
                        </div>
                        <div className="flex gap-1.5 flex-wrap pt-1">
                            <span className="text-[11px] text-slate-400 uppercase tracking-wider self-center mr-1">Suggestions:</span>
                            {SUGGESTED.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => loadVerse(s)}
                                    className={cn(
                                        "px-2 py-0.5 rounded text-[11px] border transition-colors",
                                        initialVerse === s
                                            ? "bg-emerald-600 text-white border-emerald-600"
                                            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-300",
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        {err && <p className="text-xs text-rose-600">{err}</p>}
                    </CardContent>
                </Card>

                {/* Template picker */}
                <Card>
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            <Palette className="h-3.5 w-3.5" /> Template
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {TEMPLATES.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTemplateId(t.id)}
                                    className={cn(
                                        "h-14 rounded-lg border-2 transition-all flex items-center justify-center text-[11px] font-medium overflow-hidden relative",
                                        templateId === t.id
                                            ? "border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900/40"
                                            : "border-slate-200 dark:border-slate-700",
                                    )}
                                >
                                    <div className={cn("absolute inset-0", t.bgClass)} />
                                    <span className={cn("relative z-10 px-1.5 py-0.5 rounded bg-black/30 backdrop-blur-sm text-white")}>
                                        {t.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Preview */}
                <div className="space-y-3">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center">
                        Preview (1080 × 1080, perfect for Instagram)
                    </h3>
                    <div className="flex justify-center">
                        <div className="w-full max-w-[560px]">
                            {loading ? (
                                <div className="aspect-square rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                                </div>
                            ) : verse ? (
                                <div className="rounded-2xl overflow-hidden shadow-2xl">
                                    <VersePoster ref={cardRef} verse={verse} template={template} />
                                </div>
                            ) : (
                                <p className="text-center text-sm text-slate-500 py-8">No verse loaded.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {verse && (
                    <div className="flex gap-2 justify-center flex-wrap">
                        <Button onClick={onDownload} disabled={downloading}>
                            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            Download PNG
                        </Button>
                        <Button variant="outline" onClick={onCopy} disabled={downloading}>
                            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                            {copied ? "Copied!" : "Copy image"}
                        </Button>
                        <Button variant="outline" onClick={onShare} disabled={downloading}>
                            <Share2 className="h-4 w-4" />
                            Share…
                        </Button>
                    </div>
                )}

                <p className="text-center text-[11px] text-slate-400 pt-2">
                    Translation: Al-Hilali & Khan, <em>Noble Qur'an</em>. Image rendered locally in your browser, nothing is uploaded.
                </p>
            </div>
        </div>
    );
}

// ------------ Poster component ------------
import { forwardRef } from "react";

const VersePoster = forwardRef<HTMLDivElement, { verse: VerseData; template: Template }>(
    function VersePoster({ verse, template }, ref) {
        return (
            <div
                ref={ref}
                className={cn(
                    "relative aspect-square w-full p-8 md:p-10 flex flex-col",
                    template.bgClass,
                )}
                style={{ aspectRatio: "1 / 1" }}
            >
                {/* Top ornament */}
                <div className="flex items-center gap-3 justify-center">
                    <span className={cn("h-px flex-1 max-w-[60px]", template.accent, "opacity-60")} />
                    <span className={cn("text-[10px] font-semibold uppercase tracking-[0.3em]", template.refColor)}>
                        ﷽
                    </span>
                    <span className={cn("h-px flex-1 max-w-[60px]", template.accent, "opacity-60")} />
                </div>

                {/* Arabic */}
                <div className="flex-1 flex flex-col justify-center items-center text-center space-y-5 py-4">
                    <p
                        className={cn(
                            "font-amiri leading-[2.1] text-right w-full",
                            template.arabicColor,
                        )}
                        dir="rtl"
                        style={{
                            fontSize: verse.arabic.length > 200 ? "1.5rem" : verse.arabic.length > 100 ? "1.9rem" : "2.4rem",
                            fontWeight: 400,
                        }}
                    >
                        {verse.arabic}
                    </p>
                    <div className={cn("h-px w-16", template.accent, "opacity-50")} />
                    <p
                        className={cn("leading-relaxed italic", template.translationColor)}
                        style={{
                            fontSize: verse.translation.length > 300 ? "0.95rem" : verse.translation.length > 150 ? "1.05rem" : "1.15rem",
                        }}
                    >
                        &ldquo;{verse.translation}&rdquo;
                    </p>
                </div>

                {/* Bottom ref + wordmark */}
                <div className="flex items-end justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <img
                            src="/mq-logo-mark.svg"
                            alt=""
                            crossOrigin="anonymous"
                            className="h-10 w-auto drop-shadow-md"
                        />
                        <div className="leading-tight">
                            <p className={cn("text-sm font-bold", template.refColor)}>Mastering Quran</p>
                            <p className={cn("text-[10px] uppercase tracking-wider", template.wordmarkColor)}>
                                masteringquran.com
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={cn("font-amiri text-lg", template.refColor)} dir="rtl">
                            {verse.surahName}
                        </p>
                        <p className={cn("text-xs font-medium", template.refColor)}>
                            {verse.surahEnglish} · {verse.verseKey}
                        </p>
                    </div>
                </div>
            </div>
        );
    },
);
