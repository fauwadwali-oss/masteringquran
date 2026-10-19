"""Build client/src/data/names.json, the 99 Names, entirely from sources:

- Names (Arabic), English renderings and transliterations: Jami` at-Tirmidhi 3507,
  Arabic and English editions of fawazahmed0/hadith-api (public domain). The English
  edition is the one mirrored in nwv-islamic-data.

    python3 scripts/islamic-data/build_names.py /path/to/nwv-islamic-data /path/to/ara-tirmidhi-3507.json

ara-tirmidhi-3507.json comes from
https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-tirmidhi/3507.json
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
data_repo, ara_file = Path(sys.argv[1]), Path(sys.argv[2])

eng = json.loads((data_repo / "hadith/editions/eng-tirmidhi.min.json").read_text(encoding="utf-8"))
eng_text = next(h["text"] for h in eng["hadiths"] if h["hadithnumber"] == 3507)
ara_text = json.loads(ara_file.read_text(encoding="utf-8"))["hadiths"][0]["text"]

# --- English: "the King (Al-Malik), the Free of Deficiencies (Al-Quddūs), ..."
start = eng_text.index("(Allāhu Lā Ilāha Illā Huwa),") + len("(Allāhu Lā Ilāha Illā Huwa),")
end = eng_text.rindex(".”")
english = []
for m in re.finditer(r"\s*(.+?)\s\(([^()]+)\)(?:,|$)", eng_text[start:end]):
    meaning, translit = m.group(1).strip(), m.group(2).strip()
    english.append({"english": meaning, "transliteration": translit})

# Arabic marks (harakat, dagger alif, Quranic annotation signs) and tatweel.
DIACRITICS = re.compile("[ؐ-ًؚ-ٰٟۖ-ۭـ]")


def bare(s: str) -> str:
    return DIACRITICS.sub("", s).replace("ٱ", "ا").replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")


# --- Arabic: space-separated from al-Rahman to al-Sabur; two names are two or three words.
# Tokens are compared without marks because the edition orders shadda/vowels differently.
all_tokens = ara_text.split()
first = next(i for i, t in enumerate(all_tokens) if bare(t) == "الرحمن")
last = next(i for i, t in enumerate(all_tokens) if bare(t) == "الصبور")
tokens = all_tokens[first : last + 1]
arabic, i = [], 0
while i < len(tokens):
    if bare(tokens[i]) == "مالك":  # Malik al-Mulk
        arabic.append(" ".join(tokens[i : i + 2])); i += 2
    elif bare(tokens[i]) == "ذو":  # Dhul-Jalali wal-Ikram
        arabic.append(" ".join(tokens[i : i + 3])); i += 3
    else:
        arabic.append(tokens[i]); i += 1

# The hadith counts "Allah" itself ("He is Allah, the one whom there is none worthy of
# worship except for Him") followed by 98 more names: 99 in all.
if len(english) != 98 or len(arabic) != 98:
    sys.exit(f"expected 98 names after Allah, got english={len(english)} arabic={len(arabic)}")
allah_ar = next(t for t in reversed(all_tokens[:first]) if bare(t) == "\u0627\u0644\u0644\u0647")  # "huwa Allahu alladhi"
english.insert(0, {"english": "the one whom there is none worthy of worship except for Him", "transliteration": "Allāh"})
arabic.insert(0, allah_ar)


# Glosses replaced after review: the Tirmidhi English edition's short labels for these
# names are misleading. Each replacement is an exact phrase from a cited source.
QURAN = {
    "Ash-Shakūr": ("35:30", "Appreciative"),
    "Al-Muqīt": ("4:85", "Keeper"),
    "Al-Wakīl": ("3:173", "Disposer of affairs"),
    "Al-Qayyūm": ("2:255", "the Self-Sustaining"),
    "Al-Muntaqim": ("3:4", "the Owner of Retribution"),
    "Dhul Jalāli wal Ikrām": ("55:27", "Owner of Majesty and Honor"),
    "Al-Ghaniyy": ("35:15", "the Free of need"),
}
# The Prophet's own explanation of these four names, Sahih Muslim 2713 (English edition).
MUSLIM_2713 = {
    "Al-Awwal": ("First", "Thou art the First, there is naught before Thee"),
    "Al-Ākhir": ("Last", "Thou art the Last and there is naught after Thee"),
    "Aẓ-Ẓāhir": ("Evident", "Thou art Evident and there is nothing above Thee"),
    "Al-Bāṭin": ("Innermost", "Thou art Innermost and there is nothing beyond Thee"),
}
# No English shown: the edition's rendering is wrong or misleading and no sourced replacement is available.
NO_GLOSS = {"Al-Wājid", "Aḍ-Ḍār"}

saheeh = {f"{s['number']}:{v['n']}": v["en"] for s in json.loads((ROOT / "scripts/prerender/data/quran-snapshot.json").read_text(encoding="utf-8"))["surahs"] for v in s["verses"]}
muslim = json.loads((data_repo / "hadith/editions/eng-muslim.min.json").read_text(encoding="utf-8"))["hadiths"]
m2713 = next(h["text"] for h in muslim if str(h.get("arabicnumber")) in ("2713", "2713.0", "2713.01"))

names = []
for idx, (a, e) in enumerate(zip(arabic, english), start=1):
    t = e["transliteration"]
    entry = {"number": idx, "arabic": a, "transliteration": t}
    if t in QURAN:
        ref, phrase = QURAN[t]
        if phrase not in saheeh[ref]:
            sys.exit(f"{t}: '{phrase}' not in Saheeh {ref}")
        entry["english"] = phrase[0].upper() + phrase[1:]
        entry["englishSource"] = f"Quran {ref}, Saheeh International"
        if t == "Al-Muntaqim":  # the verse describes Allah as dhu intiqam rather than using the name itself
            entry["englishSource"] += ", rendering ذُو ٱنتِقَامٍ"
    elif t in MUSLIM_2713:
        word, explanation = MUSLIM_2713[t]
        if explanation not in m2713 or word not in explanation:
            sys.exit(f"{t}: explanation not in Sahih Muslim 2713")
        entry["english"] = f"The {word}"
        entry["explanation"] = explanation
        entry["englishSource"] = "Sahih Muslim 2713"
    elif t in NO_GLOSS:
        entry["english"] = None
        entry["englishSource"] = None
    else:
        entry["english"] = e["english"][0].upper() + e["english"][1:]
        entry["englishSource"] = "Jami` at-Tirmidhi 3507, English edition"
    names.append(entry)

used = set(QURAN) | set(MUSLIM_2713) | NO_GLOSS
missing = used - {n["transliteration"] for n in names}
if missing:
    sys.exit(f"override keys not in the list: {missing}")

out = ROOT / "client/src/data/names.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({
    "source": {
        "list": "Jami` at-Tirmidhi 3507",
        "listGrade": "The enumeration's chain is graded da'if (weak) by Ahmad Shakir, al-Albani and Zubair Ali Zai",
        "countEvidence": ["Sahih al-Bukhari 7392", "Sahih Muslim 2677"],
        "countEvidenceNote": "These authentic hadith state that Allah has ninety-nine names; they do not list them.",
        "arabicEdition": "fawazahmed0/hadith-api ara-tirmidhi",
        "englishEdition": "fawazahmed0/hadith-api eng-tirmidhi",
    },
    "names": names,
}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print(f"wrote {out}: {len(names)} names, {sum(1 for n in names if n['englishSource'] and 'Tirmidhi' not in n['englishSource'])} glosses from other sources, {len(NO_GLOSS)} without English")
