import { useEffect, useState } from "react";
import { Loader2, AlertCircle, MapPin, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";

interface Location {
    latitude: number;
    longitude: number;
}

interface QiblaData {
    qibla_direction: number;
    compass_bearing?: string;
    distance_km?: number;
    distance_miles?: number;
}

export default function Qibla() {
    const [location, setLocation] = useState<Location | null>(null);
    const [data, setData] = useState<QiblaData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requestLocation = () => {
        setError(null);
        if (!navigator.geolocation) {
            setError("Your browser does not support location access.");
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => setLocation({
                latitude: Number(pos.coords.latitude.toFixed(4)),
                longitude: Number(pos.coords.longitude.toFixed(4)),
            }),
            (err) => {
                setLoading(false);
                setError(
                    err.code === 1
                        ? "Location permission denied. Allow location access to use the Qibla finder."
                        : "Could not determine your location.",
                );
            },
        );
    };

    useEffect(() => {
        if (!location) return;
        setLoading(true);
        fetch(`https://ummahapi.com/api/qibla?latitude=${location.latitude}&longitude=${location.longitude}`)
            .then(async (r) => {
                if (!r.ok) throw new Error("failed");
                const d: any = await r.json();
                setData(d.data || d);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to calculate Qibla direction.");
                setLoading(false);
            });
    }, [location]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50/30 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 font-sans">
            <SEO
                title="Qibla Direction - Mastering Quran"
                description="Precise compass bearing to the Kaaba in Makkah from your current location."
            />
            <section className="py-12 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <PageHero
                            eyebrow="Prayer direction"
                            title="Qibla Direction"
                            description="Precise compass bearing to the Kaaba in Makkah."
                            icon={Compass}
                            accent="purple"
                        />
                    </div>

                    {!location && (
                        <Card className="border border-purple-200 dark:border-purple-900/40 bg-gradient-to-br from-purple-50/60 to-white dark:from-purple-950/20 dark:to-slate-900">
                            <CardContent className="p-8 text-center space-y-4">
                                <div className="w-14 h-14 mx-auto bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center">
                                    <MapPin className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Share your location</h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                                    We calculate the Qibla as a bearing from true north. Your coordinates are never stored.
                                </p>
                                <Button onClick={requestLocation} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Locating…</> : "Use my location"}
                                </Button>
                                {error && <p className="text-sm text-red-600 dark:text-red-400 pt-2">{error}</p>}
                            </CardContent>
                        </Card>
                    )}

                    {location && loading && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                            <p className="text-slate-500 text-sm">Calculating bearing…</p>
                        </div>
                    )}

                    {location && error && !loading && (
                        <div className="text-center py-8">
                            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {data && !loading && (
                        <>
                            <Card className="border-2 border-purple-200 dark:border-purple-900/40 bg-gradient-to-br from-purple-50/70 to-white dark:from-purple-950/20 dark:to-slate-900">
                                <CardContent className="p-8 text-center space-y-5">
                                    {/* Compass visualization */}
                                    <div className="relative w-48 h-48 mx-auto">
                                        <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900/40 bg-white dark:bg-slate-900"></div>
                                        {/* N marker */}
                                        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-400">N</div>
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-400">S</div>
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">W</div>
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">E</div>
                                        {/* Arrow */}
                                        <div
                                            className="absolute inset-0 flex items-start justify-center pt-4 transition-transform duration-500"
                                            style={{ transform: `rotate(${data.qibla_direction}deg)` }}
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[28px] border-l-transparent border-r-transparent border-b-purple-600"></div>
                                                <div className="w-1 h-20 bg-gradient-to-b from-purple-600 to-purple-300 rounded-b"></div>
                                            </div>
                                        </div>
                                        {/* Center dot */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Bearing from true north</p>
                                        <p className="text-5xl font-bold text-purple-700 dark:text-purple-300 font-mono">
                                            {data.qibla_direction.toFixed(1)}°
                                            {data.compass_bearing && (
                                                <span className="ml-3 text-2xl text-slate-500 font-sans">{data.compass_bearing}</span>
                                            )}
                                        </p>
                                    </div>

                                    {data.distance_km && (
                                        <div className="pt-4 border-t border-purple-100 dark:border-purple-900/30">
                                            <p className="text-sm text-slate-500">Distance to the Kaaba</p>
                                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                                {data.distance_km.toLocaleString()} km
                                                {data.distance_miles && (
                                                    <span className="ml-2 text-sm text-slate-500">({data.distance_miles.toLocaleString()} miles)</span>
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="text-center mt-6">
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                    <Compass className="inline h-4 w-4 mr-1" />
                                    Rotate your device so "N" on your phone's compass aligns with true north, then face the direction the arrow points.
                                </p>
                                <Button variant="ghost" size="sm" onClick={requestLocation} className="mt-4">
                                    Update location
                                </Button>
                            </div>
                        </>
                    )}

                    <p className="text-center mt-12 text-xs text-slate-500 dark:text-slate-400">
                        Data from{" "}
                        <a href="https://ummahapi.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                            UmmahAPI
                        </a>.
                    </p>
                </div>
            </section>
        </div>
    );
}
