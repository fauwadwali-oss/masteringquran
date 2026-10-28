import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ListMusic, ListPlus, Plus } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { cn } from "@/lib/utils";
import { addSurah, createPlaylist, type Playlist } from "@/lib/playlists";

/** "Add to playlist" for a whole surah. Playlists need an account, so signed-out readers are asked to sign in. */
export default function AddToPlaylist({ surah, surahName }: { surah: number; surahName: string }) {
    const { user } = useAuth();
    const { playlists, setPlaylists } = usePlayer();
    const [showLogin, setShowLogin] = useState(false);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    // A plain button: the shared Button does not forward refs, which the popover needs to anchor itself.
    const triggerClass = cn(
        buttonVariants({ variant: "outline" }),
        "rounded-xl border-emerald-200 px-4 font-semibold text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-950/40",
    );
    const label = <><ListPlus className="mr-2 h-4 w-4" /> Add to playlist</>;

    if (!user) {
        return (
            <>
                <button type="button" className={triggerClass} onClick={() => setShowLogin(true)}>{label}</button>
                <LoginModal open={showLogin} onClose={() => setShowLogin(false)} reason="Sign in to save surahs to your own playlists." />
            </>
        );
    }

    const addTo = (p: Playlist) => {
        setOpen(false);
        if (p.surahs.includes(surah)) {
            toast(`${surahName} is already in "${p.name}"`);
            return;
        }
        setPlaylists((list) => addSurah(list, p.id, surah));
        toast.success(`Added ${surahName} to "${p.name}"`, {
            action: { label: "Open", onClick: () => navigate("/playlists") },
        });
    };

    const addToNew = () => {
        setOpen(false);
        let made: Playlist | undefined;
        setPlaylists((list) => {
            const [next, playlist] = createPlaylist(list, surahName, [surah]);
            made = playlist;
            return next;
        });
        if (made) {
            toast.success(`Made a new playlist "${made.name}"`, {
                action: { label: "Open", onClick: () => navigate("/playlists") },
            });
        }
    };

    const item = "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger className={triggerClass}>{label}</PopoverTrigger>
            <PopoverContent align="center" className="w-64 p-1.5">
                <p className="px-2 py-1.5 text-sm font-semibold">Add {surahName} to</p>
                {playlists.map((p) => {
                    const has = p.surahs.includes(surah);
                    return (
                        <button key={p.id} type="button" className={item} onClick={() => addTo(p)}>
                            {has ? <Check className="h-4 w-4 shrink-0 text-emerald-600" /> : <ListMusic className="h-4 w-4 shrink-0 text-slate-500" />}
                            <span className="truncate">{p.name}</span>
                            <span className="ml-auto text-xs text-slate-400">{p.surahs.length}</span>
                        </button>
                    );
                })}
                {playlists.length > 0 && <div className="my-1 h-px bg-slate-200 dark:bg-slate-700" />}
                <button type="button" className={item} onClick={addToNew}>
                    <Plus className="h-4 w-4 shrink-0 text-slate-500" /> New playlist
                </button>
                <button type="button" className={item} onClick={() => { setOpen(false); navigate("/playlists"); }}>
                    <ListMusic className="h-4 w-4 shrink-0 text-slate-500" /> Manage playlists
                </button>
            </PopoverContent>
        </Popover>
    );
}
