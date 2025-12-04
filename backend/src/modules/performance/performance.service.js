import { query } from '../../config/db.js';

export async function listKpis(companyId) {
  const res = await query(
    `SELECT * FROM performance_kpis WHERE company_id = $1 ORDER BY id DESC`,
    [companyId]
  );
  return res.rows;
}

export async function createKpi(companyId, payload) {
  const { name, description, weight = 1.0 } = payload;
  const res = await query(
    `INSERT INTO performance_kpis (company_id, name, description, weight)
     VALUES ($1,$2,$3,$4)
     RETURNING *`,
    [companyId, name, description, weight]
  );
  return res.rows[0];
}

export async function createPerformance(companyId, reviewerId, payload) {
  const { employee_id, kpi_id, period_start, period_end, score, comments } = payload;

  const res = await query(
    `INSERT INTO performance (
       employee_id, kpi_id, period_start, period_end, score, comments, reviewer_id
     )
     SELECT e.id, $2, $3, $4, $5, $6, $7
     FROM employees e
     WHERE e.id = $1 AND e.company_id = $8
     RETURNING *`,
    [employee_id, kpi_id, period_start, period_end, score, comments, reviewerId, companyId]
  );
  if (!res.rows.length) {
    throw Object.assign(new Error('Employee not found for company'), { status: 404 });
  }
  return res.rows[0];
}

export async function listPerformance(companyId, { employeeId }) {
  const conditions = ['e.company_id = $1'];
  const values = [companyId];
  if (employeeId) {
    values.push(employeeId);
    conditions.push(`e.id = $${values.length}`);
  }

  const res = await query(
    `SELECT p.*, e.first_name, e.last_name, k.name AS kpi_name
     FROM performance p
     JOIN employees e ON p.employee_id = e.id
     JOIN performance_kpis k ON p.kpi_id = k.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY p.created_at DESC
     LIMIT 500`,
    values
  );
  return res.rows;
}

export async function listMyPerformance(companyId, userId) {
  const empRes = await query(
    `SELECT id FROM employees WHERE user_id = $1 AND company_id = $2`,
    [userId, companyId]
  );
  if (!empRes.rows.length) return [];
  const employeeId = empRes.rows[0].id;
  return listPerformance(companyId, { employeeId });
}
