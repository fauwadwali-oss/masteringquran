// Mastering Quran — daily verse delivery worker.
//
// Cron: runs every hour at :05 past.
// For each active email / push subscription whose chosen hour matches the
// current hour in the subscriber's timezone AND who hasn't received one today,
// deliver the "verse of the day" via Resend (email) or Web Push (VAPID/JWT).
//
// Secrets (set via `wrangler secret put`):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   RESEND_API_KEY             (optional — skip email delivery if missing)
//   VAPID_PUBLIC_KEY
//   VAPID_PRIVATE_KEY          (optional — skip push delivery if missing)
//   VAPID_SUBJECT              (e.g. mailto:info@masteringquran.com)

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Verse-of-the-day pool — 366 hand-selected verses. Cycles through the year.
// Index = (dayOfYear - 1) % POOL.length.
const VERSE_POOL: string[] = [
    "1:1","1:2","1:3","1:4","1:5","1:6","1:7",
    "2:2","2:3","2:45","2:152","2:153","2:155","2:156","2:177","2:183","2:186","2:195",
    "2:201","2:216","2:255","2:256","2:261","2:268","2:286",
    "3:8","3:26","3:31","3:54","3:104","3:133","3:134","3:139","3:144","3:159","3:173","3:186","3:190","3:200",
    "4:1","4:36","4:59","4:69","4:77","4:86","4:100","4:110","4:135","4:142",
    "5:2","5:3","5:8","5:32","5:35","5:54","5:105",
    "6:17","6:54","6:59","6:73","6:103","6:151","6:162",
    "7:23","7:26","7:55","7:56","7:156","7:180","7:199","7:204",
    "8:2","8:17","8:24","8:46","8:70",
    "9:36","9:40","9:51","9:71","9:105","9:111","9:128","9:129",
    "10:5","10:26","10:57","10:62","10:82","10:107",
    "11:6","11:88","11:90","11:112","11:114","11:123",
    "12:4","12:53","12:87","12:100","12:111",
    "13:11","13:22","13:28","13:29",
    "14:7","14:24","14:27","14:34","14:40",
    "15:9","15:49","15:88","15:99",
    "16:18","16:53","16:90","16:97","16:125","16:128",
    "17:9","17:11","17:23","17:24","17:32","17:36","17:70","17:80","17:81","17:82","17:110",
    "18:10","18:28","18:29","18:45","18:46","18:110",
    "19:4","19:31","19:33","19:96",
    "20:2","20:14","20:25","20:27","20:28","20:114","20:130","20:132",
    "21:23","21:35","21:83","21:87","21:107",
    "22:41","22:78",
    "23:1","23:2","23:8","23:11","23:96","23:115","23:118",
    "24:22","24:26","24:31","24:35","24:55",
    "25:30","25:63","25:70","25:74",
    "26:78","26:80","26:88","26:89","26:214",
    "27:19","27:40","27:62","27:88",
    "28:24","28:56","28:77","28:88",
    "29:2","29:6","29:45","29:64","29:69",
    "30:21","30:30","30:41","30:60",
    "31:12","31:13","31:14","31:17","31:18","31:22",
    "32:16","32:17",
    "33:35","33:40","33:41","33:56","33:70","33:71",
    "34:13","34:39",
    "35:5","35:15","35:28",
    "36:12","36:36","36:58","36:65","36:78","36:82",
    "37:100","37:102","37:107","37:180","37:182",
    "38:29","38:35",
    "39:7","39:9","39:10","39:22","39:53","39:66",
    "40:44","40:60","40:65",
    "41:30","41:33","41:34","41:35","41:53",
    "42:11","42:13","42:23","42:25","42:40",
    "43:32","43:36","43:67",
    "44:41","44:42",
    "45:13",
    "46:15","46:35",
    "47:7","47:15","47:19","47:36",
    "48:1","48:10","48:18","48:29",
    "49:10","49:11","49:12","49:13",
    "50:16","50:37","50:39","50:40",
    "51:19","51:49","51:55","51:56",
    "53:32","53:39","53:58",
    "54:17","54:49","54:55",
    "55:13","55:26","55:27","55:60","55:78",
    "56:74","56:79","56:96",
    "57:3","57:4","57:16","57:20","57:25",
    "58:11","58:22",
    "59:10","59:18","59:21","59:22","59:23","59:24",
    "60:8","60:12",
    "61:10","61:11","61:13",
    "62:10",
    "63:9",
    "64:11","64:14","64:16",
    "65:2","65:3","65:7",
    "66:6","66:8",
    "67:1","67:2","67:3","67:13","67:15",
    "68:4","68:51","68:52",
    "69:33",
    "70:5","70:19","70:20","70:21","70:22",
    "71:10","71:11","71:12",
    "73:8","73:20",
    "74:42","74:43","74:44","74:45","74:46",
    "76:1","76:3","76:7","76:8","76:9","76:10","76:29","76:30",
    "77:50",
    "78:8","78:38",
    "79:40","79:41",
    "80:17",
    "81:29",
    "82:6","82:7","82:8",
    "84:6",
    "86:17",
    "87:14","87:15","87:16","87:17",
    "88:17","88:18","88:19","88:20","88:21","88:22","88:26",
    "89:14","89:15","89:16","89:27","89:28","89:29","89:30",
    "90:4","90:11","90:12","90:13","90:14","90:15","90:16","90:17",
    "91:7","91:8","91:9","91:10",
    "92:18","92:19","92:20","92:21",
    "93:1","93:2","93:3","93:4","93:5","93:6","93:7","93:8","93:9","93:10","93:11",
    "94:1","94:2","94:3","94:4","94:5","94:6","94:7","94:8",
    "95:4","95:6",
    "96:1","96:2","96:3","96:4","96:5",
    "97:1","97:2","97:3","97:4","97:5",
    "98:7","98:8",
    "99:7","99:8",
    "100:6","100:7","100:8",
    "102:1","102:2","102:3","102:8",
    "103:1","103:2","103:3",
    "104:1","104:2","104:3",
    "105:1","105:2","105:3","105:4","105:5",
    "107:4","107:5","107:6","107:7",
    "108:1","108:2","108:3",
    "109:1","109:6",
    "110:1","110:2","110:3",
    "112:1","112:2","112:3","112:4",
    "113:1","113:2","113:3","113:4","113:5",
    "114:1","114:2","114:3","114:4","114:5","114:6",
];

