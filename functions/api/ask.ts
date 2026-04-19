// Cloudflare Pages Function — AI chat endpoint for /ask
// Streams Claude Haiku 4.5 responses over SSE with a hand-rolled tool-use loop
// that fetches grounding data from Quran.com API and our nwv-islamic-data mirror.

interface Env {
    ANTHROPIC_API_KEY: string;
    UMMAH_API_KEY?: string;
}

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

interface RequestBody {
    message: string;
    history?: ChatMessage[];
}

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";
const DATA_BASE = "https://cdn.jsdelivr.net/gh/fauwadwali-oss/nwv-islamic-data@main";
const UMMAH_BASE = "https://ummahapi.com/api";
const MAX_ITERATIONS = 6;
const MAX_TOKENS = 1500;

const SYSTEM_PROMPT = `You are a scholarly Islamic knowledge assistant for masteringquran.com. You help users explore the Quran, authentic hadith, and classical tafsir.

CRITICAL RULES:
1. Every factual claim about Quran, hadith, or tafsir MUST come from a tool call — never invent or recall from memory.
2. Always cite your sources. For Quran, use (Quran X:Y). For hadith, use (Collection #N). For tafsir, name the scholar.
3. Use translations returned by tools — never translate Arabic yourself.
4. SCOPE: Only answer questions about Quran text and meaning, hadith, and classical tafsir. Politely decline questions about fiqh rulings, fatwas, personal religious guidance, theological disputes, or matters of ijtihad. For those, say: "This question requires qualified scholarly guidance. Please consult a local imam or scholar."
5. Be reverent. Write "Allah ﷻ" for God, and "the Prophet ﷺ" when referring to Prophet Muhammad.
6. Keep answers concise — 2 to 4 paragraphs typically.
7. End every response with: "*AI-generated summary — verify with a qualified scholar for religious guidance.*"

Available English tafsir editions (for the get_tafsir tool):
- en-tafisr-ibn-kathir (Ibn Kathir, abridged — most popular)
- en-al-jalalayn (al-Jalalayn)
- en-tafsir-maarif-ul-quran (Ma'arif al-Quran by Mufti Shafi)
- en-tazkirul-quran (Tazkirul Quran by Wahiduddin Khan)
- en-tafsir-ibn-abbas, en-al-qushairi-tafsir, en-tafsir-al-tustari, en-kashani-tafsir, en-kashf-al-asrar-tafsir, en-asbab-al-nuzul-by-al-wahidi

Available hadith collections (for get_hadith and search_hadith_collection):
- bukhari, muslim, abudawud, tirmidhi, nasai, ibnmajah, malik, nawawi, qudsi, dehlawi

Additional tools (Islamic practice — use when user asks about daily religious routine):
- get_prayer_times: salah timings for a lat/lng (needs Hanafi/Shafi madhab; defaults to MuslimWorldLeague calculation method)
- get_hijri_today: today's Hijri date and any Islamic event that falls on it
- get_duas_by_category: supplications from Quran and Sunnah (27 categories like morning, evening, wudu, travel, food, sleep, etc.)
- get_99_names: the Asma ul-Husna (fetch a specific name by number 1–99 or search by English meaning)

Always call tools before making claims. If you can't find good sources, say so honestly.`;

