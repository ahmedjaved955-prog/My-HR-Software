-- Supabase Storage setup for HRMS
-- Run in the SQL editor with appropriate privileges.

insert into storage.buckets (id, name, public)
values
  ('employee-documents', 'employee-documents', false),
  ('cv-uploads', 'cv-uploads', false),
  ('training-certificates', 'training-certificates', false),
  ('salary-slips', 'salary-slips', false)
on conflict (id) do nothing;

alter table storage.objects enable row level security;

-- Helper: allow ADMIN/HR full access to HRMS buckets
create policy hrms_storage_admin_full
on storage.objects for all
using (
  bucket_id in ('employee-documents', 'cv-uploads', 'training-certificates', 'salary-slips')
  and current_user_role() in ('ADMIN','HR')
)
with check (
  bucket_id in ('employee-documents', 'cv-uploads', 'training-certificates', 'salary-slips')
  and current_user_role() in ('ADMIN','HR')
);

-- Employee documents: employee can read/write own uploads
create policy employee_docs_rw_self
on storage.objects for all
using (
  bucket_id = 'employee-documents'
  and owner = auth.uid()
)
with check (
  bucket_id = 'employee-documents'
  and owner = auth.uid()
);

-- Recruitment CVs: any authenticated user can read if needed, HR/Admin manage
create policy recruitment_cv_read_auth
on storage.objects for select
using (
  bucket_id = 'cv-uploads'
  and auth.role() = 'authenticated'
);

-- Training certificates: employees can read their own certs if metadata.owner matches auth.uid
create policy training_certs_read_owner
on storage.objects for select
using (
  bucket_id = 'training-certificates'
  and (owner = auth.uid() or current_user_role() in ('ADMIN','HR'))
);
