alter table public.helpers
  add column if not exists country text not null default '',
  add column if not exists added_by text not null default 'Admin';

update public.helpers
set country = coalesce(nullif(country, ''), nationality, '')
where country = '';

alter table public.employers
  add column if not exists employer_id text not null default '',
  add column if not exists employer_number text not null default '',
  add column if not exists handled_by text not null default 'Admin',
  add column if not exists status text not null default 'prospect';

update public.employers
set
  employer_id = coalesce(nullif(employer_id, ''), employer_code, 'EMP-' || upper(substr(id::text, 1, 8))),
  employer_number = coalesce(nullif(employer_number, ''), phone, ''),
  handled_by = coalesce(nullif(handled_by, ''), 'Admin'),
  status = coalesce(nullif(status, ''), 'prospect');

alter table public.deals
  alter column helper_id drop not null;

alter table public.deals
  add column if not exists handled_by text not null default 'Admin',
  add column if not exists status text not null default 'prospect';

update public.deals
set
  handled_by = coalesce(nullif(handled_by, ''), sales_staff, 'Admin'),
  status = case lower(coalesce(status, sales_stage, ''))
    when 'new lead' then 'prospect'
    when 'interview' then 'interview going'
    when 'negotiation' then 'negotiation'
    when 'confirmed' then 'deal closed'
    else coalesce(nullif(status, ''), 'prospect')
  end;

alter table public.documentation_cases
  add column if not exists current_process text not null default 'applying IPA',
  add column if not exists upfront_payment_status text not null default 'prospect';

update public.documentation_cases
set
  current_process = case lower(coalesce(current_process, stage, ''))
    when 'ipa' then 'applying IPA'
    when 'work permit' then 'work permit'
    when 'going to take flight' then 'going to take flight'
    when 'flight ticket' then 'flight ticket'
    when 'insurance' then 'insurance'
    when 'work permit and going to take flight' then 'work permit'
    when 'arrival' then 'reach employer house'
    else coalesce(nullif(current_process, ''), 'applying IPA')
  end,
  upfront_payment_status = case lower(coalesce(upfront_payment_status, status, ''))
    when 'payment done' then 'payment done'
    else 'prospect'
  end;

alter table public.finance
  alter column deal_id drop not null;

alter table public.finance
  add column if not exists reference text not null default '',
  add column if not exists salary numeric(12, 2) not null default 0;

update public.finance f
set reference = coalesce(
  nullif(f.reference, ''),
  e.employer_name,
  'General finance'
)
from public.deals d
left join public.employers e on e.id = d.employer_id
where f.deal_id = d.id
  and f.reference = '';

update public.finance
set profit = amount_received - supplier_payment - office_expense - salary;
