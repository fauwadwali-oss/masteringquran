import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, BookOpen, Trophy, Sparkles, CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import LessonLayout from "@/components/LessonLayout";
import ArabicAudioButton from "@/components/ArabicAudioButton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { GRADUATION_SURAHS, type GradSurah, type GradSurahVerse } from "@/lib/content/graduation-surahs";
import { LESSONS } from "@/lib/content/arabic-foundations";
import { listCompletedLessons } from "@/lib/queries/learn-progress";

const VERSE_AUDIO_BASE = "https://verses.quran.com/Alafasy/mp3";
function verseAudioUrl(verseKey: string): string {
    const [surah, ayah] = verseKey.split(":");
    return `${VERSE_AUDIO_BASE}/${surah.padStart(3, "0")}${ayah.padStart(3, "0")}.mp3`;
}

export default function LearnGraduation() {
    const { user } = useAuth();
    const [openSurahId, setOpenSurahId] = useState<number | null>(GRADUATION_SURAHS[0].surahNumber);
    const [allDone, setAllDone] = useState(false);

    // Check if every lesson in the system is completed, this is the true graduation.
    useEffect(() => {
        if (!user) return;
        listCompletedLessons(user.id)
            .then((rows) => {
                const done = new Set(rows.map((r) => r.lesson_id));
                // "Graduation" itself + every prior lesson
                const allIds = LESSONS.map((l) => l.id);
                setAllDone(allIds.every((id) => done.has(id)));
            })
            .catch(() => {});
    }, [user]);

    return (
        <LessonLayout lessonId="graduation">
            {/* Graduation banner */}
            <Card className="border-2 border-emerald-400 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30">
                <CardContent className="p-6 text-center space-y-3">
                    <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 rounded-full px-4 py-1.5 border border-emerald-300">
                        <Trophy className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            Graduation Milestone
                        </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                        Read Five Full Surahs
                    </h2>
                    <p className="text-sm text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        The journey from "I can't read a single Arabic letter" to "I can recite five surahs of the Quran" ends here. Each of these surahs is short (3 to 7 verses), iconic, and memorized by every practicing Muslim. Many are recited in every prayer.
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Click any surah below to expand it. <strong>Tap any word</strong> to see its meaning and hear the reciter pronounce it. Tap the speaker beside each verse for the full verse recitation from Mishary Alafasy.
                    </p>
                </CardContent>
            </Card>

            {/* The five surahs */}
            <div className="space-y-3">
                {GRADUATION_SURAHS.map((s) => (
                    <SurahCard
                        key={s.surahNumber}
                        surah={s}
                        open={openSurahId === s.surahNumber}
                        onToggle={() => setOpenSurahId(openSurahId === s.surahNumber ? null : s.surahNumber)}
                    />
                ))}
            </div>

            {/* Certificate card */}
            <Card className={cn(
                "border-2 transition-all",
                allDone
                    ? "border-amber-400 dark:border-amber-600 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30"
                    : "border-slate-200 dark:border-slate-800",
            )}>
                <CardContent className="p-6 text-center space-y-3">
                    {allDone ? (
                        <>
                            <GraduationCap className="h-12 w-12 text-amber-600 mx-auto" />
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Certificate of Completion
                            </h3>
                            <p className="font-amiri text-3xl text-amber-700 dark:text-amber-400" dir="rtl">
                                بَارَكَ اللهُ فِيكَ
                            </p>
                            <p className="text-sm italic text-slate-600 dark:text-slate-400">
                                Bārak Allāhu fīk, may Allah bless you.
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                                You have completed all {LESSONS.length} lessons of Mastering Quran's Learn Arabic curriculum:
                                the 28 letters, letter shapes, harakat, tanween and madd, tajweed rules, vocabulary,
                                grammar, numbers and phrases, the root system, writing, and the five graduation surahs.
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                                This is a beginning, not an end. Carry it forward: read a few verses every day,
                                learn one new root each week, and let the Quran become familiar.
                            </p>
                            <div className="flex gap-2 justify-center pt-2 flex-wrap">
                                <Link
                                    to="/quran"
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
                                >
                                    <BookOpen className="h-4 w-4" /> Start reading the Quran
                                </Link>
                                <Link
                                    to="/plans"
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-300 text-emerald-700 dark:text-emerald-400 text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                                >
                                    <Sparkles className="h-4 w-4" /> Pick a reading plan
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Certificate locked
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                                Complete all {LESSONS.length} lessons to unlock your certificate. The journey is what builds the skill, there's no shortcut.
                            </p>
                            <Link
                                to="/learn-arabic"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-sm font-semibold transition-colors"
                            >
                                <CheckCircle2 className="h-4 w-4" /> Back to lesson roadmap
                            </Link>
                        </>
                    )}
                </CardContent>
            </Card>
        </LessonLayout>
    );
}

