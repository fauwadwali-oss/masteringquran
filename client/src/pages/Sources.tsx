import { TRANSLATIONS, TAFSIRS } from "@/lib/study-editions";
import { BookOpen, CheckCircle2, Library, SearchCheck, ShieldCheck, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";

const SOURCE_GROUPS = [
    {
        icon: BookOpen,
        title: "Quran Text and Recitation",
        items: [
            "Uthmani Arabic text, verse metadata and translation resources are fetched from the Quran.com API.",
            "Audio recitations are normalized from Quran.com verse audio URLs.",
            "Reader tools include surah, juz, hizb, rub, manzil, and page navigation.",
        ],
    },
    {
        icon: SearchCheck,
        title: "Translations and Tafsir",
        items: [
            "The reader offers 16 translations across seven languages, plus a Latin transliteration option. The list below matches the reader settings.",
            "Tafsir editions include abridged Ibn Kathir, al-Jalalayn and the other editions listed below. Edition labels follow the source dataset; an attribution is not a claim of scholarly verification.",
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

                <section className="mt-8 space-y-5 rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
                    <h2 className="text-2xl font-bold">Source directory</h2>
                    <ul className="space-y-3 text-sm leading-relaxed">
                        <li><SourceLink href="https://api.quran.com/api/v4/resources/translations?language=en">Quran.com translation resource catalog</SourceLink> — translator and resource metadata; the reader displays the selected edition above each translation.</li>
                        <li><SourceLink href="https://github.com/fauwadwali-oss/nwv-islamic-data">Our tafsir and hadith data mirror</SourceLink> — dataset layout, attribution and corrections.</li>
                        <li><SourceLink href="https://github.com/spa5k/tafsir_api">Upstream tafsir dataset</SourceLink> — edition provenance and available source details.</li>
                        <li><SourceLink href="https://github.com/fawazahmed0/hadith-api">Upstream hadith dataset</SourceLink> — edition metadata and numbering. Hadith numbers can differ between editions; use the displayed collection and book reference.</li>
                        <li><SourceLink href="https://ummahapi.com">UmmahAPI</SourceLink> — duas, Names of Allah and calendar information. Dua references are displayed when provided.</li>
                    </ul>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">Daily cards rotate at midnight UTC. The hadith card rotates through the 42 entries in the an-Nawawi dataset. Selections link to their full text; excerpts are not standalone rulings.</p>
                </section>
                <section className="mt-8 grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
                        <h2 className="mb-4 text-xl font-bold">Translations and transliteration</h2>
                        <ul className="space-y-2 text-sm">{TRANSLATIONS.map(edition => <li key={edition.id}>{edition.name} · {edition.language} · Resource {edition.id}</li>)}</ul>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
                        <h2 className="mb-4 text-xl font-bold">Tafsir editions</h2>
                        <ul className="space-y-2 text-sm">{TAFSIRS.map(edition => <li key={edition.slug}><SourceLink href={`https://github.com/fauwadwali-oss/nwv-islamic-data/tree/main/tafsir/${edition.slug}`}>{edition.name}</SourceLink></li>)}</ul>
                        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Translator or publisher details not supplied by a dataset are not inferred. Consult the upstream edition records when identifying a published edition.</p>
                    </div>
                </section>
                <section className="mt-8 rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
                    <h2 className="text-xl font-bold">Licensing and corrections</h2>
                    <p className="mt-3 text-sm leading-relaxed">The site's code is MIT licensed. Quran translations, commentary, recitation recordings and other content remain subject to their respective source terms; a code license does not grant blanket republication rights for the texts. Check the linked providers and edition details before reuse.</p>
                    <p className="mt-3 text-sm leading-relaxed">Found a text, reference or attribution error? <SourceLink href="mailto:fauwad@nusratwaliventures.com?subject=Mastering%20Quran%20content%20correction">Report a correction</SourceLink> with the page URL, verse or hadith reference, selected edition, and a supporting source. Rights holders can use the same contact.</p>
                </section>

                <div className="mt-8 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/20 p-5 text-sm leading-relaxed text-amber-900 dark:text-amber-200">
                    Mastering Quran supports learning and reflection. It does not replace qualified teachers, scholars, or local religious authorities for personal rulings, fatwas, or urgent religious guidance.
                </div>
            </section>
        </div>
    );
}

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
    return <a href={href} className="font-medium text-emerald-700 underline underline-offset-4 hover:text-emerald-900 dark:text-emerald-300">{children}</a>;
}
