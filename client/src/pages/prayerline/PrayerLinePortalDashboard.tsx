import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RoleDashboardLayout,
  StatCard,
  DashboardSection,
  QuickActionButton,
  DataPanel,
  RoleDashboardLoading,
  FetchNotice,
} from '../../components/RoleDashboardLayout';
import { useReportsDashboardStats } from '../../hooks/useReportsDashboardStats';
import { PortalDashboardToolbar } from '../../components/PortalDashboardToolbar';
import { UpcomingEventsPanel } from '../../components/UpcomingEventsPanel';

const PrayerLinePortalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { period, setPeriod, data, loading, error, retry } = useReportsDashboardStats();
  const o = data?.overview;
  const op = data?.operations;

  if (loading) {
    return <RoleDashboardLoading />;
  }

  return (
    <RoleDashboardLayout title="Prayer line" roleBadge="Prayer line coordinator">
      <FetchNotice error={error} onRetry={retry} />
      <PortalDashboardToolbar period={period} onPeriodChange={setPeriod} onRefresh={retry} />

      <DashboardSection title="Coverage snapshot">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Volunteers (total)" value={o?.totalVolunteers ?? 0} />
          <StatCard label="Active volunteers" value={o?.activeVolunteers ?? 0} />
          <StatCard label="Open pastoral items" value={op?.openPastoralCare ?? 0} />
          <StatCard label="Pastoral records (total)" value={op?.totalPastoralCare ?? 0} />
        </div>
      </DashboardSection>

      <DashboardSection title="Prayer & care pipeline">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Pending communications" value={op?.pendingCommunications ?? 0} />
          <StatCard label="Members on file" value={o?.totalMembers ?? 0} />
          <StatCard label="Upcoming events" value={o?.upcomingEvents ?? 0} />
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingEventsPanel events={data?.recentEvents} />
        <DataPanel title="Workflow">
          <p className="text-sm leading-relaxed text-zinc-400">
            Build daily and weekly coverage in <strong className="text-[#e8c547]">Prayer line</strong>. Link urgent
            needs from Pastoral care and notify teams through Communications.
          </p>
        </DataPanel>
      </div>
    </RoleDashboardLayout>
  );
};

export default PrayerLinePortalDashboard;
