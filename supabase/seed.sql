insert into public.helpers (helper_id, name, country, type, added_by, status)
values
  ('ABR-H-101', 'Maria Lopez', 'Myanmar', 'Ex-Singapore', 'Admin', 'active'),
  ('ABR-H-102', 'Siti Rahmah', 'Indonesia', 'New', 'Admin', 'follow up'),
  ('ABR-H-103', 'Asha Kumari', 'India', 'Transfer', 'Admin', 'active')
on conflict (helper_id) do nothing;

insert into public.employers (employer_id, employer_name, employer_number, handled_by, status)
values
  ('EMP-001', 'Tan Family', '+65 8111 2200', 'Admin', 'interview going'),
  ('EMP-002', 'Rahman Household', '+65 8222 9988', 'Admin', 'deal closed'),
  ('EMP-003', 'Wong Residence', '+65 8333 6677', 'Admin', 'negotiation')
on conflict do nothing;

with employer_rows as (
  select id, employer_id from public.employers
)
insert into public.deals (employer_id, helper_id, handled_by, status)
select employer_rows.id, null, seed.handled_by, seed.status
from (
  values
    ('EMP-001', 'Admin', 'interview going'),
    ('EMP-002', 'Admin', 'deal closed'),
    ('EMP-003', 'Admin', 'negotiation')
) as seed(employer_id, handled_by, status)
join employer_rows on employer_rows.employer_id = seed.employer_id
where not exists (
  select 1
  from public.deals existing
  where existing.employer_id = employer_rows.id
);

with deal_rows as (
  select deals.id, employers.employer_id
  from public.deals
  join public.employers on employers.id = deals.employer_id
)
insert into public.documentation_cases (
  deal_id,
  current_process,
  upfront_payment_status
)
select deal_rows.id, 'applying IPA', 'payment done'
from deal_rows
where deal_rows.employer_id = 'EMP-002'
  and not exists (
    select 1
    from public.documentation_cases existing
    where existing.deal_id = deal_rows.id
  );

with deal_rows as (
  select deals.id, employers.employer_id, employers.employer_name
  from public.deals
  join public.employers on employers.id = deals.employer_id
)
insert into public.finance (
  deal_id,
  reference,
  amount_received,
  supplier_payment,
  office_expense,
  salary,
  profit
)
select deal_rows.id, deal_rows.employer_name, 5100, 2800, 400, 300, 1600
from deal_rows
where deal_rows.employer_id = 'EMP-002'
  and not exists (
    select 1
    from public.finance existing
    where existing.deal_id = deal_rows.id
  );
