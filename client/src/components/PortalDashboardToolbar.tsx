import React from 'react';
import type { DashboardPeriod } from '../hooks/useReportsDashboardStats';

export function PortalDashboardToolbar({
  period,
  onPeriodChange,
  onRefresh,
}: {
  period: DashboardPeriod;
  onPeriodChange: (p: DashboardPeriod) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="portal-dash-period" className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Data period
        </label>
        <select
          id="portal-dash-period"
          value={period}
          onChange={(e) => onPeriodChange(e.target.value as DashboardPeriod)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-[#f5e6b8]"
        >
          <option value="current">Current</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="all">All time</option>
        </select>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        className="rounded-lg border border-[#c9a227]/35 px-4 py-2 text-sm font-medium text-[#f4e4a8] hover:bg-[#c9a227]/10"
      >
        Refresh data
      </button>
    </div>
  );
}
