#!/usr/bin/env python3
"""
Mastering Quran — "Ayah of the Day" Short pipeline.

Wires two live services into a repeatable 1080x1920 Short:
  * Arabic recitation  -> api.alquran.cloud  (real qari audio, per verse; default: Sudais)
  * English voiceover   -> local Voicebox    (:17493, free, on-device TTS)

Slides are rendered by headless Chrome (perfect Arabic shaping) and muxed with ffmpeg.
Slide durations are derived from the actual audio segment lengths, so audio/visual stay in sync.

Usage: python3 ayah_short.py <slug>      # loads verses/<slug>.json  (e.g. 13-28)
Each verses/<slug>.json carries the verse text, translit, translation, hook, and a
tafsir-sourced explanation with its `source` citation (required — see build()).
"""
import json, os, subprocess, time, urllib.request, html, ssl, sys

HERE = os.path.dirname(os.path.abspath(__file__))
VERSES = os.path.join(HERE, "verses")
VB = "http://127.0.0.1:17493"
VOICEBOX_PROFILE = "f8be227d-8a76-4491-b9fc-2a34c907e4d9"  # MHAMBA Narrator (en) — swap for a dedicated MQ voice
try:
    import certifi
    SSL_CTX = ssl.create_default_context(cafile=certifi.where())
except Exception:
    SSL_CTX = ssl._create_unverified_context()   # public Quran audio GETs only

def load_cfg(slug):
    cfg = json.load(open(os.path.join(VERSES, f"{slug}.json")))
    cfg.setdefault("reciter_edition", "ar.abdurrahmaansudais")
    cfg.setdefault("reciter_name", "Sheikh ʿAbdur-Raḥmān As-Sudais")
    cfg.setdefault("voicebox_profile", VOICEBOX_PROFILE)
    cfg.setdefault("ayah_font_size", 132)                 # px; drop for longer verses
    cfg.setdefault("trans_font_size", 96)                 # px; drop for longer translations
    cfg.setdefault("translation_vo", cfg["translation"])  # spoken VO may be fuller than on-screen line
    return cfg
# ----------------------------------------------------------------------------- helpers
def run(cmd): subprocess.run(cmd, check=True)
def dur(path):
    r = subprocess.run(["ffprobe","-v","error","-show_entries","format=duration",
                        "-of","default=nw=1:nk=1", path], capture_output=True, text=True)
    return float(r.stdout.strip())

def http_get(url, timeout=20):
    return urllib.request.urlopen(url, timeout=timeout, context=SSL_CTX).read()

def fetch_recitation(surah, ayah, edition, out):
    meta = json.loads(http_get(f"https://api.alquran.cloud/v1/ayah/{surah}:{ayah}/{edition}"))
    open(out, "wb").write(http_get(meta["data"]["audio"]))
    return out

def voicebox_tts(text, profile, out_wav):
    body = json.dumps({"profile_id": profile, "text": text}).encode()
    req = urllib.request.Request(f"{VB}/generate", data=body,
                                 headers={"Content-Type": "application/json"})
    gid = json.loads(urllib.request.urlopen(req, timeout=60).read())["id"]
    for _ in range(80):
        raw = http_get(f"{VB}/generate/{gid}/status", timeout=8).decode()
        raw = raw.split("data:")[-1].strip()          # endpoint is SSE-prefixed
        st = json.loads(raw).get("status")
        if st in ("completed","complete","done","success"): break
        if st in ("failed","error"): raise RuntimeError(f"voicebox failed: {raw}")
        time.sleep(2)
    open(out_wav, "wb").write(http_get(f"{VB}/audio/{gid}", timeout=30))
    return out_wav
# ----------------------------------------------------------------------------- slides
def find_split(rec_path, target):
    """Find a natural pause (waqf/breath) in the recitation nearest to `target` seconds,
    so a two-frame Arabic display switches on the reciter's own pause, not mid-word."""
    r = subprocess.run(["ffmpeg","-i",rec_path,"-af","silencedetect=noise=-30dB:d=0.12","-f","null","-"],
                       capture_output=True, text=True)
    starts, ends = [], []
    for line in r.stderr.splitlines():
        if "silence_start" in line: starts.append(float(line.split("silence_start:")[1].strip()))
        elif "silence_end" in line: ends.append(float(line.split("silence_end:")[1].split("|")[0].strip()))
    centers = [(s+e)/2 for s, e in zip(starts, ends)]
    return min(centers, key=lambda c: abs(c-target)) if centers else target

def render_slides(cfg, out_dir, queries):
    tpl = open(os.path.join(HERE, "template.html")).read()
    logo = "file://" + os.path.join(HERE, "assets", "mq_shield_transparent.png")
    tpl = (tpl.replace("{{LOGO}}", logo)
              .replace("{{HOOK}}", cfg["hook"])
              .replace("{{ARABIC}}", cfg["arabic_html"])
              .replace("{{ARABIC2}}", cfg.get("arabic_html_2", ""))
              .replace("{{AYAH_SIZE}}", str(cfg["ayah_font_size"]))
              .replace("{{TRANSLIT}}", cfg["translit"])
              .replace("{{RECITER}}", html.escape(cfg["reciter_name"]))
              .replace("{{SURAHREF}}", html.escape(cfg["surah_label"]))
              .replace("{{TRANSLATION}}", html.escape(cfg["translation"]))
              .replace("{{TRANS_SIZE}}", str(cfg["trans_font_size"]))
              .replace("{{EXP_H}}", html.escape(cfg["exp_h"]))
              .replace("{{EXPLANATION}}", cfg["explanation_html"])
              .replace("{{SOURCE}}", html.escape(cfg["source"])))
    build_html = os.path.join(out_dir, "build.html")
    open(build_html, "w").write(tpl)
    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    for i, q in enumerate(queries, 1):   # q = the ?s= value (e.g. "1","2","2b","3"...)
        run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars",
             "--force-device-scale-factor=1", "--window-size=1080,1920",
             f"--screenshot={out_dir}/slide{i}.png", f"file://{build_html}?s={q}"])
