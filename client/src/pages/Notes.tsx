import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, NotebookText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { listAllNotes, deleteNote, Note } from "@/lib/queries/notes";
import RequireAuth from "@/components/RequireAuth";

function Inner() {
    const { user } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        listAllNotes(user.id).then((rows) => {
            setNotes(rows);
            setLoading(false);
        });
    }, [user]);

    const remove = async (verseKey: string) => {
        if (!user) return;
        await deleteNote(user.id, verseKey);
        setNotes((prev) => prev.filter((n) => n.verse_key !== verseKey));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            <SEO title="My Notes - Mastering Quran" description="Your personal reflections on Quran verses, synced across devices." />
            <section className="py-12 px-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex items-center gap-3">
                        <NotebookText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                            My Notes
                        </h1>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    ) : notes.length === 0 ? (
                        <Card className="p-12 text-center">
                            <p className="text-slate-500 mb-4">No notes yet. Add one from any verse in the Quran reader.</p>
                            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Link to="/quran">Open the Quran</Link>
                            </Button>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {notes.map((n) => (
                                <Card key={n.id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                    <CardContent className="p-5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Link to="/quran" className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
                                                Quran {n.verse_key}
                                            </Link>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-400">{new Date(n.updated_at).toLocaleDateString()}</span>
                                                <Button variant="ghost" size="icon" onClick={() => remove(n.verse_key)} className="h-7 w-7">
                                                    <Trash2 className="h-3 w-3 text-slate-400 hover:text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">{n.body}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default function Notes() {
    return <RequireAuth reason="Sign in to save notes on verses."><Inner /></RequireAuth>;
}
