# HRMS ERD (Text Description)

- **companies** (id PK)
  - 1 : N **users**
  - 1 : N **employees**
  - 1 : N **leave_types**
  - 1 : N **performance_kpis**
  - 1 : N **jobs**
  - 1 : N **trainings**
  - 1 : N **audit_logs**

- **users** (id PK)
  - FK company_id → companies.id
  - Role-based access via `role` (ADMIN, HR, EMPLOYEE)
  - 1 : 0..1 **employees** (linked via employees.user_id)
  - 1 : N **audit_logs**

- **employees** (id PK)
  - FK company_id → companies.id
  - FK user_id → users.id
  - 1 : N **attendance**
  - 1 : N **leaves**
  - 1 : N **payroll**
  - 1 : N **performance**
  - 1 : N **enrolments**
  - 1 : N **documents**

- **attendance** (id PK)
  - FK employee_id → employees.id
  - Stores check-in/check-out and computed work/overtime hours

- **leave_types** (id PK)
  - FK company_id → companies.id
  - 1 : N **leaves**

- **leaves** (id PK)
  - FK employee_id → employees.id
  - FK leave_type_id → leave_types.id
  - FK approver_id → users.id

- **payroll** (id PK)
  - FK employee_id → employees.id
  - 1 : N **payroll_items**

- **payroll_items** (id PK)
  - FK payroll_id → payroll.id

- **performance_kpis** (id PK)
  - FK company_id → companies.id
  - 1 : N **performance** (as KPI definitions)

- **performance** (id PK)
  - FK employee_id → employees.id
  - FK kpi_id → performance_kpis.id
  - Links an employee, a KPI, and a score over a period

- **jobs** (id PK)
  - FK company_id → companies.id
  - 1 : N **applicants**

- **applicants** (id PK)
  - FK job_id → jobs.id

- **trainings** (id PK)
  - FK company_id → companies.id
  - 1 : N **enrolments**

- **enrolments** (id PK)
  - FK training_id → trainings.id
  - FK employee_id → employees.id

- **documents** (id PK)
  - FK employee_id → employees.id
  - FK uploader_id → users.id

- **audit_logs** (id PK)
  - FK company_id → companies.id
  - FK user_id → users.id
