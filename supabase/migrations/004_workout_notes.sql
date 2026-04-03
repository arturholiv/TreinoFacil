-- Regras gerais da ficha por treino (ex.: programa 45 min).
alter table public.workouts
  add column if not exists notes text not null default '';
