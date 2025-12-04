import { getDashboardSummary } from './dashboard.service.js';

export async function getDashboardSummaryController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const summary = await getDashboardSummary(companyId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
}
