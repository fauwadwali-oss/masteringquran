-- Run in the Supabase SQL editor (project hlhtvstvblvdixygchil) BEFORE deploying the
-- site from the same change.
-- Reports of Ask Wali answers, sent from inside the app. Written only through the
-- function below, at most 10 per account per UTC day. Deleted with the account.

create table if not exists public.mq_ai_reports (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    reason text not null check (reason in ('offensive', 'incorrect', 'source', 'other')),
    details text not null default '' check (char_length(details) <= 1000),
    question text not null check (char_length(question) <= 2000),
    answer text not null check (char_length(answer) <= 12000),
    created_at timestamptz not null default now()
);

create index if not exists mq_ai_reports_user_day_idx on public.mq_ai_reports (user_id, created_at);

-- No policies: readers cannot see or change reports. The owner reads them in the dashboard.
alter table public.mq_ai_reports enable row level security;
revoke all on public.mq_ai_reports from anon, authenticated;

create or replace function public.mq_report_answer(p_reason text, p_details text, p_question text, p_answer text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    uid uuid := auth.uid();
    new_id uuid;
begin
    if uid is null then
        raise exception 'not signed in' using errcode = '28000';
    end if;
    -- One at a time per account, so parallel requests cannot pass the limit.
    perform pg_advisory_xact_lock(hashtextextended('mq_ai_reports:' || uid::text, 0));
    if (select count(*) from public.mq_ai_reports r
        where r.user_id = uid and r.created_at >= date_trunc('day', now() at time zone 'utc') at time zone 'utc') >= 10 then
        return null;
    end if;
    insert into public.mq_ai_reports (user_id, reason, details, question, answer)
    values (uid, p_reason, p_details, p_question, p_answer)
    returning id into new_id;
    return new_id;
end;
$$;

revoke all on function public.mq_report_answer(text, text, text, text) from public, anon;
grant execute on function public.mq_report_answer(text, text, text, text) to authenticated;
