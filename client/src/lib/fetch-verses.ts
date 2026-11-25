// Quran.com returns long sections in pages (Juz 30 alone is 564 verses), so read every page.
// A section is shown complete or not at all.
const PER_PAGE = 300;

interface VersePage {
    verses?: any[];
    pagination?: { total_pages?: number; total_records?: number };
}

async function page(url: string, number: number): Promise<VersePage> {
    const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}per_page=${PER_PAGE}&page=${number}`);
    if (!res.ok) throw new Error(`Quran.com returned ${res.status}`);
    return (await res.json()) as VersePage;
}

export async function fetchAllVerses(url: string): Promise<any[]> {
    const first = await page(url, 1);
    const total = first.pagination?.total_pages ?? 1;
    const rest = await Promise.all(Array.from({ length: Math.max(0, total - 1) }, (_, i) => page(url, i + 2)));
    const verses = [first, ...rest].flatMap((p) => p.verses ?? []);
    const expected = first.pagination?.total_records;
    if (expected !== undefined && verses.length !== expected) throw new Error("Some verses are missing");
    return verses;
}
