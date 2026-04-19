import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import LessonLayout from "@/components/LessonLayout";
import ArabicAudioButton from "@/components/ArabicAudioButton";
import { cn } from "@/lib/utils";
import {
    CARDINALS,
    ORDINALS,
    DAYS,
    HIJRI_MONTHS,
    TIMES_OF_DAY,
    GREETINGS,
    EXPRESSIONS,
    DAILY_DUAS,
    type PhraseEntry,
    type DayEntry,
    type NumberEntry,
} from "@/lib/content/arabic-numbers-phrases";

type Tab = "numbers" | "time" | "greetings" | "duas";

export default function LearnNumbersPhrases() {
    const [tab, setTab] = useState<Tab>("numbers");

    return (
        <LessonLayout lessonId="numbers-phrases">
            <Card>
                <CardContent className="p-5 space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <p>
                        This lesson is your survival-Arabic toolkit. Numbers you'll hear in everyday life and the Quran, days and times (Arabic uses 'day-one, day-two' for the weekdays), and the phrases and du'as that fill a Muslim's day.
                    </p>
                    <p>
                        Tap any Arabic to hear it spoken. Repeat each phrase aloud a few times, familiarity comes from saying, not just reading.
                    </p>
                </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex justify-center">
                <div className="inline-flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 flex-wrap">
                    {(
                        [
                            { id: "numbers", label: "Numbers" },
                            { id: "time", label: "Days & Time" },
                            { id: "greetings", label: "Greetings & Expressions" },
                            { id: "duas", label: "Daily Du'as" },
                        ] as Array<{ id: Tab; label: string }>
                    ).map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                tab === t.id
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "text-slate-600 dark:text-slate-400 hover:text-emerald-600",
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {tab === "numbers" && <NumbersTab />}
            {tab === "time" && <TimeTab />}
            {tab === "greetings" && <GreetingsTab />}
            {tab === "duas" && <DuasTab />}
        </LessonLayout>
    );
}

// ────────────────────────────────────────────────────────────────────────
// Numbers tab
// ────────────────────────────────────────────────────────────────────────
function NumbersTab() {
    return (
        <>
            <Card>
                <CardContent className="p-5 space-y-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Arabic numerals</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        The digits you know (0-9) are actually called 'Arabic numerals'. But the Arabic world often uses a slightly different set of glyphs, <strong>Eastern Arabic numerals</strong> (٠ ١ ٢ ٣...). Both are read left-to-right, just like ours.
                    </p>
                </CardContent>
            </Card>

            <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">Cardinal numbers</h3>
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {CARDINALS.map((n) => (
                        <NumberCard key={String(n.value)} entry={n} showNumeral />
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2 mt-4">Ordinal numbers (1st, 2nd, 3rd...)</h3>
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {ORDINALS.map((n) => (
                        <NumberCard key={String(n.value)} entry={n} showNumeral={false} />
                    ))}
                </div>
            </div>
        </>
    );
}

function NumberCard({ entry, showNumeral }: { entry: NumberEntry; showNumeral: boolean }) {
    return (
        <Card className="border border-slate-200 dark:border-slate-800">
            <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-shrink-0 w-12 text-center">
                    <p className="text-lg font-bold text-slate-500">{entry.value}</p>
                    {showNumeral && entry.arabicNumeral && (
                        <p className="text-base text-emerald-700 dark:text-emerald-400 font-amiri">{entry.arabicNumeral}</p>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-amiri text-2xl text-slate-900 dark:text-white truncate" dir="rtl">{entry.arabic}</p>
                    <p className="text-[11px] italic text-slate-500 truncate">{entry.transliteration}</p>
                </div>
                <ArabicAudioButton text={entry.arabic} size="sm" />
            </CardContent>
        </Card>
    );
}

// ────────────────────────────────────────────────────────────────────────
// Time tab
// ────────────────────────────────────────────────────────────────────────
function TimeTab() {
    return (
        <>
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">Days of the week</h3>
                <div className="space-y-2">
                    {DAYS.map((d) => <DayCard key={d.arabic} entry={d} />)}
                </div>
            </div>

            <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2 mt-4">Hijri (Islamic) months</h3>
                <p className="text-xs text-slate-500 mb-3">The Islamic calendar is lunar, about 11 days shorter than the solar year. 4 are 'sacred months' in which fighting was prohibited.</p>
                <div className="grid gap-2 sm:grid-cols-2">
                    {HIJRI_MONTHS.map((m, i) => (
                        <DayCard key={m.arabic} entry={m} numbered={i + 1} />
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2 mt-4">Times of day</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                    {TIMES_OF_DAY.map((t) => <DayCard key={t.arabic} entry={t} />)}
                </div>
            </div>
        </>
    );
}

function DayCard({ entry, numbered }: { entry: DayEntry; numbered?: number }) {
    return (
        <Card className="border border-slate-200 dark:border-slate-800">
            <CardContent className="p-3 flex items-center gap-3">
                {numbered != null && (
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">
                        {numbered}
                    </span>
                )}
                <div className="flex-1 min-w-0">
                    <p className="font-amiri text-xl text-slate-900 dark:text-white" dir="rtl">{entry.arabic}</p>
                    <p className="text-[11px] italic text-slate-500">{entry.transliteration}</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{entry.english}</p>
                    {entry.note && <p className="text-[10px] text-slate-400 italic">{entry.note}</p>}
                </div>
                <ArabicAudioButton text={entry.arabic} size="sm" />
            </CardContent>
        </Card>
    );
}

// ────────────────────────────────────────────────────────────────────────
// Greetings & expressions
// ────────────────────────────────────────────────────────────────────────
function GreetingsTab() {
    return (
        <>
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">Greetings</h3>
                <div className="space-y-2">
                    {GREETINGS.map((p) => <PhraseCard key={p.arabic} entry={p} />)}
                </div>
            </div>

            <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2 mt-4">Common Islamic expressions</h3>
                <div className="space-y-2">
                    {EXPRESSIONS.map((p) => <PhraseCard key={p.arabic} entry={p} />)}
                </div>
            </div>
        </>
    );
}

function DuasTab() {
    return (
        <div className="space-y-2">
            <Card>
                <CardContent className="p-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    Short du'as tied to daily moments, food, sleep, waking, entering the home. Memorize one this week, put it into practice, and the habit builds itself.
                </CardContent>
            </Card>
            {DAILY_DUAS.map((p) => <PhraseCard key={p.arabic} entry={p} />)}
        </div>
    );
}

function PhraseCard({ entry }: { entry: PhraseEntry }) {
    return (
        <Card className="border border-slate-200 dark:border-slate-800">
            <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="font-amiri text-2xl md:text-3xl text-slate-900 dark:text-white leading-relaxed text-right" dir="rtl">{entry.arabic}</p>
                    </div>
                    <ArabicAudioButton text={entry.arabic} size="md" />
                </div>
                <p className="text-xs italic text-slate-500">{entry.transliteration}</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">&ldquo;{entry.english}&rdquo;</p>
                <p className="text-[11px] text-slate-500 italic border-l-2 border-emerald-200 dark:border-emerald-900 pl-2">{entry.context}</p>
            </CardContent>
        </Card>
    );
}
