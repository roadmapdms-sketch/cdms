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
import { formatZAR } from '../../utils/currency';

const ManagementDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { period, setPeriod, data, loading, error, retry } = useReportsDashboardStats();
  const o = data?.overview;
  const f = data?.financial;
  const op = data?.operations;

  if (loading) {
    return <RoleDashboardLoading />;
  }

  return (
    <RoleDashboardLayout title="Management" roleBadge="Leadership overview">
      <FetchNotice error={error} onRetry={retry} />
      <PortalDashboardToolbar period={period} onPeriodChange={setPeriod} onRefresh={retry} />

      <DashboardSection title="Organizational snapshot">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Members on file" value={o?.totalMembers ?? 0} />
          <StatCard label="Active members" value={o?.activeMembers ?? 0} />
          <StatCard label="Upcoming events" value={o?.upcomingEvents ?? 0} />
          <StatCard label="Open pastoral items" value={op?.openPastoralCare ?? 0} />
        </div>
      </DashboardSection>

      <DashboardSection title="Financial signal (period)">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Total giving recorded" value={formatZAR(f?.totalGiving ?? 0)} />
          <StatCard label="Total expenses" value={formatZAR(f?.totalExpenses ?? 0)} />
          <StatCard label="Volunteer engagement" value={o?.volunteerEngagementRate ?? '—'} />
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingEventsPanel events={data?.recentEvents} />
        <DataPanel title="Operations health">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-500">Volunteers (active)</dt>
              <dd className="mt-1 font-semibold text-[#f4e4a8]">{o?.activeVolunteers ?? 0}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-500">Check-ins (7 days)</dt>
              <dd className="mt-1 font-semibold text-[#f4e4a8]">{op?.recentAttendanceCount ?? 0}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-500">Pastoral records</dt>
              <dd className="mt-1 font-semibold text-[#f4e4a8]">{op?.totalPastoralCare ?? 0}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-500">Pending comms</dt>
              <dd className="mt-1 font-semibold text-[#f4e4a8]">{op?.pendingCommunications ?? 0}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            Detailed ledgers and approvals live in the finance portal for authorized roles.
          </p>
        </DataPanel>
      </div>
    </RoleDashboardLayout>
  );
};

export default ManagementDashboard;
