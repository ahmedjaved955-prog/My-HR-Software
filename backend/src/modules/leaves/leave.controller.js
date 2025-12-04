import { query } from '../../config/db.js';
import { applyLeave, listLeaves, approveLeave, getLeaveBalances } from './leave.service.js';

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

export async function applyLeaveController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const employeeId = await getEmployeeIdForUser(req.user.id);
    const leave = await applyLeave(companyId, employeeId, req.body);
    res.status(201).json(leave);
  } catch (err) {
    next(err);
  }
}

export async function listLeavesController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { employeeId } = req.query;
    const data = await listLeaves(companyId, { employeeId });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function myLeavesController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const employeeId = await getEmployeeIdForUser(req.user.id);
    const data = await listLeaves(companyId, { employeeId });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function approveLeaveController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const { status } = req.body;
    const leave = await approveLeave(companyId, id, req.user.id, status);
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    res.json(leave);
  } catch (err) {
    next(err);
  }
}

export async function leaveBalanceController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const employeeId = await getEmployeeIdForUser(req.user.id);
    const { year } = req.query;
    const balances = await getLeaveBalances(companyId, employeeId, year && Number(year));
    res.json(balances);
  } catch (err) {
    next(err);
  }
}
