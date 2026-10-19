import { useEffect, useState } from "react";
import { Compass, MapPin, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import LocationPicker from "@/components/LocationPicker";
import { loadPlace, placeLabel, qiblaBearing, savePlace, type Place } from "@/lib/prayer";

const KAABA = { latitude: 21.4225, longitude: 39.8262 };
const compassPoint = (deg: number) =>
    ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"][Math.round(deg / 22.5) % 16];

function distanceKm(lat: number, lon: number) {
    const r = (d: number) => (d * Math.PI) / 180;
    const a =
        Math.sin(r(KAABA.latitude - lat) / 2) ** 2 +
        Math.cos(r(lat)) * Math.cos(r(KAABA.latitude)) * Math.sin(r(KAABA.longitude - lon) / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(a));
}

type OrientationEventWithCompass = DeviceOrientationEvent & { webkitCompassHeading?: number };
type OrientationPermission = { requestPermission?: () => Promise<"granted" | "denied"> };

export default function Qibla() {
    const [place, setPlace] = useState<Place | null>(() => loadPlace());
    const [editing, setEditing] = useState(false);
    const [heading, setHeading] = useState<number | null>(null);
    const [compassOn, setCompassOn] = useState(false);
    const [compassError, setCompassError] = useState<string | null>(null);
    const compassSupported = typeof window !== "undefined" && "DeviceOrientationEvent" in window && "ontouchstart" in window;

    const bearing = place ? qiblaBearing(place.latitude, place.longitude) : null;
    const km = place ? Math.round(distanceKm(place.latitude, place.longitude)) : null;

    // With the phone compass on, the arrow turns so it keeps pointing at the Qibla as you turn.
    const arrow = bearing === null ? 0 : heading === null ? bearing : bearing - heading;

    useEffect(() => {
        if (!compassOn) return;
        const onOrient = (e: Event) => {
            const ev = e as OrientationEventWithCompass;
            if (typeof ev.webkitCompassHeading === "number") setHeading(ev.webkitCompassHeading);
            else if (ev.absolute && typeof ev.alpha === "number") setHeading(360 - ev.alpha);
        };
        window.addEventListener("deviceorientationabsolute", onOrient);
        window.addEventListener("deviceorientation", onOrient);
        const timeout = setTimeout(() => {
            setHeading((h) => {
                if (h === null) {
                    setCompassError("This device did not report a compass heading.");
                    setCompassOn(false);
                }
                return h;
            });
        }, 3000);
        return () => {
            clearTimeout(timeout);
            window.removeEventListener("deviceorientationabsolute", onOrient);
            window.removeEventListener("deviceorientation", onOrient);
        };
    }, [compassOn]);

    const startCompass = async () => {
        setCompassError(null);
        const Ctor = window.DeviceOrientationEvent as unknown as OrientationPermission;
        try {
            if (typeof Ctor.requestPermission === "function" && (await Ctor.requestPermission()) !== "granted") {
                setCompassError("Compass access was declined.");
                return;
            }
        } catch {
            setCompassError("Compass access was declined.");
            return;
        }
        setCompassOn(true);
    };

    const choose = (p: Place) => {
        savePlace(p);
        setPlace(p);
        setEditing(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50/30 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 font-sans">
            <SEO
                title="Qibla Direction from Your City | Mastering Quran"
                description="The exact compass bearing to the Kaaba in Makkah from any city, with distance and a live phone compass."
            />
            <section className="py-12 px-4 md:px-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    <PageHero
                        eyebrow="Prayer direction"
                        title="Qibla Direction"
                        description="The bearing to the Kaaba in Makkah, measured from true north."
                        icon={Compass}
                        accent="purple"
                    />

                    {place && !editing && (
                        <p className="flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                            <MapPin className="h-3.5 w-3.5" aria-hidden />
                            {placeLabel(place)}
                            <button type="button" onClick={() => setEditing(true)} className="ml-2 inline-flex items-center gap-1 font-medium text-purple-700 hover:underline dark:text-purple-400">
                                <Pencil className="h-3.5 w-3.5" aria-hidden /> Change
                            </button>
                        </p>
                    )}

                    {(!place || editing) && (
                        <Card className="border border-purple-200 dark:border-purple-900/40">
                            <CardContent className="p-5 md:p-6">
                                {!place && (
                                    <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
                                        Find your city to see the Qibla. It is calculated on your device, and your location is never sent anywhere.
                                    </p>
                                )}
                                <LocationPicker onSelect={choose} accent="purple" autoFocus={editing} />
                            </CardContent>
                        </Card>
                    )}

                    {place && km !== null && km < 3 && (
                        <Card className="border-2 border-purple-200 dark:border-purple-900/40">
                            <CardContent className="p-8 text-center text-slate-700 dark:text-slate-200">
                                This location is within a few kilometres of the Kaaba, too close for a city-level bearing. Use your current location for a precise direction, or face the Kaaba directly.
                            </CardContent>
                        </Card>
                    )}

                    {place && bearing !== null && km !== null && km >= 3 && (
                        <>
                            <Card className="border-2 border-purple-200 dark:border-purple-900/40 bg-gradient-to-br from-purple-50/70 to-white dark:from-purple-950/20 dark:to-slate-900">
                                <CardContent className="p-8 text-center space-y-5">
                                    <div className="relative w-56 h-56 mx-auto" role="img" aria-label={`Qibla arrow pointing ${bearing.toFixed(1)} degrees from north`}>
                                        <div
                                            className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900/40 bg-white dark:bg-slate-900 transition-transform duration-300"
                                            style={{ transform: `rotate(${heading === null ? 0 : -heading}deg)` }}
                                        >
                                            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-red-500">N</div>
                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-400">S</div>
                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">W</div>
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">E</div>
                                        </div>
                                        <div className="absolute inset-0 flex items-start justify-center pt-5 transition-transform duration-300" style={{ transform: `rotate(${arrow}deg)` }}>
                                            <div className="flex flex-col items-center">
                                                <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[28px] border-l-transparent border-r-transparent border-b-purple-600"></div>
                                                <div className="w-1 h-24 bg-gradient-to-b from-purple-600 to-purple-300 rounded-b"></div>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Bearing from true north</p>
                                        <p className="text-5xl font-bold tabular-nums text-purple-700 dark:text-purple-300">
                                            {bearing.toFixed(1)}°<span className="ml-3 text-2xl text-slate-500">{compassPoint(bearing)}</span>
                                        </p>
                                    </div>

                                    {km !== null && (
                                        <div className="pt-4 border-t border-purple-100 dark:border-purple-900/30">
                                            <p className="text-sm text-slate-500">Distance to the Kaaba</p>
                                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                                {km.toLocaleString()} km
                                                <span className="ml-2 text-sm text-slate-500">({Math.round(km * 0.621371).toLocaleString()} miles)</span>
                                            </p>
                                        </div>
                                    )}

                                    {compassSupported && (
                                        <div className="pt-2">
                                            {heading === null ? (
                                                <Button onClick={startCompass} className="bg-purple-600 hover:bg-purple-700 text-white">
                                                    <Compass className="mr-2 h-4 w-4" /> Use my phone's compass
                                                </Button>
                                            ) : (
                                                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                                    Compass on. Turn until the arrow points straight up.
                                                </p>
                                            )}
                                            {compassError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{compassError}</p>}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <p className="text-xs text-center text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                {compassSupported
                                    ? "Phone compasses are thrown off by metal and magnets nearby. Hold the phone flat, away from them."
                                    : "Face true north, then turn clockwise by the bearing shown. On a phone, open this page to use its compass."}
                            </p>
                        </>
                    )}

                    <p className="text-center pt-6 text-xs text-slate-500 dark:text-slate-400">
                        Great-circle bearing calculated on your device with the open-source{" "}
                        <a href="https://github.com/batoulapps/adhan-js" target="_blank" rel="noopener noreferrer" className="underline">adhan</a> library.
                    </p>
                </div>
            </section>
        </div>
    );
}
