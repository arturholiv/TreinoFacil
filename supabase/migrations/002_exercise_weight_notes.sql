-- Adiciona peso e notas aos exercícios (execute no SQL Editor se o projeto já existia antes)

alter table public.exercises
  add column if not exists weight text not null default '';

alter table public.exercises
  add column if not exists notes text not null default '';
