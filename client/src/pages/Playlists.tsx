import { useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowDown,
    ArrowUp,
    Check,
    ChevronDown,
    ListMusic,
    Loader2,
    Mic,
    Pause,
    Pencil,
    Play,
    Plus,
    Repeat,
    Repeat1,
    Shuffle,
    SkipBack,
    SkipForward,
    Trash2,
    X,
} from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import RequireAuth from "@/components/RequireAuth";
import { nowPlayingDetail } from "@/components/MiniPlayer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePlayer } from "@/contexts/PlayerContext";
import { RECITERS } from "@/lib/reciters";
import { SURAHS, getSurah } from "@/lib/surah-list";
import {
    LISTEN_MODES,
    STARTER_PLAYLISTS,
    TRANSLATION_VOICES,
    addSurah,
    createPlaylist,
    deletePlaylist,
    moveSurah,
    removeSurahAt,
    renamePlaylist,
    setPlaylistMode,
    type Playlist,
    type TranslationVoice,
} from "@/lib/playlists";
import { cn } from "@/lib/utils";

export default function Playlists() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans dark:bg-slate-950">
            <SEO title="Playlists - Mastering Quran" description="Make playlists of surahs and listen to them back to back, in Arabic, with translation, or translation only." />
            <RequireAuth reason="Sign in to make playlists of surahs and listen to them back to back.">
                <PlaylistsContent />
            </RequireAuth>
        </div>
    );
}

