import { query } from '../../config/db.js';

function sumItems(items = []) {
  return items.reduce((acc, item) => acc + Number(item.amount || 0), 0);
}

export async function generatePayroll(companyId, payload, userId) {
  const { employee_id, month, year, allowances = [], deductions = [], loan_deduction = 0 } = payload;

  const empRes = await query(
    `SELECT * FROM employees WHERE id = $1 AND company_id = $2`,
    [employee_id, companyId]
  );
  if (!empRes.rows.length) {
    throw Object.assign(new Error('Employee not found'), { status: 404 });
  }
  const employee = empRes.rows[0];

  const grossSalary = Number(employee.base_salary || 0);
  const totalAllowances = sumItems(allowances);
  const otherDeductions = sumItems(deductions);
  const loanDed = Number(loan_deduction || 0);
  const totalDeductions = otherDeductions + loanDed;

  const taxable = grossSalary + totalAllowances - totalDeductions;
  const taxRate = 0.1; // simple demo tax rate
  const taxAmount = taxable > 0 ? Math.round(taxable * taxRate * 100) / 100 : 0;
  const netSalary = taxable - taxAmount;

  const payrollRes = await query(
    `INSERT INTO payroll (
       employee_id, month, year, gross_salary, total_allowances,
       total_deductions, tax_amount, net_salary, loan_deduction
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (employee_id, month, year)
     DO UPDATE SET
       gross_salary = EXCLUDED.gross_salary,
       total_allowances = EXCLUDED.total_allowances,
       total_deductions = EXCLUDED.total_deductions,
       tax_amount = EXCLUDED.tax_amount,
       net_salary = EXCLUDED.net_salary,
       loan_deduction = EXCLUDED.loan_deduction,
       generated_at = NOW()
     RETURNING *`,
    [
      employee_id,
      month,
      year,
      grossSalary,
      totalAllowances,
      totalDeductions,
      taxAmount,
      netSalary,
      loanDed,
    ]
  );

  const payroll = payrollRes.rows[0];

  // Clear existing items and insert new ones
  await query(`DELETE FROM payroll_items WHERE payroll_id = $1`, [payroll.id]);

  for (const item of allowances) {
    await query(
      `INSERT INTO payroll_items (payroll_id, item_type, label, amount)
       VALUES ($1,'ALLOWANCE',$2,$3)`,
      [payroll.id, item.label, item.amount]
    );
  }

  for (const item of deductions) {
    await query(
      `INSERT INTO payroll_items (payroll_id, item_type, label, amount)
       VALUES ($1,'DEDUCTION',$2,$3)`,
      [payroll.id, item.label, item.amount]
    );
  }

  if (loanDed) {
    await query(
      `INSERT INTO payroll_items (payroll_id, item_type, label, amount)
       VALUES ($1,'DEDUCTION',$2,$3)`,
      [payroll.id, 'Loan/Advance', loanDed]
    );
  }

  return payroll;
}

export async function getPayrollById(companyId, id) {
  const res = await query(
    `SELECT p.*, e.first_name, e.last_name, e.employee_code
     FROM payroll p
     JOIN employees e ON p.employee_id = e.id
     WHERE p.id = $1 AND e.company_id = $2`,
    [id, companyId]
  );
  return res.rows[0] || null;
}

export async function listPayroll(companyId, { employeeId, month, year }) {
  const conditions = ['e.company_id = $1'];
  const values = [companyId];

  if (employeeId) {
    values.push(employeeId);
    conditions.push(`e.id = $${values.length}`);
  }
  if (month) {
    values.push(month);
    conditions.push(`p.month = $${values.length}`);
  }
  if (year) {
    values.push(year);
    conditions.push(`p.year = $${values.length}`);
  }

  const res = await query(
    `SELECT p.*, e.first_name, e.last_name, e.employee_code
     FROM payroll p
     JOIN employees e ON p.employee_id = e.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY p.year DESC, p.month DESC`,
    values
  );
  return res.rows;
}

export async function listMyPayroll(companyId, userId) {
  const empRes = await query(
    `SELECT id FROM employees WHERE user_id = $1 AND company_id = $2`,
    [userId, companyId]
  );
  if (!empRes.rows.length) {
    return [];
  }
  const employeeId = empRes.rows[0].id;
  const res = await query(
    `SELECT p.*
     FROM payroll p
     WHERE p.employee_id = $1
     ORDER BY p.year DESC, p.month DESC`,
    [employeeId]
  );
  return res.rows;
}

export async function getPayrollItems(payrollId) {
  const res = await query(
    `SELECT * FROM payroll_items WHERE payroll_id = $1 ORDER BY id`,
    [payrollId]
  );
  return res.rows;
}
