// Links from the home-screen widgets: masteringquran://open/quran/2/255 and masteringquran://open/continue.
import { getSurah } from "@/lib/surah-list";

/** The in-app path for a widget link, or null when the link is anything else. */
export function appShortcutPath(url: string): string | null {
    if (/^masteringquran:\/\/open\/continue\/?$/.test(url)) {
        let last = 1;
        try {
            last = Number(localStorage.getItem("lastViewedSurah"));
        } catch { /* Storage is blocked: start at the beginning. */ }
        return `/quran/${getSurah(last) ? last : 1}`;
    }
    const verse = /^masteringquran:\/\/open\/quran\/(\d{1,3})\/(\d{1,3})\/?$/.exec(url);
    if (!verse) return null;
    const [surah, ayah] = [Number(verse[1]), Number(verse[2])];
    const info = getSurah(surah);
    return info && ayah >= 1 && ayah <= info.ayahs ? `/quran/${surah}/${ayah}` : null;
}
