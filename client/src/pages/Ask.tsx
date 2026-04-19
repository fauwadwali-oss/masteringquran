import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Loader2, AlertCircle, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";

interface Message {
    role: "user" | "assistant";
    content: string;
    tools?: string[];
}

const SUGGESTIONS = [
    "Explain Ayat al-Kursi (Quran 2:255) with Ibn Kathir's commentary",
    "What does the Quran say about mercy?",
    "Summarize Surah al-Fatiha",
    "Find a hadith about the value of intentions",
    "What is the Asbab al-Nuzul of Surah al-Ikhlas?",
];

const TOOL_LABELS: Record<string, string> = {
    get_verse: "reading a verse",
    search_quran: "searching the Quran",
    get_tafsir: "reading tafsir",
    get_hadith: "reading a hadith",
    search_hadith_collection: "searching hadith",
};

export default function Ask() {
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
                            {SUGGESTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => submit(s)}
                                    disabled={loading}
                                    className="text-left p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all disabled:opacity-50"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
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
