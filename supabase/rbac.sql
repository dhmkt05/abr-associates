create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('admin', 'data_team', 'sales_team', 'documentation_team')),
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  role text not null check (role in ('admin', 'data_team', 'sales_team', 'documentation_team')),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  description text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "profiles self or admin select" on public.profiles;
create policy "profiles self or admin select"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
  or exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);

drop policy if exists "profiles admin manage" on public.profiles;
create policy "profiles admin manage"
on public.profiles
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);

drop policy if exists "activity logs admin read" on public.activity_logs;
create policy "activity logs admin read"
on public.activity_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);

drop policy if exists "activity logs authenticated insert" on public.activity_logs;
create policy "activity logs authenticated insert"
on public.activity_logs
for insert
to authenticated
with check (auth.uid() = user_id);

-- Starter guidance for existing users:
-- 1. Create/authenticate users in Supabase Auth first.
-- 2. Then insert one profile row per user, for example:
--
-- insert into public.profiles (id, email, full_name, role)
-- values
--   ('USER_UUID_FROM_AUTH', 'admin@abrassociates.com', 'Manager Name', 'admin'),
--   ('USER_UUID_FROM_AUTH', 'data@abrassociates.com', 'Data Team User', 'data_team'),
--   ('USER_UUID_FROM_AUTH', 'sales@abrassociates.com', 'Sales Team User', 'sales_team'),
--   ('USER_UUID_FROM_AUTH', 'docs@abrassociates.com', 'Documentation User', 'documentation_team');
