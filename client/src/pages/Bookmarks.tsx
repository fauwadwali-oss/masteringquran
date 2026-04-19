import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, BookMarked, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { listBookmarks, removeBookmark, Bookmark } from "@/lib/queries/bookmarks";
import RequireAuth from "@/components/RequireAuth";

function Inner() {
    const { user } = useAuth();
    const [items, setItems] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        listBookmarks(user.id).then((rows) => {
            setItems(rows);
            setLoading(false);
        });
    }, [user]);

    const remove = async (verseKey: string) => {
        if (!user) return;
        await removeBookmark(user.id, verseKey);
        setItems((prev) => prev.filter((b) => b.verse_key !== verseKey));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            <SEO title="My Bookmarks - Mastering Quran" description="Your saved Quran verses, synced across devices." />
            <section className="py-12 px-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex items-center gap-3">
                        <BookMarked className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                            My Bookmarks
                        </h1>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    ) : items.length === 0 ? (
                        <Card className="p-12 text-center">
                            <p className="text-slate-500 mb-4">No bookmarks yet.</p>
                            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Link to="/quran">Open the Quran</Link>
                            </Button>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {items.map((b) => (
                                <Card key={b.id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <Link to={`/quran`} className="flex-1 group">
                                            <p className="font-semibold text-emerald-700 dark:text-emerald-400 group-hover:underline">
                                                Quran {b.verse_key}
                                            </p>
                                            {b.label && <p className="text-sm text-slate-600 dark:text-slate-400">{b.label}</p>}
                                            <p className="text-xs text-slate-400 mt-1">{new Date(b.created_at).toLocaleDateString()}</p>
                                        </Link>
                                        <Button variant="ghost" size="icon" onClick={() => remove(b.verse_key)}>
                                            <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                                        </Button>
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

export default function Bookmarks() {
    return <RequireAuth reason="Sign in to view your bookmarks across devices."><Inner /></RequireAuth>;
}
