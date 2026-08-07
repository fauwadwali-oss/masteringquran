# Ayah of the Day — Shorts pipeline

Generates a 1080×1920 vertical Short for one verse (or verse range): hook → Arabic
verse + recitation → English translation → sourced tafsir explanation → CTA.

**Everything runs locally — no paid APIs.**

| Piece | Source |
|-------|--------|
| Arabic recitation | `api.alquran.cloud`, edition `ar.abdurrahmaansudais` — **currently disabled**, see silent-Arabic mode |
| English voiceover | local **Voicebox** (`:17493`) — free, on-device TTS |
| Explanation text | the site's own tafsir data (`nwv-islamic-data`) — **must be cited on-slide** |
| Slides | headless Chrome + `template.html` (Chrome shapes the Arabic correctly) |
| Assembly | ffmpeg; slide durations auto-synced to the audio segments |

## Rules (non-negotiable)

1. **Every tafsir-based explanation must carry its reference on the slide.** The script
   *raises* if `explanation_html` is set but `source` is empty.
2. **Never paraphrase tafsir from memory.** Pull the real text from
   `../../../nwv-islamic-data/tafsir/<slug>/<surah>/<ayah>.json` (same data the live
   `TafsirPanel` fetches) and cite the edition + verse.
3. **Arabic recitation is always real qari audio, never AI/TTS.** Voicebox is for the
   English voiceover only (the meaning, not scripture). If we cannot use a recitation we
   have the rights to, we ship with **no** recitation — see silent-Arabic mode below.

## Silent-Arabic mode (current default posture — Aug 2026)

YouTube flagged Shorts in the Jul 2026 batch. Cause: **Content ID on the recitation master**.
The Quran text is public domain, but every *recording* carries its own copyright, and an open
API is not an open licence — `api.alquran.cloud` and Quran.com serve the audio freely but
license only their code. Swapping Sudais for another famous qari just trades one fingerprinted
commercial master for another; everyayah's data is CC-BY-NC (non-commercial only) and does not
bind the original rights holder anyway.

Until we own a recitation master outright, run with recitation off:

```bash
python3 ayah_short.py 11-6 --no-recitation      # or set "recitation": false in the verse config
```

In this mode: no recitation is fetched, no reciter is credited (`.reciter` collapses), and the
English translation VO plays **under** the Arabic slide so there is no dead air — the
line-by-line highlight paces to that VO instead of to a reciter's pauses.

It also switches on the **combined slide** (`combined_slide`, defaults on whenever recitation is
off): Arabic and its translation share one slide, separated by a hairline rule that keeps
scripture visually distinct from the translation. Without a recitation, an Arabic slide followed
by a standalone translation card reads as two disconnected beats, so the card is dropped and the
video tightens by ~2s. Sizes are `combined_ayah_size` / `combined_trans_size` (the latter
defaults to 78% of `trans_font_size`); the surah reference and Saheeh credit move onto the
combined slide. Verses with `arabic_html_2` are too long for one slide and keep the separate
card automatically. Translations and tafsir citations are unchanged.

## Usage

```bash
# Voicebox app must be running (REST on :17493). Then:
python3 ayah_short.py
```

Edit the `CFG` block at the top of `ayah_short.py` for a new verse: surah, ayahs,
Arabic block, translit, translation, explanation (pulled from tafsir), and `source`.

Output: `out/<slug>/masteringquran_<slug>.mp4` (the `out/` dir is gitignored).

## QA (run before publishing anything)

```bash
python3 verify.py            # all verses
python3 verify.py 2-286      # one verse
```

`verify.py` independently cross-checks each config against the canonical sources
(not the ones used to author it):
- **Arabic == canonical Uthmani** from api.alquran.cloud, letter-for-letter (HARD, gates exit code)
- cited tafsir edition/verse **exists** in `nwv-islamic-data` (HARD)
- `source` citation present (HARD)
- explanation's bolded claims keyword-appear in the tafsir text (SOFT — paraphrases will flag
  "review by hand"; confirm those against the source before shipping)

This content is sensitive — always run `verify.py` **and** eyeball every rendered slide before
anything leaves the machine. Nothing is auto-posted.

## Notes

- `voicebox_profile` currently points at the MHAMBA Narrator clone as a placeholder.
  For a dedicated Mastering Quran voice, clone one in Voicebox and swap the id.
- Arabic font: relies on macOS **Al Bayan**. Keep the `.ayah` font stack in sync if
  rendering on another machine.
