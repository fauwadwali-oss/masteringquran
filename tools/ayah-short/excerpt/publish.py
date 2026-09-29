"""Schedule a tafsir-excerpt batch on RobinReach: 2/day, 10 AM + 8 PM New York time.

    python3 publish.py <batch_dir> <YYYY-MM-DD start> [--upload] [--create] [--verify]

Default is a dry run that writes publishing/posts.json for review.
  --upload  put videos + covers on R2 (masteringseries-video-assets/masteringquran/tafsir/<batch>/)
  --create  POST each post (resumable: publishing/created.json)
  --verify  list the brand's posts and fail unless every post matches the plan exactly
  --fix-times  PUT the planned wall-clock time on posts whose stored UTC is off
Publish times carry an explicit UTC offset from zoneinfo, so the Nov DST change is handled.
RobinReach's create endpoint has applied a fixed -5 to America/New_York before (DST bug);
its update endpoint is DST-aware, hence --fix-times.
"""
import datetime
import json
import subprocess
import sys
import time
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

BRAND = 'eba22d8bc0a4af15'
PROFILES = [11463, 11511, 11465, 11466, 11472]  # FB, IG, TikTok, YT, Threads
PLATFORMS = sorted(['facebook', 'instagram_direct', 'tiktok', 'youtube', 'threads'])
KEY = (Path.home() / 'Library/Mobile Documents/com~apple~CloudDocs/MSDrills-Tokens/robinreach-api-key.txt').read_text().strip()
API = 'https://robinreach.com/api/v1/posts'
BUCKET = 'masteringseries-video-assets'
PUBLIC = 'https://pub-ca0333dc5cfb48928ff4b0506b16b415.r2.dev'
NY = ZoneInfo('America/New_York')
WRANGLER_CWD = '/Volumes/Extreme SSD/Github/msdrills'  # its wrangler install uploads to remote R2 by default


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
            'brand_id': BRAND, 'content': caption, 'social_profile_ids': PROFILES, 'status': 'scheduled',
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
                            '--content-type', ctype], check=True, capture_output=True, cwd=WRANGLER_CWD)
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
        body = r.json()
        if r.status_code not in (200, 201) or not body.get('post_id'):
            raise RuntimeError(f'{p["slug"]}: {r.status_code} {r.text[:300]}')
        done[p['slug']] = {'post_id': body['post_id'], 'response': body}
        log.write_text(json.dumps(done, ensure_ascii=False, indent=2))
        print('CREATED', p['slug'], body['post_id'], flush=True)
        time.sleep(3)


def stored_posts():
    stored = {}
    for page in range(1, 30):
        r = requests.get(API, params={'api_key': KEY, 'brand_id': BRAND, 'per_page': 100, 'page': page}, timeout=120)
        r.raise_for_status()
        page_posts = r.json().get('posts', [])
        if not page_posts:
            break
        stored.update({p['id']: p for p in page_posts})
    return stored


def verify(pub, posts, fix_times=False):
    done = json.loads((pub / 'created.json').read_text())
    ids = [done[p['slug']]['post_id'] for p in posts if p['slug'] in done]
    problems = []
    if len(ids) != len(posts) or len(set(ids)) != len(ids):
        problems.append(('batch', f'{len(set(ids))} unique ids for {len(posts)} planned posts'))
    stored = stored_posts()
    for p in posts:
        pid = done.get(p['slug'], {}).get('post_id')
        s = stored.get(pid)
        if not s:
            problems.append((p['slug'], f'post {pid} not found'))
            continue
        want = p['payload']
        checks = {
            'utc': (s['publish_time'][:16], p['utc']),
            'status': (s['status'], 'scheduled'),
            'platforms': (sorted(x['platform'] for x in s['social_profiles']), PLATFORMS),
            'label': (s.get('labels'), want['labels']),
            'media': (len(s.get('attachments') or []) >= 1, True),
        }
        bad = {k: v for k, v in checks.items() if v[0] != v[1]}
        if bad.get('utc') and fix_times:
            local = datetime.datetime.fromisoformat(want['publish_time']).strftime('%Y-%m-%dT%H:%M:%S')
            r = requests.put(f'{API}/{pid}', params={'api_key': KEY, 'brand_id': BRAND},
                             json={'publish_time': local, 'timezone': 'America/New_York'}, timeout=120)
            r.raise_for_status()
            print('RETIMED', p['slug'], pid, flush=True)
            got = requests.get(f'{API}/{pid}', params={'api_key': KEY, 'brand_id': BRAND}, timeout=120).json()
            got = got.get('post', got).get('publish_time', '')[:16]
            if got == p['utc']:
                del bad['utc']
            else:
                bad['utc'] = (got, p['utc'])
        if bad:
            problems.append((p['slug'], bad))
    (pub / 'verify.json').write_text(json.dumps({'checked': len(posts), 'problems': problems}, indent=2, default=str))
    print('VERIFY', len(posts), 'problems:', len(problems), flush=True)
    if problems:
        for pr in problems:
            print(' ', pr)
        sys.exit(1)


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
    if '--verify' in sys.argv or '--fix-times' in sys.argv:
        verify(pub, posts, fix_times='--fix-times' in sys.argv)
