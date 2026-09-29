"""Tafsir-excerpt Shorts: build the manifest and generate VocalLab narration.

Format (set Sep 2026): Arabic + Saheeh International, then a VERBATIM tafsir
excerpt, narrated in Fauwad's VocalLab clone. Nothing is paraphrased: every
excerpt is asserted to be an exact substring of the nwv-islamic-data source.

    python3 build.py <batch_dir> [--manifest-only]

<batch_dir> must contain selections.json:
    {"<slug>": {"edition": "en-tafisr-ibn-kathir" | "en-al-jalalayn", "text": "<exact excerpt>"}}
Outputs: manifest.json, scripts/, sources/, audio/<slug>.mp3 + -captions.json.
"""
import base64
import concurrent.futures
import json
import subprocess
import sys
import time
from pathlib import Path

import requests

TAFSIR_ROOT = Path('/Volumes/Extreme SSD/Github/nwv-islamic-data/tafsir')
KEY_FILE = Path.home() / 'Library/Mobile Documents/com~apple~CloudDocs/MSDrills-Tokens/vocallab-api-key.txt'
VOCALLAB = 'https://api.vocallab.ai/api/v1'
VOICE = 'default-mfmzzuisaw1rhcson9s9pg__fauwad_ahmed'
LABELS = {'en-tafisr-ibn-kathir': 'Tafsir Ibn Kathir', 'en-al-jalalayn': 'Tafsir al-Jalalayn'}


# Spoken-only respellings for transliterations the TTS garbles. The on-screen
# excerpt stays verbatim; the source's backtick (for ʿayn) is never voiced.
SPOKEN = {'Ya`qub': 'Yaqoob', 'Khushu`': 'Khushoo'}


def spoken_form(text):
    for written, said in SPOKEN.items():
        text = text.replace(written, said)
    return text.replace('`', '')


def fetch_whole(edition, dest):
    if not dest.exists():
        url = f'https://api.alquran.cloud/v1/quran/{edition}'
        dest.write_bytes(requests.get(url, timeout=120).content)
    return json.loads(dest.read_text())['data']['surahs']


def clean_translation(text):
    # alquran.cloud leaves an unmatched quote where a speech runs across ayahs.
    # Drop a stray delimiter at either edge; close a speech that runs into the next ayah.
    if text.count('"') % 2:
        if text.endswith('"'):
            text = text[:-1]
        elif text.startswith('"'):
            text = text[1:]
        else:
            text += '"'
    return text


def build_manifest(batch):
    sels = json.loads((batch / 'selections.json').read_text())
    for sub in ['scripts', 'sources', 'audio', 'qa', 'covers', 'videos']:
        (batch / sub).mkdir(exist_ok=True)
    eng = fetch_whole('en.sahih', batch / 'sources/whole-en.sahih.json')
    ara = fetch_whole('quran-uthmani', batch / 'sources/whole-quran-uthmani.json')

    items = []
    for slug, sel in sels.items():
        s, *ayahs = map(int, slug.split('-'))
        ed, quote = sel['edition'], sel['text']
        src = TAFSIR_ROOT / ed / str(s) / f'{ayahs[0]}.json'
        assert quote in json.loads(src.read_text())['text'], f'{slug}: excerpt not in {src}'
        (batch / 'sources' / f'{slug}-{ed}.json').write_bytes(src.read_bytes())

        verses = [{'ayah': a,
                   'arabic': ara[s - 1]['ayahs'][a - 1]['text'],
                   'translation': clean_translation(eng[s - 1]['ayahs'][a - 1]['text'])} for a in ayahs]
        trans = ' '.join(v['translation'] for v in verses)
        label = LABELS[ed]
        # Spoken "Tafseer" — VocalLab mispronounces "Tafsir"; on-screen spelling is unchanged.
        spoken = label.replace('Tafsir', 'Tafseer')
        narration = f"{trans.replace('[', '').replace(']', '')} {spoken}. {spoken_form(quote.strip(' ,'))}"
        if narration[-1] not in '.!?':
            narration += '.'
        ref = f'{s}:{ayahs[0]}' + (f'–{ayahs[-1]}' if len(ayahs) > 1 else '')
        items.append({
            'index': len(items) + 1, 'slug': slug, 'surah': s, 'ayahs': ayahs, 'ref': ref,
            'surah_name': eng[s - 1]['englishName'], 'arabic_name': ara[s - 1]['name'],
            'verses': verses, 'translation': trans, 'tafsir_excerpt': quote,
            'tafsir_label': label, 'edition': ed, 'narration': narration,
            'source_url': f'https://quran.com/{s}:{ayahs[0]}/tafsirs/{ed}',
        })
        (batch / 'scripts' / f'{slug}.txt').write_text(narration)
    (batch / 'manifest.json').write_text(json.dumps(items, ensure_ascii=False, indent=2))
    print('MANIFEST', len(items), flush=True)
    return items


def vocallab(method, endpoint, payload=None):
    headers = {'Authorization': f'Bearer {KEY_FILE.read_text().strip()}'}
    r = requests.request(method, f'{VOCALLAB}/{endpoint}', json=payload, headers=headers, timeout=240)
    r.raise_for_status()
    return r.json()


def generate(batch, item):
    slug = item['slug']
    audio, state = batch / 'audio' / f'{slug}.mp3', batch / 'audio' / f'{slug}-generation.json'
    if audio.exists():
        return slug
    d = json.loads(state.read_text()) if state.exists() else vocallab('POST', 'tts', {
        'text': item['narration'], 'voice': VOICE, 'model': 'v-pro', 'speed': 1,
        'format': 'MP3', 'captions': 'word'})
    state.write_text(json.dumps({k: v for k, v in d.items() if k != 'audio_base64'}))
    for _ in range(90):
        obj = d.get('data', d)
        tid, status = obj.get('id') or obj.get('tts_id'), obj.get('status')
        if status in ('failed', 'error'):
            raise RuntimeError(f'{slug} synthesis failed: {str(obj)[:300]}')
        if status in ('ready', 'completed', 'success'):
            url = obj.get('audio_url') or obj.get('audioUrl') or obj.get('url')
            if obj.get('audio_base64'):
                audio.write_bytes(base64.b64decode(obj['audio_base64']))
            else:
                subprocess.run(['curl', '-fsSL', url, '-o', str(audio)], check=True)
            caps = vocallab('GET', f'tts/{tid}/captions?mode=word&format=json')
            (batch / 'audio' / f'{slug}-captions.json').write_text(json.dumps(caps, ensure_ascii=False, indent=2))
            print('READY', slug, flush=True)
            return slug
        time.sleep(8)
        d = vocallab('GET', f'tts/{tid}')
    raise RuntimeError(f'{slug} timed out')


if __name__ == '__main__':
    batch = Path(sys.argv[1])
    items = build_manifest(batch)
    if '--manifest-only' not in sys.argv:
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:
            for slug in ex.map(lambda c: generate(batch, c), items):
                print('SAVED', slug, flush=True)
