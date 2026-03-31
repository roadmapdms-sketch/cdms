import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

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
    givingHistory: {
      monthly: 0,
      yearly: 0
    },
    attendanceRecord: {
      monthly: 0,
      yearly: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMemberData();
  }, []);

  const fetchMemberData = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await axios.get(`${API_BASE_URL}/member/dashboard/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMemberData(response.data);
    } catch (error) {
      console.error('Failed to fetch member data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">👤 Member Dashboard</h1>
              <span className="text-sm text-gray-500">👤 Member</span>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">👋 Welcome, {memberData.name}!</h2>
          <p className="text-blue-700">We're glad to have you as part of our church family.</p>
        </div>

        {/* My Schedule */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📅 My Schedule</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {memberData.upcomingEvents.map((event, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">📅</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-500">
                        {event.date} at {event.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🎯 Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button
              onClick={() => navigate('/member/giving')}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              💳 Record Giving
            </button>
            <button
              onClick={() => navigate('/member/events')}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              📅 Register for Event
            </button>
            <button
              onClick={() => navigate('/member/groups')}
              className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              👥 Join Group
            </button>
            <button
              onClick={() => navigate('/member/prayer')}
              className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              🙏 Submit Prayer
            </button>
            <button
              onClick={() => navigate('/member/profile')}
              className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              📊 View Profile
            </button>
            <button
              onClick={() => navigate('/member/edit')}
              className="bg-pink-600 text-white px-4 py-3 rounded-lg hover:bg-pink-700 transition-colors"
            >
              📧 Update Info
            </button>
          </div>
        </div>

        {/* My Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Giving History</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="text-lg font-bold text-green-600">₦{memberData.givingHistory.monthly.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Year</span>
                  <span className="text-lg font-bold text-green-600">₦{memberData.givingHistory.yearly.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">75% of yearly goal</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate('/member/giving')}
                className="w-full bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200"
              >
                💰 View Full Giving History
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Attendance Record</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="text-lg font-bold text-blue-600">{memberData.attendanceRecord.monthly}%</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Year</span>
                  <span className="text-lg font-bold text-blue-600">{memberData.attendanceRecord.yearly}%</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '87%'}}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Great attendance this year!</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate('/member/attendance')}
                className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200"
              >
                📅 View Attendance History
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/member/directory')}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            👥 Member Directory
          </button>
          <button
            onClick={() => navigate('/member/notifications')}
            className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200"
          >
            🔔 Notifications
          </button>
          <button
            onClick={() => navigate('/member/resources')}
            className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200"
          >
            📚 Resources
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
