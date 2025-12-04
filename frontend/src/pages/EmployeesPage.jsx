import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function EmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    position: '',
    base_salary: '',
  });
  const navigate = useNavigate();

  const canManage = user && (user.role === 'ADMIN' || user.role === 'HR');

  const load = () => {
    setLoading(true);
    client
      .get('/employees')
      .then((res) => setEmployees(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load employees'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await client.post('/employees', {
        ...form,
        base_salary: form.base_salary ? Number(form.base_salary) : null,
      });
      setForm({ first_name: '', last_name: '', email: '', department: '', position: '', base_salary: '' });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create employee');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete employee?')) return;
    try {
      await client.delete(`/employees/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Employees</h1>
      </div>

      {canManage && (
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-medium mb-3 text-sm">Add Employee</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <input
              name="first_name"
              placeholder="First name"
              className="border rounded px-2 py-1"
              value={form.first_name}
              onChange={handleChange}
              required
            />
            <input
              name="last_name"
              placeholder="Last name"
              className="border rounded px-2 py-1"
              value={form.last_name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="border rounded px-2 py-1"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              name="department"
              placeholder="Department"
              className="border rounded px-2 py-1"
              value={form.department}
              onChange={handleChange}
            />
            <input
              name="position"
              placeholder="Position"
              className="border rounded px-2 py-1"
              value={form.position}
              onChange={handleChange}
            />
            <input
              name="base_salary"
              placeholder="Base salary"
              className="border rounded px-2 py-1"
              value={form.base_salary}
              onChange={handleChange}
            />
            <button
              type="submit"
              className="md:col-span-3 mt-1 inline-flex justify-center px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Save
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-4 text-sm">Loading...</div>
          ) : error ? (
            <div className="p-4 text-sm text-red-600">{error}</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-left">Position</th>
                  <th className="px-3 py-2 text-left">Base Salary</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="px-3 py-2 cursor-pointer text-blue-600" onClick={() => navigate(`/employees/${e.id}`)}>
                      {e.first_name} {e.last_name}
                    </td>
                    <td className="px-3 py-2">{e.email}</td>
                    <td className="px-3 py-2">{e.department}</td>
                    <td className="px-3 py-2">{e.position}</td>
                    <td className="px-3 py-2">{e.base_salary}</td>
                    <td className="px-3 py-2 text-right">
                      {canManage && (
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!employees.length && !loading && (
                  <tr>
                    <td className="px-3 py-3 text-sm text-gray-500" colSpan={6}>
                      No employees.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
