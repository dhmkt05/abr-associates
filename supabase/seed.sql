insert into public.helpers (helper_id, name, nationality, type, experience, skills, salary, status)
values
  ('ABR-H-101', 'Maria Lopez', 'Philippines', 'Transfer', '6 years', 'Infant care, cooking, elderly support', 750, 'Available'),
  ('ABR-H-102', 'Siti Rahmah', 'Indonesia', 'Ex-Singapore', '4 years', 'General housekeeping, pets, cooking', 680, 'Reserved'),
  ('ABR-H-103', 'Asha Kumari', 'India', 'Fresh', '2 years', 'Elderly care, Hindi cuisine', 620, 'Placed')
on conflict (helper_id) do nothing;

insert into public.employers (employer_name, country, phone, notes)
values
  ('Tan Family', 'Singapore', '+65 8111 2200', 'Looking for infant care support.'),
  ('Rahman Household', 'Singapore', '+65 8222 9988', 'Needs helper with elderly care experience.'),
  ('Wong Residence', 'Singapore', '+65 8333 6677', 'Open to transfer helper only.')
on conflict do nothing;

with helper_rows as (
  select id, helper_id from public.helpers
),
employer_rows as (
  select id, employer_name from public.employers
)
insert into public.deals (employer_id, helper_id, sales_stage, sales_staff, expected_amount, notes)
select employer_rows.id, helper_rows.id, deal_data.sales_stage, deal_data.sales_staff, deal_data.expected_amount, deal_data.notes
from (
  values
    ('Tan Family', 'ABR-H-101', 'Interview', 'Nur Aisyah', 4200, 'Interview scheduled for Tuesday.'),
    ('Rahman Household', 'ABR-H-103', 'Confirmed', 'Daniel Lim', 5100, 'Deposit received and documents in progress.'),
    ('Wong Residence', 'ABR-H-102', 'Negotiation', 'Sara Ong', 4700, 'Waiting for salary confirmation.')
) as deal_data(employer_name, helper_id, sales_stage, sales_staff, expected_amount, notes)
join employer_rows on employer_rows.employer_name = deal_data.employer_name
join helper_rows on helper_rows.helper_id = deal_data.helper_id
where not exists (
  select 1
  from public.deals existing
  where existing.employer_id = employer_rows.id
    and existing.helper_id = helper_rows.id
);

with deal_rows as (
  select deals.id, employers.employer_name, helpers.helper_id
  from public.deals
  join public.employers on employers.id = deals.employer_id
  join public.helpers on helpers.id = deals.helper_id
)
insert into public.documentation_cases (deal_id, stage, assigned_staff, status, remarks)
select deal_rows.id, seed.stage, seed.assigned_staff, seed.status, seed.remarks
from (
  values
    ('Rahman Household', 'ABR-H-103', 'Work Permit', 'Priya', 'Submitted', 'Awaiting ministry acknowledgement.'),
    ('Rahman Household', 'ABR-H-103', 'Travel', 'Amir', 'Pending', 'Ticket options requested.')
) as seed(employer_name, helper_id, stage, assigned_staff, status, remarks)
join deal_rows on deal_rows.employer_name = seed.employer_name and deal_rows.helper_id = seed.helper_id
where not exists (
  select 1
  from public.documentation_cases existing
  where existing.deal_id = deal_rows.id
    and existing.stage = seed.stage
);

with deal_rows as (
  select deals.id, employers.employer_name, helpers.helper_id
  from public.deals
  join public.employers on employers.id = deals.employer_id
  join public.helpers on helpers.id = deals.helper_id
)
insert into public.finance (deal_id, amount_received, supplier_payment, office_expense, profit)
select deal_rows.id, 5100, 2800, 400, 1900
from deal_rows
where deal_rows.employer_name = 'Rahman Household'
  and deal_rows.helper_id = 'ABR-H-103'
  and not exists (
    select 1
    from public.finance existing
    where existing.deal_id = deal_rows.id
  );
