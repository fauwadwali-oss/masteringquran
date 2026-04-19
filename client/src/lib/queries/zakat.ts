// Zakat records — RN-portable data access for calculation history.
import { supabase } from "@/lib/supabase";

export interface ZakatSnapshot {
    cash: number;
    bank: number;
    gold_grams: number;
    silver_grams: number;
    investments: number;
    business_inventory: number;
    receivables: number;
    liabilities: number;
    gold_price_per_gram: number;
    silver_price_per_gram: number;
    nisab_basis: "gold" | "silver";
    nisab_threshold: number;
    total_zakatable: number;
    zakat_due: number;
    meets_nisab: boolean;
}

export interface ZakatRecord {
    id: string;
    user_id: string;
    snapshot: ZakatSnapshot;
    total_wealth: number;
    zakat_due: number;
    currency: string;
    hijri_year: number | null;
    note: string | null;
    created_at: string;
}

export async function listZakatRecords(userId: string): Promise<ZakatRecord[]> {
    const { data, error } = await supabase
        .from("mq_zakat_records")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as ZakatRecord[]) ?? [];
}

export async function saveZakatRecord(
    userId: string,
    snapshot: ZakatSnapshot,
    options: { currency?: string; hijri_year?: number; note?: string } = {},
): Promise<ZakatRecord> {
    const { data, error } = await supabase
        .from("mq_zakat_records")
        .insert({
            user_id: userId,
            snapshot,
            total_wealth: snapshot.total_zakatable,
            zakat_due: snapshot.zakat_due,
            currency: options.currency ?? "USD",
            hijri_year: options.hijri_year ?? null,
            note: options.note ?? null,
        })
        .select()
        .single();
    if (error) throw error;
    return data as ZakatRecord;
}

export async function deleteZakatRecord(id: string): Promise<void> {
    const { error } = await supabase.from("mq_zakat_records").delete().eq("id", id);
    if (error) throw error;
}
