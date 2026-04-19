import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Play, Pause, BookOpen, Loader2, AlertCircle, Bookmark, BookmarkCheck, Volume2, VolumeX, SkipForward, SkipBack, ChevronLeft, ChevronRight, Star, X, Mic, Moon, Languages, Layers, Copy, Share2, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import TafsirPanel from "@/components/TafsirPanel";
import WordByWordVerse, { QuranWord } from "@/components/WordByWordVerse";
import TajweedText, { TajweedLegend } from "@/components/TajweedText";
import ChapterInfoPanel from "@/components/ChapterInfoPanel";
import SimilarVersesPanel from "@/components/SimilarVersesPanel";
import CompareTranslationsModal from "@/components/CompareTranslationsModal";

// Types
interface Surah {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
}

interface Ayah {
    number: number;
    text: string;
    numberInSurah: number;
    audio?: string;
    sajda?: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

interface VerseData {
    number: number;
    surahNumber: number;
    globalNumber: number;
    arabic: string;
    arabicTajweed?: string;
    english: string;
    urdu: string;
    audio?: string;
    isSajda: boolean;
    tafsir?: string;
    words?: QuranWord[];
}

interface SearchResult {
    number: number;
    text: string;
    surah: { number: number; name: string; englishName: string };
    numberInSurah: number;
}

interface Bookmark {
    surahNumber: number;
    verseNumber: number;
    surahName: string;
    timestamp: number;
}

// Reciters list (Quran.com API v4 recitation IDs)
const RECITERS = [
    { id: "3", name: "Abdurrahmaan As-Sudais", arabicName: "عبدالرحمن السديس" },
    { id: "7", name: "Mishary Alafasy", arabicName: "مشاري العفاسي" },
    { id: "6", name: "Mahmoud Khalil Al-Husary", arabicName: "محمود خليل الحصري" },
    { id: "9", name: "Muhammad Siddiq Al-Minshawi", arabicName: "محمد صديق المنشاوي" },
    { id: "2", name: "Abdul Basit (Murattal)", arabicName: "عبد الباسط عبد الصمد" },
    { id: "10", name: "Saood Ash-Shuraym", arabicName: "سعود الشريم" },
    { id: "4", name: "Abu Bakr al-Shatri", arabicName: "أبو بكر الشاطري" },
    { id: "5", name: "Hani ar-Rifai", arabicName: "هاني الرفاعي" },
];

// Translations list (Quran.com API v4 translation IDs)
const TRANSLATIONS = [
    { id: "20", name: "Sahih International", language: "English" },
    { id: "22", name: "Yusuf Ali", language: "English" },
    { id: "19", name: "Pickthall", language: "English" },
    { id: "85", name: "Abdel Haleem", language: "English" },
    { id: "95", name: "Maududi (Tafhim)", language: "English" },
    { id: "203", name: "Hilali & Khan", language: "English" },
    { id: "84", name: "Taqi Usmani", language: "English" },
    { id: "57", name: "Transliteration (Latin)", language: "English" },
    { id: "234", name: "Jalandhari", language: "Urdu" },
    { id: "54", name: "Junagarhi", language: "Urdu" },
    { id: "97", name: "Maududi (Tafheem)", language: "Urdu" },
    { id: "819", name: "Wahiduddin Khan", language: "Urdu" },
    { id: "31", name: "Hamidullah", language: "French" },
    { id: "208", name: "Abu Reda", language: "German" },
    { id: "77", name: "Diyanet", language: "Turkish" },
    { id: "33", name: "Indonesian Islamic Affairs", language: "Indonesian" },
    { id: "161", name: "Taisirul Quran", language: "Bengali" },
];

// English Tafsir editions mirrored in nwv-islamic-data
const TAFSIRS = [
    { slug: "en-tafisr-ibn-kathir", name: "Ibn Kathir (Abridged)" },
    { slug: "en-al-jalalayn", name: "al-Jalalayn" },
    { slug: "en-tafsir-maarif-ul-quran", name: "Ma'arif al-Qur'an — Mufti Shafi" },
    { slug: "en-tazkirul-quran", name: "Tazkirul Quran — Wahiduddin Khan" },
    { slug: "en-tafsir-ibn-abbas", name: "Tanwîr al-Miqbâs — Ibn Abbas" },
    { slug: "en-al-qushairi-tafsir", name: "Lataif al-Ishara — al-Qushairi" },
    { slug: "en-tafsir-al-tustari", name: "al-Tustari" },
    { slug: "en-kashani-tafsir", name: "Kashani" },
    { slug: "en-kashf-al-asrar-tafsir", name: "Kashf al-Asrar" },
    { slug: "en-asbab-al-nuzul-by-al-wahidi", name: "Asbab al-Nuzul — al-Wahidi" },
];

// Strip HTML footnote markers from Quran.com translation text
const cleanTranslation = (text: string | undefined | null): string =>
    (text || "").replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]+>/g, "").trim();

// Turn Quran.com's relative audio URL into an absolute HTTPS URL
const normalizeAudioUrl = (url: string | undefined | null): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith("http")) return url;
    if (url.startsWith("//")) return "https:" + url;
    return "https://verses.quran.com/" + url;
};

