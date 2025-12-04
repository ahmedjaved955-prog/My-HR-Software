import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div className="font-medium">HR Management System</div>
      <div className="flex items-center gap-4 text-sm">
        {user && (
          <>
            <span className="text-gray-700">
              {user.email} ({user.role})
            </span>
            <button
              onClick={logout}
              className="px-3 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
