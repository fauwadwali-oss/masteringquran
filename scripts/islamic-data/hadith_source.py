"""Look up hadith by their standard reference number in both languages.

English: nwv-islamic-data/hadith/editions/eng-<collection>.min.json (local mirror).
Arabic: fawazahmed0/hadith-api ara-<collection> on jsDelivr (public domain),
cached under the cache directory so builds are repeatable offline.

Standard references (e.g. Sahih Muslim 2677) are the editions' "arabicnumber";
"hadithnumber" is the edition's own running index and is only used to fetch.

    python3 scripts/islamic-data/hadith_source.py <nwv-islamic-data> <cache-dir> bukhari:6306 muslim:2721
"""
import json
import subprocess
import sys
from pathlib import Path

COLLECTIONS = {
    "bukhari": "Sahih al-Bukhari",
    "muslim": "Sahih Muslim",
    "abudawud": "Sunan Abi Dawud",
    "tirmidhi": "Jami` at-Tirmidhi",
    "nasai": "Sunan an-Nasa'i",
    "ibnmajah": "Sunan Ibn Majah",
}
_eng_cache: dict = {}


def english_edition(data_repo: Path, collection: str):
    if collection not in _eng_cache:
        _eng_cache[collection] = json.loads((data_repo / f"hadith/editions/eng-{collection}.min.json").read_text(encoding="utf-8"))["hadiths"]
    return _eng_cache[collection]


def lookup(data_repo: Path, cache: Path, collection: str, ref: str):
    """Return (english_text, arabic_text, grades) for a standard reference like "2677" or "2677.01"."""
    hadiths = english_edition(data_repo, collection)
    wanted = float(ref)
    matches = [h for h in hadiths if float(h.get("arabicnumber") or -1) == wanted]
    if not matches and "." not in ref:
        matches = [h for h in hadiths if int(float(h.get("arabicnumber") or -1)) == int(wanted)]
    if not matches:
        raise KeyError(f"{collection} {ref} not found")
    h = matches[0]
    idx = h["hadithnumber"]
    cache.mkdir(parents=True, exist_ok=True)
    f = cache / f"ara-{collection}-{idx}.json"
    if not f.exists():
        path = f"editions/ara-{collection}/{idx}.json"
        # curl rather than urllib: some Python installs ship without a CA bundle. jsDelivr
        # sometimes answers 403; the same file from the repo's "1" branch is the fallback.
        for url in (f"https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/{path}", f"https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/{path}"):
            if subprocess.run(["curl", "-sSfL", "--max-time", "30", "-o", str(f), url]).returncode == 0:
                break
        else:
            raise RuntimeError(f"could not fetch {path}")
    ara = json.loads(f.read_text(encoding="utf-8"))["hadiths"][0]["text"]
    return h["text"], ara, h.get("grades") or []


if __name__ == "__main__":
    repo, cache = Path(sys.argv[1]), Path(sys.argv[2])
    for spec in sys.argv[3:]:
        col, ref = spec.split(":")
        en, ar, grades = lookup(repo, cache, col, ref)
        print(f"=== {COLLECTIONS[col]} {ref}  grades={[g['grade'] for g in grades]}")
        print("EN:", en)
        print("AR:", ar)
        print()
