import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import {
  RoleDashboardLayout,
  StatCard,
  DashboardSection,
  QuickActionButton,
  DataPanel,
  RoleDashboardLoading,
  FetchNotice,
} from '../../components/RoleDashboardLayout';

interface FinancialStats {
  totalBudget: number;
  monthlyIncome: number;
  totalExpenses: number;
  pendingApprovals: number;
  recentTransactions: Array<{
    date: string;
    description: string;
    type: string;
    amount: number;
  }>;
}

const AccountantDashboard: React.FC = () => {
  const [stats, setStats] = useState<FinancialStats>({
    totalBudget: 0,
    monthlyIncome: 0,
    totalExpenses: 0,
    pendingApprovals: 0,
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchFinancialStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/accountant/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch financial stats:', err);
      setError('Finance data failed to load. Retry to refresh this dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinancialStats();
  }, [fetchFinancialStats]);

  if (loading) {
    return <RoleDashboardLoading />;
  }

  return (
    <RoleDashboardLayout title="Finance & accounting" roleBadge="Accountant · finance-only portal">
      <FetchNotice error={error} onRetry={fetchFinancialStats} />
      <DashboardSection title="Financial overview">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total budget" value={`₦${stats.totalBudget.toLocaleString()}`} />
          <StatCard label="Monthly income" value={`₦${stats.monthlyIncome.toLocaleString()}`} />
          <StatCard label="Total expenses" value={`₦${stats.totalExpenses.toLocaleString()}`} />
          <StatCard label="Pending approvals" value={stats.pendingApprovals} />
        </div>
      </DashboardSection>

      <DashboardSection title="Finance modules">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <QuickActionButton onClick={() => navigate('/financial')}>💰 Giving & income</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/expenses')}>🧾 Expenses</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/vendors')}>🏢 Vendors</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/budget')}>💹 Live budget</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/budget-planning')}>📐 Budget planning</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/builders')}>🏗️ Builders (pledges)</QuickActionButton>
        </div>
      </DashboardSection>

      <DataPanel title="Recent transactions">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-700 text-xs uppercase tracking-wider text-zinc-500">
                <th className="pb-3 pr-4 font-medium">Date</th>
                <th className="pb-3 pr-4 font-medium">Description</th>
                <th className="pb-3 pr-4 font-medium">Type</th>
                <th className="pb-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {stats.recentTransactions.map((transaction, index) => (
                <tr key={index}>
                  <td className="py-3 pr-4 text-zinc-300">{transaction.date}</td>
                  <td className="py-3 pr-4 text-zinc-300">{transaction.description}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        transaction.type === 'Giving'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-red-500/15 text-red-300'
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td
                    className={`py-3 font-medium tabular-nums ${
                      transaction.type === 'Giving' ? 'text-emerald-400' : 'text-red-300'
                    }`}
                  >
                    ₦{transaction.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate('/financial')}
            className="rounded-lg border border-[#c9a227]/35 px-4 py-2 text-sm text-[#f4e4a8] hover:bg-[#c9a227]/10"
          >
            All giving & income
          </button>
        </div>
      </DataPanel>
    </RoleDashboardLayout>
  );
};

export default AccountantDashboard;
