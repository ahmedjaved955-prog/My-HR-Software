import React, { useEffect, useState } from 'react';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function PayrollPage() {
  const { user } = useAuth();
  const [myPayroll, setMyPayroll] = useState([]);
  const [allPayroll, setAllPayroll] = useState([]);
  const [form, setForm] = useState({ employee_id: '', month: '', year: '' });

  const isManager = user && (user.role === 'ADMIN' || user.role === 'HR');

  const loadMy = () => {
    client
      .get('/payroll/my')
      .then((res) => setMyPayroll(res.data))
      .catch((err) => console.error(err));
  };

  const loadAll = () => {
    if (!isManager) return;
    client
      .get('/payroll')
      .then((res) => setAllPayroll(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadMy();
    loadAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await client.post('/payroll/generate', {
        employee_id: Number(form.employee_id),
        month: Number(form.month),
        year: Number(form.year),
        allowances: [],
        deductions: [],
        loan_deduction: 0,
      });
      setForm({ employee_id: '', month: '', year: '' });
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate payroll');
    }
  };

  const downloadSlip = (id) => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
    window.open(`${base}/payroll/${id}/slip`, '_blank');
  };

  return (
    <div className="space-y-4 text-sm">
      <h1 className="text-xl font-semibold">Payroll</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-medium text-sm mb-2">My Payroll</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left">Period</th>
                  <th className="px-2 py-1 text-left">Net Salary</th>
                  <th className="px-2 py-1" />
                </tr>
              </thead>
              <tbody>
                {myPayroll.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-2 py-1">
                      {p.month}/{p.year}
                    </td>
                    <td className="px-2 py-1">{p.net_salary}</td>
                    <td className="px-2 py-1 text-right">
                      <button
                        onClick={() => downloadSlip(p.id)}
                        className="px-2 py-0.5 rounded bg-blue-600 text-white"
                      >
                        Slip
                      </button>
                    </td>
                  </tr>
                ))}
                {!myPayroll.length && (
                  <tr>
                    <td className="px-2 py-2 text-gray-500" colSpan={3}>
                      No payroll records.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isManager && (
          <div className="bg-white rounded shadow p-4 space-y-3">
            <h2 className="font-medium text-sm">Generate Payroll</h2>
            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              <input
                name="employee_id"
                value={form.employee_id}
                onChange={handleChange}
                className="border rounded px-2 py-1"
                placeholder="Employee ID"
                required
              />
              <input
                name="month"
                value={form.month}
                onChange={handleChange}
                className="border rounded px-2 py-1"
                placeholder="Month (1-12)"
                required
              />
              <input
                name="year"
                value={form.year}
                onChange={handleChange}
                className="border rounded px-2 py-1"
                placeholder="Year"
                required
              />
              <button
                type="submit"
                className="md:col-span-3 px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Generate
              </button>
            </form>

            <div className="mt-3">
              <h3 className="font-medium text-sm mb-1">All Payroll</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left">Employee</th>
                      <th className="px-2 py-1 text-left">Period</th>
                      <th className="px-2 py-1 text-left">Net Salary</th>
                      <th className="px-2 py-1" />
                    </tr>
                  </thead>
                  <tbody>
                    {allPayroll.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="px-2 py-1">
                          {p.first_name} {p.last_name}
                        </td>
                        <td className="px-2 py-1">
                          {p.month}/{p.year}
                        </td>
                        <td className="px-2 py-1">{p.net_salary}</td>
                        <td className="px-2 py-1 text-right">
                          <button
                            onClick={() => downloadSlip(p.id)}
                            className="px-2 py-0.5 rounded bg-blue-600 text-white"
                          >
                            Slip
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!allPayroll.length && (
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
          </div>
        )}
      </div>
    </div>
  );
}