# ----------------------------------------------------------------------------- main
def build(cfg):
    # RULE: any explanation drawn from tafsir must carry a reference on the slide.
    if cfg.get("explanation_html", "").strip() and not cfg.get("source", "").strip():
        raise ValueError("Explanation present but no tafsir 'source' set — "
                         "every tafsir-based explanation must cite its reference on-slide.")
    OUT = os.path.join(HERE, "out", cfg["slug"])   # working + output files (gitignored)
    os.makedirs(OUT, exist_ok=True)
    # 1. Arabic recitation (real qari)
    rec = []
    for a in cfg["ayahs"]:
        p = os.path.join(OUT, f"rec_{cfg['surah']}_{a}.mp3")
        fetch_recitation(cfg["surah"], a, cfg["reciter_edition"], p)
        rec.append(p); print(f"  recitation {cfg['surah']}:{a} -> {dur(p):.2f}s")
    # 2. English VO (local Voicebox) — two clips for precise slide sync
    vo_tr = voicebox_tts(cfg["translation_vo"], cfg["voicebox_profile"], os.path.join(OUT,"vo_trans.wav"))
    vo_ex = voicebox_tts(cfg["explanation_vo"], cfg["voicebox_profile"], os.path.join(OUT,"vo_exp.wav"))
    print(f"  VO translation {dur(vo_tr):.2f}s | explanation {dur(vo_ex):.2f}s")
    # 3. segment timings
    HOOK, GAP_REC, GAP_VO, MIDGAP, TAIL = 2.0, 0.4, 0.7, 0.5, 2.0
    rec_total = sum(dur(r) for r in rec) + GAP_REC*(len(rec)-1)
    arabic_disp = rec_total + 0.3
    hook_q = {"1": HOOK}
    tail_q = {"3": GAP_VO+dur(vo_tr)+0.3, "4": MIDGAP+dur(vo_ex), "5": TAIL}
    if cfg.get("arabic_html_2"):
        # two Arabic frames: switch on a natural pause in the recitation, audio plays straight through
        import re as _re
        strip = lambda s: _re.sub(r"<[^>]+>|&#\d+;|\s", "", s)
        frac = len(strip(cfg["arabic_html"])) / max(1, len(strip(cfg["arabic_html"])) + len(strip(cfg["arabic_html_2"])))
        split_t = find_split(rec[0], rec_total*frac)
        print(f"  two-frame Arabic: switch at {split_t:.2f}s of {rec_total:.1f}s recitation")
        queries = ["1","2","2b","3","4","5"]
        durs    = [HOOK, split_t, arabic_disp-split_t, tail_q["3"], tail_q["4"], TAIL]
    else:
        queries = ["1","2","3","4","5"]
        durs    = [HOOK, arabic_disp, tail_q["3"], tail_q["4"], TAIL]
    # 4. combined audio
    inputs, n = [], 0
    def sil(t):
        nonlocal n; inputs.extend(["-f","lavfi","-t",str(t),"-i","anullsrc=r=44100:cl=stereo"]); n+=1
    def clip(p):
        nonlocal n; inputs.extend(["-i",p]); n+=1
    sil(HOOK)
    for i,r in enumerate(rec):
        clip(r);  sil(GAP_REC) if i < len(rec)-1 else None
    sil(GAP_VO); clip(vo_tr); sil(MIDGAP); clip(vo_ex); sil(TAIL)
    filt = "".join(f"[{i}:a]" for i in range(n)) + f"concat=n={n}:v=0:a=1[out]"
    audio = os.path.join(OUT, "combined_audio.mp3")
    run(["ffmpeg","-y","-loglevel","error", *inputs,
         "-filter_complex", filt, "-map","[out]","-ar","44100","-ac","2", audio])
    total = dur(audio); print(f"  combined audio {total:.2f}s")
    # 5. slides + video
    render_slides(cfg, OUT, queries)
    concat = os.path.join(OUT, "concat.txt")
    with open(concat,"w") as f:
        for i, dd in enumerate(durs, 1):
            f.write(f"file '{OUT}/slide{i}.png'\nduration {dd:.3f}\n")
        f.write(f"file '{OUT}/slide{len(durs)}.png'\n")
    out = os.path.join(OUT, f"masteringquran_{cfg['slug']}.mp4")
    run(["ffmpeg","-y","-loglevel","error","-f","concat","-safe","0","-i",concat,
         "-i",audio,
         "-vf",f"fps=30,format=yuv420p,fade=t=in:st=0:d=0.5,fade=t=out:st={total-0.5:.2f}:d=0.5",
         "-c:v","libx264","-preset","medium","-crf","20","-pix_fmt","yuv420p",
         "-c:a","aac","-b:a","192k","-shortest","-movflags","+faststart", out])
    print(f"DONE -> {out}  ({dur(out):.1f}s)")
    return out

if __name__ == "__main__":
    slug = sys.argv[1] if len(sys.argv) > 1 else "94-5-6"
    build(load_cfg(slug))
