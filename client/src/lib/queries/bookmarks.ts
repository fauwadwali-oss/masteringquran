// Portable bookmark data access — plain async functions, no React dependencies.
// Can be imported verbatim by a React Native app.

import { supabase } from "@/lib/supabase";

export interface Bookmark {
    id: string;
    user_id: string;
    verse_key: string;
    surah: number;
    ayah: number;
    label: string | null;
    created_at: string;
}

export async function listBookmarks(userId: string): Promise<Bookmark[]> {
    const { data, error } = await supabase
        .from("mq_bookmarks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Bookmark[]) ?? [];
}

export async function addBookmark(userId: string, surah: number, ayah: number, label?: string): Promise<Bookmark> {
    const verse_key = `${surah}:${ayah}`;
    const { data, error } = await supabase
        .from("mq_bookmarks")
        .upsert({ user_id: userId, verse_key, surah, ayah, label: label ?? null }, { onConflict: "user_id,verse_key" })
        .select()
        .single();
    if (error) throw error;
    return data as Bookmark;
}

export async function removeBookmark(userId: string, verseKey: string): Promise<void> {
    const { error } = await supabase
        .from("mq_bookmarks")
        .delete()
        .eq("user_id", userId)
        .eq("verse_key", verseKey);
    if (error) throw error;
}

export async function hasBookmark(userId: string, verseKey: string): Promise<boolean> {
    const { count, error } = await supabase
        .from("mq_bookmarks")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("verse_key", verseKey);
    if (error) throw error;
    return (count ?? 0) > 0;
}
