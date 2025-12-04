import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client.js';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    client
      .get(`/employees/${id}`)
      .then((res) => setEmployee(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load employee'));
  }, [id]);

  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!employee) return <div>Loading...</div>;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">
        {employee.first_name} {employee.last_name}
      </h1>
      <div className="bg-white rounded shadow p-4 text-sm space-y-1">
        <div>Email: {employee.email}</div>
        <div>Department: {employee.department}</div>
        <div>Position: {employee.position}</div>
        <div>Date of joining: {employee.date_of_joining}</div>
        <div>Employment type: {employee.employment_type}</div>
        <div>Base salary: {employee.base_salary}</div>
      </div>
    </div>
  );
}
