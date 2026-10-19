// Prayer reminders as a calendar file: the phone's own calendar raises an alert at
// each prayer time, so reminders work with the site closed and need no server.
import { PRAYER_LABELS, addDays, timesFor, ymdInZone, type Place, type PrayerKey, type PrayerSettings } from "@/lib/prayer";

const REMINDER_PRAYERS: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escapeText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

// RFC 5545 lines are limited to 75 octets; longer ones continue on a line starting with a space.
function fold(line: string) {
    const out: string[] = [];
    let rest = line;
    while (new TextEncoder().encode(rest).length > 75) {
        let cut = 74;
        while (new TextEncoder().encode(rest.slice(0, cut)).length > 74) cut--;
        out.push(rest.slice(0, cut));
        rest = " " + rest.slice(cut);
    }
    out.push(rest);
    return out.join("\r\n");
}

export function prayerCalendar(place: Place, settings: PrayerSettings, days = 30, from = new Date()) {
    const start = ymdInZone(from, place.timeZone);
    const now = stamp(new Date());
    const where = place.slug ? `https://masteringquran.com/prayer-times/${place.slug}` : "https://masteringquran.com/prayer-times";
    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Mastering Quran//Prayer Times//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        `X-WR-CALNAME:${escapeText(`Prayer times · ${place.name}`)}`,
    ];
    for (let i = 0; i < days; i++) {
        const ymd = addDays(start, i);
        const t = timesFor(place, settings, ymd);
        for (const k of REMINDER_PRAYERS) {
            if (t[k] < from) continue;
            lines.push(
                "BEGIN:VEVENT",
                `UID:${ymd.join("")}-${k}-${place.latitude.toFixed(2)}_${place.longitude.toFixed(2)}@masteringquran.com`,
                `DTSTAMP:${now}`,
                `DTSTART:${stamp(t[k])}`,
                "DURATION:PT15M",
                `SUMMARY:${escapeText(PRAYER_LABELS[k])}`,
                `DESCRIPTION:${escapeText(`${PRAYER_LABELS[k]} in ${place.name}. ${where}`)}`,
                "TRANSP:TRANSPARENT",
                "BEGIN:VALARM",
                "ACTION:DISPLAY",
                `DESCRIPTION:${escapeText(`Time for ${PRAYER_LABELS[k]}`)}`,
                "TRIGGER:PT0M",
                "END:VALARM",
                "END:VEVENT",
            );
        }
    }
    lines.push("END:VCALENDAR");
    return lines.map(fold).join("\r\n") + "\r\n";
}

export function downloadPrayerCalendar(place: Place, settings: PrayerSettings) {
    const blob = new Blob([prayerCalendar(place, settings)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prayer-times-${(place.slug || place.name).toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
