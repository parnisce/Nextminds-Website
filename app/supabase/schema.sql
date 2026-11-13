-- NextMinds admin schema. Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run (idempotent).

-- 1. Who is an admin ---------------------------------------------------------
create table if not exists public.admins (
  email text primary key,
  created_at timestamptz not null default now()
);

-- >>> CHANGE THIS to the email you will sign in with (create the same user in
-- >>> Authentication -> Users -> Add user, with "Auto Confirm User" ticked).
insert into public.admins (email) values ('you@example.com')
on conflict (email) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

alter table public.admins enable row level security;
drop policy if exists "admins read own row" on public.admins;
create policy "admins read own row" on public.admins
  for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- 2. Homepage content (one JSON document per key) ----------------------------
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;

drop policy if exists "content is public" on public.site_content;
create policy "content is public" on public.site_content
  for select to anon, authenticated using (true);

drop policy if exists "admin writes content" on public.site_content;
create policy "admin writes content" on public.site_content
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 3. Blog posts ---------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  cover_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.posts enable row level security;

drop policy if exists "published posts are public" on public.posts;
create policy "published posts are public" on public.posts
  for select to anon, authenticated using (status = 'published');

drop policy if exists "admin manages posts" on public.posts;
create policy "admin manages posts" on public.posts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 4. Contact-page enquiries ----------------------------------------------------
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  phone text check (phone is null or char_length(phone) <= 40),
  service text check (service is null or char_length(service) <= 120),
  message text not null check (char_length(message) between 1 and 5000),
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now()
);
create index if not exists enquiries_created_idx on public.enquiries (created_at desc);
alter table public.enquiries enable row level security;

-- Visitors can only ADD an enquiry (always as status 'new'). They cannot read any.
drop policy if exists "anyone can send an enquiry" on public.enquiries;
create policy "anyone can send an enquiry" on public.enquiries
  for insert to anon, authenticated with check (status = 'new');

drop policy if exists "admin manages enquiries" on public.enquiries;
create policy "admin manages enquiries" on public.enquiries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 5. Image uploads for blog covers --------------------------------------------
insert into storage.buckets (id, name, public)
values ('blog', 'blog', true)
on conflict (id) do nothing;

drop policy if exists "blog images are public" on storage.objects;
create policy "blog images are public" on storage.objects
  for select to anon, authenticated using (bucket_id = 'blog');

drop policy if exists "admin uploads blog images" on storage.objects;
create policy "admin uploads blog images" on storage.objects
  for all to authenticated
  using (bucket_id = 'blog' and public.is_admin())
  with check (bucket_id = 'blog' and public.is_admin());
