import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { logout } from '../../utils/authSession';

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
    currentOpportunities: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVolunteerStats();
  }, []);

  const fetchVolunteerStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/volunteer/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch volunteer stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
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
              <h1 className="text-2xl font-bold text-gray-900">🤝 Volunteers Dashboard</h1>
              <span className="text-sm text-gray-500">👤 Coordinator</span>
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
        {/* Volunteer Overview */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🎯 Volunteer Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{stats.activeVolunteers}</div>
              <div className="text-sm text-gray-500">Active Volunteers</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{stats.openOpportunities}</div>
              <div className="text-sm text-gray-500">Opportunities Open</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">{stats.engagementRate}%</div>
              <div className="text-sm text-gray-500">Engagement Rate</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-orange-600">{stats.upcomingEvents}</div>
              <div className="text-sm text-gray-500">Upcoming Events</div>
            </div>
          </div>
        </div>

        {/* Volunteer Management */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🎯 Volunteer Management</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button
              onClick={() => navigate('/volunteer/opportunities')}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ➕ Add Opportunity
            </button>
            <button
              onClick={() => navigate('/volunteer/assignments')}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              👥 Assign Volunteers
            </button>
            <button
              onClick={() => navigate('/volunteer/schedule')}
              className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              📅 Schedule
            </button>
            <button
              onClick={() => navigate('/volunteer/hours')}
              className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              📊 Track Hours
            </button>
            <button
              onClick={() => navigate('/volunteer/recognition')}
              className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              🏆 Recognize Volunteers
            </button>
            <button
              onClick={() => navigate('/volunteer/communications')}
              className="bg-pink-600 text-white px-4 py-3 rounded-lg hover:bg-pink-700 transition-colors"
            >
              📧 Communicate
            </button>
          </div>
        </div>

        {/* Current Opportunities */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔥 Current Opportunities</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ministry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volunteers Needed</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.currentOpportunities.map((opportunity, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {opportunity.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {opportunity.ministry}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        opportunity.urgency === 'High' 
                          ? 'bg-red-100 text-red-800' 
                          : opportunity.urgency === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {opportunity.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {opportunity.volunteersNeeded}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={() => navigate('/volunteer/opportunities')}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200"
            >
              📋 All Opportunities
            </button>
            <button
              onClick={() => navigate('/volunteer/assignments')}
              className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200"
            >
              👥 Volunteer Management
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
