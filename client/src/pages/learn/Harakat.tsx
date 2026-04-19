import { Card, CardContent } from "@/components/ui/card";
import LessonLayout from "@/components/LessonLayout";
import ArabicAudioButton from "@/components/ArabicAudioButton";
import { HARAKAT, LETTERS } from "@/lib/content/arabic-foundations";

// Show 5 common letters with each of the 4 harakat, so the learner hears
// how the same letter sounds different with each mark.
const DEMO_LETTERS = ["ب", "ت", "س", "ل", "ن"];

export default function LearnHarakat() {
    return (
        <LessonLayout lessonId="harakat">
            <Card>
                <CardContent className="p-5 space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <p>
                        Arabic has 28 consonants, but every consonant needs a <strong>vowel mark</strong> (haraka) to be pronounced. These marks sit above or below the letter.
                    </p>
                    <p>
                        There are <strong>three short vowels</strong> (fatha, kasra, damma) and one <strong>silence mark</strong> (sukun).
                    </p>
                </CardContent>
            </Card>

            {/* Four harakat cards */}
            <div className="grid gap-3 sm:grid-cols-2">
                {HARAKAT.map((h) => (
                    <Card key={h.id} className="border border-emerald-200 dark:border-emerald-900/40">
                        <CardContent className="p-5 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                        {h.transliteration}
                                    </h3>
                                    <p className="font-amiri text-sm text-slate-500" dir="rtl">{h.name}</p>
                                </div>
                                <span className="font-amiri text-6xl text-emerald-700 dark:text-emerald-400 leading-none" dir="rtl">
                                    {h.arabic}
                                </span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{h.description}</p>
                            <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between gap-2">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Example</p>
                                    <p className="font-amiri text-2xl text-slate-900 dark:text-white" dir="rtl">{h.longerExample.arabic}</p>
                                    <p className="text-xs text-slate-500">
                                        <em>{h.longerExample.latin}</em>, {h.longerExample.meaning}
                                    </p>
                                </div>
                                <ArabicAudioButton text={h.longerExample.arabic} size="md" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Drill: 5 letters × 4 harakat */}
            <Card className="border border-indigo-200 dark:border-indigo-900/40">
                <CardContent className="p-5 space-y-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                        Listening drill, same letter, different sound
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                        Tap each cell below to hear how the same letter changes with different harakat.
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    <th className="p-2 text-left">Letter</th>
                                    {HARAKAT.map((h) => (
                                        <th key={h.id} className="p-2 text-center">{h.transliteration}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {DEMO_LETTERS.map((char) => {
                                    const letter = LETTERS.find((l) => l.char === char)!;
                                    return (
                                        <tr key={char}>
                                            <td className="p-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-amiri text-3xl text-slate-900 dark:text-white" dir="rtl">{char}</span>
                                                    <span className="text-xs text-slate-500">{letter.transliteration}</span>
                                                </div>
                                            </td>
                                            {HARAKAT.map((h) => {
                                                // Compose the letter + the haraka mark from the example (strip the 'b')
                                                const markOnly = h.exampleChar.replace("ب", "");
                                                const combined = char + markOnly;
                                                return (
                                                    <td key={h.id} className="p-2 text-center">
                                                        <div className="inline-flex flex-col items-center gap-1">
                                                            <span className="font-amiri text-3xl text-slate-900 dark:text-white" dir="rtl">{combined}</span>
                                                            <ArabicAudioButton text={combined} size="sm" />
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </LessonLayout>
    );
}
