-- Sign-up / sign-in / password reset funnel events.
-- One row per step (see client/src/lib/auth-analytics.ts). Insert-only from
-- the client; nobody can read rows back through the API. Query it in the
-- Supabase SQL editor. No email addresses or passwords are stored.

create table if not exists public.mq_auth_events (
    id          bigint generated always as identity primary key,
    created_at  timestamptz not null default now(),
    step        text not null check (char_length(step) <= 40),
    method      text check (method in ('password', 'magic_link')),
    view        text check (char_length(view) <= 40),
    error_code  text check (char_length(error_code) <= 80),
    source      text check (char_length(source) <= 80),
    user_id     uuid references auth.users (id) on delete set null,
    flow_id     text not null check (char_length(flow_id) <= 64),  -- random per browser tab session
    platform    text not null check (char_length(platform) <= 16), -- web | ios | android
    path        text check (char_length(path) <= 200)
);

create index if not exists mq_auth_events_created_idx on public.mq_auth_events (created_at desc);
create index if not exists mq_auth_events_step_idx on public.mq_auth_events (step, created_at desc);

alter table public.mq_auth_events enable row level security;

-- Anyone may log a step; a signed-in user may only attach their own id.
create policy "mq_auth_events_insert"
    on public.mq_auth_events for insert
    to anon, authenticated
    with check (user_id is null or user_id = auth.uid());

-- Handy funnel view for the dashboard (service role / SQL editor only).
create or replace view public.mq_auth_funnel_daily
with (security_invoker = true) as
select date_trunc('day', created_at)::date as day,
       platform,
       step,
       method,
       count(*) as events,
       count(distinct flow_id) as flows
from public.mq_auth_events
group by 1, 2, 3, 4;

revoke all on public.mq_auth_funnel_daily from anon, authenticated;
