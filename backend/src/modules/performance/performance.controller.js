import {
  listKpis,
  createKpi,
  createPerformance,
  listPerformance,
  listMyPerformance,
} from './performance.service.js';

export async function listKpisController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const data = await listKpis(companyId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function createKpiController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const data = await createKpi(companyId, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function createPerformanceController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const data = await createPerformance(companyId, req.user.id, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function listPerformanceController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { employeeId } = req.query;
    const data = await listPerformance(companyId, { employeeId });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function listMyPerformanceController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const data = await listMyPerformance(companyId, req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
