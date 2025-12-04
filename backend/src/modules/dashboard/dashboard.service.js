import { query } from '../../config/db.js';

export async function getDashboardSummary(companyId) {
  const [employeesRes, presentRes, leavesRes, payrollRes, jobsRes, applicantsRes, perfRes] = await Promise.all([
    query(`SELECT COUNT(*) AS total_employees FROM employees WHERE company_id = $1`, [companyId]),
    query(
      `SELECT COUNT(DISTINCT a.employee_id) AS present_today
       FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       WHERE e.company_id = $1 AND a.check_in::date = CURRENT_DATE`,
      [companyId]
    ),
    query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'APPROVED') AS approved,
         COUNT(*) FILTER (WHERE status = 'PENDING')  AS pending
       FROM leaves l
       JOIN employees e ON l.employee_id = e.id
       WHERE e.company_id = $1
         AND CURRENT_DATE BETWEEN l.start_date AND l.end_date`,
      [companyId]
    ),
    query(
      `SELECT
         COALESCE(SUM(net_salary),0) AS total_net
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       WHERE e.company_id = $1
         AND p.year = EXTRACT(YEAR FROM CURRENT_DATE)
         AND p.month = EXTRACT(MONTH FROM CURRENT_DATE)`,
      [companyId]
    ),
    query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'OPEN') AS open_jobs,
         COUNT(*) FILTER (WHERE status <> 'OPEN') AS closed_jobs
       FROM jobs
       WHERE company_id = $1`,
      [companyId]
    ),
    query(
      `SELECT status, COUNT(*) AS count
       FROM applicants a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.company_id = $1
       GROUP BY status`,
      [companyId]
    ),
    query(
      `SELECT
         COUNT(*) AS reviews,
         COALESCE(AVG(score),0) AS avg_score
       FROM performance p
       JOIN employees e ON p.employee_id = e.id
       WHERE e.company_id = $1
         AND p.period_start >= (CURRENT_DATE - INTERVAL '90 days')`,
      [companyId]
    ),
  ]);

  const totalEmployees = Number(employeesRes.rows[0]?.total_employees || 0);
  const presentToday = Number(presentRes.rows[0]?.present_today || 0);
  const approvedLeaves = Number(leavesRes.rows[0]?.approved || 0);
  const pendingLeaves = Number(leavesRes.rows[0]?.pending || 0);
  const payrollThisMonth = Number(payrollRes.rows[0]?.total_net || 0);

  const recruitmentPipeline = {
    open_jobs: Number(jobsRes.rows[0]?.open_jobs || 0),
    closed_jobs: Number(jobsRes.rows[0]?.closed_jobs || 0),
    applicants_by_status: applicantsRes.rows.reduce((acc, row) => {
      acc[row.status] = Number(row.count || 0);
      return acc;
    }, {}),
  };

  const performanceStats = {
    reviews_last_90_days: Number(perfRes.rows[0]?.reviews || 0),
    avg_score_last_90_days: Number(perfRes.rows[0]?.avg_score || 0),
  };

  const leaveOverview = {
    approved_today: approvedLeaves,
    pending_today: pendingLeaves,
  };

  const attendanceOverview = {
    total_employees: totalEmployees,
    present_today: presentToday,
    absent_today: Math.max(totalEmployees - presentToday, 0),
  };

  return {
    total_employees: totalEmployees,
    payroll_this_month: payrollThisMonth,
    attendance_overview: attendanceOverview,
    recruitment_pipeline: recruitmentPipeline,
    performance_stats: performanceStats,
    leave_overview: leaveOverview,
  };
}
