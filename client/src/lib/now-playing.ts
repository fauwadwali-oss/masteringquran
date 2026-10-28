import { Capacitor } from "@capacitor/core";
import { MediaSession as NativeMediaSession } from "@capgo/capacitor-media-session";

// Lock screen, notification and headset controls for the playlist player.
// Browsers and iOS use the web Media Session API. On Android the WebView has
// no media notification and pauses audio once the app is in the background,
// so a native media session runs a "media playback" foreground service there.

export type NowPlayingAction = "play" | "pause" | "previoustrack" | "nexttrack" | "seekto" | "stop";
export type NowPlayingHandler = (details: { seekTime?: number | null }) => void;

export interface NowPlayingMetadata {
    title: string;
    artist: string;
    album: string;
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

const ignore = () => undefined;

export function setNowPlayingMetadata(meta: NowPlayingMetadata | null): void {
    if (useNative) {
        if (meta) NativeMediaSession.setMetadata({ ...meta, artwork: ARTWORK }).catch(ignore);
        return;
    }
    const ms = web();
    if (!ms) return;
    if (!meta) {
        ms.metadata = null;
        return;
    }
    if (typeof MediaMetadata !== "undefined") ms.metadata = new MediaMetadata({ ...meta, artwork: ARTWORK });
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
        NativeMediaSession.setPositionState({ duration, position, playbackRate }).catch(ignore);
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
