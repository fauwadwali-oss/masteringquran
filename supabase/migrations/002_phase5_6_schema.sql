-- Mastering Quran — Phase 5 & 6 schema extensions
-- Run in the Supabase SQL editor (project hlhtvstvblvdixygchil) after 001_mastering_quran_schema.sql.

-- ─────────────────────────────────────────────────────────────────────────────
-- Email-a-verse subscriptions (Phase 5b)
-- One row per user. Delivery worker (CF cron) reads rows whose local delivery
-- time matches the current hour, sends via Resend.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.mq_email_subscriptions (
    user_id            uuid primary key references auth.users (id) on delete cascade,
    email              text not null,
    delivery_hour      int  not null default 7 check (delivery_hour between 0 and 23),
    timezone           text not null default 'UTC',    -- IANA tz, e.g. 'America/New_York'
    active             boolean not null default true,
    last_sent_at       timestamptz,
    last_sent_verse    text,                           -- verse_key last delivered
    created_at         timestamptz not null default now(),
    updated_at         timestamptz not null default now()
);

create index if not exists mq_email_subs_active_hour_idx
    on public.mq_email_subscriptions (active, delivery_hour) where active = true;

alter table public.mq_email_subscriptions enable row level security;

create policy "mq_email_subs_self_all"
    on public.mq_email_subscriptions for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Service-role bypass is automatic; no special grant needed.

-- ─────────────────────────────────────────────────────────────────────────────
-- Web Push subscriptions (Phase 5c)
-- One user can have multiple subscriptions (phone + laptop + tablet).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.mq_push_subscriptions (
    id             uuid primary key default gen_random_uuid(),
    user_id        uuid not null references auth.users (id) on delete cascade,
    endpoint       text not null,                  -- push service URL from browser
    keys_p256dh    text not null,                  -- base64url
    keys_auth      text not null,                  -- base64url
    user_agent     text,
    delivery_hour  int  not null default 7 check (delivery_hour between 0 and 23),
    timezone       text not null default 'UTC',
    active         boolean not null default true,
    last_sent_at   timestamptz,
    created_at     timestamptz not null default now(),
    unique (user_id, endpoint)
);

create index if not exists mq_push_subs_active_hour_idx
    on public.mq_push_subscriptions (active, delivery_hour) where active = true;

alter table public.mq_push_subscriptions enable row level security;

create policy "mq_push_subs_self_all"
    on public.mq_push_subscriptions for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Zakat calculations history (Phase 6) — optional; user-owned
-- Lets users save snapshots, track year-over-year zakat, and resume drafts.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.mq_zakat_records (
    id               uuid primary key default gen_random_uuid(),
    user_id          uuid not null references auth.users (id) on delete cascade,
    snapshot         jsonb not null,                 -- full form state + computed values
    total_wealth     numeric(18, 2),
    zakat_due        numeric(18, 2),
    currency         text not null default 'USD',
    hijri_year       int,
    note             text,
    created_at       timestamptz not null default now()
);

create index if not exists mq_zakat_user_idx
    on public.mq_zakat_records (user_id, created_at desc);

alter table public.mq_zakat_records enable row level security;

create policy "mq_zakat_self_all"
    on public.mq_zakat_records for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
