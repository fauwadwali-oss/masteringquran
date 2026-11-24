#!/usr/bin/env python3
"""Verses and font for the home-screen widgets.

Text comes unchanged from the committed Quran snapshot (Uthmani and Saheeh International),
for the same stand-alone verses the daily email uses, kept to ones short enough to show whole.
Run: python3 scripts/widget/build.py
"""
import json, re
from pathlib import Path
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[2]
snap = json.loads((ROOT / "scripts/prerender/data/quran-snapshot.json").read_text(encoding="utf-8"))
worker = (ROOT / "workers/daily-delivery/src/index.ts").read_text(encoding="utf-8")
pool = re.search(r"const VERSE_POOL: string\[\] = \[(.*?)\];", worker, re.S).group(1)
# Reviewed by hand: these pass the automatic checks but need the verses around them.
NEEDS_CONTEXT = set("2:156 3:8 10:82 11:90 13:28 13:29 17:24 17:32 18:10 21:23 23:96 25:30 26:214 29:2 36:58 37:182 39:66 40:44 50:37 51:19 53:58 55:27 56:79 67:13 68:4 76:1 76:29 87:17 108:1 109:6 14:40 17:80 33:70 38:35 3:200 21:35 64:11 47:7 7:23 29:6 17:36 16:18 9:51 17:82 15:99".split())
out = []
for s, a in re.findall(r'"(\d+):(\d+)"', pool):
    surah = snap["surahs"][int(s) - 1]
    v = surah["verses"][int(a) - 1]
    assert surah["number"] == int(s) and v["n"] == int(a)
    if f"{s}:{a}" in NEEDS_CONTEXT or v["en"].count('"') % 2: continue
    # A verse is never cut, and one that leans on its neighbours opens or ends mid-sentence.
    if len(v["en"]) > 150 or len(v["ar"]) > 130: continue
    if not re.search(r"[.!?][\"'”’\])]*$", v["en"]) or not re.match(r"[\"“'\[(]*[A-ZĀĪŪ]", v["en"]): continue
    if re.match(r"(Except|That |Then |But |So )", v["en"]): continue
    out.append({"s": int(s), "a": int(a), "name": surah["nameSimple"], "ar": v["ar"], "en": v["en"]})
text = json.dumps(out, ensure_ascii=False, separators=(",", ":"))
for p in ("ios/App/QuranWidget/verses.json", "android/app/src/main/assets/widget/verses.json"):
    (ROOT / p).write_text(text, encoding="utf-8")
font = TTFont(ROOT / "node_modules/@fontsource/amiri/files/amiri-arabic-400-normal.woff")
font.flavor = None
for p in ("ios/App/QuranWidget/Amiri-Regular.ttf", "android/app/src/main/assets/widget/Amiri-Regular.ttf"):
    font.save(ROOT / p)
cmap = font.getBestCmap()
missing = sorted({c for v in out for c in v["ar"] if c != " " and ord(c) not in cmap})
print(len(out), "verses; characters missing from the font:", missing, "; postscript name:", font["name"].getDebugName(6))
