import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ListMusic, Loader2, Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/contexts/PlayerContext";

export const MINI_PLAYER_HEIGHT = "4.75rem";

function useProgress(audio: HTMLAudioElement | null) {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        if (!audio) return;
        const update = () => setProgress(audio.duration > 0 ? audio.currentTime / audio.duration : 0);
        audio.addEventListener("timeupdate", update);
        audio.addEventListener("emptied", update);
        return () => {
            audio.removeEventListener("timeupdate", update);
            audio.removeEventListener("emptied", update);
        };
    }, [audio]);
    return progress;
}

export function nowPlayingDetail(nowPlaying: NonNullable<ReturnType<typeof usePlayer>["nowPlaying"]>): string {
    const { surah, mode, ayah, kind, pos, total } = nowPlaying;
    if (mode === "arabic" || !ayah) return total > 1 ? `Surah ${pos + 1} of ${total}` : "Whole surah";
    const part = mode === "arabic-translation" ? (kind === "arabic" ? "Arabic" : "Translation") : "Translation";
    return `Verse ${ayah} of ${surah.ayahs} · ${part}`;
}

/**
 * The playlist that is playing, pinned to the bottom of every page. Sits inside
 * the safe area, so on iPhone Duo it stops short of the right-hand rail.
 */
export default function MiniPlayer() {
    const { nowPlaying, status, audio, toggle, next, previous, stop } = usePlayer();
    const progress = useProgress(audio);
    const location = useLocation();

    if (!nowPlaying) return null;

    // Segments within a surah (verse by verse) fill the bar by verse, not by file.
    const surahProgress =
        nowPlaying.mode === "arabic" || !nowPlaying.ayah
            ? progress
            : (nowPlaying.ayah - 1 + progress) / nowPlaying.surah.ayahs;

    return (
        <div
            role="region"
            aria-label="Now playing"
            className="fixed z-40"
            style={{
                left: "env(safe-area-inset-left)",
                right: "env(safe-area-inset-right)",
                // A page with its own bottom bar (the Quran reader) sets these so this sits above it.
                bottom: "var(--mq-page-bar, 0px)",
                paddingBottom: "var(--mq-mini-pad, env(safe-area-inset-bottom))",
            }}
        >
            <div className="mx-auto max-w-3xl px-2 pb-2 sm:px-4">
                <div className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-white/95 shadow-2xl shadow-emerald-900/15 backdrop-blur dark:border-emerald-900/50 dark:bg-slate-900/95">
                    <div className="h-1 bg-emerald-100 dark:bg-emerald-950">
                        <div className="h-full bg-emerald-600 transition-[width] duration-300" style={{ width: `${Math.min(100, surahProgress * 100)}%` }} />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2">
                        <Link
                            to="/playlists"
                            aria-current={location.pathname === "/playlists" ? "page" : undefined}
                            className="flex min-w-0 flex-1 items-center gap-3"
                        >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-amiri text-lg text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                                {nowPlaying.surah.number}
                            </span>
                            <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                                    {nowPlaying.surah.englishName}
                                    <span className="ml-2 font-amiri font-normal text-emerald-700 dark:text-emerald-300">{nowPlaying.surah.arabicName}</span>
                                </span>
                                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                                    <ListMusic className="mr-1 inline h-3 w-3" />
                                    {nowPlayingDetail(nowPlaying)} · {nowPlaying.playlistName}
                                </span>
                            </span>
                        </Link>
                        <div className="flex shrink-0 items-center">
                            <Button variant="ghost" size="icon" aria-label="Previous surah" onClick={previous} className="h-9 w-9 rounded-xl">
                                <SkipBack className="h-4 w-4" />
                            </Button>
                            <Button
                                size="icon"
                                aria-label={status === "playing" ? "Pause" : "Play"}
                                onClick={toggle}
                                className="h-10 w-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                {status === "loading" ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : status === "playing" ? (
                                    <Pause className="h-5 w-5" />
                                ) : (
                                    <Play className="ml-0.5 h-5 w-5" />
                                )}
                            </Button>
                            <Button variant="ghost" size="icon" aria-label="Next surah" onClick={next} className="h-9 w-9 rounded-xl">
                                <SkipForward className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" aria-label="Close player" onClick={stop} className="h-9 w-9 rounded-xl text-slate-400">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
