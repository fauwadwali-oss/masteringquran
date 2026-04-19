import { useEffect, useState } from "react";
import { Trophy, CheckCircle2, XCircle, RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";

const SURAH_NAMES: Record<number, string> = {
    1: "Al-Fatihah", 2: "Al-Baqarah", 3: "Aal-Imran", 4: "An-Nisa", 5: "Al-Ma'idah",
    6: "Al-An'am", 7: "Al-A'raf", 8: "Al-Anfal", 9: "At-Tawbah", 10: "Yunus",
    11: "Hud", 12: "Yusuf", 13: "Ar-Ra'd", 14: "Ibrahim", 15: "Al-Hijr",
    16: "An-Nahl", 17: "Al-Isra", 18: "Al-Kahf", 19: "Maryam", 20: "Ta-Ha",
    36: "Ya-Sin", 55: "Ar-Rahman", 56: "Al-Waqi'ah", 67: "Al-Mulk", 112: "Al-Ikhlas",
    113: "Al-Falaq", 114: "An-Nas",
};

type Mode = "verse_surah" | "name_meaning" | null;

interface VerseQ {
    verse_key: string;
    arabic: string;
    english: string;
    correctSurah: number;
    options: number[];
}

interface NameQ {
    number: number;
    arabic: string;
    transliteration: string;
    correctEnglish: string;
    options: string[];
}

const shuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

async function fetchVerseQuestion(): Promise<VerseQ> {
    const r = await fetch("https://api.quran.com/api/v4/verses/random?translations=22&language=en&fields=text_uthmani");
    const d: any = await r.json();
    const v = d.verse;
    const correctSurah = parseInt(v.verse_key.split(":")[0]);
    // Generate 3 wrong answers — prefer close-by surahs for difficulty
    const wrong = new Set<number>();
    while (wrong.size < 3) {
        const delta = (Math.floor(Math.random() * 20) - 10) || 5;
        const candidate = Math.max(1, Math.min(114, correctSurah + delta));
        if (candidate !== correctSurah) wrong.add(candidate);
    }
    return {
        verse_key: v.verse_key,
        arabic: v.text_uthmani,
        english: (v.translations?.[0]?.text || "").replace(/<[^>]+>/g, ""),
        correctSurah,
        options: shuffle([correctSurah, ...Array.from(wrong)]),
    };
}

async function fetchNameQuestion(): Promise<NameQ> {
    // pick a random 1-99
    const n = Math.floor(Math.random() * 99) + 1;
    const r = await fetch(`https://ummahapi.com/api/asma-ul-husna/${n}`);
    const d: any = await r.json();
    const target = d.data?.name || d.data;
    // Fetch all to build distractors
    const all = await fetch("https://ummahapi.com/api/asma-ul-husna").then((x) => x.json());
    const allList = Array.isArray(all.data) ? all.data : all.data?.names || [];
    const distractors = shuffle(allList.filter((x: any) => x.number !== target.number))
        .slice(0, 3)
        .map((x: any) => x.english as string);
    return {
        number: target.number,
        arabic: target.arabic,
        transliteration: target.transliteration,
        correctEnglish: target.english,
        options: shuffle([target.correctEnglish || target.english, ...distractors]),
    };
}

export default function Quiz() {
    const [mode, setMode] = useState<Mode>(null);
    const [score, setScore] = useState({ right: 0, wrong: 0 });
    const [q, setQ] = useState<VerseQ | NameQ | null>(null);
    const [loading, setLoading] = useState(false);
    const [picked, setPicked] = useState<string | number | null>(null);

    const loadNext = async () => {
        setLoading(true);
        setPicked(null);
        try {
            if (mode === "verse_surah") setQ(await fetchVerseQuestion());
            else if (mode === "name_meaning") setQ(await fetchNameQuestion());
        } catch {
            setQ(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (mode) loadNext();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    const start = (m: Mode) => {
        setMode(m);
        setScore({ right: 0, wrong: 0 });
    };

    const answer = (pick: string | number) => {
        if (picked !== null || !q) return;
        setPicked(pick);
        let correct = false;
        if (mode === "verse_surah" && "correctSurah" in q!) {
            correct = pick === q.correctSurah;
        } else if (mode === "name_meaning" && "correctEnglish" in q!) {
            correct = pick === q.correctEnglish;
        }
        setScore((s) => ({ right: s.right + (correct ? 1 : 0), wrong: s.wrong + (correct ? 0 : 1) }));
    };

    const resetAll = () => {
        setMode(null);
        setScore({ right: 0, wrong: 0 });
        setQ(null);
    };

    if (!mode) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
                <SEO title="Quiz - Mastering Quran" description="Test your knowledge of the Quran and the 99 Names of Allah with interactive quizzes." />
                <section className="py-16 px-6">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div className="text-center space-y-3">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-full border border-blue-200 dark:border-blue-800">
                                <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Practice</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Quiz
                            </h1>
                            <p className="text-slate-600 dark:text-slate-300">Pick a mode to get started.</p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <Card role="button" tabIndex={0} onClick={() => start("verse_surah")} className="cursor-pointer border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-400 transition-all hover:shadow-lg">
                                <CardContent className="p-6 space-y-3">
                                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center text-2xl">📖</div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Which Surah?</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">A random verse appears — pick the Surah it comes from.</p>
                                </CardContent>
                            </Card>
                            <Card role="button" tabIndex={0} onClick={() => start("name_meaning")} className="cursor-pointer border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-amber-400 transition-all hover:shadow-lg">
                                <CardContent className="p-6 space-y-3">
                                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center text-2xl">✨</div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">99 Names meaning</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Pick the English meaning of a random Name of Allah.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            <SEO title="Quiz - Mastering Quran" description="Interactive Quran quizzes." />
            <section className="py-12 px-6">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="sm" onClick={resetAll}>← Modes</Button>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-emerald-600 font-semibold"><CheckCircle2 className="inline h-4 w-4 mr-1" />{score.right}</span>
                            <span className="text-rose-600 font-semibold"><XCircle className="inline h-4 w-4 mr-1" />{score.wrong}</span>
                        </div>
                    </div>

                    {loading || !q ? (
                        <Card className="p-16 text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
                        </Card>
                    ) : (
                        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <CardContent className="p-8 space-y-6">
                                {mode === "verse_surah" && "arabic" in q && (
                                    <>
                                        <p className="font-amiri text-3xl leading-loose text-slate-900 dark:text-slate-100 text-right" dir="rtl">
                                            {(q as VerseQ).arabic}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 italic">{(q as VerseQ).english}</p>
                                        <p className="text-xs text-slate-400 font-medium">Which Surah is this verse from?</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(q as VerseQ).options.map((n) => {
                                                const correct = n === (q as VerseQ).correctSurah;
                                                const showResult = picked !== null;
                                                const isPicked = picked === n;
                                                return (
                                                    <button
                                                        key={n}
                                                        disabled={picked !== null}
                                                        onClick={() => answer(n)}
                                                        className={`p-3 rounded-xl border text-sm font-medium transition-colors text-left ${showResult ? (correct ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300" : isPicked ? "border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300" : "border-slate-200 dark:border-slate-700 text-slate-500") : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20"}`}
                                                    >
                                                        {n}. {SURAH_NAMES[n] || `Surah ${n}`}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}

                                {mode === "name_meaning" && "arabic" in q && (
                                    <>
                                        <div className="text-center space-y-2">
                                            <p className="font-amiri text-5xl text-amber-700 dark:text-amber-400" dir="rtl">
                                                {(q as NameQ).arabic}
                                            </p>
                                            <p className="text-slate-600 dark:text-slate-300 italic">{(q as NameQ).transliteration}</p>
                                        </div>
                                        <p className="text-xs text-slate-400 text-center font-medium">What is the English meaning?</p>
                                        <div className="grid grid-cols-1 gap-2">
                                            {(q as NameQ).options.map((text) => {
                                                const correct = text === (q as NameQ).correctEnglish;
                                                const showResult = picked !== null;
                                                const isPicked = picked === text;
                                                return (
                                                    <button
                                                        key={text}
                                                        disabled={picked !== null}
                                                        onClick={() => answer(text)}
                                                        className={`p-3 rounded-xl border text-sm font-medium transition-colors text-left ${showResult ? (correct ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300" : isPicked ? "border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300" : "border-slate-200 dark:border-slate-700 text-slate-500") : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-950/20"}`}
                                                    >
                                                        {text}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}

                                {picked !== null && (
                                    <Button onClick={loadNext} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                        Next question
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <p className="text-center text-xs text-slate-500">
                        {score.right + score.wrong > 0 && `Accuracy: ${Math.round((score.right / (score.right + score.wrong)) * 100)}%`}
                    </p>
                </div>
            </section>
        </div>
    );
}
