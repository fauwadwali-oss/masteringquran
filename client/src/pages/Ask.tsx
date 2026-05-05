import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Loader2, AlertCircle, Wrench, BookOpen, ScrollText, Search, Lightbulb, Lock, Library, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
    role: "user" | "assistant";
    content: string;
    tools?: string[];
}

const SUGGESTIONS = [
    { label: "Explain a verse", prompt: "Explain Ayat al-Kursi (Quran 2:255) with Ibn Kathir's commentary", icon: BookOpen },
    { label: "Search a theme", prompt: "What does the Quran say about mercy?", icon: Search },
    { label: "Summarize a surah", prompt: "Summarize Surah al-Fatiha with key lessons", icon: Sparkles },
    { label: "Find a hadith", prompt: "Find a hadith about the value of intentions", icon: ScrollText },
    { label: "Study context", prompt: "What is the Asbab al-Nuzul of Surah al-Ikhlas?", icon: Lightbulb },
];

const TOOL_LABELS: Record<string, string> = {
    get_verse: "reading a verse",
    search_quran: "searching the Quran",
    get_tafsir: "reading tafsir",
    get_hadith: "reading a hadith",
    search_hadith_collection: "searching hadith",
};

function AskInner() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages, loading]);

    const submit = async (userText: string) => {
        if (!userText.trim() || loading) return;
        setError(null);
        const nextHistory = [...messages, { role: "user" as const, content: userText }];
        setMessages([...nextHistory, { role: "assistant", content: "" }]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userText, history: messages }),
            });

            if (!res.ok || !res.body) {
                const errText = await res.text();
                throw new Error(errText || `Request failed (${res.status})`);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";
                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    const payload = line.slice(6).trim();
                    if (!payload) continue;
                    let evt: any;
                    try {
                        evt = JSON.parse(payload);
                    } catch {
                        continue;
                    }
                    if (evt.type === "text") {
                        setMessages((prev) => {
                            const copy = [...prev];
                            const last = copy[copy.length - 1];
                            if (last?.role === "assistant") {
                                copy[copy.length - 1] = { ...last, content: (last.content || "") + evt.text };
                            }
                            return copy;
                        });
                    } else if (evt.type === "tool_start") {
                        setMessages((prev) => {
                            const copy = [...prev];
                            const last = copy[copy.length - 1];
                            if (last?.role === "assistant") {
                                copy[copy.length - 1] = { ...last, tools: [...(last.tools || []), ...evt.tools] };
                            }
                            return copy;
                        });
                    } else if (evt.type === "error") {
                        throw new Error(evt.message || "Stream error");
                    }
                }
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg);
            // Drop the empty placeholder on failure
            setMessages((prev) => prev.filter((m, i) => !(i === prev.length - 1 && m.role === "assistant" && !m.content)));
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 font-sans">
            <SEO
                title="Ask AI - Mastering Quran"
                description="Ask questions about the Quran, hadith, and classical tafsir. AI-grounded answers with citations to verified sources."
            />

            <section className="max-w-3xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="text-center mb-6 space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Grounded in verified sources</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Ask AI
                    </h1>
                    <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
                        Questions about the Quran, hadith, or classical tafsir. Every answer is grounded in tool calls to authentic sources and cites them directly.
                    </p>
                </div>

                {/* Disclaimer banner */}
                <div className="mb-6 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p>
                        This is an AI assistant. It only answers questions about Quran, hadith, and classical tafsir, and will decline fiqh rulings or fatwas. Always verify with a qualified scholar.
                    </p>
                </div>

                {/* Empty state with suggestions */}
                {messages.length === 0 && (
                    <div className="space-y-3 mb-8">
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">Try one of these:</p>
                        <div className="grid sm:grid-cols-2 gap-2">
                            {SUGGESTIONS.map((s) => {
                                const Icon = s.icon;
                                return (
                                <button
                                    key={s.prompt}
                                    onClick={() => submit(s.prompt)}
                                    disabled={loading}
                                    className="text-left p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all disabled:opacity-50"
                                >
                                    <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                                        <Icon className="h-3.5 w-3.5" />
                                        {s.label}
                                    </span>
                                    {s.prompt}
                                </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {messages.length === 0 && (
                    <div className="mb-8 grid gap-3 sm:grid-cols-3">
                        <SourceCard title="Source cards" body="Tool calls show when Quran, tafsir, or hadith sources are being read." />
                        <SourceCard title="Continue studying" body="Every answer can lead into Quran reading, related topics, or share cards." />
                        <SourceCard title="Scope guard" body="Designed for Quran, hadith, and tafsir study rather than fatwa decisions." />
                    </div>
                )}

                {/* Messages */}
                <div className="space-y-4 mb-6">
                    {messages.map((m, i) => (
                        <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                            <div
                                className={
                                    m.role === "user"
                                        ? "max-w-[85%] px-4 py-3 rounded-2xl rounded-br-md bg-emerald-600 text-white shadow-sm"
                                        : "max-w-[92%] w-full px-5 py-4 rounded-2xl rounded-bl-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
                                }
                            >
                                {m.role === "assistant" && m.tools && m.tools.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {m.tools.map((t, j) => (
                                            <span key={j} className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-900/50">
                                                <Wrench className="h-3 w-3" />
                                                {TOOL_LABELS[t] || t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <p className={`whitespace-pre-wrap leading-relaxed ${m.role === "user" ? "text-[15px]" : "text-[15px] text-slate-800 dark:text-slate-200"}`}>
                                    {m.content || (m.role === "assistant" && loading && i === messages.length - 1 ? (
                                        <span className="inline-flex items-center gap-2 text-slate-500">
                                            <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                                        </span>
                                    ) : "")}
                                </p>
                                {m.role === "assistant" && m.content && (
                                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                                        <LinkButton to="/quran" label="Continue in Quran" />
                                        <LinkButton to="/topics" label="Related topics" />
                                        <LinkButton to="/share" label="Make a verse card" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium">Something went wrong.</p>
                            <p className="text-xs opacity-80 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Composer */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        submit(input);
                    }}
                    className="sticky bottom-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-2 flex items-end gap-2"
                >
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                submit(input);
                            }
                        }}
                        placeholder="Ask about a verse, a hadith, or a tafsir…"
                        rows={1}
                        disabled={loading}
                        className="flex-1 resize-none px-3 py-2 text-[15px] bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none min-h-[44px] max-h-36"
                    />
                    <Button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="h-11 w-11 shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                </form>

                <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-4">
                    Press Enter to send, Shift+Enter for a new line. AI-generated — verify with a qualified scholar for religious guidance.
                </p>
            </section>
        </div>
    );
}

function SourceCard({ title, body }: { title: string; body: string }) {
    return (
        <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 text-sm dark:border-emerald-900/40 dark:bg-slate-900/70">
            <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
            <p className="mt-1 leading-6 text-slate-600 dark:text-slate-400">{body}</p>
        </div>
    );
}

function LinkButton({ to, label }: { to: string; label: string }) {
    return (
        <a href={to} className="rounded-full border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950/40">
            {label}
        </a>
    );
}

export default function Ask() {
    const { user, loading, configured } = useAuth();
    const [showLogin, setShowLogin] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 font-sans">
                <SEO
                    title="Ask Quran AI with Cited Sources | Mastering Quran"
                    description="Preview the Mastering Quran AI assistant. Ask about Quran verses, hadith, and classical tafsir with answers grounded in verified sources."
                    canonicalPath="/ask"
                />
                <section className="max-w-5xl mx-auto px-6 py-14 md:py-20">
                    <div className="text-center space-y-4 mb-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Grounded in Quran, hadith, and tafsir</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Ask AI with cited sources
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                            Explore questions with an assistant designed to use verified Islamic sources, show what it checked, and avoid unsupported citations.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
                        <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-white dark:bg-slate-900 shadow-xl shadow-emerald-500/5 p-6 md:p-8 space-y-5">
                            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Example questions</p>
                            <div className="grid gap-3">
                                {SUGGESTIONS.map((suggestion) => {
                                    const Icon = suggestion.icon;
                                    return (
                                        <button
                                            key={suggestion.prompt}
                                            type="button"
                                            onClick={() => setShowLogin(true)}
                                            className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 transition-colors hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                                        >
                                            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                                                <Icon className="h-3.5 w-3.5" />
                                                {suggestion.label}
                                            </span>
                                            {suggestion.prompt}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 text-sm text-amber-800 dark:text-amber-300 flex gap-3">
                                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                <p>
                                    The assistant is for study support. It declines fatwas and sensitive rulings, and points you back to scholars for religious guidance.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-900 p-6 md:p-8 space-y-5">
                            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center">
                                <Lock className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Free sign-in unlocks Ask AI
                                </h2>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                    No password needed. Sign in with a magic link so your questions can run through the protected source-checking tools.
                                </p>
                            </div>
                            <div className="grid gap-3 text-sm">
                                <TrustRow icon={BookOpen} text="Checks Quran verses and tafsir before answering" />
                                <TrustRow icon={Library} text="Searches hadith collections when needed" />
                                <TrustRow icon={MessageCircle} text="Shows the source tools used in each answer" />
                            </div>
                            <Button
                                onClick={() => setShowLogin(true)}
                                disabled={!configured}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11"
                            >
                                Sign in to ask
                            </Button>
                            {!configured && (
                                <p className="text-xs text-amber-700 dark:text-amber-400">Auth is not configured yet. Please try again later.</p>
                            )}
                        </div>
                    </div>
                </section>
                <LoginModal open={showLogin} onClose={() => setShowLogin(false)} reason="Sign in to use the Ask AI assistant. Free forever — no password needed." />
            </div>
        );
    }

    return (
        <AskInner />
    );
}

function TrustRow({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
    return (
        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-950 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40">
                <Icon className="h-4 w-4" />
            </span>
            <span>{text}</span>
        </div>
    );
}
