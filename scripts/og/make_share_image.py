"""Draw the 1200x630 link-preview image (client/public/og-image.png).

    python3 scripts/og/make_share_image.py

Uses macOS system fonts (Georgia, Geeza Pro) and the transparent shield next to this script.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "client" / "public"
W, H = 1200, 630

# Emerald to near-black diagonal, matching the prayer-times hero card.
img = Image.new("RGB", (W, H))
px = img.load()
top, bottom = (6, 95, 70), (2, 6, 23)
for y in range(H):
    for x in range(W):
        t = min(1.0, (x / W) * 0.45 + (y / H) * 0.75)
        px[x, y] = tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3))

draw = ImageDraw.Draw(img)
logo = Image.open(Path(__file__).with_name("mq_shield_transparent.png")).convert("RGBA")
logo.thumbnail((270, 290))
img.paste(logo, (90, (H - logo.height) // 2), logo)

serif = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
body = "/System/Library/Fonts/Supplemental/Georgia.ttf"
arabic = "/System/Library/Fonts/GeezaPro.ttc"
x = 400
draw.text((x, 150), "Mastering Quran", font=ImageFont.truetype(serif, 76), fill=(255, 255, 255))
draw.text((x, 248), "القرآن الكريم", font=ImageFont.truetype(arabic, 54), fill=(167, 243, 208), direction="rtl", language="ar")
lines = ["Arabic, translation and 10 tafsirs for every verse.", "Prayer times, Qibla and Arabic lessons. Free, no ads."]
for i, line in enumerate(lines):
    draw.text((x, 360 + i * 46), line, font=ImageFont.truetype(body, 30), fill=(209, 250, 229))
draw.text((x, 488), "masteringquran.com", font=ImageFont.truetype(serif, 30), fill=(110, 231, 183))

out = PUBLIC / "og-image.png"
img.save(out, optimize=True)
print(f"wrote {out} ({out.stat().st_size // 1024} KB)")
