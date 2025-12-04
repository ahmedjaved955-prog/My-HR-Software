import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import EmployeesPage from './pages/EmployeesPage.jsx';
import EmployeeDetailPage from './pages/EmployeeDetailPage.jsx';
import AttendancePage from './pages/AttendancePage.jsx';
import LeavesPage from './pages/LeavesPage.jsx';
import PayrollPage from './pages/PayrollPage.jsx';
import RecruitmentPage from './pages/RecruitmentPage.jsx';
import PerformancePage from './pages/PerformancePage.jsx';
import TrainingsPage from './pages/TrainingsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/leaves" element={<LeavesPage />} />
            <Route path="/payroll" element={<PayrollPage />} />
            <Route path="/recruitment" element={<RecruitmentPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/trainings" element={<TrainingsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
