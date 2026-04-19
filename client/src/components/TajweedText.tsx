// Quran.com returns tajweed-colored text as HTML with <tajweed class="rule_name">...</tajweed> tags.
// This component parses those and renders them with a color legend.
// Rule color reference from the tajweed colour standard used by most mushafs.

const TAJWEED_COLORS: Record<string, string> = {
    // Obligatory / permissible prolongations
    madda_obligatory: "text-red-600 dark:text-red-400",
    madda_permissible: "text-amber-600 dark:text-amber-400",
    madda_necessary: "text-fuchsia-700 dark:text-fuchsia-400",
    madda_normal: "text-emerald-600 dark:text-emerald-400",

    // Ghunnah + idgham
    ghunnah: "text-cyan-600 dark:text-cyan-400",
    idgham_ghunnah: "text-cyan-700 dark:text-cyan-300",
    idgham_no_ghunnah: "text-blue-600 dark:text-blue-400",
    idgham_shafawi: "text-blue-700 dark:text-blue-300",
    idgham_mutajanisayn: "text-indigo-700 dark:text-indigo-400",
    idgham_mutaqaribayn: "text-indigo-700 dark:text-indigo-400",

    // Iqlab
    iqlab: "text-orange-600 dark:text-orange-400",

    // Ikhfa
    ikhafa: "text-teal-600 dark:text-teal-400",
    ikhafa_shafawi: "text-teal-700 dark:text-teal-300",

    // Qalqalah
    qalaqah: "text-rose-700 dark:text-rose-400",

    // Hamza
    ham_wasl: "text-slate-400 dark:text-slate-500",
    slnt: "text-slate-400 dark:text-slate-500",
    laam_shamsiyah: "text-slate-400 dark:text-slate-500",
};

const RULE_LABELS: Record<string, string> = {
    madda_obligatory: "Madd Wajib",
    madda_permissible: "Madd Jaʾiz",
    madda_necessary: "Madd Lazim",
    madda_normal: "Madd Tabīʿi",
    ghunnah: "Ghunnah",
    idgham_ghunnah: "Idgham w/ Ghunnah",
    idgham_no_ghunnah: "Idgham w/o Ghunnah",
    idgham_shafawi: "Idgham Shafawi",
    iqlab: "Iqlab",
    ikhafa: "Ikhfa",
    ikhafa_shafawi: "Ikhfa Shafawi",
    qalaqah: "Qalqalah",
    ham_wasl: "Hamzat al-Wasl",
    slnt: "Silent",
    laam_shamsiyah: "Lām Shamsiyyah",
};

interface Token {
    text: string;
    rule?: string;
}

function tokenize(input: string): Token[] {
    if (!input) return [];
    const tokens: Token[] = [];
    const regex = /<tajweed class=([^>]+)>([\s\S]*?)<\/tajweed>/g;
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(input)) !== null) {
        if (m.index > lastIndex) tokens.push({ text: input.slice(lastIndex, m.index) });
        tokens.push({ text: m[2], rule: m[1].replace(/["']/g, "").trim() });
        lastIndex = m.index + m[0].length;
    }
    if (lastIndex < input.length) tokens.push({ text: input.slice(lastIndex) });
    return tokens;
}

export default function TajweedText({ html, className = "" }: { html: string; className?: string }) {
    const tokens = tokenize(html);
    return (
        <p className={className} dir="rtl">
            {tokens.map((t, i) =>
                t.rule ? (
                    <span key={i} className={TAJWEED_COLORS[t.rule] || "text-slate-900 dark:text-slate-100"} title={RULE_LABELS[t.rule] || t.rule}>
                        {t.text}
                    </span>
                ) : (
                    <span key={i}>{t.text}</span>
                ),
            )}
        </p>
    );
}

export function TajweedLegend() {
    const rules = [
        "madda_obligatory",
        "madda_permissible",
        "madda_normal",
        "ghunnah",
        "idgham_ghunnah",
        "iqlab",
        "ikhafa",
        "qalaqah",
        "ham_wasl",
    ];
    return (
        <div className="flex flex-wrap gap-2 text-[11px]">
            {rules.map((r) => (
                <span key={r} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">
                    <span className={`font-amiri text-base ${TAJWEED_COLORS[r] || ""}`}>ﻢ</span>
                    <span className="text-slate-600 dark:text-slate-400">{RULE_LABELS[r]}</span>
                </span>
            ))}
        </div>
    );
}
