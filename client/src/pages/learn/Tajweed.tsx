import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import LessonLayout from "@/components/LessonLayout";
import ArabicAudioButton from "@/components/ArabicAudioButton";
import { TAJWEED_RULES } from "@/lib/content/arabic-foundations";

export default function LearnTajweed() {
    return (
        <LessonLayout lessonId="tajweed">
            <Card>
                <CardContent className="p-5 space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <p>
                        <strong>Tajweed</strong> (تَجْوِيد, "to beautify") is the set of rules governing how the Quran is recited. It preserves the exact pronunciation taught by Prophet Muhammad ﷺ and transmitted through an unbroken chain to every qāri' (reciter) today.
                    </p>
                    <p>
                        Below are the <strong>five foundational rules</strong>. Four of them deal with how a <strong>noon with sukun (نْ)</strong> or <strong>tanween</strong> is pronounced depending on the letter that follows. The fifth is a gentle "bounce" on certain letters.
                    </p>
                </CardContent>
            </Card>

            <div className="space-y-3">
                {TAJWEED_RULES.map((r, idx) => (
                    <Card key={r.id} className="border border-emerald-200 dark:border-emerald-900/40">
                        <CardContent className="p-5 space-y-3">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                        Rule {idx + 1} of {TAJWEED_RULES.length}
                                    </p>
                                    <h3 className="font-bold text-xl text-slate-900 dark:text-white mt-0.5">{r.transliteration}</h3>
                                    <p className="font-amiri text-lg text-slate-600 dark:text-slate-400" dir="rtl">{r.name}</p>
                                </div>
                            </div>

                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{r.summary}</p>

                            <div className="grid sm:grid-cols-2 gap-3">
                                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">When it applies</p>
                                    <p className="text-xs text-slate-700 dark:text-slate-300">{r.when}</p>
                                </div>
                                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">How to recite</p>
                                    <p className="text-xs text-slate-700 dark:text-slate-300">{r.howToRecite}</p>
                                </div>
                            </div>

                            <div className="rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/40 p-4 flex items-center justify-between gap-3 flex-wrap">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                        Quranic example{r.example.ref ? ` (${r.example.ref})` : ""}
                                    </p>
                                    <p className="font-amiri text-3xl text-slate-900 dark:text-white" dir="rtl">{r.example.arabic}</p>
                                    <p className="text-xs text-slate-500 mt-1">{r.example.meaning}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ArabicAudioButton text={r.example.arabic} size="lg" />
                                    {r.example.ref && (
                                        <Link
                                            to={`/quran?verse=${r.example.ref}`}
                                            className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 hover:underline"
                                        >
                                            <BookOpen className="h-3 w-3" /> Open
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-slate-100 dark:border-slate-800">
                <CardContent className="p-4 text-xs text-slate-500 leading-relaxed">
                    <strong>Note:</strong> These five are the foundation. There are dozens more specific tajweed rules (rules of meem sakinah, laam shamsiyyah/qamariyyah, the seven qira'at, etc.) that a full qari program covers over years. For now, mastering these five gives you the backbone of beautiful Quranic recitation.
                </CardContent>
            </Card>
        </LessonLayout>
    );
}
