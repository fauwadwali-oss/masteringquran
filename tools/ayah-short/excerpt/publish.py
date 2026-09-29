"""Schedule a tafsir-excerpt batch on RobinReach: 2/day, 10 AM + 8 PM New York time.

    python3 publish.py <batch_dir> <YYYY-MM-DD start> [--upload] [--create] [--verify]

Default is a dry run that writes publishing/posts.json for review.
  --upload  put videos + covers on R2 (masteringseries-video-assets/masteringquran/tafsir/<batch>/)
  --create  POST each post (resumable: publishing/created.json)
  --verify  list the brand's posts and assert every stored UTC instant matches the plan
Publish times carry an explicit UTC offset from zoneinfo, so the Nov DST change is handled.
"""
import datetime
import json
import subprocess
import sys
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

BRAND = 'eba22d8bc0a4af15'
PROFILES = [11463, 11511, 11465, 11466, 11472]  # FB, IG, TikTok, YT, Threads
KEY = (Path.home() / 'Library/Mobile Documents/com~apple~CloudDocs/MSDrills-Tokens/robinreach-api-key.txt').read_text().strip()
API = 'https://robinreach.com/api/v1/posts'
BUCKET = 'masteringseries-video-assets'
PUBLIC = 'https://pub-ca0333dc5cfb48928ff4b0506b16b415.r2.dev'
NY = ZoneInfo('America/New_York')


def plan(batch, start):
    items = json.loads((batch / 'manifest.json').read_text())
    label = f'MQ {batch.name} - {len(items)} Shorts'
    prefix = f'masteringquran/tafsir/{batch.name}'
    posts = []
    for n, c in enumerate(items):
        day = start + datetime.timedelta(days=n // 2)
        when = datetime.datetime.combine(day, datetime.time([10, 20][n % 2]), NY)
        title = f'{c["surah_name"]} {c["ref"]} | Mastering Quran'
        caption = (f'{c["surah_name"]} {c["ref"]}\n\n{c["translation"]}\n— Saheeh International\n\n'
                   f'{c["tafsir_label"]} — excerpt:\n“{c["tafsir_excerpt"]}”\n\n'
                   f'Source: {c["source_url"]}\n#MasteringQuran #Quran #Tafsir')
        short = (f'{c["surah_name"]} {c["ref"]}\n\n{c["tafsir_label"]} — excerpt:\n“{c["tafsir_excerpt"]}”\n\n'
                 f'{c["source_url"]}\n#MasteringQuran #Quran')
        assert len(title) <= 100 and len(caption) <= 2200 and len(short) <= 500, c['slug']
        payload = {
            'brand_id': BRAND, 'content': caption, 'social_profile_ids': PROFILES, 'post_status': 'scheduled',
            'publish_time': when.isoformat(), 'timezone': 'America/New_York', 'labels': [label],
            'media_urls': [f'{PUBLIC}/{prefix}/MasteringQuran_{c["slug"]}.mp4'],
            'thumbnail_url': f'{PUBLIC}/{prefix}/{c["slug"]}.png',
            'platform_options': {
                'facebook': {'post_type': 'reels', 'title': title},
                'instagram': {'post_type': 'reels', 'content': caption},
                'tiktok': {'title': title, 'content': caption, 'privacy': 'PUBLIC_TO_EVERYONE'},
                'youtube': {'title': title, 'content': caption, 'privacy': 'public',
                            'tags': 'Quran,Mastering Quran,Tafsir', 'notify_subscribers': True},
                'threads': {'content': short},
            },
        }
        posts.append({'slug': c['slug'], 'utc': when.astimezone(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M'),
                      'payload': payload})
    return posts, prefix


def upload(batch, prefix, posts):
    for p in posts:
        slug = p['slug']
        for local, key, ctype in [(batch / 'videos' / f'MasteringQuran_{slug}.mp4', f'{prefix}/MasteringQuran_{slug}.mp4', 'video/mp4'),
                                  (batch / 'covers' / f'{slug}.png', f'{prefix}/{slug}.png', 'image/png')]:
            subprocess.run(['npx', 'wrangler', 'r2', 'object', 'put', f'{BUCKET}/{key}', '--file', str(local),
                            '--content-type', ctype, '--remote'], check=True, capture_output=True)
        for url in (p['payload']['media_urls'][0], p['payload']['thumbnail_url']):
            assert requests.head(url, timeout=60).status_code == 200, url
        print('UPLOADED', slug, flush=True)


def create(pub, posts):
    log = pub / 'created.json'
    done = json.loads(log.read_text()) if log.exists() else {}
    for p in posts:
        if p['slug'] in done:
            continue
        r = requests.post(API, params={'api_key': KEY, 'brand_id': BRAND}, json=p['payload'], timeout=120)
        r.raise_for_status()
        body = r.json()
        done[p['slug']] = {'id': body.get('id') or body.get('post', {}).get('id'), 'response': body}
        log.write_text(json.dumps(done, ensure_ascii=False, indent=2))
        print('CREATED', p['slug'], done[p['slug']]['id'], flush=True)


def verify(pub, posts):
    done = json.loads((pub / 'created.json').read_text())
    stored = {}
    for page in range(1, 20):
        r = requests.get(API, params={'api_key': KEY, 'brand_id': BRAND, 'per_page': 100, 'page': page}, timeout=120)
        batch_posts = r.json().get('posts', [])
        if not batch_posts:
            break
        stored.update({p['id']: p for p in batch_posts})
    bad = []
    for p in posts:
        s = stored.get(done[p['slug']]['id'])
        got = s and s['publish_time'][:16]
        if not s or got != p['utc'] or s['status'] != 'scheduled' or len(s['social_profiles']) != len(PROFILES):
            bad.append((p['slug'], p['utc'], got, s and s['status']))
    (pub / 'verify.json').write_text(json.dumps({'checked': len(posts), 'problems': bad}, indent=2))
    print('VERIFY', len(posts), 'problems:', bad, flush=True)


if __name__ == '__main__':
    batch, start = Path(sys.argv[1]), datetime.date.fromisoformat(sys.argv[2])
    pub = batch / 'publishing'
    pub.mkdir(exist_ok=True)
    posts, prefix = plan(batch, start)
    (pub / 'posts.json').write_text(json.dumps(posts, ensure_ascii=False, indent=2))
    print('PLANNED', len(posts), posts[0]['payload']['publish_time'], '->', posts[-1]['payload']['publish_time'])
    if '--upload' in sys.argv:
        upload(batch, prefix, posts)
    if '--create' in sys.argv:
        create(pub, posts)
    if '--verify' in sys.argv:
        verify(pub, posts)
