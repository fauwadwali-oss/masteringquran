-- Surah playlists (signed-in readers only)
-- One row per playlist. Surahs are kept in play order as an int array, so a
-- reorder is a single update.

create table if not exists public.mq_playlists (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references auth.users (id) on delete cascade,
    name        text not null check (char_length(name) between 1 and 60),
    surahs      int[] not null default '{}',
    mode        text not null default 'arabic'
                check (mode in ('arabic', 'arabic-translation', 'translation')),
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index if not exists mq_playlists_user_idx
    on public.mq_playlists (user_id, created_at);

alter table public.mq_playlists enable row level security;

create policy "mq_playlists_self_all"
    on public.mq_playlists for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
