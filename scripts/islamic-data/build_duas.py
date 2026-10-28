"""Build client/src/data/duas.json from scripts/islamic-data/duas.source.json.

Nothing in the output is typed by hand except titles and category names. Every
Arabic, English and transliteration text is cut out of its source with a pair of
markers ("from" and "to", inclusive), so it is an exact excerpt:

- Hadith: Arabic from fawazahmed0/hadith-api ara-<collection> (public domain),
  English from the eng-<collection> edition mirrored in nwv-islamic-data. Some
  English editions give the dua as a transliteration; the source file says which.
- Quran: Uthmani Arabic and Saheeh International from the verse snapshot
  (scripts/prerender/data/quran-snapshot.json).

Arabic markers are matched without diacritics, so they can be typed plainly.
The build fails if a marker is missing or ambiguous.

    python3 scripts/islamic-data/build_duas.py <nwv-islamic-data> scripts/islamic-data/source-cache
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from hadith_source import COLLECTIONS, lookup  # noqa: E402
from excerpt import cut, cut_arabic, cut_text  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
data_repo, cache = Path(sys.argv[1]), Path(sys.argv[2])
spec = json.loads((Path(__file__).parent / "duas.source.json").read_text(encoding="utf-8"))
snapshot = json.loads((ROOT / "scripts/prerender/data/quran-snapshot.json").read_text(encoding="utf-8"))
surahs = {s["number"]: s for s in snapshot["surahs"]}

# Translators as recorded in hadith-api's editions.json; the other English editions record none.
TRANSLATORS = {"bukhari": "Muhsin Khan", "muslim": "Abdul Hamid Siddiqui"}

out_duas = []
for d in spec["duas"]:
    src = d["source"]
    where = d["id"]
    entry = {"id": d["id"], "category": d["category"], "title": d["title"]}
    if src["type"] == "hadith":
        en_text, ar_text, grades = lookup(data_repo, cache, src["collection"], src["ref"])
        entry["arabic"] = cut(cut_arabic, ar_text, d["arabic"], where)
        if "translation" in d:
            entry["translation"] = cut(cut_text, en_text, d["translation"], where)
        if "transliteration" in d:
            entry["transliteration"] = cut(cut_text, en_text, d["transliteration"], where)
        ref_label = f"{COLLECTIONS[src['collection']]} {src['ref']}"
        entry["reference"] = ref_label
        entry["url"] = f"https://sunnah.com/{src['collection']}:{src['ref']}"
        entry["grades"] = [f"{g['grade']} ({g['name']})" for g in grades]
        weak = [g for g in grades if "daif" in g["grade"].lower() or "da'if" in g["grade"].lower()]
        entry["gradingDiffers"] = bool(weak) and len(weak) < len(grades)
        if weak and len(weak) == len(grades):
            raise SystemExit(f"{where}: every grader grades this weak")
        translator = TRANSLATORS.get(src["collection"])
        entry["englishEdition"] = f"{translator} translation of {COLLECTIONS[src['collection']]}" if translator else f"hadith-api English edition of {COLLECTIONS[src['collection']]}"
    else:
        s = surahs[src["surah"]]
        ayahs = src["ayahs"]
        ar_full = " ".join(v["ar"] for v in s["verses"] if v["n"] in ayahs)
        en_full = " ".join(v["en"] for v in s["verses"] if v["n"] in ayahs)
        entry["arabic"] = cut_arabic(ar_full, d["arabic"], where) if "arabic" in d else ar_full
        entry["translation"] = cut_text(en_full, d["translation"], where) if "translation" in d else en_full
        span = f"{ayahs[0]}" if len(ayahs) == 1 else f"{ayahs[0]}-{ayahs[-1]}"
        entry["reference"] = f"Quran {src['surah']}:{span}"
        entry["url"] = f"https://quran.com/{src['surah']}/{span}"
        entry["grades"] = []
        entry["gradingDiffers"] = False
        entry["englishEdition"] = "Saheeh International"
    if isinstance(d.get("arabic"), list):
        entry["narrationOmitted"] = True  # the " … " marks a narrator's comment left out
    if not entry.get("translation") and not entry.get("transliteration"):
        raise SystemExit(f"{where}: needs a translation or transliteration")
    if "count" in d:
        # A repeat count is only shown when the hadith itself states it.
        if src["type"] != "hadith" or d["count"]["evidence"] not in en_text:
            raise SystemExit(f"{where}: count evidence not in source: {d['count']['evidence']}")
        entry["count"] = d["count"]["value"]
    out_duas.append(entry)

ids = [d["id"] for d in out_duas]
if len(ids) != len(set(ids)):
    raise SystemExit("duplicate dua ids")
cat_ids = {c["id"] for c in spec["categories"]}
bad = [d["id"] for d in out_duas if d["category"] not in cat_ids]
if bad:
    raise SystemExit(f"unknown category for {bad}")

out = ROOT / "client/src/data/duas.json"
out.write_text(json.dumps({"categories": spec["categories"], "duas": out_duas}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print(f"wrote {out}: {len(out_duas)} duas in {len(spec['categories'])} categories")
