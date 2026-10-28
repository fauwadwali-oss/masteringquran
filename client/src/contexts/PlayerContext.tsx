import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { claimAudioFocus, onAudioFocusLost } from "@/lib/audio-focus";
import { DEFAULT_RECITER, reciterName } from "@/lib/reciters";
import { getSurah, type SurahInfo } from "@/lib/surah-list";
import {
    buildOrder,
    applyEdit,
    loadDeleted,
    loadPlaylists,
    mergeWithAccount,
    payloadKey,
    saveDeleted,
    nextPosition,
    savePlaylists,
    skipBack,
    skipForward,
    translationAudioUrl,
    isTranslationVoice,
    TRANSLATION_VOICES,
    type ListenMode,
    type Playlist,
    type RepeatMode,
    type TranslationVoice,
} from "@/lib/playlists";
import { deletePlaylists, listPlaylists, upsertPlaylists } from "@/lib/queries/playlists";

// One audio element for the whole app, so a playlist keeps playing while the
// reader moves between pages, and the lock screen has a single thing to control.

interface Segment {
    url: string;
    kind: "arabic" | "translation";
    ayah?: number;
}

interface Session {
    playlistId: string;
    playlistName: string;
    surahs: number[];
    mode: ListenMode;
    voice: TranslationVoice;
    order: number[];
    pos: number;
    segments: Segment[];
    seg: number;
}

export type PlayerStatus = "idle" | "loading" | "playing" | "paused";

export interface NowPlaying {
    playlistId: string;
    playlistName: string;
    surah: SurahInfo;
    mode: ListenMode;
    voice: TranslationVoice;
    /** Position in play order, from 0. */
    pos: number;
    total: number;
    /** Set in the verse-by-verse modes. */
    ayah?: number;
    kind: Segment["kind"];
}

interface PlayerContextValue {
    // Playlists
    playlists: Playlist[];
    playlistsReady: boolean;
    setPlaylists: (fn: (list: Playlist[]) => Playlist[]) => void;
    // Settings
    reciter: string;
    setReciter: (id: string) => void;
    repeat: RepeatMode;
    cycleRepeat: () => void;
    shuffle: boolean;
    toggleShuffle: () => void;
    // Playback
    status: PlayerStatus;
    nowPlaying: NowPlaying | null;
    audio: HTMLAudioElement | null;
    playPlaylist: (playlist: Playlist, startIndex?: number) => void;
    toggle: () => void;
    pause: () => void;
    next: () => void;
    previous: () => void;
    stop: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

const SETTINGS_KEY = "mq-player-settings";

function readSettings() {
    try {
        const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
        return {
            reciter: typeof s.reciter === "string" ? s.reciter : DEFAULT_RECITER,
            repeat: (["off", "all", "one"].includes(s.repeat) ? s.repeat : "off") as RepeatMode,
            shuffle: s.shuffle === true,
        };
    } catch {
        return { reciter: DEFAULT_RECITER, repeat: "off" as RepeatMode, shuffle: false };
    }
}

const normalizeAudioUrl = (url: string) =>
    url.startsWith("http") ? url : url.startsWith("//") ? `https:${url}` : `https://verses.quran.com/${url}`;

const segmentCache = new Map<string, Segment[]>();

async function fetchSegments(surah: number, mode: ListenMode, reciter: string, voice: TranslationVoice): Promise<Segment[]> {
    const key = `${surah}|${mode}|${reciter}|${voice}`;
    const cached = segmentCache.get(key);
    if (cached) return cached;

    let segments: Segment[];
    if (mode === "arabic") {
        const r = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${reciter}/${surah}`);
        if (!r.ok) throw new Error(`chapter audio ${r.status}`);
        const url = (await r.json())?.audio_file?.audio_url;
        if (!url) throw new Error("no chapter audio");
        segments = [{ url: normalizeAudioUrl(url), kind: "arabic" }];
    } else {
        const ayahs = getSurah(surah)?.ayahs ?? 0;
        let arabic: string[] = [];
        if (mode === "arabic-translation") {
            const r = await fetch(`https://api.quran.com/api/v4/recitations/${reciter}/by_chapter/${surah}?per_page=300`);
            if (!r.ok) throw new Error(`verse audio ${r.status}`);
            const files: { verse_key: string; url: string }[] = (await r.json())?.audio_files ?? [];
            arabic = Array.from({ length: ayahs }, (_, i) => {
                const f = files.find((x) => x.verse_key === `${surah}:${i + 1}`);
                return f?.url ? normalizeAudioUrl(f.url) : "";
            });
        }
        segments = [];
        for (let ayah = 1; ayah <= ayahs; ayah++) {
            if (mode === "arabic-translation" && arabic[ayah - 1]) segments.push({ url: arabic[ayah - 1], kind: "arabic", ayah });
            segments.push({ url: translationAudioUrl(voice, surah, ayah), kind: "translation", ayah });
        }
    }
    segmentCache.set(key, segments);
    return segments;
}

