-- Tasks board for the admin. Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run. Requires schema.sql to have been run first (uses public.is_admin()).

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '',
  status text not null default 'open' check (status in ('open', 'in_progress', 'blocked', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  tag text not null default '',
  checklist jsonb not null default '[]'::jsonb,
  time_seconds integer not null default 0,
  timer_started_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

drop policy if exists "admin manages tasks" on public.tasks;
create policy "admin manages tasks" on public.tasks
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
