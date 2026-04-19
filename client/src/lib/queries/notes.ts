import { supabase } from "@/lib/supabase";

export interface Note {
    id: string;
    user_id: string;
    verse_key: string;
    body: string;
    created_at: string;
    updated_at: string;
}

export async function getNote(userId: string, verseKey: string): Promise<Note | null> {
    const { data, error } = await supabase
        .from("mq_notes")
        .select("*")
        .eq("user_id", userId)
        .eq("verse_key", verseKey)
        .maybeSingle();
    if (error) throw error;
    return (data as Note) ?? null;
}

export async function upsertNote(userId: string, verseKey: string, body: string): Promise<Note> {
    const { data, error } = await supabase
        .from("mq_notes")
        .upsert(
            { user_id: userId, verse_key: verseKey, body, updated_at: new Date().toISOString() },
            { onConflict: "user_id,verse_key" },
        )
        .select()
        .single();
    if (error) throw error;
    return data as Note;
}

export async function deleteNote(userId: string, verseKey: string): Promise<void> {
    const { error } = await supabase
        .from("mq_notes")
        .delete()
        .eq("user_id", userId)
        .eq("verse_key", verseKey);
    if (error) throw error;
}

export async function listAllNotes(userId: string): Promise<Note[]> {
    const { data, error } = await supabase
        .from("mq_notes")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data as Note[]) ?? [];
}
