import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calculator, Save, Loader2, RefreshCw, Info, Check, History, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
    listZakatRecords,
    saveZakatRecord,
    deleteZakatRecord,
    type ZakatRecord,
    type ZakatSnapshot,
} from "@/lib/queries/zakat";

// ───────────────────────────────────────────────────────────────────
// Zakat constants
// ───────────────────────────────────────────────────────────────────
// Nisab is the minimum wealth threshold above which zakat becomes obligatory.
// Classical measures (see Hanafi, Shafi'i, Maliki, Hanbali sources):
//   - Gold nisab  = 85 grams (20 mithqal)
//   - Silver nisab = 595 grams (200 dirham)
// Most contemporary scholars recommend using the SILVER nisab (lower threshold,
// more poor people benefit). Some use gold on the argument that silver's value
// has fallen disproportionately.
const GOLD_NISAB_G = 85;
const SILVER_NISAB_G = 595;
const ZAKAT_RATE = 0.025; // 2.5%

// Default starting prices (USD/gram) — user can update via "Refresh prices"
// (calls a free public API) or type their own.
const DEFAULT_GOLD_PRICE_USD = 85;   // ~typical spring 2026 level
const DEFAULT_SILVER_PRICE_USD = 1.05;

interface FormState {
    cash: string;
    bank: string;
    gold_grams: string;
    silver_grams: string;
    investments: string;
    business_inventory: string;
    receivables: string;
    liabilities: string;
    gold_price: string;
    silver_price: string;
    nisab_basis: "gold" | "silver";
    currency: string;
}

const STORAGE_KEY = "mq_zakat_form_v1";

function loadForm(): FormState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return { ...defaultForm(), ...JSON.parse(raw) };
    } catch { /* ignore */ }
    return defaultForm();
}

function defaultForm(): FormState {
    return {
        cash: "",
        bank: "",
        gold_grams: "",
        silver_grams: "",
        investments: "",
        business_inventory: "",
        receivables: "",
        liabilities: "",
        gold_price: String(DEFAULT_GOLD_PRICE_USD),
        silver_price: String(DEFAULT_SILVER_PRICE_USD),
        nisab_basis: "silver",
        currency: "USD",
    };
}

function num(s: string): number {
    const v = parseFloat(s);
    return isFinite(v) ? v : 0;
}

