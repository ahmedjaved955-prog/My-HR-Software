# Supabase HRMS Backend

This document describes how to use Supabase as the primary backend for the HRMS React frontend.

## 1. Supabase Project

Use the provided project:

- Supabase URL: `https://mhmvsykzayvjwcudoavm.supabase.co`
- Supabase anon key: set via environment variable (do **not** commit to git).

## 2. SQL Setup

### 2.1. Schema

In the Supabase SQL editor, run:

```sql
-- Paste contents of database/supabase_schema.sql
```

This creates:

- Enums: `user_role`, `leave_status`, `applicant_status`, `enrollment_status`, `payroll_status`
- Tables: `users`, `employees`, `attendance`, `leave_types`, `leaves`, `payroll`, `payroll_items`,
  `performance_kpis`, `performance`, `jobs`, `applicants`, `trainings`, `enrollments`, `documents`, `audit_logs`
- Triggers:
  - Attendance: auto-calc `total_hours` and `overtime_hours`
  - Leaves: auto-calc `total_days`
  - Payroll: auto-calc `total_allowances`, `total_deductions`, `net_salary`
- Helper functions:
  - `current_user_role()`
  - `current_employee_id()`
  - `handle_new_auth_user()` + trigger on `auth.users`

### 2.2. RLS Policies

Then run:

```sql
-- Paste contents of database/supabase_policies.sql
```

This will:

- Enable RLS on all business tables.
- Allow:
  - Admin/HR to manage all HR data.
  - Employees to see and manage only their own records (attendance, leaves, payroll, documents, enrolments, performance).
  - Authenticated users to see shared reference data (leave_types, trainings, jobs).

### 2.3. Storage Buckets

Configure storage by running:

```sql
-- Paste contents of database/supabase_storage.sql
```

This will create:

- Buckets:
  - `employee-documents`
  - `cv-uploads`
  - `training-certificates`
  - `salary-slips`
- RLS on `storage.objects` so that:
  - Admin/HR have full access for all HRMS buckets.
  - Employees can manage their own employee documents.
  - Recruiters can manage recruitment CVs.
  - Employees can view their own training certificates.

## 3. Environment Variables (Frontend)

In `frontend/.env` (based on `.env.example`):

```env
VITE_SUPABASE_URL=https://mhmvsykzayvjwcudoavm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1obXZzeWt6YXl2andjdWRvYXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Mjc4OTksImV4cCI6MjA4MDQwMzg5OX0.TtIz52IarVOw353e-9n3z7ByXFSmShMa0IweULvIJPg
```

Do **not** commit the anon key if your repository is public.

`lib/supabase.js` creates the Supabase client using these variables.

## 4. Auth & Roles

- Supabase Auth handles email/password sign-up and login.
- When a user is created in `auth.users`, a trigger populates `public.users` with a default role `EMPLOYEE`.
- You can promote users to `HR` or `ADMIN` via:

  ```sql
  update public.users set role = 'ADMIN' where id = '<user-uuid>';
  ```

  or via an admin UI screen.

- The React `AuthContext` (`frontend/src/context/AuthContext.jsx`) uses Supabase Auth and loads `public.users.role` so the UI can be role-aware.

## 5. Frontend Integration

- Supabase client: `frontend/src/lib/supabase.js`
- Auth context: `frontend/src/context/AuthContext.jsx` (login, signup, logout, user with `role`).
- Pages can use the Supabase client directly or via service modules (e.g. `src/services/employeeService.js`) to perform CRUD operations with RLS enforcement.

## 6. Running Frontend

From the project root:

```bash
cd frontend
npm install
npm run dev
```

The frontend will communicate directly with Supabase using the configured URL and anon key.

## 7. Notes

- For PDF salary slips and offer letters, you can implement Supabase Edge Functions (Deno) that generate PDFs (e.g. using a headless browser or PDF library) and call them from the frontend.
- All sensitive operations are protected by RLS; the React app only needs the anon key.
