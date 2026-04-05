import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios, { isAxiosError } from 'axios';
import { API_BASE_URL } from '../config/api';
import { canAccessFinanceModules } from '../utils/roles';
import ModulePageHeader from '../components/ModulePageHeader';

/** Reporting hub: KPIs from existing reports API + shortcuts to operational modules. */
const ReportingDashboard: React.FC = () => {
  const [period, setPeriod] = useState('current');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<{
    overview?: { totalMembers: number; upcomingEvents: number; activeVolunteers: number };
    financial?: { totalGiving: number; totalExpenses: number; budgetUtilizationRate: string };
    operations?: { totalInventory: number; openPastoralCare: number };
  } | null>(null);
  const [showFinance, setShowFinance] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setShowFinance(canAccessFinanceModules(u.role));
    } catch {
      setShowFinance(false);
    }
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/reports/dashboard?period=${period}`);
      setData(res.data);
      setError('');
    } catch (e: unknown) {
      const msg = isAxiosError(e) ? e.response?.data?.error?.message : null;
      setError(msg || 'Could not load reporting data. Ensure the API is running.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  const o = data?.overview;
  const f = data?.financial;
  const op = data?.operations;

  return (
    <div>
      <ModulePageHeader
        title="Reporting dashboard"
        subtitle="Cross-module KPIs and quick paths to detailed reports."
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <select className="input max-w-xs" value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="current">Current period</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="all">All time</option>
        </select>
        <div className="flex flex-wrap gap-2">
          <Link to="/reports" className="btn btn-secondary btn-md">
            Legacy reports view
          </Link>
          <button type="button" className="btn btn-primary btn-md" onClick={() => load()}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading metrics…</p>
      ) : error ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="card p-4">
              <p className="text-sm text-gray-500">Members</p>
              <p className="text-2xl font-semibold text-[#7a0f1a]">{o?.totalMembers ?? '—'}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-gray-500">Upcoming events</p>
              <p className="text-2xl font-semibold text-[#7a0f1a]">{o?.upcomingEvents ?? '—'}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-gray-500">Active volunteers</p>
              <p className="text-2xl font-semibold text-[#7a0f1a]">{o?.activeVolunteers ?? '—'}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-gray-500">Open pastoral items</p>
              <p className="text-2xl font-semibold text-[#7a0f1a]">{op?.openPastoralCare ?? '—'}</p>
            </div>
          </div>

          {showFinance && f ? (
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="card p-4">
                <p className="text-sm text-gray-500">Total giving</p>
                <p className="text-xl font-semibold text-green-700">₦{Number(f.totalGiving || 0).toLocaleString()}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-500">Total expenses</p>
                <p className="text-xl font-semibold text-red-700">₦{Number(f.totalExpenses || 0).toLocaleString()}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-500">Budget utilization</p>
                <p className="text-xl font-semibold text-[#7a0f1a]">{f.budgetUtilizationRate}</p>
              </div>
            </div>
          ) : null}

          <div className="card p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#7a0f1a]">Drill-down</h2>
            <div className="flex flex-wrap gap-2">
              <Link to="/members" className="btn btn-secondary btn-sm">
                Members
              </Link>
              <Link to="/attendance" className="btn btn-secondary btn-sm">
                Attendance
              </Link>
              <Link to="/events" className="btn btn-secondary btn-sm">
                Events
              </Link>
              {showFinance ? (
                <Link to="/financial" className="btn btn-secondary btn-sm">
                  Financial
                </Link>
              ) : null}
              <Link to="/inventory" className="btn btn-secondary btn-sm">
                Inventory
              </Link>
              <Link to="/partners" className="btn btn-secondary btn-sm">
                Partners
              </Link>
              <Link to="/prayer-line" className="btn btn-secondary btn-sm">
                Prayer line
              </Link>
              <Link to="/builders" className="btn btn-secondary btn-sm">
                Builders
              </Link>
              <Link to="/hostels" className="btn btn-secondary btn-sm">
                Hostels
              </Link>
              <Link to="/guest-house" className="btn btn-secondary btn-sm">
                Guest house
              </Link>
              {showFinance ? (
                <Link to="/budget-planning" className="btn btn-secondary btn-sm">
                  Budget planning
                </Link>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportingDashboard;
