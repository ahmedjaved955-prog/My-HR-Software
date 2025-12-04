import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/employees', label: 'Employees' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/leaves', label: 'Leaves' },
  { to: '/payroll', label: 'Payroll' },
  { to: '/performance', label: 'Performance' },
  { to: '/recruitment', label: 'Recruitment' },
  { to: '/trainings', label: 'Trainings' },
  { to: '/settings', label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-4 border-b border-gray-200 font-semibold text-lg">
        HRMS
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm font-medium ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
