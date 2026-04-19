import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, User, LogOut, BookMarked, NotebookText, Target } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/LoginModal";

export default function AuthButton() {
    const { user, loading, signOut } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const navigate = useNavigate();

    if (loading) return null;

    if (!user) {
        return (
            <>
                <Button
                    onClick={() => setShowLogin(true)}
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 rounded-lg gap-2 border-emerald-300 text-emerald-700 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                >
                    <LogIn className="h-4 w-4" /> Sign in
                </Button>
                <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
            </>
        );
    }

    const label = user.email?.split("@")[0] ?? "Profile";
    const initial = (label[0] ?? "?").toUpperCase();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className="flex items-center gap-2 h-9 pl-1 pr-3 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    aria-label="User menu"
                >
                    <span className="w-7 h-7 rounded-full bg-emerald-500 text-white font-semibold flex items-center justify-center text-xs">
                        {initial}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 hidden sm:inline truncate max-w-[140px]">{label}</span>
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={8} className="w-56 p-2">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs text-slate-500">Signed in as</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.email}</p>
                </div>
                <button
                    onClick={() => navigate("/bookmarks")}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    <BookMarked className="h-4 w-4" /> Bookmarks
                </button>
                <button
                    onClick={() => navigate("/notes")}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    <NotebookText className="h-4 w-4" /> My Notes
                </button>
                <button
                    onClick={() => navigate("/memorize")}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    <Target className="h-4 w-4" /> Memorization
                </button>
                <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 mt-1 border-t border-slate-100 dark:border-slate-800 pt-2"
                >
                    <LogOut className="h-4 w-4" /> Sign out
                </button>
            </PopoverContent>
        </Popover>
    );
}