export default function Quran() {
    // State
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
    const [verses, setVerses] = useState<VerseData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    // Audio state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPlayingVerse, setCurrentPlayingVerse] = useState<number | null>(null);
    const [isContinuousPlay, setIsContinuousPlay] = useState(false);
    const [selectedReciter, setSelectedReciter] = useState("3");

    // Translation state
    const [selectedTranslation, setSelectedTranslation] = useState("22");
    const [secondaryTranslation, setSecondaryTranslation] = useState("57");

    // Navigation state
    const [viewMode, setViewMode] = useState<"surah" | "juz" | "hizb" | "rub" | "manzil" | "page">("surah");
    const [currentJuz, setCurrentJuz] = useState(1);
    const [currentHizb, setCurrentHizb] = useState(1);
    const [currentRub, setCurrentRub] = useState(1);
    const [currentManzil, setCurrentManzil] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    // Full-surah audio
    const [fullSurahPlaying, setFullSurahPlaying] = useState(false);
    const [fullSurahLoading, setFullSurahLoading] = useState(false);
    const fullSurahAudioRef = useRef<HTMLAudioElement | null>(null);

    // Bookmarks state
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [showBookmarks, setShowBookmarks] = useState(false);
    const [copiedVerseId, setCopiedVerseId] = useState<number | null>(null);

    // Tafsir state
    const [showTafsir, setShowTafsir] = useState(false);
    const [selectedTafsir, setSelectedTafsir] = useState("en-tafisr-ibn-kathir");

    // Word-by-word mode
    const [showWordByWord, setShowWordByWord] = useState(false);

    // Tajweed mode (color-coded tajweed rules)
    const [showTajweed, setShowTajweed] = useState(false);

    // Per-verse "show similar" toggle
    const [expandedSimilar, setExpandedSimilar] = useState<Set<string>>(new Set());

    // Compare-translations modal — stores the verse_key currently being compared
    const [compareKey, setCompareKey] = useState<string | null>(null);
    const toggleSimilar = (verseKey: string) => {
        setExpandedSimilar((prev) => {
            const next = new Set(prev);
            if (next.has(verseKey)) next.delete(verseKey); else next.add(verseKey);
            return next;
        });
    };

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Load bookmarks from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("quranBookmarks");
        if (saved) {
            setBookmarks(JSON.parse(saved));
        }
    }, []);

    // Save bookmarks to localStorage
    const saveBookmark = (surahNumber: number, verseNumber: number, surahName: string) => {
        const newBookmark: Bookmark = {
            surahNumber,
            verseNumber,
            surahName,
            timestamp: Date.now()
        };

        const exists = bookmarks.some(
            b => b.surahNumber === surahNumber && b.verseNumber === verseNumber
        );

        if (exists) {
            const filtered = bookmarks.filter(
                b => !(b.surahNumber === surahNumber && b.verseNumber === verseNumber)
            );
            setBookmarks(filtered);
            localStorage.setItem("quranBookmarks", JSON.stringify(filtered));
            toast.success("Bookmark removed");
        } else {
            const updated = [...bookmarks, newBookmark];
            setBookmarks(updated);
            localStorage.setItem("quranBookmarks", JSON.stringify(updated));
            toast.success("Bookmark added");
        }
    };

    const isBookmarked = (surahNumber: number, verseNumber: number) => {
        return bookmarks.some(
            b => b.surahNumber === surahNumber && b.verseNumber === verseNumber
        );
    };

    // Fetch Surah List (Quran.com API v4)
    useEffect(() => {
        const fetchSurahs = async () => {
            try {
                const response = await fetch("https://api.quran.com/api/v4/chapters?language=en");
                const data = await response.json();
                const mapped: Surah[] = (data.chapters || []).map((c: any) => ({
                    number: c.id,
                    name: c.name_arabic,
                    englishName: c.name_simple,
                    englishNameTranslation: c.translated_name?.name || "",
                    numberOfAyahs: c.verses_count,
                    revelationType: c.revelation_place === "makkah" ? "Meccan" : "Medinan",
                }));
                if (mapped.length) {
                    setSurahs(mapped);
                    const lastViewed = localStorage.getItem("lastViewedSurah");
                    const initialSurahNumber = lastViewed ? parseInt(lastViewed) : 1;
                    const initialSurah = mapped.find((s: Surah) => s.number === initialSurahNumber);
                    setCurrentSurah(initialSurah || mapped[0]);
                } else {
                    setError("Failed to fetch Surahs");
                }
            } catch (err) {
                setError("An error occurred while fetching Surahs");
            } finally {
                setLoading(false);
            }
        };

        fetchSurahs();
    }, []);

    // Fetch Verses based on view mode
    useEffect(() => {
        if (viewMode === "surah" && currentSurah) {
            fetchSurahVerses();
        } else if (viewMode === "juz") {
            fetchJuzVerses();
        } else if (viewMode === "hizb") {
            fetchHizbVerses();
        } else if (viewMode === "rub") {
            fetchRubVerses();
        } else if (viewMode === "manzil") {
            fetchManzilVerses();
        } else if (viewMode === "page") {
            fetchPageVerses();
        }
    }, [currentSurah, viewMode, currentJuz, currentHizb, currentRub, currentManzil, currentPage, selectedReciter, selectedTranslation, secondaryTranslation]);

    // Map Quran.com verses payload to our VerseData shape
    const mapQuranComVerses = (verses: any[]): VerseData[] =>
        (verses || []).map((v: any) => {
            const [surahNum, ayahNum] = String(v.verse_key || "1:1").split(":").map(Number);
            const primary = v.translations?.find((t: any) => String(t.resource_id) === selectedTranslation);
            const secondary = v.translations?.find((t: any) => String(t.resource_id) === secondaryTranslation);
            return {
                number: ayahNum,
                surahNumber: surahNum,
                globalNumber: v.id,
                arabic: v.text_uthmani || "",
                arabicTajweed: v.text_uthmani_tajweed || undefined,
                english: cleanTranslation(primary?.text),
                urdu: cleanTranslation(secondary?.text),
                audio: normalizeAudioUrl(v.audio?.url),
                isSajda: !!v.sajdah_type,
                words: Array.isArray(v.words) ? v.words as QuranWord[] : undefined,
            } as VerseData;
        });

    const fetchSurahVerses = async () => {
        if (!currentSurah) return;

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `https://api.quran.com/api/v4/verses/by_chapter/${currentSurah.number}?translations=${selectedTranslation},${secondaryTranslation}&audio=${selectedReciter}&fields=text_uthmani,text_uthmani_tajweed,sajdah_type&words=true&word_fields=text_uthmani,translation,transliteration,audio_url,char_type_name&per_page=300`
            );
            const data = await response.json();

            if (Array.isArray(data.verses)) {
                setVerses(mapQuranComVerses(data.verses));
                localStorage.setItem("lastViewedSurah", currentSurah.number.toString());
            } else {
                setError("Failed to fetch verses");
            }
        } catch (err) {
            setError("An error occurred while fetching verses");
        } finally {
            setLoading(false);
        }
    };

    const fetchJuzVerses = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `https://api.quran.com/api/v4/verses/by_juz/${currentJuz}?translations=${selectedTranslation},${secondaryTranslation}&audio=${selectedReciter}&fields=text_uthmani,text_uthmani_tajweed,sajdah_type&words=true&word_fields=text_uthmani,translation,transliteration,audio_url,char_type_name&per_page=300`
            );
            const data = await response.json();

            if (Array.isArray(data.verses)) {
                setVerses(mapQuranComVerses(data.verses));
            } else {
                setError("Failed to fetch Juz");
            }
        } catch (err) {
            setError("An error occurred while fetching Juz");
        } finally {
            setLoading(false);
        }
    };

    const fetchPageVerses = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `https://api.quran.com/api/v4/verses/by_page/${currentPage}?translations=${selectedTranslation},${secondaryTranslation}&audio=${selectedReciter}&fields=text_uthmani,text_uthmani_tajweed,sajdah_type&words=true&word_fields=text_uthmani,translation,transliteration,audio_url,char_type_name&per_page=50`
            );
            const data = await response.json();

            if (Array.isArray(data.verses)) {
                setVerses(mapQuranComVerses(data.verses));
            } else {
                setError("Failed to fetch page");
            }
        } catch (err) {
            setError("An error occurred while fetching page");
        } finally {
            setLoading(false);
        }
    };

    const fetchHizbVerses = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `https://api.quran.com/api/v4/verses/by_hizb/${currentHizb}?translations=${selectedTranslation},${secondaryTranslation}&audio=${selectedReciter}&fields=text_uthmani,text_uthmani_tajweed,sajdah_type&words=true&word_fields=text_uthmani,translation,transliteration,audio_url,char_type_name&per_page=300`
            );
            const data = await response.json();

            if (Array.isArray(data.verses)) {
                setVerses(mapQuranComVerses(data.verses));
            } else {
                setError("Failed to fetch Hizb");
            }
        } catch (err) {
            setError("An error occurred while fetching Hizb");
        } finally {
            setLoading(false);
        }
    };

    const fetchRubVerses = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `https://api.quran.com/api/v4/verses/by_rub/${currentRub}?translations=${selectedTranslation},${secondaryTranslation}&audio=${selectedReciter}&fields=text_uthmani,text_uthmani_tajweed,sajdah_type&words=true&word_fields=text_uthmani,translation,transliteration,audio_url,char_type_name&per_page=300`
            );
            const data = await response.json();
            if (Array.isArray(data.verses)) setVerses(mapQuranComVerses(data.verses));
            else setError("Failed to fetch Rub");
        } catch (err) {
            setError("An error occurred while fetching Rub");
        } finally {
            setLoading(false);
        }
    };

    const fetchManzilVerses = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `https://api.quran.com/api/v4/verses/by_manzil/${currentManzil}?translations=${selectedTranslation},${secondaryTranslation}&audio=${selectedReciter}&fields=text_uthmani,text_uthmani_tajweed,sajdah_type&words=true&word_fields=text_uthmani,translation,transliteration,audio_url,char_type_name&per_page=700`
            );
            const data = await response.json();
            if (Array.isArray(data.verses)) setVerses(mapQuranComVerses(data.verses));
            else setError("Failed to fetch Manzil");
        } catch (err) {
            setError("An error occurred while fetching Manzil");
        } finally {
            setLoading(false);
        }
    };

    // Full-surah audio playback
    const toggleFullSurahAudio = async () => {
        if (!currentSurah) return;
        // If already playing, pause/stop
        if (fullSurahAudioRef.current && fullSurahPlaying) {
            fullSurahAudioRef.current.pause();
            setFullSurahPlaying(false);
            return;
        }
        // If we have an instance already queued, just play
        if (fullSurahAudioRef.current) {
            fullSurahAudioRef.current.play().catch(() => setFullSurahPlaying(false));
            setFullSurahPlaying(true);
            return;
        }
        // Fetch the full-surah audio URL
        setFullSurahLoading(true);
        try {
            const r = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${selectedReciter}/${currentSurah.number}`);
            const d: any = await r.json();
            const url = d.audio_file?.audio_url;
            if (!url) throw new Error("no url");
            const audio = new Audio(url);
            audio.onended = () => {
                setFullSurahPlaying(false);
                fullSurahAudioRef.current = null;
            };
            audio.onerror = () => {
                setFullSurahPlaying(false);
                fullSurahAudioRef.current = null;
                setError("Failed to play full surah audio");
            };
            fullSurahAudioRef.current = audio;
            audio.play();
            setFullSurahPlaying(true);
        } catch {
            setError("Could not load full surah audio");
        } finally {
            setFullSurahLoading(false);
        }
    };

    // Stop full-surah audio when surah or reciter changes
    useEffect(() => {
        if (fullSurahAudioRef.current) {
            fullSurahAudioRef.current.pause();
            fullSurahAudioRef.current = null;
            setFullSurahPlaying(false);
        }
    }, [currentSurah, selectedReciter]);

    // Search functionality
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setShowSearchResults(true);
        try {
            const response = await fetch(
                `https://api.quran.com/api/v4/search?q=${encodeURIComponent(searchQuery)}&size=50&language=en`
            );
            const data = await response.json();

            const results: SearchResult[] = (data.search?.results || []).slice(0, 50).map((m: any) => {
                const [surahNum, ayahNum] = String(m.verse_key || "1:1").split(":").map(Number);
                const surah = surahs.find((s) => s.number === surahNum);
                const firstTranslation = m.translations?.[0]?.text || m.text || "";
                return {
                    number: ayahNum,
                    text: cleanTranslation(firstTranslation),
                    numberInSurah: ayahNum,
                    surah: {
                        number: surahNum,
                        name: surah?.name || "",
                        englishName: surah?.englishName || `Surah ${surahNum}`,
                    },
                };
            });
            setSearchResults(results);
        } catch (err) {
            toast.error("Search failed");
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Audio playback
    const playVerse = useCallback((verseIndex: number) => {
        const verse = verses[verseIndex];
        if (verse?.audio && audioRef.current) {
            audioRef.current.src = verse.audio;
            audioRef.current.play();
            setCurrentPlayingVerse(verseIndex);
            setIsPlaying(true);
        }
    }, [verses]);

    const handleAudioEnded = useCallback(() => {
        if (isContinuousPlay && currentPlayingVerse !== null) {
            const nextIndex = currentPlayingVerse + 1;
            if (nextIndex < verses.length) {
                playVerse(nextIndex);
            } else {
                setIsPlaying(false);
                setCurrentPlayingVerse(null);
            }
        } else {
            setIsPlaying(false);
            setCurrentPlayingVerse(null);
        }
    }, [isContinuousPlay, currentPlayingVerse, verses.length, playVerse]);

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else if (currentPlayingVerse !== null) {
                audioRef.current.play();
                setIsPlaying(true);
            } else {
                playVerse(0);
            }
        }
    };

    const playNext = () => {
        if (currentPlayingVerse !== null && currentPlayingVerse < verses.length - 1) {
            playVerse(currentPlayingVerse + 1);
        }
    };

    const playPrevious = () => {
        if (currentPlayingVerse !== null && currentPlayingVerse > 0) {
            playVerse(currentPlayingVerse - 1);
        }
    };

    // Navigation handlers
    const handleSurahChange = (value: string) => {
        const selected = surahs.find(s => s.number.toString() === value);
        if (selected) {
            setCurrentSurah(selected);
            setViewMode("surah");
        }
    };

    const goToSearchResult = (result: SearchResult) => {
        const surah = surahs.find(s => s.number === result.surah.number);
        if (surah) {
            setCurrentSurah(surah);
            setViewMode("surah");
            setShowSearchResults(false);
            setSearchQuery("");
        }
    };

    const goToBookmark = (bookmark: Bookmark) => {
        const surah = surahs.find(s => s.number === bookmark.surahNumber);
        if (surah) {
            setCurrentSurah(surah);
            setViewMode("surah");
            setShowBookmarks(false);
        }
    };

    // Get current translation names
    const getTranslationName = (id: string) => {
        const trans = TRANSLATIONS.find(t => t.id === id);
        return trans ? `${trans.name} (${trans.language})` : id;
    };

    // Get current reciter name
    const getCurrentReciterName = () => {
        const reciter = RECITERS.find(r => r.id === selectedReciter);
        return reciter?.name || "Select Reciter";
    };

    // Copy verse to clipboard
    const copyVerseToClipboard = (verse: VerseData, surahName: string) => {
        const text = `${surahName} ${verse.number}\n${verse.arabic}\n\n${verse.english}`;
        navigator.clipboard.writeText(text).then(() => {
            setCopiedVerseId(verse.globalNumber);
            toast.success("Verse copied to clipboard");
            setTimeout(() => setCopiedVerseId(null), 2000);
        });
    };

    // Share verse
    const shareVerse = (verse: VerseData, surahName: string) => {
        const text = `${surahName} ${verse.number}\n${verse.english}`;
        if (navigator.share) {
            navigator.share({
                title: "Quran Verse",
                text: text,
                url: window.location.href
            }).catch(() => copyVerseToClipboard(verse, surahName));
        } else {
            copyVerseToClipboard(verse, surahName);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 pb-32">
            <SEO
                title={currentSurah ? `${currentSurah.englishName} - The Holy Quran` : "The Holy Quran - Mastering Quran"}
                description="Read and listen to the Holy Quran with Arabic text, multiple translations, and audio recitations from renowned reciters."
            />

            {/* Hero Section with Islamic Pattern */}
            <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white overflow-hidden">
                {/* Decorative Islamic geometric pattern overlay */}
                <div className="absolute inset-0">
                    <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <pattern id="islamic-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M10 0 L20 10 L10 20 L0 10 Z" fill="none" stroke="white" strokeWidth="0.5"/>
                                <circle cx="10" cy="10" r="3" fill="none" stroke="white" strokeWidth="0.3"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#islamic-pattern)"/>
                    </svg>
                </div>

                {/* Glowing orbs */}
                <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 py-12 md:py-20 px-6">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        {/* Arabic Badge */}
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
                            <Moon className="w-5 h-5 text-emerald-300" />
                            <span className="text-xl font-amiri">القرآن الكريم</span>
                            <BookOpen className="w-5 h-5 text-emerald-300" />
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold font-serif tracking-tight bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
                            The Holy Quran
                        </h1>

                        <p className="text-lg md:text-xl text-emerald-200/90 font-light max-w-2xl mx-auto leading-relaxed">
                            "This is the Book about which there is no doubt, a guidance for those conscious of Allah."
                            <span className="block mt-2 text-sm text-emerald-300/70">— Surah Al-Baqarah 2:2</span>
                        </p>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mt-10">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                                <div className="relative flex gap-2 bg-white/10 backdrop-blur-xl rounded-xl p-2 border border-white/20">
                                    <Input
                                        type="text"
                                        placeholder="Search the Quran in English..."
                                        className="flex-1 bg-transparent border-0 text-white placeholder:text-emerald-200/50 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => { setSearchQuery(""); setShowSearchResults(false); }}
                                            className="text-emerald-200 hover:text-white hover:bg-white/10"
                                        >
                                            <X className="h-5 w-5" />
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 rounded-lg shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:shadow-emerald-400/40"
                                        disabled={isSearching}
                                    >
                                        {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                                    </Button>
                                </div>
                            </div>
                        </form>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap justify-center gap-3 pt-6">
                            {[
                                { label: "114 Surahs", icon: BookOpen },
                                { label: "30 Juz", icon: Layers },
                                { label: "604 Pages", icon: BookOpen },
                                { label: `${RECITERS.length}+ Reciters`, icon: Mic },
                            ].map((stat, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 text-sm hover:bg-white/20 transition-colors cursor-default"
                                >
                                    <stat.icon className="w-4 h-4 text-emerald-300" />
                                    <span>{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom wave decoration */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        <path d="M0 50L48 45.7C96 41.3 192 32.7 288 35.8C384 39 480 54 576 57.2C672 60.3 768 51.7 864 48.5C960 45.3 1056 47.7 1152 50C1248 52.3 1344 54.7 1392 55.8L1440 57V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z"
                            className="fill-emerald-50 dark:fill-slate-950"/>
                    </svg>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">

                {/* Search Results Modal */}
                {showSearchResults && (
                    <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-emerald-500/10 border border-emerald-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="p-5 border-b border-emerald-100 dark:border-slate-800 bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-950/30 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Search className="h-5 w-5 text-emerald-600" />
                                Search Results {searchResults.length > 0 && <Badge className="bg-emerald-100 text-emerald-700">{searchResults.length}</Badge>}
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowSearchResults(false)} className="hover:bg-emerald-100 dark:hover:bg-emerald-900/30">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {searchResults.length > 0 ? (
                                searchResults.map((result, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => goToSearchResult(result)}
                                        className="w-full p-5 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <Badge className="shrink-0 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 group-hover:bg-emerald-200 transition-colors">
                                                {result.surah.englishName} {result.numberInSurah}
                                            </Badge>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                {result.text}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <Search className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500">{isSearching ? "Searching..." : "No results found"}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Bookmarks Panel */}
                {showBookmarks && (
                    <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-amber-500/10 border border-amber-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="p-5 border-b border-amber-100 dark:border-slate-800 bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/30 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <BookmarkCheck className="h-5 w-5 text-amber-600" />
                                Your Bookmarks <Badge className="bg-amber-100 text-amber-700">{bookmarks.length}</Badge>
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowBookmarks(false)} className="hover:bg-amber-100 dark:hover:bg-amber-900/30">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {bookmarks.length > 0 ? (
                                bookmarks.map((bookmark, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => goToBookmark(bookmark)}
                                        className="w-full p-5 text-left hover:bg-amber-50 dark:hover:bg-amber-900/20 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                                <Bookmark className="h-4 w-4 text-amber-500" />
                                                {bookmark.surahName} - Verse {bookmark.verseNumber}
                                            </span>
                                            <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                                {new Date(bookmark.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <Bookmark className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500">No bookmarks yet</p>
                                    <p className="text-sm text-slate-400 mt-1">Click the bookmark icon on any verse to save it</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Controls Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 p-6 mb-8">

                    {/* View Mode Tabs */}
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full mb-6">
                        <TabsList className="grid w-full grid-cols-6 max-w-2xl mx-auto bg-emerald-50 dark:bg-emerald-950/30 p-1 rounded-xl">
                            <TabsTrigger value="surah" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md rounded-lg transition-all text-[11px] md:text-xs">Surah</TabsTrigger>
                            <TabsTrigger value="juz" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md rounded-lg transition-all text-[11px] md:text-xs">Juz</TabsTrigger>
                            <TabsTrigger value="hizb" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md rounded-lg transition-all text-[11px] md:text-xs">Hizb</TabsTrigger>
                            <TabsTrigger value="rub" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md rounded-lg transition-all text-[11px] md:text-xs">Rub</TabsTrigger>
                            <TabsTrigger value="manzil" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md rounded-lg transition-all text-[11px] md:text-xs">Manzil</TabsTrigger>
                            <TabsTrigger value="page" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-md rounded-lg transition-all text-[11px] md:text-xs">Page</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Navigation Controls */}
                    <div className="flex flex-wrap items-center gap-4 justify-center mb-6">
                        {viewMode === "surah" && (
                            <Select value={currentSurah?.number.toString()} onValueChange={handleSurahChange}>
                                <SelectTrigger className="w-full md:w-[320px] h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                                    <SelectValue placeholder="Select Surah" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[400px]">
                                    {surahs.map((surah) => (
                                        <SelectItem key={surah.number} value={surah.number.toString()}>
                                            <span className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-sm font-medium">
                                                    {surah.number}
                                                </span>
                                                <span className="font-medium">{surah.englishName}</span>
                                                <span className="text-slate-400 text-sm font-amiri">{surah.name}</span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {viewMode === "juz" && (
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentJuz(Math.max(1, currentJuz - 1))}
                                    disabled={currentJuz === 1}
                                    className="h-12 w-12 rounded-xl shadow-sm"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Select value={currentJuz.toString()} onValueChange={(v) => setCurrentJuz(parseInt(v))}>
                                    <SelectTrigger className="w-[180px] h-12 bg-slate-50 dark:bg-slate-800 rounded-xl shadow-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                                            <SelectItem key={juz} value={juz.toString()}>
                                                <span className="flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                                                        {juz}
                                                    </span>
                                                    Juz {juz}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentJuz(Math.min(30, currentJuz + 1))}
                                    disabled={currentJuz === 30}
                                    className="h-12 w-12 rounded-xl shadow-sm"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        )}

                        {viewMode === "hizb" && (
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="icon" onClick={() => setCurrentHizb(Math.max(1, currentHizb - 1))} disabled={currentHizb === 1} className="h-12 w-12 rounded-xl shadow-sm">
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Select value={currentHizb.toString()} onValueChange={(v) => setCurrentHizb(parseInt(v))}>
                                    <SelectTrigger className="w-[180px] h-12 bg-slate-50 dark:bg-slate-800 rounded-xl shadow-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        {Array.from({ length: 60 }, (_, i) => i + 1).map((hizb) => (
                                            <SelectItem key={hizb} value={hizb.toString()}>Hizb {hizb}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" size="icon" onClick={() => setCurrentHizb(Math.min(60, currentHizb + 1))} disabled={currentHizb === 60} className="h-12 w-12 rounded-xl shadow-sm">
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        )}

                        {viewMode === "rub" && (
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="icon" onClick={() => setCurrentRub(Math.max(1, currentRub - 1))} disabled={currentRub === 1} className="h-12 w-12 rounded-xl shadow-sm">
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Select value={currentRub.toString()} onValueChange={(v) => setCurrentRub(parseInt(v))}>
                                    <SelectTrigger className="w-[200px] h-12 bg-slate-50 dark:bg-slate-800 rounded-xl shadow-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        {Array.from({ length: 240 }, (_, i) => i + 1).map((rub) => (
                                            <SelectItem key={rub} value={rub.toString()}>Rub al-Hizb {rub}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" size="icon" onClick={() => setCurrentRub(Math.min(240, currentRub + 1))} disabled={currentRub === 240} className="h-12 w-12 rounded-xl shadow-sm">
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        )}

                        {viewMode === "manzil" && (
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="icon" onClick={() => setCurrentManzil(Math.max(1, currentManzil - 1))} disabled={currentManzil === 1} className="h-12 w-12 rounded-xl shadow-sm">
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Select value={currentManzil.toString()} onValueChange={(v) => setCurrentManzil(parseInt(v))}>
                                    <SelectTrigger className="w-[180px] h-12 bg-slate-50 dark:bg-slate-800 rounded-xl shadow-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 7 }, (_, i) => i + 1).map((manzil) => (
                                            <SelectItem key={manzil} value={manzil.toString()}>Manzil {manzil}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" size="icon" onClick={() => setCurrentManzil(Math.min(7, currentManzil + 1))} disabled={currentManzil === 7} className="h-12 w-12 rounded-xl shadow-sm">
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        )}

                        {viewMode === "page" && (
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="h-12 w-12 rounded-xl shadow-sm"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Select value={currentPage.toString()} onValueChange={(v) => setCurrentPage(parseInt(v))}>
                                    <SelectTrigger className="w-[180px] h-12 bg-slate-50 dark:bg-slate-800 rounded-xl shadow-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        {Array.from({ length: 604 }, (_, i) => i + 1).map((page) => (
                                            <SelectItem key={page} value={page.toString()}>
                                                Page {page}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage(Math.min(604, currentPage + 1))}
                                    disabled={currentPage === 604}
                                    className="h-12 w-12 rounded-xl shadow-sm"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        )}

                        <Button
                            variant={showTajweed ? "default" : "outline"}
                            onClick={() => setShowTajweed(!showTajweed)}
                            className={`h-12 px-5 rounded-xl gap-2 transition-all ${
                                showTajweed ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30' : 'hover:bg-rose-50 dark:hover:bg-rose-900/20'
                            }`}
                        >
                            <Star className="h-5 w-5" />
                            <span className="hidden sm:inline">Tajweed</span>
                        </Button>
                        <Button
                            variant={showWordByWord ? "default" : "outline"}
                            onClick={() => setShowWordByWord(!showWordByWord)}
                            className={`h-12 px-5 rounded-xl gap-2 transition-all ${
                                showWordByWord ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                            }`}
                        >
                            <Layers className="h-5 w-5" />
                            <span className="hidden sm:inline">Word by Word</span>
                        </Button>
                        <Button
                            variant={showTafsir ? "default" : "outline"}
                            onClick={() => setShowTafsir(!showTafsir)}
                            className={`h-12 px-5 rounded-xl gap-2 transition-all ${
                                showTafsir ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30' : 'hover:bg-amber-50 dark:hover:bg-amber-900/20'
                            }`}
                        >
                            <BookOpen className="h-5 w-5" />
                            <span className="hidden sm:inline">Tafsir</span>
                        </Button>
                        <Button
                            variant={showBookmarks ? "default" : "outline"}
                            onClick={() => setShowBookmarks(!showBookmarks)}
                            className={`h-12 px-5 rounded-xl gap-2 transition-all ${
                                showBookmarks ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30' : 'hover:bg-amber-50 dark:hover:bg-amber-900/20'
                            }`}
                        >
                            <Bookmark className="h-5 w-5" />
                            <span className="hidden sm:inline">Bookmarks</span>
                            {bookmarks.length > 0 && (
                                <Badge variant="secondary" className="ml-1 h-5 px-2 text-xs">
                                    {bookmarks.length}
                                </Badge>
                            )}
                        </Button>
                    </div>

                    {/* Reciter & Translation Controls */}
                    <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                <Mic className="h-4 w-4 text-emerald-500" />
                                Reciter
                            </label>
                            <Select value={selectedReciter} onValueChange={setSelectedReciter}>
                                <SelectTrigger className="w-full h-11 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <SelectValue placeholder="Select Reciter" />
                                </SelectTrigger>
                                <SelectContent>
                                    {RECITERS.map((reciter) => (
                                        <SelectItem key={reciter.id} value={reciter.id}>
                                            <span className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                                                    <Mic className="w-4 h-4" />
                                                </span>
                                                <span>
                                                    <span className="font-medium">{reciter.name}</span>
                                                    <span className="text-xs text-slate-400 block font-amiri">{reciter.arabicName}</span>
                                                </span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                <Languages className="h-4 w-4 text-blue-500" />
                                Primary Translation
                            </label>
                            <Select value={selectedTranslation} onValueChange={setSelectedTranslation}>
                                <SelectTrigger className="w-full h-11 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <SelectValue placeholder="Translation 1" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TRANSLATIONS.map((trans) => (
                                        <SelectItem key={trans.id} value={trans.id}>
                                            <span className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">{trans.language}</Badge>
                                                {trans.name}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                <Languages className="h-4 w-4 text-indigo-500" />
                                Secondary Translation
                            </label>
                            <Select value={secondaryTranslation} onValueChange={setSecondaryTranslation}>
                                <SelectTrigger className="w-full h-11 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <SelectValue placeholder="Translation 2" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TRANSLATIONS.map((trans) => (
                                        <SelectItem key={trans.id} value={trans.id}>
                                            <span className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">{trans.language}</Badge>
                                                {trans.name}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Tafsir Edition dropdown — only visible when Tafsir is on */}
                    {showTafsir && (
                        <div className="pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="space-y-2 max-w-md">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    <BookOpen className="h-4 w-4 text-amber-500" />
                                    Tafsir Edition
                                </label>
                                <Select value={selectedTafsir} onValueChange={setSelectedTafsir}>
                                    <SelectTrigger className="w-full h-11 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 rounded-xl">
                                        <SelectValue placeholder="Select Tafsir" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TAFSIRS.map((t) => (
                                            <SelectItem key={t.slug} value={t.slug}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Surah Info Card */}
                {viewMode === "surah" && currentSurah && (
                    <div className="text-center mb-10 animate-in fade-in duration-500">
                        <div className="inline-block bg-white dark:bg-slate-900 rounded-2xl px-10 py-8 shadow-xl shadow-emerald-500/5 border border-emerald-100 dark:border-slate-800">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 font-serif mb-2">
                                {currentSurah.englishName}
                            </h2>
                            <p className="text-4xl md:text-5xl font-amiri text-emerald-700 dark:text-emerald-400 mb-4">
                                {currentSurah.name}
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                                <Badge variant="outline" className="px-4 py-1.5 text-slate-600 border-slate-300">
                                    {currentSurah.englishNameTranslation}
                                </Badge>
                                <Badge className={`px-4 py-1.5 ${currentSurah.revelationType === 'Meccan' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {currentSurah.revelationType}
                                </Badge>
                                <Badge variant="outline" className="px-4 py-1.5 text-emerald-600 border-emerald-300">
                                    {currentSurah.numberOfAyahs} Verses
                                </Badge>
                            </div>
                            <Button
                                onClick={toggleFullSurahAudio}
                                disabled={fullSurahLoading}
                                className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-xl shadow-md"
                            >
                                {fullSurahLoading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…</>
                                ) : fullSurahPlaying ? (
                                    <><Pause className="mr-2 h-4 w-4" /> Pause full surah</>
                                ) : (
                                    <><Play className="mr-2 h-4 w-4" /> Play whole surah</>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Juz/Page Info */}
                {viewMode === "juz" && (
                    <div className="text-center mb-10">
                        <div className="inline-block bg-white dark:bg-slate-900 rounded-2xl px-10 py-6 shadow-xl shadow-emerald-500/5 border border-emerald-100 dark:border-slate-800">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                                Juz {currentJuz}
                            </h2>
                            <p className="text-slate-500 mt-1">{verses.length} verses</p>
                        </div>
                    </div>
                )}

                {viewMode === "hizb" && (
                    <div className="text-center mb-10">
                        <div className="inline-block bg-white dark:bg-slate-900 rounded-2xl px-10 py-6 shadow-xl shadow-emerald-500/5 border border-emerald-100 dark:border-slate-800">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                                Hizb {currentHizb}
                            </h2>
                            <p className="text-slate-500 mt-1">{verses.length} verses</p>
                        </div>
                    </div>
                )}

                {viewMode === "rub" && (
                    <div className="text-center mb-10">
                        <div className="inline-block bg-white dark:bg-slate-900 rounded-2xl px-10 py-6 shadow-xl shadow-emerald-500/5 border border-emerald-100 dark:border-slate-800">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                                Rub al-Hizb {currentRub}
                            </h2>
                            <p className="text-slate-500 mt-1">{verses.length} verses · quarter of Hizb {Math.ceil(currentRub / 4)}</p>
                        </div>
                    </div>
                )}

                {viewMode === "manzil" && (
                    <div className="text-center mb-10">
                        <div className="inline-block bg-white dark:bg-slate-900 rounded-2xl px-10 py-6 shadow-xl shadow-emerald-500/5 border border-emerald-100 dark:border-slate-800">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                                Manzil {currentManzil}
                            </h2>
                            <p className="text-slate-500 mt-1">{verses.length} verses · weekly reading day {currentManzil} of 7</p>
                        </div>
                    </div>
                )}

                {viewMode === "page" && (
                    <div className="text-center mb-10">
                        <div className="inline-block bg-white dark:bg-slate-900 rounded-2xl px-10 py-6 shadow-xl shadow-emerald-500/5 border border-emerald-100 dark:border-slate-800">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                                Page {currentPage}
                            </h2>
                            <p className="text-slate-500 mt-1">{verses.length} verses</p>
                        </div>
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl animate-pulse"></div>
                            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 relative" />
                        </div>
                        <p className="text-slate-500 font-medium">Loading verses...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-24">
                        <div className="inline-block bg-red-50 dark:bg-red-950/30 rounded-2xl p-10">
                            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
                            <p className="text-red-600 dark:text-red-400 font-medium mb-4">{error}</p>
                            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => window.location.reload()}>
                                Try Again
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Chapter info (surah mode only) */}
                        {viewMode === "surah" && currentSurah && (
                            <ChapterInfoPanel surahNumber={currentSurah.number} surahName={currentSurah.englishName} />
                        )}

                        {/* Tajweed legend */}
                        {showTajweed && (
                            <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30">
                                <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-2">
                                    Tajweed rules
                                </p>
                                <TajweedLegend />
                            </div>
                        )}

                        {/* Bismillah */}
                        {viewMode === "surah" && currentSurah?.number !== 1 && currentSurah?.number !== 9 && (
                            <div className="text-center py-10 mb-4">
                                <div className="inline-block bg-white dark:bg-slate-900 rounded-2xl px-12 py-8 shadow-lg border border-emerald-100 dark:border-slate-800">
                                    <p className="font-amiri text-3xl md:text-5xl text-emerald-800 dark:text-emerald-300 leading-relaxed">
                                        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                                    </p>
                                    <p className="text-slate-500 text-sm mt-4">In the name of Allah, the Most Gracious, the Most Merciful</p>
                                </div>
                            </div>
                        )}

                        {verses.map((verse, index) => (
                            <Card
                                key={`${verse.globalNumber}-${index}`}
                                className={`overflow-hidden transition-all duration-500 group ${
                                    currentPlayingVerse === index
                                        ? 'ring-2 ring-emerald-500 shadow-2xl shadow-emerald-500/20 scale-[1.01]'
                                        : 'hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none border-slate-200/80 dark:border-slate-800'
                                } ${verse.isSajda ? 'border-l-4 border-l-amber-400 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20' : 'bg-white dark:bg-slate-900'}`}
                            >
                                <CardContent className="p-6 md:p-8 space-y-6">
                                    {/* Header */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/50 dark:to-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-lg font-semibold shadow-sm">
                                                {verse.number}
                                            </span>
                                            {verse.isSajda && (
                                                <Badge className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-0 px-3 py-1.5 gap-1.5 shadow-sm">
                                                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                                                    Sajda Verse
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={`h-10 w-10 rounded-xl transition-all ${isBookmarked(currentSurah?.number || 0, verse.number)
                                                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30'
                                                    : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30'}`}
                                                onClick={() => saveBookmark(currentSurah?.number || 0, verse.number, currentSurah?.englishName || '')}
                                            >
                                                {isBookmarked(currentSurah?.number || 0, verse.number) ? (
                                                    <BookmarkCheck className="h-5 w-5" />
                                                ) : (
                                                    <Bookmark className="h-5 w-5" />
                                                )}
                                            </Button>
                                            {verse.audio && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`h-10 w-10 rounded-xl transition-all ${currentPlayingVerse === index && isPlaying
                                                        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30'
                                                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`}
                                                    onClick={() => playVerse(index)}
                                                >
                                                    {currentPlayingVerse === index && isPlaying ? (
                                                        <Pause className="h-5 w-5" />
                                                    ) : (
                                                        <Play className="h-5 w-5" />
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Arabic Text */}
                                    <div className="text-right py-6 px-4 bg-gradient-to-r from-transparent via-emerald-50/50 to-emerald-50 dark:via-emerald-950/20 dark:to-emerald-950/30 rounded-xl">
                                        {showWordByWord && verse.words && verse.words.length ? (
                                            <WordByWordVerse words={verse.words} />
                                        ) : showTajweed && verse.arabicTajweed ? (
                                            <TajweedText
                                                html={verse.arabicTajweed}
                                                className="font-amiri text-3xl md:text-4xl lg:text-[2.75rem] leading-[2.8] text-slate-900 dark:text-slate-100 selection:bg-emerald-200 dark:selection:bg-emerald-800"
                                            />
                                        ) : (
                                            <p
                                                className="font-amiri text-3xl md:text-4xl lg:text-[2.75rem] leading-[2.8] text-slate-900 dark:text-slate-100 selection:bg-emerald-200 dark:selection:bg-emerald-800"
                                                dir="rtl"
                                            >
                                                {verse.arabic}
                                            </p>
                                        )}
                                    </div>

                                    {/* Translations */}
                                    <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                                    {getTranslationName(selectedTranslation)}
                                                </p>
                                            </div>
                                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[15px]">
                                                {verse.english}
                                            </p>
                                        </div>
                                        <div className="space-y-3 text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                                    {getTranslationName(secondaryTranslation)}
                                                </p>
                                                <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                                            </div>
                                            <p className="text-slate-700 dark:text-slate-300 leading-loose font-noto-nastaliq text-lg" dir="rtl">
                                                {verse.urdu}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tafsir Panel — lazy loads from nwv-islamic-data */}
                                    {showTafsir && (
                                        <TafsirPanel
                                            surah={verse.surahNumber}
                                            ayah={verse.number}
                                            slug={selectedTafsir}
                                            editionName={TAFSIRS.find((t) => t.slug === selectedTafsir)?.name || ""}
                                        />
                                    )}

                                    {/* Copy & Share Buttons */}
                                    <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyVerseToClipboard(verse, currentSurah?.englishName || 'Verse')}
                                            className="text-xs rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 gap-2"
                                        >
                                            {copiedVerseId === verse.globalNumber ? (
                                                <>
                                                    <Check className="h-4 w-4" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4" />
                                                    Copy
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => shareVerse(verse, currentSurah?.englishName || 'Verse')}
                                            className="text-xs rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 gap-2"
                                        >
                                            <Share2 className="h-4 w-4" />
                                            Share
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleSimilar(`${verse.surahNumber}:${verse.number}`)}
                                            className="text-xs rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 gap-2"
                                        >
                                            <Sparkles className="h-4 w-4" />
                                            {expandedSimilar.has(`${verse.surahNumber}:${verse.number}`) ? "Hide similar" : "Similar verses"}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setCompareKey(`${verse.surahNumber}:${verse.number}`)}
                                            className="text-xs rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 gap-2"
                                        >
                                            <Languages className="h-4 w-4" />
                                            Compare all 17
                                        </Button>
                                    </div>

                                    {/* Similar verses panel (lazy-loaded per verse) */}
                                    {expandedSimilar.has(`${verse.surahNumber}:${verse.number}`) && (
                                        <SimilarVersesPanel verseKey={`${verse.surahNumber}:${verse.number}`} />
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Compare translations modal */}
            {compareKey && <CompareTranslationsModal verseKey={compareKey} onClose={() => setCompareKey(null)} />}

            {/* Floating Audio Player */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
                <div className="bg-gradient-to-t from-white via-white to-white/95 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/10">
                    <div className="max-w-4xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between gap-4">
                            {/* Now Playing Info */}
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
                                    <Volume2 className="h-6 w-6 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                                        {currentPlayingVerse !== null
                                            ? `Verse ${currentPlayingVerse + 1} of ${verses.length}`
                                            : "Select a verse to play"
                                        }
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                        {getCurrentReciterName()}
                                    </p>
                                </div>
                            </div>

                            {/* Playback Controls */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={playPrevious}
                                    disabled={currentPlayingVerse === null || currentPlayingVerse === 0}
                                    className="h-10 w-10 rounded-xl"
                                >
                                    <SkipBack className="h-5 w-5" />
                                </Button>

                                <Button
                                    size="icon"
                                    onClick={togglePlayPause}
                                    className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/40 hover:shadow-emerald-600/50 transition-all hover:scale-105"
                                >
                                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={playNext}
                                    disabled={currentPlayingVerse === null || currentPlayingVerse >= verses.length - 1}
                                    className="h-10 w-10 rounded-xl"
                                >
                                    <SkipForward className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Auto-play Toggle */}
                            <div className="flex items-center gap-3">
                                <Button
                                    variant={isContinuousPlay ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setIsContinuousPlay(!isContinuousPlay)}
                                    className={`h-10 px-4 rounded-xl gap-2 transition-all ${
                                        isContinuousPlay
                                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
                                            : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                                    }`}
                                >
                                    {isContinuousPlay ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                                    <span className="hidden sm:inline">Auto-play</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Audio Player */}
            <audio
                ref={audioRef}
                onEnded={handleAudioEnded}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                className="hidden"
            />
        </div>
    );
}
