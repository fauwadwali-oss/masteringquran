import { useState } from "react";
import { Link } from "react-router-dom";
import { HelpCircle, ChevronDown } from "lucide-react";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";

interface QA {
    q: string;
    a: React.ReactNode;
}

const FAQS: QA[] = [
    {
        q: "Is Mastering Quran really free?",
        a: "Yes. The site has no ads, no paywalls, no tracking for advertising, and no account requirement for the core features. A free account unlocks bookmarks, notes, and memorization tracking that sync across your devices.",
    },
    {
        q: "Which Quran translations do you use?",
        a: "17 translations across 8 languages. Defaults are Yusuf Ali (English) and Latin transliteration, but you can switch to Saheeh International, Pickthall, Abdel Haleem, Maududi, Hilali & Khan, Taqi Usmani, Jalandhari, Junagarhi, Maududi (Tafheem), Wahiduddin Khan, Hamidullah (French), Abu Reda (German), Diyanet (Turkish), Indonesian Ministry, or Taisirul Quran (Bengali).",
    },
    {
        q: "Which tafsirs are included?",
        a: "10 classical and modern English tafsirs: Ibn Kathir (abridged), al-Jalalayn, Ma'arif al-Qur'an (Mufti Shafi), Tazkirul Quran (Wahiduddin Khan), Tanwîr al-Miqbâs (Ibn Abbas), Lataif al-Ishara (al-Qushairi), al-Tustari, Kashani, Kashf al-Asrar, and Asbab al-Nuzul (al-Wahidi).",
    },
    {
        q: "Which hadith collections are included?",
        a: "Ten canonical English collections: Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud, Jami' at-Tirmidhi, Sunan an-Nasa'i, Sunan Ibn Majah, Muwatta Malik, 40 Hadith of an-Nawawi, 40 Hadith Qudsi, and 40 Hadith of Shah Waliullah Dehlawi.",
    },
    {
        q: "How does the AI avoid fabricated citations?",
        a: (
            <>
                Every factual claim the AI makes must come from a tool call. Before it writes an answer, it fetches the actual verse, hadith, or tafsir text from a verified source and is shown that text. The system prompt forbids inventing references. See the full scope and guardrails in the{" "}
                <Link to="/ask" className="text-emerald-600 dark:text-emerald-400 hover:underline">Ask AI</Link> page.
            </>
        ),
    },
    {
        q: "What is the AI scoped to?",
        a: "Quran, authentic hadith, and classical tafsir only. The AI is explicitly told to decline fiqh rulings, fatwas, personal religious guidance, and matters of ijtihad — for those, consult a qualified scholar. It is a study companion, not a jurist.",
    },
    {
        q: "How are prayer times calculated?",
        a: "Prayer times come from UmmahAPI with 22 calculation methods (Muslim World League, ISNA, Umm al-Qura, Egyptian, Karachi, and more) plus Hanafi/Shafi madhab for Asr. Location is computed in your browser and never sent to our servers — UmmahAPI receives only latitude and longitude.",
    },
    {
        q: "Why is there sometimes an ayah number difference?",
        a: "Translations may follow slightly different ayah numbering conventions (e.g. whether 'Bismillah' counts as ayah 1 in Surah al-Fatiha). We use Quran.com's standard verse_key scheme throughout.",
    },
    {
        q: "How are 'similar verses' chosen?",
        a: "Two parallel methods: semantic similarity via multilingual sentence embeddings over four English translations, and Arabic root overlap using the Quranic Arabic Corpus morphology (IDF-weighted Jaccard). Both top 10s are surfaced so you can see meaning parallels and linguistic parallels side by side.",
    },
    {
        q: "What do you do with my data?",
        a: (
            <>
                Very little. Anonymous browsing is not logged beyond standard server access logs. With an account, your bookmarks, notes, and reading progress are stored on our Supabase backend. We never sell data. See the full{" "}
                <Link to="/privacy" className="text-emerald-600 dark:text-emerald-400 hover:underline">Privacy Policy</Link>.
            </>
        ),
    },
    {
        q: "Can I report an error or suggest a feature?",
        a: (
            <>
                Please do — email <a href="mailto:fauwad@nusratwaliventures.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">fauwad@nusratwaliventures.com</a>. Errors in sacred text or translation are the highest priority.
            </>
        ),
    },
    {
        q: "Who runs this site?",
        a: (
            <>
                Mastering Quran is operated by Nusrat Wali Ventures LLC, a family-run company based in Houston, Texas. It is offered as sadaqah jariyah. See the <Link to="/about" className="text-emerald-600 dark:text-emerald-400 hover:underline">About</Link> page.
            </>
        ),
    },
];

export default function FAQ() {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            <SEO
                title="FAQ - Mastering Quran"
                description="Frequently asked questions about Mastering Quran: translations, tafsirs, hadith collections, the AI assistant, privacy, and more."
            />
            <section className="py-10 px-6 md:py-16">
                <div className="max-w-3xl mx-auto space-y-8">
                    <PageHero
                        eyebrow="Frequently asked"
                        title="FAQ"
                        description="Answers about translations, tafsir, hadith collections, AI citations, privacy, and the sources behind the project."
                        icon={HelpCircle}
                    />

                    <div className="space-y-2">
                        {FAQS.map((item, i) => (
                            <div
                                key={i}
                                className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden"
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpen(open === i ? null : i)}
                                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                                >
                                    <span className="font-semibold text-slate-900 dark:text-white text-sm md:text-base">{item.q}</span>
                                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${open === i ? "rotate-180" : ""}`} />
                                </button>
                                {open === i && (
                                    <div className="px-5 pb-5 text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                        Something else on your mind? Email{" "}
                        <a href="mailto:fauwad@nusratwaliventures.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                            fauwad@nusratwaliventures.com
                        </a>.
                    </div>
                </div>
            </section>
        </div>
    );
}
