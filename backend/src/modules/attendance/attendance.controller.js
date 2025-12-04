import { checkIn, checkOut, listAttendance } from './attendance.service.js';
import { query } from '../../config/db.js';

export async function checkInController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const employeeId = await getEmployeeIdForUser(req.user.id);
    const attendance = await checkIn(companyId, employeeId, req.body || {});
    res.status(201).json(attendance);
  } catch (err) {
    next(err);
  }
}

export async function checkOutController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const employeeId = await getEmployeeIdForUser(req.user.id);
    const attendance = await checkOut(companyId, employeeId);
    res.json(attendance);
  } catch (err) {
    next(err);
  }
}

export async function listAttendanceController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { employeeId, from, to } = req.query;
    const data = await listAttendance(companyId, { employeeId, from, to });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getEmployeeIdForUser(userId) {
  const res = await query(
    `SELECT id FROM employees WHERE user_id = $1`,
    [userId]
  );
  if (!res.rows.length) {
    throw Object.assign(new Error('Employee profile not found for user'), { status: 400 });
  }
  return res.rows[0].id;
}
