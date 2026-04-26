import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, BookMarked, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { listBookmarks, removeBookmark, Bookmark } from "@/lib/queries/bookmarks";
import RequireAuth from "@/components/RequireAuth";

function Inner() {
    const { user } = useAuth();
    const [items, setItems] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);
    const [collections, setCollections] = useState<Record<string, string>>({});
    const [activeCollection, setActiveCollection] = useState("All");
    const [newCollection, setNewCollection] = useState("");

    const collectionKey = user ? `mq_bookmark_collections_${user.id}` : "";

    useEffect(() => {
        if (!user) return;
        listBookmarks(user.id).then((rows) => {
            setItems(rows);
            setLoading(false);
        });
        try {
            setCollections(JSON.parse(localStorage.getItem(`mq_bookmark_collections_${user.id}`) || "{}"));
        } catch {
            setCollections({});
        }
    }, [user]);

    const saveCollections = (next: Record<string, string>) => {
        setCollections(next);
        if (collectionKey) localStorage.setItem(collectionKey, JSON.stringify(next));
    };

    const setBookmarkCollection = (verseKey: string, collection: string) => {
        saveCollections({ ...collections, [verseKey]: collection });
    };

    const collectionNames = ["All", ...Array.from(new Set(["Ramadan", "Patience", "Duas", "Memorization", ...Object.values(collections)]))];
    const visibleItems = activeCollection === "All" ? items : items.filter((b) => collections[b.verse_key] === activeCollection);

    const remove = async (verseKey: string) => {
        if (!user) return;
        await removeBookmark(user.id, verseKey);
        setItems((prev) => prev.filter((b) => b.verse_key !== verseKey));
        const next = { ...collections };
        delete next[verseKey];
        saveCollections(next);
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

                    <Card className="border border-emerald-200/80 bg-white dark:border-emerald-900/40 dark:bg-slate-900">
                        <CardContent className="space-y-4 p-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Bookmark collections</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Group saved verses by themes like Ramadan, patience, duas, or memorization.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {collectionNames.map((name) => (
                                    <button
                                        key={name}
                                        onClick={() => setActiveCollection(name)}
                                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                                            activeCollection === name
                                                ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                                                : "border-slate-200 text-slate-600 hover:border-emerald-300 dark:border-slate-800 dark:text-slate-300"
                                        }`}
                                    >
                                        {name}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input value={newCollection} onChange={(e) => setNewCollection(e.target.value)} placeholder="New collection name" className="h-10" />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        const clean = newCollection.trim();
                                        if (!clean) return;
                                        setActiveCollection(clean);
                                        setNewCollection("");
                                    }}
                                >
                                    Add
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

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
                            {visibleItems.map((b) => (
                                <Card key={b.id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                    <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <Link to={`/quran`} className="flex-1 group">
                                            <p className="font-semibold text-emerald-700 dark:text-emerald-400 group-hover:underline">
                                                Quran {b.verse_key}
                                            </p>
                                            {b.label && <p className="text-sm text-slate-600 dark:text-slate-400">{b.label}</p>}
                                            <p className="text-xs text-slate-400 mt-1">{new Date(b.created_at).toLocaleDateString()}</p>
                                        </Link>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={collections[b.verse_key] || ""}
                                                onChange={(e) => setBookmarkCollection(b.verse_key, e.target.value)}
                                                className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                                            >
                                                <option value="">No collection</option>
                                                {collectionNames.filter((n) => n !== "All").map((name) => (
                                                    <option key={name} value={name}>{name}</option>
                                                ))}
                                            </select>
                                            <Button variant="ghost" size="icon" onClick={() => remove(b.verse_key)}>
                                                <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {items.length > 0 && visibleItems.length === 0 && (
                                <Card className="p-8 text-center text-slate-500">No bookmarks in this collection yet.</Card>
                            )}
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
