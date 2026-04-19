import { useEffect, useMemo, useState } from "react";
import { Sparkles, ArrowLeft, ArrowRight, RotateCcw, Loader2, Shuffle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";

type Deck = "names" | "roots" | "surahs";

interface FlashCard {
    front: string;
    frontSub?: string;
    back: string;
    backSub?: string;
    reference?: string;
    dir?: "ltr" | "rtl";
}

const SURAH_CARDS: FlashCard[] = [
    { front: "الفاتحة", back: "Al-Fatihah", backSub: "The Opening · 7 verses · Meccan", dir: "rtl" },
    { front: "البقرة", back: "Al-Baqarah", backSub: "The Cow · 286 verses · Medinan", dir: "rtl" },
    { front: "آل عمران", back: "Aal-Imran", backSub: "The Family of Imran · 200 verses · Medinan", dir: "rtl" },
    { front: "النساء", back: "An-Nisa", backSub: "The Women · 176 verses · Medinan", dir: "rtl" },
    { front: "المائدة", back: "Al-Ma'idah", backSub: "The Table Spread · 120 verses · Medinan", dir: "rtl" },
    { front: "الأنعام", back: "Al-An'am", backSub: "The Cattle · 165 verses · Meccan", dir: "rtl" },
    { front: "الأعراف", back: "Al-A'raf", backSub: "The Heights · 206 verses · Meccan", dir: "rtl" },
    { front: "يوسف", back: "Yusuf", backSub: "Joseph · 111 verses · Meccan", dir: "rtl" },
    { front: "الكهف", back: "Al-Kahf", backSub: "The Cave · 110 verses · Meccan", dir: "rtl" },
    { front: "مريم", back: "Maryam", backSub: "Mary · 98 verses · Meccan", dir: "rtl" },
    { front: "طه", back: "Ta-Ha", backSub: "98 verses · Meccan · Opens with disjointed letters", dir: "rtl" },
    { front: "يس", back: "Ya-Sin", backSub: "83 verses · Meccan · 'Heart of the Quran'", dir: "rtl" },
    { front: "الرحمن", back: "Ar-Rahman", backSub: "The Most Merciful · 78 verses · Medinan · Refrain of 31 verses", dir: "rtl" },
    { front: "الواقعة", back: "Al-Waqi'ah", backSub: "The Inevitable · 96 verses · Meccan", dir: "rtl" },
    { front: "الملك", back: "Al-Mulk", backSub: "The Sovereignty · 30 verses · Meccan · Recommended before sleep", dir: "rtl" },
    { front: "الإخلاص", back: "Al-Ikhlas", backSub: "Sincerity · 4 verses · Meccan · Equals a third of the Quran", dir: "rtl" },
    { front: "الفلق", back: "Al-Falaq", backSub: "The Daybreak · 5 verses · Meccan · Seeks refuge from external evil", dir: "rtl" },
    { front: "الناس", back: "An-Nas", backSub: "Mankind · 6 verses · Meccan · Seeks refuge from the whisperer", dir: "rtl" },
];

const ROOT_CARDS: FlashCard[] = [
    { front: "ر ح م", frontSub: "r-ḥ-m", back: "Mercy, compassion", backSub: "Source of Rahman, Rahim, rahma", reference: "Used ~339 times" },
    { front: "ع ل م", frontSub: "ʿ-l-m", back: "To know", backSub: "Source of ilm (knowledge), aalim (scholar), Al-'Alim", reference: "Used ~854 times" },
    { front: "و ح د", frontSub: "w-ḥ-d", back: "One, unique", backSub: "Source of wahid, tawhid", reference: "Central to Islamic theology" },
    { front: "ع ب د", frontSub: "ʿ-b-d", back: "To worship; servant", backSub: "Source of ibadah, abd", reference: "Used ~275 times" },
    { front: "ص ل و", frontSub: "ṣ-l-w", back: "To pray, connect", backSub: "Source of salah, musalli", reference: "Prayer appears ~83 times" },
    { front: "ز ك و", frontSub: "z-k-w", back: "To purify, grow", backSub: "Source of zakat, tazkiyah", reference: "Purification of wealth and self" },
    { front: "ج ه د", frontSub: "j-h-d", back: "To strive, exert effort", backSub: "Source of jihad, mujahid", reference: "Primary meaning: effort in faith" },
    { front: "ص ب ر", frontSub: "ṣ-b-r", back: "Patience, endurance", backSub: "Source of sabr, saabir", reference: "Used ~103 times" },
    { front: "ش ك ر", frontSub: "sh-k-r", back: "To be grateful", backSub: "Source of shukr, shaakir, mashkuur", reference: "Opposite of kufr (ingratitude)" },
    { front: "ق و م", frontSub: "q-w-m", back: "To stand, establish", backSub: "Source of qiyam, qayyum (Al-Hayy al-Qayyum)", reference: "Al-Qayyum = the Self-Subsisting" },
    { front: "ح ي ي", frontSub: "ḥ-y-y", back: "Life, living", backSub: "Source of hayy (living), hayah", reference: "Al-Hayy = the Ever-Living" },
    { front: "خ ل ق", frontSub: "kh-l-q", back: "To create, fashion", backSub: "Source of khalq (creation), Al-Khaliq", reference: "Used ~261 times" },
    { front: "ن و ر", frontSub: "n-w-r", back: "Light", backSub: "Source of nur, munir, An-Nur", reference: "'Allah is the Light of the heavens and earth' (24:35)" },
    { front: "د ع و", frontSub: "d-ʿ-w", back: "To call, invoke", backSub: "Source of du'a, da'wah", reference: "Supplication and invitation" },
    { front: "ه د ي", frontSub: "h-d-y", back: "To guide, lead", backSub: "Source of huda (guidance), haadi", reference: "'Guide us to the straight path' (1:6)" },
];

const DECKS: Record<Deck, { label: string; emoji: string; color: string; getCards: () => Promise<FlashCard[]> | FlashCard[] }> = {
    names: {
        label: "99 Names of Allah",
        emoji: "✨",
        color: "amber",
        getCards: async () => {
            const r = await fetch("https://ummahapi.com/api/asma-ul-husna");
            const d: any = await r.json();
            const list = Array.isArray(d.data) ? d.data : d.data?.names || [];
            return list.map((n: any) => ({
                front: n.arabic,
                frontSub: n.transliteration,
                back: n.english,
                backSub: n.meaning,
                reference: `#${n.number} of 99`,
                dir: "rtl" as const,
            }));
        },
    },
    roots: {
        label: "Arabic roots",
        emoji: "📚",
        color: "emerald",
        getCards: () => ROOT_CARDS,
    },
    surahs: {
        label: "Surah names",
        emoji: "📖",
        color: "blue",
        getCards: () => SURAH_CARDS,
    },
};

const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
    amber: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800" },
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
    blue: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
};

