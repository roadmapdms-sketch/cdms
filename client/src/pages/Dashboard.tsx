import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { canAccessFinanceModules } from '../utils/roles';
import { formatZAR } from '../utils/currency';

interface DashboardStats {
  overview: {
    totalMembers: number;
    activeMembers: number;
    memberEngagementRate: string;
    totalEvents: number;
    upcomingEvents: number;
    totalVolunteers: number;
    activeVolunteers: number;
    volunteerEngagementRate: string;
  };
  financial: {
    totalGiving: number;
    totalExpenses: number;
    totalBudget: number;
    totalSpent: number;
    budgetUtilizationRate: string;
    pendingExpenses: number;
  };
  operations: {
    totalInventory: number;
    availableInventory: number;
    inventoryAvailabilityRate: string;
    totalVendors: number;
    activeVendors: number;
    vendorActivationRate: string;
    totalPastoralCare: number;
    openPastoralCare: number;
  };
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [showFinance, setShowFinance] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setShowFinance(canAccessFinanceModules(u.role));
    } catch {
      setShowFinance(false);
    }
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/reports/dashboard?period=${selectedPeriod}`);
      setDashboardStats(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const getRateColor = (rate: string) => {
    const numericRate = parseFloat(rate.replace('%', ''));
    if (numericRate >= 75) return 'text-green-600';
    if (numericRate >= 50) return 'text-[#e7b123]';
    return 'text-[#7a0f1a]';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#7a0f1a]">Dashboard</h1>
            <p className="text-gray-600">Welcome to Data Management System (DMS)</p>
          </div>
          <select
            className="input"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="current">Current Period</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {dashboardStats && (
        <>
          {/* Overview Stats */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 ${
              showFinance ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
            }`}
          >
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-[#e7b123]/20 rounded-full flex items-center justify-center">
                    <span className="text-[#e7b123] text-lg">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold text-[#7a0f1a]">{dashboardStats.overview.totalMembers}</p>
                  <p className="text-xs text-gray-500">
                    {dashboardStats.overview.activeMembers} active ({dashboardStats.overview.memberEngagementRate})
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-lg">📅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Events</p>
                  <p className="text-2xl font-bold text-[#7a0f1a]">{dashboardStats.overview.totalEvents}</p>
                  <p className="text-xs text-gray-500">
                    {dashboardStats.overview.upcomingEvents} upcoming
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-[#7a0f1a]/20 rounded-full flex items-center justify-center">
                    <span className="text-[#7a0f1a] text-lg">🤝</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Volunteers</p>
                  <p className="text-2xl font-bold text-[#7a0f1a]">{dashboardStats.overview.totalVolunteers}</p>
                  <p className="text-xs text-gray-500">
                    {dashboardStats.overview.activeVolunteers} active ({dashboardStats.overview.volunteerEngagementRate})
                  </p>
                </div>
              </div>
            </div>

            {showFinance && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-[#e7b123]/20 rounded-full flex items-center justify-center">
                      <span className="text-[#e7b123] text-lg">💰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Income</p>
                    <p className="text-2xl font-bold text-[#7a0f1a]">{formatZAR(dashboardStats.financial.totalGiving)}</p>
                    <p className="text-xs text-gray-500">
                      {formatZAR(dashboardStats.financial.totalExpenses)} expenses
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Financial Stats + operations */}
          <div
            className={`grid grid-cols-1 gap-6 mb-8 ${
              showFinance ? 'md:grid-cols-3' : 'md:grid-cols-2'
            }`}
          >
            {showFinance && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-[#7a0f1a] mb-4">Financial Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Budget</span>
                    <span className="text-sm font-medium text-[#7a0f1a]">{formatZAR(dashboardStats.financial.totalBudget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Spent</span>
                    <span className="text-sm font-medium text-[#e7b123]">{formatZAR(dashboardStats.financial.totalSpent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Budget Utilization</span>
                    <span className={`text-sm font-medium ${getRateColor(dashboardStats.financial.budgetUtilizationRate)}`}>
                      {dashboardStats.financial.budgetUtilizationRate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pending Expenses</span>
                    <span className="text-sm font-medium text-yellow-600">{dashboardStats.financial.pendingExpenses}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Operations</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Inventory</span>
                  <span className="text-sm font-medium text-gray-900">{dashboardStats.operations.totalInventory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Available Items</span>
                  <span className="text-sm font-medium text-green-600">{dashboardStats.operations.availableInventory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Availability Rate</span>
                  <span className={`text-sm font-medium ${getRateColor(dashboardStats.operations.inventoryAvailabilityRate)}`}>
                    {dashboardStats.operations.inventoryAvailabilityRate}
                  </span>
                </div>
                {showFinance && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Vendors</span>
                    <span className="text-sm font-medium text-blue-600">{dashboardStats.operations.activeVendors}/{dashboardStats.operations.totalVendors}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pastoral Care</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Cases</span>
                  <span className="text-sm font-medium text-gray-900">{dashboardStats.operations.totalPastoralCare}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Open Cases</span>
                  <span className="text-sm font-medium text-red-600">{dashboardStats.operations.openPastoralCare}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Vendor Activation</span>
                  <span className={`text-sm font-medium ${getRateColor(dashboardStats.operations.vendorActivationRate)}`}>
                    {dashboardStats.operations.vendorActivationRate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Member Engagement</span>
                  <span className={`text-sm font-medium ${getRateColor(dashboardStats.overview.memberEngagementRate)}`}>
                    {dashboardStats.overview.memberEngagementRate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-[#7a0f1a] mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => navigate('/members')}
                  className="p-4 border border-[#eeedee] rounded-lg hover:bg-[#e7b123]/10 text-sm font-medium text-[#7a0f1a] transition-colors"
                >
                  Add New Member
                </button>
                <button 
                  onClick={() => navigate('/attendance')}
                  className="p-4 border border-[#eeedee] rounded-lg hover:bg-[#e7b123]/10 text-sm font-medium text-[#7a0f1a] transition-colors"
                >
                  Record Attendance
                </button>
                {showFinance && (
                  <button
                    type="button"
                    onClick={() => navigate('/financial')}
                    className="p-4 border border-[#eeedee] rounded-lg hover:bg-[#e7b123]/10 text-sm font-medium text-[#7a0f1a] transition-colors"
                  >
                    Add Financial Record
                  </button>
                )}
                <button 
                  onClick={() => navigate('/events')}
                  className="p-4 border border-[#eeedee] rounded-lg hover:bg-[#e7b123]/10 text-sm font-medium text-[#7a0f1a] transition-colors"
                >
                  Create Event
                </button>
                <button 
                  onClick={() => navigate('/volunteers')}
                  className="p-4 border border-[#eeedee] rounded-lg hover:bg-[#e7b123]/10 text-sm font-medium text-[#7a0f1a] transition-colors"
                >
                  Add Volunteer
                </button>
                {showFinance && (
                  <button
                    type="button"
                    onClick={() => navigate('/expenses')}
                    className="p-4 border border-[#eeedee] rounded-lg hover:bg-[#e7b123]/10 text-sm font-medium text-[#7a0f1a] transition-colors"
                  >
                    Record Expense
                  </button>
                )}
                <button 
                  onClick={() => navigate('/inventory')}
                  className="p-4 border border-[#eeedee] rounded-lg hover:bg-[#e7b123]/10 text-sm font-medium text-[#7a0f1a] transition-colors"
                >
                  Manage Inventory
                </button>
                <button 
                  onClick={() => navigate('/pastoral-care')}
                  className="p-4 border border-[#eeedee] rounded-lg hover:bg-[#e7b123]/10 text-sm font-medium text-[#7a0f1a] transition-colors"
                >
                  Pastoral Care
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
