import { Card, CardContent } from "@/components/ui/card";
import LessonLayout from "@/components/LessonLayout";
import ArabicAudioButton from "@/components/ArabicAudioButton";
import { TANWEEN_MARKS, MADD_RULES } from "@/lib/content/arabic-foundations";

export default function LearnTanweenMadd() {
    return (
        <LessonLayout lessonId="tanween-madd">
            <Card>
                <CardContent className="p-5 space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <p>
                        Two more concepts to master before tajweed:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Tanween</strong>, the nunation. A double haraka that adds an 'n' sound at the end of a word, used to mark indefinite nouns.</li>
                        <li><strong>Madd</strong>, elongation. Holding a vowel sound for 2, 4-5, or 6 counts, one of the defining features of Quranic recitation.</li>
                    </ul>
                </CardContent>
            </Card>

            {/* Tanween */}
            <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    1. Tanween, the 'n' sound at word endings
                </h2>
                <div className="grid gap-3 sm:grid-cols-3">
                    {TANWEEN_MARKS.map((t) => (
                        <Card key={t.id} className="border border-emerald-200 dark:border-emerald-900/40">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{t.transliteration}</h3>
                                        <p className="font-amiri text-xs text-slate-500" dir="rtl">{t.name}</p>
                                    </div>
                                    <span className="font-amiri text-5xl text-emerald-700 dark:text-emerald-400 leading-none" dir="rtl">
                                        {t.arabic}
                                    </span>
                                </div>
                                <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                    Sound: {t.sound}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{t.description}</p>
                                <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-between gap-2">
                                    <div>
                                        <p className="font-amiri text-xl text-slate-900 dark:text-white" dir="rtl">
                                            {t.example.arabic}
                                        </p>
                                        <p className="text-[10px] text-slate-500">
                                            <em>{t.example.latin}</em>
                                        </p>
                                    </div>
                                    <ArabicAudioButton text={t.example.arabic} size="sm" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Madd */}
            <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    2. Madd, elongating the vowel
                </h2>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                    A madd letter (ا, و, or ي without a haraka) following its matching haraka (fatha, damma, kasra) tells you to <strong>hold</strong> the vowel. How long you hold it depends on the rule.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                    {MADD_RULES.map((m) => (
                        <Card key={m.id} className="border border-indigo-200 dark:border-indigo-900/40">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{m.transliteration}</h3>
                                        <p className="font-amiri text-xs text-slate-500" dir="rtl">{m.name}</p>
                                    </div>
                                    <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded">
                                        {m.counts}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{m.description}</p>
                                <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-between gap-2">
                                    <div>
                                        <p className="font-amiri text-xl text-slate-900 dark:text-white" dir="rtl">
                                            {m.example.arabic}
                                        </p>
                                        <p className="text-[10px] text-slate-500">
                                            <em>{m.example.latin}</em>, {m.example.meaning}
                                        </p>
                                    </div>
                                    <ArabicAudioButton text={m.example.arabic} size="sm" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </LessonLayout>
    );
}
