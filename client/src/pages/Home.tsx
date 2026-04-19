import { Link } from "react-router-dom";
import {
    BookOpen, Library, Sparkles, ArrowDown, ArrowRight, Volume2, Layers, Languages, Clock, Compass,
    Star, Heart, Calendar, Target, Trophy, GraduationCap, ScrollText, BookMarked, Calculator,
    Share2, Mail, MapPin, Flame, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";
import TodayStrip from "@/components/TodayStrip";
import ReadingPaceWidget from "@/components/ReadingPaceWidget";

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            <SEO
                title="Mastering Quran | Read, Learn, and Understand the Holy Quran"
                description="Read the Quran with 17 translations and 10 tafsirs. Learn to read Arabic from zero in 12 lessons. Browse 15,000+ hadiths. Plus Prophets, Seerah, Hajj, Zakat, and an AI assistant that cites every source. Free and authentic."
            />

            {/* ════════════════════════════════════════════════════════
                HERO
            ════════════════════════════════════════════════════════ */}
            <section className="relative py-24 md:py-32 px-6 bg-gradient-to-br from-slate-900 via-[#0B2545] to-emerald-950 text-white overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <img
                        src="/MQ_shield_logo.png"
                        alt=""
                        aria-hidden="true"
                        className="w-[min(90vw,900px)] h-auto opacity-[0.08] md:opacity-[0.10] drop-shadow-2xl select-none"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/60"></div>
                <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>

                <div className="relative max-w-5xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm text-emerald-100 border border-white/20">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                        Free, authentic, and grounded in verified sources
                    </div>

                    <h1 className="text-5xl md:text-8xl font-bold tracking-tight bg-gradient-to-r from-white via-emerald-100 to-amber-200 bg-clip-text text-transparent drop-shadow-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Mastering Quran
                    </h1>

                    <p className="font-amiri text-3xl md:text-4xl text-emerald-200 opacity-90" dir="rtl">
                        القرآن الكريم
                    </p>

                    <p className="text-xl md:text-2xl text-emerald-100 font-medium max-w-3xl mx-auto">
                        Read the Quran. Learn Arabic from zero. Study hadith. Live the deen.
                    </p>

                    <p className="max-w-2xl mx-auto text-slate-300 text-base leading-relaxed">
                        A complete Islamic study platform: full Quran with 17 translations and 10 tafsirs,
                        15,000+ hadiths, a 12-lesson Learn Arabic curriculum, an AI assistant that cites every source,
                        and daily companions for every part of the day.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                        <Button asChild size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 font-semibold px-8 py-3 text-base shadow-lg hover:shadow-xl transition-all hover:scale-105">
                            <Link to="/quran">
                                <BookOpen className="mr-2 h-5 w-5" />
                                Read the Quran
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-semibold px-8 py-3 text-base backdrop-blur-sm transition-all hover:border-white/60 hover:scale-105">
                            <Link to="/learn-arabic">
                                <GraduationCap className="mr-2 h-5 w-5" />
                                Learn Arabic from Zero
                            </Link>
                        </Button>
                    </div>

                    {/* Stats pills */}
                    <div className="pt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
                        <StatPill label="6,236 verses" />
                        <StatPill label="17 translations" />
                        <StatPill label="10 English tafsirs" />
                        <StatPill label="8 reciters" />
                        <StatPill label="15,000+ hadiths" />
                        <StatPill label="25 prophets" />
                        <StatPill label="AI that cites sources" />
                    </div>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-xs text-slate-400">Explore</p>
                        <ArrowDown className="h-5 w-5 text-slate-300" />
                    </div>
                </div>
            </section>

            {/* Reading pace widget (signed-in only) */}
            <div className="max-w-6xl mx-auto px-6 pt-10">
                <ReadingPaceWidget />
            </div>

            {/* Today strip */}
            <TodayStrip />

            {/* ════════════════════════════════════════════════════════
                LEARN ARABIC, the NEW headline feature
            ════════════════════════════════════════════════════════ */}
            <section className="py-16 md:py-24 px-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 border-t border-emerald-100 dark:border-emerald-900/40">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-10 items-center">
                        <div className="space-y-5">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-950/60 rounded-full border border-emerald-200 dark:border-emerald-800">
                                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">New, the full curriculum</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Learn Arabic from zero to reading the Quran
                            </h2>
                            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                                A 12-lesson path from the 28 letters to reading five full surahs. Noorani Qaida foundations, 175 most common Quranic words, grammar, numbers and phrases, the root system, writing practice, and a graduation certificate.
                            </p>
                            <div className="space-y-2 pt-2">
                                <LearnRow number="1-6" label="Foundations" desc="Letters, shapes, harakat, tanween & madd, tajweed, your first surah" />
                                <LearnRow number="7" label="Vocabulary" desc="175 most common Quranic words across 11 themes" />
                                <LearnRow number="8" label="Grammar" desc="Pronouns, verb tenses, noun cases, possessive suffixes" />
                                <LearnRow number="9" label="Everyday Arabic" desc="Numbers, days, Hijri months, greetings, daily du'as" />
                                <LearnRow number="10" label="The Root System" desc="30 key roots, 200+ derivations across the Quran" />
                                <LearnRow number="11" label="Writing" desc="Interactive letter tracing with canvas" />
                                <LearnRow number="12" label="Graduation" desc="5 surahs word-by-word + certificate" />
                            </div>
                            <div className="pt-2">
                                <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3">
                                    <Link to="/learn-arabic">
                                        Start Lesson 1, The 28 Letters
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Visual, big letter + progress preview */}
                        <div className="relative">
                            <div className="relative rounded-3xl bg-gradient-to-br from-[#0B2545] via-[#102a50] to-[#0B2545] p-10 shadow-2xl overflow-hidden">
                                <div className="absolute top-4 right-4 opacity-20">
                                    <img src="/MQ_shield_logo.png" alt="" className="w-20 h-auto" />
                                </div>
                                <div className="relative space-y-4">
                                    <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                                        <GraduationCap className="h-4 w-4" /> Lesson 1 of 12
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white text-sm">Alif</p>
                                            <p className="text-emerald-300 font-amiri text-sm" dir="rtl">ألف</p>
                                        </div>
                                        <span className="font-amiri text-9xl text-[#F4D06F] leading-none" dir="rtl">ا</span>
                                    </div>
                                    <div className="border-t border-white/10 pt-4 space-y-2">
                                        <p className="text-xs uppercase tracking-wider text-slate-400">Example word</p>
                                        <div className="flex items-center justify-between">
                                            <p className="font-amiri text-3xl text-emerald-200" dir="rtl">أَب</p>
                                            <p className="text-sm text-slate-300">father</p>
                                        </div>
                                    </div>
                                    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-emerald-400 to-amber-300" style={{ width: "8%" }} />
                                    </div>
                                    <p className="text-[11px] text-slate-400">Your progress · 1 of 12 lessons</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                THREE WAYS TO STUDY
            ════════════════════════════════════════════════════════ */}
            <section className="py-16 px-6 bg-gradient-to-b from-white via-emerald-50/30 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="max-w-6xl mx-auto">
                    <SectionHeader pill="Core study" title="Three ways to engage with scripture" />
                    <div className="grid md:grid-cols-3 gap-6">
                        <CoreStudyTile
                            to="/quran"
                            icon={BookOpen}
                            accent="emerald"
                            title="Read the Quran"
                            description="Full Quran in Uthmani script. 17 translations across 8 languages. 10 classical English tafsirs. Word-by-word mode. Tajweed colored text. Verse bookmarks and notes."
                            cta="Open the reader"
                        />
                        <CoreStudyTile
                            to="/hadith"
                            icon={Library}
                            accent="amber"
                            title="Browse Hadith"
                            description="Ten canonical English collections, Sahih al-Bukhari, Sahih Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah, Malik, and the three Forty Hadith compilations."
                            cta="Open the library"
                        />
                        <CoreStudyTile
                            to="/ask"
                            icon={Sparkles}
                            accent="blue"
                            title="Ask AI"
                            description="A scholarly assistant grounded in verified sources. Every answer is backed by a tool call to the Quran, hadith, or tafsir, no hallucinated citations, ever."
                            cta="Start asking"
                        />
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                DAILY COMPANIONS
            ════════════════════════════════════════════════════════ */}
            <section className="py-16 px-6 bg-gradient-to-b from-white via-amber-50/20 to-white dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950 border-t border-slate-100 dark:border-slate-800">
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
            <section className="py-16 px-6 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-t border-slate-100 dark:border-slate-800">
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
            <section className="py-16 px-6 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 border-t border-slate-100 dark:border-slate-800">
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

            {/* ════════════════════════════════════════════════════════
                FEATURE HIGHLIGHTS STRIP
            ════════════════════════════════════════════════════════ */}
            <section className="py-16 px-6 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-t border-slate-100 dark:border-slate-800">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Built for serious study
                    </h2>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                        <FeatureHighlight icon={Layers} color="emerald" title="Word by word" desc="Tap any Arabic word for transliteration, meaning, and per-word audio." />
                        <FeatureHighlight icon={BookOpen} color="amber" title="10 Tafsirs" desc="Ibn Kathir, al-Jalalayn, Ma'arif al-Quran, Tazkirul Quran, and 6 more." />
                        <FeatureHighlight icon={Volume2} color="blue" title="8 Reciters" desc="Sudais, Alafasy, Husary, Minshawi, Abdul Basit, Shuraym, Shatri, Rifai." />
                        <FeatureHighlight icon={Languages} color="indigo" title="17 Translations" desc="English, Urdu, French, German, Turkish, Indonesian, Bengali, and more." />
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════════════════════
                BOTTOM CTA
            ════════════════════════════════════════════════════════ */}
            <section className="py-20 px-6 bg-gradient-to-br from-[#0B2545] via-emerald-950 to-[#0B2545] text-white">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <img src="/MQ_shield_logo.png" alt="Mastering Quran" className="h-20 w-auto mx-auto drop-shadow-xl" />
                    <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Everything you need, always free
                    </h2>
                    <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
                        No ads. No paywalls. Just the Book, the Sunnah, and the tools to engage with them properly.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                        <Button asChild size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 font-semibold">
                            <Link to="/quran">Start reading</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-semibold">
                            <Link to="/learn-arabic">Start learning Arabic</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-semibold">
                            <Link to="/daily">Get a verse a day</Link>
                        </Button>
                    </div>
                    <div className="pt-8 flex items-center justify-center gap-6 text-xs text-slate-400 flex-wrap">
                        <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Authentic sources
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> No tracking or ads
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Installable as an app
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Free forever
                        </span>
                    </div>
                </div>
            </section>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────