const mediaSession = () => (typeof navigator !== "undefined" && "mediaSession" in navigator ? navigator.mediaSession : null);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const userId = user?.id ?? null;

    // ── Playlists ────────────────────────────────────────────────────────────
    const [playlists, setPlaylistsState] = useState<Playlist[]>([]);
    const [playlistsReady, setPlaylistsReady] = useState(false);
    const playlistsRef = useRef<Playlist[]>([]);
    const activeUser = useRef<string | null>(null);
    // Account reads and writes run one at a time, in order, so a slow request
    // can never land after a newer one.
    const syncChain = useRef<Promise<void>>(Promise.resolve());

    const commit = useCallback((uid: string, list: Playlist[]) => {
        if (activeUser.current !== uid) return;
        playlistsRef.current = list;
        setPlaylistsState(list);
        savePlaylists(uid, list);
    }, []);

    /** Uploads unsaved changes and pending deletes. Failures are retried on the next change or load. */
    const flush = useCallback((uid: string) => {
        syncChain.current = syncChain.current.then(async () => {
            if (activeUser.current !== uid) return;
            const pending = playlistsRef.current.filter((p) => !p.synced);
            const deleted = loadDeleted(uid);
            if (!pending.length && !deleted.length) return;
            try {
                await upsertPlaylists(uid, pending);
                await deletePlaylists(uid, deleted);
            } catch {
                return;
            }
            if (activeUser.current !== uid) return;
            const sent = new Map(pending.map((p) => [p.id, payloadKey(p)]));
            commit(uid, playlistsRef.current.map((p) => (!p.synced && sent.get(p.id) === payloadKey(p) ? { ...p, synced: true } : p)));
            saveDeleted(uid, loadDeleted(uid).filter((id) => !deleted.includes(id)));
        });
    }, [commit]);

    useEffect(() => {
        activeUser.current = userId;
        playlistsRef.current = [];
        setPlaylistsState([]);
        setPlaylistsReady(false);
        if (!userId) return;
        const uid = userId;
        commit(uid, loadPlaylists(uid));
        setPlaylistsReady(true);
        syncChain.current = syncChain.current.then(async () => {
            if (activeUser.current !== uid) return;
            try {
                const rows = await listPlaylists(uid);
                if (activeUser.current !== uid) return;
                const remote: Playlist[] = rows.map((r) => ({
                    id: r.id,
                    name: r.name,
                    surahs: r.surahs ?? [],
                    mode: r.mode,
                    voice: isTranslationVoice(r.voice) ? r.voice : "en",
                    createdAt: Date.parse(r.created_at) || Date.now(),
                }));
                commit(uid, mergeWithAccount(playlistsRef.current, remote, loadDeleted(uid)));
            } catch {
                // Offline, or the account copy is unavailable: keep the device copy.
            }
        });
        flush(uid);
    }, [userId, commit, flush]);

    const setPlaylists = useCallback((fn: (list: Playlist[]) => Playlist[]) => {
        const uid = activeUser.current;
        if (!uid) return;
        const before = playlistsRef.current;
        const after = fn(before);
        if (after === before) return;
        const { list, removed } = applyEdit(before, after);
        if (removed.length) saveDeleted(uid, Array.from(new Set([...loadDeleted(uid), ...removed])));
        commit(uid, list);
        flush(uid);
    }, [commit, flush]);

    // ── Settings ─────────────────────────────────────────────────────────────
    const [settings, setSettings] = useState(readSettings);
    const settingsRef = useRef(settings);
    settingsRef.current = settings;
    useEffect(() => {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch {
            // ignore
        }
    }, [settings]);

    // ── Playback ─────────────────────────────────────────────────────────────
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const session = useRef<Session | null>(null);
    const loadToken = useRef(0);
    // Bumped on every new source, so a late play() rejection or ended event from an old one is ignored.
    const playGen = useRef(0);
    const [status, setStatus] = useState<PlayerStatus>("idle");
    const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);

    const publish = useCallback(() => {
        const s = session.current;
        if (!s) {
            setNowPlaying(null);
            return;
        }
        const surah = getSurah(s.surahs[s.order[s.pos]])!;
        const segment = s.segments[s.seg];
        setNowPlaying({
            playlistId: s.playlistId,
            playlistName: s.playlistName,
            surah,
            mode: s.mode,
            voice: s.voice,
            pos: s.pos,
            total: s.order.length,
            ayah: segment?.ayah,
            kind: segment?.kind ?? (s.mode === "translation" ? "translation" : "arabic"),
        });
    }, []);

    const playSegment = useCallback((index: number) => {
        const s = session.current;
        const el = audioRef.current;
        if (!s || !el || !s.segments[index]) return;
        s.seg = index;
        const gen = ++playGen.current;
        el.src = s.segments[index].url;
        claimAudioFocus("playlist");
        el.play().catch((e) => {
            if (gen === playGen.current && e?.name !== "AbortError") setStatus("paused");
        });
        publish();
    }, [publish]);

    const loadTrack = useCallback(async (pos: number) => {
        const s = session.current;
        if (!s) return;
        const token = ++loadToken.current;
        const surahNumber = s.surahs[s.order[pos]];
        s.pos = pos;
        s.segments = [];
        s.seg = 0;
        playGen.current++;
        audioRef.current?.pause();
        setStatus("loading");
        publish();
        try {
            const segments = await fetchSegments(surahNumber, s.mode, settingsRef.current.reciter, s.voice);
            if (token !== loadToken.current || session.current !== s) return;
            s.segments = segments;
            playSegment(0);
        } catch {
            if (token !== loadToken.current) return;
            setStatus("paused");
            toast.error(`Could not load ${getSurah(surahNumber)?.englishName ?? "this surah"}. Check your connection and try again.`);
        }
    }, [playSegment, publish]);

    /** True when the audio element is playing what the session expects, not a leftover source. */
    const isCurrentSource = useCallback(() => {
        const s = session.current;
        const el = audioRef.current;
        return !!s && !!el && s.segments.length > 0 && el.src === s.segments[s.seg]?.url;
    }, []);

    const handleEnded = useCallback(() => {
        const s = session.current;
        if (!s || !isCurrentSource()) return;
        if (s.seg + 1 < s.segments.length) {
            playSegment(s.seg + 1);
            return;
        }
        const next = nextPosition(s.pos, s.order.length, settingsRef.current.repeat);
        if (next === null) {
            setStatus("paused");
            s.seg = 0;
            publish();
            return;
        }
        if (next === s.pos) playSegment(0);
        else void loadTrack(next);
    }, [isCurrentSource, loadTrack, playSegment, publish]);

    const playPlaylist = useCallback((playlist: Playlist, startIndex = 0) => {
        if (!playlist.surahs.length) return;
        const start = Math.min(Math.max(0, startIndex), playlist.surahs.length - 1);
        const order = buildOrder(playlist.surahs.length, settingsRef.current.shuffle, start);
        session.current = {
            playlistId: playlist.id,
            playlistName: playlist.name,
            surahs: [...playlist.surahs],
            mode: playlist.mode,
            voice: playlist.voice,
            order,
            pos: 0,
            segments: [],
            seg: 0,
        };
        void loadTrack(settingsRef.current.shuffle ? 0 : start);
    }, [loadTrack]);

    const pause = useCallback(() => {
        audioRef.current?.pause();
    }, []);

    const toggle = useCallback(() => {
        const el = audioRef.current;
        const s = session.current;
        if (!el || !s) return;
        if (!s.segments.length) {
            void loadTrack(s.pos);
            return;
        }
        if (el.paused) {
            if (!el.src || el.ended) {
                playSegment(s.seg);
                return;
            }
            claimAudioFocus("playlist");
            const gen = playGen.current;
            el.play().catch((e) => {
                if (gen === playGen.current && e?.name !== "AbortError") setStatus("paused");
            });
        } else {
            el.pause();
        }
    }, [loadTrack, playSegment]);

    const next = useCallback(() => {
        const s = session.current;
        if (s) void loadTrack(skipForward(s.pos, s.order.length));
    }, [loadTrack]);

    const previous = useCallback(() => {
        const s = session.current;
        const el = audioRef.current;
        if (!s) return;
        // Like a music app: the first press goes back to the start of this surah.
        const started = s.mode === "arabic" ? (el?.currentTime ?? 0) > 3 : s.seg > 1;
        if (started) playSegment(0);
        else void loadTrack(skipBack(s.pos, s.order.length));
    }, [loadTrack, playSegment]);

    const stop = useCallback(() => {
        loadToken.current++;
        playGen.current++;
        session.current = null;
        const el = audioRef.current;
        if (el) {
            el.pause();
            el.removeAttribute("src");
            el.load();
        }
        setStatus("idle");
        setNowPlaying(null);
        const ms = mediaSession();
        if (ms) {
            ms.metadata = null;
            ms.playbackState = "none";
        }
    }, []);

    const cycleRepeat = useCallback(() => {
        setSettings((s) => ({ ...s, repeat: s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off" }));
    }, []);

    const toggleShuffle = useCallback(() => {
        const shuffle = !settingsRef.current.shuffle;
        const s = session.current;
        if (s) {
            // Keep the current surah playing and reorder what comes after it.
            const current = s.order[s.pos];
            s.order = buildOrder(s.surahs.length, shuffle, current);
            s.pos = shuffle ? 0 : current;
            publish();
        }
        setSettings((prev) => ({ ...prev, shuffle }));
    }, [publish]);

    const setReciter = useCallback((reciter: string) => setSettings((s) => ({ ...s, reciter })), []);

    // Stop when the reader signs out: playlists belong to the account.
    useEffect(() => {
        if (!userId) stop();
    }, [userId, stop]);

    // Other audio on the page (a verse, the whole-surah button) pauses the playlist.
    useEffect(() => onAudioFocusLost("playlist", () => audioRef.current?.pause()), []);

    // Audio element events
    useEffect(() => {
        const el = audioRef.current;
        if (!el) return;
        const onPlay = () => {
            setStatus("playing");
            const ms = mediaSession();
            if (ms) ms.playbackState = "playing";
        };
        const onPause = () => {
            if (el.ended) return;
            setStatus((st) => (st === "loading" ? st : "paused"));
            const ms = mediaSession();
            if (ms) ms.playbackState = "paused";
        };
        const onError = () => {
            const s = session.current;
            if (!s || !isCurrentSource()) return;
            // A missing verse file should not stop the whole playlist.
            if (s.segments.length > 1) handleEnded();
            else {
                setStatus("paused");
                toast.error("This recitation could not be played. Try another reciter.");
            }
        };
        el.addEventListener("play", onPlay);
        el.addEventListener("pause", onPause);
        el.addEventListener("ended", handleEnded);
        el.addEventListener("error", onError);
        return () => {
            el.removeEventListener("play", onPlay);
            el.removeEventListener("pause", onPause);
            el.removeEventListener("ended", handleEnded);
            el.removeEventListener("error", onError);
        };
    }, [audio, handleEnded, isCurrentSource]);

    // Lock screen and notification controls
    useEffect(() => {
        const ms = mediaSession();
        if (!ms) return;
        const handlers: [MediaSessionAction, MediaSessionActionHandler | null][] = [
            ["play", () => {
                if (audioRef.current?.paused) toggle();
            }],
            ["pause", () => pause()],
            ["nexttrack", () => next()],
            ["previoustrack", () => previous()],
            ["stop", () => stop()],
            ["seekto", (d) => {
                const el = audioRef.current;
                if (el && d.seekTime != null && session.current?.mode === "arabic") el.currentTime = d.seekTime;
            }],
        ];
        for (const [action, handler] of handlers) {
            try {
                ms.setActionHandler(action, handler);
            } catch {
                // Action not supported here.
            }
        }
        return () => {
            for (const [action] of handlers) {
                try {
                    ms.setActionHandler(action, null);
                } catch {
                    // ignore
                }
            }
        };
    }, [toggle, pause, next, previous, stop]);

    useEffect(() => {
        const ms = mediaSession();
        if (!ms || !nowPlaying || typeof MediaMetadata === "undefined") return;
        const { surah, mode, ayah, kind, playlistName } = nowPlaying;
        const voice = TRANSLATION_VOICES.find((v) => v.id === nowPlaying.voice);
        const artist = kind === "translation" ? (voice ? `${voice.label} translation, ${voice.credit}` : "Translation") : reciterName(settings.reciter);
        ms.metadata = new MediaMetadata({
            title: mode === "arabic" || !ayah ? surah.englishName : `${surah.englishName}, verse ${ayah}`,
            artist,
            album: playlistName,
            artwork: [
                { src: "/favicon-512.png", sizes: "512x512", type: "image/png" },
                { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
            ],
        });
    }, [nowPlaying, settings.reciter]);

    // Seek bar on the lock screen, for whole-surah audio.
    useEffect(() => {
        const el = audioRef.current;
        const ms = mediaSession();
        if (!el || !ms || typeof ms.setPositionState !== "function") return;
        const update = () => {
            if (session.current?.mode !== "arabic" || !Number.isFinite(el.duration) || el.duration <= 0) return;
            try {
                ms.setPositionState({ duration: el.duration, position: Math.min(el.currentTime, el.duration), playbackRate: el.playbackRate });
            } catch {
                // ignore
            }
        };
        el.addEventListener("loadedmetadata", update);
        el.addEventListener("seeked", update);
        el.addEventListener("play", update);
        return () => {
            el.removeEventListener("loadedmetadata", update);
            el.removeEventListener("seeked", update);
            el.removeEventListener("play", update);
        };
    }, [audio]);

    const attachAudio = useCallback((el: HTMLAudioElement | null) => {
        audioRef.current = el;
        setAudio(el);
    }, []);

    const value = useMemo<PlayerContextValue>(() => ({
        playlists,
        playlistsReady,
        setPlaylists,
        reciter: settings.reciter,
        setReciter,
        repeat: settings.repeat,
        cycleRepeat,
        shuffle: settings.shuffle,
        toggleShuffle,
        status,
        nowPlaying,
        audio,
        playPlaylist,
        toggle,
        pause,
        next,
        previous,
        stop,
    }), [playlists, playlistsReady, setPlaylists, settings, setReciter, cycleRepeat, toggleShuffle, status, nowPlaying, audio, playPlaylist, toggle, pause, next, previous, stop]);

    return (
        <PlayerContext.Provider value={value}>
            {children}
            <audio ref={attachAudio} preload="auto" className="hidden" />
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const ctx = useContext(PlayerContext);
    if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
    return ctx;
}
