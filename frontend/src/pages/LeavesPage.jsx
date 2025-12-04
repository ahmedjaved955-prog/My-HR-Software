import React, { useEffect, useState } from 'react';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LeavesPage() {
  const { user } = useAuth();
  const [myLeaves, setMyLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [form, setForm] = useState({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const isManager = user && (user.role === 'ADMIN' || user.role === 'HR');

  const loadMy = () => {
    client
      .get('/leaves/my')
      .then((res) => setMyLeaves(res.data))
      .catch((err) => console.error(err));
    client
      .get('/leaves/balance')
      .then((res) => setBalances(res.data))
      .catch((err) => console.error(err));
  };

  const loadAll = () => {
    if (!isManager) return;
    client
      .get('/leaves')
      .then((res) => setAllLeaves(res.data))
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

  const handleApply = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await client.post('/leaves/apply', {
        ...form,
        leave_type_id: Number(form.leave_type_id),
      });
      setMessage('Leave applied successfully');
      setForm({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
      loadMy();
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply leave');
    }
  };

  const handleApprove = async (id, status) => {
    try {
      await client.post(`/leaves/${id}/approve`, { status });
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update leave');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Leaves</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded shadow p-4 text-sm space-y-3">
          <h2 className="font-medium text-sm">Apply Leave</h2>
          {error && <div className="text-red-600 text-xs">{error}</div>}
          {message && <div className="text-green-700 text-xs">{message}</div>}
          <form onSubmit={handleApply} className="space-y-2">
            <select
              name="leave_type_id"
              value={form.leave_type_id}
              onChange={handleChange}
              className="border rounded px-2 py-1 w-full"
              required
            >
              <option value="">Select leave type</option>
              {balances.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} (remaining {b.remaining})
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full"
                required
              />
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full"
                required
              />
            </div>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className="border rounded px-2 py-1 w-full"
              placeholder="Reason"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs hover:bg-blue-700"
            >
              Submit
            </button>
          </form>
        </div>

        <div className="bg-white rounded shadow p-4 text-sm">
          <h2 className="font-medium text-sm mb-2">My Leave Balance</h2>
          <ul className="space-y-1 text-xs">
            {balances.map((b) => (
              <li key={b.id}>
                {b.name}: {b.remaining} / {b.default_allocation}
              </li>
            ))}
            {!balances.length && <li>No leave types configured.</li>}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-white rounded shadow overflow-hidden">
          <div className="p-2 font-medium border-b">My Leaves</div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left">Type</th>
                  <th className="px-2 py-1 text-left">From</th>
                  <th className="px-2 py-1 text-left">To</th>
                  <th className="px-2 py-1 text-left">Days</th>
                  <th className="px-2 py-1 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="px-2 py-1">{l.leave_type_name}</td>
                    <td className="px-2 py-1">{l.start_date}</td>
                    <td className="px-2 py-1">{l.end_date}</td>
                    <td className="px-2 py-1">{l.total_days}</td>
                    <td className="px-2 py-1">{l.status}</td>
                  </tr>
                ))}
                {!myLeaves.length && (
                  <tr>
                    <td className="px-2 py-2 text-gray-500" colSpan={5}>
                      No leave records.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isManager && (
          <div className="bg-white rounded shadow overflow-hidden">
            <div className="p-2 font-medium border-b">All Leaves</div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left">Employee</th>
                    <th className="px-2 py-1 text-left">Type</th>
                    <th className="px-2 py-1 text-left">From</th>
                    <th className="px-2 py-1 text-left">To</th>
                    <th className="px-2 py-1 text-left">Status</th>
                    <th className="px-2 py-1" />
                  </tr>
                </thead>
                <tbody>
                  {allLeaves.map((l) => (
                    <tr key={l.id} className="border-t">
                      <td className="px-2 py-1">
                        {l.first_name} {l.last_name}
                      </td>
                      <td className="px-2 py-1">{l.leave_type_name}</td>
                      <td className="px-2 py-1">{l.start_date}</td>
                      <td className="px-2 py-1">{l.end_date}</td>
                      <td className="px-2 py-1">{l.status}</td>
                      <td className="px-2 py-1 text-right space-x-1">
                        {l.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(l.id, 'APPROVED')}
                              className="px-2 py-0.5 rounded bg-green-600 text-white"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApprove(l.id, 'REJECTED')}
                              className="px-2 py-0.5 rounded bg-red-500 text-white"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!allLeaves.length && (
                    <tr>
                      <td className="px-2 py-2 text-gray-500" colSpan={6}>
                        No leave requests.
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