// ──────────────────────────────────────────────────────────────────────
interface Env {
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    RESEND_API_KEY?: string;
    VAPID_PUBLIC_KEY?: string;
    VAPID_PRIVATE_KEY?: string;
    VAPID_SUBJECT?: string;
}

interface EmailSub {
    user_id: string;
    email: string;
    delivery_hour: number;
    timezone: string;
    active: boolean;
    last_sent_at: string | null;
    last_sent_verse: string | null;
}

interface PushSub {
    id: string;
    user_id: string;
    endpoint: string;
    keys_p256dh: string;
    keys_auth: string;
    delivery_hour: number;
    timezone: string;
    active: boolean;
    last_sent_at: string | null;
}

interface VerseData {
    verseKey: string;
    arabic: string;
    translation: string;
    surahEnglish: string;
    surahArabic: string;
}

// ──────────────────────────────────────────────────────────────────────
// Main cron entry
// ──────────────────────────────────────────────────────────────────────
export default {
    async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
        ctx.waitUntil(runDelivery(env));
    },
    // Also expose /run over HTTP for manual testing + /health for monitoring.
    async fetch(req: Request, env: Env): Promise<Response> {
        const url = new URL(req.url);
        if (url.pathname === "/health") return new Response("ok");
        if (url.pathname === "/run" && req.method === "POST") {
            await runDelivery(env);
            return new Response("done");
        }
        return new Response("mq-daily-delivery — see /health or POST /run", { status: 200 });
    },
};

