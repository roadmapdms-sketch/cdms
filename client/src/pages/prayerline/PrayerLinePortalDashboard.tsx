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

interface PrayerLinePortalStats {
  overview: {
    totalVolunteers: number;
    activeVolunteers: number;
  };
  operations: {
    openPastoralCare: number;
    totalPastoralCare: number;
  };
}

const emptyStats: PrayerLinePortalStats = {
  overview: { totalVolunteers: 0, activeVolunteers: 0 },
  operations: { openPastoralCare: 0, totalPastoralCare: 0 },
};

/** Standalone home for prayer line coordination — scheduling UI at `/prayer-line`. */
const PrayerLinePortalDashboard: React.FC = () => {
  const [stats, setStats] = useState<PrayerLinePortalStats>(emptyStats);
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
            totalVolunteers: d?.overview?.totalVolunteers ?? 0,
            activeVolunteers: d?.overview?.activeVolunteers ?? 0,
          },
          operations: {
            openPastoralCare: d?.operations?.openPastoralCare ?? 0,
            totalPastoralCare: d?.operations?.totalPastoralCare ?? 0,
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
    <RoleDashboardLayout title="Prayer line" roleBadge="Prayer line coordinator">
      <DashboardSection title="Coverage snapshot">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Volunteers (total)" value={stats.overview.totalVolunteers} />
          <StatCard label="Active volunteers" value={stats.overview.activeVolunteers} />
          <StatCard label="Open pastoral items" value={stats.operations.openPastoralCare} />
          <StatCard label="Pastoral records (total)" value={stats.operations.totalPastoralCare} />
        </div>
      </DashboardSection>

      <DashboardSection title="Prayer line workspace">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <QuickActionButton onClick={() => navigate('/prayer-line')}>📞 Slot schedule</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/pastoral-care')}>🙏 Pastoral care</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/volunteers')}>🙌 Intercessors roster</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/communications')}>📧 Call tree & SMS</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/members')}>👥 Member requests</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/reports')}>📋 Reports</QuickActionButton>
        </div>
      </DashboardSection>

      <DataPanel title="Workflow">
        <p className="text-sm leading-relaxed text-zinc-400">
          Build daily and weekly coverage in <strong className="text-[#e8c547]">Prayer line</strong>. Link urgent needs
          from Pastoral care and notify teams through Communications.
        </p>
      </DataPanel>
    </RoleDashboardLayout>
  );
};

export default PrayerLinePortalDashboard;