const TOOLS = [
    {
        name: "get_verse",
        description: "Fetch a single Quran verse with Arabic text, English translation (Yusuf Ali), and Latin transliteration.",
        input_schema: {
            type: "object",
            properties: {
                surah: { type: "integer", description: "Surah number 1-114", minimum: 1, maximum: 114 },
                ayah: { type: "integer", description: "Ayah number within the surah", minimum: 1 },
            },
            required: ["surah", "ayah"],
        },
    },
    {
        name: "search_quran",
        description: "Full-text search across the Quran and translations. Returns up to 10 matching verses.",
        input_schema: {
            type: "object",
            properties: {
                query: { type: "string", description: "English keywords or Arabic text to search for" },
            },
            required: ["query"],
        },
    },
    {
        name: "get_tafsir",
        description: "Fetch classical tafsir commentary on a specific verse from one of the 10 English editions.",
        input_schema: {
            type: "object",
            properties: {
                edition: {
                    type: "string",
                    description: "Tafsir edition slug. Default to 'en-tafisr-ibn-kathir' unless asked otherwise.",
                },
                surah: { type: "integer", minimum: 1, maximum: 114 },
                ayah: { type: "integer", minimum: 1 },
            },
            required: ["edition", "surah", "ayah"],
        },
    },
    {
        name: "get_hadith",
        description: "Fetch a specific hadith by collection slug and hadith number.",
        input_schema: {
            type: "object",
            properties: {
                collection: {
                    type: "string",
                    description: "Collection slug: bukhari, muslim, abudawud, tirmidhi, nasai, ibnmajah, malik, nawawi, qudsi, or dehlawi",
                },
                hadith_number: { type: "integer", minimum: 1 },
            },
            required: ["collection", "hadith_number"],
        },
    },
    {
        name: "search_hadith_collection",
        description: "Search for hadith within a specific collection by keyword. Returns up to 5 matches.",
        input_schema: {
            type: "object",
            properties: {
                collection: {
                    type: "string",
                    description: "Collection slug: bukhari, muslim, abudawud, tirmidhi, nasai, ibnmajah, malik, nawawi, qudsi, or dehlawi",
                },
                query: { type: "string", description: "Keyword to search within the collection's hadith text" },
            },
            required: ["collection", "query"],
        },
    },
    {
        name: "get_prayer_times",
        description: "Fetch the five daily prayer times (plus imsak and sunrise) for a given latitude/longitude. Returns times in the local timezone of the coordinates.",
        input_schema: {
            type: "object",
            properties: {
                latitude: { type: "number", description: "Latitude between -90 and 90" },
                longitude: { type: "number", description: "Longitude between -180 and 180" },
                madhab: { type: "string", description: "Hanafi (later Asr) or Shafi (earlier Asr). Default: Shafi.", enum: ["Hanafi", "Shafi"] },
                method: { type: "string", description: "Calculation method. Common: MuslimWorldLeague, ISNA, Egyptian, Karachi, UmmAlQura. Default: MuslimWorldLeague." },
            },
            required: ["latitude", "longitude"],
        },
    },
    {
        name: "get_hijri_today",
        description: "Get today's Hijri date and any Islamic event or holy day that falls on it.",
        input_schema: {
            type: "object",
            properties: {},
        },
    },
    {
        name: "get_duas_by_category",
        description: "Fetch authentic supplications (duas) from Quran and Sunnah for a specific category. Returns Arabic, transliteration, translation, and source references.",
        input_schema: {
            type: "object",
            properties: {
                category: {
                    type: "string",
                    description: "Category ID. Examples: morning, evening, wudu, prayer, after_prayer, sleep, food, travel, home, rain, distress, forgiveness, protection, healing.",
                },
                limit: { type: "integer", description: "Max duas to return (default 3, max 10)", minimum: 1, maximum: 10 },
            },
            required: ["category"],
        },
    },
    {
        name: "get_99_names",
        description: "Fetch the Asma ul-Husna (99 Names of Allah). Pass 'number' for a specific name by position (1-99), or pass 'search' for English-meaning keyword lookup. Returns Arabic, transliteration, English, and meaning.",
        input_schema: {
            type: "object",
            properties: {
                number: { type: "integer", description: "Position of the name (1-99)", minimum: 1, maximum: 99 },
                search: { type: "string", description: "Search the Arabic transliteration or English meaning" },
            },
        },
    },
];

// ──────────────────────────── Tool implementations ────────────────────────────

const ummahHeaders = (env: Env): HeadersInit =>
    env.UMMAH_API_KEY ? { "X-API-Key": env.UMMAH_API_KEY } : {};

