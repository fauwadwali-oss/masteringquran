import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import LessonLayout from "@/components/LessonLayout";
import ArabicAudioButton from "@/components/ArabicAudioButton";
import { cn } from "@/lib/utils";
import { GRAMMAR_SECTIONS, type GrammarSection, type GrammarCell } from "@/lib/content/arabic-grammar";

export default function LearnGrammar() {
    const [openId, setOpenId] = useState<string | null>(GRAMMAR_SECTIONS[0].id);

    return (
        <LessonLayout lessonId="grammar">
            <Card>
                <CardContent className="p-5 space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <p>
                        Once you can read Arabic letters and know vocabulary, <strong>grammar</strong> is what lets you put the pieces together. Classical Arabic grammar is vast, but these nine sections cover the core of what you need to follow the Quran.
                    </p>
                    <p>
                        Each section is expandable below. Read the explanation, study the table of forms, and see how it plays out in a real verse from the Quran.
                    </p>
                </CardContent>
            </Card>

            <div className="space-y-3">
                {GRAMMAR_SECTIONS.map((section, idx) => (
                    <SectionCard
                        key={section.id}
                        section={section}
                        index={idx}
                        open={openId === section.id}
                        onToggle={() => setOpenId(openId === section.id ? null : section.id)}
                    />
                ))}
            </div>
        </LessonLayout>
    );
}

function SectionCard({
    section, index, open, onToggle,
}: {
    section: GrammarSection;
    index: number;
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
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                                {index + 1}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-semibold text-slate-900 dark:text-white">{section.title}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{section.subtitle}</p>
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
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{section.explanation}</p>

                    {section.table && <GrammarTable cells={section.table} />}

                    {section.exampleVerse && (
                        <Card className="border border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20">
                            <CardContent className="p-4 space-y-2">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                        Quranic example, {section.exampleVerse.verseKey}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <ArabicAudioButton text={section.exampleVerse.arabic} size="sm" />
                                        <Link
                                            to={`/quran?verse=${section.exampleVerse.verseKey}`}
                                            className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 hover:underline"
                                        >
                                            <BookOpen className="h-3 w-3" /> Open
                                        </Link>
                                    </div>
                                </div>
                                <p
                                    className="font-amiri text-2xl text-slate-900 dark:text-white leading-relaxed text-right"
                                    dir="rtl"
                                    dangerouslySetInnerHTML={{
                                        __html: section.exampleVerse.highlight
                                            ? section.exampleVerse.arabic.replace(
                                                section.exampleVerse.highlight,
                                                `<mark class="bg-amber-200 dark:bg-amber-800/60 text-amber-900 dark:text-amber-100 rounded px-1">${section.exampleVerse.highlight}</mark>`,
                                            )
                                            : section.exampleVerse.arabic,
                                    }}
                                />
                                <p className="text-sm italic text-slate-600 dark:text-slate-400">
                                    &ldquo;{section.exampleVerse.english}&rdquo;
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {section.additionalNotes && section.additionalNotes.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Notes</p>
                            <ul className="space-y-1.5">
                                {section.additionalNotes.map((note, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                        <span className="text-emerald-500 mt-0.5">•</span>
                                        <span>{note}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}

function GrammarTable({ cells }: { cells: GrammarCell[][] }) {
    return (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {cells.map((row, i) => (
                        <tr key={i} className={i === 0 ? "bg-slate-50 dark:bg-slate-800/60" : "bg-white dark:bg-slate-900"}>
                            {row.map((cell, j) => (
                                <td
                                    key={j}
                                    className={cn(
                                        "p-2 align-middle",
                                        cell.header && "text-[10px] font-semibold uppercase tracking-wider text-slate-500",
                                    )}
                                >
                                    {cell.arabic && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-amiri text-xl text-slate-900 dark:text-white" dir="rtl">{cell.arabic}</span>
                                            {!cell.header && (
                                                <ArabicAudioButton text={cell.arabic} size="sm" />
                                            )}
                                        </div>
                                    )}
                                    {cell.transliteration && (
                                        <span className="italic text-slate-500 text-xs">{cell.transliteration}</span>
                                    )}
                                    {cell.english && (
                                        <span className={cn(
                                            cell.header ? "" : "text-xs text-slate-600 dark:text-slate-400",
                                        )}>
                                            {cell.english}
                                        </span>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
