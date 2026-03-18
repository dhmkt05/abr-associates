create extension if not exists "pgcrypto";

create table if not exists public.helpers (
  id uuid primary key default gen_random_uuid(),
  helper_id text not null unique,
  name text not null,
  country text not null default '',
  type text not null default 'other',
  added_by text not null default 'Admin',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.employers (
  id uuid primary key default gen_random_uuid(),
  employer_id text not null default '',
  employer_name text not null,
  employer_number text not null default '',
  handled_by text not null default 'Admin',
  status text not null default 'prospect',
  created_at timestamptz not null default now()
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employers(id) on delete cascade,
  helper_id uuid references public.helpers(id) on delete restrict,
  handled_by text not null default 'Admin',
  status text not null default 'prospect',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.documentation_cases (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  current_process text not null default 'applying IPA',
  upfront_payment_status text not null default 'prospect',
  created_at timestamptz not null default now()
);

create table if not exists public.finance (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references public.deals(id) on delete cascade,
  reference text not null default '',
  amount_received numeric(12, 2) not null default 0,
  supplier_payment numeric(12, 2) not null default 0,
  office_expense numeric(12, 2) not null default 0,
  salary numeric(12, 2) not null default 0,
  profit numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.helpers enable row level security;
alter table public.employers enable row level security;
alter table public.deals enable row level security;
alter table public.documentation_cases enable row level security;
alter table public.finance enable row level security;

create policy if not exists "authenticated helpers access"
on public.helpers
for all
to authenticated
using (true)
with check (true);

create policy if not exists "authenticated employers access"
on public.employers
for all
to authenticated
using (true)
with check (true);

create policy if not exists "authenticated deals access"
on public.deals
for all
to authenticated
using (true)
with check (true);

create policy if not exists "authenticated documentation access"
on public.documentation_cases
for all
to authenticated
using (true)
with check (true);

create policy if not exists "authenticated finance access"
on public.finance
for all
to authenticated
using (true)
with check (true);
