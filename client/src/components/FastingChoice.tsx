import type { FastingId } from "@/lib/prayer";

const OPTIONS: { id: FastingId; label: string }[] = [
    { id: "sunni", label: "Sunni" },
    { id: "shia", label: "Shia" },
];

// Sunni / Shia switch for Suhoor and Iftar times. Saved with the prayer settings.
export default function FastingChoice({ value, onChange }: { value?: FastingId; onChange: (v: FastingId) => void }) {
    return (
        <div role="radiogroup" aria-label="Suhoor and Iftar times" className="inline-flex rounded-xl bg-amber-100/70 p-1 dark:bg-amber-950/40">
            {OPTIONS.map((o) => (
                <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={value === o.id}
                    onClick={() => onChange(o.id)}
                    className={`min-h-9 rounded-lg px-4 text-sm font-semibold transition-colors ${
                        value === o.id
                            ? "bg-white text-amber-800 shadow-sm dark:bg-slate-900 dark:text-amber-300"
                            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}
