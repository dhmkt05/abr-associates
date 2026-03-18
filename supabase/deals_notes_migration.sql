alter table public.deals
  add column if not exists notes text not null default '';
