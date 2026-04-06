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

interface PastoralStats {
  newMembersThisWeek: number;
  prayerRequests: number;
  pastoralVisits: number;
  recentPrayerRequests: Array<{
    member: string;
    request: string;
    status: string;
    date: string;
  }>;
}

const PastorDashboard: React.FC = () => {
  const [stats, setStats] = useState<PastoralStats>({
    newMembersThisWeek: 0,
    prayerRequests: 0,
    pastoralVisits: 0,
    recentPrayerRequests: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPastoralStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/pastor/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch pastoral stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPastoralStats();
  }, []);

  if (loading) {
    return <RoleDashboardLoading />;
  }

  return (
    <RoleDashboardLayout title="Pastoral leadership" roleBadge="Pastor / staff · pastoral-only portal">
      <DashboardSection title="Shepherding snapshot">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="New members (week)" value={stats.newMembersThisWeek} />
          <StatCard label="Prayer / care queue" value={stats.prayerRequests} />
          <StatCard label="Pastoral touchpoints" value={stats.pastoralVisits} />
        </div>
      </DashboardSection>

      <DashboardSection title="Pastoral modules">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <QuickActionButton onClick={() => navigate('/pastoral-care')}>🙏 Pastoral care</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/members')}>👥 Members</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/prayer-line')}>📞 Prayer line coverage</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/partners')}>🤝 Partners</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/communications')}>📧 Communications</QuickActionButton>
        </div>
      </DashboardSection>

      <DataPanel title="Recent prayer requests">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-700 text-xs uppercase tracking-wider text-zinc-500">
                <th className="pb-3 pr-4 font-medium">Member</th>
                <th className="pb-3 pr-4 font-medium">Request</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {stats.recentPrayerRequests.map((prayer, index) => (
                <tr key={index}>
                  <td className="py-3 pr-4 text-zinc-300">{prayer.member}</td>
                  <td className="max-w-xs py-3 pr-4 text-zinc-400">{prayer.request}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        prayer.status === 'Active'
                          ? 'bg-amber-500/15 text-amber-300'
                          : prayer.status === 'Answered'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {prayer.status}
                    </span>
                  </td>
                  <td className="py-3 text-zinc-500">{prayer.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate('/pastoral-care')}
            className="rounded-lg border border-[#c9a227]/35 px-4 py-2 text-sm text-[#f4e4a8] hover:bg-[#c9a227]/10"
          >
            Open pastoral care
          </button>
          <button
            type="button"
            onClick={() => navigate('/prayer-line')}
            className="rounded-lg border border-[#c9a227]/35 px-4 py-2 text-sm text-[#f4e4a8] hover:bg-[#c9a227]/10"
          >
            Prayer line roster
          </button>
        </div>
      </DataPanel>
    </RoleDashboardLayout>
  );
};

export default PastorDashboard;
