import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, ArrowRight, Heart, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";

// Tribute page for Dr. Nusrat Wali and Dr. Wali Ahmad, the namesakes of
// the parent company (Nusrat Wali Ventures LLC). Mastering Quran exists
// as a continuation of their commitment to education, service, and care.
// Mirrors the style of the original page at nusratwaliventures.com/in-loving-memory
// but with Mastering Quran branding and language adapted to a spiritual
// study platform.

export default function Tribute() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 via-slate-50 to-white dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950 font-serif">
            <SEO
                title="In Loving Memory, Dr. Nusrat Wali and Dr. Wali Ahmad"
                description="A tribute to the late Dr. Nusrat Wali and Dr. Wali Ahmad, whose commitment to education, service, and care shaped Mastering Quran."
            />

            <div className="container mx-auto px-6 py-4">
                <Link
                    to="/"
                    className="inline-flex items-center text-purple-700 dark:text-purple-300 hover:underline text-sm"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>
            </div>

            {/* Quran card */}
            <div className="max-w-4xl mx-auto mt-12 md:mt-16 px-4">
                <Link to="/quran" className="block group">
                    <Card className="overflow-hidden border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <CardContent className="p-8 text-center space-y-4 bg-gradient-to-br from-emerald-50 to-purple-50 dark:from-emerald-950/30 dark:to-purple-950/30">
                            <BookOpen className="w-12 h-12 mx-auto text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform duration-300" />
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 font-serif">
                                Read the Holy Quran
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                                &ldquo;Verily, in the remembrance of Allah do hearts find rest.&rdquo; (13:28)<br />
                                Read and listen to the Quran in Arabic, English, and Urdu.
                            </p>
                            <div className="pt-3">
                                <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium group-hover:underline">
                                    Open Quran <ArrowRight className="w-4 h-4 ml-1" />
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Hero */}
            <section className="relative py-20 md:py-28 text-center space-y-6 px-6 overflow-hidden mt-12">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-100/40 via-purple-50/30 to-pink-50/60 dark:from-purple-950/40 dark:via-slate-950/60 dark:to-purple-950/50" />
                <div className="relative z-10 space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold text-purple-900 dark:text-purple-100 tracking-tight drop-shadow-sm">
                        In Loving Memory
                    </h1>
                    <div className="w-24 h-1 bg-purple-300 mx-auto rounded-full" />
                    <p className="text-2xl md:text-3xl text-purple-800 dark:text-purple-200 italic font-medium">
                        Forever in Our Hearts
                    </p>
                    <p className="font-amiri text-2xl md:text-3xl text-purple-700 dark:text-purple-300 pt-4" dir="rtl">
                        إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                        &ldquo;Truly we belong to Allah, and truly to Him we shall return.&rdquo; (Quran 2:156)
                    </p>
                </div>
            </section>

            {/* Two portraits */}
            <section className="py-16 px-6 container mx-auto">
                <div className="grid md:grid-cols-2 gap-16 max-w-4xl mx-auto">
                    <PortraitCard
                        name="Dr. Nusrat Wali"
                        dates="December 25, 1947 – September 17, 2022"
                        role="General Physician"
                        relation="Beloved Mother"
                        gradient="from-purple-300 via-pink-300 to-purple-400"
                    />
                    <PortraitCard
                        name="Dr. Wali Ahmad"
                        dates="January 2, 1939 – August 8, 2024"
                        role="General Physician"
                        relation="Beloved Father"
                        gradient="from-purple-300 via-indigo-300 to-purple-400"
                    />
                </div>
            </section>

            {/* A Life Well Lived */}
            <section className="py-16 px-6 bg-white/60 dark:bg-black/20 backdrop-blur-sm">
                <div className="max-w-3xl mx-auto text-center space-y-10">
                    <div className="space-y-4">
                        <h3 className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                            A Life Well Lived
                        </h3>
                        <blockquote className="text-xl italic text-purple-800 dark:text-purple-200 font-medium leading-relaxed">
                            &ldquo;Those we love don't go away, they walk beside us every day. Unseen, unheard, but always near, still loved, still missed, and very dear.&rdquo;
                        </blockquote>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-2xl font-semibold text-purple-800 dark:text-purple-200">Their Legacy</h4>
                        <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                            Our parents taught us the true meaning of love, dedication, and family. Their warmth, wisdom, and unwavering support shaped who we are today. Every lesson they shared, every moment of laughter, and every act of kindness continues to inspire us.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-2xl font-semibold text-purple-800 dark:text-purple-200">Forever Remembered</h4>
                        <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                            Though they may be gone from our sight, they will never be gone from our hearts. Their spirit lives on in the values they instilled, the memories we cherish, and the love that continues to bind our family together.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mastering Quran connection */}
            <section className="py-16 px-6 bg-gradient-to-b from-purple-50/60 to-emerald-50/40 dark:from-purple-950/20 dark:to-emerald-950/20">
                <div className="max-w-3xl mx-auto text-center space-y-5">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-full border border-purple-200 dark:border-purple-800">
                        <Heart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">This platform is dedicated to them</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Why Mastering Quran exists
                    </h3>
                    <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                        Dr. Nusrat Wali and Dr. Wali Ahmad spent their lives serving patients, raising family, and passing on what they knew. Mastering Quran, and its parent venture Nusrat Wali Ventures, continue that thread: free, authentic, and useful tools that help people engage with what matters most.
                    </p>
                    <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                        Every verse read on this platform, every hadith studied, every lesson completed by a learner taking their first step toward Arabic, is a sadaqah jariyah (ongoing charity) we hope reaches them.
                    </p>
                    <p className="font-amiri text-2xl text-emerald-800 dark:text-emerald-300 pt-4" dir="rtl">
                        رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                        &ldquo;My Lord, have mercy upon them as they brought me up when I was small.&rdquo; (Quran 17:24)
                    </p>
                </div>
            </section>

            {/* A candle in their memory + sadaqah call */}
            <section className="py-20 px-6 text-center bg-gradient-to-b from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
                <div className="max-w-lg mx-auto space-y-8">
                    <div className="relative w-32 h-44 mx-auto">
                        <div className="absolute -inset-8 bg-amber-400/20 rounded-full blur-2xl opacity-70" />
                        <div className="relative z-10 w-full h-full flex items-end justify-center">
                            <div className="relative">
                                <Flame className="absolute -top-10 left-1/2 -translate-x-1/2 w-12 h-12 text-amber-400 animate-pulse drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
                                <div className="w-16 h-32 bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100 rounded-md shadow-xl border border-amber-200" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                            Send them a du'a
                        </h3>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            The greatest gift to the departed is prayer on their behalf. Read a verse, say a du'a, or share their story. Every moment of remembrance reaches them.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                        <Link
                            to="/quran"
                            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
                        >
                            <BookOpen className="h-4 w-4" /> Read a verse for them
                        </Link>
                        <Link
                            to="/duas"
                            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-sm font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                        >
                            <Heart className="h-4 w-4" /> Find a du'a
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

function PortraitCard({
    name, dates, role, relation, gradient,
}: {
    name: string;
    dates: string;
    role: string;
    relation: string;
    gradient: string;
}) {
    return (
        <div className="group text-center space-y-6">
            <div className="relative mx-auto w-56 h-56">
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient} opacity-60 blur-sm group-hover:opacity-80 transition-opacity duration-500`} />
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50" />
                <div className="absolute inset-4 rounded-full bg-white dark:bg-slate-800 shadow-inner overflow-hidden border-4 border-white dark:border-slate-700 flex items-center justify-center">
                    <Heart className="w-16 h-16 text-purple-300 dark:text-purple-600" />
                </div>
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-purple-900 dark:text-purple-100">{name}</h2>
                <p className="text-purple-600 dark:text-purple-300 font-medium">{dates}</p>
                <p className="text-slate-600 dark:text-slate-400 font-sans text-lg">{role}</p>
                <p className="text-slate-500 dark:text-slate-500 font-sans text-sm italic pt-2">{relation}</p>
            </div>
        </div>
    );
}
