"""Build client/src/data/adhkar.json from scripts/islamic-data/adhkar.source.json.

The routines follow the order of Hisn al-Muslim, but no text is taken from any
adhkar dataset. As with the duas, nothing is typed by hand except titles and
routine names. Every Arabic, English and transliteration text is an exact
excerpt cut out of its source with "from"/"to" markers (see excerpt.py):

- Hadith: Arabic from fawazahmed0/hadith-api ara-<collection> (public domain),
  English from the eng-<collection> edition mirrored in nwv-islamic-data.
- Quran: Uthmani Arabic and Saheeh International from the verse snapshot
  (scripts/prerender/data/quran-snapshot.json).

Each dhikr also cites the hadith that says when to say it and how many times
("evidence", which defaults to the text's own hadith). Its quotes must appear
word for word in that hadith's English, and a count above one must be stated
in them. The build fails when:
- any grader in the edition grades the text's hadith or the evidence hadith
  weak or fabricated (stricter than the duas, which only flag a split grading),
- a marker or quote is missing or ambiguous, or a count is not in the quotes,
- ids repeat or a dhikr names an unknown routine.

    python3 scripts/islamic-data/build_adhkar.py <nwv-islamic-data> scripts/islamic-data/source-cache
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from hadith_source import COLLECTIONS, lookup  # noqa: E402
from excerpt import cut, cut_arabic, cut_text  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
data_repo, cache = Path(sys.argv[1]), Path(sys.argv[2])
spec = json.loads((Path(__file__).parent / "adhkar.source.json").read_text(encoding="utf-8"))
snapshot = json.loads((ROOT / "scripts/prerender/data/quran-snapshot.json").read_text(encoding="utf-8"))
surahs = {s["number"]: s for s in snapshot["surahs"]}

TRANSLATORS = {"bukhari": "Muhsin Khan", "muslim": "Abdul Hamid Siddiqui"}
WEAK = ("daif", "da'if", "dha'if", "dhaif", "weak", "mawdu", "fabricated", "munkar", "batil")
# How each repeat count must be worded in the evidence quotes.
COUNT_WORDS = {3: "three", 33: "thirty-three", 34: "thirty-four", 100: "hundred"}


def checked_hadith(collection: str, ref: str, where: str):
    en, ar, grades = lookup(data_repo, cache, collection, ref)
    weak = [g for g in grades if any(w in g["grade"].lower().replace("\u2019", "'").replace("`", "'") for w in WEAK)]
    if weak:
        raise SystemExit(f"{where}: {COLLECTIONS[collection]} {ref} is graded weak by {[g['name'] for g in weak]}")
    return en, ar, grades


def hadith_label(collection: str, ref: str):
    return f"{COLLECTIONS[collection]} {ref}", f"https://sunnah.com/{collection}:{ref}"


def quran_label(passages):
    spans = []
    for p in passages:
        s, a = p["surah"], p["ayahs"]
        if a == [v["n"] for v in surahs[s]["verses"]]:
            spans.append(f"{s}")  # the whole surah
        else:
            spans.append(f"{s}:{a[0]}" if len(a) == 1 else f"{s}:{a[0]}-{a[-1]}")
    return "Quran " + ", ".join(spans), "https://quran.com/" + spans[0].replace(":", "/")

out = []
for d in spec["adhkar"]:
    where, src = d["id"], d["source"]
    entry = {"id": d["id"], "routines": d["routines"], "title": d["title"]}
    if src["type"] == "hadith":
        en_text, ar_text, grades = checked_hadith(src["collection"], src["ref"], where)
        entry["arabic"] = cut(cut_arabic, ar_text, d["arabic"], where)
        for field in ("translation", "transliteration"):
            if field in d:
                entry[field] = cut(cut_text, en_text, d[field], where)
        entry["reference"], entry["url"] = hadith_label(src["collection"], src["ref"])
        entry["grades"] = [f"{g['grade']} ({g['name']})" for g in grades]
        translator = TRANSLATORS.get(src["collection"])
        entry["englishEdition"] = f"{translator} translation of {COLLECTIONS[src['collection']]}" if translator else f"hadith-api English edition of {COLLECTIONS[src['collection']]}"
        if isinstance(d["arabic"], list):
            entry["narrationOmitted"] = True  # the " … " marks a narrator's comment left out
    else:
        for p in src["passages"]:
            have = {v["n"] for v in surahs[p["surah"]]["verses"]}
            if not set(p["ayahs"]) <= have:
                raise SystemExit(f"{where}: ayahs {p['ayahs']} not all in surah {p['surah']}")
        verses = [[v for v in surahs[p["surah"]]["verses"] if v["n"] in p["ayahs"]] for p in src["passages"]]
        entry["arabic"] = "\n".join(" ".join(v["ar"].strip() for v in vs) for vs in verses)
        entry["translation"] = "\n".join(" ".join(v["en"].strip() for v in vs) for vs in verses)
        entry["reference"], entry["url"] = quran_label(src["passages"])
        entry["grades"] = []
        entry["englishEdition"] = "Saheeh International"
    if not entry.get("translation") and not entry.get("transliteration"):
        raise SystemExit(f"{where}: needs a translation or transliteration")

    ev = d["evidence"]
    ev_col, ev_ref = ev.get("collection", src.get("collection")), ev.get("ref", src.get("ref"))
    if not ev_col:
        raise SystemExit(f"{where}: a Quran passage needs an evidence hadith")
    ev_en, _, ev_grades = checked_hadith(ev_col, ev_ref, where)
    for q in ev["quote"]:
        if q not in ev_en:
            raise SystemExit(f"{where}: evidence quote not in {ev_col} {ev_ref}: {q}")
    count = d["count"]
    if not isinstance(count, int) or count < 1:
        raise SystemExit(f"{where}: count must be a positive integer")
    if count > 1 and COUNT_WORDS.get(count, "\0") not in " ".join(ev["quote"]):
        raise SystemExit(f"{where}: count {count} is not stated in the evidence quotes")
    entry["count"] = count
    if "note" in d:
        entry["note"] = d["note"]  # our own words, shown as a note: an interpretation or a caveat
    label, url = hadith_label(ev_col, ev_ref)
    entry["evidence"] = {"reference": label, "url": url, "quote": ev["quote"], "grades": [f"{g['grade']} ({g['name']})" for g in ev_grades]}
    out.append(entry)

ids = [d["id"] for d in out]
if len(ids) != len(set(ids)):
    raise SystemExit("duplicate dhikr ids")
routine_ids = [r["id"] for r in spec["routines"]]
bad = [d["id"] for d in out if not d["routines"] or set(d["routines"]) - set(routine_ids)]
if bad:
    raise SystemExit(f"unknown routine for {bad}")
routines = []
for r in spec["routines"]:
    # Each routine lists its adhkar in order: the source order, unless it gives its own.
    members = [d["id"] for d in out if r["id"] in d["routines"]]
    order = r.get("order", members)
    if sorted(order) != sorted(members):
        raise SystemExit(f"routine {r['id']} order does not match its adhkar: {sorted(set(order) ^ set(members))}")
    texts = [d["arabic"] for d in out if r["id"] in d["routines"]]
    if len(texts) != len(set(texts)):
        raise SystemExit(f"routine {r['id']} repeats the same Arabic text")
    routines.append({"id": r["id"], "name": r["name"], "description": r["description"], "adhkar": order})

dest = ROOT / "client/src/data/adhkar.json"
dest.write_text(json.dumps({"routines": routines, "adhkar": out}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
per = ", ".join(f"{r['id']} {len(r['adhkar'])}" for r in routines)
print(f"wrote {dest}: {len(out)} adhkar ({per})")
