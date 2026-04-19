-- Mastering Quran schema — to be run in Supabase SQL editor
-- All tables prefixed mq_ to coexist with the nusratwaliventures tables in the same project.
-- RLS is enabled on every user-data table so the same policies protect web, iOS, Android, React Native.

-- ─────────────────────────────────────────────────────────────────────────────
-- Profiles (one row per authenticated user)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.mq_profiles (
    id           uuid primary key references auth.users (id) on delete cascade,
    display_name text,
    avatar_url   text,
    created_at   timestamptz not null default now(),
    last_active  timestamptz not null default now()
);

alter table public.mq_profiles enable row level security;

create policy "mq_profiles_self_read"
    on public.mq_profiles for select
    using (auth.uid() = id);

create policy "mq_profiles_self_insert"
    on public.mq_profiles for insert
    with check (auth.uid() = id);

create policy "mq_profiles_self_update"
    on public.mq_profiles for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- Trigger to auto-create profile on signup
create or replace function public.mq_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.mq_profiles (id, display_name)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists mq_on_auth_user_created on auth.users;
create trigger mq_on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.mq_handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- Bookmarks — verse-level favorites
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.mq_bookmarks (
    id         uuid primary key default gen_random_uuid(),
    user_id    uuid not null references auth.users (id) on delete cascade,
    verse_key  text not null,      -- e.g. "2:255"
    surah      int  not null,
    ayah       int  not null,
    label      text,
    created_at timestamptz not null default now(),
    unique (user_id, verse_key)
);

create index if not exists mq_bookmarks_user_idx on public.mq_bookmarks (user_id, created_at desc);

alter table public.mq_bookmarks enable row level security;

create policy "mq_bookmarks_self_all"
    on public.mq_bookmarks for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Notes — one note per verse per user (upsertable)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.mq_notes (
    id         uuid primary key default gen_random_uuid(),
    user_id    uuid not null references auth.users (id) on delete cascade,
    verse_key  text not null,
    body       text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, verse_key)
);

create index if not exists mq_notes_user_idx on public.mq_notes (user_id, updated_at desc);

alter table public.mq_notes enable row level security;

create policy "mq_notes_self_all"
    on public.mq_notes for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Memorization (Hifz) tracker
-- status: new | learning | memorized | review_due
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.mq_memorization (
    id                uuid primary key default gen_random_uuid(),
    user_id           uuid not null references auth.users (id) on delete cascade,
    verse_key         text not null,
    surah             int  not null,
    ayah              int  not null,
    status            text not null check (status in ('new', 'learning', 'memorized', 'review_due')),
    confidence        int  not null default 0,      -- 0..5, Anki-like
    last_reviewed_at  timestamptz,
    next_review_at    timestamptz,
    created_at        timestamptz not null default now(),
    updated_at        timestamptz not null default now(),
    unique (user_id, verse_key)
);

create index if not exists mq_memorization_user_idx       on public.mq_memorization (user_id, status);
create index if not exists mq_memorization_next_review_idx on public.mq_memorization (user_id, next_review_at);

alter table public.mq_memorization enable row level security;

create policy "mq_memorization_self_all"
    on public.mq_memorization for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Reading progress + streaks
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.mq_reading_activity (
    id         uuid primary key default gen_random_uuid(),
    user_id    uuid not null references auth.users (id) on delete cascade,
    day        date not null,                   -- UTC date
    verses_read int  not null default 0,
    minutes    int  not null default 0,
    last_verse_key text,
    unique (user_id, day)
);

create index if not exists mq_reading_activity_user_idx on public.mq_reading_activity (user_id, day desc);

alter table public.mq_reading_activity enable row level security;

create policy "mq_reading_activity_self_all"
    on public.mq_reading_activity for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- AI usage log (for per-user quota enforcement, later)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.mq_ai_usage (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references auth.users (id) on delete cascade,
    day             date not null,
    questions_used  int  not null default 0,
    input_tokens    bigint not null default 0,
    output_tokens   bigint not null default 0,
    unique (user_id, day)
);

create index if not exists mq_ai_usage_user_idx on public.mq_ai_usage (user_id, day desc);

alter table public.mq_ai_usage enable row level security;

create policy "mq_ai_usage_self_read"
    on public.mq_ai_usage for select
    using (auth.uid() = user_id);

-- Writes happen from the edge function (service role), not from the client.

-- ─────────────────────────────────────────────────────────────────────────────
-- End of schema
-- ─────────────────────────────────────────────────────────────────────────────
