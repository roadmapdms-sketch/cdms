import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { logout } from '../../utils/authSession';

interface PastoralStats {
  newMembersThisWeek: number;
  attendanceRate: number;
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
    attendanceRate: 0,
    prayerRequests: 0,
    pastoralVisits: 0,
    recentPrayerRequests: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPastoralStats();
  }, []);

  const fetchPastoralStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/pastor/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch pastoral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
              <h1 className="text-2xl font-bold text-gray-900">⛪ Pastor Dashboard</h1>
              <span className="text-sm text-gray-500">👤 Pastor</span>
            </div>
            <button
              type="button"
              onClick={() => logout(navigate)}
              className="text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Member Engagement */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">👥 Member Engagement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{stats.newMembersThisWeek}</div>
              <div className="text-sm text-gray-500">New This Week</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{stats.attendanceRate}%</div>
              <div className="text-sm text-gray-500">Attendance Rate</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">{stats.prayerRequests}</div>
              <div className="text-sm text-gray-500">Prayer Requests</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-orange-600">{stats.pastoralVisits}</div>
              <div className="text-sm text-gray-500">Pastoral Visits</div>
            </div>
          </div>
        </div>

        {/* Pastoral Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🙏 Pastoral Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button
              onClick={() => navigate('/pastor/members')}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              👤 Visit Member
            </button>
            <button
              onClick={() => navigate('/pastor/prayer')}
              className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              🙏 Add Prayer Request
            </button>
            <button
              onClick={() => navigate('/pastor/care')}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              📧 Pastoral Care
            </button>
            <button
              onClick={() => navigate('/pastor/schedule')}
              className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              📅 Schedule Visit
            </button>
            <button
              onClick={() => navigate('/pastor/directory')}
              className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              📊 Member Directory
            </button>
            <button
              onClick={() => navigate('/pastor/communications')}
              className="bg-pink-600 text-white px-4 py-3 rounded-lg hover:bg-pink-700 transition-colors"
            >
              📢 Send Message
            </button>
          </div>
        </div>

        {/* Recent Prayer Requests */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Recent Prayer Requests</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentPrayerRequests.map((prayer, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prayer.member}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {prayer.request}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        prayer.status === 'Active' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : prayer.status === 'Answered'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {prayer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prayer.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={() => navigate('/pastor/prayer')}
              className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200"
            >
              🙏 All Prayer Requests
            </button>
            <button
              onClick={() => navigate('/pastor/care')}
              className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200"
            >
              👥 Member Care
            </button>
            <button
              onClick={() => navigate('/pastor/reports')}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200"
            >
              📊 Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastorDashboard;
