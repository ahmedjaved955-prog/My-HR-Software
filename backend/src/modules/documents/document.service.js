import { query } from '../../config/db.js';

export async function addDocument(companyId, employeeId, uploaderId, file, { doc_type } = {}) {
  const empRes = await query(
    `SELECT id FROM employees WHERE id = $1 AND company_id = $2`,
    [employeeId, companyId]
  );
  if (!empRes.rows.length) {
    throw Object.assign(new Error('Employee not found for company'), { status: 404 });
  }

  const res = await query(
    `INSERT INTO documents (employee_id, uploader_id, doc_type, file_name, file_path, mime_type)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [
      employeeId,
      uploaderId,
      doc_type || null,
      file.originalname,
      file.path,
      file.mimetype,
    ]
  );
  return res.rows[0];
}

export async function listDocuments(companyId, { employeeId }) {
  const conditions = ['e.company_id = $1'];
  const values = [companyId];
  if (employeeId) {
    values.push(employeeId);
    conditions.push(`e.id = $${values.length}`);
  }

  const res = await query(
    `SELECT d.*, e.first_name, e.last_name
     FROM documents d
     JOIN employees e ON d.employee_id = e.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY d.uploaded_at DESC`,
    values
  );
  return res.rows;
}

export async function getDocument(companyId, id) {
  const res = await query(
    `SELECT d.*
     FROM documents d
     JOIN employees e ON d.employee_id = e.id
     WHERE d.id = $1 AND e.company_id = $2`,
    [id, companyId]
  );
  return res.rows[0] || null;
}
