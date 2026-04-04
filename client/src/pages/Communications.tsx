import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';
import axios from 'axios';

interface Communication {
  id: string;
  memberId?: string;
  userId: string;
  type: string;
  subject: string;
  content: string;
  method: string;
  status: string;
  scheduled?: string;
  sent?: string;
  response?: string;
  createdAt: string;
  updatedAt: string;
  member?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface CommunicationTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  content: string;
}

interface CommunicationStats {
  total: number;
  pending: number;
  sent: number;
  failed: number;
  period: {
    from: string | null;
    to: string | null;
  };
}

const Communications: React.FC = () => {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [stats, setStats] = useState<CommunicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchCommunications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(search && { search }),
        ...(typeFilter && { type: typeFilter }),
        ...(methodFilter && { method: methodFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const response = await axios.get(`${API_BASE_URL}/communications?${params}`);
      setCommunications(response.data.communications);
      setTotalPages(response.data.pagination.pages);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch communications');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, typeFilter, methodFilter, statusFilter, dateFrom, dateTo]);

  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const response = await axios.get(`${API_BASE_URL}/communications/stats/overview?${params}`);
      setStats(response.data);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  }, [dateFrom, dateTo]);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/communications/templates`);
      setTemplates(response.data);
    } catch (err: any) {
      console.error('Failed to fetch templates:', err);
    }
  }, []);

  useEffect(() => {
    fetchCommunications();
    fetchStats();
    fetchTemplates();
  }, [fetchCommunications, fetchStats, fetchTemplates]);

  const handleCreateCommunication = async (communicationData: any) => {
    try {
      await axios.post(`${API_BASE_URL}/communications`, communicationData);
      fetchCommunications();
      fetchStats();
      setShowModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create communication');
    }
  };

  const handleSend = async (id: string) => {
    try {
      await axios.post(`${API_BASE_URL}/communications/${id}/send`);
      fetchCommunications();
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to send communication');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this communication?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/communications/${id}`);
      fetchCommunications();
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete communication');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const applyTemplate = (template: CommunicationTemplate) => {
    setSelectedTemplate(template);
    setShowTemplatesModal(false);
    setShowModal(true);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
        <p className="text-gray-600">Send emails, SMS, and notifications</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Sent</p>
                <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                className="input"
                placeholder="Search by subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                className="input"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
                <option value="PHONE">Phone</option>
                <option value="MAIL">Mail</option>
                <option value="SOCIAL_MEDIA">Social Media</option>
                <option value="IN_PERSON">In Person</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select
                className="input"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
              >
                <option value="">All Methods</option>
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
                <option value="PHONE_CALL">Phone Call</option>
                <option value="MAIL">Mail</option>
                <option value="SOCIAL_MEDIA">Social Media</option>
                <option value="IN_PERSON">In Person</option>
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
                <option value="PENDING">Pending</option>
                <option value="SENT">Sent</option>
                <option value="FAILED">Failed</option>
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
                New Communication
              </button>
              
              <button
                onClick={() => setShowTemplatesModal(true)}
                className="btn btn-secondary"
              >
                Templates
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

      {/* Communications Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading communications...</div>
            </div>
          ) : communications.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No communications found</div>
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
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
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
                  {communications.map((communication) => (
                    <tr key={communication.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(communication.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">{communication.subject}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {communication.member ? `${communication.member.firstName} ${communication.member.lastName}` : 'All Members'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {communication.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {communication.method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(communication.status)}`}>
                          {communication.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {communication.status === 'PENDING' && (
                          <button
                            onClick={() => handleSend(communication.id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Send
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(communication.id)}
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

      {/* New Communication Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">New Communication</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateCommunication({
                  memberId: formData.get('memberId'),
                  type: formData.get('type'),
                  subject: selectedTemplate?.subject || formData.get('subject'),
                  content: selectedTemplate?.content || formData.get('content'),
                  method: formData.get('method'),
                  scheduled: formData.get('scheduled'),
                  status: 'PENDING'
                });
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member ID (Optional)</label>
                  <input
                    type="text"
                    name="memberId"
                    className="input"
                    placeholder="Leave empty for all members"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select name="type" className="input" required>
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="PHONE">Phone</option>
                    <option value="MAIL">Mail</option>
                    <option value="SOCIAL_MEDIA">Social Media</option>
                    <option value="IN_PERSON">In Person</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    className="input"
                    defaultValue={selectedTemplate?.subject}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    name="content"
                    className="input"
                    rows={4}
                    defaultValue={selectedTemplate?.content}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                  <select name="method" className="input" required>
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="PHONE_CALL">Phone Call</option>
                    <option value="MAIL">Mail</option>
                    <option value="SOCIAL_MEDIA">Social Media</option>
                    <option value="IN_PERSON">In Person</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (Optional)</label>
                  <input
                    type="datetime-local"
                    name="scheduled"
                    className="input"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedTemplate(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Create Communication
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Communication Templates</h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                       onClick={() => applyTemplate(template)}>
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.subject}</p>
                    <p className="text-xs text-gray-500 mt-1">Type: {template.type}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowTemplatesModal(false)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communications;
