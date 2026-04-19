// Web Push subscription — RN-portable shape (RN uses APNs/FCM instead, but shape is similar).
import { supabase } from "@/lib/supabase";

export interface PushSubscriptionRow {
    id: string;
    user_id: string;
    endpoint: string;
    keys_p256dh: string;
    keys_auth: string;
    user_agent: string | null;
    delivery_hour: number;
    timezone: string;
    active: boolean;
    last_sent_at: string | null;
    created_at: string;
}

export async function listPushSubscriptions(userId: string): Promise<PushSubscriptionRow[]> {
    const { data, error } = await supabase
        .from("mq_push_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as PushSubscriptionRow[]) ?? [];
}

export async function addPushSubscription(
    userId: string,
    sub: {
        endpoint: string;
        keys_p256dh: string;
        keys_auth: string;
        user_agent?: string;
        delivery_hour: number;
        timezone: string;
    },
): Promise<PushSubscriptionRow> {
    const { data, error } = await supabase
        .from("mq_push_subscriptions")
        .upsert(
            {
                user_id: userId,
                endpoint: sub.endpoint,
                keys_p256dh: sub.keys_p256dh,
                keys_auth: sub.keys_auth,
                user_agent: sub.user_agent ?? null,
                delivery_hour: sub.delivery_hour,
                timezone: sub.timezone,
                active: true,
            },
            { onConflict: "user_id,endpoint" },
        )
        .select()
        .single();
    if (error) throw error;
    return data as PushSubscriptionRow;
}

export async function removePushSubscription(userId: string, endpoint: string): Promise<void> {
    const { error } = await supabase
        .from("mq_push_subscriptions")
        .delete()
        .eq("user_id", userId)
        .eq("endpoint", endpoint);
    if (error) throw error;
}

export async function updatePushSubscriptionTime(
    userId: string,
    endpoint: string,
    delivery_hour: number,
    timezone: string,
): Promise<void> {
    const { error } = await supabase
        .from("mq_push_subscriptions")
        .update({ delivery_hour, timezone })
        .eq("user_id", userId)
        .eq("endpoint", endpoint);
    if (error) throw error;
}
