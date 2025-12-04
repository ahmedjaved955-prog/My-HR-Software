import { query } from '../../config/db.js';

export async function listEmployees(companyId) {
  const res = await query(
    `SELECT e.*, u.email AS user_email, u.role
     FROM employees e
     LEFT JOIN users u ON e.user_id = u.id
     WHERE e.company_id = $1
     ORDER BY e.id DESC`,
    [companyId]
  );
  return res.rows;
}

export async function getEmployeeById(companyId, id) {
  const res = await query(
    `SELECT e.*, u.email AS user_email, u.role
     FROM employees e
     LEFT JOIN users u ON e.user_id = u.id
     WHERE e.company_id = $1 AND e.id = $2`,
    [companyId, id]
  );
  return res.rows[0] || null;
}

export async function createEmployee(companyId, payload) {
  const {
    first_name,
    last_name,
    email,
    phone,
    department,
    position,
    date_of_joining,
    employment_type,
    base_salary,
  } = payload;

  const res = await query(
    `INSERT INTO employees (
       company_id, first_name, last_name, email, phone,
       department, position, date_of_joining, employment_type, base_salary
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      companyId,
      first_name,
      last_name,
      email,
      phone,
      department,
      position,
      date_of_joining,
      employment_type,
      base_salary,
    ]
  );

  return res.rows[0];
}

export async function updateEmployee(companyId, id, payload) {
  const fields = [
    'first_name',
    'last_name',
    'email',
    'phone',
    'department',
    'position',
    'date_of_joining',
    'employment_type',
    'base_salary',
  ];

  const sets = [];
  const values = [companyId, id];

  fields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      values.push(payload[field]);
      sets.push(`${field} = $${values.length}`);
    }
  });

  if (!sets.length) {
    const current = await getEmployeeById(companyId, id);
    return current;
  }

  const res = await query(
    `UPDATE employees
     SET ${sets.join(', ')}, updated_at = NOW()
     WHERE company_id = $1 AND id = $2
     RETURNING *`,
    values
  );

  return res.rows[0] || null;
}

export async function deleteEmployee(companyId, id) {
  const res = await query(
    `DELETE FROM employees
     WHERE company_id = $1 AND id = $2
     RETURNING id`,
    [companyId, id]
  );
  return !!res.rows[0];
}
