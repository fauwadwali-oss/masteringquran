// Portable playlist data access: plain async functions, no React dependencies.

import { supabase } from "@/lib/supabase";
import type { ListenMode } from "@/lib/playlists";

export interface PlaylistRow {
    id: string;
    user_id: string;
    name: string;
    surahs: number[];
    mode: ListenMode;
    created_at: string;
    updated_at: string;
}

export async function listPlaylists(userId: string): Promise<PlaylistRow[]> {
    const { data, error } = await supabase
        .from("mq_playlists")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
    if (error) throw error;
    return (data as PlaylistRow[]) ?? [];
}

export async function upsertPlaylists(
    userId: string,
    playlists: { id: string; name: string; surahs: number[]; mode: ListenMode; createdAt: number }[],
): Promise<void> {
    if (!playlists.length) return;
    const now = new Date().toISOString();
    const { error } = await supabase.from("mq_playlists").upsert(
        playlists.map((p) => ({
            id: p.id,
            user_id: userId,
            name: p.name,
            surahs: p.surahs,
            mode: p.mode,
            created_at: new Date(p.createdAt).toISOString(),
            updated_at: now,
        })),
    );
    if (error) throw error;
}

export async function deletePlaylists(userId: string, ids: string[]): Promise<void> {
    if (!ids.length) return;
    const { error } = await supabase.from("mq_playlists").delete().eq("user_id", userId).in("id", ids);
    if (error) throw error;
}