export default function Flashcards() {
    const [deck, setDeck] = useState<Deck | null>(null);
    const [cards, setCards] = useState<FlashCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [idx, setIdx] = useState(0);
    const [flipped, setFlipped] = useState(false);

    useEffect(() => {
        if (!deck) return;
        setLoading(true);
        setCards([]);
        Promise.resolve(DECKS[deck].getCards())
            .then((c) => {
                setCards(c);
                setIdx(0);
                setFlipped(false);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [deck]);

    const shuffleDeck = () => {
        const shuffled = [...cards];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setCards(shuffled);
        setIdx(0);
        setFlipped(false);
    };

    const current = cards[idx];

    if (!deck) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
                <SEO title="Flash Cards - Mastering Quran" description="Practice 99 Names, Arabic roots, and Surah names with interactive flash cards." />
                <section className="py-16 px-6">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div className="text-center space-y-3">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 rounded-full border border-amber-200 dark:border-amber-800">
                                <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Practice deck</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Flash Cards
                            </h1>
                            <p className="text-slate-600 dark:text-slate-300">Pick a deck to start practicing.</p>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4">
                            {(Object.entries(DECKS) as [Deck, typeof DECKS["names"]][]).map(([key, d]) => {
                                const c = COLOR_CLASSES[d.color];
                                return (
                                    <Card
                                        key={key}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setDeck(key)}
                                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setDeck(key)}
                                        className={`cursor-pointer border-2 ${c.border} bg-white dark:bg-slate-900 hover:shadow-xl transition-all hover:-translate-y-0.5`}
                                    >
                                        <CardContent className="p-6 space-y-3 text-center">
                                            <div className="text-4xl">{d.emoji}</div>
                                            <h3 className={`text-lg font-semibold ${c.text}`}>{d.label}</h3>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    const deckInfo = DECKS[deck];
    const colors = COLOR_CLASSES[deckInfo.color];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            <SEO title={`${deckInfo.label} flash cards`} description="Practice Islamic vocabulary." />
            <section className="py-12 px-6">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="sm" onClick={() => setDeck(null)}>← Decks</Button>
                        <Button variant="ghost" size="sm" onClick={shuffleDeck} className="gap-2">
                            <Shuffle className="h-3 w-3" /> Shuffle
                        </Button>
                    </div>

                    <div className={`text-center ${colors.text} text-sm font-semibold uppercase tracking-wider`}>
                        {deckInfo.emoji} {deckInfo.label}
                    </div>

                    {loading ? (
                        <Card className="p-16 text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
                        </Card>
                    ) : !current ? (
                        <Card className="p-8 text-center">
                            <p className="text-slate-500">No cards available.</p>
                        </Card>
                    ) : (
                        <>
                            <Card
                                onClick={() => setFlipped(!flipped)}
                                className={`cursor-pointer border-2 ${colors.border} bg-white dark:bg-slate-900 min-h-[300px] flex items-center justify-center select-none transition-transform hover:scale-[1.01]`}
                            >
                                <CardContent className="p-8 text-center w-full">
                                    {!flipped ? (
                                        <div className="space-y-3">
                                            <p
                                                className={`font-amiri text-5xl md:text-6xl ${colors.text} leading-relaxed`}
                                                dir={current.dir === "rtl" ? "rtl" : "ltr"}
                                            >
                                                {current.front}
                                            </p>
                                            {current.frontSub && (
                                                <p className="text-lg italic text-slate-500 dark:text-slate-400">{current.frontSub}</p>
                                            )}
                                            <p className="text-xs text-slate-400 pt-4">Tap to flip</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 animate-in fade-in duration-200">
                                            <p className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{current.back}</p>
                                            {current.backSub && (
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{current.backSub}</p>
                                            )}
                                            {current.reference && (
                                                <p className="text-xs text-slate-400 pt-2">{current.reference}</p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIdx(Math.max(0, idx - 1));
                                        setFlipped(false);
                                    }}
                                    disabled={idx === 0}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" /> Prev
                                </Button>
                                <span className="text-sm text-slate-500">
                                    {idx + 1} / {cards.length}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIdx(Math.min(cards.length - 1, idx + 1));
                                        setFlipped(false);
                                    }}
                                    disabled={idx >= cards.length - 1}
                                >
                                    Next <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                                <RotateCcw className="h-3 w-3" />
                                <span>Tap the card to flip. Shuffle anytime for a new order.</span>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
