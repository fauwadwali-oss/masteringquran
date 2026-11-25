import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface Props {
    verseKey: string;
    onClose: () => void;
}

// All 17 translations supported by the Quran reader (matches Quran.tsx TRANSLATIONS)
const ALL_TRANSLATIONS: Array<{ id: number; name: string; language: string }> = [
    { id: 20, name: "Saheeh International", language: "English" },
    { id: 22, name: "Yusuf Ali", language: "English" },
    { id: 19, name: "Pickthall", language: "English" },
    { id: 85, name: "Abdel Haleem", language: "English" },
    { id: 95, name: "Maududi (Tafhim)", language: "English" },
    { id: 203, name: "Hilali & Khan", language: "English" },
    { id: 84, name: "Taqi Usmani", language: "English" },
    { id: 57, name: "Transliteration (Latin)", language: "English" },
    { id: 234, name: "Jalandhari", language: "Urdu" },
    { id: 54, name: "Junagarhi", language: "Urdu" },
    { id: 97, name: "Maududi (Tafheem)", language: "Urdu" },
    { id: 819, name: "Wahiduddin Khan", language: "Urdu" },
    { id: 31, name: "Hamidullah", language: "French" },
    { id: 208, name: "Abu Reda", language: "German" },
    { id: 77, name: "Diyanet", language: "Turkish" },
    { id: 33, name: "Indonesian Islamic Affairs", language: "Indonesian" },
    { id: 161, name: "Taisirul Quran", language: "Bengali" },
];

const cleanHtml = (s: string): string => (s || "").replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]+>/g, "").trim();

const LANGUAGE_DIR: Record<string, "ltr" | "rtl"> = {
    Urdu: "rtl",
    Arabic: "rtl",
};

export default function CompareTranslationsModal({ verseKey, onClose }: Props) {
    const [arabic, setArabic] = useState("");
    const [translations, setTranslations] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const ids = ALL_TRANSLATIONS.map((t) => t.id).join(",");
        fetch(`https://api.quran.com/api/v4/verses/by_key/${verseKey}?translations=${ids}&language=en&fields=text_uthmani`)
            .then(async (r) => {
                if (!r.ok) throw new Error("fail");
                const d: any = await r.json();
                setArabic(d.verse?.text_uthmani || "");
                const map: Record<number, string> = {};
                for (const t of d.verse?.translations || []) {
                    map[t.resource_id] = cleanHtml(t.text || "");
                }
                setTranslations(map);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [verseKey]);

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="z-[100] flex max-h-[85dvh] flex-col sm:max-w-3xl gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                    <DialogDescription className="text-xs uppercase tracking-wider text-slate-500">Compare translations</DialogDescription>
                    <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">Quran {verseKey}</DialogTitle>
                </div>
                <div className="overflow-y-auto p-6 space-y-5">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                        </div>
                    ) : (
                        <>
                            {!arabic && Object.keys(translations).length === 0 && <p role="alert" className="text-sm text-slate-600 dark:text-slate-300">We could not load the translations. Check your internet connection.</p>}
                            {arabic && (
                                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <p className="font-amiri text-2xl md:text-3xl leading-loose text-slate-900 dark:text-slate-100 text-right" dir="rtl">
                                        {arabic}
                                    </p>
                                </div>
                            )}
                            {ALL_TRANSLATIONS.map((t) => {
                                const text = translations[t.id];
                                if (!text) return null;
                                const dir = LANGUAGE_DIR[t.language] || "ltr";
                                return (
                                    <div key={t.id} className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{t.language}</span>
                                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{t.name}</span>
                                        </div>
                                        <p className={`text-sm leading-relaxed ${dir === "rtl" ? "text-right font-noto-nastaliq text-base" : "text-left"} text-slate-700 dark:text-slate-300`} dir={dir}>
                                            {text}
                                        </p>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
