import PDFDocument from 'pdfkit';
import { generatePayroll, getPayrollById, listPayroll, listMyPayroll, getPayrollItems } from './payroll.service.js';

export async function generatePayrollController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const payroll = await generatePayroll(companyId, req.body, req.user.id);
    res.status(201).json(payroll);
  } catch (err) {
    next(err);
  }
}

export async function listPayrollController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { employeeId, month, year } = req.query;
    const data = await listPayroll(companyId, {
      employeeId,
      month: month && Number(month),
      year: year && Number(year),
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function myPayrollController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const data = await listMyPayroll(companyId, req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getPayrollController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const payroll = await getPayrollById(companyId, id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }
    res.json(payroll);
  } catch (err) {
    next(err);
  }
}

export async function downloadSlipController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const payroll = await getPayrollById(companyId, id);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }
    const items = await getPayrollItems(payroll.id);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="salary-slip-${payroll.year}-${payroll.month}-${payroll.employee_id}.pdf"`
    );

    doc.pipe(res);

    doc.fontSize(18).text('Salary Slip', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Employee ID: ${payroll.employee_id}`);
    doc.text(`Period: ${payroll.month}/${payroll.year}`);
    doc.moveDown();

    doc.fontSize(12).text(`Gross Salary: ${payroll.gross_salary}`);
    doc.text(`Allowances: ${payroll.total_allowances}`);
    doc.text(`Deductions: ${payroll.total_deductions}`);
    doc.text(`Loan Deduction: ${payroll.loan_deduction}`);
    doc.text(`Tax: ${payroll.tax_amount}`);
    doc.text(`Net Salary: ${payroll.net_salary}`);
    doc.moveDown();

    if (items.length) {
      doc.text('Details:');
      items.forEach((item) => {
        doc.text(`- ${item.item_type}: ${item.label} - ${item.amount}`);
      });
    }

    doc.end();
  } catch (err) {
    next(err);
  }
}
