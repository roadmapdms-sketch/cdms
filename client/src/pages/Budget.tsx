import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';
import axios from 'axios';

interface BudgetRecord {
  id: string;
  category: string;
  description?: string;
  amount: number;
  period: string;
  startDate: string;
  endDate: string;
  spent: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface BudgetStats {
  totalBudgets: number;
  active: number;
  inactive: number;
  completed: number;
  cancelled: number;
  totalAllocated: number;
  totalSpent: number;
  remaining: number;
  utilizationRate: string;
  period: string;
}

const Budget: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetRecord[]>([]);
  const [stats, setStats] = useState<BudgetStats | null>(null);
  const [activeBudgets, setActiveBudgets] = useState<BudgetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateSpentModal, setShowUpdateSpentModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetRecord | null>(null);

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(search && { search }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(periodFilter && { period: periodFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const response = await axios.get(`${API_BASE_URL}/budget?${params}`);
      setBudgets(response.data.budgets);
      setTotalPages(response.data.pagination.pages);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, categoryFilter, statusFilter, periodFilter, dateFrom, dateTo]);

  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        ...(periodFilter && { period: periodFilter })
      });

      const response = await axios.get(`${API_BASE_URL}/budget/stats/overview?${params}`);
      setStats(response.data);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  }, [periodFilter]);

  const fetchActiveBudgets = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/budget/active/list?limit=5`);
      setActiveBudgets(response.data.budgets);
    } catch (err: any) {
      console.error('Failed to fetch active budgets:', err);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
    fetchStats();
    fetchActiveBudgets();
  }, [fetchBudgets, fetchStats, fetchActiveBudgets]);

  const handleCreateBudget = async (budgetData: any) => {
    try {
      await axios.post(`${API_BASE_URL}/budget`, budgetData);
      fetchBudgets();
      fetchStats();
      fetchActiveBudgets();
      setShowModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create budget');
    }
  };

  const handleUpdateSpent = async (budgetId: string, spentAmount: number) => {
    try {
      await axios.post(`${API_BASE_URL}/budget/${budgetId}/update-spent`, { amount: spentAmount });
      fetchBudgets();
      fetchStats();
      fetchActiveBudgets();
      setShowUpdateSpentModal(false);
      setSelectedBudget(null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update spent amount');
    }
  };

  const handleCloseBudget = async (budgetId: string, finalNotes?: string) => {
    try {
      await axios.post(`${API_BASE_URL}/budget/${budgetId}/close`, { finalNotes });
      fetchBudgets();
      fetchStats();
      fetchActiveBudgets();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to close budget');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/budget/${id}`);
      fetchBudgets();
      fetchStats();
      fetchActiveBudgets();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete budget');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUtilizationColor = (utilizationRate: number) => {
    if (utilizationRate >= 90) return 'text-red-600';
    if (utilizationRate >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Budget</h1>
        <p className="text-gray-600">Plan and monitor department budgets</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Budgets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBudgets}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Allocated</p>
                <p className="text-2xl font-bold text-purple-600">${stats.totalAllocated.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-orange-600">${stats.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Utilization</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.utilizationRate}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Budgets */}
      {activeBudgets.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Active Budgets</h3>
            <div className="space-y-3">
              {activeBudgets.map((budget) => {
                const utilizationRate = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
                const remaining = budget.amount - budget.spent;
                
                return (
                  <div key={budget.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{budget.category}</p>
                      <p className="text-sm text-gray-600">
                        Period: {budget.period} • ${budget.amount.toFixed(2)} allocated
                      </p>
                      <div className="flex items-center mt-1">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              utilizationRate >= 90 ? 'bg-red-500' : 
                              utilizationRate >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs ${getUtilizationColor(utilizationRate)}`}>
                          {utilizationRate.toFixed(1)}% (${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)})
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(budget.status)}`}>
                        {budget.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        ${remaining.toFixed(2)} remaining
                      </p>
                    </div>
                  </div>
                );
              })}
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
                placeholder="Search by category or description..."
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
                <option value="GENERAL">General</option>
                <option value="EVENTS">Events</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="SALARIES">Salaries</option>
                <option value="MARKETING">Marketing</option>
                <option value="OUTREACH">Outreach</option>
                <option value="EDUCATION">Education</option>
                <option value="MISSIONS">Missions</option>
                <option value="WORSHIP">Worship</option>
                <option value="ADMINISTRATION">Administration</option>
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
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <input
                type="text"
                className="input"
                placeholder="Filter by period..."
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
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
                className="btn btn-primary"
              >
                Add Budget
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

      {/* Budgets Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading budgets...</div>
            </div>
          ) : budgets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No budgets found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remaining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilization
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
                  {budgets.map((budget) => {
                    const utilizationRate = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
                    const remaining = budget.amount - budget.spent;
                    
                    return (
                      <tr key={budget.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{budget.category}</div>
                            {budget.description && (
                              <div className="text-xs text-gray-500 truncate max-w-xs" title={budget.description}>
                                {budget.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {budget.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${budget.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${budget.spent.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={remaining < 0 ? 'text-red-600' : 'text-green-600'}>
                            ${remaining.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  utilizationRate >= 90 ? 'bg-red-500' : 
                                  utilizationRate >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                              />
                            </div>
                            <span className={`text-xs ${getUtilizationColor(utilizationRate)}`}>
                              {utilizationRate.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(budget.status)}`}>
                            {budget.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {budget.status === 'ACTIVE' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedBudget(budget);
                                  setShowUpdateSpentModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                Update Spent
                              </button>
                              <button
                                onClick={() => handleCloseBudget(budget.id)}
                                className="text-green-600 hover:text-green-900 mr-3"
                              >
                                Close
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(budget.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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

      {/* Add Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add Budget</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateBudget({
                  category: formData.get('category'),
                  description: formData.get('description'),
                  amount: formData.get('amount'),
                  period: formData.get('period'),
                  startDate: formData.get('startDate'),
                  endDate: formData.get('endDate'),
                  status: formData.get('status')
                });
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select name="category" className="input" required>
                    <option value="">Select Category</option>
                    <option value="GENERAL">General</option>
                    <option value="EVENTS">Events</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="SALARIES">Salaries</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="OUTREACH">Outreach</option>
                    <option value="EDUCATION">Education</option>
                    <option value="MISSIONS">Missions</option>
                    <option value="WORSHIP">Worship</option>
                    <option value="ADMINISTRATION">Administration</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    className="input"
                    rows={2}
                    placeholder="Optional description"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                  <input
                    type="text"
                    name="period"
                    className="input"
                    placeholder="e.g., 2024-Q1, 2024-Annual"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    className="input"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="input"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" className="input" required>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
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
                    Add Budget
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Update Spent Modal */}
      {showUpdateSpentModal && selectedBudget && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Update Spent Amount: {selectedBudget.category}
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateSpent(selectedBudget.id, Number(formData.get('spent')));
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Spent</label>
                  <div className="text-sm text-gray-600">${selectedBudget.spent.toFixed(2)}</div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount</label>
                  <div className="text-sm text-gray-600">${selectedBudget.amount.toFixed(2)}</div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Spent Amount</label>
                  <input
                    type="number"
                    name="spent"
                    className="input"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUpdateSpentModal(false);
                      setSelectedBudget(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Update
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

export default Budget;
