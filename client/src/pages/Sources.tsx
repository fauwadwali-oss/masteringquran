import { BookOpen, CheckCircle2, Library, SearchCheck, ShieldCheck, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";

const SOURCE_GROUPS = [
    {
        icon: BookOpen,
        title: "Quran Text and Recitation",
        items: [
            "Uthmani Arabic text and verse metadata are fetched from Quran.com-compatible APIs.",
            "Audio recitations are normalized from Quran.com verse audio URLs.",
            "Reader tools include surah, juz, hizb, rub, manzil, and page navigation.",
        ],
    },
    {
        icon: SearchCheck,
        title: "Translations and Tafsir",
        items: [
            "The reader offers 17 translation options across English, Urdu, French, German, Turkish, Indonesian, and Bengali.",
            "English tafsir editions include Ibn Kathir, al-Jalalayn, Ma'arif al-Quran, Tazkirul Quran, Asbab al-Nuzul, and other classical resources mirrored for study use.",
            "Translation and tafsir text is shown as study material, not as a replacement for qualified scholarship.",
        ],
    },
    {
        icon: Library,
        title: "Hadith Collections",
        items: [
            "Hadith pages use the nwv-islamic-data mirror of the open hadith-api dataset.",
            "Collections include Sahih al-Bukhari, Sahih Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah, Muwatta Malik, and three Forty Hadith compilations.",
            "Collection names, counts, book sections, references, and grades are preserved where available from the source data.",
        ],
    },
    {
        icon: Sparkles,
        title: "Ask AI Method",
        items: [
            "Ask AI is designed to answer only with Quran, hadith, or tafsir source checks.",
            "Answers expose the source tools used, such as reading a verse, searching Quran, reading tafsir, or searching hadith.",
            "The assistant declines fatwas and sensitive religious rulings, and reminds users to verify guidance with a qualified scholar.",
        ],
    },
];

export default function Sources() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 font-sans">
            <SEO
                title="Sources and Methodology | Mastering Quran"
                description="How Mastering Quran uses Quran text, translations, tafsir, hadith collections, and AI source checks for a trustworthy Islamic study experience."
                canonicalPath="/sources"
            />

            <section className="max-w-5xl mx-auto px-6 py-14 md:py-20">
                <div className="text-center mb-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Verified source workflow</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Sources and Methodology
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        Mastering Quran is built to keep study grounded: Quran text, translations, tafsir, hadith, and AI answers should point back to identifiable sources.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                    {SOURCE_GROUPS.map((group) => (
                        <Card key={group.title} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                                        <group.icon className="h-5 w-5" />
                                    </span>
                                    <h2 className="font-bold text-slate-900 dark:text-white">{group.title}</h2>
                                </div>
                                <div className="space-y-3">
                                    {group.items.map((item) => (
                                        <div key={item} className="flex gap-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                            <p>{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-8 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/20 p-5 text-sm leading-relaxed text-amber-900 dark:text-amber-200">
                    Mastering Quran supports learning and reflection. It does not replace qualified teachers, scholars, or local religious authorities for personal rulings, fatwas, or urgent religious guidance.
                </div>
            </section>
        </div>
    );
}
