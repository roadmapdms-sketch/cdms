import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';
import axios from 'axios';

interface VolunteerAssignment {
  id: string;
  memberId: string;
  eventId: string;
  userId: string;
  role: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  ministry?: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface VolunteerStats {
  totalAssignments: number;
  assigned: number;
  confirmed: number;
  declined: number;
  completed: number;
  noShow: number;
  confirmationRate: string;
  completionRate: string;
  period: {
    from: string | null;
    to: string | null;
  };
}

interface TopVolunteer {
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  completedAssignments: number;
}

const Volunteers: React.FC = () => {
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([]);
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [topVolunteers, setTopVolunteers] = useState<TopVolunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const response = await axios.get(`${API_BASE_URL}/volunteers?${params}`);
      setAssignments(response.data.assignments);
      setTotalPages(response.data.pagination.pages);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch volunteer assignments');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, roleFilter, statusFilter, dateFrom, dateTo]);

  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const response = await axios.get(`${API_BASE_URL}/volunteers/stats/overview?${params}`);
      setStats(response.data);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  }, [dateFrom, dateTo]);

  const fetchTopVolunteers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const response = await axios.get(`${API_BASE_URL}/volunteers/stats/top-volunteers?${params}`);
      setTopVolunteers(response.data.volunteers);
    } catch (err: any) {
      console.error('Failed to fetch top volunteers:', err);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchAssignments();
    fetchStats();
    fetchTopVolunteers();
  }, [fetchAssignments, fetchStats, fetchTopVolunteers]);

  const handleCreateAssignment = async (assignmentData: any) => {
    try {
      await axios.post('`${API_BASE_URL}/volunteers', assignmentData);
      fetchAssignments();
      fetchStats();
      fetchTopVolunteers();
      setShowModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create volunteer assignment');
    }
  };

  const handleBulkAssignment = async (bulkData: any) => {
    try {
      await axios.post('`${API_BASE_URL}/volunteers/bulk', bulkData);
      fetchAssignments();
      fetchStats();
      fetchTopVolunteers();
      setShowBulkModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to process bulk volunteer assignment');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this volunteer assignment?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/volunteers/${id}`);
      fetchAssignments();
      fetchStats();
      fetchTopVolunteers();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete volunteer assignment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'DECLINED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'LEADER':
        return 'bg-purple-100 text-purple-800';
      case 'ASSISTANT':
        return 'bg-indigo-100 text-indigo-800';
      case 'GREETER':
        return 'bg-green-100 text-green-800';
      case 'USHER':
        return 'bg-blue-100 text-blue-800';
      case 'MUSIC':
        return 'bg-pink-100 text-pink-800';
      case 'TECH':
        return 'bg-orange-100 text-orange-800';
      case 'SECURITY':
        return 'bg-red-100 text-red-800';
      case 'CLEANUP':
        return 'bg-gray-100 text-gray-800';
      case 'OTHER':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>
        <p className="text-gray-600">Manage volunteer teams and schedules</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Assigned</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.assigned}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Confirmation Rate</p>
                <p className="text-2xl font-bold text-purple-600">{stats.confirmationRate}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.completionRate}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Volunteers */}
      {topVolunteers.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Volunteers</h3>
            <div className="space-y-3">
              {topVolunteers.slice(0, 5).map((volunteer, index) => (
                <div key={volunteer.member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {volunteer.member.firstName} {volunteer.member.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{volunteer.member.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{volunteer.completedAssignments}</p>
                    <p className="text-xs text-gray-500">completed assignments</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                className="input"
                placeholder="Search by volunteer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                className="input"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="LEADER">Leader</option>
                <option value="ASSISTANT">Assistant</option>
                <option value="GREETER">Greeter</option>
                <option value="USHER">Usher</option>
                <option value="MUSIC">Music</option>
                <option value="TECH">Tech</option>
                <option value="SECURITY">Security</option>
                <option value="CLEANUP">Cleanup</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="DECLINED">Declined</option>
                <option value="COMPLETED">Completed</option>
                <option value="NO_SHOW">No Show</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                className="input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                className="input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary mr-2"
              >
                Add Assignment
              </button>
              
              <button
                onClick={() => setShowBulkModal(true)}
                className="btn btn-secondary"
              >
                Bulk Assign
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Volunteer Assignments Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading volunteer assignments...</div>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No volunteer assignments found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volunteer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ministry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(assignment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assignment.member ? `${assignment.member.firstName} ${assignment.member.lastName}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {assignment.ministry ? assignment.ministry.name : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(assignment.role)}`}>
                          {assignment.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                          {assignment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(assignment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary"
            >
              Previous
            </button>
            
            <span className="flex items-center px-4 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add Volunteer Assignment</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateAssignment({
                  memberId: formData.get('memberId'),
                  eventId: formData.get('eventId'),
                  role: formData.get('role'),
                  status: 'ASSIGNED',
                  notes: formData.get('notes')
                });
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member ID</label>
                  <input
                    type="text"
                    name="memberId"
                    className="input"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event ID</label>
                  <input
                    type="text"
                    name="eventId"
                    className="input"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select name="role" className="input" required>
                    <option value="">Select Role</option>
                    <option value="LEADER">Leader</option>
                    <option value="ASSISTANT">Assistant</option>
                    <option value="GREETER">Greeter</option>
                    <option value="USHER">Usher</option>
                    <option value="MUSIC">Music</option>
                    <option value="TECH">Tech</option>
                    <option value="SECURITY">Security</option>
                    <option value="CLEANUP">Cleanup</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    className="input"
                    rows={3}
                    placeholder="Optional notes"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Add Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Assignment Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Bulk Volunteer Assignment</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const memberIds = (formData.get('memberIds') as string).split(',').map(id => id.trim()).filter(id => id);
                handleBulkAssignment({
                  eventId: formData.get('eventId'),
                  volunteerAssignments: memberIds.map(memberId => ({
                    memberId,
                    role: formData.get('role'),
                    status: 'ASSIGNED'
                  }))
                });
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event ID</label>
                  <input
                    type="text"
                    name="eventId"
                    className="input"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member IDs (comma-separated)</label>
                  <textarea
                    name="memberIds"
                    className="input"
                    rows={4}
                    placeholder="member1, member2, member3..."
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select name="role" className="input" required>
                    <option value="">Select Role</option>
                    <option value="LEADER">Leader</option>
                    <option value="ASSISTANT">Assistant</option>
                    <option value="GREETER">Greeter</option>
                    <option value="USHER">Usher</option>
                    <option value="MUSIC">Music</option>
                    <option value="TECH">Tech</option>
                    <option value="SECURITY">Security</option>
                    <option value="CLEANUP">Cleanup</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Bulk Assign
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Volunteers;
