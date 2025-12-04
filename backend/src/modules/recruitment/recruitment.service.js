import { query } from '../../config/db.js';

export async function createJob(companyId, payload) {
  const { title, department, location, employment_type, description, status = 'OPEN' } = payload;
  const res = await query(
    `INSERT INTO jobs (company_id, title, department, location, employment_type, description, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [companyId, title, department, location, employment_type, description, status]
  );
  return res.rows[0];
}

export async function listJobs(companyId) {
  const res = await query(
    `SELECT * FROM jobs WHERE company_id = $1 ORDER BY posted_at DESC`,
    [companyId]
  );
  return res.rows;
}

export async function getJob(companyId, id) {
  const res = await query(
    `SELECT * FROM jobs WHERE company_id = $1 AND id = $2`,
    [companyId, id]
  );
  return res.rows[0] || null;
}

export async function createApplicant(companyId, payload) {
  const { job_id, full_name, email, phone, cv_url } = payload;

  const res = await query(
    `INSERT INTO applicants (job_id, full_name, email, phone, cv_url)
     SELECT j.id, $2, $3, $4, $5
     FROM jobs j
     WHERE j.id = $1 AND j.company_id = $6
     RETURNING *`,
    [job_id, full_name, email, phone, cv_url, companyId]
  );

  if (!res.rows.length) {
    throw Object.assign(new Error('Job not found for company'), { status: 404 });
  }

  return res.rows[0];
}

export async function listApplicants(companyId, { jobId }) {
  const conditions = ['j.company_id = $1'];
  const values = [companyId];
  if (jobId) {
    values.push(jobId);
    conditions.push(`j.id = $${values.length}`);
  }

  const res = await query(
    `SELECT a.*, j.title AS job_title
     FROM applicants a
     JOIN jobs j ON a.job_id = j.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY a.created_at DESC
     LIMIT 500`,
    values
  );
  return res.rows;
}

export async function updateApplicantStatus(companyId, id, status) {
  const allowed = ['APPLIED','SHORTLISTED','INTERVIEW_SCHEDULED','OFFERED','REJECTED','HIRED'];
  if (!allowed.includes(status)) {
    throw Object.assign(new Error('Invalid applicant status'), { status: 400 });
  }

  const res = await query(
    `UPDATE applicants a
     SET status = $1
     FROM jobs j
     WHERE a.id = $2 AND a.job_id = j.id AND j.company_id = $3
     RETURNING a.*`,
    [status, id, companyId]
  );

  return res.rows[0] || null;
}

export async function scheduleInterview(companyId, id, interview_date) {
  const res = await query(
    `UPDATE applicants a
     SET interview_date = $1, status = 'INTERVIEW_SCHEDULED'
     FROM jobs j
     WHERE a.id = $2 AND a.job_id = j.id AND j.company_id = $3
     RETURNING a.*`,
    [interview_date, id, companyId]
  );
  return res.rows[0] || null;
}

export async function getApplicantWithJob(companyId, id) {
  const res = await query(
    `SELECT a.*, j.title AS job_title, j.department, j.location
     FROM applicants a
     JOIN jobs j ON a.job_id = j.id
     WHERE a.id = $1 AND j.company_id = $2`,
    [id, companyId]
  );
  return res.rows[0] || null;
}
