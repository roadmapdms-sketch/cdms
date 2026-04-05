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

interface KitchenStats {
  overview: {
    totalEvents: number;
    upcomingEvents: number;
  };
  operations: {
    totalInventory: number;
    availableInventory: number;
  };
}

const emptyStats: KitchenStats = {
  overview: { totalEvents: 0, upcomingEvents: 0 },
  operations: { totalInventory: 0, availableInventory: 0 },
};

const KitchenRestaurantDashboard: React.FC = () => {
  const [stats, setStats] = useState<KitchenStats>(emptyStats);
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
          operations: {
            totalInventory: d?.operations?.totalInventory ?? 0,
            availableInventory: d?.operations?.availableInventory ?? 0,
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
    <RoleDashboardLayout title="Kitchen & restaurant" roleBadge="Hospitality & food service" showOperationsConsole>
      <DashboardSection title="Service snapshot">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Events on file" value={stats.overview.totalEvents} />
          <StatCard label="Upcoming (catering windows)" value={stats.overview.upcomingEvents} />
          <StatCard label="Inventory SKUs" value={stats.operations.totalInventory} />
          <StatCard label="Available stock lines" value={stats.operations.availableInventory} />
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

      <DataPanel title="Operations notes">
        <p className="text-sm leading-relaxed text-zinc-400">
          Plan around Events for special meals; use Inventory for dry goods and disposables. Finance modules (expenses,
          vendors) stay restricted to authorized finance roles—request an accountant or admin for purchase tracking if
          needed.
        </p>
      </DataPanel>
    </RoleDashboardLayout>
  );
};

export default KitchenRestaurantDashboard;
