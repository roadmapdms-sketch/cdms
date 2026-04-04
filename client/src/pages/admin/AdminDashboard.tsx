import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { logout } from '../../utils/authSession';

interface AdminStats {
  totalMembers: number;
  totalBudget: number;
  attendanceRate: number;
  upcomingEvents: number;
  monthlyGrowth: number;
  monthlyIncome: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalMembers: 0,
    totalBudget: 0,
    attendanceRate: 0,
    upcomingEvents: 0,
    monthlyGrowth: 0,
    monthlyIncome: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">🏛️ Admin Dashboard</h1>
              <span className="text-sm text-gray-500">👤 Admin</span>
            </div>
            <button
              type="button"
              onClick={() => logout(navigate)}
              className="text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Overview */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{stats.totalMembers.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Members</div>
              <div className="text-xs text-green-600 mt-1">+{stats.monthlyGrowth}% this month</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">₦{stats.totalBudget.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Budget</div>
              <div className="text-xs text-green-600 mt-1">₦{stats.monthlyIncome.toLocaleString()} this month</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">{stats.attendanceRate}%</div>
              <div className="text-sm text-gray-500">Attendance</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-orange-600">{stats.upcomingEvents}</div>
              <div className="text-sm text-gray-500">Events</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🎯 Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              👥 Add User
            </button>
            <button
              onClick={() => navigate('/admin/giving')}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              💰 Record Giving
            </button>
            <button
              onClick={() => navigate('/admin/events')}
              className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              📅 Create Event
            </button>
            <button
              onClick={() => navigate('/admin/communications')}
              className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              📧 Send Message
            </button>
            <button
              onClick={() => navigate('/admin/reports')}
              className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              📊 Generate Report
            </button>
            <button
              onClick={() => navigate('/admin/settings')}
              className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ⚙️ Settings
            </button>
          </div>
        </div>

        {/* Analytics & Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Member Growth</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Members This Month</span>
                <span className="text-lg font-bold text-green-600">+{stats.monthlyGrowth}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: `${stats.monthlyGrowth * 5}%`}}></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Financial Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Income This Month</span>
                <span className="text-lg font-bold text-green-600">₦{stats.monthlyIncome.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 flex space-x-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200"
          >
            👥 User Management
          </button>
          <button
            onClick={() => navigate('/admin/financial')}
            className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200"
          >
            💰 Financial
          </button>
          <button
            onClick={() => navigate('/admin/reports')}
            className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-200"
          >
            📊 Full Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
