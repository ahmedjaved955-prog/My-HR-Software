import { query } from '../../config/db.js';

export async function createTraining(companyId, payload) {
  const { title, description, start_date, end_date, provider, max_participants, certificate_template_url } = payload;
  const res = await query(
    `INSERT INTO trainings (company_id, title, description, start_date, end_date, provider, max_participants, certificate_template_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [companyId, title, description, start_date, end_date, provider, max_participants, certificate_template_url]
  );
  return res.rows[0];
}

export async function listTrainings(companyId) {
  const res = await query(
    `SELECT * FROM trainings WHERE company_id = $1 ORDER BY start_date DESC NULLS LAST`,
    [companyId]
  );
  return res.rows;
}

export async function getTraining(companyId, id) {
  const res = await query(
    `SELECT * FROM trainings WHERE company_id = $1 AND id = $2`,
    [companyId, id]
  );
  return res.rows[0] || null;
}

export async function enrolEmployee(companyId, trainingId, employeeId) {
  const res = await query(
    `INSERT INTO enrolments (training_id, employee_id)
     SELECT t.id, $3
     FROM trainings t
     JOIN employees e ON e.id = $3 AND e.company_id = $1
     WHERE t.id = $2 AND t.company_id = $1
     ON CONFLICT (training_id, employee_id) DO UPDATE SET status = 'ENROLLED'
     RETURNING *`,
    [companyId, trainingId, employeeId]
  );
  if (!res.rows.length) {
    throw Object.assign(new Error('Training or employee not found for company'), { status: 404 });
  }
  return res.rows[0];
}

export async function completeEnrolment(companyId, trainingId, employeeId, { certificate_url }) {
  const res = await query(
    `UPDATE enrolments e
     SET status = 'COMPLETED', completion_date = CURRENT_DATE, certificate_url = $4
     USING trainings t, employees emp
     WHERE e.training_id = t.id AND e.employee_id = emp.id
       AND t.company_id = $1 AND emp.company_id = $1
       AND e.training_id = $2 AND e.employee_id = $3
     RETURNING e.*`,
    [companyId, trainingId, employeeId, certificate_url]
  );
  return res.rows[0] || null;
}

export async function listEnrolments(companyId, { trainingId, employeeId }) {
  const conditions = ['tr.company_id = $1'];
  const values = [companyId];

  if (trainingId) {
    values.push(trainingId);
    conditions.push(`tr.id = $${values.length}`);
  }
  if (employeeId) {
    values.push(employeeId);
    conditions.push(`e.employee_id = $${values.length}`);
  }

  const res = await query(
    `SELECT e.*, tr.title AS training_title
     FROM enrolments e
     JOIN trainings tr ON e.training_id = tr.id
     JOIN employees emp ON e.employee_id = emp.id
     JOIN companies c ON tr.company_id = c.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY tr.start_date DESC NULLS LAST`,
    values
  );
  return res.rows;
}

export async function listMyEnrolments(companyId, userId) {
  const empRes = await query(
    `SELECT id FROM employees WHERE user_id = $1 AND company_id = $2`,
    [userId, companyId]
  );
  if (!empRes.rows.length) return [];
  const employeeId = empRes.rows[0].id;
  return listEnrolments(companyId, { employeeId });
}
