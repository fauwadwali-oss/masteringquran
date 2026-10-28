import { useState } from "react";
import { Check, ChevronDown, Mic } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getReciter, matchesFilter, RECITER_FILTERS, reciterBadges, RECITERS, type ReciterFilter } from "@/lib/reciters";
import { cn } from "@/lib/utils";

// A button that opens the reciter list with filter chips. The trigger is a plain
// button (not a Radix asChild trigger) because ui/button does not forward refs.
export function ReciterPicker({ value, onChange, className }: { value: string; onChange: (id: string) => void; className?: string }) {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState<ReciterFilter>("all");
    const current = getReciter(value);
    const shown = RECITERS.filter((r) => matchesFilter(r, filter));

    return (
        <>
            <button
                type="button"
                aria-label={`Reciter: ${current.name}. Change reciter`}
                aria-haspopup="dialog"
                onClick={() => setOpen(true)}
                className={cn(
                    "flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:border-slate-700 dark:bg-slate-800",
                    className,
                )}
            >
                <span className="truncate">{current.name}</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="top-[max(8dvh,calc(env(safe-area-inset-top)_+_1rem))] left-[calc(50%_+_(env(safe-area-inset-left)_-_env(safe-area-inset-right))_/_2)] max-w-[calc(100%_-_2rem_-_env(safe-area-inset-left)_-_env(safe-area-inset-right))] flex max-h-[80dvh] translate-y-0 flex-col gap-3 border-slate-200 bg-white p-4 text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 sm:p-6">
                    <DialogHeader className="shrink-0 text-left">
                        <DialogTitle>Choose a reciter</DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400">Used in the Quran reader and in your playlists.</DialogDescription>
                    </DialogHeader>
                    <div className="flex shrink-0 flex-wrap gap-1.5" role="group" aria-label="Filter reciters">
                        {RECITER_FILTERS.map((f) => (
                            <button
                                key={f.id}
                                type="button"
                                aria-pressed={filter === f.id}
                                onClick={() => setFilter(f.id)}
                                className={cn(
                                    "h-9 rounded-full border px-3 text-sm font-medium transition-colors",
                                    filter === f.id
                                        ? "border-emerald-600 bg-emerald-600 text-white"
                                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <div role="radiogroup" aria-label="Reciters" className="-mx-1 min-h-0 flex-1 space-y-1 overflow-y-auto px-1">
                        {shown.map((r) => {
                            const selected = r.id === current.id;
                            return (
                                <button
                                    key={r.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    onClick={() => {
                                        onChange(r.id);
                                        setOpen(false);
                                    }}
                                    className={cn(
                                        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                                        selected
                                            ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"
                                            : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800",
                                    )}
                                >
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                                        <Mic className="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block font-medium text-slate-900 dark:text-slate-100">{r.name}</span>
                                        <span className="block font-amiri text-sm text-slate-500 dark:text-slate-400" lang="ar">{r.arabicName}</span>
                                        {reciterBadges(r).length > 0 && (
                                            <span className="mt-1 flex flex-wrap gap-1">
                                                {reciterBadges(r).map((b) => (
                                                    <span key={b} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{b}</span>
                                                ))}
                                            </span>
                                        )}
                                    </span>
                                    {selected && <Check className="h-5 w-5 shrink-0 text-emerald-600" />}
                                </button>
                            );
                        })}
                        {shown.length === 0 && <p className="p-3 text-sm text-slate-500">No reciters match this filter.</p>}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
