import { Link, useLocation } from "react-router-dom";
import { BookOpen, GraduationCap, Home, Library, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSideRail } from "@/hooks/useSideRail";

const railItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/quran", label: "Quran", icon: BookOpen },
    { to: "/hadith", label: "Hadith", icon: Library },
    { to: "/learn-arabic", label: "Arabic", icon: GraduationCap },
    { to: "/ask", label: "Ask AI", icon: Sparkles },
];

/**
 * iPhone Duo: the main links as a rail in the right status column, below the
 * clock and Wi-Fi, so that column is not left empty. Renders nothing elsewhere.
 */
export default function SideRail() {
    const sideRail = useSideRail();
    const location = useLocation();

    if (!sideRail) return null;

    return (
        <nav
            aria-label="Quick links"
            className="fixed right-0 top-[calc(env(safe-area-inset-top)+10rem)] z-40 flex w-[env(safe-area-inset-right)] flex-col"
        >
            {railItems.map(({ to, label, icon: Icon }) => {
                const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
                return (
                    <Link
                        key={to}
                        to={to}
                        className={cn(
                            "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                            active
                                ? "text-emerald-700 dark:text-emerald-300"
                                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
