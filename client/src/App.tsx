import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Attendance from './pages/Attendance';
import Financial from './pages/Financial';
import Communications from './pages/Communications';
import Events from './pages/Events';
import Volunteers from './pages/Volunteers';
import PastoralCare from './pages/PastoralCare';
import Inventory from './pages/Inventory';
import Expenses from './pages/Expenses';
import Vendors from './pages/Vendors';
import Budget from './pages/Budget';
import Reports from './pages/Reports';
import AdminDashboard from './pages/admin/AdminDashboard';
import AccountantDashboard from './pages/accountant/AccountantDashboard';
import PastorDashboard from './pages/pastor/PastorDashboard';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import MemberDashboard from './pages/member/MemberDashboard';
import { LAYOUT_ALLOWED_ROLES, getDefaultHomePath, FINANCE_ALLOWED_ROLES } from './utils/roles';

function CatchAllRedirect() {
  const token = localStorage.getItem('token');
  const raw = localStorage.getItem('user');
  if (token && raw) {
    try {
      const user = JSON.parse(raw) as { role?: string };
      return <Navigate to={getDefaultHomePath(user.role)} replace />;
    } catch {
      /* fall through */
    }
  }
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accountant/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ACCOUNTANT', 'ADMIN']}>
                <AccountantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pastor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['PASTOR', 'ADMIN', 'STAFF']}>
                <PastorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['VOLUNTEER_COORDINATOR', 'ADMIN']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/dashboard"
            element={
              <ProtectedRoute allowedRoles={['MEMBER']}>
                <MemberDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={LAYOUT_ALLOWED_ROLES}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="attendance" element={<Attendance />} />
            <Route
              path="financial"
              element={
                <ProtectedRoute allowedRoles={[...FINANCE_ALLOWED_ROLES]}>
                  <Financial />
                </ProtectedRoute>
              }
            />
            <Route path="communications" element={<Communications />} />
            <Route path="events" element={<Events />} />
            <Route path="volunteers" element={<Volunteers />} />
            <Route path="pastoral-care" element={<PastoralCare />} />
            <Route path="inventory" element={<Inventory />} />
            <Route
              path="expenses"
              element={
                <ProtectedRoute allowedRoles={[...FINANCE_ALLOWED_ROLES]}>
                  <Expenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="vendors"
              element={
                <ProtectedRoute allowedRoles={[...FINANCE_ALLOWED_ROLES]}>
                  <Vendors />
                </ProtectedRoute>
              }
            />
            <Route
              path="budget"
              element={
                <ProtectedRoute allowedRoles={[...FINANCE_ALLOWED_ROLES]}>
                  <Budget />
                </ProtectedRoute>
              }
            />
            <Route path="reports" element={<Reports />} />
          </Route>

          <Route path="*" element={<CatchAllRedirect />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
