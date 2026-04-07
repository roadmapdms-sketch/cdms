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

const UsherManagementDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { period, setPeriod, data, loading, error, retry } = useReportsDashboardStats();
  const o = data?.overview;
  const op = data?.operations;

  if (loading) {
    return <RoleDashboardLoading />;
  }

  return (
    <RoleDashboardLayout title="Usher management" roleBadge="Guest experience & seating">
      <FetchNotice error={error} onRetry={retry} />
      <PortalDashboardToolbar period={period} onPeriodChange={setPeriod} onRefresh={retry} />

      <DashboardSection title="Serving snapshot">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Events on file" value={o?.totalEvents ?? 0} />
          <StatCard label="Upcoming services" value={o?.upcomingEvents ?? 0} />
          <StatCard label="Volunteers (total)" value={o?.totalVolunteers ?? 0} />
          <StatCard label="Active volunteers" value={o?.activeVolunteers ?? 0} />
        </div>
      </DashboardSection>

      <DashboardSection title="Guest flow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <StatCard label="Check-ins (last 7 days)" value={op?.recentAttendanceCount ?? 0} />
          <StatCard label="Members on file" value={o?.totalMembers ?? 0} />
        </div>
      </DashboardSection>

      <DashboardSection title="Usher workspace">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <QuickActionButton onClick={() => navigate('/attendance')}>✅ Check-in & attendance</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/events')}>📅 Service schedule</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/volunteers')}>🙌 Usher teams</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/members')}>👥 Member lookup</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/communications')}>📧 Notices & SMS</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/reports')}>📋 Serving reports</QuickActionButton>
        </div>
      </DashboardSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingEventsPanel events={data?.recentEvents} />
        <DataPanel title="Recommended flow">
          <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-zinc-400">
            <li>Align door counts and zones with Events; confirm volunteer posts in Volunteers.</li>
            <li>Use Attendance for arrivals; send last-minute updates through Communications.</li>
          </ul>
        </DataPanel>
      </div>
    </RoleDashboardLayout>
  );
};

export default UsherManagementDashboard;
