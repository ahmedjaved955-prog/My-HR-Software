import React, { useEffect, useState } from 'react';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function RecruitmentPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [jobForm, setJobForm] = useState({
    title: '',
    department: '',
    location: '',
    employment_type: '',
    description: '',
  });
  const [applicantForm, setApplicantForm] = useState({ job_id: '', full_name: '', email: '', phone: '' });

  const isManager = user && (user.role === 'ADMIN' || user.role === 'HR');

  const load = () => {
    client
      .get('/recruitment/jobs')
      .then((res) => setJobs(res.data))
      .catch((err) => console.error(err));
    if (isManager) {
      client
        .get('/recruitment/applicants')
        .then((res) => setApplicants(res.data))
        .catch((err) => console.error(err));
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleJobChange = (e) => {
    const { name, value } = e.target;
    setJobForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplicantChange = (e) => {
    const { name, value } = e.target;
    setApplicantForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitJob = async (e) => {
    e.preventDefault();
    await client.post('/recruitment/jobs', jobForm);
    setJobForm({ title: '', department: '', location: '', employment_type: '', description: '' });
    load();
  };

  const submitApplicant = async (e) => {
    e.preventDefault();
    await client.post('/recruitment/applicants', applicantForm);
    setApplicantForm({ job_id: '', full_name: '', email: '', phone: '' });
    load();
  };

  const updateStatus = async (id, status) => {
    await client.patch(`/recruitment/applicants/${id}/status`, { status });
    load();
  };

  const scheduleInterview = async (id) => {
    const dt = prompt('Interview datetime (YYYY-MM-DD HH:MM)');
    if (!dt) return;
    await client.post(`/recruitment/applicants/${id}/schedule`, { interview_date: dt });
    load();
  };

  const openOfferLetter = (id) => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
    window.open(`${base}/recruitment/applicants/${id}/offer-letter`, '_blank');
  };

  return (
    <div className="space-y-4 text-sm">
      <h1 className="text-xl font-semibold">Recruitment</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isManager && (
          <div className="bg-white rounded shadow p-4 space-y-2">
            <h2 className="font-medium text-sm">Post Job</h2>
            <form onSubmit={submitJob} className="space-y-2 text-xs">
              <input
                name="title"
                value={jobForm.title}
                onChange={handleJobChange}
                placeholder="Title"
                className="border rounded px-2 py-1 w-full"
                required
              />
              <input
                name="department"
                value={jobForm.department}
                onChange={handleJobChange}
                placeholder="Department"
                className="border rounded px-2 py-1 w-full"
              />
              <input
                name="location"
                value={jobForm.location}
                onChange={handleJobChange}
                placeholder="Location"
                className="border rounded px-2 py-1 w-full"
              />
              <input
                name="employment_type"
                value={jobForm.employment_type}
                onChange={handleJobChange}
                placeholder="Employment type"
                className="border rounded px-2 py-1 w-full"
              />
              <textarea
                name="description"
                value={jobForm.description}
                onChange={handleJobChange}
                placeholder="Description"
                className="border rounded px-2 py-1 w-full"
              />
              <button className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700">Save Job</button>
            </form>
          </div>
        )}

        <div className="bg-white rounded shadow p-4 text-xs">
          <h2 className="font-medium text-sm mb-2">Jobs</h2>
          <ul className="space-y-1">
            {jobs.map((j) => (
              <li key={j.id} className="border rounded px-2 py-1">
                <div className="font-medium">{j.title}</div>
                <div className="text-gray-600">
                  {j.department} {j.location && `• ${j.location}`}
                </div>
                <div className="text-xs text-gray-500">Status: {j.status}</div>
              </li>
            ))}
            {!jobs.length && <li>No jobs posted.</li>}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-white rounded shadow p-4 space-y-2">
          <h2 className="font-medium text-sm">Add Applicant</h2>
          <form onSubmit={submitApplicant} className="space-y-2">
            <select
              name="job_id"
              value={applicantForm.job_id}
              onChange={handleApplicantChange}
              className="border rounded px-2 py-1 w-full"
              required
            >
              <option value="">Select job</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
            <input
              name="full_name"
              value={applicantForm.full_name}
              onChange={handleApplicantChange}
              placeholder="Full name"
              className="border rounded px-2 py-1 w-full"
              required
            />
            <input
              type="email"
              name="email"
              value={applicantForm.email}
              onChange={handleApplicantChange}
              placeholder="Email"
              className="border rounded px-2 py-1 w-full"
              required
            />
            <input
              name="phone"
              value={applicantForm.phone}
              onChange={handleApplicantChange}
              placeholder="Phone"
              className="border rounded px-2 py-1 w-full"
            />
            <button className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700">Save Applicant</button>
          </form>
        </div>

        {isManager && (
          <div className="bg-white rounded shadow overflow-hidden">
            <div className="p-2 font-medium border-b">Applicants</div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left">Name</th>
                    <th className="px-2 py-1 text-left">Job</th>
                    <th className="px-2 py-1 text-left">Status</th>
                    <th className="px-2 py-1" />
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="px-2 py-1">{a.full_name}</td>
                      <td className="px-2 py-1">{a.job_title}</td>
                      <td className="px-2 py-1">{a.status}</td>
                      <td className="px-2 py-1 text-right space-x-1">
                        <button
                          onClick={() => scheduleInterview(a.id)}
                          className="px-2 py-0.5 bg-indigo-600 text-white rounded"
                        >
                          Interview
                        </button>
                        <button
                          onClick={() => updateStatus(a.id, 'OFFERED')}
                          className="px-2 py-0.5 bg-green-600 text-white rounded"
                        >
                          Offer
                        </button>
                        <button
                          onClick={() => updateStatus(a.id, 'REJECTED')}
                          className="px-2 py-0.5 bg-red-600 text-white rounded"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => openOfferLetter(a.id)}
                          className="px-2 py-0.5 bg-gray-700 text-white rounded"
                        >
                          Letter
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!applicants.length && (
                    <tr>
                      <td className="px-2 py-2 text-gray-500" colSpan={4}>
                        No applicants.
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
