-- Learn Arabic lesson progress (Milestone 1)
-- One row per user per lesson. Lets users pick up where they left off
-- across devices once signed in.

create table if not exists public.mq_learn_progress (
    user_id       uuid not null references auth.users (id) on delete cascade,
    lesson_id     text not null,                 -- e.g. "letters", "harakat", "first-surah"
    completed_at  timestamptz not null default now(),
    score         int,                           -- optional drill score 0-100
    primary key (user_id, lesson_id)
);

create index if not exists mq_learn_progress_user_idx
    on public.mq_learn_progress (user_id, completed_at desc);

alter table public.mq_learn_progress enable row level security;

create policy "mq_learn_progress_self_all"
    on public.mq_learn_progress for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
