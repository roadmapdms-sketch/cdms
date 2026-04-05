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

interface UsherStats {
  overview: {
    totalEvents: number;
    upcomingEvents: number;
    totalVolunteers: number;
    activeVolunteers: number;
  };
}

const emptyStats: UsherStats = {
  overview: {
    totalEvents: 0,
    upcomingEvents: 0,
    totalVolunteers: 0,
    activeVolunteers: 0,
  },
};

const UsherManagementDashboard: React.FC = () => {
  const [stats, setStats] = useState<UsherStats>(emptyStats);
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
            totalVolunteers: d?.overview?.totalVolunteers ?? 0,
            activeVolunteers: d?.overview?.activeVolunteers ?? 0,
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
    <RoleDashboardLayout title="Usher management" roleBadge="Guest experience & seating">
      <DashboardSection title="Serving snapshot">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Events on file" value={stats.overview.totalEvents} />
          <StatCard label="Upcoming services" value={stats.overview.upcomingEvents} />
          <StatCard label="Volunteers (total)" value={stats.overview.totalVolunteers} />
          <StatCard label="Active volunteers" value={stats.overview.activeVolunteers} />
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

      <DataPanel title="Recommended flow">
        <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-zinc-400">
          <li>Align door counts and zones with Events; confirm volunteer posts in Volunteers.</li>
          <li>Use Attendance for arrivals; send last-minute updates through Communications.</li>
        </ul>
      </DataPanel>
    </RoleDashboardLayout>
  );
};

export default UsherManagementDashboard;