function StatPill({ label }: { label: string }) {
    return (
        <span className="inline-flex items-center px-3 py-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
            {label}
        </span>
    );
}

function LearnRow({ number, label, desc }: { number: string; label: string; desc: string }) {
    return (
        <div className="flex items-start gap-3 text-sm">
            <span className="flex-shrink-0 w-12 h-7 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                {number}
            </span>
            <div>
                <span className="font-semibold text-slate-900 dark:text-white">{label}</span>
                <span className="text-slate-600 dark:text-slate-400"> · {desc}</span>
            </div>
        </div>
    );
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
        <div className="text-center mb-12 space-y-3">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${accentMap[accent]}`}>
                <Icon className={`h-4 w-4 ${iconColor[accent]}`} />
                <span className="text-sm font-medium">{pill}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                {title}
            </h2>
        </div>
    );
}

function CoreStudyTile({
    to, icon: Icon, accent, title, description, cta,
}: {
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: "emerald" | "amber" | "blue";
    title: string;
    description: string;
    cta: string;
}) {
    const map = {
        emerald: {
            border: "hover:border-emerald-400 dark:hover:border-emerald-500",
            bg: "from-white to-emerald-50/50 dark:from-slate-800 dark:to-emerald-950/20",
            iconBg: "from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50",
            iconColor: "text-emerald-600 dark:text-emerald-300",
            ctaColor: "text-emerald-600 dark:text-emerald-400",
        },
        amber: {
            border: "hover:border-amber-400 dark:hover:border-amber-500",
            bg: "from-white to-amber-50/50 dark:from-slate-800 dark:to-amber-950/20",
            iconBg: "from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50",
            iconColor: "text-amber-600 dark:text-amber-300",
            ctaColor: "text-amber-600 dark:text-amber-400",
        },
        blue: {
            border: "hover:border-blue-400 dark:hover:border-blue-500",
            bg: "from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-950/20",
            iconBg: "from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50",
            iconColor: "text-blue-600 dark:text-blue-300",
            ctaColor: "text-blue-600 dark:text-blue-400",
        },
    };
    const c = map[accent];
    return (
        <Link to={to} className="group">
            <Card className={`h-full border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br ${c.bg} ${c.border} transition-all duration-300 hover:shadow-2xl hover:-translate-y-2`}>
                <CardContent className="p-8 space-y-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${c.iconBg} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-7 w-7 ${c.iconColor}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
                    <p className={`${c.ctaColor} font-semibold text-sm`}>{cta} →</p>
                </CardContent>
            </Card>
        </Link>
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
            <Card className={`h-full border bg-white dark:bg-slate-900 transition-all hover:shadow-xl hover:-translate-y-1 ${
                featured
                    ? "border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-100 dark:ring-emerald-900/40"
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

function FeatureHighlight({
    icon: Icon, color, title, desc,
}: {
    icon: React.ComponentType<{ className?: string }>;
    color: "emerald" | "amber" | "blue" | "indigo";
    title: string;
    desc: string;
}) {
    const map = {
        emerald: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
        amber: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
        blue: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
        indigo: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
    };
    const [bg, text] = map[color].split(" ").reduce<[string[], string[]]>(
        (acc, cls) => {
            if (cls.startsWith("text-")) acc[1].push(cls);
            else acc[0].push(cls);
            return acc;
        },
        [[], []],
    );
    return (
        <div className="text-center space-y-2">
            <div className={`w-12 h-12 mx-auto ${bg.join(" ")} rounded-xl flex items-center justify-center`}>
                <Icon className={`h-6 w-6 ${text.join(" ")}`} />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
        </div>
    );
}
