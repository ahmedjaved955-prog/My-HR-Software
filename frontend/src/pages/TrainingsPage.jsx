import React, { useEffect, useState } from 'react';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function TrainingsPage() {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [myEnrolments, setMyEnrolments] = useState([]);
  const [allEnrolments, setAllEnrolments] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', start_date: '', end_date: '' });

  const isManager = user && (user.role === 'ADMIN' || user.role === 'HR');

  const load = () => {
    client
      .get('/trainings')
      .then((res) => setTrainings(res.data))
      .catch((err) => console.error(err));
    client
      .get('/trainings/my/enrolments')
      .then((res) => setMyEnrolments(res.data))
      .catch((err) => console.error(err));
    if (isManager) {
      client
        .get('/trainings/enrolments')
        .then((res) => setAllEnrolments(res.data))
        .catch((err) => console.error(err));
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const createTraining = async (e) => {
    e.preventDefault();
    await client.post('/trainings', form);
    setForm({ title: '', description: '', start_date: '', end_date: '' });
    load();
  };

  const enrol = async (id) => {
    await client.post(`/trainings/${id}/enrol`);
    load();
  };

  return (
    <div className="space-y-4 text-sm">
      <h1 className="text-xl font-semibold">Trainings</h1>

      {isManager && (
        <div className="bg-white rounded shadow p-4 space-y-2">
          <h2 className="font-medium text-sm">Add Training</h2>
          <form onSubmit={createTraining} className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Title"
              className="border rounded px-2 py-1"
              required
            />
            <input
              name="start_date"
              type="date"
              value={form.start_date}
              onChange={handleChange}
              className="border rounded px-2 py-1"
            />
            <input
              name="end_date"
              type="date"
              value={form.end_date}
              onChange={handleChange}
              className="border rounded px-2 py-1"
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="border rounded px-2 py-1 md:col-span-2"
            />
            <button className="md:col-span-2 px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700">
              Save
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-medium text-sm mb-2">Available Trainings</h2>
          <ul className="space-y-1">
            {trainings.map((t) => (
              <li key={t.id} className="border rounded px-2 py-1 flex items-center justify-between">
                <div>
                  <div className="font-medium">{t.title}</div>
                  <div className="text-gray-600 text-xs">
                    {t.start_date} - {t.end_date}
                  </div>
                </div>
                <button
                  onClick={() => enrol(t.id)}
                  className="px-2 py-0.5 rounded bg-green-600 text-white"
                >
                  Enrol
                </button>
              </li>
            ))}
            {!trainings.length && <li>No trainings.</li>}
          </ul>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h2 className="font-medium text-sm mb-2">My Enrolments</h2>
          <ul className="space-y-1">
            {myEnrolments.map((e) => (
              <li key={e.id} className="border rounded px-2 py-1">
                <div className="font-medium">{e.training_title}</div>
                <div className="text-gray-600 text-xs">Status: {e.status}</div>
              </li>
            ))}
            {!myEnrolments.length && <li>No enrolments.</li>}
          </ul>
        </div>
      </div>

      {isManager && (
        <div className="bg-white rounded shadow p-4 text-xs">
          <h2 className="font-medium text-sm mb-2">All Enrolments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left">Training</th>
                  <th className="px-2 py-1 text-left">Status</th>
                  <th className="px-2 py-1 text-left">Completion Date</th>
                </tr>
              </thead>
              <tbody>
                {allEnrolments.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="px-2 py-1">{e.training_title}</td>
                    <td className="px-2 py-1">{e.status}</td>
                    <td className="px-2 py-1">{e.completion_date}</td>
                  </tr>
                ))}
                {!allEnrolments.length && (
                  <tr>
                    <td className="px-2 py-2 text-gray-500" colSpan={3}>
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
  );
}
