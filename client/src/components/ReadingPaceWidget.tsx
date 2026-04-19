import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { getStreak, StreakInfo } from "@/lib/queries/streak";

const TOTAL_VERSES = 6236;

export default function ReadingPaceWidget() {
    const { user, loading: authLoading } = useAuth();
    const [streak, setStreak] = useState<StreakInfo | null>(null);
    const [totalVersesRead, setTotalVersesRead] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }
        getStreak(user.id)
            .then((s) => {
                setStreak(s);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [user, authLoading]);

    // Anonymous users: hide widget
    if (!user && !authLoading) return null;
    if (loading) {
        return (
            <Card className="border border-emerald-200 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900">
                <CardContent className="p-5 flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                    <p className="text-sm text-slate-500">Loading your reading…</p>
                </CardContent>
            </Card>
        );
    }

    const current = streak?.currentStreak ?? 0;
    const longest = streak?.longestStreak ?? 0;
    const todayRead = streak?.todayRead ?? false;

    // Pace estimate: assume 20 verses/day average (approx 1 juz per week)
    // We'll show encouragement based on streak level
    let paceMsg = "";
    if (current === 0 && !todayRead) {
        paceMsg = "Open the Quran to start today's reading.";
    } else if (current <= 1) {
        paceMsg = "Keep going — consistency beats intensity.";
    } else if (current < 7) {
        paceMsg = `You're on a ${current}-day streak. One more day and you've built a habit.`;
    } else if (current < 30) {
        paceMsg = `${current} days strong. Aim for 30 to complete a Juz-per-day cycle.`;
    } else {
        paceMsg = `Mashaa'Allah — ${current} days.`;
    }

    return (
        <Card className="border border-emerald-200 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900">
            <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Flame className={current > 0 ? "h-5 w-5 text-rose-500" : "h-5 w-5 text-slate-400"} />
                        <h3 className="font-semibold text-slate-900 dark:text-white">Your reading pace</h3>
                    </div>
                    <Link to="/plans" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">Plans →</Link>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{current}</p>
                        <p className="text-[11px] uppercase tracking-wider text-slate-500">Day streak</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{longest}</p>
                        <p className="text-[11px] uppercase tracking-wider text-slate-500">Longest</p>
                    </div>
                </div>

                <div className="flex items-start gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{paceMsg}</p>
                </div>

                {!todayRead && (
                    <Link
                        to="/quran"
                        className="block w-full text-center py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
                    >
                        Read today
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
