import { Card, CardContent } from "@/components/ui/card";
import LessonLayout from "@/components/LessonLayout";
import ArabicAudioButton from "@/components/ArabicAudioButton";
import { LETTERS, NON_JOINING_LETTERS } from "@/lib/content/arabic-foundations";

export default function LearnShapes() {
    return (
        <LessonLayout lessonId="shapes">
            <Card>
                <CardContent className="p-5 space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <p>
                        Every Arabic letter has up to <strong>four shapes</strong> depending on where it appears in a word:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Isolated</strong>, standing alone (not connected on either side).</li>
                        <li><strong>Initial</strong>, at the start of a word (connects to the next letter).</li>
                        <li><strong>Medial</strong>, in the middle of a word (connects on both sides).</li>
                        <li><strong>Final</strong>, at the end of a word (connects only to the previous letter).</li>
                    </ul>
                    <p>
                        <strong>Six letters never join the letter that follows them:</strong>{" "}
                        <span className="font-amiri text-xl mx-1" dir="rtl">
                            {NON_JOINING_LETTERS.join(" ")}
                        </span>
                        After any of these, the next letter starts fresh.
                    </p>
                </CardContent>
            </Card>

            {/* Four-column table: one row per letter */}
            <Card>
                <CardContent className="p-0">
                    <div className="grid grid-cols-5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 border-b border-slate-200 dark:border-slate-700">
                        <div className="col-span-1">Letter</div>
                        <div className="text-center">Isolated</div>
                        <div className="text-center">Initial</div>
                        <div className="text-center">Medial</div>
                        <div className="text-center">Final</div>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {LETTERS.map((l) => (
                            <div key={l.char} className="grid grid-cols-5 items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                                <div className="flex items-center gap-2">
                                    <ArabicAudioButton text={l.name} size="sm" />
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{l.transliteration}</span>
                                </div>
                                <ShapeCell arabic={l.char} />
                                <ShapeCell arabic={l.initial} />
                                <ShapeCell arabic={l.medial} />
                                <ShapeCell arabic={l.final} />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Worked example */}
            <Card className="border border-emerald-200 dark:border-emerald-900/40">
                <CardContent className="p-5 space-y-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Worked example
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                        Let's build the word <span className="font-amiri text-2xl" dir="rtl">كِتَاب</span> (<em>kitab</em>, "book"):
                    </p>
                    <div className="space-y-2">
                        <BuildStep arabic="ك" form="Initial" letter="Kaf" description="At the start of the word, use the initial form of kaf." />
                        <BuildStep arabic="كِ" form="With kasra" letter="Kaf + kasra" description="Add the short 'i' sound." />
                        <BuildStep arabic="كِتَ" form="Medial" letter="Ta" description="Ta is in the middle, so its medial form joins to both sides." />
                        <BuildStep arabic="كِتَا" form="With alif" letter="Ta + long 'a'" description="Alif elongates the vowel: 'kita'." />
                        <BuildStep arabic="كِتَاب" form="Final" letter="Ba" description="Ba at the end uses its final form with no vowel mark. Final word: kitab." />
                    </div>
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 flex items-center justify-between gap-2 mt-3">
                        <div>
                            <p className="font-amiri text-3xl text-emerald-900 dark:text-emerald-200" dir="rtl">كِتَاب</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">kitab, "book"</p>
                        </div>
                        <ArabicAudioButton text="كِتَاب" size="lg" />
                    </div>
                </CardContent>
            </Card>
        </LessonLayout>
    );
}

function ShapeCell({ arabic }: { arabic: string }) {
    return (
        <div className="font-amiri text-3xl text-slate-900 dark:text-white text-center leading-none" dir="rtl">
            {arabic}
        </div>
    );
}

function BuildStep({
    arabic, form, letter, description,
}: { arabic: string; form: string; letter: string; description: string }) {
    return (
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <span className="font-amiri text-2xl text-slate-900 dark:text-white w-20 text-right" dir="rtl">{arabic}</span>
            <div className="flex-1 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{letter}</span>
                <span className="text-slate-400"> · {form}</span>
                <p className="mt-0.5">{description}</p>
            </div>
        </div>
    );
}
