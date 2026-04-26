import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Copy, Download, Loader2, Palette, RefreshCw, Share2, Sparkles } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import { cn } from "@/lib/utils";

type Format = "square" | "story";
type CardKind = "verse" | "dua" | "hadith";

type Template = {
    id: string;
    name: string;
    mood: string;
    bgClass: string;
    surfaceClass: string;
    arabicColor: string;
    translationColor: string;
    refColor: string;
    mutedColor: string;
    accent: string;
    ring: string;
    swatchText: string;
};

const TEMPLATES: Template[] = [
    {
        id: "sanctuary",
        name: "Sanctuary",
        mood: "Deep green, calm",
        bgClass: "bg-[radial-gradient(circle_at_18%_18%,rgba(110,231,183,0.18),transparent_28%),linear-gradient(135deg,#052e24_0%,#0f513f_48%,#082f49_100%)]",
        surfaceClass: "border-white/18 bg-white/[0.08] shadow-black/20",
        arabicColor: "text-white",
        translationColor: "text-emerald-50",
        refColor: "text-emerald-200",
        mutedColor: "text-emerald-100/70",
        accent: "bg-emerald-300",
        ring: "ring-emerald-300/70",
        swatchText: "text-white",
    },
    {
        id: "noor",
        name: "Noor",
        mood: "Warm light",
        bgClass: "bg-[linear-gradient(135deg,#fff7ed_0%,#fef3c7_48%,#ecfdf5_100%)]",
        surfaceClass: "border-amber-200/80 bg-white/55 shadow-amber-900/10",
        arabicColor: "text-emerald-950",
        translationColor: "text-slate-700",
        refColor: "text-emerald-800",
        mutedColor: "text-slate-500",
        accent: "bg-amber-500",
        ring: "ring-amber-300/80",
        swatchText: "text-slate-900",
    },
    {
        id: "midnight",
        name: "Midnight",
        mood: "Editorial dark",
        bgClass: "bg-[radial-gradient(circle_at_80%_12%,rgba(244,208,111,0.14),transparent_24%),linear-gradient(135deg,#020617_0%,#172554_55%,#111827_100%)]",
        surfaceClass: "border-white/14 bg-white/[0.07] shadow-black/25",
        arabicColor: "text-amber-50",
        translationColor: "text-slate-100",
        refColor: "text-amber-200",
        mutedColor: "text-slate-300/70",
        accent: "bg-amber-300",
        ring: "ring-amber-300/70",
        swatchText: "text-white",
    },
    {
        id: "ink",
        name: "Ink",
        mood: "Minimal black",
        bgClass: "bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_44%,#e2e8f0_100%)]",
        surfaceClass: "border-slate-200 bg-white/70 shadow-slate-900/10",
        arabicColor: "text-slate-950",
        translationColor: "text-slate-700",
        refColor: "text-slate-900",
        mutedColor: "text-slate-500",
        accent: "bg-slate-950",
        ring: "ring-slate-300",
        swatchText: "text-slate-900",
    },
    {
        id: "royal",
        name: "Royal",
        mood: "Gold and navy",
        bgClass: "bg-[radial-gradient(circle_at_50%_0%,rgba(244,208,111,0.2),transparent_28%),linear-gradient(135deg,#061a33_0%,#0B2545_52%,#05162d_100%)]",
        surfaceClass: "border-[#F4D06F]/25 bg-white/[0.06] shadow-black/20",
        arabicColor: "text-[#F4D06F]",
        translationColor: "text-slate-100",
        refColor: "text-[#F4D06F]",
        mutedColor: "text-slate-300/70",
        accent: "bg-[#F4D06F]",
        ring: "ring-[#F4D06F]/70",
        swatchText: "text-white",
    },
    {
        id: "rose",
        name: "Rose",
        mood: "Soft social",
        bgClass: "bg-[linear-gradient(135deg,#9f1239_0%,#db2777_48%,#f97316_100%)]",
        surfaceClass: "border-white/20 bg-white/[0.1] shadow-rose-950/25",
        arabicColor: "text-white",
        translationColor: "text-rose-50",
        refColor: "text-orange-100",
        mutedColor: "text-rose-50/75",
        accent: "bg-white",
        ring: "ring-rose-200/80",
        swatchText: "text-white",
    },
];

interface VerseData {
    verseKey: string;
    arabic: string;
    translation: string;
    surahName: string;
    surahEnglish: string;
    translator: string;
}

