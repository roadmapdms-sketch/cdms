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

interface MediaStats {
  overview: {
    totalEvents: number;
    upcomingEvents: number;
  };
}

const emptyStats: MediaStats = {
  overview: { totalEvents: 0, upcomingEvents: 0 },
};

const MediaDepartmentDashboard: React.FC = () => {
  const [stats, setStats] = useState<MediaStats>(emptyStats);
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
            totalEvents: d?.overview?.totalEvents ?? 0,
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
    <RoleDashboardLayout title="Media department" roleBadge="Media & production">
      <DashboardSection title="Production snapshot">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <StatCard label="Total events (period)" value={stats.overview.totalEvents} />
          <StatCard label="Upcoming services & events" value={stats.overview.upcomingEvents} />
        </div>
      </DashboardSection>

      <DashboardSection title="Media workspace">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <QuickActionButton onClick={() => navigate('/communications')}>📧 Comms & rundowns</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/events')}>📅 Event schedule</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/inventory')}>📦 AV & gear inventory</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/volunteers')}>🙌 Tech team roster</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/reporting-dashboard')}>📉 Reporting</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/reports')}>📋 Reports library</QuickActionButton>
        </div>
      </DashboardSection>

      <DataPanel title="Suggested workflow">
        <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-zinc-400">
          <li>Confirm weekend run-of-show in Events; push updates through Communications.</li>
          <li>Track mics, cameras, and cables in Inventory; align volunteer coverage in Volunteers.</li>
        </ul>
      </DataPanel>
    </RoleDashboardLayout>
  );
};

export default MediaDepartmentDashboard;
