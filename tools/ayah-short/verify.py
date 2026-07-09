#!/usr/bin/env python3
"""
Independent QA for Ayah-of-the-Day verse configs.

For every verses/<slug>.json it cross-checks, against sources NOT used to author it:
  1. Arabic on the slide == canonical Uthmani text from api.alquran.cloud
       - letter-skeleton (diacritics removed, alef forms unified) — a mismatch = a REAL word error
       - also reports whether the fully-voweled text is identical or differs only in diacritics
  2. The cited tafsir edition/verse in `source` actually exists in nwv-islamic-data,
     and the explanation's bolded claim words actually occur in that tafsir text.
  3. The `source` citation is present (mirrors the build-time rule).

Run:  python3 verify.py            # all verses
      python3 verify.py 2-286      # one verse
Exit code is nonzero if any check FAILS, so it can gate publishing.
"""
import json, os, glob, re, ssl, sys, unicodedata, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.abspath(os.path.join(HERE, "..", "..", "..", "nwv-islamic-data", "tafsir"))
CTX  = ssl._create_unverified_context()
ED = {  # human name in `source`  ->  data folder slug   (keys matched diacritic-insensitively)
    "ibn kathir": "en-tafisr-ibn-kathir", "maarif": "en-tafsir-maarif-ul-quran",
    "jalalayn": "en-al-jalalayn", "ibn abbas": "en-tafsir-ibn-abbas",
    "tustari": "en-tafsir-al-tustari", "qushairi": "en-al-qushairi-tafsir",
    "tazkirul": "en-tazkirul-quran", "asbab": "en-asbab-al-nuzul-by-al-wahidi",
    "kashani": "en-kashani-tafsir", "kashf": "en-kashf-al-asrar-tafsir",
}
# Arabic diacritics: harakat U+064B-065F, superscript alef U+0670, quranic marks U+06D6-06ED, tatweel U+0640
_DIAC = re.compile("[ً-ٰٟۖ-ۭـ]")
_ALEF = re.compile("[آأإٱ]")   # آ أ إ ٱ  -> ا

def fetch(url): return json.loads(urllib.request.urlopen(url, timeout=20, context=CTX).read())
def strip_html(s):
    s = re.sub(r"<br\s*/?>", " ", s); s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"&#\d+;", "", s)                       # decorative ayah end-marks
def collapse(s): return "".join(s.split())
def letters(s):                                           # base-letter skeleton
    return collapse(_ALEF.sub("ا", _DIAC.sub("", strip_html(s))))
def deaccent(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if not unicodedata.combining(c)).lower()

def ed_slug(source):
    low = deaccent(source)                                # tolerate macrons: "Kathir" from "Kathīr"
    return next((v for k, v in ED.items() if k in low), None)

def check(slug):
    cfg = json.load(open(os.path.join(HERE, "verses", f"{slug}.json")))
    issues, notes = [], []
    # --- 1. Arabic vs canonical Uthmani ---
    onslide = cfg["arabic_html"] + cfg.get("arabic_html_2", "")
    canon = " ".join(fetch(f"https://api.alquran.cloud/v1/ayah/{cfg['surah']}:{a}/quran-uthmani")["data"]["text"]
                     for a in cfg["ayahs"])
    if letters(onslide) != letters(canon):
        issues.append("ARABIC letter-skeleton mismatch vs canonical Uthmani (REAL text error)")
    elif collapse(strip_html(onslide)) != collapse(strip_html(canon)):
        notes.append("Arabic letters match canonical; minor diacritic/whitespace differences only")
    else:
        notes.append("Arabic identical to canonical Uthmani (incl. diacritics)")
    # --- 2. tafsir citation is real + claims are grounded ---
    src = cfg.get("source", "")
    if not src.strip():
        issues.append("no `source` citation (rule 1)")
    else:
        slugf = ed_slug(src)
        if not slugf:
            notes.append(f"could not map cited edition to a data folder: {src!r}")
        elif not any(os.path.exists(os.path.join(DATA, slugf, str(cfg["surah"]), f"{a}.json")) for a in cfg["ayahs"]):
            issues.append(f"cited tafsir {slugf} has no file for {cfg['surah']}:{cfg['ayahs']}")
        else:
            text = " ".join(json.load(open(os.path.join(DATA, slugf, str(cfg["surah"]), f"{a}.json"))).get("text", "")
                            for a in cfg["ayahs"] if os.path.exists(os.path.join(DATA, slugf, str(cfg["surah"]), f"{a}.json"))).lower()
            for claim in re.findall(r"<b>(.*?)</b>", cfg.get("explanation_html", "")):
                words = re.findall(r"[a-z]{5,}", strip_html(claim).lower())
                if words and not any(w in text for w in words):
                    notes.append(f"claim not keyword-matched in {slugf}: “{strip_html(claim)[:40]}” (review by hand)")
    return issues, notes

def main():
    slugs = [sys.argv[1]] if len(sys.argv) > 1 else \
            [os.path.splitext(os.path.basename(p))[0] for p in sorted(glob.glob(os.path.join(HERE, "verses", "*.json")))]
    failed = 0
    for s in slugs:
        issues, notes = check(s)
        if issues: failed += 1
        print(f"[{'FAIL' if issues else 'PASS'}] {s}")
        for i in issues: print(f"    ✗ {i}")
        for n in notes:  print(f"    · {n}")
    print(f"\n{len(slugs)-failed}/{len(slugs)} passed.")
    sys.exit(1 if failed else 0)

if __name__ == "__main__":
    main()
