-- Insights (time log) and Analytics (site visits) for the admin.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to re-run.
-- Requires schema.sql to have been run first (uses public.is_admin()).

-- 1. Site analytics: privacy-friendly page views and events -----------------------
-- No cookies and no IP addresses are stored. A random id lives in the visitor's
-- sessionStorage only for the length of their browsing session.
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  session_id text not null check (char_length(session_id) between 8 and 64),
  kind text not null check (kind in ('view', 'action', 'message')),
  path text not null check (char_length(path) <= 300),
  label text check (label is null or char_length(label) <= 200),
  referrer text check (referrer is null or char_length(referrer) <= 200),
  device text check (device is null or device in ('desktop', 'tablet', 'mobile')),
  utm_source text check (utm_source is null or char_length(utm_source) <= 100),
  utm_medium text check (utm_medium is null or char_length(utm_medium) <= 100),
  utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 100)
);
create index if not exists page_views_created_idx on public.page_views (created_at desc);

alter table public.page_views enable row level security;

-- Visitors can only ADD rows. Only the admin can read or delete them.
drop policy if exists "anyone can record a visit" on public.page_views;
create policy "anyone can record a visit" on public.page_views
  for insert to anon, authenticated with check (true);

drop policy if exists "admin reads visits" on public.page_views;
create policy "admin reads visits" on public.page_views
  for select to authenticated using (public.is_admin());

drop policy if exists "admin deletes visits" on public.page_views;
create policy "admin deletes visits" on public.page_views
  for delete to authenticated using (public.is_admin());

-- 2. Insights: your own time log ----------------------------------------------------
create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  day date not null default current_date,
  category text not null check (category in ('work', 'side', 'social', 'rest')),
  minutes integer not null check (minutes between 1 and 1440),
  note text not null default '' check (char_length(note) <= 300),
  task_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists time_entries_day_idx on public.time_entries (day desc);

alter table public.time_entries enable row level security;

drop policy if exists "admin manages time entries" on public.time_entries;
create policy "admin manages time entries" on public.time_entries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
