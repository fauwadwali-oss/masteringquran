# Mastering Quran — Daily Delivery Worker

Cloudflare Worker that runs **every hour** and sends the daily verse to
every active email / push subscriber whose chosen hour matches their local
timezone.

## How it works

1. Cron trigger fires at `5 * * * *` (every hour at :05 past).
2. Worker picks today's verse from a curated 366-slot pool (`VERSE_POOL`),
   indexed by day-of-year — so everyone sees the same verse on the same day.
3. Fetches Arabic + English from [Quran.com API v4](https://api.quran.com) (translation 131 = Mustafa Khattab).
4. Reads `mq_email_subscriptions` & `mq_push_subscriptions` via the Supabase
   **service role** key, filters to rows whose `delivery_hour` matches the
   current hour in the subscriber's timezone AND who haven't been sent today.
5. Delivers:
   - **Email** via Resend (beautiful HTML template with shield logo and deep
     link to the verse in the reader).
   - **Web Push** via VAPID (encrypted payload per RFC 8291, aes128gcm).

## One-time setup

### 1. Deploy the worker

```bash
cd workers/daily-delivery
npm install
npx wrangler deploy
```

### 2. Set secrets

```bash
# Supabase (required for both channels)
npx wrangler secret put SUPABASE_URL
#   → https://hlhtvstvblvdixygchil.supabase.co
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
#   → from Supabase dashboard → Project Settings → API → service_role key

# Email delivery (optional — skip if you don't want email yet)
npx wrangler secret put RESEND_API_KEY
#   → from https://resend.com/api-keys

# Push delivery (optional — skip if you don't want push yet)
npx wrangler secret put VAPID_PUBLIC_KEY
npx wrangler secret put VAPID_PRIVATE_KEY
npx wrangler secret put VAPID_SUBJECT
#   → e.g. mailto:fauwad@nusratwaliventures.com
```

### 3. Generate VAPID keys

```bash
npx web-push generate-vapid-keys --json
```

You get something like:
```json
{
  "publicKey": "BCQL...",
  "privateKey": "uYu..."
}
```

- `VAPID_PUBLIC_KEY` → set to the `publicKey` value above.
- `VAPID_PRIVATE_KEY` → **must be the full JWK JSON** (not the raw
  base64url). Convert with:

```bash
node -e '
const { createPublicKey, createPrivateKey } = require("crypto");
// Paste your raw keys below
const pub = "BCQL...";
const priv = "uYu...";
const jwk = {
  kty: "EC",
  crv: "P-256",
  d: priv,
  x: Buffer.from(pub, "base64url").subarray(1, 33).toString("base64url"),
  y: Buffer.from(pub, "base64url").subarray(33, 65).toString("base64url"),
};
console.log(JSON.stringify(jwk));
'
```

Copy that JSON as `VAPID_PRIVATE_KEY`.

Also set `VITE_VAPID_PUBLIC_KEY` in the main Pages build environment so the
frontend can subscribe users with the same public key.

### 4. Verify the schema is in place

Run `supabase/migrations/002_phase5_6_schema.sql` in the Supabase SQL editor.

## Manual testing

```bash
# One-off run (useful while iterating)
curl -X POST https://mq-daily-delivery.<your-subdomain>.workers.dev/run

# Check the worker is alive
curl https://mq-daily-delivery.<your-subdomain>.workers.dev/health

# Tail logs
npx wrangler tail
```

## Operational notes

- Idempotent: `last_sent_at` is checked against today's date in the
  subscriber's timezone, so a double-firing cron won't double-deliver.
- Permanent push errors (404 / 410 Gone) automatically flip the subscription
  to `active = false`.
- Email validation errors don't deactivate the row — we log and move on, so
  the user can fix the address.
- Rate limiting: sequential for simplicity. For >5,000 subscribers, batch
  with `Promise.all()` at a controlled concurrency.

## Costs at a glance

| Subscribers | Emails/month | Resend cost   | Worker cost |
|------------:|-------------:|--------------:|------------:|
|         100 |        3,000 | free (3k tier)| free        |
|       1,000 |       30,000 | $20           | free        |
|      10,000 |      300,000 | $80           | ~free       |
