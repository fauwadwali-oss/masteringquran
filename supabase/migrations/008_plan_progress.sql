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
