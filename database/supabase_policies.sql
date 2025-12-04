-- Supabase HRMS RLS policies
-- Run after supabase_schema.sql

-- Enable RLS
alter table public.users       enable row level security;
alter table public.employees   enable row level security;
alter table public.attendance  enable row level security;
alter table public.leave_types enable row level security;
alter table public.leaves      enable row level security;
alter table public.payroll     enable row level security;
alter table public.payroll_items enable row level security;
alter table public.performance_kpis enable row level security;
alter table public.performance enable row level security;
alter table public.jobs        enable row level security;
alter table public.applicants  enable row level security;
alter table public.trainings   enable row level security;
alter table public.enrollments enable row level security;
alter table public.documents   enable row level security;
alter table public.audit_logs  enable row level security;

-- USERS
create policy users_select_self_or_hr_admin
on public.users for select
using (
  id = auth.uid() or current_user_role() in ('ADMIN','HR')
);

create policy users_update_admin
on public.users for update
using (current_user_role() = 'ADMIN')
with check (current_user_role() = 'ADMIN');

create policy users_insert_admin
on public.users for insert
with check (current_user_role() = 'ADMIN');

-- EMPLOYEES
create policy employees_select_self_or_hr_admin
on public.employees for select
using (
  current_user_role() in ('ADMIN','HR')
  or user_id = auth.uid()
);

create policy employees_modify_hr_admin
on public.employees for all
using (current_user_role() in ('ADMIN','HR'))
with check (current_user_role() in ('ADMIN','HR'));

-- ATTENDANCE
create policy attendance_select_self_or_hr_admin
on public.attendance for select
using (
  current_user_role() in ('ADMIN','HR')
  or employee_id = current_employee_id()
);

create policy attendance_insert_self_or_hr_admin
on public.attendance for insert
with check (
  current_user_role() in ('ADMIN','HR')
  or employee_id = current_employee_id()
);

create policy attendance_update_self_or_hr_admin
on public.attendance for update
using (
  current_user_role() in ('ADMIN','HR')
  or employee_id = current_employee_id()
)
with check (
  current_user_role() in ('ADMIN','HR')
  or employee_id = current_employee_id()
);

-- LEAVE TYPES (read-only for all authenticated)
create policy leave_types_select_all
on public.leave_types for select
using (auth.role() = 'authenticated');

create policy leave_types_modify_hr_admin
on public.leave_types for all
using (current_user_role() in ('ADMIN','HR'))
with check (current_user_role() in ('ADMIN','HR'));

-- LEAVES
create policy leaves_select_self_or_hr_admin
on public.leaves for select
using (
  current_user_role() in ('ADMIN','HR')
  or employee_id = current_employee_id()
);

create policy leaves_insert_self
on public.leaves for insert
with check (employee_id = current_employee_id());

create policy leaves_update_hr_admin
on public.leaves for update
using (current_user_role() in ('ADMIN','HR'))
with check (current_user_role() in ('ADMIN','HR'));

-- PAYROLL
create policy payroll_select_self_or_hr_admin
on public.payroll for select
using (
  current_user_role() in ('ADMIN','HR')
  or employee_id = current_employee_id()
);

create policy payroll_modify_hr_admin
on public.payroll for all
using (current_user_role() in ('ADMIN','HR'))
with check (current_user_role() in ('ADMIN','HR'));

create policy payroll_items_hr_admin
on public.payroll_items for all
using (current_user_role() in ('ADMIN','HR'))
with check (current_user_role() in ('ADMIN','HR'));

-- PERFORMANCE
create policy performance_kpis_read_all
on public.performance_kpis for select
using (auth.role() = 'authenticated');

create policy performance_kpis_modify_hr_admin
on public.performance_kpis for all
using (current_user_role() in ('ADMIN','HR'))
with check (current_user_role() in ('ADMIN','HR'));

create policy performance_select_self_or_hr_admin
on public.performance for select
using (
  current_user_role() in ('ADMIN','HR')
  or employee_id = current_employee_id()
);

create policy performance_modify_hr_admin
on public.performance for all
using (current_user_role() in ('ADMIN','HR'))
with check (current_user_role() in ('ADMIN','HR'));

-- JOBS & APPLICANTS
create policy jobs_read_all
on public.jobs for select
using (auth.role() = 'authenticated');

create policy jobs_modify_hr_admin
on public.jobs for all
using (current_user_role() in ('ADMIN','HR'))
with check (current_user_role() in ('ADMIN','HR'));

create policy applicants_read_hr_admin
on public.applicants for select
using (current_user_role() in ('ADMIN','HR'));

create policy applicants_modify_hr_admin
on public.applicants for all
using (current_user_role() in ('ADMIN','HR'))
with check (current_user_role() in ('ADMIN','HR'));

-- TRAININGS & ENROLLMENTS
create policy trainings_read_all
on public.trainings for select
using (auth.role() = 'authenticated');

create policy trainings_modify_hr_admin
on public.trainings for all
using (current_user_role() in ('ADMIN','HR'))
with check (current_user_role() in ('ADMIN','HR'));

create policy enrollments_select_self_or_hr_admin
on public.enrollments for select
using (
  current_user_role() in ('ADMIN','HR')
  or employee_id = current_employee_id()
);

create policy enrollments_insert_self
on public.enrollments for insert
with check (employee_id = current_employee_id());

create policy enrollments_modify_hr_admin
on public.enrollments for update
using (current_user_role() in ('ADMIN','HR'))
with check (current_user_role() in ('ADMIN','HR'));

-- DOCUMENTS
create policy documents_select_self_or_hr_admin
on public.documents for select
using (
  current_user_role() in ('ADMIN','HR')
  or employee_id = current_employee_id()
);

create policy documents_insert_self_or_hr_admin
on public.documents for insert
with check (
  current_user_role() in ('ADMIN','HR')
  or employee_id = current_employee_id()
);

create policy documents_update_hr_admin
on public.documents for update
using (current_user_role() in ('ADMIN','HR'))
with check (current_user_role() in ('ADMIN','HR'));

-- AUDIT LOGS (read-only HR/Admin)
create policy audit_logs_read_hr_admin
on public.audit_logs for select
using (current_user_role() in ('ADMIN','HR'));

create policy audit_logs_insert_all
on public.audit_logs for insert
with check (auth.role() = 'authenticated');
