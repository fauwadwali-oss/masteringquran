// Lock screen artwork: the surah's name in Arabic on the brand green.

export interface ArtworkSurah {
    number: number;
    arabicName: string;
    englishName: string;
}

const SIZE = 512;
const done = new Map<number, string>();

async function draw(surah: ArtworkSurah): Promise<string | null> {
    const cached = done.get(surah.number);
    if (cached) return cached;
    try {
        await document.fonts?.load("700 96px Amiri", surah.arabicName).catch(() => undefined);
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = SIZE;
        const g = canvas.getContext("2d");
        if (!g) return null;
        const bg = g.createLinearGradient(0, 0, SIZE, SIZE);
        bg.addColorStop(0, "#065f46");
        bg.addColorStop(1, "#022c22");
        g.fillStyle = bg;
        g.fillRect(0, 0, SIZE, SIZE);
        g.strokeStyle = "rgba(251, 191, 36, 0.55)";
        g.lineWidth = 3;
        g.strokeRect(26, 26, SIZE - 52, SIZE - 52);
        g.textAlign = "center";
        g.textBaseline = "middle";
        const fit = (text: string, font: (px: number) => string, start: number, width: number) => {
            let px = start;
            do g.font = font(px);
            while (g.measureText(text).width > width && (px -= 4) > 20);
        };
        g.fillStyle = "#fbbf24";
        g.font = "600 34px system-ui, sans-serif";
        g.fillText(String(surah.number), SIZE / 2, 96);
        g.direction = "rtl";
        g.fillStyle = "#ffffff";
        fit(surah.arabicName, (px) => `700 ${px}px Amiri, serif`, 132, SIZE - 110);
        g.fillText(surah.arabicName, SIZE / 2, SIZE / 2 - 6);
        g.direction = "ltr";
        g.fillStyle = "#d1fae5";
        fit(surah.englishName, (px) => `600 ${px}px system-ui, sans-serif`, 44, SIZE - 110);
        g.fillText(surah.englishName, SIZE / 2, SIZE - 112);
        const url = canvas.toDataURL("image/png");
        done.set(surah.number, url);
        return url;
    } catch {
        return null;
    }
}

export const surahArtwork = { cached: (s: ArtworkSurah) => done.get(s.number) ?? null, draw };
