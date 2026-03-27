import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="financial" element={<Financial />} />
            <Route path="communications" element={<Communications />} />
            <Route path="events" element={<Events />} />
            <Route path="volunteers" element={<Volunteers />} />
            <Route path="pastoral-care" element={<PastoralCare />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="budget" element={<Budget />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
