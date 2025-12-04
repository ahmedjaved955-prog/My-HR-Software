-- HRMS PostgreSQL Schema

CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM ('ADMIN','HR','EMPLOYEE');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'EMPLOYEE',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id),
  user_id INT UNIQUE REFERENCES users(id),
  employee_code VARCHAR(50) UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  department VARCHAR(100),
  position VARCHAR(100),
  date_of_joining DATE,
  employment_type VARCHAR(50),
  base_salary NUMERIC(12,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE leave_types (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  default_allocation NUMERIC(5,2) DEFAULT 0,
  is_paid BOOLEAN DEFAULT TRUE,
  UNIQUE(company_id, code)
);

CREATE TYPE leave_status AS ENUM ('PENDING','APPROVED','REJECTED','CANCELLED');

CREATE TABLE leaves (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id INT REFERENCES leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC(5,2) NOT NULL,
  status leave_status NOT NULL DEFAULT 'PENDING',
  reason TEXT,
  approver_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
  check_in TIMESTAMP NOT NULL,
  check_out TIMESTAMP,
  work_hours NUMERIC(5,2),
  overtime_hours NUMERIC(5,2),
  shift_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payroll (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
  month INT NOT NULL,
  year INT NOT NULL,
  gross_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_allowances NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  loan_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'GENERATED',
  generated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

CREATE TABLE payroll_items (
  id SERIAL PRIMARY KEY,
  payroll_id INT REFERENCES payroll(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL,
  label VARCHAR(255) NOT NULL,
  amount NUMERIC(12,2) NOT NULL
);

CREATE TABLE performance_kpis (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  weight NUMERIC(5,2) NOT NULL DEFAULT 1.0
);

CREATE TABLE performance (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
  kpi_id INT REFERENCES performance_kpis(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  comments TEXT,
  reviewer_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id),
  title VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  location VARCHAR(100),
  employment_type VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  description TEXT,
  posted_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE applicant_status AS ENUM ('APPLIED','SHORTLISTED','INTERVIEW_SCHEDULED','OFFERED','REJECTED','HIRED');

CREATE TABLE applicants (
  id SERIAL PRIMARY KEY,
  job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  status applicant_status NOT NULL DEFAULT 'APPLIED',
  cv_url TEXT,
  interview_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE enrolment_status AS ENUM ('ENROLLED','COMPLETED','CANCELLED');

CREATE TABLE trainings (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  provider VARCHAR(255),
  max_participants INT,
  certificate_template_url TEXT
);

CREATE TABLE enrolments (
  id SERIAL PRIMARY KEY,
  training_id INT REFERENCES trainings(id) ON DELETE CASCADE,
  employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
  status enrolment_status NOT NULL DEFAULT 'ENROLLED',
  completion_date DATE,
  certificate_url TEXT,
  UNIQUE(training_id, employee_id)
);

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
  uploader_id INT REFERENCES users(id),
  doc_type VARCHAR(100),
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id),
  user_id INT REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id INT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, check_in);
CREATE INDEX idx_leaves_employee ON leaves(employee_id);
CREATE INDEX idx_payroll_employee_period ON payroll(employee_id, year, month);
CREATE INDEX idx_performance_employee_period ON performance(employee_id, period_start, period_end);
CREATE INDEX idx_applicants_job ON applicants(job_id);
CREATE INDEX idx_enrolments_training ON enrolments(training_id);
