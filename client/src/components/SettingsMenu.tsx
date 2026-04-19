import { Sun, Moon, Type, Keyboard } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "@/contexts/ThemeContext";
import { useUserPreferences, FontSize } from "@/components/UserPreferences";
import { useEffect, useState } from "react";

const FONT_LABELS: Record<FontSize, string> = { sm: "Small", md: "Normal", lg: "Large", xl: "XL" };

const SHORTCUTS: Array<{ keys: string; desc: string }> = [
    { keys: "g h", desc: "Home" },
    { keys: "g q", desc: "Quran" },
    { keys: "g b", desc: "Hadith" },
    { keys: "g a", desc: "Ask AI" },
    { keys: "g t", desc: "Topics" },
    { keys: "g p", desc: "Prayer Times" },
    { keys: "g d", desc: "Duas" },
    { keys: "g n", desc: "99 Names" },
    { keys: "g c", desc: "Calendar" },
    { keys: "g r", desc: "Ramadan" },
    { keys: "/", desc: "Focus search" },
    { keys: "?", desc: "Show shortcuts" },
];

export default function SettingsMenu() {
    const { theme, toggleTheme } = useTheme();
    const { fontSize, setFontSize } = useUserPreferences();
    const [showShortcuts, setShowShortcuts] = useState(false);

    useEffect(() => {
        const handler = () => setShowShortcuts(true);
        window.addEventListener("mq-show-shortcuts", handler);
        return () => window.removeEventListener("mq-show-shortcuts", handler);
    }, []);

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <button
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                        aria-label="Settings"
                        title="Display settings"
                    >
                        {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    </button>
                </PopoverTrigger>
                <PopoverContent align="end" sideOffset={8} className="w-64 p-4 space-y-4">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Appearance</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => theme === "dark" && toggleTheme?.()}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm transition-colors ${theme === "light"
                                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    }`}
                            >
                                <Sun className="h-4 w-4" /> Light
                            </button>
                            <button
                                onClick={() => theme === "light" && toggleTheme?.()}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm transition-colors ${theme === "dark"
                                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    }`}
                            >
                                <Moon className="h-4 w-4" /> Dark
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-2">
                            <Type className="h-3 w-3" /> Font size
                        </p>
                        <div className="grid grid-cols-4 gap-1">
                            {(Object.keys(FONT_LABELS) as FontSize[]).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFontSize(s)}
                                    className={`py-1.5 rounded-md text-xs transition-colors ${fontSize === s
                                            ? "bg-emerald-500 text-white"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                        }`}
                                >
                                    {FONT_LABELS[s]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setShowShortcuts(true)}
                        className="w-full flex items-center justify-between gap-2 py-2 px-3 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <span className="flex items-center gap-2"><Keyboard className="h-4 w-4" /> Keyboard shortcuts</span>
                        <kbd className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">?</kbd>
                    </button>
                </PopoverContent>
            </Popover>

            {showShortcuts && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowShortcuts(false)}>
                    <div
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Keyboard shortcuts</h3>
                            <button onClick={() => setShowShortcuts(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {SHORTCUTS.map((s) => (
                                <div key={s.keys} className="flex items-center justify-between py-1">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">{s.desc}</span>
                                    <span className="font-mono text-xs">
                                        {s.keys.split(" ").map((k, i) => (
                                            <kbd key={i} className="ml-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                                {k}
                                            </kbd>
                                        ))}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400">Shortcuts are disabled while typing in inputs.</p>
                    </div>
                </div>
            )}
        </>
    );
}
