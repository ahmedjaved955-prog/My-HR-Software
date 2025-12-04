import React, { useEffect, useState } from 'react';
import client from '../api/client.js';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    client
      .get('/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  if (error) {
    return <div className="text-red-600 text-sm">{error}</div>;
  }

  if (!data) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="bg-white rounded shadow p-4">
          <div className="text-sm text-gray-500">Total Employees</div>
          <div className="text-2xl font-semibold">{data.total_employees}</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-sm text-gray-500">Present Today</div>
          <div className="text-2xl font-semibold">{data.attendance_overview.present_today}</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-sm text-gray-500">Payroll This Month</div>
          <div className="text-2xl font-semibold">
            {data.payroll_this_month.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
          </div>
        </div>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-medium mb-2 text-sm">Recruitment Pipeline</h2>
          <div className="text-sm">Open Jobs: {data.recruitment_pipeline.open_jobs}</div>
          <div className="text-sm">Closed Jobs: {data.recruitment_pipeline.closed_jobs}</div>
          <div className="mt-2 text-sm font-medium">Applicants</div>
          <ul className="text-xs mt-1 space-y-0.5">
            {Object.entries(data.recruitment_pipeline.applicants_by_status || {}).map(([status, count]) => (
              <li key={status}>
                {status}: {count}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded shadow p-4 space-y-2">
          <h2 className="font-medium text-sm">Performance</h2>
          <div className="text-sm">
            Reviews (last 90 days): {data.performance_stats.reviews_last_90_days}
          </div>
          <div className="text-sm">
            Avg Score (last 90 days): {data.performance_stats.avg_score_last_90_days}
          </div>
          <h2 className="font-medium text-sm mt-4">Leaves Today</h2>
          <div className="text-sm">Approved: {data.leave_overview.approved_today}</div>
          <div className="text-sm">Pending: {data.leave_overview.pending_today}</div>
        </div>
      </div>
    </div>
  );
}
