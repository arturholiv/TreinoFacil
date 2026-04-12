-- Treino Fácil — run in Supabase SQL Editor (or as migration)

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  notes text not null default '',
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
  reps text not null default '10',
  weight text not null default '',
  notes text not null default ''
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

create table public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  checkin_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, checkin_date)
);

create index daily_checkins_user_date_idx on public.daily_checkins (user_id, checkin_date desc);

alter table public.daily_checkins enable row level security;

create policy "Users select own daily_checkins"
  on public.daily_checkins for select
  using (auth.uid() = user_id);

create policy "Users insert own daily_checkins"
  on public.daily_checkins for insert
  with check (auth.uid() = user_id);

create policy "Users delete own daily_checkins"
  on public.daily_checkins for delete
  using (auth.uid() = user_id);

-- Desafio 60 dias — ver também supabase/migrations/005_sixty_day_challenge.sql

create table public.sixty_day_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  start_date date not null,
  stake_reais numeric(12, 2) not null default 2000,
  status text not null default 'active' check (status in ('active', 'won', 'lost', 'abandoned')),
  stopped_cardio boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index sixty_day_challenges_one_active_per_user_idx
  on public.sixty_day_challenges (user_id)
  where (status = 'active');

create index sixty_day_challenges_user_created_idx
  on public.sixty_day_challenges (user_id, created_at desc);

alter table public.sixty_day_challenges enable row level security;

create policy "Users select own sixty_day_challenges"
  on public.sixty_day_challenges for select
  using (auth.uid() = user_id);

create policy "Users insert own sixty_day_challenges"
  on public.sixty_day_challenges for insert
  with check (auth.uid() = user_id);

create policy "Users update own sixty_day_challenges"
  on public.sixty_day_challenges for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own sixty_day_challenges"
  on public.sixty_day_challenges for delete
  using (auth.uid() = user_id);

create table public.sixty_day_challenge_days (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.sixty_day_challenges (id) on delete cascade,
  log_date date not null,
  workout_ok boolean not null,
  cardio_ok boolean not null,
  diet_ok boolean not null,
  sleep_ok boolean not null,
  unique (challenge_id, log_date)
);

create index sixty_day_challenge_days_challenge_date_idx
  on public.sixty_day_challenge_days (challenge_id, log_date);

alter table public.sixty_day_challenge_days enable row level security;

create policy "Users select own sixty_day_challenge_days"
  on public.sixty_day_challenge_days for select
  using (
    exists (
      select 1
      from public.sixty_day_challenges c
      where c.id = sixty_day_challenge_days.challenge_id
        and c.user_id = auth.uid()
    )
  );

create policy "Users insert own sixty_day_challenge_days"
  on public.sixty_day_challenge_days for insert
  with check (
    exists (
      select 1
      from public.sixty_day_challenges c
      where c.id = sixty_day_challenge_days.challenge_id
        and c.user_id = auth.uid()
    )
  );

create policy "Users update own sixty_day_challenge_days"
  on public.sixty_day_challenge_days for update
  using (
    exists (
      select 1
      from public.sixty_day_challenges c
      where c.id = sixty_day_challenge_days.challenge_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.sixty_day_challenges c
      where c.id = sixty_day_challenge_days.challenge_id
        and c.user_id = auth.uid()
    )
  );

create policy "Users delete own sixty_day_challenge_days"
  on public.sixty_day_challenge_days for delete
  using (
    exists (
      select 1
      from public.sixty_day_challenges c
      where c.id = sixty_day_challenge_days.challenge_id
        and c.user_id = auth.uid()
    )
  );
