create extension if not exists "pgcrypto";

create table if not exists public.helpers (
  id uuid primary key default gen_random_uuid(),
  helper_id text not null unique,
  name text not null,
  nationality text not null,
  type text not null,
  experience text not null,
  skills text not null default '',
  salary numeric(12, 2) not null default 0,
  status text not null default 'Available',
  created_at timestamptz not null default now()
);

create table if not exists public.employers (
  id uuid primary key default gen_random_uuid(),
  employer_name text not null,
  country text not null,
  phone text not null,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employers(id) on delete cascade,
  helper_id uuid not null references public.helpers(id) on delete restrict,
  sales_stage text not null default 'New Lead',
  sales_staff text not null,
  expected_amount numeric(12, 2) not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.documentation_cases (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  stage text not null,
  assigned_staff text not null,
  status text not null,
  remarks text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.finance (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  amount_received numeric(12, 2) not null default 0,
  supplier_payment numeric(12, 2) not null default 0,
  office_expense numeric(12, 2) not null default 0,
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