function PlaylistsContent() {
    const { playlists, playlistsReady, setPlaylists } = usePlayer();
    const [newName, setNewName] = useState("");
    const [openId, setOpenId] = useState<string | null>(null);

    const create = (e: React.FormEvent) => {
        e.preventDefault();
        let made: Playlist | undefined;
        setPlaylists((list) => {
            const [next, playlist] = createPlaylist(list, newName);
            made = playlist;
            return next;
        });
        if (made) {
            setOpenId(made.id);
            toast.success(`Created "${made.name}". Add surahs below or from any surah page.`);
        }
        setNewName("");
    };

    const addStarter = (key: string) => {
        const starter = STARTER_PLAYLISTS.find((s) => s.key === key);
        if (!starter) return;
        let made: Playlist | undefined;
        setPlaylists((list) => {
            const [next, playlist] = createPlaylist(list, starter.name, starter.surahs);
            made = playlist;
            return next;
        });
        if (made) {
            setOpenId(made.id);
            toast.success(`Added "${made.name}" to your playlists`);
        }
    };

    return (
        <section className="px-4 py-10 sm:px-6">
            <div className="mx-auto max-w-3xl space-y-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <ListMusic className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Playlists
                        </h1>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                        Group the surahs you love and listen to them back to back. Playback continues while you browse the app or lock your phone.
                    </p>
                </div>

                <NowPlayingCard />

                <form onSubmit={create} className="flex gap-2">
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        maxLength={60}
                        placeholder="New playlist name, for example Friday"
                        aria-label="New playlist name"
                        className="h-11 rounded-xl bg-white dark:bg-slate-900"
                    />
                    <Button type="submit" className="h-11 shrink-0 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
                        <Plus className="mr-1 h-4 w-4" /> Create
                    </Button>
                </form>

                <div className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Your playlists</h2>
                    {!playlistsReady ? (
                        <div role="status" className="flex justify-center py-10">
                            <Loader2 aria-hidden className="h-6 w-6 animate-spin text-slate-400" />
                            <span className="sr-only">Loading playlists</span>
                        </div>
                    ) : playlists.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
                            No playlists yet. Create one above, start from an idea below, or tap <span className="font-medium">Add to playlist</span> on any surah in the{" "}
                            <Link to="/quran" className="font-medium text-emerald-700 underline dark:text-emerald-400">Quran reader</Link>.
                        </div>
                    ) : (
                        playlists.map((p) => (
                            <PlaylistCard key={p.id} playlist={p} open={openId === p.id} onToggle={() => setOpenId(openId === p.id ? null : p.id)} />
                        ))
                    )}
                </div>

                <ListeningSettings />

                <div className="space-y-3">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Ideas to start from</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Optional. Tap one to copy it into your playlists, then change it however you like.</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {STARTER_PLAYLISTS.map((s) => {
                            const taken = playlists.some((p) => p.name === s.name && p.surahs.join() === s.surahs.join());
                            return (
                                <button
                                    key={s.key}
                                    type="button"
                                    disabled={taken}
                                    onClick={() => addStarter(s.key)}
                                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-300 hover:shadow-md disabled:cursor-default disabled:opacity-60 disabled:hover:border-slate-200 disabled:hover:shadow-none dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                        {taken ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block font-semibold text-slate-900 dark:text-white">{s.name}</span>
                                        <span className="block text-sm text-slate-500 dark:text-slate-400">{s.note}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

function NowPlayingCard() {
    const { nowPlaying, status, toggle, next, previous, repeat, cycleRepeat, shuffle, toggleShuffle } = usePlayer();
    if (!nowPlaying) return null;
    const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;
    const repeatLabel = repeat === "off" ? "Repeat off" : repeat === "all" ? "Repeat playlist" : "Repeat this surah";
    return (
        <div className="rounded-[1.75rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-xl shadow-emerald-900/5 dark:border-emerald-900/50 dark:from-emerald-950/40 dark:to-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Now playing · {nowPlaying.playlistName}</p>
            <div className="mt-2 flex items-baseline justify-between gap-3">
                <h2 className="truncate text-2xl font-bold text-slate-900 dark:text-white">{nowPlaying.surah.englishName}</h2>
                <span className="shrink-0 font-amiri text-2xl text-emerald-700 dark:text-emerald-300">{nowPlaying.surah.arabicName}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{nowPlaying.surah.meaning} · {nowPlayingDetail(nowPlaying)}</p>
            <div className="mt-4 flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={shuffle ? "Shuffle on" : "Shuffle off"}
                    aria-pressed={shuffle}
                    onClick={toggleShuffle}
                    className={cn("h-11 w-11 rounded-xl", shuffle ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-200" : "text-slate-400")}
                >
                    <Shuffle className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" aria-label="Previous surah" onClick={previous} className="h-11 w-11 rounded-xl">
                        <SkipBack className="h-5 w-5" />
                    </Button>
                    <Button size="icon" aria-label={status === "playing" ? "Pause" : "Play"} onClick={toggle} className="h-14 w-14 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700">
                        {status === "loading" ? <Loader2 className="h-6 w-6 animate-spin" /> : status === "playing" ? <Pause className="h-6 w-6" /> : <Play className="ml-0.5 h-6 w-6" />}
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Next surah" onClick={next} className="h-11 w-11 rounded-xl">
                        <SkipForward className="h-5 w-5" />
                    </Button>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={repeatLabel}
                    title={repeatLabel}
                    onClick={cycleRepeat}
                    className={cn("h-11 w-11 rounded-xl", repeat !== "off" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-200" : "text-slate-400")}
                >
                    <RepeatIcon className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}

function ListeningSettings() {
    const { reciter, setReciter, voice, setVoice } = usePlayer();
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:col-span-2">How it sounds</h2>
            <div className="min-w-0 space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <Mic className="h-4 w-4 text-emerald-500" /> Reciter
                </label>
                <Select value={reciter} onValueChange={setReciter}>
                    <SelectTrigger aria-label="Reciter" className="h-11 w-full rounded-xl bg-white dark:bg-slate-900">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {RECITERS.map((r) => (
                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="min-w-0 space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <ListMusic className="h-4 w-4 text-indigo-500" /> Translation voice
                </label>
                <Select value={voice} onValueChange={(v) => setVoice(v as TranslationVoice)}>
                    <SelectTrigger aria-label="Translation voice" className="h-11 w-full rounded-xl bg-white dark:bg-slate-900">
                        <SelectValue>{TRANSLATION_VOICES.find((v) => v.id === voice)?.label}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {TRANSLATION_VOICES.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                                <span>
                                    <span className="font-medium">{v.label}</span>
                                    <span className="block text-xs text-slate-400">{v.credit}</span>
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 sm:col-span-2">
                Translation audio: {TRANSLATION_VOICES.find((v) => v.id === voice)?.credit}. Changes apply from the next surah.
            </p>
        </div>
    );
}

function PlaylistCard({ playlist, open, onToggle }: { playlist: Playlist; open: boolean; onToggle: () => void }) {
    const { setPlaylists, playPlaylist, nowPlaying, status, toggle } = usePlayer();
    const [renaming, setRenaming] = useState(false);
    const [name, setName] = useState(playlist.name);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const isCurrent = nowPlaying?.playlistId === playlist.id;
    const isPlaying = isCurrent && status !== "paused";
    const id = playlist.id;

    const saveName = (e: React.FormEvent) => {
        e.preventDefault();
        setPlaylists((list) => renamePlaylist(list, id, name));
        setRenaming(false);
    };

    return (
        <div className={cn("rounded-2xl border bg-white shadow-sm dark:bg-slate-900", isCurrent ? "border-emerald-300 dark:border-emerald-800" : "border-slate-200 dark:border-slate-800")}>
            <div className="flex items-center gap-3 p-4">
                <Button
                    size="icon"
                    aria-label={isPlaying ? `Pause ${playlist.name}` : `Play ${playlist.name}`}
                    disabled={!playlist.surahs.length}
                    onClick={() => (isCurrent ? toggle() : playPlaylist(playlist))}
                    className="h-11 w-11 shrink-0 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
                </Button>
                {renaming ? (
                    <form onSubmit={saveName} className="flex min-w-0 flex-1 gap-2">
                        <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoFocus aria-label="Playlist name" className="h-10 rounded-xl" />
                        <Button type="submit" size="icon" aria-label="Save name" variant="ghost" className="h-10 w-10 shrink-0">
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button type="button" size="icon" aria-label="Cancel rename" variant="ghost" className="h-10 w-10 shrink-0" onClick={() => { setName(playlist.name); setRenaming(false); }}>
                            <X className="h-4 w-4" />
                        </Button>
                    </form>
                ) : (
                    <button type="button" onClick={onToggle} aria-expanded={open} className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left">
                        <span className="min-w-0">
                            <span className="block truncate font-semibold text-slate-900 dark:text-white">{playlist.name}</span>
                            <span className="block truncate text-sm text-slate-500 dark:text-slate-400">
                                {playlist.surahs.length} {playlist.surahs.length === 1 ? "surah" : "surahs"} · {LISTEN_MODES.find((m) => m.id === playlist.mode)?.label}
                            </span>
                        </span>
                        <ChevronDown className={cn("h-5 w-5 shrink-0 text-slate-400 transition-transform", open && "rotate-180")} />
                    </button>
                )}
            </div>

            {open && (
                <div className="space-y-4 border-t border-slate-100 p-4 dark:border-slate-800">
                    <fieldset>
                        <legend className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Listen to</legend>
                        <div className="grid gap-2 sm:grid-cols-3">
                            {LISTEN_MODES.map((m) => (
                                <button
                                    key={m.id}
                                    type="button"
                                    aria-pressed={playlist.mode === m.id}
                                    onClick={() => setPlaylists((list) => setPlaylistMode(list, id, m.id))}
                                    className={cn(
                                        "rounded-xl border px-3 py-2 text-left text-sm transition",
                                        playlist.mode === m.id
                                            ? "border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-100"
                                            : "border-slate-200 text-slate-700 hover:border-emerald-200 dark:border-slate-700 dark:text-slate-300",
                                    )}
                                >
                                    <span className="block font-medium">{m.label}</span>
                                    <span className="block text-xs text-slate-500 dark:text-slate-400">{m.hint}</span>
                                </button>
                            ))}
                        </div>
                    </fieldset>

                    <ol className="space-y-1.5">
                        {playlist.surahs.map((n, i) => {
                            const s = getSurah(n)!;
                            const playingThis = isCurrent && nowPlaying?.surah.number === n;
                            return (
                                <li key={n} className={cn("flex items-center gap-2 rounded-xl px-2 py-1.5", playingThis ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-slate-50 dark:bg-slate-800/50")}>
                                    <button
                                        type="button"
                                        onClick={() => playPlaylist(playlist, i)}
                                        aria-label={`Play from ${s.englishName}`}
                                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                    >
                                        <span className="w-7 shrink-0 text-center text-xs font-semibold text-slate-400">{s.number}</span>
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">{s.englishName}</span>
                                            <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{s.meaning} · {s.ayahs} verses</span>
                                        </span>
                                        <span className="ml-auto hidden shrink-0 font-amiri text-lg text-emerald-700 dark:text-emerald-300 sm:block">{s.arabicName}</span>
                                    </button>
                                    <Button variant="ghost" size="icon" aria-label={`Move ${s.englishName} up`} disabled={i === 0} onClick={() => setPlaylists((list) => moveSurah(list, id, i, i - 1))} className="h-8 w-8 shrink-0">
                                        <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" aria-label={`Move ${s.englishName} down`} disabled={i === playlist.surahs.length - 1} onClick={() => setPlaylists((list) => moveSurah(list, id, i, i + 1))} className="h-8 w-8 shrink-0">
                                        <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" aria-label={`Remove ${s.englishName}`} onClick={() => setPlaylists((list) => removeSurahAt(list, id, i))} className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-600">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </li>
                            );
                        })}
                    </ol>

                    <Select value="" onValueChange={(v) => setPlaylists((list) => addSurah(list, id, Number(v)))}>
                        <SelectTrigger aria-label="Add a surah" className="h-11 w-full rounded-xl border-dashed">
                            <span className="flex items-center gap-2 text-slate-500"><Plus className="h-4 w-4" /> Add a surah</span>
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                            {SURAHS.filter((s) => !playlist.surahs.includes(s.number)).map((s) => (
                                <SelectItem key={s.number} value={String(s.number)}>
                                    {s.number}. {s.englishName} ({s.meaning})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setName(playlist.name); setRenaming(true); }}>
                            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Rename
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-xl text-red-600 hover:text-red-700" onClick={() => setConfirmDelete(true)}>
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete playlist
                        </Button>
                    </div>
                </div>
            )}

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{playlist.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>The playlist is removed from your account on every device. The surahs themselves are not affected.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep it</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => setPlaylists((list) => deletePlaylist(list, id))}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
