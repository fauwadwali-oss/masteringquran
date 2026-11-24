import { GRADE_SUMMARY_LABEL, gradeSummary, type HadithGrade } from "@/lib/hadith";

const COLOR = {
    sound: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    weak: "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
    fabricated: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
    differs: "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
    ungraded: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

/** Overall grading, with every grader in the dataset listed. Bukhari and Muslim carry no per-hadith grades. */
export default function HadithGrades({ grades, collection }: { grades?: HadithGrade[]; collection: string }) {
    if (collection === "bukhari" || collection === "muslim") return null;
    const summary = gradeSummary(grades);
    const graded = (grades ?? []).filter((g) => g.grade);
    const badge = <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${COLOR[summary]}`}>{GRADE_SUMMARY_LABEL[summary]}</span>;
    if (!graded.length) return badge;
    return (
        <details className="text-xs">
            <summary className="cursor-pointer list-none">{badge}</summary>
            <ul className="mt-2 space-y-0.5 text-slate-600 dark:text-slate-400">
                {graded.map((g, i) => (
                    <li key={i}>{g.name ? `${g.name}: ` : ""}{g.grade}</li>
                ))}
            </ul>
        </details>
    );
}
