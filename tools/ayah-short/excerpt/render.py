"""Render tafsir-excerpt Shorts from build.py output (port of the Sep 2026 Codex renderer).

    python3 render.py <batch_dir> [slug ...]

Timeline: 2s cover -> Arabic + translation (5-word phrase highlight synced to
VocalLab word captions) -> tafsir excerpt -> 2s end card. 1080x1920, 30 fps.
Slides are screenshotted by headless Chrome (screens.cjs), which also shrinks
text until nothing crosses the footer and reports overflow.
"""
import concurrent.futures
import difflib
import html
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
NODE = '/Users/fauwadahmed/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node'
LOGO = HERE.parent / 'assets/mq_shield_transparent.png'
CSS = (HERE / 'base_style.css').read_text()


def norm(w):
    return re.sub(r'[^a-z0-9]', '', w.lower())


def spans(groups, active):
    return ' '.join(f'<span class="phrase {"active" if i == active else ""}">{html.escape(" ".join(g))}</span>'
                    for i, g in enumerate(groups))


def groups_of_5(words):
    return [words[i:i + 5] for i in range(0, len(words), 5)]


def build_frames(batch, c, screens):
    slug = c['slug']
    folder = batch / 'frames' / slug
    folder.mkdir(parents=True, exist_ok=True)
    audio = batch / 'audio' / f'{slug}.mp3'
    words = json.loads((batch / 'audio' / f'{slug}-captions.json').read_text())['words']
    duration = float(subprocess.check_output(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(audio)]))

    # Map script tokens onto caption words so each phrase lights up when it is spoken.
    tokens = c['narration'].split()
    sm = difflib.SequenceMatcher(None, [norm(w) for w in tokens], [norm(w['word']) for w in words], autojunk=False)
    mapping = {i + k: j + k for i, j, n in sm.get_matching_blocks() for k in range(n)}

    def stamp(i):
        if i in mapping:
            return words[mapping[i]]['start']
        near = min(mapping, key=lambda x: abs(x - i))
        return max(0, words[mapping[near]]['start'] + (i - near) * .25)

    # The source writes ʿayn as a backtick (Ya`qub); show the proper modifier letter.
    trans, excerpt = c['translation'].split(), c['tafsir_excerpt'].replace('`', 'ʿ').split()
    tg, eg = groups_of_5(trans), groups_of_5(excerpt)
    excerpt_start = len(trans) + len(c['tafsir_label'].split())
    timeline = [(0, 'cover', -1), (2, 'verse', 0)]
    timeline += [(2 + stamp(i * 5), 'verse', i) for i in range(1, len(tg))]
    timeline.append((2 + stamp(len(trans)), 'tafsir', -1))
    timeline += [(2 + stamp(excerpt_start + i * 5), 'tafsir', i) for i in range(len(eg))]
    timeline += [(2 + duration, 'end', -1), (4 + duration, 'stop', 0)]
    timeline.sort(key=lambda x: x[0])

    logo = LOGO.as_uri()
    frames = []
    for idx, ((start, kind, active), (stop, _, _)) in enumerate(zip(timeline, timeline[1:])):
        if stop <= start:
            continue
        if kind == 'cover':
            quote = (f'<div class="quote">“{html.escape(c["translation"])}”</div><div class="attr">Saheeh International</div>'
                     if len(trans) <= 30 else '')
            body = (f'<div class="cover"><img src="{logo}"><div class="arname" lang="ar" dir="rtl">{c["arabic_name"]}</div>'
                    f'<h1>{html.escape(c["surah_name"])}</h1><div class="verse">{c["ref"]}</div>{quote}</div>')
        elif kind == 'verse':
            body = ('<div class="content"><div class="arabic" lang="ar">' + ' ۞ '.join(v['arabic'] for v in c['verses'])
                    + '</div><div class="rule"></div><div class="label">English translation</div><div class="english">'
                    + spans(tg, active) + f'</div><div class="source">Saheeh International · {c["ref"]}</div></div>')
        elif kind == 'tafsir':
            abridged = ' (Abridged)' if c['edition'] == 'en-tafisr-ibn-kathir' else ''
            body = ('<div class="content taf"><div class="label">Tafsir · excerpt</div><div class="english">“'
                    + spans(eg, active) + f'”</div><div class="rule"></div><div class="source">{c["tafsir_label"]}{abridged}'
                    + f'<br>Commentary on {c["surah"]}:{c["ayahs"][0]} · Quran.com</div></div>')
        else:
            body = f'<div class="end"><img src="{logo}"><h1>Mastering Quran</h1><p>masteringquran.com</p></div>'
        markup = (f'<!doctype html><meta charset="utf-8"><style>{CSS}</style><div class="border"></div>'
                  f'<div class="top"><img src="{logo}">MASTERING QURAN</div>'
                  f'<div class="ref">{html.escape(c["surah_name"])} · {c["ref"]}</div>{body}'
                  f'<div class="footer"><span>masteringquran.com</span><span>{c["ref"]}</span></div>')
        h, png = folder / f'{idx:03}.html', folder / f'{idx:03}.png'
        h.write_text(markup)
        frames.append({'html': str(h), 'png': str(png), 'duration': stop - start, 'kind': kind})

    screens.stdin.write(json.dumps({'slug': slug, 'frames': frames}) + '\n')
    screens.stdin.flush()
    checks = json.loads(screens.stdout.readline())
    assert not any(q['overflow'] for q in checks['checks']), f'{slug}: layout overflow'

    shutil.copy(frames[0]['png'], batch / 'covers' / f'{slug}.png')
    for kind in ('verse', 'tafsir'):
        shutil.copy(next(f['png'] for f in frames if f['kind'] == kind), batch / 'qa' / f'{slug}-{kind}.png')
    concat = folder / 'frames.txt'
    concat.write_text(''.join(f"file '{f['png']}'\nduration {f['duration']:.4f}\n" for f in frames)
                      + f"file '{frames[-1]['png']}'\n")
    report = {'slug': slug, 'duration': duration + 4, 'caption_match': sm.ratio(),
              'unmatched_script_words': [tokens[i] for i in range(len(tokens)) if i not in mapping],
              'layout': checks, 'listening_qa': 'pending'}
    (batch / 'qa' / f'{slug}.json').write_text(json.dumps(report, indent=2))
    print('SLIDES', slug, round(sm.ratio(), 3), flush=True)
    return concat, audio, duration, slug


def encode(batch, args):
    concat, audio, duration, slug = args
    out = batch / 'videos' / f'MasteringQuran_{slug}.mp4'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', str(concat), '-i', str(audio),
                    '-vf', 'fps=30,format=yuv420p', '-af', 'adelay=2000|2000,apad=pad_dur=2', '-t', str(duration + 4),
                    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-threads', '4',
                    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', str(out)], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-i', str(out), '-f', 'null', '-'], check=True)
    print('VIDEO', slug, flush=True)
    return slug


if __name__ == '__main__':
    batch = Path(sys.argv[1])
    only = set(sys.argv[2:])
    items = [c for c in json.loads((batch / 'manifest.json').read_text()) if not only or c['slug'] in only]
    shutil.copy(LOGO, batch / 'covers/logo.png')
    screens = subprocess.Popen([NODE, str(HERE / 'screens.cjs')], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        futures = [pool.submit(encode, batch, build_frames(batch, c, screens)) for c in items]
        for f in futures:
            f.result()
    screens.stdin.close()
    screens.wait()
    print('COMPLETE', len(items), flush=True)