async function executeTool(name: string, input: Record<string, unknown>, env: Env): Promise<unknown> {
    try {
        if (name === "get_verse") {
            const { surah, ayah } = input as { surah: number; ayah: number };
            const r = await fetch(
                `https://api.quran.com/api/v4/verses/by_key/${surah}:${ayah}?translations=22,57&language=en&fields=text_uthmani`,
            );
            if (!r.ok) return { error: `Verse ${surah}:${ayah} not found` };
            const d = (await r.json()) as any;
            const v = d.verse;
            const yusufAli = v.translations?.find((t: any) => t.resource_id === 22)?.text;
            const translit = v.translations?.find((t: any) => t.resource_id === 57)?.text;
            return {
                reference: v.verse_key,
                arabic: v.text_uthmani,
                english_yusuf_ali: cleanHtml(yusufAli || ""),
                transliteration: cleanHtml(translit || ""),
            };
        }

        if (name === "search_quran") {
            const { query } = input as { query: string };
            const r = await fetch(
                `https://api.quran.com/api/v4/search?q=${encodeURIComponent(query)}&size=10&language=en`,
            );
            const d = (await r.json()) as any;
            const results = (d.search?.results || []).slice(0, 10).map((m: any) => ({
                reference: m.verse_key,
                arabic: m.text,
                english: cleanHtml(m.translations?.[0]?.text || ""),
            }));
            return { total_results: d.search?.total_results, results };
        }

        if (name === "get_tafsir") {
            const { edition, surah, ayah } = input as { edition: string; surah: number; ayah: number };
            const r = await fetch(`${DATA_BASE}/tafsir/${edition}/${surah}/${ayah}.json`);
            if (!r.ok) return { error: `No ${edition} commentary for ${surah}:${ayah}` };
            const d = (await r.json()) as any;
            return {
                edition,
                reference: `${surah}:${ayah}`,
                text: cleanHtml(d.text || "").slice(0, 3000),
            };
        }

        if (name === "get_hadith") {
            const { collection, hadith_number } = input as { collection: string; hadith_number: number };
            const r = await fetch(`${DATA_BASE}/hadith/editions/eng-${collection}/${hadith_number}.min.json`);
            if (!r.ok) return { error: `Hadith #${hadith_number} not found in ${collection}` };
            const d = (await r.json()) as any;
            const h = d.hadiths?.[0];
            if (!h) return { error: "No hadith in response" };
            return {
                collection: d.metadata?.name || collection,
                hadith_number: h.hadithnumber,
                reference: h.reference,
                text: h.text,
                grades: h.grades,
            };
        }

        if (name === "search_hadith_collection") {
            const { collection, query } = input as { collection: string; query: string };
            const r = await fetch(`${DATA_BASE}/hadith/editions/eng-${collection}.min.json`);
            if (!r.ok) return { error: `Collection ${collection} not found` };
            const d = (await r.json()) as any;
            const q = query.toLowerCase();
            const matches = (d.hadiths || [])
                .filter((h: any) => h.text?.toLowerCase().includes(q))
                .slice(0, 5)
                .map((h: any) => ({
                    hadith_number: h.hadithnumber,
                    reference: h.reference,
                    text: String(h.text).slice(0, 800),
                }));
            return { collection: d.metadata?.name || collection, matches_count: matches.length, matches };
        }

        if (name === "get_prayer_times") {
            const { latitude, longitude, madhab = "Shafi", method = "MuslimWorldLeague" } = input as {
                latitude: number; longitude: number; madhab?: string; method?: string;
            };
            const url = `${UMMAH_BASE}/prayer-times?latitude=${latitude}&longitude=${longitude}&madhab=${encodeURIComponent(madhab)}&method=${encodeURIComponent(method)}`;
            const r = await fetch(url, { headers: ummahHeaders(env) });
            if (!r.ok) return { error: `Prayer times lookup failed (${r.status})` };
            const d = (await r.json()) as any;
            const data = d.data || d;
            return {
                date: data.date,
                timezone: data.timezone,
                location: data.location,
                calculation_method: data.calculation_method,
                madhab: data.madhab,
                prayer_times: data.prayer_times,
            };
        }

        if (name === "get_hijri_today") {
            const r = await fetch(`${UMMAH_BASE}/today-hijri`, { headers: ummahHeaders(env) });
            if (!r.ok) return { error: `Hijri date lookup failed (${r.status})` };
            const d = (await r.json()) as any;
            return d.data || d;
        }

        if (name === "get_duas_by_category") {
            const { category, limit = 3 } = input as { category: string; limit?: number };
            const url = `${UMMAH_BASE}/duas/category/${encodeURIComponent(category)}?limit=${Math.min(limit, 10)}`;
            const r = await fetch(url, { headers: ummahHeaders(env) });
            if (!r.ok) return { error: `Dua category '${category}' not found` };
            const d = (await r.json()) as any;
            const data = d.data || d;
            return {
                category: data.category,
                total: data.total,
                duas: (data.duas || []).map((du: any) => ({
                    title: du.title,
                    arabic: du.arabic,
                    transliteration: du.transliteration,
                    translation: du.translation,
                    source: du.source,
                    repeat: du.repeat,
                })),
            };
        }

        if (name === "get_99_names") {
            const { number, search } = input as { number?: number; search?: string };
            if (typeof number === "number") {
                const r = await fetch(`${UMMAH_BASE}/asma-ul-husna/${number}`, { headers: ummahHeaders(env) });
                if (!r.ok) return { error: `Name #${number} not found` };
                const d = (await r.json()) as any;
                return d.data?.name || d.data || d;
            }
            if (search) {
                const r = await fetch(`${UMMAH_BASE}/asma-ul-husna/search?q=${encodeURIComponent(search)}`, { headers: ummahHeaders(env) });
                if (!r.ok) return { error: `Name search failed (${r.status})` };
                const d = (await r.json()) as any;
                return d.data || d;
            }
            // Neither number nor search — return all 99 names (brief)
            const r = await fetch(`${UMMAH_BASE}/asma-ul-husna`, { headers: ummahHeaders(env) });
            if (!r.ok) return { error: `Names list failed (${r.status})` };
            const d = (await r.json()) as any;
            const names = Array.isArray(d.data) ? d.data : d.data?.names || [];
            return { count: names.length, names };
        }

        return { error: `Unknown tool: ${name}` };
    } catch (err) {
        return { error: `Tool ${name} failed: ${err instanceof Error ? err.message : String(err)}` };
    }
}

