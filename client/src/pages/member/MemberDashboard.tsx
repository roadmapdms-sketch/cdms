import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import {
  RoleDashboardLayout,
  StatCard,
  DashboardSection,
  DataPanel,
  RoleDashboardLoading,
  FetchNotice,
} from '../../components/RoleDashboardLayout';

interface MemberData {
  name: string;
  email: string;
  joinDate: string;
  upcomingEvents: Array<{
    title: string;
    date: string;
    time: string;
  }>;
  givingHistory: {
    monthly: number;
    yearly: number;
  };
  attendanceRecord: {
    monthly: number;
    yearly: number;
  };
}

const MemberDashboard: React.FC = () => {
  const [memberData, setMemberData] = useState<MemberData>({
    name: '',
    email: '',
    joinDate: '',
    upcomingEvents: [],
    givingHistory: { monthly: 0, yearly: 0 },
    attendanceRecord: { monthly: 0, yearly: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/member/me/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMemberData(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch member data:', err);
      setError('Member details failed to load. Retry to refresh your portal.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemberData();
  }, [fetchMemberData]);

  if (loading) {
    return <RoleDashboardLoading showStaffSidebar={false} />;
  }

  return (
    <RoleDashboardLayout title="Member portal" roleBadge="Member access" showStaffSidebar={false}>
      <FetchNotice error={error} onRetry={fetchMemberData} />
      <DashboardSection title="Welcome">
        <div className="rounded-2xl border border-[#c9a227]/25 bg-gradient-to-br from-zinc-900/80 to-black/60 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-[#f5e6b8]">Welcome, {memberData.name || 'friend'}.</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            This is your personal member space. It only shows your own participation and stewardship details.
            {memberData.joinDate ? (
              <span className="mt-2 block text-zinc-500">Member since {memberData.joinDate}</span>
            ) : null}
          </p>
        </div>
      </DashboardSection>

      <DashboardSection title="Your summary">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Giving this month" value={`₦${memberData.givingHistory.monthly.toLocaleString()}`} />
          <StatCard label="Giving this year" value={`₦${memberData.givingHistory.yearly.toLocaleString()}`} />
          <StatCard label="Attendance this month" value={memberData.attendanceRecord.monthly} />
          <StatCard label="Attendance this year" value={memberData.attendanceRecord.yearly} />
        </div>
      </DashboardSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DataPanel title="Upcoming schedule">
          {memberData.upcomingEvents.length === 0 ? (
            <p className="text-sm text-zinc-500">No upcoming events listed yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-800">
              {memberData.upcomingEvents.map((event, index) => (
                <li key={index} className="flex gap-3 py-3 first:pt-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#c9a227]/15 text-lg">
                    📅
                  </span>
                  <div>
                    <p className="font-medium text-[#f0e6c8]">{event.title}</p>
                    <p className="text-sm text-zinc-500">
                      {event.date} · {event.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DataPanel>

        <DataPanel title="Personal notes">
          <p className="text-sm text-zinc-400">
            Need updates to your profile, giving statement, or service schedule? Please contact your ministry office.
          </p>
          <div className="mt-4 space-y-2 text-sm text-zinc-500">
            <div className="border-t border-zinc-800 pt-3">
              This portal does not include admin tools, role management, or operations controls.
            </div>
          </div>
        </DataPanel>
      </div>
    </RoleDashboardLayout>
  );
};

export default MemberDashboard;
