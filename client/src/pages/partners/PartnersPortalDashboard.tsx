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

const PartnersPortalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { period, setPeriod, data, loading, error, retry } = useReportsDashboardStats();
  const o = data?.overview;
  const op = data?.operations;

  if (loading) {
    return <RoleDashboardLoading />;
  }

  return (
    <RoleDashboardLayout title="Ministry partners" roleBadge="Partners coordinator">
      <FetchNotice error={error} onRetry={retry} />
      <PortalDashboardToolbar period={period} onPeriodChange={setPeriod} onRefresh={retry} />

      <DashboardSection title="Relationship context">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Members on file" value={o?.totalMembers ?? 0} />
          <StatCard label="Active members" value={o?.activeMembers ?? 0} />
          <StatCard label="Open pastoral items" value={op?.openPastoralCare ?? 0} />
          <StatCard label="Upcoming events" value={o?.upcomingEvents ?? 0} />
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingEventsPanel events={data?.recentEvents} />
        <DataPanel title="Engagement signals">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-500">Pastoral records</dt>
              <dd className="mt-1 font-semibold text-[#f4e4a8]">{op?.totalPastoralCare ?? 0}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-500">Pending comms</dt>
              <dd className="mt-1 font-semibold text-[#f4e4a8]">{op?.pendingCommunications ?? 0}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-500">Active volunteers</dt>
              <dd className="mt-1 font-semibold text-[#f4e4a8]">{o?.activeVolunteers ?? 0}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-500">Volunteer pool</dt>
              <dd className="mt-1 font-semibold text-[#f4e4a8]">{o?.totalVolunteers ?? 0}</dd>
            </div>
          </dl>
        </DataPanel>
      </div>

      <DataPanel title="Focus">
        <p className="text-sm leading-relaxed text-zinc-400">
          Covenant partners and organizations live in the <strong className="text-[#e8c547]">Partners</strong> module.
          Use Communications for renewals and Events for partner gatherings.
        </p>
      </DataPanel>
    </RoleDashboardLayout>
  );
};

export default PartnersPortalDashboard;
