// A shared UTC calendar day makes daily selections stable across reloads and devices.
export function dailyIndex(date: Date, count: number): number {
    if (!Number.isInteger(count) || count < 1) throw new Error("Daily selection needs a non-empty list");
    const day = Math.floor(date.getTime() / 86_400_000);
    return ((day % count) + count) % count;
}

export function dailyVerseKey(date: Date, chapters: Array<{ id: number; verses_count: number }>): string {
    let index = dailyIndex(date, chapters.reduce((total, chapter) => total + chapter.verses_count, 0));
    for (const chapter of chapters) {
        if (index < chapter.verses_count) return `${chapter.id}:${index + 1}`;
        index -= chapter.verses_count;
    }
    throw new Error("Verse selection failed");
}