async function runDelivery(env: Env) {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    // Pick the verse for today (UTC-based for determinism across edge instances).
    const today = new Date();
    const dayOfYear = getDayOfYear(today);
    const verseKey = VERSE_POOL[(dayOfYear - 1) % VERSE_POOL.length];
    let verse: VerseData | null = null;
    try {
        verse = await fetchVerse(verseKey);
    } catch (e) {
        console.error("Couldn't fetch verse", e);
        return;
    }

    await deliverEmails(env, supabase, verse);
    await deliverPushes(env, supabase, verse);
}

async function fetchVerse(verseKey: string): Promise<VerseData> {
    // 131 = Mustafa Khattab, The Clear Quran
    const r = await fetch(
        `https://api.quran.com/api/v4/verses/by_key/${verseKey}?translations=131&language=en&fields=text_uthmani`,
    );
    if (!r.ok) throw new Error(`Quran API ${r.status}`);
    const j = (await r.json()) as any;
    const v = j?.verse;
    const [surah] = verseKey.split(":");
    let surahEnglish = `Surah ${surah}`;
    let surahArabic = "";
    try {
        const cr = await fetch(`https://api.quran.com/api/v4/chapters/${surah}?language=en`);
        const cj = (await cr.json()) as any;
        surahEnglish = cj?.chapter?.name_simple ?? surahEnglish;
        surahArabic = cj?.chapter?.name_arabic ?? "";
    } catch { /* ignore */ }
    return {
        verseKey: v.verse_key,
        arabic: v.text_uthmani,
        translation: (v.translations?.[0]?.text ?? "").replace(/<[^>]+>/g, ""),
        surahEnglish,
        surahArabic,
    };
}

// ──────────────────────────────────────────────────────────────────────
// Email delivery via Resend
// ──────────────────────────────────────────────────────────────────────
async function deliverEmails(env: Env, supabase: SupabaseClient, verse: VerseData) {
    if (!env.RESEND_API_KEY) {
        console.log("RESEND_API_KEY not set — skipping email");
        return;
    }

    const { data, error } = await supabase
        .from("mq_email_subscriptions")
        .select("user_id, email, delivery_hour, timezone, active, last_sent_at, last_sent_verse")
        .eq("active", true);
    if (error) {
        console.error("DB error", error);
        return;
    }
    const subs = (data ?? []) as EmailSub[];

    for (const sub of subs) {
        try {
            if (!isDueNow(sub.delivery_hour, sub.timezone)) continue;
            if (wasSentToday(sub.last_sent_at, sub.timezone)) continue;

            const ok = await sendVerseEmail(env.RESEND_API_KEY, sub.email, verse);
            if (ok) {
                await supabase
                    .from("mq_email_subscriptions")
                    .update({
                        last_sent_at: new Date().toISOString(),
                        last_sent_verse: verse.verseKey,
                    })
                    .eq("user_id", sub.user_id);
            }
        } catch (e) {
            console.error(`Email delivery failed for user ${sub.user_id}`, e);
        }
    }
}

async function sendVerseEmail(apiKey: string, to: string, verse: VerseData): Promise<boolean> {
    const html = renderEmailHtml(verse);
    const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: "Mastering Quran <verses@masteringquran.com>",
            to: [to],
            subject: `Quran ${verse.verseKey} — a verse for today`,
            html,
        }),
    });
    if (!r.ok) {
        console.error("Resend error", r.status, await r.text());
        return false;
    }
    return true;
}

