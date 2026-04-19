import { useMemo } from "react";
import { Moon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Reference new moon (UTC): 2000-01-06 18:14
const REF_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);
const LUNAR_MONTH_DAYS = 29.530588861;
const LUNAR_MONTH_MS = LUNAR_MONTH_DAYS * 24 * 3600 * 1000;

function moonPhase(nowMs: number): { phase: number; ageDays: number; nextNewMoon: Date; nextFullMoon: Date } {
    const since = (nowMs - REF_NEW_MOON_MS) / LUNAR_MONTH_MS;
    const ageDays = ((since - Math.floor(since)) * LUNAR_MONTH_DAYS);
    const phase = ageDays / LUNAR_MONTH_DAYS; // 0 to 1

    const nextNewMoonMs = REF_NEW_MOON_MS + Math.ceil(since) * LUNAR_MONTH_MS;
    const nextFullMoonMs = REF_NEW_MOON_MS + (Math.floor(since) + 0.5) * LUNAR_MONTH_MS;
    const nextFull = nextFullMoonMs > nowMs ? nextFullMoonMs : nextFullMoonMs + LUNAR_MONTH_MS;

    return {
        phase,
        ageDays,
        nextNewMoon: new Date(nextNewMoonMs),
        nextFullMoon: new Date(nextFull),
    };
}

function phaseName(ageDays: number): string {
    if (ageDays < 1.0) return "New Moon";
    if (ageDays < 6.4) return "Waxing Crescent";
    if (ageDays < 8.4) return "First Quarter";
    if (ageDays < 13.8) return "Waxing Gibbous";
    if (ageDays < 15.8) return "Full Moon";
    if (ageDays < 21.1) return "Waning Gibbous";
    if (ageDays < 23.1) return "Last Quarter";
    if (ageDays < 28.5) return "Waning Crescent";
    return "New Moon";
}

function phaseIllumination(phase: number): number {
    // Percentage of moon illuminated
    return Math.round((1 - Math.cos(2 * Math.PI * phase)) / 2 * 100);
}

function daysBetween(a: Date, b: Date): number {
    return Math.max(0, Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function MoonPhaseWidget() {
    const data = useMemo(() => moonPhase(Date.now()), []);
    const illum = phaseIllumination(data.phase);
    const name = phaseName(data.ageDays);
    const now = new Date();
    const daysToNewMoon = daysBetween(data.nextNewMoon, now);
    const daysToFullMoon = daysBetween(data.nextFullMoon, now);

    // Simple SVG crescent/moon illustration based on illumination
    const radius = 32;
    const cx = 40;
    const cy = 40;
    const waxing = data.phase < 0.5;

    return (
        <Card className="border border-indigo-200 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/40 to-white dark:from-indigo-950/20 dark:to-slate-900">
            <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Moon phase &amp; Hijri sighting</h2>
                </div>

                <div className="flex items-center gap-5">
                    <svg width="80" height="80" viewBox="0 0 80 80" className="flex-shrink-0">
                        <defs>
                            <clipPath id="moonClip"><circle cx={cx} cy={cy} r={radius} /></clipPath>
                        </defs>
                        <circle cx={cx} cy={cy} r={radius} fill="#0f172a" />
                        {/* Illuminated portion: draw a white ellipse masked to the circle */}
                        <ellipse
                            cx={cx + (waxing ? radius : -radius) * (1 - 2 * illum / 100)}
                            cy={cy}
                            rx={radius}
                            ry={radius}
                            fill="#f8fafc"
                            clipPath="url(#moonClip)"
                        />
                        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#475569" strokeWidth="1" opacity="0.3" />
                    </svg>

                    <div className="flex-1 space-y-1">
                        <p className="text-xl font-semibold text-slate-900 dark:text-white">{name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {illum}% illuminated · day {data.ageDays.toFixed(1)} of the lunar cycle
                        </p>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 pt-4 border-t border-indigo-100 dark:border-indigo-900/30">
                    <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Next new moon</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {data.nextNewMoon.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                        <p className="text-xs text-slate-500">in {daysToNewMoon} {daysToNewMoon === 1 ? "day" : "days"}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Next full moon</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {data.nextFullMoon.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                        <p className="text-xs text-slate-500">in {daysToFullMoon} {daysToFullMoon === 1 ? "day" : "days"}</p>
                    </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-indigo-100 dark:border-indigo-900/30">
                    Astronomical approximation only. Actual Hijri month start depends on moon sighting (ruʾyah) by your local authority.
                </p>
            </CardContent>
        </Card>
    );
}
