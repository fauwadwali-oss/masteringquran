import { useState } from "react";
import { Link } from "react-router-dom";
import {
    BookOpen, Library, Sparkles, ArrowRight, Clock, Compass, Star, Heart, Calendar,
    Target, Trophy, GraduationCap, ScrollText, BookMarked, Calculator, Share2, Mail,
    MapPin, Flame, type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";
import TodayStrip from "@/components/TodayStrip";
import ReadingPaceWidget from "@/components/ReadingPaceWidget";

export default function Home() {
    const [lastSurah] = useState(() => {
        try {
            const value = Number(localStorage.getItem("lastViewedSurah"));
            return Number.isInteger(value) && value >= 1 && value <= 114 ? value : null;
        } catch { return null; }
    });
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            <SEO title="Mastering Quran | Read, Learn, and Understand the Holy Quran"
                description="Read the Quran with translation, audio and tafsir. Learn Arabic through 12 free lessons, browse hadith, and build a daily study habit." />
            <section className="bg-gradient-to-br from-[#0B2545] via-emerald-950 to-slate-950 px-5 py-8 text-white md:py-14">
                <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-5">
                        <p className="text-sm font-semibold text-emerald-200">Free to study · No ads</p>
                        <h1 className="text-4xl font-bold leading-tight md:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>Mastering Quran</h1>
                        <p className="font-amiri text-3xl text-emerald-200" dir="rtl" lang="ar">القرآن الكريم</p>
                        <p className="max-w-xl text-lg leading-relaxed text-slate-200">Read with understanding. Learn Arabic step by step. Make time for the Quran each day.</p>
                        <div className="flex flex-wrap gap-3">
                            <Link to="/quran" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 font-semibold text-emerald-950 hover:bg-emerald-100"><BookOpen className="h-5 w-5" />Read the Quran</Link>
                            <Link to="/learn-arabic/letters" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/40 px-6 font-semibold hover:bg-white/10"><GraduationCap className="h-5 w-5" />Start learning Arabic</Link>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-300">16 translations + transliteration · 10 tafsirs · Word-by-word audio</p>
                    </div>
                    <div className="rounded-3xl border border-white/15 bg-white/5 p-5 md:p-6">
                        <h2 className="text-xl font-semibold">{lastSurah ? "Continue studying" : "Start studying"}</h2>
                        <p className="mt-2 text-sm text-slate-300">{lastSurah ? "Return to the last surah opened on this device." : "Choose a starting point. Reading and lessons are free to browse."}</p>
                        <div className="mt-5 space-y-3">
                            <StudyLink to={lastSurah ? `/quran?verse=${lastSurah}:1` : "/quran?verse=1:1"} icon={BookOpen} title={lastSurah ? `Return to Surah ${lastSurah}` : "Begin with Al-Fatihah"} detail="Arabic, translation, audio and tafsir" />
                            <StudyLink to="/learn-arabic" icon={GraduationCap} title="Explore the Arabic curriculum" detail="12 lessons, from letters to five surahs" />
                            <StudyLink to="/hadith" icon={Library} title="Browse the hadith library" detail="Collections with references and available grades" />
                        </div>
                    </div>
                </div>
            </section>
            <div className="mx-auto max-w-6xl px-5"><ReadingPaceWidget /></div>
            <TodayStrip />
            <section className="mx-auto max-w-6xl px-6 pt-10">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Explore the study tools</h2>
                <p className="mt-2 text-slate-600 dark:text-slate-300">Find a companion for reading, learning, or daily practice.</p>
            </section>
            <section className="py-8 px-6 bg-gradient-to-b from-white via-amber-50/20 to-white dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950 border-t border-slate-100 dark:border-slate-800">
                <div className="max-w-6xl mx-auto">
                    <SectionHeader pill="Daily companions" title="For every part of the day" icon={Heart} accent="amber" />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Tile to="/prayer-times" icon={Clock} color="indigo" title="Prayer Times" description="Accurate salah timings for your location, 22 calculation methods." />
                        <Tile to="/qibla" icon={Compass} color="purple" title="Qibla Direction" description="Precise bearing to the Ka'bah from wherever you are." />
                        <Tile to="/names" icon={Star} color="amber" title="99 Names of Allah" description="Al-Asma al-Husna with Arabic, meaning, and reflection." />
                        <Tile to="/duas" icon={Heart} color="teal" title="Duas" description="126 authentic supplications across 27 categories." />
                        <Tile to="/ramadan" icon={Flame} color="rose" title="Ramadan" description="Fasting timings, reminders, and Laylat al-Qadr." />
                        <Tile to="/calendar" icon={Calendar} color="emerald" title="Hijri Calendar" description="Islamic calendar with Hijri dates and moon phase." />
                        <Tile to="/daily" icon={Mail} color="blue" title="Daily Reminder" description="A verse a day, emailed or pushed at your chosen time." />
                        <Tile to="/topics" icon={BookMarked} color="slate" title="Topics" description="Mercy, patience, justice, tawhid, curated verse indexes." />
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                LEARN & REFLECT
            ════════════════════════════════════════════════════════ */}
            <section className="py-8 px-6 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="max-w-6xl mx-auto">
                    <SectionHeader pill="Learn and reflect" title="Deepen your understanding" icon={ScrollText} accent="indigo" />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Tile to="/learn-arabic" icon={GraduationCap} color="emerald" title="Learn Arabic" description="The full 12-lesson curriculum from zero to reading five surahs." featured />
                        <Tile to="/prophets" icon={Sparkles} color="amber" title="Stories of Prophets" description="All 25 prophets named in the Quran, with verses and hadiths." />
                        <Tile to="/seerah" icon={ScrollText} color="emerald" title="Seerah" description="The life of Prophet Muhammad ﷺ in 10 chronological chapters." />
                        <Tile to="/hajj" icon={MapPin} color="teal" title="Hajj & Umrah Guide" description="Step-by-step rites with locations, duas, and tips." />
                        <Tile to="/glossary" icon={BookMarked} color="indigo" title="Islamic Glossary" description="120+ key terms, searchable by category." />
                        <Tile to="/zakat" icon={Calculator} color="amber" title="Zakat Calculator" description="Calculate your annual zakat with live nisab values." />
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                PRACTICE & PROGRESS
            ════════════════════════════════════════════════════════ */}
            <section className="py-8 px-6 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="max-w-6xl mx-auto">
                    <SectionHeader pill="Your practice" title="Build a lasting habit" icon={Trophy} accent="emerald" />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Tile to="/plans" icon={Calendar} color="emerald" title="Reading Plans" description="30-day, Ramadan, weekly, and themed plans." />
                        <Tile to="/quiz" icon={Trophy} color="blue" title="Quiz" description="Test your recognition of verses and 99 Names." />
                        <Tile to="/flashcards" icon={Target} color="amber" title="Flash Cards" description="99 Names, Arabic roots, Surah names, and more." />
                        <Tile to="/share" icon={Share2} color="rose" title="Share a Verse" description="Create beautiful verse images. 6 templates, download or share instantly." />
                    </div>
                </div>
            </section>


            <section className="bg-[#0B2545] px-6 py-10 text-white">
                <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
                    <div><h2 className="text-2xl font-bold">Questions as you study?</h2><p className="mt-3 leading-relaxed text-slate-200">Ask AI checks Quran, hadith and tafsir sources to support your study. Answers can contain mistakes; open the references and verify them.</p><Link to="/ask" className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-emerald-200 hover:underline">Ask a question<ArrowRight className="h-4 w-4" /></Link></div>
                    <div><h2 className="text-2xl font-bold">Follow the sources</h2><p className="mt-3 leading-relaxed text-slate-200">See the text providers, translation and tafsir editions, and how to report a correction.</p><Link to="/sources" className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-emerald-200 hover:underline">Sources and methodology<ArrowRight className="h-4 w-4" /></Link></div>
                </div>
            </section>
        </div>
    );
}
function StudyLink({ to, icon: Icon, title, detail }: { to: string; icon: LucideIcon; title: string; detail: string }) {
    return <Link to={to} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 hover:bg-white/10"><Icon className="h-5 w-5 shrink-0 text-emerald-200" /><span className="flex-1"><span className="block font-semibold">{title}</span><span className="mt-1 block text-sm text-slate-300">{detail}</span></span><ArrowRight className="h-4 w-4 shrink-0" /></Link>;
}
function SectionHeader({
    pill, title, icon: Icon = Sparkles, accent = "emerald",
}: {
    pill: string;
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
    accent?: "emerald" | "amber" | "indigo";
}) {
    const accentMap = {
        emerald: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
        amber: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300",
        indigo: "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300",
    };
    const iconColor = {
        emerald: "text-emerald-600 dark:text-emerald-400",
        amber: "text-amber-600 dark:text-amber-400",
        indigo: "text-indigo-600 dark:text-indigo-400",
    };
    return (
        <div className="mb-12 space-y-3 text-center">
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 ${accentMap[accent]}`}>
                <Icon className={`h-4 w-4 ${iconColor[accent]}`} />
                <span className="text-sm font-medium">{pill}</span>
            </div>
            <h2 className="mx-auto max-w-3xl text-3xl font-bold leading-tight text-slate-900 dark:text-white md:text-5xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                {title}
            </h2>
        </div>
    );
}

function Tile({
    to, icon: Icon, color, title, description, featured = false,
}: {
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    color: "indigo" | "purple" | "amber" | "teal" | "rose" | "emerald" | "blue" | "slate";
    title: string;
    description: string;
    featured?: boolean;
}) {
    const bg: Record<typeof color, string> = {
        indigo: "bg-indigo-100 dark:bg-indigo-900/40",
        purple: "bg-purple-100 dark:bg-purple-900/40",
        amber: "bg-amber-100 dark:bg-amber-900/40",
        teal: "bg-teal-100 dark:bg-teal-900/40",
        rose: "bg-rose-100 dark:bg-rose-900/40",
        emerald: "bg-emerald-100 dark:bg-emerald-900/40",
        blue: "bg-blue-100 dark:bg-blue-900/40",
        slate: "bg-slate-100 dark:bg-slate-800",
    };
    const text: Record<typeof color, string> = {
        indigo: "text-indigo-600 dark:text-indigo-400",
        purple: "text-purple-600 dark:text-purple-400",
        amber: "text-amber-600 dark:text-amber-400",
        teal: "text-teal-600 dark:text-teal-400",
        rose: "text-rose-600 dark:text-rose-400",
        emerald: "text-emerald-600 dark:text-emerald-400",
        blue: "text-blue-600 dark:text-blue-400",
        slate: "text-slate-600 dark:text-slate-400",
    };
    const hoverBorder: Record<typeof color, string> = {
        indigo: "hover:border-indigo-400",
        purple: "hover:border-purple-400",
        amber: "hover:border-amber-400",
        teal: "hover:border-teal-400",
        rose: "hover:border-rose-400",
        emerald: "hover:border-emerald-400",
        blue: "hover:border-blue-400",
        slate: "hover:border-slate-400",
    };
    return (
        <Link to={to} className="group">
            <Card className={`h-full border bg-white shadow-sm shadow-slate-900/5 transition-all hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900 ${
                featured
                    ? "border-emerald-300 ring-2 ring-emerald-100 dark:border-emerald-800 dark:ring-emerald-900/40"
                    : `border-slate-200 dark:border-slate-700 ${hoverBorder[color]}`
            }`}>
                <CardContent className="p-6 space-y-3">
                    <div className={`w-12 h-12 ${bg[color]} rounded-xl flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${text[color]}`} />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {title}
                        {featured && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                                New
                            </span>
                        )}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
                </CardContent>
            </Card>
        </Link>
    );
}
