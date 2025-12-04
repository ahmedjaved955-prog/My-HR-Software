import { query } from '../../config/db.js';

export async function checkIn(companyId, employeeId, { shift_name = null } = {}) {
  const existing = await query(
    `SELECT id FROM attendance a
     JOIN employees e ON a.employee_id = e.id
     WHERE e.company_id = $1 AND e.id = $2 AND a.check_out IS NULL
     ORDER BY a.check_in DESC
     LIMIT 1`,
    [companyId, employeeId]
  );

  if (existing.rows.length) {
    throw Object.assign(new Error('Open attendance record already exists'), { status: 400 });
  }

  const res = await query(
    `INSERT INTO attendance (employee_id, check_in, shift_name)
     VALUES ($1, NOW(), $2)
     RETURNING *`,
    [employeeId, shift_name]
  );
  return res.rows[0];
}

export async function checkOut(companyId, employeeId) {
  const resOpen = await query(
    `SELECT a.* FROM attendance a
     JOIN employees e ON a.employee_id = e.id
     WHERE e.company_id = $1 AND e.id = $2 AND a.check_out IS NULL
     ORDER BY a.check_in DESC
     LIMIT 1`,
    [companyId, employeeId]
  );

  if (!resOpen.rows.length) {
    throw Object.assign(new Error('No open attendance record'), { status: 400 });
  }

  const record = resOpen.rows[0];
  const checkInTime = new Date(record.check_in);
  const checkOutTime = new Date();
  const diffMs = checkOutTime - checkInTime;
  const hours = diffMs / 1000 / 60 / 60;
  const workHours = Math.round(hours * 100) / 100;
  const overtime = workHours > 8 ? Math.round((workHours - 8) * 100) / 100 : 0;

  const res = await query(
    `UPDATE attendance
     SET check_out = $1,
         work_hours = $2,
         overtime_hours = $3
     WHERE id = $4
     RETURNING *`,
    [checkOutTime, workHours, overtime, record.id]
  );

  return res.rows[0];
}

export async function listAttendance(companyId, { employeeId, from, to }) {
  const conditions = ['e.company_id = $1'];
  const values = [companyId];

  if (employeeId) {
    values.push(employeeId);
    conditions.push(`e.id = $${values.length}`);
  }
  if (from) {
    values.push(from);
    conditions.push(`a.check_in::date >= $${values.length}`);
  }
  if (to) {
    values.push(to);
    conditions.push(`a.check_in::date <= $${values.length}`);
  }

  const res = await query(
    `SELECT a.*, e.first_name, e.last_name, e.employee_code
     FROM attendance a
     JOIN employees e ON a.employee_id = e.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY a.check_in DESC
     LIMIT 500`,
    values
  );
  return res.rows;
}