export default function Zakat() {
    const { user } = useAuth();
    const [form, setForm] = useState<FormState>(loadForm);
    const [priceRefreshing, setPriceRefreshing] = useState(false);
    const [priceSource, setPriceSource] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [records, setRecords] = useState<ZakatRecord[]>([]);
    const [loadingRecords, setLoadingRecords] = useState(false);

    // Persist form to localStorage on every change (keeps work if you close the tab mid-calculation)
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
        } catch { /* ignore */ }
    }, [form]);

    // Load prior records
    useEffect(() => {
        if (!user) return;
        setLoadingRecords(true);
        listZakatRecords(user.id)
            .then((r) => setRecords(r))
            .catch(() => {})
            .finally(() => setLoadingRecords(false));
    }, [user]);

    const snapshot: ZakatSnapshot = useMemo(() => {
        const cash = num(form.cash);
        const bank = num(form.bank);
        const gold_grams = num(form.gold_grams);
        const silver_grams = num(form.silver_grams);
        const investments = num(form.investments);
        const business_inventory = num(form.business_inventory);
        const receivables = num(form.receivables);
        const liabilities = num(form.liabilities);
        const gold_price_per_gram = num(form.gold_price);
        const silver_price_per_gram = num(form.silver_price);

        const gold_value = gold_grams * gold_price_per_gram;
        const silver_value = silver_grams * silver_price_per_gram;

        const gross = cash + bank + gold_value + silver_value + investments + business_inventory + receivables;
        const total_zakatable = Math.max(0, gross - liabilities);

        const nisab_threshold =
            form.nisab_basis === "gold"
                ? GOLD_NISAB_G * gold_price_per_gram
                : SILVER_NISAB_G * silver_price_per_gram;

        const meets_nisab = total_zakatable >= nisab_threshold;
        const zakat_due = meets_nisab ? total_zakatable * ZAKAT_RATE : 0;

        return {
            cash,
            bank,
            gold_grams,
            silver_grams,
            investments,
            business_inventory,
            receivables,
            liabilities,
            gold_price_per_gram,
            silver_price_per_gram,
            nisab_basis: form.nisab_basis,
            nisab_threshold,
            total_zakatable,
            zakat_due,
            meets_nisab,
        };
    }, [form]);

    const refreshPrices = async () => {
        setPriceRefreshing(true);
        setPriceSource(null);
        try {
            // metals.dev has a free public endpoint, no key required, returns XAU/XAG in USD/oz
            // Convert to USD/gram (1 troy ounce = 31.1034768 grams)
            const r = await fetch("https://api.metals.dev/v1/latest?api_key=demo&currency=USD&unit=g");
            if (r.ok) {
                const j = await r.json();
                const gold = j?.metals?.gold;
                const silver = j?.metals?.silver;
                if (gold && silver) {
                    setForm((f) => ({
                        ...f,
                        gold_price: gold.toFixed(2),
                        silver_price: silver.toFixed(3),
                    }));
                    setPriceSource(`metals.dev · ${new Date().toLocaleString()}`);
                    return;
                }
            }
            // Fallback: simple API via Yahoo Finance JSON (may be blocked by CORS; try anyway)
            throw new Error("Live fetch failed — keeping current values");
        } catch (e) {
            toast.error("Couldn't refresh prices automatically. Enter today's price manually.");
        } finally {
            setPriceRefreshing(false);
        }
    };

    const onSave = async () => {
        if (!user) {
            toast.error("Sign in to save your zakat calculation.");
            return;
        }
        setSaving(true);
        try {
            const rec = await saveZakatRecord(user.id, snapshot, { currency: form.currency });
            setRecords((prev) => [rec, ...prev]);
            toast.success("Saved.");
        } catch (e: any) {
            toast.error(e?.message ?? "Couldn't save");
        } finally {
            setSaving(false);
        }
    };

    const onDeleteRecord = async (id: string) => {
        try {
            await deleteZakatRecord(id);
            setRecords((prev) => prev.filter((r) => r.id !== id));
        } catch (e: any) {
            toast.error(e?.message ?? "Couldn't delete");
        }
    };

    const onReset = () => {
        if (!confirm("Clear the form?")) return;
        setForm(defaultForm());
    };

    const fmt = (n: number) =>
        new Intl.NumberFormat(undefined, { style: "currency", currency: form.currency, maximumFractionDigits: 2 }).format(n);

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-white dark:from-slate-950 dark:to-slate-900 py-10 px-4">
            <SEO
                title="Zakat Calculator — Mastering Quran"
                description="Calculate your annual zakat. Live gold and silver nisab, cash, investments, business inventory, liabilities — all in one form."
            />
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <Calculator className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider font-semibold">Zakat Calculator</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Calculate Your Zakat</h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Zakat is 2.5% of the wealth you've held above the nisab threshold for one lunar year.
                    </p>
                </div>

                {/* Prices card */}
                <Card className="border border-amber-200 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/40 to-white dark:from-amber-950/10 dark:to-slate-900">
                    <CardContent className="p-5 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <Info className="h-4 w-4 text-amber-600" />
                                <h3 className="font-semibold text-slate-900 dark:text-white">Current metal prices</h3>
                            </div>
                            <Button variant="outline" size="sm" onClick={refreshPrices} disabled={priceRefreshing}>
                                {priceRefreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                                Refresh live prices
                            </Button>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-3">
                            <Field
                                label="Currency"
                                value={form.currency}
                                onChange={(v) => setForm((f) => ({ ...f, currency: v.toUpperCase().slice(0, 3) }))}
                                placeholder="USD"
                            />
                            <Field
                                label={`Gold price (${form.currency}/gram)`}
                                value={form.gold_price}
                                type="number"
                                onChange={(v) => setForm((f) => ({ ...f, gold_price: v }))}
                            />
                            <Field
                                label={`Silver price (${form.currency}/gram)`}
                                value={form.silver_price}
                                type="number"
                                onChange={(v) => setForm((f) => ({ ...f, silver_price: v }))}
                            />
                        </div>
                        {priceSource && (
                            <p className="text-[11px] text-slate-500">Source: {priceSource}</p>
                        )}
                        <div className="flex items-center gap-3 pt-2">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                Nisab basis
                            </label>
                            <Select
                                value={form.nisab_basis}
                                onValueChange={(v: "gold" | "silver") => setForm((f) => ({ ...f, nisab_basis: v }))}
                            >
                                <SelectTrigger className="w-[220px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="silver">Silver — 595 g (recommended)</SelectItem>
                                    <SelectItem value="gold">Gold — 85 g</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Assets */}
                <Card>
                    <CardContent className="p-5 space-y-3">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Your assets</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <Field label="Cash on hand" value={form.cash} type="number" onChange={(v) => setForm((f) => ({ ...f, cash: v }))} />
                            <Field label="Bank balance" value={form.bank} type="number" onChange={(v) => setForm((f) => ({ ...f, bank: v }))} />
                            <Field label="Gold (grams)" value={form.gold_grams} type="number" onChange={(v) => setForm((f) => ({ ...f, gold_grams: v }))} />
                            <Field label="Silver (grams)" value={form.silver_grams} type="number" onChange={(v) => setForm((f) => ({ ...f, silver_grams: v }))} />
                            <Field label="Investments (stocks, funds — liquid portion)" value={form.investments} type="number" onChange={(v) => setForm((f) => ({ ...f, investments: v }))} />
                            <Field label="Business inventory at resale value" value={form.business_inventory} type="number" onChange={(v) => setForm((f) => ({ ...f, business_inventory: v }))} />
                            <Field label="Receivables (expected to be paid)" value={form.receivables} type="number" onChange={(v) => setForm((f) => ({ ...f, receivables: v }))} />
                            <Field label="Liabilities / debts due within year" value={form.liabilities} type="number" onChange={(v) => setForm((f) => ({ ...f, liabilities: v }))} />
                        </div>
                    </CardContent>
                </Card>

                {/* Result */}
                <Card className={snapshot.meets_nisab ? "border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20" : "border-slate-200 dark:border-slate-800"}>
                    <CardContent className="p-6 space-y-3">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Result</h3>
                        <div className="grid sm:grid-cols-3 gap-4">
                            <Stat label="Total zakatable wealth" value={fmt(snapshot.total_zakatable)} />
                            <Stat label={`Nisab (${snapshot.nisab_basis})`} value={fmt(snapshot.nisab_threshold)} />
                            <Stat
                                label="Zakat due (2.5%)"
                                value={snapshot.meets_nisab ? fmt(snapshot.zakat_due) : "—"}
                                highlight={snapshot.meets_nisab}
                            />
                        </div>
                        {!snapshot.meets_nisab && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 pt-2">
                                Your wealth is below the nisab threshold this year, so no zakat is obligatory.
                                Optional <em>sadaqah</em> (charity) remains deeply rewarded.
                            </p>
                        )}

                        <div className="flex gap-2 flex-wrap pt-2">
                            <Button onClick={onSave} disabled={saving || !user}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {user ? "Save this calculation" : "Sign in to save"}
                            </Button>
                            <Button variant="outline" onClick={onReset}>
                                Reset form
                            </Button>
                        </div>
                        {!user && (
                            <p className="text-xs text-slate-500">
                                Not signed in? Your form stays in this browser via localStorage — return anytime.
                            </p>
                        )}
                        {!isSupabaseConfigured() && user && (
                            <p className="text-xs text-amber-600">Supabase isn't configured on this build; records can't be saved yet.</p>
                        )}
                    </CardContent>
                </Card>

                {/* History */}
                {user && (
                    <Card>
                        <CardContent className="p-5 space-y-3">
                            <div className="flex items-center gap-2">
                                <History className="h-4 w-4 text-slate-500" />
                                <h3 className="font-semibold text-slate-900 dark:text-white">Past calculations</h3>
                            </div>
                            {loadingRecords ? (
                                <div className="text-sm text-slate-500 flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                                </div>
                            ) : records.length === 0 ? (
                                <p className="text-sm text-slate-500">No saved calculations yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {records.map((r) => (
                                        <div key={r.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <div className="text-sm">
                                                <div className="font-medium text-slate-900 dark:text-white">
                                                    {new Intl.NumberFormat(undefined, { style: "currency", currency: r.currency, maximumFractionDigits: 2 }).format(r.zakat_due)}
                                                </div>
                                                <div className="text-[11px] text-slate-500">
                                                    Wealth: {new Intl.NumberFormat(undefined, { style: "currency", currency: r.currency, maximumFractionDigits: 2 }).format(r.total_wealth)} · {new Date(r.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => onDeleteRecord(r.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Notes */}
                <Card className="border-slate-100 dark:border-slate-800">
                    <CardContent className="p-5 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">A few notes on zakat:</p>
                        <ul className="space-y-1 list-disc pl-5">
                            <li>Zakat is due on wealth held for <em>one lunar year (hawl)</em> above the nisab threshold.</li>
                            <li>Personal residence, car, clothing, and household items are NOT zakatable.</li>
                            <li>For stocks and mutual funds, scholars differ; common practice is to pay zakat on market value at year-end for trading portfolios and on the zakatable portion (cash + receivables) for long-term holdings.</li>
                            <li>For business inventory, use the retail resale value, not cost.</li>
                            <li>Most contemporary scholars prefer the silver nisab — lower threshold, more recipients benefit.</li>
                            <li>Pay zakat at the same Hijri date each year to keep the hawl consistent.</li>
                        </ul>
                        <p className="pt-2">
                            This is a helper, not a fatwa. For complex portfolios (pension funds, crypto, agricultural produce, livestock) consult a qualified scholar.{" "}
                            <Link to="/ask" className="text-emerald-600 hover:underline">Ask AI →</Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// ─── helpers ───
function Field({
    label, value, onChange, type = "text", placeholder,
}: {
    label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
    return (
        <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                {label}
            </label>
            <Input
                value={value}
                type={type}
                inputMode={type === "number" ? "decimal" : undefined}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder ?? "0"}
                className="text-right"
            />
        </div>
    );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className={`p-3 rounded-xl border ${highlight ? "border-emerald-300 bg-white dark:bg-emerald-950/40" : "border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900"}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
            <p className={`text-xl font-bold ${highlight ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                {value}
            </p>
        </div>
    );
}
