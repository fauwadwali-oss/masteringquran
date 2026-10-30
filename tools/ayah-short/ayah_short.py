#!/usr/bin/env python3
"""
Mastering Quran — "Ayah of the Day" Short pipeline.

Wires two live services into a repeatable 1080x1920 Short:
  * Arabic recitation  -> api.alquran.cloud  (real qari audio, per verse; default: Sudais)
  * English voiceover   -> local Voicebox    (:17493, free, on-device TTS)

Slides are rendered by headless Chrome (perfect Arabic shaping) and muxed with ffmpeg.
Slide durations are derived from the actual audio segment lengths, so audio/visual stay in sync.

Usage: python3 ayah_short.py <slug>                    # loads verses/<slug>.json  (e.g. 13-28)
       python3 ayah_short.py <slug> --no-recitation    # silent-Arabic mode, see below

SILENT-ARABIC MODE (`"recitation": false`, or --no-recitation)
Third-party recitation masters (Sudais et al.) are commercially distributed and fingerprinted
by YouTube Content ID — the Quran text is public domain but each *recording* is not, and an
open API is not an open licence. This mode drops the qari audio entirely: no recitation is
fetched and no reciter is credited. To avoid a long dead-air gap the English translation VO
plays *under* the Arabic slide, and the line-by-line highlight paces to that VO rather than to
a reciter's pauses. Nothing else about the slides, translation or tafsir citation changes.
This is a stopgap until we own a recitation master outright.

Each verses/<slug>.json carries the verse text, translit, translation, hook, and a
tafsir-sourced explanation with its `source` citation (required — see build()).
"""
import json, os, subprocess, time, urllib.request, html, ssl, sys, re

HERE = os.path.dirname(os.path.abspath(__file__))
VERSES = os.path.join(HERE, "verses")
VB = "http://127.0.0.1:17493"
VOICEBOX_PROFILE = "a9c5ccc8-3630-474b-bbbc-eb3812ea45a6"  # English Narrator v2 (PVC clone), qwen 1.7B
try:
    import certifi
    SSL_CTX = ssl.create_default_context(cafile=certifi.where())
except Exception:
    SSL_CTX = ssl._create_unverified_context()   # public Quran audio GETs only

def load_cfg(slug):
    cfg = json.load(open(os.path.join(VERSES, f"{slug}.json")))
    cfg.setdefault("recitation", True)                    # False -> silent-Arabic mode (see module docstring)
    cfg.setdefault("reciter_edition", "ar.abdurrahmaansudais")
    cfg.setdefault("reciter_name", "Sheikh ʿAbdur-Raḥmān As-Sudais")
    cfg.setdefault("trans_card_sec", 2.4)                 # silent-Arabic mode: beat on the translation card
    cfg.setdefault("combined_slide", None)   # Arabic + translation on one slide; None -> on iff silent
    cfg.setdefault("voicebox_profile", VOICEBOX_PROFILE)
    cfg.setdefault("ayah_font_size", 132)                 # px; drop for longer verses
    cfg.setdefault("trans_font_size", 96)                 # px; drop for longer translations
    # combined-slide sizes derive from the two above, so they must default after them
    cfg.setdefault("combined_ayah_size", cfg["ayah_font_size"])
    cfg.setdefault("combined_trans_size", max(34, round(cfg["trans_font_size"] * 0.78)))
    cfg.setdefault("translation_vo", cfg["translation"])  # spoken VO may be fuller than on-screen line
    cfg.setdefault("trans_credit", "Translation based on Saheeh International")
    return cfg

def wrap_lines(arabic_html):
    """Wrap each <br>-separated display line in a .aline span for line-by-line highlighting."""
    parts = re.split(r"<br\s*/?>", arabic_html)
    return "<br>".join(f"<span class='aline'>{p.strip()}</span>" for p in parts if p.strip())
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
def _silence_centers(rec_path):
    """Timestamps (s) of natural pauses (waqf/breath) in the recitation."""
    r = subprocess.run(["ffmpeg","-i",rec_path,"-af","silencedetect=noise=-30dB:d=0.12","-f","null","-"],
                       capture_output=True, text=True)
    starts, ends = [], []
    for line in r.stderr.splitlines():
        if "silence_start" in line: starts.append(float(line.split("silence_start:")[1].strip()))
        elif "silence_end" in line: ends.append(float(line.split("silence_end:")[1].split("|")[0].strip()))
    return [(s+e)/2 for s, e in zip(starts, ends)]

def find_split(rec_path, target):
    """Nearest natural pause to `target` seconds (two-frame Arabic switch)."""
    c = _silence_centers(rec_path)
    return min(c, key=lambda x: abs(x-target)) if c else target

def find_line_times(rec_path, seg_lens):
    """Edges (s) that partition the recitation into one span per display line, snapping
    each boundary to the reciter's natural pause when one is close, else proportional."""
    D = dur(rec_path); total = sum(seg_lens); centers = _silence_centers(rec_path)
    edges = [0.0]
    for i in range(len(seg_lens) - 1):
        t = D * sum(seg_lens[:i+1]) / total
        snapped = min(centers, key=lambda x: abs(x-t)) if centers else t
        if not centers or abs(snapped - t) > 2.2:      # too far from a pause -> use proportional
            snapped = t
        snapped = max(snapped, edges[-1] + 0.4)         # keep boundaries monotonic
        edges.append(min(snapped, D - 0.3))
    edges.append(D)
    return edges

