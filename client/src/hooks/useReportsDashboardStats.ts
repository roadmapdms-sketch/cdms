import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

/** Shape returned by GET /api/reports/dashboard (partial; safe for portal dashboards). */
export interface ReportsDashboardPayload {
  overview?: {
    totalMembers?: number;
    activeMembers?: number;
    totalEvents?: number;
    upcomingEvents?: number;
    totalVolunteers?: number;
    activeVolunteers?: number;
    memberEngagementRate?: string;
    volunteerEngagementRate?: string;
  };
  financial?: {
    totalGiving?: number;
    totalExpenses?: number;
    budgetUtilizationRate?: string;
  };
  operations?: {
    totalInventory?: number;
    availableInventory?: number;
    totalVendors?: number;
    activeVendors?: number;
    totalPastoralCare?: number;
    openPastoralCare?: number;
    totalCommunications?: number;
    pendingCommunications?: number;
    recentAttendanceCount?: number;
  };
  recentEvents?: Array<{
    id: string;
    title: string;
    startDate: string;
    type?: string;
    status?: string;
  }>;
}

const DASH_PERIODS = ['current', '2024', '2023', 'all'] as const;
export type DashboardPeriod = (typeof DASH_PERIODS)[number];

export function useReportsDashboardStats() {
  const [period, setPeriod] = useState<DashboardPeriod>('current');
  const [data, setData] = useState<ReportsDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/reports/dashboard?period=${period}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setData(res.data);
      setError(null);
    } catch {
      setData(null);
      setError('Dashboard metrics failed to load. Check API connection and retry.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  return { period, setPeriod, data, loading, error, retry: load };
}
