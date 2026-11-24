// Study data this site keeps in the browser. Display choices (theme, font size) are not included.
const STUDY_KEYS = ["quranBookmarks", "lastViewedSurah"];

/** Clears saved study data from this device after an account is deleted. */
export function clearLocalStudyData(): void {
    for (const store of [() => localStorage, () => sessionStorage]) {
        try {
            const s = store();
            for (const key of Object.keys(s)) if (/^mq[-_]/.test(key) || STUDY_KEYS.includes(key)) s.removeItem(key);
        } catch { /* Storage is blocked, so nothing was saved. */ }
    }
}
