#!/usr/bin/env python3
"""
Mastering Quran — "Ayah of the Day" Short pipeline.

Wires two live services into a repeatable 1080x1920 Short:
  * Arabic recitation  -> api.alquran.cloud  (real qari audio, per verse; default: Sudais)
  * English voiceover   -> local Voicebox    (:17493, free, on-device TTS)

Slides are rendered by headless Chrome (perfect Arabic shaping) and muxed with ffmpeg.
Slide durations are derived from the actual audio segment lengths, so audio/visual stay in sync.

Usage: edit CONFIG below, then `python3 ayah_short.py`
"""
import json, os, subprocess, time, urllib.request, html, ssl

HERE = os.path.dirname(os.path.abspath(__file__))
VB = "http://127.0.0.1:17493"
try:
    import certifi
    SSL_CTX = ssl.create_default_context(cafile=certifi.where())
except Exception:
    SSL_CTX = ssl._create_unverified_context()   # public Quran audio GETs only

# ----------------------------------------------------------------------------- CONFIG
CFG = {
    "slug": "94-5-6",
    "surah": 94, "ayahs": [5, 6],
    "reciter_edition": "ar.abdurrahmaansudais",     # alquran.cloud edition id
    "reciter_name": "Sheikh ʿAbdur-Raḥmān As-Sudais",
    "surah_label": "Surah Ash-Sharḥ · 94 : 5-6",
    # Arabic verse block (with ornate ayah end-marks) shown on the recitation slide:
    "arabic_html": ("فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا "
                    "<span class='endmark'>&#1757;</span><br>"
                    "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا "
                    "<span class='endmark'>&#1758;</span>"),
    "translit": "Fa-inna maʿa al-ʿusri yusrā.<br>Inna maʿa al-ʿusri yusrā.",
    "hook": "Read this when<br>life feels heavy.",
    "translation": "So, surely with hardship comes ease.",
    "exp_h": "One hardship, two eases",
    # Sourced from the site's own tafsir data (Maʿārif-ul-Qurʾān; corroborated by Ibn Kathīr):
    "explanation_html": ("Both times, <b>hardship</b> keeps the word <i>the</i> — one and the same hardship. "
                         "But <b>ease</b> comes with no <i>the</i>, and it comes <b>twice</b>. "
                         "So the scholars read it as <b>one hardship, a twofold ease</b>. "
                         "As the Prophet ﷺ said: “One hardship cannot overcome twofold ease.”"),
    "explanation_vo": ("Look closely. Both times, the word for hardship keeps its the. "
                       "One and the same hardship. But ease appears with no the, and it appears twice. "
                       "So the scholars read it this way. One hardship, but a twofold ease. "
                       "As the Prophet, peace be upon him, said: one hardship cannot overcome twofold ease."),
    "source": "Source: Tafsīr Maʿārif-ul-Qurʾān, 94:5–6 · corroborated by Tafsīr Ibn Kathīr",
    "voicebox_profile": "f8be227d-8a76-4491-b9fc-2a34c907e4d9",  # MHAMBA Narrator (en)
}
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
    audio_url = meta["data"]["audio"]
    open(out, "wb").write(http_get(audio_url))
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
def render_slides(cfg, out_dir):
    tpl = open(os.path.join(HERE, "template.html")).read()
    tpl = (tpl.replace("{{HOOK}}", cfg["hook"])
              .replace("{{ARABIC}}", cfg["arabic_html"])
              .replace("{{TRANSLIT}}", cfg["translit"])
              .replace("{{RECITER}}", html.escape(cfg["reciter_name"]))
              .replace("{{SURAHREF}}", html.escape(cfg["surah_label"]))
              .replace("{{TRANSLATION}}", html.escape(cfg["translation"]))
              .replace("{{EXP_H}}", html.escape(cfg["exp_h"]))
              .replace("{{EXPLANATION}}", cfg["explanation_html"])
              .replace("{{SOURCE}}", html.escape(cfg["source"])))
    build_html = os.path.join(out_dir, "build.html")
    open(build_html, "w").write(tpl)
    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    for s in range(1, 6):
        run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars",
             "--force-device-scale-factor=1", "--window-size=1080,1920",
             f"--screenshot={out_dir}/slide{s}.png", f"file://{build_html}?s={s}"])
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
    vo_tr = voicebox_tts(cfg["translation"], cfg["voicebox_profile"], os.path.join(OUT,"vo_trans.wav"))
    vo_ex = voicebox_tts(cfg["explanation_vo"], cfg["voicebox_profile"], os.path.join(OUT,"vo_exp.wav"))
    print(f"  VO translation {dur(vo_tr):.2f}s | explanation {dur(vo_ex):.2f}s")
    # 3. segment timings
    HOOK, GAP_REC, GAP_VO, MIDGAP, TAIL = 2.0, 0.4, 0.7, 0.5, 2.0
    rec_total = sum(dur(r) for r in rec) + GAP_REC*(len(rec)-1)
    d = {"s1":HOOK, "s2":rec_total+0.3, "s3":GAP_VO+dur(vo_tr)+0.3,
         "s4":MIDGAP+dur(vo_ex), "s5":TAIL}
    # 4. combined audio
    inputs, filt, n = [], "", 0
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
    render_slides(cfg, OUT)
    concat = os.path.join(OUT, "concat.txt")
    with open(concat,"w") as f:
        for s in ["s1","s2","s3","s4","s5"]:
            f.write(f"file '{OUT}/slide{s[1]}.png'\nduration {d[s]:.3f}\n")
        f.write(f"file '{OUT}/slide5.png'\n")
    out = os.path.join(OUT, f"masteringquran_{cfg['slug']}.mp4")
    run(["ffmpeg","-y","-loglevel","error","-f","concat","-safe","0","-i",concat,
         "-i",audio,
         "-vf",f"fps=30,format=yuv420p,fade=t=in:st=0:d=0.5,fade=t=out:st={total-0.5:.2f}:d=0.5",
         "-c:v","libx264","-preset","medium","-crf","20","-pix_fmt","yuv420p",
         "-c:a","aac","-b:a","192k","-shortest","-movflags","+faststart", out])
    print(f"DONE -> {out}  ({dur(out):.1f}s)")
    return out

if __name__ == "__main__":
    build(CFG)
