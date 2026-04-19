import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, BookOpen, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import LessonLayout from "@/components/LessonLayout";
import ArabicAudioButton from "@/components/ArabicAudioButton";
import { FIRST_SURAH } from "@/lib/content/arabic-foundations";
import { cn } from "@/lib/utils";

// Pre-recorded verse audio from Quran.com (Reciter 7 = Mishary Alafasy, clear teaching pace)
const VERSE_AUDIO_BASE = "https://verses.quran.com/Alafasy/mp3";

function verseAudioUrl(verseKey: string): string {
    const [surah, ayah] = verseKey.split(":");
    const s = surah.padStart(3, "0");
    const a = ayah.padStart(3, "0");
    return `${VERSE_AUDIO_BASE}/${s}${a}.mp3`;
}

export default function LearnFirstSurah() {
    const [hoveredWord, setHoveredWord] = useState<string | null>(null);

    return (
        <LessonLayout lessonId="first-surah">
            <Card className="border border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/60 to-white dark:from-emerald-950/30 dark:to-slate-900">
                <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-emerald-600" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            Graduation
                        </p>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Surah An-Nās (The Mankind), {FIRST_SURAH.verses.length} verses
                    </h2>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        You've learned the letters, their shapes, harakat, tanween, madd, and the five tajweed rules. Now apply all of it to recite one of the last and shortest surahs of the Quran.
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        <strong>Tap any Arabic word</strong> below to hear it pronounced by a master reciter. Tap the <strong>speaker next to each verse</strong> to hear the entire verse in flowing recitation.
                    </p>
                </CardContent>
            </Card>

            <div className="space-y-3">
                {FIRST_SURAH.verses.map((v) => (
                    <Card key={v.verseKey} className="border border-emerald-200 dark:border-emerald-900/40">
                        <CardContent className="p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold">
                                    {v.verseKey.split(":")[1]}
                                </span>
                                <ArabicAudioButton
                                    text={v.fullArabic}
                                    audioUrl={verseAudioUrl(v.verseKey)}
                                    size="lg"
                                    label="Play full verse"
                                />
                            </div>

                            {/* Word-by-word */}
                            <div className="flex flex-wrap gap-2 justify-end" dir="rtl">
                                {v.words.map((w, i) => {
                                    const key = `${v.verseKey}-${i}`;
                                    const isHovered = hoveredWord === key;
                                    return (
                                        <button
                                            key={key}
                                            onMouseEnter={() => setHoveredWord(key)}
                                            onMouseLeave={() => setHoveredWord(null)}
                                            onClick={() => setHoveredWord(isHovered ? null : key)}
                                            className={cn(
                                                "group rounded-lg px-3 py-2 transition-all border text-center",
                                                isHovered
                                                    ? "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 shadow-sm"
                                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300",
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-amiri text-3xl text-slate-900 dark:text-white leading-none">
                                                    {w.arabic}
                                                </span>
                                                <ArabicAudioButton text={w.arabic} size="sm" />
                                            </div>
                                            {isHovered && (
                                                <div className="mt-2 text-center space-y-0.5" dir="ltr">
                                                    <p className="text-xs italic text-slate-500">{w.transliteration}</p>
                                                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{w.meaning}</p>
                                                    {w.note && (
                                                        <p className="text-[10px] text-amber-600 dark:text-amber-400">{w.note}</p>
                                                    )}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Full translation */}
                            <p className="text-sm italic text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                                &ldquo;{v.fullTranslation}&rdquo;
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Graduation message */}
            <Card className="border-2 border-emerald-400 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30">
                <CardContent className="p-6 text-center space-y-3">
                    <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 rounded-full px-4 py-1.5 border border-emerald-300">
                        <Sparkles className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            Mashā'Allāh
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        You can read the Quran
                    </h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                        You just read a complete surah of the Quran, the same words recited by Muslims in prayer around the world for over 1,400 years. Mark this lesson complete to finish Milestone 1 of your Arabic journey.
                    </p>
                    <div className="flex gap-2 justify-center pt-2 flex-wrap">
                        <Link
                            to="/quran?verse=114:1"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
                        >
                            <BookOpen className="h-4 w-4" /> Open in the Quran reader
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </LessonLayout>
    );
}
