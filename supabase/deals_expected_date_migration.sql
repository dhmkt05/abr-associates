alter table public.deals
  add column if not exists expected_date date;
