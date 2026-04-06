import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLandingOrRedirect from './components/PublicLandingOrRedirect';
import Login from './pages/Login';
import Register from './pages/Register';
import PortalInfoPage from './pages/PortalInfoPage';
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
import BudgetPlanning from './pages/BudgetPlanning';
import Reports from './pages/Reports';
import ReportingDashboard from './pages/ReportingDashboard';
import Partners from './pages/Partners';
import PrayersLine from './pages/PrayersLine';
import Builders from './pages/Builders';
import Hostels from './pages/Hostels';
import GuestHouse from './pages/GuestHouse';
import AdminDashboard from './pages/admin/AdminDashboard';
import AccountantDashboard from './pages/accountant/AccountantDashboard';
import PastorDashboard from './pages/pastor/PastorDashboard';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import MemberDashboard from './pages/member/MemberDashboard';
import MediaDepartmentDashboard from './pages/media/MediaDepartmentDashboard';
import KitchenRestaurantDashboard from './pages/kitchen/KitchenRestaurantDashboard';
import ManagementDashboard from './pages/management/ManagementDashboard';
import UsherManagementDashboard from './pages/usher/UsherManagementDashboard';
import PartnersPortalDashboard from './pages/partners/PartnersPortalDashboard';
import PrayerLinePortalDashboard from './pages/prayerline/PrayerLinePortalDashboard';
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
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<PublicLandingOrRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/portal/:slug" element={<PortalInfoPage />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']} requireRootAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

          <Route
            path="/accountant"
            element={
              <ProtectedRoute allowedRoles={['ACCOUNTANT', 'ADMIN']}>
                <AccountantDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/accountant/dashboard" element={<Navigate to="/accountant" replace />} />

          <Route
            path="/pastor"
            element={
              <ProtectedRoute allowedRoles={['PASTOR', 'ADMIN', 'STAFF']}>
                <PastorDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/pastor/dashboard" element={<Navigate to="/pastor" replace />} />

          <Route
            path="/volunteer"
            element={
              <ProtectedRoute allowedRoles={['VOLUNTEER_COORDINATOR', 'ADMIN']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/volunteer/dashboard" element={<Navigate to="/volunteer" replace />} />

          <Route
            path="/user"
            element={
              <ProtectedRoute allowedRoles={['MEMBER', 'USER', 'VOLUNTEER']}>
                <MemberDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/member/dashboard" element={<Navigate to="/user" replace />} />

          <Route
            path="/media"
            element={
              <ProtectedRoute allowedRoles={['MEDIA_DEPARTMENT', 'ADMIN']}>
                <MediaDepartmentDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/media/dashboard" element={<Navigate to="/media" replace />} />

          <Route
            path="/kitchen"
            element={
              <ProtectedRoute allowedRoles={['KITCHEN_RESTAURANT', 'ADMIN']}>
                <KitchenRestaurantDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/kitchen/dashboard" element={<Navigate to="/kitchen" replace />} />

          <Route
            path="/management"
            element={
              <ProtectedRoute allowedRoles={['MANAGEMENT', 'ADMIN']}>
                <ManagementDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/management/dashboard" element={<Navigate to="/management" replace />} />

          <Route
            path="/ushers"
            element={
              <ProtectedRoute allowedRoles={['USHER_MANAGEMENT', 'ADMIN']}>
                <UsherManagementDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/ushers/dashboard" element={<Navigate to="/ushers" replace />} />

          <Route
            path="/ministry-partners"
            element={
              <ProtectedRoute allowedRoles={['PARTNERS_COORDINATOR', 'ADMIN']}>
                <PartnersPortalDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/ministry-partners/dashboard" element={<Navigate to="/ministry-partners" replace />} />

          <Route
            path="/prayer-line-portal"
            element={
              <ProtectedRoute allowedRoles={['PRAYER_LINE_COORDINATOR', 'ADMIN']}>
                <PrayerLinePortalDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/prayer-line-portal/dashboard" element={<Navigate to="/prayer-line-portal" replace />} />

          <Route
            element={
              <ProtectedRoute allowedRoles={LAYOUT_ALLOWED_ROLES}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route
              path="/financial"
              element={
                <ProtectedRoute allowedRoles={[...FINANCE_ALLOWED_ROLES]}>
                  <Financial />
                </ProtectedRoute>
              }
            />
            <Route path="/communications" element={<Communications />} />
            <Route path="/events" element={<Events />} />
            <Route path="/volunteers" element={<Volunteers />} />
            <Route path="/pastoral-care" element={<PastoralCare />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute allowedRoles={[...FINANCE_ALLOWED_ROLES]}>
                  <Expenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendors"
              element={
                <ProtectedRoute allowedRoles={[...FINANCE_ALLOWED_ROLES]}>
                  <Vendors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/budget"
              element={
                <ProtectedRoute allowedRoles={[...FINANCE_ALLOWED_ROLES]}>
                  <Budget />
                </ProtectedRoute>
              }
            />
            <Route
              path="/budget-planning"
              element={
                <ProtectedRoute allowedRoles={[...FINANCE_ALLOWED_ROLES]}>
                  <BudgetPlanning />
                </ProtectedRoute>
              }
            />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reporting-dashboard" element={<ReportingDashboard />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/prayer-line" element={<PrayersLine />} />
            <Route path="/builders" element={<Builders />} />
            <Route path="/hostels" element={<Hostels />} />
            <Route path="/guest-house" element={<GuestHouse />} />
          </Route>

          <Route path="*" element={<CatchAllRedirect />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
