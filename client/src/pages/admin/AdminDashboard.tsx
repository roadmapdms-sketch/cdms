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
} from '../../components/RoleDashboardLayout';
import { formatZAR } from '../../utils/currency';

interface AdminStats {
  totalMembers: number;
  totalBudget: number;
  attendanceRate: number;
  upcomingEvents: number;
  monthlyGrowth: number;
  monthlyIncome: number;
}

interface PortalRow {
  id: string;
  label: string;
  description: string;
  path: string;
  accountCount: number;
  activeAccountCount: number;
  lastAccountActivityAt: string | null;
}

interface ActivityRow {
  at: string;
  kind: string;
  title: string;
  detail: string | null;
  portalId: string;
}

interface UserRoleRow {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const PORTAL_LABELS: Record<string, string> = {
  administrator: 'Admin',
  finance: 'Finance',
  pastoral: 'Pastoral',
  volunteers: 'Volunteers',
  media: 'Media',
  kitchen: 'Kitchen',
  management: 'Management',
  ushers: 'Ushers',
  partners: 'Partners',
  prayer_line: 'Prayer line',
  operations: 'Operations',
};

const KIND_LABELS: Record<string, string> = {
  member: 'Directory',
  event: 'Events',
  giving: 'Giving',
  expense: 'Expenses',
  communication: 'Comms',
  pastoral: 'Pastoral care',
  attendance: 'Attendance',
  volunteer: 'Volunteers',
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalMembers: 0,
    totalBudget: 0,
    attendanceRate: 0,
    upcomingEvents: 0,
    monthlyGrowth: 0,
    monthlyIncome: 0,
  });
  const [portals, setPortals] = useState<PortalRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadNote, setLoadNote] = useState<string | null>(null);
  const [roleUsers, setRoleUsers] = useState<UserRoleRow[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [draftRoles, setDraftRoles] = useState<Record<string, string>>({});
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [roleNote, setRoleNote] = useState<string | null>(null);
  const [canManageAdminRole, setCanManageAdminRole] = useState(false);
  const [rootAdminConfigured, setRootAdminConfigured] = useState(false);
  const [rolesLastLoadedAt, setRolesLastLoadedAt] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadOverview = useCallback(async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/overview`, { headers });
      setStats(res.data.stats);
      setPortals(res.data.portals ?? []);
      setActivity(res.data.recentActivity ?? []);
      setLoadNote(null);
    } catch {
      try {
        const s = await axios.get(`${API_BASE_URL}/admin/stats`, { headers });
        setStats(s.data);
        setPortals([]);
        setActivity([]);
        setLoadNote('Portal monitor requires the latest API (/admin/overview). Showing summary stats only.');
      } catch {
        setStats({
          totalMembers: 0,
          totalBudget: 0,
          attendanceRate: 0,
          upcomingEvents: 0,
          monthlyGrowth: 0,
          monthlyIncome: 0,
        });
        setPortals([]);
        setActivity([]);
        setLoadNote('Could not load admin statistics. Check the API and database connection.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRoleUsers = useCallback(async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/users/roles`, { headers });
      const users = (res.data?.users ?? []) as UserRoleRow[];
      const roles = (res.data?.availableRoles ?? []) as string[];
      const initialDrafts: Record<string, string> = {};
      users.forEach((u) => {
        initialDrafts[u.id] = u.role;
      });
      setRoleUsers(users);
      setAvailableRoles(roles);
      setDraftRoles(initialDrafts);
      setCanManageAdminRole(Boolean(res.data?.canManageAdminRole));
      setRootAdminConfigured(Boolean(res.data?.rootAdminConfigured));
      setRolesLastLoadedAt(new Date().toISOString());
      setRoleNote(null);
    } catch (err: any) {
      setRoleNote(err?.response?.data?.error?.message || 'Could not load role management users.');
    }
  }, []);

  const saveUserRole = useCallback(
    async (user: UserRoleRow) => {
      const nextRole = draftRoles[user.id] || user.role;
      if (nextRole === user.role) return;
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      setSavingUserId(user.id);
      try {
        await axios.patch(
          `${API_BASE_URL}/admin/users/${user.id}/role`,
          { role: nextRole },
          { headers }
        );
        setRoleNote(`Role updated for ${user.firstName} ${user.lastName}.`);
        await loadRoleUsers();
      } catch (err: any) {
        setRoleNote(err?.response?.data?.error?.message || 'Failed to update role.');
      } finally {
        setSavingUserId(null);
      }
    },
    [draftRoles, loadRoleUsers]
  );

  useEffect(() => {
    loadOverview();
    loadRoleUsers();
  }, [loadOverview, loadRoleUsers]);

  useEffect(() => {
    const onFocus = () => {
      loadRoleUsers();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadRoleUsers]);

  if (loading) {
    return <RoleDashboardLoading />;
  }

  const growthWidth = Math.min(100, Math.max(0, stats.monthlyGrowth * 5));

  const formatWhen = (iso: string | null) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return '—';
    }
  };

  return (
    <RoleDashboardLayout title="Administrator command center" roleBadge="Supervision · all ministry portals">
      <div className="mb-8 rounded-2xl border border-[#c9a227]/25 bg-gradient-to-br from-zinc-900/90 via-black/40 to-zinc-950/90 p-6 shadow-lg shadow-black/40 sm:p-8">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-[#c9a227]/90">
          Central administration
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[#f5e6b8] sm:text-2xl">
          Monitor every portal, account footprint, and live ministry activity
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#f4e4a8]/75">
          Each row below is a dedicated portal in DMS. User counts reflect accounts assigned to that portal&apos;s
          roles. Activity is drawn from directory, events, finance, communications, pastoral care, attendance, and
          volunteer records—so you can spot momentum without opening each module.
        </p>
        {loadNote ? (
          <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-950/30 px-4 py-2 text-sm text-amber-100/90">
            {loadNote}
          </p>
        ) : null}
      </div>

      <DashboardSection title="Organization pulse">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Members on file"
            value={stats.totalMembers.toLocaleString()}
            hint={`+${stats.monthlyGrowth}% new this month`}
          />
          <StatCard
            label="Budget envelope"
            value={formatZAR(stats.totalBudget)}
            hint={`${formatZAR(stats.monthlyIncome)} recorded this month`}
          />
          <StatCard label="Attendance signal" value={`${stats.attendanceRate}%`} />
          <StatCard label="Upcoming events" value={stats.upcomingEvents} />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DataPanel title="Member momentum">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Growth index (month)</span>
                <span className="font-semibold text-emerald-400">+{stats.monthlyGrowth}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#c9a227] to-[#e8c547]"
                  style={{ width: `${growthWidth}%` }}
                />
              </div>
            </div>
          </DataPanel>
          <DataPanel title="Income pulse (month)">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Giving recorded</span>
                <span className="font-semibold text-emerald-400">{formatZAR(stats.monthlyIncome)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400" />
              </div>
            </div>
          </DataPanel>
        </div>
      </DashboardSection>

      {portals.length > 0 ? (
        <DashboardSection title="Ministry portals · accounts & status">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {portals.map((p) => {
              const hasAccounts = p.accountCount > 0;
              return (
                <div
                  key={p.id}
                  className="flex flex-col rounded-2xl border border-[#c9a227]/20 bg-zinc-950/70 p-5 shadow-md shadow-black/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-[#f5e6b8]">{p.label}</h3>
                      <p className="mt-1 text-xs leading-snug text-zinc-500">{p.description}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${
                        hasAccounts
                          ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                          : 'border border-zinc-600 bg-zinc-900 text-zinc-500'
                      }`}
                    >
                      {hasAccounts ? 'Active roster' : 'No accounts'}
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-zinc-500">Accounts</dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-[#f4e4a8]">{p.accountCount}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-zinc-500">Active</dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-[#f4e4a8]">{p.activeAccountCount}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs text-zinc-500">
                    Last account touch:{' '}
                    <span className="text-zinc-400">{formatWhen(p.lastAccountActivityAt)}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(p.path)}
                    className="mt-4 w-full rounded-lg bg-gradient-to-r from-[#e8c547] to-[#c9a227] py-2.5 text-sm font-semibold text-black shadow-md shadow-amber-900/20 transition hover:from-[#f4e4a8] hover:to-[#e8c547]"
                  >
                    Open portal
                  </button>
                </div>
              );
            })}
          </div>
        </DashboardSection>
      ) : null}

      {activity.length > 0 ? (
        <DashboardSection title="Live activity · cross-portal feed">
          <DataPanel title="Latest records (merged timeline)">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-700 text-xs uppercase tracking-wider text-zinc-500">
                    <th className="pb-3 pr-4 font-medium">When</th>
                    <th className="pb-3 pr-4 font-medium">Type</th>
                    <th className="pb-3 pr-4 font-medium">Summary</th>
                    <th className="pb-3 font-medium">Portal lens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {activity.map((row, idx) => (
                    <tr key={`${row.at}-${row.kind}-${idx}`} className="text-zinc-300">
                      <td className="whitespace-nowrap py-3 pr-4 text-xs text-zinc-500">
                        {formatWhen(row.at)}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="rounded-md border border-[#c9a227]/25 bg-[#c9a227]/10 px-2 py-0.5 text-xs text-[#e8c547]">
                          {KIND_LABELS[row.kind] || row.kind}
                        </span>
                      </td>
                      <td className="max-w-md py-3 pr-4">
                        <div className="font-medium text-[#f5e6b8]">{row.title}</div>
                        {row.detail ? <div className="mt-0.5 text-xs text-zinc-500">{row.detail}</div> : null}
                      </td>
                      <td className="py-3 text-xs text-[#c9a227]/90">{PORTAL_LABELS[row.portalId] || row.portalId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataPanel>
        </DashboardSection>
      ) : null}

      <DashboardSection title="User role management">
        <DataPanel title="Assign portal access roles">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-4xl text-sm text-zinc-500">
              Update user portal roles here. ADMIN grants and revocations are restricted to the root admin account
              configured in environment variables.
            </p>
            <button
              type="button"
              onClick={() => loadRoleUsers()}
              className="rounded-lg border border-[#c9a227]/35 px-3 py-1.5 text-xs font-semibold text-[#f4e4a8] hover:bg-[#c9a227]/10"
            >
              Refresh users
            </button>
          </div>
          {rolesLastLoadedAt ? (
            <p className="mb-4 text-xs text-zinc-500">
              Showing {roleUsers.length} users · last refreshed{' '}
              {new Date(rolesLastLoadedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </p>
          ) : null}
          {!rootAdminConfigured ? (
            <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-950/30 px-4 py-2 text-sm text-amber-100/90">
              ROOT_ADMIN_EMAIL is not configured on the server. ADMIN role changes are locked.
            </p>
          ) : null}
          {roleNote ? (
            <p className="mb-4 rounded-lg border border-[#c9a227]/25 bg-zinc-900/70 px-4 py-2 text-sm text-[#f4e4a8]">
              {roleNote}
            </p>
          ) : null}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="pb-3 pr-4 font-medium">Name</th>
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 pr-4 font-medium">Current role</th>
                  <th className="pb-3 pr-4 font-medium">New role</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {roleUsers.map((u) => {
                  const isAdminRoleTouch = u.role === 'ADMIN' || draftRoles[u.id] === 'ADMIN';
                  const adminLocked = isAdminRoleTouch && !canManageAdminRole;
                  const changed = (draftRoles[u.id] || u.role) !== u.role;
                  return (
                    <tr key={u.id}>
                      <td className="py-3 pr-4 text-zinc-200">{`${u.firstName} ${u.lastName}`}</td>
                      <td className="py-3 pr-4 text-zinc-400">{u.email}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-md border border-[#c9a227]/25 bg-[#c9a227]/10 px-2 py-0.5 text-xs text-[#e8c547]">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <select
                          value={draftRoles[u.id] || u.role}
                          onChange={(e) =>
                            setDraftRoles((prev) => ({
                              ...prev,
                              [u.id]: e.target.value,
                            }))
                          }
                          className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
                        >
                          {availableRoles.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          disabled={savingUserId === u.id || !changed || adminLocked}
                          onClick={() => saveUserRole(u)}
                          className="rounded-lg border border-[#c9a227]/35 px-3 py-1.5 text-xs font-semibold text-[#f4e4a8] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#c9a227]/10"
                        >
                          {savingUserId === u.id ? 'Saving...' : adminLocked ? 'Root admin only' : 'Save role'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DataPanel>
      </DashboardSection>

      <DashboardSection title="Shortcuts">
        <p className="mb-4 max-w-3xl text-sm text-zinc-500">
          Jump into high-traffic modules or the shared operations console for deeper work.
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <QuickActionButton onClick={() => navigate('/dashboard')}>🎛️ Operations hub</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/reporting-dashboard')}>📉 Reporting</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/members')}>👥 Members</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/events')}>📅 Events</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/financial')}>💰 Financial</QuickActionButton>
          <QuickActionButton onClick={() => navigate('/communications')}>📧 Communications</QuickActionButton>
        </div>
      </DashboardSection>
    </RoleDashboardLayout>
  );
};

export default AdminDashboard;
