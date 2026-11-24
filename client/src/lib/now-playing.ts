import { Capacitor } from "@capacitor/core";
import { surahArtwork, type ArtworkSurah } from "@/lib/now-playing-artwork";
import { MediaSession as NativeMediaSession } from "@capgo/capacitor-media-session";

// Lock screen, notification and headset controls for the player.
// Browsers and iOS use the web Media Session API. On Android the WebView has
// no media notification and pauses audio once the app is in the background,
// so a native media session runs a "media playback" foreground service there.

export type NowPlayingAction = "play" | "pause" | "previoustrack" | "nexttrack" | "seekto" | "stop";
export type NowPlayingHandler = (details: { seekTime?: number | null }) => void;

export interface NowPlayingMetadata {
    title: string;
    artist: string;
    album: string;
    /** Used to draw the artwork. */
    surah?: ArtworkSurah;
}

const useNative = Capacitor.getPlatform() === "android";

const web = () => (typeof navigator !== "undefined" && "mediaSession" in navigator ? navigator.mediaSession : null);

// The native side loads artwork itself, so it needs a URL on the internet.
const ARTWORK = useNative
    ? [{ src: "https://masteringquran.com/favicon-512.png", sizes: "512x512", type: "image/png" }]
    : [
        { src: "/favicon-512.png", sizes: "512x512", type: "image/png" },
        { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ];

let nudge = 0;
const ignore = () => undefined;

let current = 0;
// The native session keeps its artwork, so it is only sent again when the surah changes.
let nativeArtwork: string | null = null;

function apply({ title, artist, album }: NowPlayingMetadata, artwork: { src: string; sizes: string; type: string }[], key: string): void {
    if (useNative) {
        const changed = nativeArtwork !== key;
        nativeArtwork = key;
        NativeMediaSession.setMetadata({ title, artist, album, ...(changed ? { artwork } : {}) }).catch(ignore);
        return;
    }
    const ms = web();
    if (ms && typeof MediaMetadata !== "undefined") ms.metadata = new MediaMetadata({ title, artist, album, artwork });
}

export function setNowPlayingMetadata(meta: NowPlayingMetadata | null): void {
    const token = ++current;
    if (!meta) {
        nativeArtwork = null;
        const ms = web();
        if (!useNative && ms) ms.metadata = null;
        return;
    }
    const drawn = meta.surah ? surahArtwork.cached(meta.surah) : null;
    if (drawn) {
        apply(meta, [{ src: drawn, sizes: "512x512", type: "image/png" }], `surah-${meta.surah!.number}`);
        return;
    }
    apply(meta, ARTWORK, "logo");
    if (!meta.surah) return;
    const surah = meta.surah;
    void surahArtwork.draw(surah).then((src) => {
        if (src && token === current) apply(meta, [{ src, sizes: "512x512", type: "image/png" }], `surah-${surah.number}`);
    });
}

export function setNowPlayingState(state: "none" | "paused" | "playing"): void {
    if (useNative) {
        NativeMediaSession.setPlaybackState({ playbackState: state }).catch(ignore);
        return;
    }
    const ms = web();
    if (ms) ms.playbackState = state;
}

export function setNowPlayingHandler(action: NowPlayingAction, handler: NowPlayingHandler | null): void {
    if (useNative) {
        NativeMediaSession.setActionHandler({ action }, handler ? (d) => handler({ seekTime: d.seekTime }) : null).catch(ignore);
        return;
    }
    try {
        web()?.setActionHandler(action, handler ? (d) => handler({ seekTime: d.seekTime }) : null);
    } catch {
        // Action not supported in this browser.
    }
}

export function setNowPlayingPosition(duration: number, position: number, playbackRate: number): void {
    if (useNative) {
        // The native side ignores a position equal to the last one, so each new verse starting
        // at 0 would keep the old verse's progress. A millisecond either way makes it update.
        nudge = nudge ? 0 : 0.001;
        NativeMediaSession.setPositionState({ duration, position: position + nudge, playbackRate }).catch(ignore);
        return;
    }
    const ms = web();
    if (!ms || typeof ms.setPositionState !== "function") return;
    try {
        ms.setPositionState({ duration, position, playbackRate });
    } catch {
        // ignore
    }
}
