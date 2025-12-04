# HRMS API Overview

Base URL: `http://localhost:4000/api`

Authentication via `Authorization: Bearer <accessToken>` header.

---

## Auth

### POST /auth/register
Register a new company + admin user.

Body:

```json
{
  "companyName": "Acme Corp",
  "companyCode": "ACME",
  "email": "admin@acme.com",
  "password": "Admin@123"
}
```

### POST /auth/login

Body:

```json
{
  "email": "admin@acme.com",
  "password": "Admin@123"
}
```

Response:

```json
{
  "user": { "id": 1, "email": "admin@acme.com", "role": "ADMIN", "company_id": 1 },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### POST /auth/refresh

Body:

```json
{ "refreshToken": "..." }
```

---

## Employees

All endpoints require auth; most require `ADMIN` or `HR`.

- `GET /employees` – list employees in company
- `GET /employees/:id` – get employee by id
- `POST /employees` – create employee
- `PUT /employees/:id` – update employee
- `DELETE /employees/:id` – delete employee

Example create body:

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@acme.com",
  "department": "Engineering",
  "position": "Developer",
  "base_salary": 60000
}
```

---

## Attendance

- `POST /attendance/check-in` – employee check-in
- `POST /attendance/check-out` – employee check-out
- `GET /attendance` – (HR/Admin) list attendance records; optional query `employeeId`, `from`, `to`.

---

## Leaves

- `POST /leaves/apply` – employee applies leave
- `GET /leaves/my` – current user leave history
- `GET /leaves` – (HR/Admin) list all leave requests
- `POST /leaves/:id/approve` – (HR/Admin) approve/reject/cancel
- `GET /leaves/balance` – current user leave balance summary

Example apply body:

```json
{
  "leave_type_id": 1,
  "start_date": "2025-01-10",
  "end_date": "2025-01-12",
  "reason": "Family trip"
}
```

Approve body:

```json
{ "status": "APPROVED" }
```

---

## Payroll

- `POST /payroll/generate` – (HR/Admin) generate monthly payroll for an employee
- `GET /payroll` – (HR/Admin) list payroll records
- `GET /payroll/my` – current employee payroll history
- `GET /payroll/:id` – get payroll record
- `GET /payroll/:id/slip` – generate PDF salary slip

Example generate body:

```json
{
  "employee_id": 1,
  "month": 12,
  "year": 2025,
  "allowances": [{ "label": "Bonus", "amount": 500 }],
  "deductions": [{ "label": "Health Insurance", "amount": 100 }],
  "loan_deduction": 0
}
```

---

## Performance

- `GET /performance/kpis` – list KPIs
- `POST /performance/kpis` – (HR/Admin) create KPI
- `POST /performance` – (HR/Admin) create performance record
- `GET /performance` – (HR/Admin) list performance
- `GET /performance/my` – current user's performance records

---

## Recruitment / ATS

- `POST /recruitment/jobs` – (HR/Admin) create job
- `GET /recruitment/jobs` – list jobs
- `GET /recruitment/jobs/:id` – get job detail
- `POST /recruitment/applicants` – (HR/Admin) create applicant
- `GET /recruitment/applicants` – (HR/Admin) list applicants
- `PATCH /recruitment/applicants/:id/status` – update status
- `POST /recruitment/applicants/:id/schedule` – set interview datetime
- `GET /recruitment/applicants/:id/offer-letter` – generate offer letter PDF

---

## Trainings

- `POST /trainings` – (HR/Admin) create training
- `GET /trainings` – list trainings
- `GET /trainings/:id` – get training
- `POST /trainings/:id/enrol` – enrol current employee
- `POST /trainings/:trainingId/enrolments/:employeeId/complete` – (HR/Admin) mark completed
- `GET /trainings/enrolments` – (HR/Admin) list all enrolments
- `GET /trainings/my/enrolments` – current user's enrolments

---

## Documents

- `POST /documents/:employeeId` – upload document (multipart, field `file`)
- `GET /documents` – list documents
- `GET /documents/:id/download` – download document

---

## Dashboard

- `GET /dashboard` – HR/Admin overview with:
  - total employees
  - attendance overview (present/absent)
  - payroll_this_month
  - recruitment_pipeline
  - performance_stats
  - leave_overview

---

## Settings / Administration

Admin-only endpoints:

- `GET /settings/company` – company info
- `PUT /settings/company` – update company name/code
- `GET /settings/users` – list users
- `PATCH /settings/users/:id/role` – change user role
- `PATCH /settings/users/:id/status` – enable/disable user
- `GET /settings/audit-logs` – list audit logs
