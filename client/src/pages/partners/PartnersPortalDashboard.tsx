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

interface PartnersPortalStats {
  overview: {
    totalMembers: number;
    activeMembers: number;
  };
}

const emptyStats: PartnersPortalStats = {
  overview: { totalMembers: 0, activeMembers: 0 },
};

/** Standalone home for ministry partners leads — module workspace lives at `/partners`. */
const PartnersPortalDashboard: React.FC = () => {
  const [stats, setStats] = useState<PartnersPortalStats>(emptyStats);
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
    <RoleDashboardLayout title="Ministry partners" roleBadge="Partners coordinator">
      <DashboardSection title="Relationship context">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <StatCard label="Members on file" value={stats.overview.totalMembers} />
          <StatCard label="Active members" value={stats.overview.activeMembers} />
        </div>
      </DashboardSection>

      <DashboardSection title="Partners workspace">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <QuickActionButton onClick={() => navigate('/partners')}>🤝 Partner directory</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/members')}>👥 Member lookup</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/communications')}>📧 Partner comms</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/events')}>📅 Events & renewals</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/pastoral-care')}>🙏 Pastoral touchpoints</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/reports')}>📋 Reports</QuickActionButton>
        </div>
      </DashboardSection>

      <DataPanel title="Focus">
        <p className="text-sm leading-relaxed text-zinc-400">
          Covenant partners, organizations, and strategic relationships are maintained in the{' '}
          <strong className="text-[#e8c547]">Partners</strong> module. Use Communications for renewals and Events for
          partner gatherings.
        </p>
      </DataPanel>
    </RoleDashboardLayout>
  );
};

export default PartnersPortalDashboard;
