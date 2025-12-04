import { query } from '../../config/db.js';

export async function getCompanySettings(companyId) {
  const res = await query(
    `SELECT id, name, code, created_at
     FROM companies
     WHERE id = $1`,
    [companyId]
  );
  return res.rows[0] || null;
}

export async function updateCompanySettings(companyId, payload) {
  const { name, code } = payload;
  const res = await query(
    `UPDATE companies
     SET name = COALESCE($2, name),
         code = COALESCE($3, code)
     WHERE id = $1
     RETURNING id, name, code, created_at`,
    [companyId, name || null, code || null]
  );
  return res.rows[0] || null;
}

export async function listUsers(companyId) {
  const res = await query(
    `SELECT id, email, role, is_active, created_at
     FROM users
     WHERE company_id = $1
     ORDER BY created_at DESC`,
    [companyId]
  );
  return res.rows;
}

export async function updateUserRole(companyId, userId, role) {
  const res = await query(
    `UPDATE users
     SET role = $3
     WHERE id = $2 AND company_id = $1
     RETURNING id, email, role, is_active, created_at`,
    [companyId, userId, role]
  );
  return res.rows[0] || null;
}

export async function updateUserStatus(companyId, userId, isActive) {
  const res = await query(
    `UPDATE users
     SET is_active = $3
     WHERE id = $2 AND company_id = $1
     RETURNING id, email, role, is_active, created_at`,
    [companyId, userId, isActive]
  );
  return res.rows[0] || null;
}

export async function listAuditLogs(companyId, limit = 200) {
  const res = await query(
    `SELECT *
     FROM audit_logs
     WHERE company_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [companyId, limit]
  );
  return res.rows;
}
