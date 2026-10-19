"""Build the city list used by the prayer times search and the /prayer-times/<city> pages.

Source: GeoNames (CC BY 4.0) https://download.geonames.org/export/dump/
    cities15000.txt (from cities15000.zip) and admin1CodesASCII.txt

    python3 scripts/prayer/build_cities.py /path/to/geonames-dir

Writes client/public/data/cities.json, a compact array of rows:
    [slug, name, region, countryCode, lat, lon, timeZone, population, page]
page = 1 when the city gets its own prerendered page.
"""
import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

SEARCH_MIN_POP = 100_000
PAGE_MIN_POP = 1_000_000
# English-speaking markets where people search "prayer times <city>" for mid-size cities too.
PAGE_COUNTRIES_MIN_POP = {"US": 150_000, "CA": 150_000, "GB": 150_000, "AU": 150_000, "IE": 150_000, "NZ": 150_000}

src = Path(sys.argv[1])
out = Path(__file__).resolve().parents[2] / "client" / "public" / "data" / "cities.json"

admin1 = {}
for line in (src / "admin1CodesASCII.txt").read_text(encoding="utf-8").splitlines():
    code, name, _ascii, _id = line.split("\t")
    admin1[code] = name


def slugify(*parts):
    s = "-".join(p for p in parts if p)
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


rows = []
for line in (src / "cities15000.txt").read_text(encoding="utf-8").splitlines():
    f = line.split("\t")
    pop = int(f[14] or 0)
    if pop < SEARCH_MIN_POP:
        continue
    cc = f[8]
    rows.append({
        "name": f[1],
        "ascii": f[2] or f[1],
        "region": admin1.get(f"{cc}.{f[10]}", ""),
        "cc": cc,
        "lat": round(float(f[4]), 4),
        "lon": round(float(f[5]), 4),
        "tz": f[17],
        "pop": pop,
    })

# Slug = city-country; add the region when two cities in one country share a name.
dupes = Counter((r["ascii"].lower(), r["cc"]) for r in rows)
seen = set()
rows.sort(key=lambda r: -r["pop"])
for r in rows:
    if dupes[(r["ascii"].lower(), r["cc"])] > 1:
        r["slug"] = slugify(r["ascii"], r["region"], r["cc"])
    else:
        r["slug"] = slugify(r["ascii"], r["cc"])
    base, n = r["slug"], 2
    while r["slug"] in seen:
        r["slug"] = f"{base}-{n}"
        n += 1
    seen.add(r["slug"])
    r["page"] = 1 if r["pop"] >= PAGE_MIN_POP or r["pop"] >= PAGE_COUNTRIES_MIN_POP.get(r["cc"], 10**12) else 0

out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(
    [[r["slug"], r["name"], r["region"], r["cc"], r["lat"], r["lon"], r["tz"], r["pop"], r["page"]] for r in rows],
    ensure_ascii=False, separators=(",", ":"),
))
print(f"wrote {out}: {len(rows)} cities, {sum(r['page'] for r in rows)} with pages, {out.stat().st_size // 1024} KB")