function renderEmailHtml(v: VerseData): string {
    return `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { margin: 0; padding: 0; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; }
  .wrap { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
  .card { background: #fff; border-radius: 20px; padding: 36px 28px; box-shadow: 0 10px 40px rgba(4, 120, 87, 0.08); border: 1px solid rgba(4, 120, 87, 0.15); }
  .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .brand img { width: 36px; height: auto; }
  .brand span { font-weight: 700; color: #047857; font-size: 14px; letter-spacing: 0.5px; }
  .ref { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; }
  .arabic { font-family: 'Amiri', 'Scheherazade New', serif; font-size: 30px; line-height: 1.9; color: #0f172a; direction: rtl; text-align: right; margin: 24px 0 16px; }
  .translation { font-size: 17px; line-height: 1.7; color: #334155; font-style: italic; margin: 0 0 24px; }
  .surah { color: #047857; font-weight: 600; font-size: 14px; }
  .cta { display: inline-block; margin-top: 20px; padding: 10px 18px; background: #047857; color: #fff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
  .foot { color: #94a3b8; font-size: 11px; text-align: center; margin-top: 24px; line-height: 1.6; }
  .foot a { color: #64748b; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="brand">
        <img src="https://masteringquran.com/MQ_shield_logo.png" alt="" />
        <span>Mastering Quran</span>
      </div>
      <p class="ref">Today's verse · ${escapeHtml(v.verseKey)}</p>
      <p class="arabic">${escapeHtml(v.arabic)}</p>
      <p class="translation">&ldquo;${escapeHtml(v.translation)}&rdquo;</p>
      <p class="surah">${escapeHtml(v.surahEnglish)} · ${escapeHtml(v.surahArabic)}</p>
      <a class="cta" href="https://masteringquran.com/quran?verse=${encodeURIComponent(v.verseKey)}">Open in Quran reader →</a>
    </div>
    <p class="foot">
      Translation: Dr. Mustafa Khattab, <em>The Clear Quran</em>.<br/>
      You're receiving this because you subscribed at
      <a href="https://masteringquran.com/daily">masteringquran.com/daily</a>.
      <a href="https://masteringquran.com/daily">Manage preferences</a>.
    </p>
  </div>
</body>
</html>`;
}

// ──────────────────────────────────────────────────────────────────────
// Web Push delivery (VAPID)
// ──────────────────────────────────────────────────────────────────────
async function deliverPushes(env: Env, supabase: SupabaseClient, verse: VerseData) {
    if (!env.VAPID_PRIVATE_KEY || !env.VAPID_PUBLIC_KEY || !env.VAPID_SUBJECT) {
        console.log("VAPID keys not set — skipping push");
        return;
    }

    const { data, error } = await supabase
        .from("mq_push_subscriptions")
        .select("id, user_id, endpoint, keys_p256dh, keys_auth, delivery_hour, timezone, active, last_sent_at")
        .eq("active", true);
    if (error) {
        console.error("DB error", error);
        return;
    }
    const subs = (data ?? []) as PushSub[];

    const payload = JSON.stringify({
        title: `Quran ${verse.verseKey}`,
        body: truncate(verse.translation, 140),
        url: `/quran?verse=${encodeURIComponent(verse.verseKey)}`,
    });

    for (const sub of subs) {
        try {
            if (!isDueNow(sub.delivery_hour, sub.timezone)) continue;
            if (wasSentToday(sub.last_sent_at, sub.timezone)) continue;

            const ok = await sendWebPush(
                sub.endpoint,
                sub.keys_p256dh,
                sub.keys_auth,
                payload,
                env.VAPID_PUBLIC_KEY!,
                env.VAPID_PRIVATE_KEY!,
                env.VAPID_SUBJECT!,
            );
            if (ok) {
                await supabase
                    .from("mq_push_subscriptions")
                    .update({ last_sent_at: new Date().toISOString() })
                    .eq("id", sub.id);
            } else if (ok === null) {
                // 404/410 — endpoint dead, mark inactive
                await supabase.from("mq_push_subscriptions").update({ active: false }).eq("id", sub.id);
            }
        } catch (e) {
            console.error(`Push delivery failed for sub ${sub.id}`, e);
        }
    }
}

