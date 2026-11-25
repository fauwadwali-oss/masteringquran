-- Reading-plan progress that follows a signed-in reader across devices.
-- A reset keeps the row (reset_at) so another device cannot bring back the old days.
-- Rows go with the account (cascade).

create table if not exists public.mq_plan_progress (
    user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
    plan_id         text not null check (char_length(plan_id) between 1 and 60),
    started_at      timestamptz,
    completed_days  int[] not null default '{}' check (cardinality(completed_days) <= 400),
    reset_at        timestamptz,
    updated_at      timestamptz not null default now(),
    primary key (user_id, plan_id)
);

alter table public.mq_plan_progress enable row level security;

drop policy if exists "mq_plan_progress_self_all" on public.mq_plan_progress;
create policy "mq_plan_progress_self_all"
    on public.mq_plan_progress for all to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

revoke all on public.mq_plan_progress from anon;
grant select, insert, update, delete on public.mq_plan_progress to authenticated;

-- Combines this device's copy with the saved one in a single step, so two devices saving at once
-- cannot lose a day or undo a reset. Same rules as client/src/lib/plan-progress.ts.
-- With nothing on the device (p_started_at and p_reset_at null) it only reads.
create or replace function public.mq_sync_plan(
    p_plan_id text, p_started_at timestamptz, p_completed_days int[], p_reset_at timestamptz
)
returns table (plan_id text, started_at timestamptz, completed_days int[], reset_at timestamptz)
language plpgsql
security invoker
set search_path = ''
as $$
#variable_conflict use_column
declare
    uid uuid := (select auth.uid());
    cur public.mq_plan_progress%rowtype;
    new_reset timestamptz;
    new_start timestamptz;
    new_days int[];
begin
    if uid is null then
        raise exception 'not signed in' using errcode = '28000';
    end if;
    if p_started_at is not null or p_reset_at is not null then
        insert into public.mq_plan_progress (user_id, plan_id) values (uid, p_plan_id)
            on conflict (user_id, plan_id) do nothing;
        select * into cur from public.mq_plan_progress t where t.user_id = uid and t.plan_id = p_plan_id for update;
        new_reset := greatest(cur.reset_at, p_reset_at);
        select min(r.s) into new_start
            from (values (cur.started_at), (p_started_at)) as r(s)
            where r.s is not null and (new_reset is null or r.s > new_reset);
        select coalesce(array_agg(distinct d order by d), '{}') into new_days
            from (values (cur.started_at, cur.completed_days), (p_started_at, p_completed_days)) as r(s, days),
                 unnest(r.days) as d
            where r.s is not null and (new_reset is null or r.s > new_reset) and d between 1 and 400;
        update public.mq_plan_progress t
            set started_at = new_start, completed_days = new_days, reset_at = new_reset, updated_at = now()
            where t.user_id = uid and t.plan_id = p_plan_id;
    end if;
    return query select t.plan_id, t.started_at, t.completed_days, t.reset_at
        from public.mq_plan_progress t where t.user_id = uid and t.plan_id = p_plan_id;
end;
$$;

revoke all on function public.mq_sync_plan(text, timestamptz, int[], timestamptz) from public, anon;
grant execute on function public.mq_sync_plan(text, timestamptz, int[], timestamptz) to authenticated;
