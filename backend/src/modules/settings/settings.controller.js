import { ROLES } from '../../config/roles.js';
import {
  getCompanySettings,
  updateCompanySettings,
  listUsers,
  updateUserRole,
  updateUserStatus,
  listAuditLogs,
} from './settings.service.js';

export async function getCompanySettingsController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const settings = await getCompanySettings(companyId);
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

export async function updateCompanySettingsController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const settings = await updateCompanySettings(companyId, req.body);
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

export async function listUsersController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const users = await listUsers(companyId);
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function updateUserRoleController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const { role } = req.body;
    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await updateUserRole(companyId, id, role);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateUserStatusController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const { is_active } = req.body;
    const user = await updateUserStatus(companyId, id, !!is_active);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function listAuditLogsController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { limit } = req.query;
    const logs = await listAuditLogs(companyId, limit ? Number(limit) : 200);
    res.json(logs);
  } catch (err) {
    next(err);
  }
}