const SUGGESTED: Array<{ key: string; label: string }> = [
    { key: "2:255", label: "Ayat al-Kursi" },
    { key: "1:1", label: "Opening" },
    { key: "13:28", label: "Tranquility" },
    { key: "20:114", label: "Knowledge" },
    { key: "21:87", label: "Dua Yunus" },
    { key: "24:35", label: "Light" },
    { key: "39:53", label: "Hope" },
    { key: "94:5", label: "Ease" },
    { key: "112:1", label: "Ikhlas" },
];

async function fetchVerse(verseKey: string): Promise<VerseData> {
    const r = await fetch(
        `https://api.quran.com/api/v4/verses/by_key/${verseKey}?translations=203&language=en&fields=text_uthmani&word_fields=text_uthmani`,
    );
    const j = await r.json();
    const v = j?.verse;
    if (!v) throw new Error("Verse not found");

    const [surah] = verseKey.split(":");
    const cr = await fetch(`https://api.quran.com/api/v4/chapters/${surah}?language=en`);
    const cj = await cr.json();
    const chapter = cj?.chapter;
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

export default function Share() {
    const [params, setParams] = useSearchParams();
    const initialVerse = params.get("verse") || "2:255";
    const [verseInput, setVerseInput] = useState(initialVerse);
    const [verse, setVerse] = useState<VerseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
    const [format, setFormat] = useState<Format>("square");
    const [cardKind, setCardKind] = useState<CardKind>("verse");
    const [customArabic, setCustomArabic] = useState("رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً");
    const [customText, setCustomText] = useState("Our Lord, grant us good in this world and good in the Hereafter.");
    const [customSource, setCustomSource] = useState("Quran 2:201");
    const [showTranslation, setShowTranslation] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [copied, setCopied] = useState<"idle" | "image" | "caption">("idle");
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
                    setVerseInput(v.verseKey);
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
            setErr("Use the format surah:ayah, like 2:255.");
            return;
        }
        setParams({ verse: clean });
        setVerseInput(clean);
    };

    const generatePng = async (): Promise<Blob | null> => {
        if (!cardRef.current) return null;
        if (document.fonts && (document.fonts as any).ready) {
            try {
                await (document.fonts as any).ready;
            } catch {
                /* keep export moving if font readiness is unavailable */
            }
        }
        const dataUrl = await htmlToImage.toPng(cardRef.current, {
            cacheBust: true,
            pixelRatio: format === "story" ? 2.5 : 2,
            backgroundColor: undefined,
        });
        const res = await fetch(dataUrl);
        return await res.blob();
    };

    const poster = cardKind === "verse" ? verse : {
        verseKey: cardKind === "dua" ? "Dua" : "Hadith",
        arabic: customArabic,
        translation: customText,
        surahName: cardKind === "dua" ? "دعاء" : "حديث",
        surahEnglish: customSource || (cardKind === "dua" ? "Supplication" : "Hadith"),
        translator: cardKind === "dua" ? "Supplication card" : "Hadith reminder",
    };

    const caption = poster
        ? `${poster.arabic ? `${poster.arabic}\n\n` : ""}"${poster.translation}"\n\n${poster.surahEnglish}\nmasteringquran.com`
        : "";

    const onDownload = async () => {
        if (!poster) return;
        try {
            setDownloading(true);
            const blob = await generatePng();
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `mastering-quran-${poster.verseKey.replace(":", "-")}-${format}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            setErr("Couldn't generate the image. Try another template.");
        } finally {
            setDownloading(false);
        }
    };

    const onCopyImage = async () => {
        try {
            setDownloading(true);
            const blob = await generatePng();
            if (!blob) return;
            if ("ClipboardItem" in window && navigator.clipboard?.write) {
                await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
                setCopied("image");
                setTimeout(() => setCopied("idle"), 2000);
            } else {
                setErr("Copy image is not supported in this browser. Download works.");
            }
        } catch (e) {
            console.error(e);
            setErr("Couldn't copy the image. Try Download instead.");
        } finally {
            setDownloading(false);
        }
    };

    const onCopyCaption = async () => {
        if (!caption) return;
        await navigator.clipboard.writeText(caption);
        setCopied("caption");
        setTimeout(() => setCopied("idle"), 2000);
    };

    const onShare = async () => {
        if (!poster) return;
        try {
            setDownloading(true);
            const blob = await generatePng();
            if (!blob) return;
            const file = new File([blob], `mastering-quran-${poster.verseKey}-${format}.png`, { type: "image/png" });
            const shareData: ShareData = {
                title: `Mastering Quran ${cardKind} card`,
                text: `"${poster.translation}" ${poster.surahEnglish}`,
                files: [file] as any,
            };
            if (navigator.share && navigator.canShare?.(shareData as any)) {
                await navigator.share(shareData);
            } else if (navigator.share) {
                await navigator.share({ title: shareData.title, text: shareData.text });
            } else {
                setErr("Share is not supported here. Download works.");
            }
        } catch (e: any) {
            if (e?.name !== "AbortError") console.error(e);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_34%),linear-gradient(180deg,#ecfdf5_0%,#ffffff_44%,#f8fafc_100%)] px-4 py-8 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_58%,#020617_100%)]">
            <SEO
                title="Share a Verse as Image, Mastering Quran"
                description="Create beautiful Quran verse images to share. Choose a template, pick a verse, and download or share directly."
            />

            <div className="mx-auto max-w-7xl space-y-6">
                <Link to="/quran" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Quran
                </Link>

                <section className="overflow-hidden rounded-[2rem] border border-emerald-200/70 bg-white/82 shadow-xl shadow-emerald-900/5 backdrop-blur dark:border-emerald-900/40 dark:bg-slate-950/72">
                    <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="border-b border-emerald-100/80 p-5 dark:border-slate-800 lg:border-b-0 lg:border-r lg:p-7">
                            <div className="mb-7 space-y-3">
                                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Verse card studio
                                </div>
                                <h1 className="text-4xl font-bold leading-tight text-slate-950 dark:text-white md:text-5xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Make Quran verse cards worth sharing.
                                </h1>
                                <p className="max-w-xl leading-7 text-slate-600 dark:text-slate-300">
                                    Choose a verse, tune the look, then export a polished square post or vertical story image.
                                </p>
                            </div>

                            <div className="space-y-5">
                                <Card className="rounded-2xl border-emerald-100/80 bg-white/80 shadow-none dark:border-slate-800 dark:bg-slate-900/70">
                                    <CardContent className="space-y-4 p-4">
                                        <div>
                                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Card type</p>
                                            <div className="grid grid-cols-3 rounded-2xl bg-slate-100 p-1 dark:bg-slate-950">
                                                {(["verse", "dua", "hadith"] as CardKind[]).map((kind) => (
                                                    <button
                                                        key={kind}
                                                        onClick={() => setCardKind(kind)}
                                                        className={cn(
                                                            "rounded-xl px-3 py-2 text-sm font-semibold capitalize transition-all",
                                                            cardKind === kind
                                                                ? "bg-white text-emerald-800 shadow-sm dark:bg-slate-800 dark:text-emerald-200"
                                                                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                                                        )}
                                                    >
                                                        {kind}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {cardKind === "verse" ? (
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                            <div className="min-w-0 flex-1">
                                                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                                    Verse reference
                                                </label>
                                                <Input
                                                    value={verseInput}
                                                    onChange={(e) => setVerseInput(e.target.value)}
                                                    placeholder="2:255"
                                                    onKeyDown={(e) => e.key === "Enter" && loadVerse(verseInput)}
                                                    className="h-12 rounded-xl bg-white text-base dark:bg-slate-950"
                                                />
                                            </div>
                                            <Button onClick={() => loadVerse(verseInput)} disabled={loading} className="h-12 w-full rounded-xl sm:w-auto">
                                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                                Load
                                            </Button>
                                        </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {cardKind === "dua" && (
                                                    <div>
                                                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Arabic text</label>
                                                        <textarea value={customArabic} onChange={(e) => setCustomArabic(e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-right font-amiri text-xl dark:border-slate-800 dark:bg-slate-950" dir="rtl" />
                                                    </div>
                                                )}
                                                <div>
                                                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">{cardKind === "dua" ? "Translation" : "Hadith text"}</label>
                                                    <textarea value={customText} onChange={(e) => setCustomText(e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950" />
                                                </div>
                                                <Input value={customSource} onChange={(e) => setCustomSource(e.target.value)} placeholder="Source, e.g. Hisn al-Muslim or Sahih Bukhari" className="h-11 rounded-xl" />
                                            </div>
                                        )}

                                        {cardKind === "verse" && <div className="grid grid-cols-3 gap-2">
                                            {SUGGESTED.map((item) => (
                                                <button
                                                    key={item.key}
                                                    onClick={() => loadVerse(item.key)}
                                                    className={cn(
                                                        "rounded-xl border px-2.5 py-2 text-left transition-all",
                                                        initialVerse === item.key
                                                            ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                                                            : "border-slate-200 bg-white/65 text-slate-600 hover:border-emerald-300 hover:text-emerald-800 dark:border-slate-800 dark:bg-slate-950/45 dark:text-slate-300",
                                                    )}
                                                >
                                                    <span className="block text-xs font-bold">{item.key}</span>
                                                    <span className="block truncate text-[11px] opacity-75">{item.label}</span>
                                                </button>
                                            ))}
                                        </div>}

                                        {err && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{err}</p>}
                                    </CardContent>
                                </Card>

                                <Card className="rounded-2xl border-emerald-100/80 bg-white/80 shadow-none dark:border-slate-800 dark:bg-slate-900/70">
                                    <CardContent className="space-y-4 p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                                <Palette className="h-3.5 w-3.5" />
                                                Template
                                            </div>
                                            <span className="text-xs text-slate-400">{template.mood}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {TEMPLATES.map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setTemplateId(t.id)}
                                                    className={cn(
                                                        "relative min-h-20 overflow-hidden rounded-2xl border p-3 text-left transition-all",
                                                        t.bgClass,
                                                        templateId === t.id ? cn("border-white ring-2", t.ring) : "border-white/40 hover:scale-[1.01]",
                                                    )}
                                                >
                                                    <div className="absolute inset-0 bg-black/0" />
                                                    <span className={cn("relative block text-sm font-bold drop-shadow", t.swatchText)}>{t.name}</span>
                                                    <span className={cn("relative mt-1 block text-[11px] opacity-75", t.swatchText)}>{t.mood}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-2xl border-emerald-100/80 bg-white/80 shadow-none dark:border-slate-800 dark:bg-slate-900/70">
                                    <CardContent className="space-y-4 p-4">
                                        <div>
                                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Format</p>
                                            <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-950">
                                                {(["square", "story"] as Format[]).map((f) => (
                                                    <button
                                                        key={f}
                                                        onClick={() => setFormat(f)}
                                                        className={cn(
                                                            "rounded-xl px-3 py-2 text-sm font-semibold transition-all",
                                                            format === f
                                                                ? "bg-white text-emerald-800 shadow-sm dark:bg-slate-800 dark:text-emerald-200"
                                                                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                                                        )}
                                                    >
                                                        {f === "square" ? "Square post" : "Story"}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/75 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/45">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Include translation</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Turn it off for Arabic-only cards.</p>
                                            </div>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={showTranslation}
                                                onClick={() => setShowTranslation((value) => !value)}
                                                className={cn(
                                                    "relative h-6 w-11 shrink-0 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                                                    showTranslation
                                                        ? "border-emerald-500 bg-emerald-500"
                                                        : "border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-800",
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform",
                                                        showTranslation ? "translate-x-[1.25rem]" : "translate-x-0.5",
                                                    )}
                                                />
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div className="bg-slate-950/[0.02] p-5 dark:bg-white/[0.02] lg:p-7">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live preview</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {format === "square" ? "1080 x 1080 social post" : "1080 x 1920 vertical story"}
                                    </p>
                                </div>
                                {poster && (
                                    <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                                        {cardKind === "verse" ? `Quran ${poster.verseKey}` : poster.verseKey}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-center">
                                <div className={cn("w-full", format === "square" ? "max-w-[580px]" : "max-w-[360px]")}>
                                    {loading ? (
                                        <div className={cn(
                                            "flex items-center justify-center rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900",
                                            format === "square" ? "aspect-square" : "aspect-[9/16]",
                                        )}>
                                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                                        </div>
                                    ) : poster ? (
                                        <div className="overflow-hidden rounded-[2rem] shadow-2xl shadow-slate-900/20">
                                            <VersePoster
                                                ref={cardRef}
                                                verse={poster}
                                                template={template}
                                                format={format}
                                                showTranslation={showTranslation}
                                            />
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                                            No verse loaded.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {poster && (
                                <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                                    <Button onClick={onDownload} disabled={downloading} className="rounded-xl">
                                        {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                        Download
                                    </Button>
                                    <Button variant="outline" onClick={onCopyImage} disabled={downloading} className="rounded-xl">
                                        {copied === "image" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                        {copied === "image" ? "Copied" : "Copy image"}
                                    </Button>
                                    <Button variant="outline" onClick={onCopyCaption} className="rounded-xl">
                                        {copied === "caption" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                        Caption
                                    </Button>
                                    <Button variant="outline" onClick={onShare} disabled={downloading} className="rounded-xl">
                                        <Share2 className="h-4 w-4" />
                                        Share
                                    </Button>
                                </div>
                            )}

                            <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
                                Translation: Al-Hilali & Khan. Image rendering happens locally in your browser.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

const VersePoster = forwardRef<HTMLDivElement, { verse: VerseData; template: Template; format: Format; showTranslation: boolean }>(
    function VersePoster({ verse, template, format, showTranslation }, ref) {
        const isStory = format === "story";
        const longArabic = verse.arabic.length > 190;
        const longTranslation = verse.translation.length > 250;
        const compactSquare = !isStory && showTranslation && (verse.arabic.length > 240 || verse.translation.length > 420);
        const displayTranslation = compactSquare && verse.translation.length > 430
            ? `${verse.translation.slice(0, 430).replace(/\s+\S*$/, "")}...`
            : verse.translation;

        return (
            <div
                ref={ref}
                className={cn("relative flex w-full flex-col overflow-hidden", template.bgClass, isStory ? "aspect-[9/16] p-7" : "aspect-square p-5 md:p-7")}
                style={{ aspectRatio: isStory ? "9 / 16" : "1 / 1" }}
            >
                <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(30deg,currentColor_1px,transparent_1px),linear-gradient(150deg,currentColor_1px,transparent_1px)] [background-size:38px_38px] text-white" />
                <div className={cn("relative grid h-full min-h-0 grid-rows-[auto_1fr_auto] rounded-[1.75rem] border shadow-2xl backdrop-blur-sm", template.surfaceClass, compactSquare ? "p-4 md:p-5" : isStory ? "p-6" : "p-5 md:p-7")}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <img src="/mq-logo-mark.svg" alt="" crossOrigin="anonymous" className={cn("w-auto drop-shadow-md", compactSquare ? "h-7" : "h-9")} />
                            <div>
                                <p className={cn("font-bold leading-none", template.refColor, compactSquare ? "text-xs" : "text-sm")}>Mastering Quran</p>
                                {!compactSquare && <p className={cn("mt-1 text-[10px] uppercase tracking-[0.22em]", template.mutedColor)}>Share a verse</p>}
                            </div>
                        </div>
                        <div className={cn("rounded-full border font-bold", template.refColor, "border-current/25", compactSquare ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs")}>
                            {verse.verseKey}
                        </div>
                    </div>

                    <div className={cn("flex min-h-0 flex-col items-center justify-center overflow-hidden text-center", compactSquare ? "gap-2 py-2" : isStory ? "gap-7 py-8" : "gap-5 py-5")}>
                        <div className="flex w-full items-center gap-3">
                            <span className={cn("h-px flex-1", template.accent, "opacity-55")} />
                            <span className={cn("font-amiri", template.refColor, compactSquare ? "text-base" : "text-xl")}>﷽</span>
                            <span className={cn("h-px flex-1", template.accent, "opacity-55")} />
                        </div>

                        <p
                            className={cn("w-full text-right font-amiri font-normal", template.arabicColor)}
                            dir="rtl"
                            style={{
                                lineHeight: compactSquare ? 1.75 : isStory ? 2.05 : 2,
                                fontSize: compactSquare
                                    ? "1.18rem"
                                    : isStory
                                        ? longArabic ? "1.75rem" : "2.25rem"
                                        : longArabic ? "1.45rem" : "2.15rem",
                            }}
                        >
                            {verse.arabic}
                        </p>

                        {showTranslation && (
                            <>
                                <div className={cn("rounded-full", template.accent, "opacity-75", compactSquare ? "h-0.5 w-10" : "h-1 w-14")} />
                                <p
                                    className={cn("font-medium", template.translationColor, compactSquare ? "max-w-[96%] leading-[1.45]" : "max-w-[92%] leading-relaxed")}
                                    style={{
                                        fontSize: compactSquare ? "0.68rem" : longTranslation ? "0.95rem" : "1.08rem",
                                    }}
                                >
                                    &ldquo;{displayTranslation}&rdquo;
                                </p>
                                {compactSquare && verse.translation.length > 430 && (
                                    <p className={cn("text-[9px] font-semibold uppercase tracking-[0.18em]", template.mutedColor)}>
                                        Full translation on Mastering Quran
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className={cn("font-amiri", template.refColor, compactSquare ? "text-base" : "text-xl")} dir="rtl">{verse.surahName}</p>
                            <p className={cn("mt-1 font-semibold", template.mutedColor, compactSquare ? "text-[10px]" : "text-xs")}>{verse.surahEnglish}</p>
                        </div>
                        <div className="text-right">
                            <p className={cn("uppercase tracking-[0.22em]", template.mutedColor, compactSquare ? "text-[8px]" : "text-[10px]")}>masteringquran.com</p>
                            <p className={cn("mt-1", template.mutedColor, compactSquare ? "text-[10px]" : "text-xs")}>{verse.translator}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
);
