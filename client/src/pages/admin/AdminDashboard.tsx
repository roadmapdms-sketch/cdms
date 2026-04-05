import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import {
  RoleDashboardLayout,
  StatCard,
  DashboardSection,
  QuickActionButton,
  DataPanel,
  RoleDashboardLoading,
} from '../../components/RoleDashboardLayout';

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
    monthlyIncome: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return <RoleDashboardLoading />;
  }

  const growthWidth = Math.min(100, Math.max(0, stats.monthlyGrowth * 5));

  return (
    <RoleDashboardLayout
      title="Administrator control center"
      roleBadge="Administrator · full visibility"
      showOperationsConsole
    >
      <DashboardSection title="System overview">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Members"
            value={stats.totalMembers.toLocaleString()}
            hint={`+${stats.monthlyGrowth}% this month`}
          />
          <StatCard
            label="Total budget"
            value={`₦${stats.totalBudget.toLocaleString()}`}
            hint={`₦${stats.monthlyIncome.toLocaleString()} this month`}
          />
          <StatCard label="Attendance rate" value={`${stats.attendanceRate}%`} />
          <StatCard label="Upcoming events" value={stats.upcomingEvents} />
        </div>
      </DashboardSection>

      <DashboardSection title="Direct module access">
        <p className="mb-4 max-w-3xl text-sm text-zinc-500">
          Open live modules in the operations console—core tools plus partners, prayer line, hospitality, builders, and
          reporting hubs.
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <QuickActionButton onClick={() => navigate('/members')}>
            👥 Members & directory
          </QuickActionButton>
          <QuickActionButton onClick={() => navigate('/financial')}>
            💰 Giving & financial
          </QuickActionButton>
          <QuickActionButton onClick={() => navigate('/events')}>
            📅 Events & scheduling
          </QuickActionButton>
          <QuickActionButton onClick={() => navigate('/communications')}>
            📧 Communications
          </QuickActionButton>
          <QuickActionButton onClick={() => navigate('/reporting-dashboard')}>
            📉 Reporting dashboard
          </QuickActionButton>
          <QuickActionButton onClick={() => navigate('/dashboard')}>
            🎛️ Operations home
          </QuickActionButton>
        </div>
      </DashboardSection>

      <DashboardSection title="Partners, prayer & hospitality">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <QuickActionButton onClick={() => navigate('/partners')}>🤝 Partners</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/prayer-line')}>📞 Prayer line</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/pastoral-care')}>🙏 Pastoral care</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/builders')}>🏗️ Builders</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/hostels')}>🛏️ Hostels</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/guest-house')}>🏠 Guest house</QuickActionButton>
        </div>
      </DashboardSection>

      <DashboardSection title="Finance & planning">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <QuickActionButton onClick={() => navigate('/budget')}>💹 Live budget</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/budget-planning')}>📐 Budget planning</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/expenses')}>🧾 Expenses</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/vendors')}>🏢 Vendors</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/reports')}>📋 Reports library</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/inventory')}>📦 Inventory</QuickActionButton>
        </div>
      </DashboardSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DataPanel title="Member growth">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">New members this month</span>
              <span className="font-semibold text-emerald-400">+{stats.monthlyGrowth}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#c9a227] to-[#e8c547]"
                style={{ width: `${growthWidth}%` }}
              />
            </div>
          </div>
        </DataPanel>
        <DataPanel title="Financial pulse">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Income this month</span>
              <span className="font-semibold text-emerald-400">₦{stats.monthlyIncome.toLocaleString()}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full w-[75%] rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400" />
            </div>
          </div>
        </DataPanel>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => navigate('/volunteers')}
          className="rounded-lg border border-[#c9a227]/35 px-4 py-2 text-sm text-[#f4e4a8] hover:bg-[#c9a227]/10"
        >
          Volunteers
        </button>
        <button
          type="button"
          onClick={() => navigate('/attendance')}
          className="rounded-lg border border-[#c9a227]/35 px-4 py-2 text-sm text-[#f4e4a8] hover:bg-[#c9a227]/10"
        >
          Attendance
        </button>
        <button
          type="button"
          onClick={() => navigate('/partners')}
          className="rounded-lg border border-[#c9a227]/35 px-4 py-2 text-sm text-[#f4e4a8] hover:bg-[#c9a227]/10"
        >
          Partners
        </button>
        <button
          type="button"
          onClick={() => navigate('/hostels')}
          className="rounded-lg border border-[#c9a227]/35 px-4 py-2 text-sm text-[#f4e4a8] hover:bg-[#c9a227]/10"
        >
          Hostels
        </button>
      </div>
    </RoleDashboardLayout>
  );
};

export default AdminDashboard;
