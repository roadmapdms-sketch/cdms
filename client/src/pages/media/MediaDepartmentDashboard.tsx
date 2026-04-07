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

const MediaDepartmentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { period, setPeriod, data, loading, error, retry } = useReportsDashboardStats();
  const o = data?.overview;
  const op = data?.operations;

  if (loading) {
    return <RoleDashboardLoading />;
  }

  return (
    <RoleDashboardLayout title="Media department" roleBadge="Media & production">
      <FetchNotice error={error} onRetry={retry} />
      <PortalDashboardToolbar period={period} onPeriodChange={setPeriod} onRefresh={retry} />

      <DashboardSection title="Production snapshot">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total events" value={o?.totalEvents ?? 0} />
          <StatCard label="Upcoming events" value={o?.upcomingEvents ?? 0} />
          <StatCard label="Comms (pending)" value={op?.pendingCommunications ?? 0} />
          <StatCard label="Active volunteers" value={o?.activeVolunteers ?? 0} />
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingEventsPanel events={data?.recentEvents} />
        <DataPanel title="Communications pulse">
          <p className="text-sm text-zinc-400">
            Pending outbound items need scheduling or approval. Total logged communications reflect all channels.
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-500">Pending</dt>
              <dd className="mt-1 font-semibold tabular-nums text-[#f4e4a8]">{op?.pendingCommunications ?? 0}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-500">Total</dt>
              <dd className="mt-1 font-semibold tabular-nums text-[#f4e4a8]">{op?.totalCommunications ?? 0}</dd>
            </div>
          </dl>
        </DataPanel>
      </div>

      <DashboardSection title="Suggested workflow">
        <DataPanel title="This week">
          <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-zinc-400">
            <li>Confirm weekend run-of-show in Events; push updates through Communications.</li>
            <li>Track mics, cameras, and cables in Inventory; align volunteer coverage in Volunteers.</li>
          </ul>
        </DataPanel>
      </DashboardSection>
    </RoleDashboardLayout>
  );
};

export default MediaDepartmentDashboard;
