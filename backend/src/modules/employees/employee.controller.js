import {
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from './employee.service.js';

export async function getEmployees(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const data = await listEmployees(companyId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getEmployee(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const employee = await getEmployeeById(companyId, id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (err) {
    next(err);
  }
}

export async function createEmployeeController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const employee = await createEmployee(companyId, req.body);
    res.status(201).json(employee);
  } catch (err) {
    next(err);
  }
}

export async function updateEmployeeController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const employee = await updateEmployee(companyId, id, req.body);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (err) {
    next(err);
  }
}

export async function deleteEmployeeController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const ok = await deleteEmployee(companyId, id);
    if (!ok) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
