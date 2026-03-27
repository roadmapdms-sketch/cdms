import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';
import axios from 'axios';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  vendor?: string;
  date: string;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
  eventId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  event?: {
    id: string;
    title: string;
    startDate: string;
  };
}

interface ExpenseStats {
  totalExpenses: number;
  pending: number;
  approved: number;
  rejected: number;
  paid: number;
  totalAmount: number;
  approvalRate: string;
  categoryBreakdown: {
    supplies: number;
    rent: number;
    utilities: number;
    salaries: number;
    marketing: number;
    events: number;
    maintenance: number;
    equipment: number;
    travel: number;
    other: number;
  };
  period: {
    from: string | null;
    to: string | null;
  };
}

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [pendingExpenses, setPendingExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(search && { search }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(vendorFilter && { vendor: vendorFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const response = await axios.get(`${API_BASE_URL}/expenses?${params}`);
      setExpenses(response.data.expenses);
      setTotalPages(response.data.pagination.pages);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, categoryFilter, statusFilter, vendorFilter, dateFrom, dateTo]);

  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const response = await axios.get(`${API_BASE_URL}/expenses/stats/overview?${params}`);
      setStats(response.data);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  }, [dateFrom, dateTo]);

  const fetchPendingExpenses = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/expenses/pending/list?limit=5`);
      setPendingExpenses(response.data.expenses);
    } catch (err: any) {
      console.error('Failed to fetch pending expenses:', err);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
    fetchStats();
    fetchPendingExpenses();
  }, [fetchExpenses, fetchStats, fetchPendingExpenses]);

  const handleCreateExpense = async (expenseData: any) => {
    try {
      await axios.post('`${API_BASE_URL}/expenses', expenseData);
      fetchExpenses();
      fetchStats();
      fetchPendingExpenses();
      setShowModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create expense');
    }
  };

  const handleApprove = async (expenseId: string) => {
    try {
      await axios.post(`${API_BASE_URL}/expenses/${expenseId}/approve`, {});
      fetchExpenses();
      fetchStats();
      fetchPendingExpenses();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to approve expense');
    }
  };

  const handleReject = async (expenseId: string) => {
    try {
      await axios.post(`${API_BASE_URL}/expenses/${expenseId}/reject`, {});
      fetchExpenses();
      fetchStats();
      fetchPendingExpenses();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to reject expense');
    }
  };

  const handlePay = async (expenseId: string) => {
    try {
      await axios.post(`${API_BASE_URL}/expenses/${expenseId}/pay`, {});
      fetchExpenses();
      fetchStats();
      fetchPendingExpenses();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to mark expense as paid');
    }
  };

  const handleBulkApprove = async (bulkData: any) => {
    try {
      await axios.post('`${API_BASE_URL}/expenses/bulk-approve', bulkData);
      fetchExpenses();
      fetchStats();
      fetchPendingExpenses();
      setShowBulkModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to process bulk approval');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/expenses/${id}`);
      fetchExpenses();
      fetchStats();
      fetchPendingExpenses();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete expense');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PAID':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SUPPLIES':
        return 'bg-purple-100 text-purple-800';
      case 'RENT':
        return 'bg-indigo-100 text-indigo-800';
      case 'UTILITIES':
        return 'bg-blue-100 text-blue-800';
      case 'SALARIES':
        return 'bg-green-100 text-green-800';
      case 'MARKETING':
        return 'bg-pink-100 text-pink-800';
      case 'EVENTS':
        return 'bg-yellow-100 text-yellow-800';
      case 'MAINTENANCE':
        return 'bg-orange-100 text-orange-800';
      case 'EQUIPMENT':
        return 'bg-red-100 text-red-800';
      case 'TRAVEL':
        return 'bg-teal-100 text-teal-800';
      case 'OTHER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <p className="text-gray-600">Track operational expenses and costs</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalExpenses}</p>
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
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-blue-600">{stats.paid}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-purple-600">${stats.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Expenses */}
      {pendingExpenses.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Expenses</h3>
            <div className="space-y-3">
              {pendingExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{expense.description}</p>
                    <p className="text-sm text-gray-600">
                      {expense.vendor && `Vendor: ${expense.vendor} • `}
                      ${expense.amount.toFixed(2)} • {new Date(expense.date).toLocaleDateString()}
                    </p>
                    {expense.event && (
                      <p className="text-xs text-gray-500">Event: {expense.event.title}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(expense.id)}
                      className="btn btn-primary text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(expense.id)}
                      className="btn btn-secondary text-sm"
                    >
                      Reject
                    </button>
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
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                className="input"
                placeholder="Search by description or vendor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="input"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="SUPPLIES">Supplies</option>
                <option value="RENT">Rent</option>
                <option value="UTILITIES">Utilities</option>
                <option value="SALARIES">Salaries</option>
                <option value="MARKETING">Marketing</option>
                <option value="EVENTS">Events</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="EQUIPMENT">Equipment</option>
                <option value="TRAVEL">Travel</option>
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
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="PAID">Paid</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <input
                type="text"
                className="input"
                placeholder="Filter by vendor..."
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
              />
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
                Add Expense
              </button>
              
              <button
                onClick={() => setShowBulkModal(true)}
                className="btn btn-secondary"
              >
                Bulk Approve
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

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading expenses...</div>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No expenses found</div>
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
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
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
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium text-gray-900">{expense.description}</div>
                          {expense.event && (
                            <div className="text-xs text-gray-500">Event: {expense.event.title}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${expense.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.vendor || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(expense.status)}`}>
                          {expense.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {expense.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(expense.id)}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(expense.id)}
                              className="text-red-600 hover:text-red-900 mr-3"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {expense.status === 'APPROVED' && (
                          <button
                            onClick={() => handlePay(expense.id)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Pay
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(expense.id)}
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

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add Expense</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateExpense({
                  description: formData.get('description'),
                  amount: formData.get('amount'),
                  category: formData.get('category'),
                  vendor: formData.get('vendor'),
                  date: formData.get('date'),
                  eventId: formData.get('eventId'),
                  notes: formData.get('notes')
                });
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    name="description"
                    className="input"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    className="input"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select name="category" className="input" required>
                    <option value="">Select Category</option>
                    <option value="SUPPLIES">Supplies</option>
                    <option value="RENT">Rent</option>
                    <option value="UTILITIES">Utilities</option>
                    <option value="SALARIES">Salaries</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="EVENTS">Events</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="EQUIPMENT">Equipment</option>
                    <option value="TRAVEL">Travel</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                  <input
                    type="text"
                    name="vendor"
                    className="input"
                    placeholder="Optional vendor"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
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
                    placeholder="Optional event ID"
                  />
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
                    Add Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Approve Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Bulk Approve Expenses</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const expenseIds = (formData.get('expenseIds') as string).split(',').map(id => id.trim()).filter(id => id);
                handleBulkApprove({
                  expenseIds,
                  notes: formData.get('notes')
                });
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expense IDs (comma-separated)</label>
                  <textarea
                    name="expenseIds"
                    className="input"
                    rows={4}
                    placeholder="expense1, expense2, expense3..."
                    required
                  />
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
                    onClick={() => setShowBulkModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Bulk Approve
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

export default Expenses;