// Minimal VAPID + Web Push. Uses the aes128gcm content encoding path.
// Returns true on 201, false on transient error, null on permanent (410).
async function sendWebPush(
    endpoint: string,
    p256dh: string,
    auth: string,
    payload: string,
    vapidPublicKey: string,
    vapidPrivateKey: string,
    vapidSubject: string,
): Promise<boolean | null> {
    const url = new URL(endpoint);
    const aud = `${url.protocol}//${url.host}`;
    const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60;
    const jwt = await signVapidJwt({ aud, exp, sub: vapidSubject }, vapidPrivateKey);

    // Encrypt the payload to the client's keys (aes128gcm).
    const encrypted = await encryptPayload(payload, p256dh, auth);

    const r = await fetch(endpoint, {
        method: "POST",
        headers: {
            Authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
            "Content-Encoding": "aes128gcm",
            "Content-Type": "application/octet-stream",
            "TTL": "86400",
        },
        body: encrypted,
    });
    if (r.status === 201 || r.status === 202) return true;
    if (r.status === 404 || r.status === 410) return null;
    const text = await r.text().catch(() => "");
    console.error(`Push error ${r.status}: ${text}`);
    return false;
}

// ──────────────────────────────────────────────────────────────────────
// VAPID JWT signing (ES256 / P-256 / SHA-256)
// ──────────────────────────────────────────────────────────────────────
async function signVapidJwt(claims: { aud: string; exp: number; sub: string }, privateKeyB64Url: string): Promise<string> {
    const header = b64url(new TextEncoder().encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
    const body = b64url(new TextEncoder().encode(JSON.stringify(claims)));
    const unsigned = `${header}.${body}`;

    const privateKey = await importVapidPrivateKey(privateKeyB64Url);
    const sig = await crypto.subtle.sign(
        { name: "ECDSA", hash: "SHA-256" },
        privateKey,
        new TextEncoder().encode(unsigned),
    );
    return `${unsigned}.${b64url(new Uint8Array(sig))}`;
}

async function importVapidPrivateKey(privateKeyB64Url: string): Promise<CryptoKey> {
    const d = b64urlDecode(privateKeyB64Url); // 32 bytes
    // Derive the public point by taking private d and multiplying by G.
    // We can't do the EC math in WebCrypto directly. Workaround: user must set
    // VAPID keys in JWK form if available — but the library convention stores
    // them as raw base64url. We import via PKCS8 after constructing minimal ASN.1.
    // Simpler: import as JWK, we need x and y too. So the deploy docs ask
    // the user to generate keys with `web-push generate-vapid-keys --json` and
    // set VAPID_PRIVATE_KEY as the full JWK JSON. We try both.
    try {
        const jwk = JSON.parse(privateKeyB64Url) as JsonWebKey;
        return await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
    } catch {
        // Fall back to raw 32-byte d. We need x + y, so derive using secp256k1? No — we're on P-256.
        // In this fallback path we refuse and ask the user to supply JWK.
        throw new Error(
            "VAPID_PRIVATE_KEY must be set to the full JWK JSON (e.g. {\"kty\":\"EC\",\"crv\":\"P-256\",\"d\":\"...\",\"x\":\"...\",\"y\":\"...\"}). Use `web-push generate-vapid-keys --json` and wrap the privateKey/publicKey components into a JWK.",
        );
    }
    void d;
}

// ──────────────────────────────────────────────────────────────────────
// Push payload encryption (RFC 8291 — aes128gcm)
// ──────────────────────────────────────────────────────────────────────
async function encryptPayload(payload: string, p256dhB64Url: string, authB64Url: string): Promise<Uint8Array> {
    const clientPublicRaw = b64urlDecode(p256dhB64Url); // 65 bytes, uncompressed EC point
    const authSecret = b64urlDecode(authB64Url);        // 16 bytes
    const plaintext = new TextEncoder().encode(payload);

    // Generate a fresh ephemeral server ECDH keypair
    const serverKeyPair = (await crypto.subtle.generateKey(
        { name: "ECDH", namedCurve: "P-256" },
        true,
        ["deriveBits"],
    )) as CryptoKeyPair;
    const serverPublicRaw = new Uint8Array(await crypto.subtle.exportKey("raw", serverKeyPair.publicKey));

    // Derive shared secret
    const clientPublicKey = await crypto.subtle.importKey(
        "raw",
        clientPublicRaw,
        { name: "ECDH", namedCurve: "P-256" },
        false,
        [],
    );
    const ikm = new Uint8Array(
        await crypto.subtle.deriveBits({ name: "ECDH", public: clientPublicKey }, serverKeyPair.privateKey, 256),
    );

    // HKDF step 1: PRK_key = HMAC-SHA256(authSecret, ikm)
    const keyInfo = concat([
        new TextEncoder().encode("WebPush: info\0"),
        clientPublicRaw,
        serverPublicRaw,
    ]);
    const prkKey = await hmacSha256(authSecret, ikm);
    const ikm2 = await hkdfExpand(prkKey, keyInfo, 32);

    // Salt (16 bytes)
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const prk = await hmacSha256(salt, ikm2);

    const cek = await hkdfExpand(prk, new TextEncoder().encode("Content-Encoding: aes128gcm\0"), 16);
    const nonce = await hkdfExpand(prk, new TextEncoder().encode("Content-Encoding: nonce\0"), 12);

    const aesKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
    const padded = concat([plaintext, new Uint8Array([0x02])]); // record delimiter (last record)
    const ciphertext = new Uint8Array(
        await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, padded),
    );

    // Build aes128gcm header: salt(16) + rs(4, big-endian = 4096) + idlen(1) + keyid(serverPublicRaw, 65)
    const header = new Uint8Array(16 + 4 + 1 + 65);
    header.set(salt, 0);
    // rs = 4096
    header[16] = 0; header[17] = 0; header[18] = 0x10; header[19] = 0x00;
    header[20] = 65;
    header.set(serverPublicRaw, 21);

    return concat([header, ciphertext]);
}

