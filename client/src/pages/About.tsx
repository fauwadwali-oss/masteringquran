import { Link } from "react-router-dom";
import { BookOpen, Heart, Sparkles, Library } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";

export default function About() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            <SEO
                title="About - Mastering Quran"
                description="Mastering Quran is a free, ad-free Islamic study platform offering the Quran, hadith, tafsir, and an AI assistant grounded in verified sources."
            />
            <section className="py-16 px-6">
                <div className="max-w-3xl mx-auto space-y-10">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <Heart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Sadaqah Jariyah</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                            About Mastering Quran
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300">
                            A free and ad-free home for Quranic study, carried by the Mastering family.
                        </p>
                    </div>

                    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <CardContent className="p-6 md:p-8 space-y-4">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Our mission</h2>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                Mastering Quran exists to make the Qur'an, authentic Sunnah, and classical tafsir accessible — with clarity, integrity, and reverence. Everything on this site is free. Nothing is behind a paywall. Your data is yours.
                            </p>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                We believe software can serve the Ummah the way classical scholars served it: by assembling trustworthy sources, citing every claim, and getting out of the way of the reader. The AI assistant here never invents citations; it calls tools to fetch real verses, hadith, and commentary before responding.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-3 gap-4">
                        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <CardContent className="p-5 space-y-2">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Quranic text</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Uthmani script, 8 reciters, 17 translations, word-by-word with per-word audio, tajweed color-coding, and 10 classical English tafsirs.</p>
                            </CardContent>
                        </Card>
                        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <CardContent className="p-5 space-y-2">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                                    <Library className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Hadith</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Ten canonical English hadith collections including Sahih al-Bukhari, Sahih Muslim, and the four Sunan.</p>
                            </CardContent>
                        </Card>
                        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <CardContent className="p-5 space-y-2">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                    <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Grounded AI</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Every answer the AI gives is backed by a tool call to the Quran, hadith, or tafsir. It cites — it never invents.</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <CardContent className="p-6 md:p-8 space-y-4">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Our sources</h2>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                We curate and mirror data from respected open projects. Attribution is a priority, not a footnote.
                            </p>
                            <ul className="space-y-2 text-slate-700 dark:text-slate-300 text-sm">
                                <li>• <strong>Quran text, translations, word-by-word, audio</strong> — <a href="https://quran.com/api" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Quran.com API v4</a></li>
                                <li>• <strong>English tafsirs</strong> — mirrored from <a href="https://github.com/spa5k/tafsir_api" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">spa5k/tafsir_api</a></li>
                                <li>• <strong>Hadith collections</strong> — mirrored from <a href="https://github.com/fawazahmed0/hadith-api" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">fawazahmed0/hadith-api</a></li>
                                <li>• <strong>Prayer times, Qibla, duas, 99 names, Islamic calendar</strong> — <a href="https://ummahapi.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">UmmahAPI</a></li>
                                <li>• <strong>Arabic morphology</strong> — the <a href="https://corpus.quran.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Quranic Arabic Corpus</a> by Kais Dukes</li>
                                <li>• <strong>AI</strong> — Anthropic Claude Haiku with a mandatory tool-use loop</li>
                            </ul>
                            <p className="text-sm text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                                Our own consolidated mirror lives at <a href="https://github.com/fauwadwali-oss/nwv-islamic-data" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">fauwadwali-oss/nwv-islamic-data</a>.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <CardContent className="p-6 md:p-8 space-y-3">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Operated by</h2>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                Nusrat Wali Ventures LLC · Houston, Texas.
                            </p>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                This project is offered as <em>sadaqah jariyah</em> — a continuing charity. If the site benefits your worship or study, please remember us, our parents, and the scholars whose work we carry forward in your duʿā.
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Contact: <a href="mailto:fauwad@nusratwaliventures.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">fauwad@nusratwaliventures.com</a>
                            </p>
                        </CardContent>
                    </Card>

                    <div className="text-center space-y-3">
                        <p className="font-amiri text-2xl text-emerald-700 dark:text-emerald-400" dir="rtl">
                            رَّبَّنَا تَقَبَّلْ مِنَّا ۖ إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ
                        </p>
                        <p className="text-sm italic text-slate-500 dark:text-slate-400">
                            "Our Lord, accept this from us. Indeed, You are the Hearing, the Knowing." (Quran 2:127)
                        </p>
                        <div className="flex items-center justify-center gap-4 pt-4">
                            <Link to="/" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">Home</Link>
                            <Link to="/faq" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">FAQ</Link>
                            <Link to="/privacy" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">Privacy</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
