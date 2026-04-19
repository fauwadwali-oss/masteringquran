// Email-a-verse subscription — RN-portable data access.
import { supabase } from "@/lib/supabase";

export interface EmailSubscription {
    user_id: string;
    email: string;
    delivery_hour: number;      // 0-23 in the user's local timezone
    timezone: string;           // IANA tz
    active: boolean;
    last_sent_at: string | null;
    last_sent_verse: string | null;
    created_at: string;
    updated_at: string;
}

export async function getEmailSubscription(userId: string): Promise<EmailSubscription | null> {
    const { data, error } = await supabase
        .from("mq_email_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
    if (error) throw error;
    return (data as EmailSubscription | null) ?? null;
}

export async function upsertEmailSubscription(
    userId: string,
    payload: { email: string; delivery_hour: number; timezone: string; active?: boolean },
): Promise<EmailSubscription> {
    const { data, error } = await supabase
        .from("mq_email_subscriptions")
        .upsert(
            {
                user_id: userId,
                email: payload.email,
                delivery_hour: payload.delivery_hour,
                timezone: payload.timezone,
                active: payload.active ?? true,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
        )
        .select()
        .single();
    if (error) throw error;
    return data as EmailSubscription;
}

export async function deleteEmailSubscription(userId: string): Promise<void> {
    const { error } = await supabase
        .from("mq_email_subscriptions")
        .delete()
        .eq("user_id", userId);
    if (error) throw error;
}
