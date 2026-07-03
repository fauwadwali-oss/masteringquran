# Ayah of the Day — Shorts pipeline

Generates a 1080×1920 vertical Short for one verse (or verse range): hook → Arabic
verse + recitation → English translation → sourced tafsir explanation → CTA.

**Everything runs locally — no paid APIs.**

| Piece | Source |
|-------|--------|
| Arabic recitation | `api.alquran.cloud`, edition `ar.abdurrahmaansudais` (real Sudais audio, per verse) |
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
   English voiceover only (the meaning, not scripture).

## Usage

```bash
# Voicebox app must be running (REST on :17493). Then:
python3 ayah_short.py
```

Edit the `CFG` block at the top of `ayah_short.py` for a new verse: surah, ayahs,
Arabic block, translit, translation, explanation (pulled from tafsir), and `source`.

Output: `out/<slug>/masteringquran_<slug>.mp4` (the `out/` dir is gitignored).

## Notes

- `voicebox_profile` currently points at the MHAMBA Narrator clone as a placeholder.
  For a dedicated Mastering Quran voice, clone one in Voicebox and swap the id.
- Arabic font: relies on macOS **Al Bayan**. Keep the `.ayah` font stack in sync if
  rendering on another machine.
