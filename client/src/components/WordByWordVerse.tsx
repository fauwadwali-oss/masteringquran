import { useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Play, Pause } from "lucide-react";

export interface QuranWord {
    position: number;
    text_uthmani?: string;
    text?: string;
    audio_url?: string;
    char_type_name?: string;
    translation?: { text: string; language_name?: string };
    transliteration?: { text: string; language_name?: string };
}

interface WordByWordVerseProps {
    words: QuranWord[];
}

const AUDIO_BASE = "https://verses.quran.com/";

const normalizeWordAudio = (url?: string): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith("http")) return url;
    if (url.startsWith("//")) return "https:" + url;
    return AUDIO_BASE + url;
};

function WordPopover({ word }: { word: QuranWord }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playing, setPlaying] = useState(false);
    const audioUrl = normalizeWordAudio(word.audio_url);

    const togglePlay = () => {
        if (!audioUrl) return;
        if (!audioRef.current) {
            audioRef.current = new Audio(audioUrl);
            audioRef.current.onended = () => setPlaying(false);
        }
        if (playing) {
            audioRef.current.pause();
            setPlaying(false);
        } else {
            audioRef.current.play().catch(() => setPlaying(false));
            setPlaying(true);
        }
    };

    const arabic = word.text_uthmani || word.text || "";
    const translit = word.transliteration?.text;
    const english = word.translation?.text;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="inline-block mx-1 px-2 py-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 focus:bg-emerald-100 dark:focus:bg-emerald-900/30 focus:outline-none transition-colors font-amiri cursor-pointer"
                    dir="rtl"
                >
                    {arabic}
                </button>
            </PopoverTrigger>
            <PopoverContent align="center" side="top" className="w-64 p-4" sideOffset={8}>
                <div className="space-y-3">
                    <p className="font-amiri text-3xl text-center text-emerald-800 dark:text-emerald-300" dir="rtl">
                        {arabic}
                    </p>
                    {translit && (
                        <div>
                            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Transliteration</p>
                            <p className="text-slate-700 dark:text-slate-200 italic">{translit}</p>
                        </div>
                    )}
                    {english && (
                        <div>
                            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Meaning</p>
                            <p className="text-slate-700 dark:text-slate-200">{english}</p>
                        </div>
                    )}
                    {audioUrl && (
                        <button
                            type="button"
                            onClick={togglePlay}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
                        >
                            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            {playing ? "Pause" : "Play word"}
                        </button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default function WordByWordVerse({ words }: WordByWordVerseProps) {
    return (
        <p
            className="text-3xl md:text-4xl lg:text-[2.5rem] leading-[2.5] text-slate-900 dark:text-slate-100 text-right flex flex-wrap justify-end gap-y-1"
            dir="rtl"
        >
            {words.map((word, i) => {
                // "end" type words are verse-end markers (ayah number glyph) — render non-interactive
                if (word.char_type_name === "end") {
                    return (
                        <span key={i} className="font-amiri text-emerald-600 mx-1">
                            {word.text_uthmani || word.text}
                        </span>
                    );
                }
                return <WordPopover key={i} word={word} />;
            })}
        </p>
    );
}
