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

const KitchenRestaurantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { period, setPeriod, data, loading, error, retry } = useReportsDashboardStats();
  const o = data?.overview;
  const op = data?.operations;

  if (loading) {
    return <RoleDashboardLoading />;
  }

  return (
    <RoleDashboardLayout title="Kitchen & restaurant" roleBadge="Hospitality & food service">
      <FetchNotice error={error} onRetry={retry} />
      <PortalDashboardToolbar period={period} onPeriodChange={setPeriod} onRefresh={retry} />

      <DashboardSection title="Service snapshot">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Events on file" value={o?.totalEvents ?? 0} />
          <StatCard label="Upcoming (catering windows)" value={o?.upcomingEvents ?? 0} />
          <StatCard label="Inventory SKUs" value={op?.totalInventory ?? 0} />
          <StatCard label="Serving volunteers (active)" value={o?.activeVolunteers ?? 0} />
        </div>
      </DashboardSection>

      <DashboardSection title="Kitchen & restaurant workspace">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <QuickActionButton onClick={() => navigate('/events')}>📅 Events & meals</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/inventory')}>📦 Supplies & par levels</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/volunteers')}>🙌 Serving teams</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/communications')}>📧 Notices & menus</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/guest-house')}>🏠 Guest house</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/hostels')}>🛏️ Hostels</QuickActionButton>
        </div>
      </DashboardSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingEventsPanel events={data?.recentEvents} />
        <DataPanel title="Hospitality context">
          <p className="text-sm text-zinc-400">
            Align meal prep and service windows with the upcoming event list. Volunteer counts reflect active serving
            assignments across ministries.
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-500">Attendance (7d)</dt>
              <dd className="mt-1 font-semibold tabular-nums text-[#f4e4a8]">{op?.recentAttendanceCount ?? 0}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-500">Vendors (active)</dt>
              <dd className="mt-1 font-semibold tabular-nums text-[#f4e4a8]">{op?.activeVendors ?? 0}</dd>
            </div>
          </dl>
        </DataPanel>
      </div>

      <DataPanel title="Operations notes">
        <p className="text-sm leading-relaxed text-zinc-400">
          Plan around Events for special meals; use Inventory for dry goods and disposables. Finance modules stay
          restricted to authorized finance roles.
        </p>
      </DataPanel>
    </RoleDashboardLayout>
  );
};

export default KitchenRestaurantDashboard;
