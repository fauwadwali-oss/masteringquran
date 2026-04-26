import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

interface PageHeroProps {
    eyebrow: string;
    title: string;
    description?: string;
    icon?: ComponentType<{ className?: string }>;
    accent?: "emerald" | "amber" | "indigo" | "teal" | "purple";
    className?: string;
}

const accentStyles = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    amber: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300",
    teal: "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300",
    purple: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300",
};

export default function PageHero({
    eyebrow,
    title,
    description,
    icon: Icon,
    accent = "emerald",
    className,
}: PageHeroProps) {
    return (
        <div className={cn("relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/80 px-6 py-10 text-center shadow-xl shadow-slate-900/5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 md:px-10 md:py-12", className)}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.10),transparent_30%)]" />
            <div className="relative mx-auto max-w-3xl space-y-4">
                <div className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium", accentStyles[accent])}>
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{eyebrow}</span>
                </div>
                <h1 className="text-4xl font-bold leading-tight text-slate-950 dark:text-white md:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {title}
                </h1>
                {description && (
                    <p className="mx-auto max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
