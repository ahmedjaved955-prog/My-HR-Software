import React, { useEffect, useState } from 'react';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function SettingsPage() {
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ name: '', code: '' });

  const isAdmin = user && user.role === 'ADMIN';

  const load = () => {
    if (!isAdmin) return;
    client
      .get('/settings/company')
      .then((res) => {
        setCompany(res.data);
        setForm({ name: res.data?.name || '', code: res.data?.code || '' });
      })
      .catch((err) => console.error(err));
    client
      .get('/settings/users')
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
    client
      .get('/settings/audit-logs?limit=100')
      .then((res) => setLogs(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAdmin) {
    return <div className="text-sm text-red-600">Settings are only available to Admins.</div>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveCompany = async (e) => {
    e.preventDefault();
    await client.put('/settings/company', form);
    load();
  };

  const changeRole = async (id, role) => {
    await client.patch(`/settings/users/${id}/role`, { role });
    load();
  };

  const changeStatus = async (id, is_active) => {
    await client.patch(`/settings/users/${id}/status`, { is_active });
    load();
  };

  return (
    <div className="space-y-4 text-sm">
      <h1 className="text-xl font-semibold">Settings & Administration</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-white rounded shadow p-4 space-y-2">
          <h2 className="font-medium text-sm">Company Settings</h2>
          <form onSubmit={saveCompany} className="space-y-2">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Company name"
              className="border rounded px-2 py-1 w-full"
              required
            />
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="Company code"
              className="border rounded px-2 py-1 w-full"
              required
            />
            <button className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700">
              Save
            </button>
          </form>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h2 className="font-medium text-sm mb-2">Users & Roles</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left">Email</th>
                  <th className="px-2 py-1 text-left">Role</th>
                  <th className="px-2 py-1 text-left">Status</th>
                  <th className="px-2 py-1" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-2 py-1">{u.email}</td>
                    <td className="px-2 py-1">{u.role}</td>
                    <td className="px-2 py-1">{u.is_active ? 'Active' : 'Inactive'}</td>
                    <td className="px-2 py-1 space-x-1 text-right">
                      <button
                        onClick={() => changeRole(u.id, 'ADMIN')}
                        className="px-2 py-0.5 rounded bg-gray-800 text-white"
                      >
                        Make Admin
                      </button>
                      <button
                        onClick={() => changeRole(u.id, 'HR')}
                        className="px-2 py-0.5 rounded bg-indigo-600 text-white"
                      >
                        Make HR
                      </button>
                      <button
                        onClick={() => changeRole(u.id, 'EMPLOYEE')}
                        className="px-2 py-0.5 rounded bg-green-600 text-white"
                      >
                        Make Emp
                      </button>
                      <button
                        onClick={() => changeStatus(u.id, !u.is_active)}
                        className="px-2 py-0.5 rounded bg-red-600 text-white"
                      >
                        {u.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
                {!users.length && (
                  <tr>
                    <td className="px-2 py-2 text-gray-500" colSpan={4}>
                      No users.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4 text-xs">
        <h2 className="font-medium text-sm mb-2">Audit Logs</h2>
        <div className="overflow-x-auto max-h-64">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1 text-left">Time</th>
                <th className="px-2 py-1 text-left">User</th>
                <th className="px-2 py-1 text-left">Action</th>
                <th className="px-2 py-1 text-left">Entity</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="px-2 py-1">{l.created_at}</td>
                  <td className="px-2 py-1">{l.user_id}</td>
                  <td className="px-2 py-1">{l.action}</td>
                  <td className="px-2 py-1">{l.entity}</td>
                </tr>
              ))}
              {!logs.length && (
                <tr>
                  <td className="px-2 py-2 text-gray-500" colSpan={4}>
                    No audit logs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
