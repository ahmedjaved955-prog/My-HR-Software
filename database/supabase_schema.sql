-- Supabase HRMS Schema (public schema)
-- Assumes default Supabase auth.users table exists

create type user_role as enum ('ADMIN', 'HR', 'EMPLOYEE');
create type leave_status as enum ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
create type applicant_status as enum ('APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED', 'HIRED');
create type enrollment_status as enum ('ENROLLED', 'COMPLETED', 'CANCELLED');
create type payroll_status as enum ('DRAFT', 'FINALIZED');

-- Application users, 1-1 with auth.users
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'EMPLOYEE',
  full_name text,
  created_at timestamptz not null default now()
);

-- Employees
create table public.employees (
  id bigserial primary key,
  user_id uuid references public.users(id),
  employee_code text unique,
  status text not null default 'ACTIVE',
  department text,
  designation text,
  supervisor_id bigint references public.employees(id),
  date_of_joining date,
  employment_type text,
  base_salary numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index employees_user_id_idx on public.employees(user_id);
create index employees_supervisor_idx on public.employees(supervisor_id);

-- Attendance
create table public.attendance (
  id bigserial primary key,
  employee_id bigint not null references public.employees(id) on delete cascade,
  check_in timestamptz not null,
  check_out timestamptz,
  total_hours numeric(6,2),
  overtime_hours numeric(6,2),
  created_at timestamptz not null default now()
);

create index attendance_employee_date_idx on public.attendance(employee_id, check_in);

-- Leave types
create table public.leave_types (
  id bigserial primary key,
  name text not null,
  code text not null,
  default_allocation numeric(5,2) not null default 0,
  is_paid boolean not null default true,
  unique (code)
);

-- Leaves
create table public.leaves (
  id bigserial primary key,
  employee_id bigint not null references public.employees(id) on delete cascade,
  leave_type_id bigint not null references public.leave_types(id),
  start_date date not null,
  end_date date not null,
  total_days numeric(5,2) not null,
  status leave_status not null default 'PENDING',
  reason text,
  approver_id uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leaves_employee_idx on public.leaves(employee_id);
create index leaves_type_idx on public.leaves(leave_type_id);

-- Payroll
create table public.payroll (
  id bigserial primary key,
  employee_id bigint not null references public.employees(id) on delete cascade,
  month int not null,
  year int not null,
  gross_salary numeric(12,2) not null default 0,
  total_allowances numeric(12,2) not null default 0,
  total_deductions numeric(12,2) not null default 0,
  net_salary numeric(12,2) not null default 0,
  status payroll_status not null default 'DRAFT',
  generated_at timestamptz not null default now(),
  constraint payroll_employee_period_unique unique (employee_id, month, year)
);

create index payroll_employee_period_idx on public.payroll(employee_id, year, month);

create table public.payroll_items (
  id bigserial primary key,
  payroll_id bigint not null references public.payroll(id) on delete cascade,
  item_type text not null, -- 'ALLOWANCE' | 'DEDUCTION'
  label text not null,
  amount numeric(12,2) not null
);

create index payroll_items_payroll_idx on public.payroll_items(payroll_id);

-- Performance
create table public.performance_kpis (
  id bigserial primary key,
  name text not null,
  description text,
  weight numeric(5,2) not null default 1.0
);

create table public.performance (
  id bigserial primary key,
  employee_id bigint not null references public.employees(id) on delete cascade,
  kpi_id bigint not null references public.performance_kpis(id),
  period_start date not null,
  period_end date not null,
  score numeric(5,2) not null,
  comments text,
  reviewer_id uuid references public.users(id),
  created_at timestamptz not null default now()
);

create index performance_employee_period_idx on public.performance(employee_id, period_start, period_end);

-- Recruitment
create table public.jobs (
  id bigserial primary key,
  title text not null,
  department text,
  location text,
  employment_type text,
  status text not null default 'OPEN',
  description text,
  posted_at timestamptz not null default now()
);

create table public.applicants (
  id bigserial primary key,
  job_id bigint not null references public.jobs(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  status applicant_status not null default 'APPLIED',
  cv_storage_path text, -- path in Supabase storage
  interview_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create index applicants_job_idx on public.applicants(job_id);

-- Trainings
create table public.trainings (
  id bigserial primary key,
  title text not null,
  description text,
  start_date date,
  end_date date,
  provider text,
  max_participants int,
  certificate_template_path text
);

create table public.enrollments (
  id bigserial primary key,
  training_id bigint not null references public.trainings(id) on delete cascade,
  employee_id bigint not null references public.employees(id) on delete cascade,
  status enrollment_status not null default 'ENROLLED',
  completion_date date,
  certificate_path text,
  created_at timestamptz not null default now(),
  constraint enrollments_unique unique (training_id, employee_id)
);

create index enrollments_training_idx on public.enrollments(training_id);
create index enrollments_employee_idx on public.enrollments(employee_id);

-- Documents (stored in Supabase Storage)
create table public.documents (
  id bigserial primary key,
  employee_id bigint references public.employees(id) on delete set null,
  uploader_id uuid references public.users(id),
  bucket text not null,
  path text not null,
  mime_type text,
  doc_type text,
  created_at timestamptz not null default now()
);

create index documents_employee_idx on public.documents(employee_id);

-- Audit logs
create table public.audit_logs (
  id bigserial primary key,
  user_id uuid references public.users(id),
  action text not null,
  entity text not null,
  entity_id bigint,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_entity_idx on public.audit_logs(entity, entity_id);

-- Attendance trigger to auto-calc total_hours & overtime
create or replace function public.calc_attendance_hours()
returns trigger as $$
begin
  if new.check_out is not null then
    new.total_hours := round(extract(epoch from (new.check_out - new.check_in)) / 3600.0::numeric, 2);
    if new.total_hours > 8 then
      new.overtime_hours := new.total_hours - 8;
    else
      new.overtime_hours := 0;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_calc_attendance_hours
before update of check_out on public.attendance
for each row
execute procedure public.calc_attendance_hours();

-- Leave trigger to compute total_days
create or replace function public.calc_leave_total_days()
returns trigger as $$
begin
  new.total_days := (new.end_date - new.start_date) + 1;
  return new;
end;
$$ language plpgsql;

create trigger trg_calc_leave_total_days
before insert or update of start_date, end_date on public.leaves
for each row
execute procedure public.calc_leave_total_days();

-- Payroll trigger to auto net_salary
create or replace function public.calc_payroll_net_salary()
returns trigger as $$
declare
  allowances numeric(12,2);
  deductions numeric(12,2);
begin
  select coalesce(sum(amount), 0) into allowances
  from public.payroll_items
  where payroll_id = new.id and item_type = 'ALLOWANCE';

  select coalesce(sum(amount), 0) into deductions
  from public.payroll_items
  where payroll_id = new.id and item_type = 'DEDUCTION';

  new.total_allowances := allowances;
  new.total_deductions := deductions;
  new.net_salary := new.gross_salary + allowances - deductions;
  return new;
end;
$$ language plpgsql;

create trigger trg_calc_payroll_net_salary
before insert or update of gross_salary on public.payroll
for each row
execute procedure public.calc_payroll_net_salary();

-- Helper: current user role
create or replace function public.current_user_role()
returns user_role
language sql
stable
as $$
  select u.role
  from public.users u
  where u.id = auth.uid()
  limit 1;
$$;

-- Helper: current employee id for logged-in user
create or replace function public.current_employee_id()
returns bigint
language sql
stable
as $$
  select e.id
  from public.employees e
  where e.user_id = auth.uid()
  limit 1;
$$;

-- Sync auth.users -> public.users
create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  insert into public.users (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer
set search_path = public, auth;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_auth_user();

