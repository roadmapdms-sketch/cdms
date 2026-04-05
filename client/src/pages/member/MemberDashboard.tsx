import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import {
  RoleDashboardLayout,
  StatCard,
  DashboardSection,
  DataPanel,
  RoleDashboardLoading,
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

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/member/me/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMemberData(response.data);
      } catch (error) {
        console.error('Failed to fetch member data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMemberData();
  }, []);

  if (loading) {
    return <RoleDashboardLoading showStaffSidebar={false} />;
  }

  return (
    <RoleDashboardLayout title="Member portal" roleBadge="Member access" showStaffSidebar={false}>
      <DashboardSection title="Welcome">
        <div className="rounded-2xl border border-[#c9a227]/25 bg-gradient-to-br from-zinc-900/80 to-black/60 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-[#f5e6b8]">Welcome, {memberData.name || 'friend'}.</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            We are glad you are part of Roadmap Ministry International. Below is a snapshot of your involvement.
            {memberData.joinDate ? (
              <span className="mt-2 block text-zinc-500">Member since {memberData.joinDate}</span>
            ) : null}
          </p>
        </div>
      </DashboardSection>

      <DashboardSection title="At a glance">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Giving this month" value={`₦${memberData.givingHistory.monthly.toLocaleString()}`} />
          <StatCard label="Giving this year" value={`₦${memberData.givingHistory.yearly.toLocaleString()}`} />
          <StatCard label="Attendance (month)" value={`${memberData.attendanceRecord.monthly}%`} />
          <StatCard label="Attendance (year)" value={`${memberData.attendanceRecord.yearly}%`} />
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

        <DataPanel title="Your stewardship">
          <p className="text-sm text-zinc-400">
            Thank you for your faithfulness. For detailed statements or to update recurring giving, contact your
            church finance office—they can also help with event registration and small groups.
          </p>
          <div className="mt-4 space-y-2 text-sm text-zinc-500">
            <div className="flex justify-between border-t border-zinc-800 pt-3">
              <span>Progress toward annual goal (illustrative)</span>
              <span className="text-[#c9a227]">75%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full w-[75%] rounded-full bg-gradient-to-r from-[#c9a227] to-[#e8c547]" />
            </div>
          </div>
        </DataPanel>
      </div>
    </RoleDashboardLayout>
  );
};

export default MemberDashboard;
