import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Audio source priority:
//   1. External URL (e.g. Quran.com CDN word audio) — highest quality, real reciter
//   2. Browser SpeechSynthesis with an Arabic voice — fallback for any text
//   3. Error icon if neither works (rare)
// The caller provides Arabic text; if they also provide `audioUrl`, that wins.

interface Props {
    text: string;               // Arabic text (for SpeechSynthesis fallback)
    audioUrl?: string;          // optional pre-recorded URL (Quran.com)
    size?: "sm" | "md" | "lg";
    className?: string;
    rate?: number;              // SpeechSynthesis rate (default 0.7, slower for learning)
    label?: string;             // aria-label; defaults to "Play pronunciation"
}

let cachedArabicVoice: SpeechSynthesisVoice | null | undefined = undefined;

function findArabicVoice(): SpeechSynthesisVoice | null {
    if (cachedArabicVoice !== undefined) return cachedArabicVoice;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        cachedArabicVoice = null;
        return null;
    }
    const voices = window.speechSynthesis.getVoices();
    // Preference order: Saudi > Egyptian > any Arabic
    const preferred =
        voices.find((v) => v.lang === "ar-SA") ||
        voices.find((v) => v.lang === "ar-EG") ||
        voices.find((v) => v.lang.startsWith("ar"));
    cachedArabicVoice = preferred ?? null;
    return cachedArabicVoice;
}

// Voices may load asynchronously; listen once and reset cache.
if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        cachedArabicVoice = undefined;
    };
}

export default function ArabicAudioButton({
    text,
    audioUrl,
    size = "md",
    className,
    rate = 0.75,
    label = "Play pronunciation",
}: Props) {
    const [playing, setPlaying] = useState(false);
    const [err, setErr] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        return () => {
            // Stop anything playing on unmount
            if (audioRef.current) {
                audioRef.current.pause();
            }
            if (utteranceRef.current) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const stopAll = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        utteranceRef.current = null;
        setPlaying(false);
    };

    const play = async () => {
        if (playing) {
            stopAll();
            return;
        }
        setErr(false);
        setPlaying(true);

        // Try external URL first
        if (audioUrl) {
            try {
                const a = new Audio(audioUrl);
                audioRef.current = a;
                a.onended = () => {
                    setPlaying(false);
                    audioRef.current = null;
                };
                a.onerror = () => {
                    setPlaying(false);
                    audioRef.current = null;
                    // Fall back to SpeechSynthesis
                    speak();
                };
                await a.play();
                return;
            } catch {
                // Autoplay might fail; fall through to speech synthesis
            }
        }
        speak();
    };

    const speak = () => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
            setErr(true);
            setPlaying(false);
            return;
        }
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = "ar-SA";
        utt.rate = rate;
        const voice = findArabicVoice();
        if (voice) utt.voice = voice;
        utt.onend = () => {
            setPlaying(false);
            utteranceRef.current = null;
        };
        utt.onerror = () => {
            setErr(true);
            setPlaying(false);
            utteranceRef.current = null;
        };
        utteranceRef.current = utt;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utt);
    };

    const sizeClass =
        size === "sm" ? "h-7 w-7" :
        size === "lg" ? "h-10 w-10" :
        "h-8 w-8";
    const iconSize =
        size === "sm" ? "h-3 w-3" :
        size === "lg" ? "h-5 w-5" :
        "h-4 w-4";

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                play();
            }}
            disabled={err}
            aria-label={label}
            title={err ? "Audio unavailable on this device" : playing ? "Stop" : label}
            className={cn(
                "inline-flex items-center justify-center rounded-full transition-all",
                playing
                    ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-400/40"
                    : err
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400",
                sizeClass,
                className,
            )}
        >
            {err ? (
                <VolumeX className={iconSize} />
            ) : playing ? (
                <Loader2 className={cn(iconSize, "animate-spin")} />
            ) : (
                <Volume2 className={iconSize} />
            )}
        </button>
    );
}
