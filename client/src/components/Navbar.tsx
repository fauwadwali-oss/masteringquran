import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    BookOpen,
    Calendar,
    ChevronDown,
    Compass,
    GraduationCap,
    Heart,
    Library,
    Menu,
    Search,
    ScrollText,
    Sparkles,
    Trophy,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SettingsMenu from "@/components/SettingsMenu";
import AuthButton from "@/components/AuthButton";

// Items reachable via the desktop "More" dropdown, grouped.
const MORE_GROUPS: Array<{
    label: string;
    items: Array<{ to: string; label: string; icon: React.ComponentType<{ className?: string }>; description: string }>;
}> = [
    {
        label: "Daily practice",
        items: [
            { to: "/prayer-times", label: "Prayer Times", icon: Calendar, description: "Salah timings" },
            { to: "/qibla", label: "Qibla", icon: Compass, description: "Find direction" },
            { to: "/duas", label: "Duas", icon: Heart, description: "Daily supplications" },
            { to: "/ramadan", label: "Ramadan", icon: Calendar, description: "Fasting tools" },
            { to: "/daily", label: "Daily Reminder", icon: BookOpen, description: "Verse delivery" },
        ],
    },
    {
        label: "Reference",
        items: [
            { to: "/search", label: "Global Search", icon: Search, description: "Search everything" },
            { to: "/names", label: "99 Names", icon: Sparkles, description: "Names and meanings" },
            { to: "/calendar", label: "Calendar", icon: Calendar, description: "Hijri calendar" },
            { to: "/topics", label: "Topics", icon: BookOpen, description: "Curated verses" },
            { to: "/glossary", label: "Glossary", icon: Library, description: "Islamic terms" },
        ],
    },
    {
        label: "Learn",
        items: [
            { to: "/prophets", label: "Stories of Prophets", icon: Sparkles, description: "25 prophets" },
            { to: "/seerah", label: "Seerah", icon: ScrollText, description: "Life of the Prophet" },
            { to: "/hajj", label: "Hajj & Umrah", icon: Compass, description: "Step-by-step rites" },
            { to: "/zakat", label: "Zakat Calculator", icon: Calendar, description: "Annual zakat" },
        ],
    },
    {
        label: "Practice",
        items: [
            { to: "/plans", label: "Reading Plans", icon: BookOpen, description: "Build a habit" },
            { to: "/quiz", label: "Quiz", icon: Trophy, description: "Test recall" },
            { to: "/flashcards", label: "Flash Cards", icon: GraduationCap, description: "Review quickly" },
            { to: "/share", label: "Share a Verse", icon: Heart, description: "Create images" },
        ],
    },
];

const PRIMARY_LINKS = [
    { to: "/", label: "Home" },
    { to: "/quran", label: "Quran" },
    { to: "/hadith", label: "Hadith" },
    { to: "/learn-arabic", label: "Learn Arabic" },
];

export default function Navbar() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const isInMore = MORE_GROUPS.some((g) => g.items.some((i) => location.pathname === i.to));

    return (
        <nav className="w-full sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 px-4 py-3 text-slate-900 shadow-sm shadow-slate-900/5 backdrop-blur-xl transition-colors duration-300 dark:border-slate-800/80 dark:bg-slate-950/88 dark:text-slate-100 sm:px-6">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                <div className="font-bold text-lg tracking-tight flex items-center">
                    <Link to="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                        <img src="/mq-logo-mark.svg" alt="Mastering Quran Logo" className="h-9 w-auto sm:h-10" />
                        <span className="whitespace-nowrap text-base leading-tight sm:text-lg">Mastering Quran</span>
                    </Link>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-1 text-sm font-medium">
                    {PRIMARY_LINKS.map((item) => {
                        const active = item.to === "/learn-arabic"
                            ? location.pathname.startsWith("/learn-arabic")
                            : location.pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={cn(
                                    "rounded-full px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white",
                                    active && "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
                                )}
                            >
                                {item.label}
                            </Link>
                        );
                    })}

                    {/* More dropdown */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                className={cn(
                                    "inline-flex items-center gap-1 rounded-full px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white",
                                    isInMore && "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
                                )}
                            >
                                More <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent align="end" sideOffset={12} className="w-[620px] overflow-hidden rounded-2xl border-slate-200/80 p-0 shadow-2xl dark:border-slate-800 lg:w-[720px]">
                            <div className="grid grid-cols-4 bg-white dark:bg-slate-950">
                                {MORE_GROUPS.map((group) => (
                                    <div key={group.label} className="space-y-1 border-r border-slate-100 p-3 last:border-r-0 dark:border-slate-800">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 pb-1">
                                            {group.label}
                                        </p>
                                        {group.items.map((item) => {
                                            const active = location.pathname === item.to;
                                            const Icon = item.icon;
                                            return (
                                                <Link
                                                    key={item.to}
                                                    to={item.to}
                                                    className={cn(
                                                        "flex items-start gap-2.5 rounded-xl px-2 py-2 text-sm transition-colors",
                                                        active
                                                            ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                                                            : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900",
                                                    )}
                                                >
                                                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                                    <span>
                                                        <span className="block font-medium leading-none">{item.label}</span>
                                                        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{item.description}</span>
                                                    </span>
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
                            "inline-flex items-center gap-1 rounded-full px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white",
                            location.pathname === "/ask" && "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
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
                    className="rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-200 dark:hover:bg-slate-900 md:hidden"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {isOpen && (
                <div className="mx-auto mt-3 max-h-[80vh] max-w-7xl space-y-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in slide-in-from-top-5 fade-in duration-200 dark:border-slate-800 dark:bg-slate-950 md:hidden">
                    {PRIMARY_LINKS.map((item) => (
                        <Link key={item.to} to={item.to} className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900" onClick={() => setIsOpen(false)}>{item.label}</Link>
                    ))}
                    <Link to="/ask" className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900" onClick={() => setIsOpen(false)}>
                        <Sparkles className="h-4 w-4 text-emerald-500" /> Ask AI
                    </Link>
                    {MORE_GROUPS.map((group) => (
                        <div key={group.label} className="pt-2">
                            <p className="px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{group.label}</p>
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-900"
                                    >
                                        <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </nav>
    );
}