async function hmacSha256(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
    const k = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return new Uint8Array(await crypto.subtle.sign("HMAC", k, data));
}

async function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
    // Single-block HKDF-Expand (length <= 32)
    const input = concat([info, new Uint8Array([0x01])]);
    const out = await hmacSha256(prk, input);
    return out.slice(0, length);
}

// ──────────────────────────────────────────────────────────────────────
// Time/utility helpers
// ──────────────────────────────────────────────────────────────────────
function isDueNow(hour: number, timezone: string): boolean {
    try {
        const fmt = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone || "UTC",
            hour: "numeric",
            hour12: false,
        });
        const parts = fmt.formatToParts(new Date());
        const hPart = parts.find((p) => p.type === "hour")?.value ?? "0";
        const h = parseInt(hPart, 10) % 24;
        return h === hour;
    } catch {
        return false;
    }
}

function wasSentToday(lastSentAt: string | null, timezone: string): boolean {
    if (!lastSentAt) return false;
    try {
        const now = new Date();
        const last = new Date(lastSentAt);
        const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: timezone || "UTC" });
        return fmt.format(now) === fmt.format(last);
    } catch {
        return false;
    }
}

function getDayOfYear(d: Date): number {
    const start = Date.UTC(d.getUTCFullYear(), 0, 0);
    const diff = d.getTime() - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function truncate(s: string, n: number): string {
    return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…";
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function b64url(b: Uint8Array): string {
    let bin = "";
    for (const x of b) bin += String.fromCharCode(x);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
    const pad = "=".repeat((4 - (s.length % 4)) % 4);
    const b = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}

function concat(arrs: Uint8Array[]): Uint8Array {
    let n = 0;
    for (const a of arrs) n += a.length;
    const out = new Uint8Array(n);
    let o = 0;
    for (const a of arrs) {
        out.set(a, o);
        o += a.length;
    }
    return out;
}
