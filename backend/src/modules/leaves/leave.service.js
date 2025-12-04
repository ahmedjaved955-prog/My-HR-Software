import { query } from '../../config/db.js';

export async function applyLeave(companyId, employeeId, payload) {
  const { leave_type_id, start_date, end_date, reason } = payload;

  const start = new Date(start_date);
  const end = new Date(end_date);
  if (isNaN(start) || isNaN(end) || end < start) {
    throw Object.assign(new Error('Invalid date range'), { status: 400 });
  }
  const totalDays = (end - start) / (1000 * 60 * 60 * 24) + 1;

  const res = await query(
    `INSERT INTO leaves (
       employee_id, leave_type_id, start_date, end_date, total_days, reason
     )
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [employeeId, leave_type_id, start, end, totalDays, reason]
  );
  return res.rows[0];
}

export async function listLeaves(companyId, { employeeId }) {
  const conditions = ['e.company_id = $1'];
  const values = [companyId];
  if (employeeId) {
    values.push(employeeId);
    conditions.push(`e.id = $${values.length}`);
  }
  const res = await query(
    `SELECT l.*, e.first_name, e.last_name, lt.name AS leave_type_name
     FROM leaves l
     JOIN employees e ON l.employee_id = e.id
     JOIN leave_types lt ON l.leave_type_id = lt.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY l.start_date DESC
     LIMIT 500`,
    values
  );
  return res.rows;
}

export async function approveLeave(companyId, leaveId, approverId, status) {
  if (!['APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) {
    throw Object.assign(new Error('Invalid status'), { status: 400 });
  }

  const res = await query(
    `UPDATE leaves l
     SET status = $1, approver_id = $2, updated_at = NOW()
     FROM employees e
     WHERE l.id = $3 AND l.employee_id = e.id AND e.company_id = $4
     RETURNING l.*`,
    [status, approverId, leaveId, companyId]
  );

  return res.rows[0] || null;
}

export async function getLeaveBalances(companyId, employeeId, year) {
  const y = year || new Date().getFullYear();
  const res = await query(
    `SELECT lt.id, lt.name, lt.code, lt.default_allocation,
            COALESCE(SUM(CASE WHEN l.status = 'APPROVED' THEN l.total_days ELSE 0 END), 0) AS used_days
     FROM leave_types lt
     LEFT JOIN leaves l ON l.leave_type_id = lt.id
       AND l.employee_id = $1
       AND EXTRACT(YEAR FROM l.start_date) = $2
     WHERE lt.company_id = $3
     GROUP BY lt.id
     ORDER BY lt.name`,
    [employeeId, y, companyId]
  );

  return res.rows.map((row) => ({
    ...row,
    remaining: Number(row.default_allocation) - Number(row.used_days),
  }));
}
