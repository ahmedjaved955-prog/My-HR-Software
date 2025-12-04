import React, { useEffect, useState } from 'react';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function PerformancePage() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState([]);
  const [myPerf, setMyPerf] = useState([]);
  const [allPerf, setAllPerf] = useState([]);
  const [kpiForm, setKpiForm] = useState({ name: '', description: '', weight: 1 });
  const [perfForm, setPerfForm] = useState({ employee_id: '', kpi_id: '', score: '', period_start: '', period_end: '', comments: '' });

  const isManager = user && (user.role === 'ADMIN' || user.role === 'HR');

  const load = () => {
    client
      .get('/performance/kpis')
      .then((res) => setKpis(res.data))
      .catch((err) => console.error(err));
    client
      .get('/performance/my')
      .then((res) => setMyPerf(res.data))
      .catch((err) => console.error(err));
    if (isManager) {
      client
        .get('/performance')
        .then((res) => setAllPerf(res.data))
        .catch((err) => console.error(err));
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKpiChange = (e) => {
    const { name, value } = e.target;
    setKpiForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePerfChange = (e) => {
    const { name, value } = e.target;
    setPerfForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitKpi = async (e) => {
    e.preventDefault();
    await client.post('/performance/kpis', {
      ...kpiForm,
      weight: Number(kpiForm.weight || 1),
    });
    setKpiForm({ name: '', description: '', weight: 1 });
    load();
  };

  const submitPerf = async (e) => {
    e.preventDefault();
    await client.post('/performance', {
      ...perfForm,
      employee_id: Number(perfForm.employee_id),
      kpi_id: Number(perfForm.kpi_id),
      score: Number(perfForm.score),
    });
    setPerfForm({ employee_id: '', kpi_id: '', score: '', period_start: '', period_end: '', comments: '' });
    load();
  };

  return (
    <div className="space-y-4 text-sm">
      <h1 className="text-xl font-semibold">Performance</h1>

      {isManager && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded shadow p-4 space-y-2">
            <h2 className="font-medium text-sm">Create KPI</h2>
            <form onSubmit={submitKpi} className="space-y-2 text-xs">
              <input
                name="name"
                value={kpiForm.name}
                onChange={handleKpiChange}
                placeholder="Name"
                className="border rounded px-2 py-1 w-full"
                required
              />
              <textarea
                name="description"
                value={kpiForm.description}
                onChange={handleKpiChange}
                placeholder="Description"
                className="border rounded px-2 py-1 w-full"
              />
              <input
                name="weight"
                value={kpiForm.weight}
                onChange={handleKpiChange}
                placeholder="Weight"
                className="border rounded px-2 py-1 w-full"
              />
              <button className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700">
                Save KPI
              </button>
            </form>
          </div>

          <div className="bg-white rounded shadow p-4 space-y-2">
            <h2 className="font-medium text-sm">Create Appraisal</h2>
            <form onSubmit={submitPerf} className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <input
                name="employee_id"
                value={perfForm.employee_id}
                onChange={handlePerfChange}
                placeholder="Employee ID"
                className="border rounded px-2 py-1"
                required
              />
              <select
                name="kpi_id"
                value={perfForm.kpi_id}
                onChange={handlePerfChange}
                className="border rounded px-2 py-1"
                required
              >
                <option value="">Select KPI</option>
                {kpis.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name}
                  </option>
                ))}
              </select>
              <input
                name="score"
                value={perfForm.score}
                onChange={handlePerfChange}
                placeholder="Score"
                className="border rounded px-2 py-1"
                required
              />
              <input
                type="date"
                name="period_start"
                value={perfForm.period_start}
                onChange={handlePerfChange}
                className="border rounded px-2 py-1"
                required
              />
              <input
                type="date"
                name="period_end"
                value={perfForm.period_end}
                onChange={handlePerfChange}
                className="border rounded px-2 py-1"
                required
              />
              <textarea
                name="comments"
                value={perfForm.comments}
                onChange={handlePerfChange}
                placeholder="Comments"
                className="border rounded px-2 py-1 md:col-span-2"
              />
              <button className="md:col-span-2 px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700">
                Save Appraisal
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-white rounded shadow overflow-hidden">
          <div className="p-2 font-medium border-b">My Performance</div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left">KPI</th>
                  <th className="px-2 py-1 text-left">Score</th>
                  <th className="px-2 py-1 text-left">Period</th>
                  <th className="px-2 py-1 text-left">Comments</th>
                </tr>
              </thead>
              <tbody>
                {myPerf.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-2 py-1">{p.kpi_name}</td>
                    <td className="px-2 py-1">{p.score}</td>
                    <td className="px-2 py-1">
                      {p.period_start} - {p.period_end}
                    </td>
                    <td className="px-2 py-1">{p.comments}</td>
                  </tr>
                ))}
                {!myPerf.length && (
                  <tr>
                    <td className="px-2 py-2 text-gray-500" colSpan={4}>
                      No performance records.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isManager && (
          <div className="bg-white rounded shadow overflow-hidden">
            <div className="p-2 font-medium border-b">All Appraisals</div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left">Employee</th>
                    <th className="px-2 py-1 text-left">KPI</th>
                    <th className="px-2 py-1 text-left">Score</th>
                    <th className="px-2 py-1 text-left">Period</th>
                  </tr>
                </thead>
                <tbody>
                  {allPerf.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-2 py-1">
                        {p.first_name} {p.last_name}
                      </td>
                      <td className="px-2 py-1">{p.kpi_name}</td>
                      <td className="px-2 py-1">{p.score}</td>
                      <td className="px-2 py-1">
                        {p.period_start} - {p.period_end}
                      </td>
                    </tr>
                  ))}
                  {!allPerf.length && (
                    <tr>
                      <td className="px-2 py-2 text-gray-500" colSpan={4}>
                        No records.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
