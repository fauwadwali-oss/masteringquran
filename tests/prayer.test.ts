import { describe, expect, it } from "vitest";
import { defaultSettings, formatTime, ramadanDates, searchCities, timesFor, toHijri, type Place } from "@/lib/prayer";
import { hijriDate, hijriToGregorian, upcomingEvents } from "@/lib/hijri";
import { prayerCalendar } from "@/lib/prayer-ics";

const houston: Place = { name: "Houston", region: "Texas", countryCode: "US", latitude: 29.7633, longitude: -95.3633, timeZone: "America/Chicago", slug: "houston-us" };

describe("prayer times", () => {
    it("matches ISNA times for Houston on 19 Oct 2026", () => {
        const t = timesFor(houston, defaultSettings("US"), [2026, 10, 19]);
        const f = (d: Date) => formatTime(d, houston.timeZone, true);
        expect([f(t.fajr), f(t.dhuhr), f(t.asr), f(t.maghrib), f(t.isha)]).toEqual(["6:20 AM", "1:07 PM", "4:20 PM", "6:46 PM", "7:52 PM"]);
    });

    it("picks country defaults", () => {
        expect(defaultSettings("PK")).toMatchObject({ method: "Karachi", madhab: "Hanafi" });
        expect(defaultSettings("SA")).toMatchObject({ method: "UmmAlQura", madhab: "Shafi" });
        expect(defaultSettings("ZZ").method).toBe("MuslimWorldLeague");
    });

    it("Hanafi Asr is later than standard Asr", () => {
        const std = timesFor(houston, { ...defaultSettings("US"), madhab: "Shafi" }, [2026, 10, 19]).asr;
        const han = timesFor(houston, { ...defaultSettings("US"), madhab: "Hanafi" }, [2026, 10, 19]).asr;
        expect(han.getTime()).toBeGreaterThan(std.getTime());
    });
});

describe("hijri", () => {
    it("converts both ways", () => {
        expect(toHijri([2026, 10, 19])).toEqual({ day: 8, month: 5, year: 1448 });
        expect(hijriToGregorian(1448, 9, 1)).toEqual([2027, 2, 8]);
        expect(hijriToGregorian(1448, 5, 8)).toEqual([2026, 10, 19]);
        expect(hijriDate(new Date("2026-10-19T12:00:00Z"), "UTC")).toBe("8 Jumada al-Ula 1448 AH");
    });

    it("finds Ramadan 2027", () => {
        const days = ramadanDates(2027);
        expect(days[0].ymd).toEqual([2027, 2, 8]);
        expect(days.length).toBeGreaterThanOrEqual(29);
        expect(days.length).toBeLessThanOrEqual(30);
    });

    it("lists upcoming events in order", () => {
        const events = upcomingEvents([2026, 10, 19]);
        expect(events[0].name).toBe("Isra and Mi'raj");
        expect(events.map((e) => e.daysUntil)).toEqual([...events.map((e) => e.daysUntil)].sort((a, b) => a - b));
    });
});

describe("city search", () => {
    const cities: Place[] = [
        { name: "Makkah", region: "Mecca Region", countryCode: "SA", latitude: 21.42, longitude: 39.83, timeZone: "Asia/Riyadh", slug: "makkah-sa" },
        { name: "Houston", region: "Texas", countryCode: "US", latitude: 29.76, longitude: -95.36, timeZone: "America/Chicago", slug: "houston-us" },
    ];
    it("handles aliases and prefixes", () => {
        expect(searchCities(cities, "mecca")[0].slug).toBe("makkah-sa");
        expect(searchCities(cities, "hou")[0].slug).toBe("houston-us");
        expect(searchCities(cities, "h")).toEqual([]);
    });
});

describe("calendar reminders", () => {
    it("writes five alarmed events per day", () => {
        const ics = prayerCalendar(houston, defaultSettings("US"), 2, new Date("2026-10-19T05:00:00Z"));
        expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(10);
        expect(ics).toContain("DTSTART:20261019T180700Z");
        expect(ics.split("\r\n").every((l) => l.length <= 75)).toBe(true);
    });
});