const cleanHtml = (s: string): string =>
    (s || "").replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]+>/g, "").trim();

// ────────────────────────── Anthropic streaming client ──────────────────────────

interface ContentBlock {
    type: "text" | "tool_use";
    text?: string;
    id?: string;
    name?: string;
    input?: Record<string, unknown>;
}

async function callClaude(
    apiKey: string,
    messages: any[],
    onTextDelta: (text: string) => void,
): Promise<{ assistantContent: ContentBlock[]; stopReason: string }> {
    const body = {
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: [
            {
                type: "text",
                text: SYSTEM_PROMPT,
                cache_control: { type: "ephemeral" },
            },
        ],
        tools: TOOLS,
        messages,
        stream: true,
    };

    const res = await fetch(ANTHROPIC_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
        const errText = await res.text();
        throw new Error(`Anthropic API error ${res.status}: ${errText.slice(0, 400)}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    const blocks: ContentBlock[] = [];
    let stopReason = "end_turn";
    let partialJson = "";

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (!data || data === "[DONE]") continue;
            let evt: any;
            try {
                evt = JSON.parse(data);
            } catch {
                continue;
            }

            if (evt.type === "content_block_start") {
                const cb = evt.content_block;
                if (cb.type === "text") {
                    blocks[evt.index] = { type: "text", text: "" };
                } else if (cb.type === "tool_use") {
                    blocks[evt.index] = { type: "tool_use", id: cb.id, name: cb.name, input: {} };
                    partialJson = "";
                }
            } else if (evt.type === "content_block_delta") {
                const delta = evt.delta;
                if (delta.type === "text_delta") {
                    const block = blocks[evt.index];
                    if (block && block.type === "text") {
                        block.text = (block.text || "") + delta.text;
                    }
                    onTextDelta(delta.text);
                } else if (delta.type === "input_json_delta") {
                    partialJson += delta.partial_json;
                }
            } else if (evt.type === "content_block_stop") {
                const block = blocks[evt.index];
                if (block && block.type === "tool_use") {
                    try {
                        block.input = partialJson ? JSON.parse(partialJson) : {};
                    } catch {
                        block.input = {};
                    }
                    partialJson = "";
                }
            } else if (evt.type === "message_delta") {
                if (evt.delta?.stop_reason) stopReason = evt.delta.stop_reason;
            } else if (evt.type === "error") {
                throw new Error(evt.error?.message || "Anthropic stream error");
            }
        }
    }

    return { assistantContent: blocks.filter(Boolean), stopReason };
}

// ──────────────────────────────── Entrypoint ────────────────────────────────

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    if (!env.ANTHROPIC_API_KEY) {
        return new Response(
            JSON.stringify({ error: "ANTHROPIC_API_KEY not configured on the server." }),
            { status: 503, headers: { "Content-Type": "application/json" } },
        );
    }

    let body: RequestBody;
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const userMessage = (body.message || "").trim();
    if (!userMessage) {
        return new Response(JSON.stringify({ error: "Empty message" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const history = (body.history || []).slice(-10);
    const messages: any[] = history.map((m) => ({ role: m.role, content: m.content }));
    messages.push({ role: "user", content: userMessage });

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    const send = (obj: any) => writer.write(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

    (async () => {
        try {
            for (let i = 0; i < MAX_ITERATIONS; i++) {
                const { assistantContent, stopReason } = await callClaude(
                    env.ANTHROPIC_API_KEY,
                    messages,
                    (text) => send({ type: "text", text }),
                );

                if (stopReason === "tool_use" || assistantContent.some((b) => b.type === "tool_use")) {
                    messages.push({ role: "assistant", content: assistantContent });
                    const toolUses = assistantContent.filter((b) => b.type === "tool_use");
                    send({ type: "tool_start", tools: toolUses.map((t) => t.name) });

                    const toolResults = await Promise.all(
                        toolUses.map(async (t) => ({
                            type: "tool_result",
                            tool_use_id: t.id!,
                            content: JSON.stringify(await executeTool(t.name!, t.input || {}, env)),
                        })),
                    );

                    messages.push({ role: "user", content: toolResults });
                    continue;
                }

                break;
            }
            send({ type: "done" });
        } catch (err) {
            send({ type: "error", message: err instanceof Error ? err.message : String(err) });
        } finally {
            writer.close();
        }
    })();

    return new Response(readable, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
};
