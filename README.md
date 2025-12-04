# HR Management System (HRMS)

Full-featured HRMS built with:

- **Frontend**: React (Vite), React Router, Axios, TailwindCSS
- **Backend**: Node.js (Express), PostgreSQL, JWT, Bcrypt
- **Database**: PostgreSQL with modular schema

## Folder Structure

- `backend/` – Node.js + Express API
- `frontend/` – React (Vite) SPA
- `database/` – PostgreSQL schema
- `docs/` – ERD, API docs, Postman collection

---

## Backend Setup

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 13+

### 2. Create database & user

```sql
CREATE DATABASE hrms_db;
CREATE USER hrms_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE hrms_db TO hrms_user;
```

Then run schema:

```bash
psql -U hrms_user -d hrms_db -f database/schema.sql
```

### 3. Configure environment

Copy backend env example:

```bash
cd backend
cp .env.example .env   # On Windows, copy manually if cp is unavailable
```

Adjust `DATABASE_URL` / `JWT_SECRET` as needed.

### 4. Install & run backend

```bash
cd backend
npm install
npm run dev   # or: npm start
```

Backend starts on **http://localhost:4000**.

Health-check:

- `GET http://localhost:4000/health`

---

## Frontend Setup

### 1. Configure environment

```bash
cd frontend
cp .env.example .env   # Or copy manually
```

Default points to backend API:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

### 2. Install & run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**.

---

## First Login / Admin Registration

1. Register a company admin via API:

   - `POST http://localhost:4000/api/auth/register`
   - Body:

     ```json
     {
       "companyName": "Acme Corp",
       "companyCode": "ACME",
       "email": "admin@acme.com",
       "password": "Admin@123"
     }
     ```

2. Login on frontend at `http://localhost:5173/login` using the same email/password.

---

## Major Modules & Endpoints

 Backend base URL: `http://localhost:4000/api`

- **Auth**: `/auth/login`, `/auth/register`, `/auth/refresh`
- **Employees**: `/employees` (CRUD, secured by role)
- **Attendance**: `/attendance/check-in`, `/attendance/check-out`, `/attendance`
- **Leaves**: `/leaves/apply`, `/leaves/my`, `/leaves`, `/leaves/:id/approve`, `/leaves/balance`
- **Payroll**: `/payroll/generate`, `/payroll`, `/payroll/my`, `/payroll/:id/slip`
- **Performance**: `/performance/kpis`, `/performance`, `/performance/my`
- **Recruitment**: `/recruitment/jobs`, `/recruitment/applicants`, `/recruitment/applicants/:id/offer-letter`
- **Trainings**: `/trainings`, `/trainings/:id/enrol`, `/trainings/my/enrolments`
- **Documents**: `/documents/:employeeId` (file upload), `/documents`, `/documents/:id/download`
- **Dashboard**: `/dashboard`
- **Settings**: `/settings/company`, `/settings/users`, `/settings/audit-logs`

See `docs/api.md` for more detailed request/response structures.

---

## Database

- SQL schema: `database/schema.sql`
- ERD (textual): `docs/erd.md`

Core tables include:

- `users`, `employees`, `attendance`, `leaves`, `leave_types`,
- `payroll`, `payroll_items`, `performance`, `performance_kpis`,
- `jobs`, `applicants`, `trainings`, `enrolments`,
- `documents`, `audit_logs`, `companies`.

---

## Documentation & Tools

- **API documentation**: `docs/api.md`
- **Postman collection**: `docs/hrms.postman_collection.json`

Import the Postman collection and set `base_url` variable to `http://localhost:4000/api`.
