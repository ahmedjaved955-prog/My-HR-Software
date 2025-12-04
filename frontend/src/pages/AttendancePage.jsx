import React, { useEffect, useState } from 'react';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AttendancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isManager = user && (user.role === 'ADMIN' || user.role === 'HR');

  const load = () => {
    if (!isManager) return;
    setLoading(true);
    client
      .get('/attendance')
      .then((res) => setRecords(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load attendance'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const doCheckIn = async () => {
    setMessage('');
    setError('');
    try {
      const res = await client.post('/attendance/check-in', {});
      setMessage(`Checked in at ${res.data.check_in}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed');
    }
  };

  const doCheckOut = async () => {
    setMessage('');
    setError('');
    try {
      const res = await client.post('/attendance/check-out', {});
      setMessage(`Checked out at ${res.data.check_out}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-out failed');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Attendance</h1>

      <div className="bg-white rounded shadow p-4 space-y-3 text-sm">
        <div className="flex gap-2">
          <button
            onClick={doCheckIn}
            className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Check In
          </button>
          <button
            onClick={doCheckOut}
            className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Check Out
          </button>
        </div>
        {message && <div className="text-green-700">{message}</div>}
        {error && <div className="text-red-600">{error}</div>}
      </div>

      {isManager && (
        <div className="bg-white rounded shadow overflow-hidden">
          <div className="p-3 font-medium text-sm border-b">Recent Records</div>
          {loading ? (
            <div className="p-3 text-sm">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left">Employee</th>
                    <th className="px-2 py-1 text-left">Check-in</th>
                    <th className="px-2 py-1 text-left">Check-out</th>
                    <th className="px-2 py-1 text-left">Hours</th>
                    <th className="px-2 py-1 text-left">Overtime</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="px-2 py-1">
                        {r.first_name} {r.last_name}
                      </td>
                      <td className="px-2 py-1">{r.check_in}</td>
                      <td className="px-2 py-1">{r.check_out}</td>
                      <td className="px-2 py-1">{r.work_hours}</td>
                      <td className="px-2 py-1">{r.overtime_hours}</td>
                    </tr>
                  ))}
                  {!records.length && (
                    <tr>
                      <td className="px-2 py-2 text-gray-500" colSpan={5}>
                        No records.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
