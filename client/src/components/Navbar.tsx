import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SettingsMenu from "@/components/SettingsMenu";
import AuthButton from "@/components/AuthButton";

// Items reachable via the desktop "More" dropdown, grouped.
const MORE_GROUPS: Array<{ label: string; items: Array<{ to: string; label: string; emoji?: string }> }> = [
    {
        label: "Daily practice",
        items: [
            { to: "/prayer-times", label: "Prayer Times", emoji: "🕌" },
            { to: "/qibla", label: "Qibla Direction", emoji: "🧭" },
            { to: "/duas", label: "Duas", emoji: "🤲" },
            { to: "/ramadan", label: "Ramadan", emoji: "🌙" },
        ],
    },
    {
        label: "Reference",
        items: [
            { to: "/names", label: "99 Names", emoji: "✨" },
            { to: "/calendar", label: "Calendar", emoji: "📅" },
            { to: "/topics", label: "Topics", emoji: "💡" },
        ],
    },
    {
        label: "Practice",
        items: [
            { to: "/plans", label: "Reading Plans", emoji: "📖" },
            { to: "/quiz", label: "Quiz", emoji: "🏆" },
            { to: "/flashcards", label: "Flash Cards", emoji: "🎴" },
        ],
    },
];

export default function Navbar() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const isInMore = MORE_GROUPS.some((g) => g.items.some((i) => location.pathname === i.to));

    return (
        <nav className="w-full py-4 px-6 sticky top-0 z-50 backdrop-blur-sm border-b transition-colors duration-300 bg-white/80 border-slate-200 text-slate-900 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100">
            <div className="flex justify-between items-center">
                <div className="font-bold text-lg tracking-tight flex items-center">
                    <Link to="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                        <img src="/MQ_shield_logo.png" alt="Mastering Quran Logo" className="h-12 w-auto" />
                        <span>Mastering Quran</span>
                    </Link>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex gap-3 lg:gap-5 text-sm font-medium items-center">
                    <Link
                        to="/"
                        className={cn("hover:opacity-80 transition-opacity", location.pathname === "/" && "opacity-100")}
                    >
                        Home
                    </Link>
                    <Link
                        to="/quran"
                        className={cn("hover:opacity-80 transition-opacity", location.pathname === "/quran" && "opacity-100")}
                    >
                        Quran
                    </Link>
                    <Link
                        to="/hadith"
                        className={cn("hover:opacity-80 transition-opacity", location.pathname === "/hadith" && "opacity-100")}
                    >
                        Hadith
                    </Link>

                    {/* More dropdown */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                className={cn(
                                    "inline-flex items-center gap-1 hover:opacity-80 transition-opacity",
                                    isInMore && "opacity-100 text-emerald-700 dark:text-emerald-400",
                                )}
                            >
                                More <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent align="end" sideOffset={10} className="w-[480px] p-0">
                            <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800">
                                {MORE_GROUPS.map((group) => (
                                    <div key={group.label} className="p-3 space-y-1">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 pb-1">
                                            {group.label}
                                        </p>
                                        {group.items.map((item) => {
                                            const active = location.pathname === item.to;
                                            return (
                                                <Link
                                                    key={item.to}
                                                    to={item.to}
                                                    className={cn(
                                                        "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                                                        active
                                                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium"
                                                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
                                                    )}
                                                >
                                                    <span className="text-base leading-none">{item.emoji}</span>
                                                    <span>{item.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Link
                        to="/ask"
                        className={cn(
                            "inline-flex items-center gap-1 hover:opacity-80 transition-opacity",
                            location.pathname === "/ask" && "opacity-100",
                        )}
                    >
                        <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                        Ask AI
                    </Link>
                    <SettingsMenu />
                    <AuthButton />
                </div>

                <div className="flex items-center gap-1 md:hidden">
                    <SettingsMenu />
                    <AuthButton />
                </div>

                <button
                    className="md:hidden p-2 focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {isOpen && (
                <div className="md:hidden pt-4 pb-2 space-y-1 animate-in slide-in-from-top-5 fade-in duration-200 max-h-[80vh] overflow-y-auto">
                    <Link to="/" className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>Home</Link>
                    <Link to="/quran" className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>Quran</Link>
                    <Link to="/hadith" className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>Hadith</Link>
                    <Link to="/ask" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>
                        <Sparkles className="h-4 w-4 text-emerald-500" /> Ask AI
                    </Link>
                    {MORE_GROUPS.map((group) => (
                        <div key={group.label} className="pt-2">
                            <p className="px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{group.label}</p>
                            {group.items.map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <span className="leading-none">{item.emoji}</span>
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </nav>
    );
}
