import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

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
                <div className="hidden md:flex gap-6 text-sm font-medium">
                    <Link
                        to="/"
                        className={cn(
                            "hover:opacity-80 transition-opacity",
                            location.pathname === "/" && "opacity-100"
                        )}
                    >
                        Home
                    </Link>
                    <Link
                        to="/quran"
                        className={cn(
                            "hover:opacity-80 transition-opacity",
                            location.pathname === "/quran" && "opacity-100"
                        )}
                    >
                        Quran
                    </Link>
                    <Link
                        to="/hadith"
                        className={cn(
                            "hover:opacity-80 transition-opacity",
                            location.pathname === "/hadith" && "opacity-100"
                        )}
                    >
                        Hadith
                    </Link>
                    <Link
                        to="/prayer-times"
                        className={cn(
                            "hover:opacity-80 transition-opacity",
                            location.pathname === "/prayer-times" && "opacity-100"
                        )}
                    >
                        Prayers
                    </Link>
                    <Link
                        to="/duas"
                        className={cn(
                            "hover:opacity-80 transition-opacity",
                            location.pathname === "/duas" && "opacity-100"
                        )}
                    >
                        Duas
                    </Link>
                    <Link
                        to="/ask"
                        className={cn(
                            "inline-flex items-center gap-1 hover:opacity-80 transition-opacity",
                            location.pathname === "/ask" && "opacity-100"
                        )}
                    >
                        <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                        Ask AI
                    </Link>
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
                <div className="md:hidden pt-4 pb-2 space-y-2 animate-in slide-in-from-top-5 fade-in duration-200">
                    <Link to="/" className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>Home</Link>
                    <Link to="/quran" className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>Quran</Link>
                    <Link to="/hadith" className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>Hadith</Link>
                    <Link to="/prayer-times" className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>Prayer Times</Link>
                    <Link to="/qibla" className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>Qibla</Link>
                    <Link to="/names" className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>99 Names</Link>
                    <Link to="/duas" className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>Duas</Link>
                    <Link to="/ask" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>
                        <Sparkles className="h-4 w-4 text-emerald-500" /> Ask AI
                    </Link>
                </div>
            )}
        </nav>
    );
}
