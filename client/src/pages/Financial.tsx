import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface FinancialRecord {
  id: string;
  memberId?: string;
  userId: string;
  type: string;
  amount: number;
  paymentMethod?: string;
  description?: string;
  reference?: string;
  date: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  member?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface FinancialStats {
  totalRecords: number;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  breakdown: {
    tithes: number;
    offerings: number;
    donations: number;
    fees: number;
  };
  period: {
    from: string | null;
    to: string | null;
  };
}

interface MonthlyData {
  month: string;
  income: number;
  transactions: number;
}

interface TopDonor {
  member?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  totalAmount: number;
  transactionCount: number;
}

const Financial: React.FC = () => {
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const safeNum = (v: unknown): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const fetchFinancialRecords = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(search && { search }),
        ...(typeFilter && { type: typeFilter }),
        ...(paymentMethodFilter && { paymentMethod: paymentMethodFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const response = await axios.get(`${API_BASE_URL}/financial?${params}`);
      setFinancialRecords(response.data.financialRecords);
      setTotalPages(response.data.pagination.pages);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch financial records');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, typeFilter, paymentMethodFilter, statusFilter, dateFrom, dateTo]);

  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const response = await axios.get(`${API_BASE_URL}/financial/stats/overview?${params}`);
      const raw = response.data || {};
      setStats({
        totalRecords: safeNum(raw.totalRecords),
        totalIncome: safeNum(raw.totalIncome),
        totalExpenses: safeNum(raw.totalExpenses),
        netIncome: safeNum(raw.netIncome),
        breakdown: {
          tithes: safeNum(raw.breakdown?.tithes),
          offerings: safeNum(raw.breakdown?.offerings),
          donations: safeNum(raw.breakdown?.donations),
          fees: safeNum(raw.breakdown?.fees),
        },
        period: {
          from: raw.period?.from ?? null,
          to: raw.period?.to ?? null,
        },
      });
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
      setStats(null);
    }
  }, [dateFrom, dateTo]);

  const fetchMonthlyData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/financial/stats/monthly`);
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      setMonthlyData(
        rows.map((r: any) => ({
          month: String(r?.month ?? ''),
          income: safeNum(r?.income),
          transactions: safeNum(r?.transactions),
        }))
      );
    } catch (err: any) {
      console.error('Failed to fetch monthly data:', err);
      setMonthlyData([]);
    }
  }, []);

  const fetchTopDonors = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const response = await axios.get(`${API_BASE_URL}/financial/stats/top-donors?${params}`);
      const donors = Array.isArray(response.data?.donors) ? response.data.donors : [];
      setTopDonors(
        donors.map((d: any) => ({
          member: d?.member
            ? {
                id: String(d.member.id ?? ''),
                firstName: String(d.member.firstName ?? 'Unknown'),
                lastName: String(d.member.lastName ?? 'Member'),
                email: d.member.email ? String(d.member.email) : undefined,
              }
            : undefined,
          totalAmount: safeNum(d?.totalAmount),
          transactionCount: safeNum(d?.transactionCount),
        }))
      );
    } catch (err: any) {
      console.error('Failed to fetch top donors:', err);
      setTopDonors([]);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchFinancialRecords();
    fetchStats();
    fetchMonthlyData();
    fetchTopDonors();
  }, [fetchFinancialRecords, fetchStats, fetchMonthlyData, fetchTopDonors]);

  const handleCreateRecord = async (recordData: any) => {
    try {
      await axios.post(`${API_BASE_URL}/financial`, recordData);
      fetchFinancialRecords();
      fetchStats();
      setShowModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create financial record');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this financial record?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/financial/${id}`);
      fetchFinancialRecords();
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete financial record');
    }
  };

  const handleGenerateReport = async (reportData: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/financial/reports/generate`, reportData);
      
      if (reportData.format === 'CSV') {
        // Create download link for CSV
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'financial-report.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      
      setShowReportModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to generate report');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECORDED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TITHE':
        return 'bg-blue-100 text-blue-800';
      case 'OFFERING':
        return 'bg-purple-100 text-purple-800';
      case 'DONATION':
        return 'bg-green-100 text-green-800';
      case 'EXPENSE':
        return 'bg-red-100 text-red-800';
      case 'FEE':
        return 'bg-orange-100 text-orange-800';
      case 'REFUND':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Financial</h1>
        <p className="text-gray-600">Manage tithes, offerings, and donations</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalIncome.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">${stats.totalExpenses.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Net Income</p>
                <p className="text-2xl font-bold text-blue-600">${stats.netIncome.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Actions</p>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="btn btn-primary"
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Income Breakdown */}
      {stats && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Income Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Tithes</p>
                <p className="text-lg font-bold text-blue-600">${stats.breakdown.tithes.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Offerings</p>
                <p className="text-lg font-bold text-purple-600">${stats.breakdown.offerings.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Donations</p>
                <p className="text-lg font-bold text-green-600">${stats.breakdown.donations.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Fees</p>
                <p className="text-lg font-bold text-orange-600">${stats.breakdown.fees.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Trends Chart */}
      {monthlyData.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
            <div className="h-64">
              <div className="grid grid-cols-12 gap-2 h-full">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center justify-center">
                    <div className="text-xs text-gray-600 mb-1">{data.month}</div>
                    <div 
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${(data.income / Math.max(...monthlyData.map(d => d.income))) * 100}%` }}
                    />
                    <div className="text-xs text-gray-700">${data.income.toFixed(0)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Donors */}
      {topDonors.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Donors</h3>
            <div className="space-y-3">
              {topDonors.slice(0, 5).map((donor, index) => (
                <div key={donor.member?.id || `donor-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {donor.member ? `${donor.member.firstName} ${donor.member.lastName}` : 'Unknown member'}
                    </p>
                    <p className="text-sm text-gray-600">{donor.member?.email || 'No email'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">${donor.totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{donor.transactionCount} transactions</p>
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
                placeholder="Search by description..."
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
                <option value="TITHE">Tithe</option>
                <option value="OFFERING">Offering</option>
                <option value="DONATION">Donation</option>
                <option value="EXPENSE">Expense</option>
                <option value="FEE">Fee</option>
                <option value="REFUND">Refund</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                className="input"
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
              >
                <option value="">All Methods</option>
                <option value="CASH">Cash</option>
                <option value="CHECK">Check</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="ONLINE">Online</option>
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
                <option value="RECORDED">Recorded</option>
                <option value="PENDING">Pending</option>
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
                className="btn btn-primary"
              >
                Add Record
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

      {/* Financial Records Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading financial records...</div>
            </div>
          ) : financialRecords.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No financial records found</div>
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
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
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
                  {financialRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.member ? `${record.member.firstName} ${record.member.lastName}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(record.type)}`}>
                          {record.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${record.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.paymentMethod || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(record.id)}
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

      {/* Add Financial Record Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add Financial Record</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateRecord({
                  memberId: formData.get('memberId'),
                  type: formData.get('type'),
                  amount: formData.get('amount'),
                  paymentMethod: formData.get('paymentMethod'),
                  description: formData.get('description'),
                  reference: formData.get('reference'),
                  date: formData.get('date'),
                  status: 'RECORDED'
                });
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member ID (Optional)</label>
                  <input
                    type="text"
                    name="memberId"
                    className="input"
                    placeholder="Leave empty if not member-specific"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select name="type" className="input" required>
                    <option value="TITHE">Tithe</option>
                    <option value="OFFERING">Offering</option>
                    <option value="DONATION">Donation</option>
                    <option value="EXPENSE">Expense</option>
                    <option value="FEE">Fee</option>
                    <option value="REFUND">Refund</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    className="input"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select name="paymentMethod" className="input">
                    <option value="">Select Payment Method</option>
                    <option value="CASH">Cash</option>
                    <option value="CHECK">Check</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="ONLINE">Online</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    className="input"
                    rows={3}
                    placeholder="Optional description"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                  <input
                    type="text"
                    name="reference"
                    className="input"
                    placeholder="Check number, transaction ID, etc."
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
                    Add Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Generate Financial Report</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleGenerateReport({
                  type: formData.get('type'),
                  dateFrom: formData.get('dateFrom'),
                  dateTo: formData.get('dateTo'),
                  format: formData.get('format')
                });
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                  <select name="type" className="input">
                    <option value="ALL">All Records</option>
                    <option value="TITHE">Tithes Only</option>
                    <option value="OFFERING">Offerings Only</option>
                    <option value="DONATION">Donations Only</option>
                    <option value="EXPENSE">Expenses Only</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input
                    type="date"
                    name="dateFrom"
                    className="input"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input
                    type="date"
                    name="dateTo"
                    className="input"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                  <select name="format" className="input">
                    <option value="JSON">JSON</option>
                    <option value="CSV">CSV Download</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Generate Report
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

export default Financial;
