import { useState } from "react";
import { ChevronDown, ChevronRight, MapPin, Calendar as CalendarIcon, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import SEO from "@/components/SEO";
import VerseInline from "@/components/VerseInline";
import { SEERAH } from "@/lib/content/seerah";

export default function Seerah() {
    const [openChapter, setOpenChapter] = useState<string | null>(SEERAH[0].id);

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-white dark:from-slate-950 dark:to-slate-900 py-10 px-4">
            <SEO
                title="Seerah — The Life of Prophet Muhammad ﷺ"
                description="A chronological biography of Prophet Muhammad ﷺ — from the Year of the Elephant to the Farewell Sermon. 10 chapters with key events, locations, and Quranic references."
            />
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <Star className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider font-semibold">Seerah an-Nabawiyyah</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                        The Life of Prophet Muhammad ﷺ
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        From orphan of Mecca to mercy to the worlds — the journey in ten chapters.
                    </p>
                </div>

                <div className="space-y-3">
                    {SEERAH.map((chapter, idx) => {
                        const open = openChapter === chapter.id;
                        return (
                            <Card
                                key={chapter.id}
                                className={cn(
                                    "border transition-all bg-white dark:bg-slate-900",
                                    open
                                        ? "border-emerald-300 dark:border-emerald-800 shadow-md"
                                        : "border-slate-200 dark:border-slate-800",
                                )}
                            >
                                <button
                                    onClick={() => setOpenChapter(open ? null : chapter.id)}
                                    className="w-full text-left"
                                >
                                    <CardContent className="p-5">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                                                    {idx + 1}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                                        {chapter.title.replace(/^\d+\.\s*/, "")}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 mt-0.5">{chapter.period}</p>
                                                </div>
                                            </div>
                                            {open ? (
                                                <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
                                            ) : (
                                                <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
                                            )}
                                        </div>
                                    </CardContent>
                                </button>

                                {open && (
                                    <div className="px-5 pb-5 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                            {chapter.summary}
                                        </p>

                                        <div className="space-y-3 pt-2">
                                            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                Key events
                                            </h4>
                                            {chapter.events.map((ev, i) => (
                                                <div
                                                    key={i}
                                                    className="relative pl-6 pb-3 border-l-2 border-emerald-100 dark:border-emerald-950/60 last:border-l-transparent"
                                                >
                                                    <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h5 className="font-semibold text-slate-900 dark:text-white text-sm">
                                                                {ev.title}
                                                            </h5>
                                                        </div>
                                                        <div className="flex gap-3 flex-wrap text-[11px] text-slate-500">
                                                            {ev.year && (
                                                                <span className="inline-flex items-center gap-1">
                                                                    <CalendarIcon className="h-3 w-3" /> {ev.year}
                                                                </span>
                                                            )}
                                                            {ev.location && (
                                                                <span className="inline-flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3" /> {ev.location}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                                            {ev.description}
                                                        </p>
                                                        {ev.quranRef && ev.quranRef.length > 0 && (
                                                            <div className="space-y-2 pt-2">
                                                                {ev.quranRef.map((v) => (
                                                                    <VerseInline key={v} verseKey={v} compact />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>

                <div className="text-center pt-4">
                    <Badge variant="secondary" className="font-normal text-xs">
                        Sources: Ibn Ishaq (via Ibn Hisham) · Ar-Raheeq al-Makhtum · authentic hadith
                    </Badge>
                </div>
            </div>
        </div>
    );
}
