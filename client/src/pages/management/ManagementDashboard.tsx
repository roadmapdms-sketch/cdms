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

interface MgmtStats {
  overview: {
    totalMembers: number;
    activeMembers: number;
    upcomingEvents: number;
  };
}

const emptyStats: MgmtStats = {
  overview: { totalMembers: 0, activeMembers: 0, upcomingEvents: 0 },
};

const ManagementDashboard: React.FC = () => {
  const [stats, setStats] = useState<MgmtStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/reports/dashboard?period=current`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = res.data;
        setStats({
          overview: {
            totalMembers: d?.overview?.totalMembers ?? 0,
            activeMembers: d?.overview?.activeMembers ?? 0,
            upcomingEvents: d?.overview?.upcomingEvents ?? 0,
          },
        });
      } catch {
        setStats(emptyStats);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <RoleDashboardLoading />;
  }

  return (
    <RoleDashboardLayout title="Management" roleBadge="Leadership overview" showOperationsConsole>
      <DashboardSection title="Organizational snapshot">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Members on file" value={stats.overview.totalMembers} />
          <StatCard label="Active members" value={stats.overview.activeMembers} />
          <StatCard label="Upcoming events" value={stats.overview.upcomingEvents} />
        </div>
      </DashboardSection>

      <DashboardSection title="Management workspace">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <QuickActionButton onClick={() => navigate('/reporting-dashboard')}>📉 Reporting dashboard</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/reports')}>📋 Reports library</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/members')}>👥 Members</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/events')}>📅 Events</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/partners')}>🤝 Partners</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/communications')}>📧 Communications</QuickActionButton>
        </div>
      </DashboardSection>

      <DataPanel title="Governance">
        <p className="text-sm leading-relaxed text-zinc-400">
          Use Reporting dashboard and Reports for cross-department KPIs. Detailed financial ledgers remain in the
          finance portal for accountants and administrators.
        </p>
      </DataPanel>
    </RoleDashboardLayout>
  );
};

export default ManagementDashboard;
