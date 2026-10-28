import { getSurah, globalAyahNumber } from "@/lib/surah-list";

// Surah playlists for signed-in readers. Saved to the account, with a copy on the
// device so they open instantly and survive a dropped connection. Every change
// returns a new array so React state and storage stay in step.

export type ListenMode = "arabic" | "arabic-translation" | "translation";
export type TranslationVoice = "en" | "ur";
export type RepeatMode = "off" | "all" | "one";

export interface Playlist {
    id: string;
    name: string;
    surahs: number[];
    mode: ListenMode;
    createdAt: number;
    /** Local only: true once the account has a copy. */
    synced?: boolean;
}

export const LISTEN_MODES: { id: ListenMode; label: string; hint: string }[] = [
    { id: "arabic", label: "Arabic only", hint: "Whole surah, recited without pauses" },
    { id: "arabic-translation", label: "Arabic and translation", hint: "Each verse in Arabic, then its translation" },
    { id: "translation", label: "Translation only", hint: "The meaning, verse by verse" },
];

export const TRANSLATION_VOICES: { id: TranslationVoice; label: string; credit: string; edition: string; bitrate: number }[] = [
    { id: "en", label: "English", credit: "Saheeh International, read by Ibrahim Walk", edition: "en.walk", bitrate: 192 },
    { id: "ur", label: "Urdu", credit: "Read by Shamshad Ali Khan", edition: "ur.khan", bitrate: 64 },
];

export function translationAudioUrl(voice: TranslationVoice, surah: number, ayah: number): string {
    const v = TRANSLATION_VOICES.find((t) => t.id === voice) ?? TRANSLATION_VOICES[0];
    return `https://cdn.islamic.network/quran/audio/${v.bitrate}/${v.edition}/${globalAyahNumber(surah, ayah)}.mp3`;
}

export interface StarterPlaylist {
    key: string;
    name: string;
    surahs: number[];
    note: string;
}

// Optional ideas the reader can copy into their own list. Nothing is added unless they tap it.
export const STARTER_PLAYLISTS: StarterPlaylist[] = [
    { key: "friday", name: "Friday", surahs: [18], note: "Al-Kahf, often recited on Fridays" },
    { key: "night", name: "Before sleep", surahs: [67, 32], note: "Al-Mulk and As-Sajdah (Jami at-Tirmidhi 2892)" },
    { key: "protection", name: "Morning and evening", surahs: [112, 113, 114], note: "Al-Ikhlas, Al-Falaq and An-Nas (Sunan Abi Dawud 5082)" },
    { key: "favourites", name: "Much-loved surahs", surahs: [36, 55, 56], note: "Ya-Sin, Ar-Rahman and Al-Waqi'ah" },
    { key: "juz-amma", name: "Juz Amma", surahs: Array.from({ length: 37 }, (_, i) => 78 + i), note: "The 30th juz, An-Naba to An-Nas" },
];

const storageKey = (userId: string) => `mq-playlists:${userId}`;

function isValidSurah(n: unknown): n is number {
    return typeof n === "number" && Number.isInteger(n) && !!getSurah(n);
}

function sanitize(raw: unknown): Playlist[] {
    if (!Array.isArray(raw)) return [];
    const modes = LISTEN_MODES.map((m) => m.id);
    return raw.flatMap((p: any) => {
        if (!p || typeof p.id !== "string" || typeof p.name !== "string" || !Array.isArray(p.surahs)) return [];
        return [{
            id: p.id,
            name: p.name.slice(0, 60),
            surahs: p.surahs.filter(isValidSurah),
            mode: modes.includes(p.mode) ? p.mode : "arabic",
            createdAt: typeof p.createdAt === "number" ? p.createdAt : Date.now(),
            synced: p.synced === true,
        }];
    });
}

export function loadPlaylists(userId: string): Playlist[] {
    try {
        return sanitize(JSON.parse(localStorage.getItem(storageKey(userId)) || "[]"));
    } catch {
        return [];
    }
}

export function savePlaylists(userId: string, playlists: Playlist[]): void {
    try {
        localStorage.setItem(storageKey(userId), JSON.stringify(playlists));
    } catch {
        // Storage full or blocked: the lists still work for this session.
    }
}

