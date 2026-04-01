-- Treino Fácil — run in Supabase SQL Editor (or as migration)

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  day_of_week text not null check (
    day_of_week in (
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday'
    )
  ),
  created_at timestamptz not null default now()
);

create index workouts_user_id_idx on public.workouts (user_id);
create index workouts_user_day_idx on public.workouts (user_id, day_of_week);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  name text not null,
  sets int not null default 3 check (sets > 0),
  reps text not null default '10'
);

create index exercises_workout_id_idx on public.exercises (workout_id);

create table public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  log_date date not null,
  completed boolean not null default true,
  unique (user_id, exercise_id, log_date)
);

create index exercise_logs_user_date_idx on public.exercise_logs (user_id, log_date);

alter table public.workouts enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_logs enable row level security;

create policy "Users select own workouts"
  on public.workouts for select
  using (auth.uid() = user_id);

create policy "Users insert own workouts"
  on public.workouts for insert
  with check (auth.uid() = user_id);

create policy "Users update own workouts"
  on public.workouts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own workouts"
  on public.workouts for delete
  using (auth.uid() = user_id);

create policy "Users manage exercises of own workouts"
  on public.exercises for all
  using (
    exists (
      select 1
      from public.workouts w
      where w.id = exercises.workout_id
        and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.workouts w
      where w.id = exercises.workout_id
        and w.user_id = auth.uid()
    )
  );

create policy "Users select own exercise_logs"
  on public.exercise_logs for select
  using (auth.uid() = user_id);

create policy "Users insert own exercise_logs"
  on public.exercise_logs for insert
  with check (auth.uid() = user_id);

create policy "Users update own exercise_logs"
  on public.exercise_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own exercise_logs"
  on public.exercise_logs for delete
  using (auth.uid() = user_id);
