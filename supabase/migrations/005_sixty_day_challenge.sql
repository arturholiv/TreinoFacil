-- Desafio 60 dias (contrato + tracking diário)

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