function newId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16));
}

export function cleanName(name: string, fallback = "My playlist"): string {
    const trimmed = name.replace(/\s+/g, " ").trim().slice(0, 60);
    return trimmed || fallback;
}

export function createPlaylist(list: Playlist[], name: string, surahs: number[] = [], mode: ListenMode = "arabic"): [Playlist[], Playlist] {
    const playlist: Playlist = { id: newId(), name: cleanName(name), surahs: surahs.filter(isValidSurah), mode, createdAt: Date.now() };
    return [[...list, playlist], playlist];
}

function update(list: Playlist[], id: string, fn: (p: Playlist) => Playlist): Playlist[] {
    return list.map((p) => (p.id === id ? fn(p) : p));
}

/**
 * Combines the account's playlists with the device copy. The account wins for
 * any playlist it has. A device playlist the account has never seen (made
 * offline) is kept so it can be uploaded; one that was synced but is gone from
 * the account was deleted on another device, so it is dropped.
 */
export function mergeWithAccount(local: Playlist[], remote: Playlist[]): Playlist[] {
    const remoteIds = new Set(remote.map((p) => p.id));
    const unsent = local.filter((p) => !p.synced && !remoteIds.has(p.id));
    return [...remote.map((p) => ({ ...p, synced: true })), ...unsent];
}

/** What to send to the account after a change from `before` to `after`. */
export function syncChanges(before: Playlist[], after: Playlist[]): { upsert: Playlist[]; remove: string[] } {
    const key = (p: Playlist) => JSON.stringify([p.name, p.surahs, p.mode]);
    const prev = new Map(before.map((p) => [p.id, p]));
    const upsert = after.filter((p) => !p.synced || !prev.has(p.id) || key(prev.get(p.id)!) !== key(p));
    const ids = new Set(after.map((p) => p.id));
    const remove = before.filter((p) => !ids.has(p.id) && p.synced).map((p) => p.id);
    return { upsert, remove };
}

export const renamePlaylist = (list: Playlist[], id: string, name: string) =>
    update(list, id, (p) => ({ ...p, name: cleanName(name, p.name) }));

export const deletePlaylist = (list: Playlist[], id: string) => list.filter((p) => p.id !== id);

export const setPlaylistMode = (list: Playlist[], id: string, mode: ListenMode) =>
    update(list, id, (p) => ({ ...p, mode }));

/** Adds a surah to the end. A surah already in the list is left where it is. */
export const addSurah = (list: Playlist[], id: string, surah: number) =>
    update(list, id, (p) => (!isValidSurah(surah) || p.surahs.includes(surah) ? p : { ...p, surahs: [...p.surahs, surah] }));

export const removeSurahAt = (list: Playlist[], id: string, index: number) =>
    update(list, id, (p) => ({ ...p, surahs: p.surahs.filter((_, i) => i !== index) }));

export const moveSurah = (list: Playlist[], id: string, from: number, to: number) =>
    update(list, id, (p) => {
        if (from === to || from < 0 || to < 0 || from >= p.surahs.length || to >= p.surahs.length) return p;
        const surahs = [...p.surahs];
        const [item] = surahs.splice(from, 1);
        surahs.splice(to, 0, item);
        return { ...p, surahs };
    });

// Play order

/** Indexes into a playlist in the order they will play. With shuffle on, `start` plays first. */
export function buildOrder(length: number, shuffle: boolean, start = 0, random: () => number = Math.random): number[] {
    const order = Array.from({ length }, (_, i) => i);
    if (!shuffle || length < 2) return order;
    const rest = order.filter((i) => i !== start);
    for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    return [start, ...rest];
}

/** Position after `pos` when a surah finishes on its own, or null to stop. */
export function nextPosition(pos: number, length: number, repeat: RepeatMode): number | null {
    if (repeat === "one") return pos;
    if (pos + 1 < length) return pos + 1;
    return repeat === "all" && length > 0 ? 0 : null;
}

/** Position for the Next button: always moves on, wrapping to the start. */
export function skipForward(pos: number, length: number): number {
    return length ? (pos + 1) % length : 0;
}

export function skipBack(pos: number, length: number): number {
    return length ? (pos - 1 + length) % length : 0;
}
