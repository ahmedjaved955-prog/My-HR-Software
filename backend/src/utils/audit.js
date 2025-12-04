import { query } from '../config/db.js';

export async function logAudit({ companyId, userId, action, entity, entityId = null, metadata = null }) {
  try {
    await query(
      `INSERT INTO audit_logs (company_id, user_id, action, entity, entity_id, metadata)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [companyId, userId, action, entity, entityId, metadata]
    );
  } catch (err) {
    console.error('Failed to write audit log', err);
  }
}
