# Mastering Quran

A free Quran reader with word-by-word translation, 10 English tafsirs, authentic hadith collections, and an AI assistant grounded in verified scholarship.

**Live:** [masteringquran.com](https://masteringquran.com)

## Features

- **Quran reader** — Full Quran in Uthmani script with 8 reciters, 17 translations across 8 languages, word-by-word mode, and 10 classical English tafsirs on every verse (sourced from [nwv-islamic-data](https://github.com/fauwadwali-oss/nwv-islamic-data)).
- **Hadith browser** — Ten canonical English collections: Sahih al-Bukhari, Sahih Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah, Malik, plus the three Forty Hadith compilations (Nawawi, Qudsi, Dehlawi).
- **Ask AI** — Claude Haiku 4.5 grounded in verified sources via a tool-use loop. Every claim is backed by a real fetch to the Quran, hadith, or tafsir — no hallucinated citations.

## Stack

- React 18 + Vite + TypeScript + Tailwind CSS 4 + shadcn/ui
- Cloudflare Pages (hosting) + Pages Functions (AI endpoint)
- Supabase (auth + bookmarks, shared with nusratwaliventures.com)
- Quran.com API v4 (verses, translations, word data, audio)
- jsDelivr-served mirror of tafsir + hadith data
- Anthropic Claude Haiku 4.5 for the AI assistant

## Develop

```bash
npm install --legacy-peer-deps
npm run dev         # vite dev server on :3000
npm run build       # production build to dist/public
```

## Deploy

Cloudflare Pages auto-deploys on push to `main`. Required env vars on the Pages project:

- `ANTHROPIC_API_KEY` — key scoped to a capped workspace
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — shared with nusratwaliventures.com
- `VITE_APP_TITLE` — "Mastering Quran"
- `VITE_ANALYTICS_ENDPOINT`, `VITE_ANALYTICS_WEBSITE_ID` — Umami

## License

Code: MIT. Underlying Islamic text content: governed by upstream sources (public-domain classical works and freely redistributable translations).

---

Operated by Nusrat Wali Ventures LLC · Houston, Texas
