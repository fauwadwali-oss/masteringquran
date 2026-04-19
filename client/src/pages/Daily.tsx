import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Bell, BellOff, Loader2, Check, AlertCircle, Clock, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
    getEmailSubscription,
    upsertEmailSubscription,
    deleteEmailSubscription,
    type EmailSubscription,
} from "@/lib/queries/email-subscription";
import {
    listPushSubscriptions,
    addPushSubscription,
    removePushSubscription,
    type PushSubscriptionRow,
} from "@/lib/queries/push-subscription";

// VAPID public key — baked in via env at build time. Used only for client subscription.
// If not set, the push card becomes read-only with a helpful message.
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function localTz(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
        return "UTC";
    }
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const clean = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(clean);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
    return out;
}

function ab2b64url(buf: ArrayBuffer | null): string {
    if (!buf) return "";
    const bytes = new Uint8Array(buf);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export default function Daily() {
    const { user, loading: authLoading } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-white dark:from-slate-950 dark:to-slate-900 py-10 px-4">
            <SEO
                title="Daily Reminders — Mastering Quran"
                description="Get a verse a day via email or push notification. Pick your timezone and delivery time."
            />
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider font-semibold">Daily Reminders</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">A verse a day</h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        One Quran verse delivered every day at the time you choose — by email, push notification, or both.
                    </p>
                </div>

                {!isSupabaseConfigured() && (
                    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                        <CardContent className="p-4 flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>Supabase isn't configured on this build, so reminders can't be saved yet.</span>
                        </CardContent>
                    </Card>
                )}

                {!authLoading && !user && (
                    <Card>
                        <CardContent className="p-6 text-center space-y-3">
                            <p className="text-slate-700 dark:text-slate-300">
                                Sign in to subscribe to daily verses.
                            </p>
                            <Link to="/ask" className="text-sm text-emerald-700 hover:underline">
                                Go to sign-in →
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {user && (
                    <>
                        <EmailSubscriptionCard userId={user.id} defaultEmail={user.email ?? ""} />
                        <PushSubscriptionCard userId={user.id} />
                    </>
                )}

                <Card className="border-slate-100 dark:border-slate-800">
                    <CardContent className="p-4 text-xs text-slate-500 space-y-1">
                        <p>
                            <strong>Privacy:</strong> Your email, timezone, and delivery time are stored in our Supabase project with row-level security — only you can read or change them. We never share your contact info.
                        </p>
                        <p>
                            <strong>How it works:</strong> A scheduled job runs every hour; if it's your chosen hour in your timezone, we send a verse. You can unsubscribe anytime.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Email subscription card
// ────────────────────────────────────────────────────────────────────────────
function EmailSubscriptionCard({ userId, defaultEmail }: { userId: string; defaultEmail: string }) {
    const [sub, setSub] = useState<EmailSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [email, setEmail] = useState(defaultEmail);
    const [hour, setHour] = useState(7);
    const [timezone, setTimezone] = useState(localTz());

    useEffect(() => {
        let cancelled = false;
        getEmailSubscription(userId)
            .then((s) => {
                if (cancelled) return;
                setSub(s);
                if (s) {
                    setEmail(s.email);
                    setHour(s.delivery_hour);
                    setTimezone(s.timezone);
                }
                setLoading(false);
            })
            .catch(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [userId]);

    const onSave = async () => {
        if (!email) {
            toast.error("Enter an email address");
            return;
        }
        setSaving(true);
        try {
            const s = await upsertEmailSubscription(userId, {
                email,
                delivery_hour: hour,
                timezone,
                active: true,
            });
            setSub(s);
            toast.success("Subscribed — your first verse will arrive within a day.");
        } catch (e: any) {
            toast.error(e?.message ?? "Couldn't save subscription");
        } finally {
            setSaving(false);
        }
    };

    const onUnsubscribe = async () => {
        setSaving(true);
        try {
            await deleteEmailSubscription(userId);
            setSub(null);
            toast.success("Unsubscribed from daily email.");
        } catch (e: any) {
            toast.error(e?.message ?? "Couldn't unsubscribe");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="border border-emerald-200 dark:border-emerald-900/40 bg-white dark:bg-slate-900">
            <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-emerald-600" />
                        <h2 className="font-semibold text-slate-900 dark:text-white">Email — a verse a day</h2>
                    </div>
                    {sub?.active && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                            <Check className="h-3.5 w-3.5" /> Subscribed
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                    </div>
                ) : (
                    <>
                        <div className="grid gap-3 sm:grid-cols-[1fr,auto,auto]">
                            <div>
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                    Time
                                </label>
                                <Select value={String(hour)} onValueChange={(v) => setHour(parseInt(v))}>
                                    <SelectTrigger className="w-[110px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {HOURS.map((h) => (
                                            <SelectItem key={h} value={String(h)}>
                                                {h.toString().padStart(2, "0")}:00
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                    Timezone
                                </label>
                                <Input
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="w-[180px]"
                                    placeholder="America/New_York"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={onSave} disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                {sub ? "Update" : "Subscribe"}
                            </Button>
                            {sub && (
                                <Button variant="outline" onClick={onUnsubscribe} disabled={saving}>
                                    <Trash2 className="h-4 w-4" />
                                    Unsubscribe
                                </Button>
                            )}
                        </div>
                        {sub?.last_sent_verse && (
                            <p className="text-[11px] text-slate-500">
                                Last sent: verse {sub.last_sent_verse}
                                {sub.last_sent_at && ` · ${new Date(sub.last_sent_at).toLocaleString()}`}
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Push subscription card
// ────────────────────────────────────────────────────────────────────────────
function PushSubscriptionCard({ userId }: { userId: string }) {
    const [supported, setSupported] = useState<boolean | null>(null);
    const [subs, setSubs] = useState<PushSubscriptionRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);
    const [hour, setHour] = useState(7);

    useEffect(() => {
        const ok = "serviceWorker" in navigator && "PushManager" in window;
        setSupported(ok);
        if (!ok) {
            setLoading(false);
            return;
        }
        (async () => {
            try {
                const reg = await navigator.serviceWorker.getRegistration();
                const existing = await reg?.pushManager.getSubscription();
                setCurrentEndpoint(existing?.endpoint ?? null);
                const rows = await listPushSubscriptions(userId);
                setSubs(rows);
            } catch (e) {
                console.warn(e);
            } finally {
                setLoading(false);
            }
        })();
    }, [userId]);

    const enable = async () => {
        if (!VAPID_PUBLIC_KEY) {
            toast.error("Push not configured yet (VAPID key missing). Coming soon.");
            return;
        }
        setBusy(true);
        try {
            const reg = await navigator.serviceWorker.register("/service-worker.js");
            await navigator.serviceWorker.ready;
            const perm = await Notification.requestPermission();
            if (perm !== "granted") {
                toast.error("Notifications permission denied.");
                return;
            }
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });
            const json = sub.toJSON();
            const p256dh = json.keys?.p256dh as string;
            const auth = json.keys?.auth as string;
            const row = await addPushSubscription(userId, {
                endpoint: sub.endpoint,
                keys_p256dh: p256dh,
                keys_auth: auth,
                user_agent: navigator.userAgent,
                delivery_hour: hour,
                timezone: localTz(),
            });
            setCurrentEndpoint(sub.endpoint);
            setSubs((cur) => [row, ...cur.filter((r) => r.endpoint !== row.endpoint)]);
            toast.success("Push notifications enabled on this device.");
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message ?? "Couldn't enable push");
        } finally {
            setBusy(false);
        }
    };

    const disableOn = async (endpoint: string) => {
        setBusy(true);
        try {
            await removePushSubscription(userId, endpoint);
            setSubs((cur) => cur.filter((r) => r.endpoint !== endpoint));
            // If it's the current device's subscription, also unsubscribe the browser
            if (endpoint === currentEndpoint) {
                const reg = await navigator.serviceWorker.getRegistration();
                const existing = await reg?.pushManager.getSubscription();
                await existing?.unsubscribe();
                setCurrentEndpoint(null);
            }
            toast.success("Disabled on that device.");
        } catch (e: any) {
            toast.error(e?.message ?? "Couldn't disable");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Card className="border border-indigo-200 dark:border-indigo-900/40 bg-white dark:bg-slate-900">
            <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-indigo-600" />
                        <h2 className="font-semibold text-slate-900 dark:text-white">Push — a verse a day</h2>
                    </div>
                    {subs.some((s) => s.endpoint === currentEndpoint && s.active) && (
                        <span className="inline-flex items-center gap-1 text-xs text-indigo-600">
                            <Check className="h-3.5 w-3.5" /> This device enabled
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                    </div>
                ) : !supported ? (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Your browser doesn't support web push. (iOS Safari requires adding to Home Screen first.)
                    </p>
                ) : (
                    <>
                        <div className="flex gap-2 items-end flex-wrap">
                            <div>
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                    Time
                                </label>
                                <Select value={String(hour)} onValueChange={(v) => setHour(parseInt(v))}>
                                    <SelectTrigger className="w-[110px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {HOURS.map((h) => (
                                            <SelectItem key={h} value={String(h)}>
                                                {h.toString().padStart(2, "0")}:00
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={enable} disabled={busy}>
                                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                                Enable on this device
                            </Button>
                        </div>

                        {subs.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Your devices
                                </p>
                                {subs.map((s) => {
                                    const ua = s.user_agent ?? "Unknown browser";
                                    const isThis = s.endpoint === currentEndpoint;
                                    return (
                                        <div key={s.id} className="flex items-center justify-between gap-2 text-sm">
                                            <div className="truncate min-w-0">
                                                <span className="text-slate-700 dark:text-slate-300 truncate block">
                                                    {ua.split("(")[0].trim() || "Device"}
                                                    {isThis && <span className="text-xs text-indigo-600 ml-1">(this one)</span>}
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    {s.delivery_hour.toString().padStart(2, "0")}:00 {s.timezone}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => disableOn(s.endpoint)}
                                                disabled={busy}
                                            >
                                                <BellOff className="h-3.5 w-3.5" /> Disable
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {!VAPID_PUBLIC_KEY && (
                            <p className="text-[11px] text-amber-600">
                                Push sender isn't configured yet on the server. The UI is live for preview;
                                enabling it will store your subscription but deliveries start once VAPID keys are set.
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