function SurahCard({
    surah, open, onToggle,
}: {
    surah: GradSurah;
    open: boolean;
    onToggle: () => void;
}) {
    return (
        <Card
            className={cn(
                "border transition-all bg-white dark:bg-slate-900",
                open ? "border-emerald-300 dark:border-emerald-800 shadow-md" : "border-slate-200 dark:border-slate-800",
            )}
        >
            <button onClick={onToggle} className="w-full text-left">
                <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
                                {surah.surahNumber}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">{surah.nameTranslit}</h3>
                                    <span className="text-xs text-slate-500">({surah.nameEnglish})</span>
                                    <span className="font-amiri text-lg text-emerald-700 dark:text-emerald-400" dir="rtl">{surah.nameArabic}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    {surah.verses.length} verse{surah.verses.length === 1 ? "" : "s"}
                                </p>
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
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{surah.description}</p>

                    <div className="space-y-3">
                        {surah.verses.map((v) => (
                            <VerseBlock key={v.verseKey} verse={v} />
                        ))}
                    </div>

                    <Link
                        to={`/quran?verse=${surah.surahNumber}:1`}
                        className="inline-flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                        <BookOpen className="h-4 w-4" /> Open {surah.nameTranslit} in the Quran reader →
                    </Link>
                </div>
            )}
        </Card>
    );
}

function VerseBlock({ verse }: { verse: GradSurahVerse }) {
    const [openedWord, setOpenedWord] = useState<number | null>(null);
    return (
        <Card className="border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10">
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-sm">
                        {verse.verseKey.split(":")[1]}
                    </span>
                    <ArabicAudioButton
                        text={verse.fullArabic}
                        audioUrl={verseAudioUrl(verse.verseKey)}
                        size="md"
                        label="Play full verse"
                    />
                </div>

                {/* Word-by-word */}
                <div className="flex flex-wrap gap-2 justify-end" dir="rtl">
                    {verse.words.map((w, i) => {
                        const isOpen = openedWord === i;
                        return (
                            <button
                                key={i}
                                onClick={() => setOpenedWord(isOpen ? null : i)}
                                className={cn(
                                    "rounded-lg px-2.5 py-1.5 transition-all border text-center",
                                    isOpen
                                        ? "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 shadow-sm"
                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300",
                                )}
                            >
                                <div className="flex items-center gap-1.5">
                                    <span className="font-amiri text-2xl text-slate-900 dark:text-white leading-none">
                                        {w.arabic}
                                    </span>
                                    <ArabicAudioButton text={w.arabic} size="sm" />
                                </div>
                                {isOpen && (
                                    <div className="mt-1.5 text-center space-y-0.5" dir="ltr">
                                        <p className="text-[10px] italic text-slate-500">{w.transliteration}</p>
                                        <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{w.meaning}</p>
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
                <p className="text-sm italic text-slate-600 dark:text-slate-400 leading-relaxed pt-2 border-t border-emerald-100 dark:border-emerald-900/40">
                    &ldquo;{verse.fullTranslation}&rdquo;
                </p>
            </CardContent>
        </Card>
    );
}
