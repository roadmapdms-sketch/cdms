import React, { useState, useEffect, useCallback } from 'react';
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
  FetchNotice,
} from '../../components/RoleDashboardLayout';

interface VolunteerStats {
  activeVolunteers: number;
  openOpportunities: number;
  engagementRate: number;
  upcomingEvents: number;
  currentOpportunities: Array<{
    role: string;
    ministry: string;
    urgency: string;
    volunteersNeeded: number;
  }>;
}

const VolunteerDashboard: React.FC = () => {
  const [stats, setStats] = useState<VolunteerStats>({
    activeVolunteers: 0,
    openOpportunities: 0,
    engagementRate: 0,
    upcomingEvents: 0,
    currentOpportunities: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchVolunteerStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/volunteer/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch volunteer stats:', err);
      setError('Volunteer data failed to load. Retry to refresh this dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVolunteerStats();
  }, [fetchVolunteerStats]);

  if (loading) {
    return <RoleDashboardLoading />;
  }

  return (
    <RoleDashboardLayout title="Volunteer coordination" roleBadge="Volunteer coordinator">
      <FetchNotice error={error} onRetry={fetchVolunteerStats} />
      <DashboardSection title="Serving snapshot">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active volunteers" value={stats.activeVolunteers} />
          <StatCard label="Open opportunities" value={stats.openOpportunities} />
          <StatCard label="Engagement rate" value={`${stats.engagementRate}%`} />
          <StatCard label="Upcoming events" value={stats.upcomingEvents} />
        </div>
      </DashboardSection>

      <DashboardSection title="Coordination workspace">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <QuickActionButton onClick={() => navigate('/volunteers')}>🤝 Roster & roles</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/events')}>📅 Event roster</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/communications')}>📧 Team comms</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/members')}>👥 Member lookup</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/attendance')}>✅ Serve check-in</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/reports')}>📊 Serving reports</QuickActionButton>
        </div>
      </DashboardSection>

      <DataPanel title="Current opportunities">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-700 text-xs uppercase tracking-wider text-zinc-500">
                <th className="pb-3 pr-4 font-medium">Role</th>
                <th className="pb-3 pr-4 font-medium">Ministry</th>
                <th className="pb-3 pr-4 font-medium">Urgency</th>
                <th className="pb-3 font-medium">Needed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {stats.currentOpportunities.map((opportunity, index) => (
                <tr key={index}>
                  <td className="py-3 pr-4 text-zinc-300">{opportunity.role}</td>
                  <td className="py-3 pr-4 text-zinc-300">{opportunity.ministry}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        opportunity.urgency === 'High'
                          ? 'bg-red-500/15 text-red-300'
                          : opportunity.urgency === 'Medium'
                            ? 'bg-amber-500/15 text-amber-300'
                            : 'bg-emerald-500/15 text-emerald-400'
                      }`}
                    >
                      {opportunity.urgency}
                    </span>
                  </td>
                  <td className="py-3 text-zinc-300">{opportunity.volunteersNeeded}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate('/volunteers')}
            className="rounded-lg border border-[#c9a227]/35 px-4 py-2 text-sm text-[#f4e4a8] hover:bg-[#c9a227]/10"
          >
            Manage volunteers
          </button>
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="rounded-lg border border-[#c9a227]/35 px-4 py-2 text-sm text-[#f4e4a8] hover:bg-[#c9a227]/10"
          >
            Event schedule
          </button>
        </div>
      </DataPanel>
    </RoleDashboardLayout>
  );
};

export default VolunteerDashboard;
