import { useEffect, useId, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import { Loader2, LocateFixed, MapPin, Search } from "lucide-react";
import { countryName, loadCities, nearestCity, searchCities, type Place } from "@/lib/prayer";

const POSITION_OPTIONS = { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 };

// In the apps, ask through the native plugin: one system prompt. The web view's own
// geolocation adds a second "localhost would like to use your location" prompt on iOS.
async function currentCoords(): Promise<{ latitude: number; longitude: number }> {
    if (Capacitor.isNativePlatform()) {
        const pos = await Geolocation.getCurrentPosition(POSITION_OPTIONS);
        return pos.coords;
    }
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((pos) => resolve(pos.coords), reject, POSITION_OPTIONS);
    });
}

async function wasDeclined(err: unknown): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
        return (await Geolocation.checkPermissions().catch(() => null))?.location === "denied";
    }
    return (err as GeolocationPositionError | undefined)?.code === 1;
}

interface LocationPickerProps {
    onSelect: (place: Place) => void;
    /** Tailwind color family for the focus ring and accents. */
    accent?: "emerald" | "purple" | "amber";
    autoFocus?: boolean;
}

// City search with a "use my current location" fallback. Nothing leaves the device:
// the city list is a static file and GPS coordinates are only used in this tab.
export default function LocationPicker({ onSelect, accent = "emerald", autoFocus }: LocationPickerProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Place[]>([]);
    const [active, setActive] = useState(0);
    const [open, setOpen] = useState(false);
    const [locating, setLocating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const listId = useId();
    const boxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            return;
        }
        let cancelled = false;
        loadCities()
            .then((cities) => {
                if (cancelled) return;
                setResults(searchCities(cities, query));
                setActive(0);
                setOpen(true);
            })
            .catch(() => !cancelled && setError("Could not load the city list. Try using your location instead."));
        return () => {
            cancelled = true;
        };
    }, [query]);

    useEffect(() => {
        const close = (e: MouseEvent) => {
            if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const choose = (p: Place) => {
        setOpen(false);
        setQuery("");
        setError(null);
        onSelect(p);
    };

    const useMyLocation = async () => {
        setError(null);
        if (!Capacitor.isNativePlatform() && !navigator.geolocation) {
            setError("Your browser does not support location. Search for your city instead.");
            return;
        }
        setLocating(true);
        try {
            const coords = await currentCoords();
            const latitude = Number(coords.latitude.toFixed(4));
            const longitude = Number(coords.longitude.toFixed(4));
            const near = await loadCities().then((c) => nearestCity(c, latitude, longitude)).catch(() => null);
            setLocating(false);
            choose({
                name: near?.name ?? "Your location",
                region: near?.region,
                countryCode: near?.countryCode,
                latitude,
                longitude,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });
        } catch (err) {
            setLocating(false);
            setError((await wasDeclined(err)) ? "Location access was declined. Search for your city instead." : "Could not find your location. Search for your city instead.");
        }
    };

    const ring = {
        emerald: "focus-within:border-emerald-400 focus-within:ring-emerald-500/20",
        purple: "focus-within:border-purple-400 focus-within:ring-purple-500/20",
        amber: "focus-within:border-amber-400 focus-within:ring-amber-500/20",
    }[accent];
    const link = {
        emerald: "text-emerald-700 dark:text-emerald-400",
        purple: "text-purple-700 dark:text-purple-400",
        amber: "text-amber-700 dark:text-amber-400",
    }[accent];

    return (
        <div ref={boxRef} className="relative w-full">
            <div className={`flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm ring-4 ring-transparent transition dark:border-slate-700 dark:bg-slate-900 ${ring}`}>
                <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <input
                    type="search"
                    role="combobox"
                    aria-expanded={open && results.length > 0}
                    aria-controls={listId}
                    aria-label="Search for a city"
                    autoFocus={autoFocus}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        loadCities().catch(() => undefined);
                        if (results.length) setOpen(true);
                    }}
                    onKeyDown={(e) => {
                        if (!results.length) return;
                        if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setActive((a) => (a + 1) % results.length);
                        } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setActive((a) => (a - 1 + results.length) % results.length);
                        } else if (e.key === "Enter") {
                            e.preventDefault();
                            choose(results[active]);
                        } else if (e.key === "Escape") setOpen(false);
                    }}
                    placeholder="Search for a city, e.g. Houston or Lahore"
                    className="h-12 w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                />
            </div>

            {open && results.length > 0 && (
                <ul id={listId} role="listbox" className="absolute z-30 mt-2 max-h-80 w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                    {results.map((p, i) => (
                        <li
                            key={p.slug}
                            role="option"
                            aria-selected={i === active}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                choose(p);
                            }}
                            onMouseEnter={() => setActive(i)}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ${i === active ? "bg-slate-100 dark:bg-slate-800" : ""}`}
                        >
                            <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                            <span className="min-w-0">
                                <span className="block truncate font-medium text-slate-900 dark:text-white">{p.name}</span>
                                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{[p.region, countryName(p.countryCode)].filter(Boolean).join(", ")}</span>
                            </span>
                        </li>
                    ))}
                </ul>
            )}
            {open && query.trim().length >= 2 && results.length === 0 && (
                <p className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                    No city found. Try a larger nearby city, or use your location.
                </p>
            )}

            <button type="button" onClick={useMyLocation} disabled={locating} className={`mt-3 inline-flex items-center gap-2 text-sm font-medium hover:underline disabled:opacity-60 ${link}`}>
                {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                {locating ? "Finding your location…" : "Use my current location"}
            </button>
            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
}
