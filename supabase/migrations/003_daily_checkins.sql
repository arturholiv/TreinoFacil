-- Check-in diário (heatmap estilo contribuições)

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