def pace_lines(seg_lens, span, min_line=1.2):
    """Silent-Arabic mode: split `span` seconds across display lines in proportion to their
    length, with a floor so short lines stay readable. Returns per-line durations summing to
    `span` (callers guarantee span >= min_line*len(seg_lens))."""
    total = sum(seg_lens)
    d = [max(min_line, span * L / total) for L in seg_lens]
    over = sum(d) - span                                   # floors may have overshot; trim the slack
    if over > 1e-6:
        slack = [max(0.0, x - min_line) for x in d]
        pool = sum(slack)
        if pool > 1e-6:
            d = [x - over * s / pool for x, s in zip(d, slack)]
    return d

def render_slides(cfg, out_dir, queries):
    tpl = open(os.path.join(HERE, "template.html")).read()
    logo = "file://" + os.path.join(HERE, "assets", "mq_shield_transparent.png")
    tpl = (tpl.replace("{{LOGO}}", logo)
              .replace("{{HOOK}}", cfg["hook"])
              .replace("{{ARABIC}}", wrap_lines(cfg["arabic_html"]))
              .replace("{{ARABIC2}}", cfg.get("arabic_html_2", ""))
              .replace("{{AYAH_SIZE}}", str(cfg["ayah_font_size"]))
              .replace("{{C_AYAH_SIZE}}", str(cfg["combined_ayah_size"]))
              .replace("{{C_TRANS_SIZE}}", str(cfg["combined_trans_size"]))
              .replace("{{TRANSLIT}}", cfg["translit"])
              .replace("{{RECITER_LINE}}",                 # blank in silent-Arabic mode -> CSS hides it
                       html.escape(f"Recited by {cfg['reciter_name']}") if cfg["recitation"] else "")
              .replace("{{SURAHREF}}", html.escape(cfg["surah_label"]))
              .replace("{{TRANSLATION}}", html.escape(cfg["translation"]))
              .replace("{{TRANS_SIZE}}", str(cfg["trans_font_size"]))
              .replace("{{TRANS_CREDIT}}", html.escape(cfg["trans_credit"]))
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
    # 1. Arabic recitation (real qari) — skipped entirely in silent-Arabic mode
    rec = []
    if cfg["recitation"]:
        for a in cfg["ayahs"]:
            p = os.path.join(OUT, f"rec_{cfg['surah']}_{a}.mp3")
            fetch_recitation(cfg["surah"], a, cfg["reciter_edition"], p)
            rec.append(p); print(f"  recitation {cfg['surah']}:{a} -> {dur(p):.2f}s")
    else:
        print("  silent-Arabic mode: no recitation fetched, no reciter credited")
    # 2. English VO (local Voicebox) — two clips for precise slide sync
    vo_tr = voicebox_tts(cfg["translation_vo"], cfg["voicebox_profile"], os.path.join(OUT,"vo_trans.wav"))
    vo_ex = voicebox_tts(cfg["explanation_vo"], cfg["voicebox_profile"], os.path.join(OUT,"vo_exp.wav"))
    print(f"  VO translation {dur(vo_tr):.2f}s | explanation {dur(vo_ex):.2f}s")
    # 3. segment timings — `audio_plan` is the soundtrack in order, `durs` the matching slide holds
    HOOK, GAP_REC, GAP_VO, MIDGAP, TAIL, LEAD = 2.0, 0.4, 0.7, 0.5, 2.0, 0.6
    strip_ar = lambda s: re.sub(r"<[^>]+>|&#\d+;|\s", "", s)
    # resolved here, not in load_cfg: --no-recitation is applied after the config is loaded
    want_combined = (not cfg["recitation"]) if cfg["combined_slide"] is None else cfg["combined_slide"]
    segs = [s for s in re.split(r"<br\s*/?>", cfg["arabic_html"]) if s.strip()]
    seg_lens = [max(1, len(strip_ar(s))) for s in segs]
    tail_q = {"3": GAP_VO+dur(vo_tr)+0.3, "4": MIDGAP+dur(vo_ex), "5": TAIL}

    if not cfg["recitation"]:
        # Silent-Arabic mode. The translation VO runs *under* the Arabic slide so there is no dead
        # air. With `combined_slide` the English sits on that same slide, so the standalone
        # translation card is dropped entirely — without a recitation, an Arabic slide followed by
        # a separate card reads as two disconnected beats.
        # Two-frame verses keep the old split: the combined layout cannot hold a verse that long.
        two_frame = bool(cfg.get("arabic_html_2"))
        combined = want_combined and not two_frame
        if want_combined and two_frame:
            print("  note: two-frame Arabic is too long for a combined slide — keeping the separate translation card")
        card = 0.0 if combined else cfg["trans_card_sec"]
        s2 = "2c" if combined else "2"
        base = LEAD + dur(vo_tr) + 0.4
        frames = 2 if two_frame else (len(segs) if len(cfg["ayahs"]) == 1 else 1)
        arabic_span = max(base, 1.2*frames)
        pad = arabic_span - base                        # slack if the VO is shorter than the lines need
        audio_plan = [("sil", HOOK), ("sil", LEAD), ("clip", vo_tr),
                      ("sil", 0.4 + pad + card + MIDGAP), ("clip", vo_ex), ("sil", TAIL)]
        tail_slides = (["4","5"] if combined else ["3","4","5"])
        tail_durs   = ([tail_q["4"], TAIL] if combined else [card, tail_q["4"], TAIL])
        if two_frame:
            frac = len(strip_ar(cfg["arabic_html"])) / max(1, len(strip_ar(cfg["arabic_html"])) + len(strip_ar(cfg["arabic_html_2"])))
            split_t = arabic_span * frac
            print(f"  two-frame Arabic (silent): switch at {split_t:.2f}s of {arabic_span:.1f}s")
            queries = ["1","2","2b"] + tail_slides
            durs    = [HOOK, split_t, arabic_span-split_t] + tail_durs
        elif frames > 1:
            line_durs = pace_lines(seg_lens, arabic_span)
            print(f"  line highlight (silent{', combined slide' if combined else ''}, paced to translation VO): "
                  f"{frames} lines over {arabic_span:.1f}s")
            queries = ["1"] + [f"{s2}&hl={i}" for i in range(frames)] + tail_slides
            durs    = [HOOK] + line_durs + tail_durs
        else:
            queries = ["1", s2] + tail_slides
            durs    = [HOOK, arabic_span] + tail_durs
    else:
        if want_combined:           # the recitation drives the Arabic slide; the VO drives the card
            print("  note: combined_slide only applies in silent-Arabic mode — ignoring")
        rec_total = sum(dur(r) for r in rec) + GAP_REC*(len(rec)-1)
        arabic_disp = rec_total + 0.3
        audio_plan = [("sil", HOOK)]
        for i, r in enumerate(rec):
            audio_plan.append(("clip", r))
            if i < len(rec)-1: audio_plan.append(("sil", GAP_REC))
        audio_plan += [("sil", GAP_VO), ("clip", vo_tr), ("sil", MIDGAP), ("clip", vo_ex), ("sil", TAIL)]
        if cfg.get("arabic_html_2"):
            # two Arabic frames: switch on a natural pause in the recitation, audio plays straight through
            frac = len(strip_ar(cfg["arabic_html"])) / max(1, len(strip_ar(cfg["arabic_html"])) + len(strip_ar(cfg["arabic_html_2"])))
            split_t = find_split(rec[0], rec_total*frac)
            print(f"  two-frame Arabic: switch at {split_t:.2f}s of {rec_total:.1f}s recitation")
            queries = ["1","2","2b","3","4","5"]
            durs    = [HOOK, split_t, arabic_disp-split_t, tail_q["3"], tail_q["4"], TAIL]
        elif len(cfg["ayahs"]) == 1 and len(segs) > 1:
            # line-by-line follow-along: one highlight frame per display line, synced to the recitation
            edges = find_line_times(rec[0], seg_lens)
            n_lines = len(segs)
            line_durs = [edges[i+1]-edges[i] for i in range(n_lines)]
            line_durs[-1] += 0.3
            print(f"  line highlight: {n_lines} lines, switches at " +
                  ", ".join(f"{edges[i+1]:.1f}" for i in range(n_lines-1)) + "s")
            queries = ["1"] + [f"2&hl={i}" for i in range(n_lines)] + ["3","4","5"]
            durs    = [HOOK] + line_durs + [tail_q["3"], tail_q["4"], TAIL]
        else:
            queries = ["1","2","3","4","5"]
            durs    = [HOOK, arabic_disp, tail_q["3"], tail_q["4"], TAIL]
    # 4. combined audio
    inputs, n = [], 0
    for kind, val in audio_plan:
        if kind == "sil":
            inputs.extend(["-f","lavfi","-t",f"{val:.3f}","-i","anullsrc=r=44100:cl=stereo"])
        else:
            inputs.extend(["-i", val])
        n += 1
    filt = "".join(f"[{i}:a]" for i in range(n)) + f"concat=n={n}:v=0:a=1[out]"
    audio = os.path.join(OUT, "combined_audio.mp3")
    run(["ffmpeg","-y","-loglevel","error", *inputs,
         "-filter_complex", filt, "-map","[out]","-ar","44100","-ac","2", audio])
    total = dur(audio); print(f"  combined audio {total:.2f}s")
    if abs(sum(durs) - total) > 0.25:      # slides and soundtrack must describe the same timeline
        print(f"  WARNING: slide timeline {sum(durs):.2f}s != audio {total:.2f}s — check sync by eye")
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
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    slug = args[0] if args else "94-5-6"
    cfg = load_cfg(slug)
    if "--no-recitation" in sys.argv:      # override without editing the verse config
        cfg["recitation"] = False
    build(cfg)
