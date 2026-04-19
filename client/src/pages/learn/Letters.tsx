import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import LessonLayout from "@/components/LessonLayout";
import ArabicAudioButton from "@/components/ArabicAudioButton";
import { LETTERS, type ArabicLetter } from "@/lib/content/arabic-foundations";

export default function LearnLetters() {
    const [selected, setSelected] = useState<ArabicLetter | null>(null);

    return (
        <LessonLayout lessonId="letters">
            <Card>
                <CardContent className="p-5 space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <p>
                        Arabic has <strong>28 letters</strong>, all consonants. Every letter has a <em>name</em>, a <em>sound</em>, and a specific <em>makhraj</em> (articulation point) in the mouth or throat.
                    </p>
                    <p>
                        Tap any letter below to hear it pronounced. Tap again for more detail, including the example word and where in the mouth the sound is made.
                    </p>
                </CardContent>
            </Card>

            {/* Letter grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {LETTERS.map((l) => (
                    <button
                        key={l.char}
                        onClick={() => setSelected(l)}
                        className={`group rounded-2xl p-4 aspect-square flex flex-col items-center justify-center gap-1 transition-all border ${
                            selected?.char === l.char
                                ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 shadow-md"
                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 hover:shadow-md"
                        }`}
                    >
                        <span className="font-amiri text-5xl text-slate-900 dark:text-white leading-none" dir="rtl">
                            {l.char}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500">{l.transliteration}</span>
                    </button>
                ))}
            </div>

            {/* Detail panel */}
            {selected && (
                <Card className="border border-emerald-200 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/40 to-white dark:from-emerald-950/20 dark:to-slate-900">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <span className="font-amiri text-7xl text-emerald-800 dark:text-emerald-300 leading-none" dir="rtl">
                                    {selected.char}
                                </span>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{selected.transliteration}</p>
                                    <p className="text-lg font-amiri text-slate-600 dark:text-slate-400" dir="rtl">{selected.name}</p>
                                    <p className="text-xs text-slate-400">Letter {selected.order} of 28</p>
                                </div>
                            </div>
                            <ArabicAudioButton
                                text={selected.name}
                                size="lg"
                                label={`Play the name of ${selected.transliteration}`}
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                            <Stat label="Sound" value={selected.latinSound} />
                            <Stat label="Makhraj (articulation)" value={selected.makhraj} />
                        </div>

                        <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                    Example word
                                </p>
                                <p className="font-amiri text-4xl text-slate-900 dark:text-white" dir="rtl">{selected.exampleWord}</p>
                                <p className="text-sm text-slate-500 mt-1">{selected.exampleWordMeaning}</p>
                            </div>
                            <ArabicAudioButton text={selected.exampleWord} size="lg" label="Play the example word" />
                        </div>

                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                Letter shapes in different positions
                            </p>
                            <div className="grid grid-cols-4 gap-2">
                                <ShapeBox label="Isolated" arabic={selected.char} />
                                <ShapeBox label="Initial" arabic={selected.initial} />
                                <ShapeBox label="Medial" arabic={selected.medial} />
                                <ShapeBox label="Final" arabic={selected.final} />
                            </div>
                            {selected.noJoinNext && (
                                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2">
                                    ⚠ {selected.transliteration} does not join the letter that follows it. Six letters share this property: ا د ذ ر ز و
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </LessonLayout>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{value}</p>
        </div>
    );
}

function ShapeBox({ label, arabic }: { label: string; arabic: string }) {
    return (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-center">
            <p className="font-amiri text-3xl text-slate-900 dark:text-white leading-none" dir="rtl">{arabic}</p>
            <p className="text-[10px] text-slate-500 mt-1">{label}</p>
        </div>
    );
}
