-- Run in the Supabase SQL editor (project hlhtvstvblvdixygchil) BEFORE deploying the
-- site and the mq-daily-delivery worker from the same change.

-- ── Ask Wali: 5 questions per account per UTC day ───────────────────────────
-- Atomic, so parallel requests cannot pass the limit. Counts the question when it
-- is asked. A caller can only ever spend their own allowance.
create or replace function public.mq_claim_ai_question()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    daily_limit constant int := 5;
    uid uuid := auth.uid();
    today date := (now() at time zone 'utc')::date;
    used int;
begin
    if uid is null then
        raise exception 'not signed in' using errcode = '28000';
    end if;
    insert into public.mq_ai_usage as u (user_id, day, questions_used)
    values (uid, today, 1)
    on conflict (user_id, day) do update
        set questions_used = u.questions_used + 1
        where u.questions_used < daily_limit
    returning u.questions_used into used;
    if used is null then
        return jsonb_build_object('allowed', false, 'used', daily_limit, 'limit', daily_limit);
    end if;
    return jsonb_build_object('allowed', true, 'used', used, 'limit', daily_limit);
end;
$$;

revoke all on function public.mq_claim_ai_question() from public, anon;
grant execute on function public.mq_claim_ai_question() to authenticated;

-- ── Account deletion ────────────────────────────────────────────────────────
-- Removes the signed-in user. Every mq_ table cascades from auth.users, except
-- mq_auth_events, whose user_id is set to null. This Supabase project is shared with
-- nusratwaliventures.com, so a profile there with the same sign-in is removed too.
create or replace function public.mq_delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    uid uuid := auth.uid();
begin
    if uid is null then
        raise exception 'not signed in' using errcode = '28000';
    end if;
    delete from auth.users where id = uid;
end;
$$;

revoke all on function public.mq_delete_account() from public, anon;
grant execute on function public.mq_delete_account() to authenticated;

-- ── Daily email: own address only, one-click unsubscribe ────────────────────
alter table public.mq_email_subscriptions
    add column if not exists unsubscribe_token uuid not null default gen_random_uuid();

create unique index if not exists mq_email_subs_unsub_idx
    on public.mq_email_subscriptions (unsubscribe_token);

drop policy if exists "mq_email_subs_self_all" on public.mq_email_subscriptions;
drop policy if exists "mq_email_subs_self_read" on public.mq_email_subscriptions;
drop policy if exists "mq_email_subs_self_insert" on public.mq_email_subscriptions;
drop policy if exists "mq_email_subs_self_update" on public.mq_email_subscriptions;
drop policy if exists "mq_email_subs_self_delete" on public.mq_email_subscriptions;

create policy "mq_email_subs_self_read" on public.mq_email_subscriptions
    for select using (auth.uid() = user_id);
create policy "mq_email_subs_self_insert" on public.mq_email_subscriptions
    for insert with check (auth.uid() = user_id and lower(email) = lower(auth.jwt() ->> 'email'));
create policy "mq_email_subs_self_update" on public.mq_email_subscriptions
    for update using (auth.uid() = user_id)
    with check (auth.uid() = user_id and lower(email) = lower(auth.jwt() ->> 'email'));
create policy "mq_email_subs_self_delete" on public.mq_email_subscriptions
    for delete using (auth.uid() = user_id);

-- Rows saved under the old policy may hold another person's address. Point every row at
-- the account's own address; switch off the few whose account has no confirmed email.
update public.mq_email_subscriptions s
set email = u.email
from auth.users u
where u.id = s.user_id and u.email is not null and lower(s.email) is distinct from lower(u.email);

update public.mq_email_subscriptions s
set active = false
from auth.users u
where u.id = s.user_id and (u.email is null or u.email_confirmed_at is null);

-- Keep the delivery address in step when the account's email changes.
create or replace function public.mq_sync_subscription_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.mq_email_subscriptions set email = new.email
    where user_id = new.id and new.email is not null;
    return new;
end;
$$;

revoke all on function public.mq_sync_subscription_email() from public, anon, authenticated;

drop trigger if exists mq_on_auth_email_changed on auth.users;
create trigger mq_on_auth_email_changed
    after update of email on auth.users
    for each row when (old.email is distinct from new.email)
    execute procedure public.mq_sync_subscription_email();
