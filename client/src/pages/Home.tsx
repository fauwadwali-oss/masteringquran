import { Link } from "react-router-dom";
import { BookOpen, Library, Sparkles, ArrowDown, Volume2, Layers, Languages, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            <SEO
                title="Mastering Quran | Read, Listen, and Understand the Holy Quran"
                description="A free Quran reader with word-by-word translation, 10 English tafsirs, authentic hadith collections, and an AI assistant grounded in verified scholarship. Study the Holy Quran with confidence."
            />

            {/* Hero */}
            <section className="relative py-24 md:py-32 px-6 bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-950 text-white overflow-hidden">
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
                        Free · No sign-up · Grounded in verified sources
                    </div>

                    <h1 className="text-5xl md:text-8xl font-bold tracking-tight bg-gradient-to-r from-white via-emerald-100 to-amber-200 bg-clip-text text-transparent drop-shadow-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Mastering Quran
                    </h1>

                    <p className="font-amiri text-3xl md:text-4xl text-emerald-200 opacity-90" dir="rtl">
                        القرآن الكريم
                    </p>

                    <p className="text-xl md:text-2xl text-emerald-100 font-medium">
                        Read, listen, and understand the Holy Quran
                    </p>

                    <p className="max-w-2xl mx-auto text-slate-300 text-base leading-relaxed">
                        Full Quran with word-by-word translation, 10 English tafsirs, canonical hadith collections, and an AI assistant that cites every source. Study with clarity and confidence.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                        <Button asChild size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 font-semibold px-8 py-3 text-base shadow-lg hover:shadow-xl transition-all hover:scale-105">
                            <Link to="/quran">
                                <BookOpen className="mr-2 h-5 w-5" />
                                Read the Quran
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-semibold px-8 py-3 text-base backdrop-blur-sm transition-all hover:border-white/60 hover:scale-105">
                            <Link to="/ask">
                                <Sparkles className="mr-2 h-5 w-5" />
                                Ask AI
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-xs text-slate-400">Explore tools</p>
                        <ArrowDown className="h-5 w-5 text-slate-300" />
                    </div>
                </div>
            </section>

            {/* Tool tiles */}
            <section id="tools" className="py-16 px-6 bg-gradient-to-b from-white via-emerald-50/30 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12 space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">What's inside</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Three ways to study
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <Link to="/quran" className="group">
                            <Card className="h-full border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-800 dark:to-emerald-950/20 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                                <CardContent className="p-8 space-y-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <BookOpen className="h-7 w-7 text-emerald-600 dark:text-emerald-300" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Read the Quran</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Full Quran in Uthmani script, 8 reciters, 17 translations across 8 languages, word-by-word mode, and 10 classical English tafsirs on every verse.
                                    </p>
                                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">Open reader →</p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link to="/hadith" className="group">
                            <Card className="h-full border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-800 dark:to-amber-950/20 hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                                <CardContent className="p-8 space-y-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <Library className="h-7 w-7 text-amber-600 dark:text-amber-300" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Browse Hadith</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Ten canonical English collections — Sahih al-Bukhari, Sahih Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah, Malik, and the three Forty Hadith compilations.
                                    </p>
                                    <p className="text-amber-600 dark:text-amber-400 font-semibold text-sm">Open library →</p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link to="/ask" className="group">
                            <Card className="h-full border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-950/20 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                                <CardContent className="p-8 space-y-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <Sparkles className="h-7 w-7 text-blue-600 dark:text-blue-300" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Ask AI</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        A scholarly assistant grounded in verified sources. Every answer is backed by a tool call to the Quran, hadith, or tafsir — no hallucinated citations, ever.
                                    </p>
                                    <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm">Start asking →</p>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 px-6 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Built for serious study
                    </h2>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 mx-auto bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
                                <Layers className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Word by word</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Tap any Arabic word for transliteration, English meaning, and per-word audio playback.</p>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 mx-auto bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">10 Tafsirs</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Ibn Kathir, al-Jalalayn, Ma'arif al-Quran, Tazkirul Quran, and six more English editions.</p>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
                                <Volume2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">8 Reciters</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Sudais, Alafasy, Husary, Minshawi, Abdul Basit, Shuraym, Shatri, Rifai.</p>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 mx-auto bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center">
                                <Languages className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">17 Translations</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">English, Urdu, French, German, Turkish, Indonesian, Bengali — plus transliteration.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Search CTA */}
            <section className="py-12 px-6 bg-slate-50 dark:bg-slate-950">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-full border border-emerald-200 dark:border-emerald-800 mb-4">
                        <Search className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Looking for something specific?</span>
                    </div>
                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                        Jump directly into the Quran with our verse search, or ask the AI a question in plain English.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                            <Link to="/quran">Search the Quran</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline">
                            <Link to="/ask">Ask the AI</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
