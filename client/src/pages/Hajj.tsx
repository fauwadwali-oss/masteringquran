import { useState } from "react";
import { MapPin, Calendar as CalendarIcon, Info, Compass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import SEO from "@/components/SEO";
import { UMRAH, HAJJ, type HajjGuide, type HajjStep } from "@/lib/content/hajj";

type Tab = "umrah" | "hajj";

export default function HajjPage() {
    const [tab, setTab] = useState<Tab>("umrah");
    const guide: HajjGuide = tab === "umrah" ? UMRAH : HAJJ;

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-white dark:from-slate-950 dark:to-slate-900 py-10 px-4">
            <SEO
                title="Hajj & Umrah Step-by-Step Guide, Mastering Quran"
                description="A complete step-by-step guide to Hajj and Umrah, rites, locations, days, and duas for each step. From ihram to the Farewell Tawaf."
            />
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <Compass className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider font-semibold">Pilgrimage Guide</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Hajj & 'Umrah</h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Step-by-step rites, locations, days, and the duas for each station.
                    </p>
                </div>

                <div className="flex justify-center">
                    <div className="inline-flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
                        <button
                            onClick={() => setTab("umrah")}
                            className={cn(
                                "px-5 py-2 rounded-lg text-sm font-medium transition-all",
                                tab === "umrah"
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "text-slate-600 dark:text-slate-400 hover:text-emerald-600",
                            )}
                        >
                            'Umrah ({UMRAH.steps.length} steps)
                        </button>
                        <button
                            onClick={() => setTab("hajj")}
                            className={cn(
                                "px-5 py-2 rounded-lg text-sm font-medium transition-all",
                                tab === "hajj"
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "text-slate-600 dark:text-slate-400 hover:text-emerald-600",
                            )}
                        >
                            Hajj ({HAJJ.steps.length} steps)
                        </button>
                    </div>
                </div>

                <Card className="border border-emerald-200 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900">
                    <CardContent className="p-5 space-y-2">
                        <h2 className="font-bold text-lg text-slate-900 dark:text-white">{guide.title}</h2>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{guide.subtitle}</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">{guide.overview}</p>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {guide.steps.map((step) => (
                        <StepCard key={step.id} step={step} />
                    ))}
                </div>

                <div className="text-center text-xs text-slate-500 pt-4">
                    Sources: Manasik al-Hajj · authentic hadith · standard manaasik across the four schools
                </div>
            </div>
        </div>
    );
}

function StepCard({ step }: { step: HajjStep }) {
    return (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                        {step.number}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                            <h3 className="font-semibold text-slate-900 dark:text-white">{step.name}</h3>
                            {step.arabic && (
                                <span className="font-amiri text-xl text-emerald-800 dark:text-emerald-300 leading-none">
                                    {step.arabic}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-3 flex-wrap text-[11px] text-slate-500 mt-1">
                            {step.day && (
                                <span className="inline-flex items-center gap-1">
                                    <CalendarIcon className="h-3 w-3" /> {step.day}
                                </span>
                            )}
                            {step.location && (
                                <span className="inline-flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {step.location}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{step.description}</p>

                {step.dua && (
                    <div className="rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-4 space-y-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            Du'a
                        </p>
                        <p className="font-amiri text-xl md:text-2xl text-right leading-[2.2] text-slate-900 dark:text-white" dir="rtl">
                            {step.dua.arabic}
                        </p>
                        {step.dua.translit && (
                            <p className="text-xs italic text-slate-600 dark:text-slate-400">{step.dua.translit}</p>
                        )}
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {step.dua.translation}
                        </p>
                        {step.dua.note && (
                            <p className="text-xs text-slate-500 pt-1 border-t border-emerald-100 dark:border-emerald-900/40">
                                {step.dua.note}
                            </p>
                        )}
                    </div>
                )}

                {step.tips && step.tips.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            <Info className="h-3 w-3" /> Tips
                        </div>
                        <ul className="space-y-1">
                            {step.tips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                                    <span className="text-emerald-500 mt-0.5">•</span>
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
