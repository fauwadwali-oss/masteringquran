import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Eraser, Eye, EyeOff, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LessonLayout from "@/components/LessonLayout";
import ArabicAudioButton from "@/components/ArabicAudioButton";
import { cn } from "@/lib/utils";
import { LETTERS, type ArabicLetter } from "@/lib/content/arabic-foundations";

// Canvas dimensions
const W = 500;
const H = 500;
const STROKE = 6;

export default function LearnWriting() {
    const [idx, setIdx] = useState(0);
    const [showTemplate, setShowTemplate] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawingRef = useRef(false);
    const lastRef = useRef<{ x: number; y: number } | null>(null);

    const letter: ArabicLetter = LETTERS[idx];

    // Reset canvas when letter changes
    useEffect(() => {
        const c = canvasRef.current;
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H);
    }, [idx]);

    const clear = () => {
        const c = canvasRef.current;
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H);
    };

    const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const c = canvasRef.current!;
        const rect = c.getBoundingClientRect();
        return {
            x: ((e.clientX - rect.left) * c.width) / rect.width,
            y: ((e.clientY - rect.top) * c.height) / rect.height,
        };
    };

    const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        drawingRef.current = true;
        lastRef.current = getPoint(e);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawingRef.current) return;
        const c = canvasRef.current;
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        const pt = getPoint(e);
        const last = lastRef.current ?? pt;
        ctx.lineWidth = STROKE;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#064e3b"; // emerald-900
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
        lastRef.current = pt;
    };

    const onPointerUp = () => {
        drawingRef.current = false;
        lastRef.current = null;
    };

    const next = () => {
        clear();
        setIdx((i) => (i + 1) % LETTERS.length);
    };
    const prev = () => {
        clear();
        setIdx((i) => (i - 1 + LETTERS.length) % LETTERS.length);
    };

    return (
        <LessonLayout lessonId="writing">
            <Card>
                <CardContent className="p-5 space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <p>
                        Reading Arabic is one thing, <strong>writing</strong> it is another. Arabic is written right-to-left, with cursive letters that connect (except for the six non-joining letters you met in Lesson 2).
                    </p>
                    <p>
                        Use the canvas below to trace each letter. A light template is shown in the background, draw on top of it with your finger or mouse. Think of it like learning to write cursive English, the letterforms stick through muscle memory, not memorization.
                    </p>
                </CardContent>
            </Card>

            {/* Letter grid selector */}
            <Card>
                <CardContent className="p-3">
                    <div className="grid grid-cols-7 md:grid-cols-14 gap-1">
                        {LETTERS.map((l, i) => (
                            <button
                                key={l.char}
                                onClick={() => {
                                    clear();
                                    setIdx(i);
                                }}
                                className={cn(
                                    "aspect-square rounded-md border text-center transition-all",
                                    i === idx
                                        ? "border-emerald-500 bg-emerald-100 dark:bg-emerald-950/60 ring-2 ring-emerald-300"
                                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300",
                                )}
                            >
                                <span className="font-amiri text-xl text-slate-900 dark:text-white leading-none" dir="rtl">{l.char}</span>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Tracing canvas */}
            <Card className="border border-emerald-200 dark:border-emerald-900/40">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                Letter {idx + 1} of {LETTERS.length}
                            </p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {letter.transliteration}
                            </h3>
                            <p className="font-amiri text-slate-500" dir="rtl">{letter.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ArabicAudioButton text={letter.name} size="lg" />
                        </div>
                    </div>

                    <div className="relative mx-auto" style={{ maxWidth: W }}>
                        {/* Template letter, rendered as giant background character */}
                        {showTemplate && (
                            <div
                                aria-hidden
                                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                                style={{ fontFamily: "Amiri, serif" }}
                            >
                                <span
                                    className="font-amiri text-slate-200 dark:text-slate-700"
                                    style={{ fontSize: `${W * 0.78}px`, lineHeight: 1 }}
                                    dir="rtl"
                                >
                                    {letter.char}
                                </span>
                            </div>
                        )}
                        {/* Baseline reference line */}
                        <div
                            aria-hidden
                            className="absolute left-6 right-6 border-t border-dashed border-slate-300 dark:border-slate-700 pointer-events-none"
                            style={{ top: `${H * 0.62}px` }}
                        />
                        <canvas
                            ref={canvasRef}
                            width={W}
                            height={H}
                            onPointerDown={onPointerDown}
                            onPointerMove={onPointerMove}
                            onPointerUp={onPointerUp}
                            onPointerCancel={onPointerUp}
                            onPointerLeave={onPointerUp}
                            className="w-full aspect-square rounded-xl border-2 border-emerald-200 dark:border-emerald-900/40 bg-white dark:bg-slate-900 touch-none cursor-crosshair"
                            style={{ touchAction: "none" }}
                        />
                    </div>

                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        <Button variant="outline" onClick={clear}>
                            <Eraser className="h-4 w-4" /> Clear
                        </Button>
                        <Button variant="outline" onClick={() => setShowTemplate((s) => !s)}>
                            {showTemplate ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {showTemplate ? "Hide template" : "Show template"}
                        </Button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 pt-2">
                        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Makhraj (articulation)</p>
                            <p className="text-xs text-slate-700 dark:text-slate-300">{letter.makhraj}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Example word</p>
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <p className="font-amiri text-2xl text-slate-900 dark:text-white" dir="rtl">{letter.exampleWord}</p>
                                    <p className="text-xs text-slate-500">{letter.exampleWordMeaning}</p>
                                </div>
                                <ArabicAudioButton text={letter.exampleWord} size="sm" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2">
                        <Button variant="outline" onClick={prev}>
                            <ArrowLeft className="h-4 w-4" /> Previous letter
                        </Button>
                        <Button onClick={next}>
                            Next letter <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-slate-100 dark:border-slate-800">
                <CardContent className="p-4 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                        <Info className="h-3.5 w-3.5" /> Writing tips
                    </div>
                    <ul className="list-disc pl-5 space-y-1 leading-relaxed">
                        <li><strong>Right to left.</strong> Arabic words flow from right to left; start each letter from the right edge.</li>
                        <li><strong>Stay on the line.</strong> Most of the letter sits on the baseline (the dashed line). Letters like ر and و drop below it.</li>
                        <li><strong>Dots matter.</strong> The dots above or below letters (like in ب ت ث) change the letter entirely. Practice placing them precisely.</li>
                        <li><strong>Ignore the 'perfect' feel.</strong> Even natives don't write like a printed font. Focus on recognizability, not perfection.</li>
                        <li><strong>Repeat often.</strong> Five minutes of daily practice beats one long session per week.</li>
                    </ul>
                </CardContent>
            </Card>
        </LessonLayout>
    );
}
