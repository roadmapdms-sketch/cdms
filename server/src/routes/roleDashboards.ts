import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireRole, requireRootAdmin, AuthRequest } from '../middleware/auth';
import { FINANCE_CORE_ROLES } from '../constants/accessRoles';
import { syncUsersToMembers } from '../services/syncUsersToMembers';

const prisma = new PrismaClient();

const PASTOR_DASHBOARD_ROLES = ['ADMIN', 'PASTOR', 'STAFF'];
const VOLUNTEER_COORD_ROLES = ['ADMIN', 'VOLUNTEER_COORDINATOR'];
const MANAGEABLE_USER_ROLES = [
  'ADMIN',
  'ACCOUNTANT',
  'PASTOR',
  'STAFF',
  'VOLUNTEER_COORDINATOR',
  'MEDIA_DEPARTMENT',
  'KITCHEN_RESTAURANT',
  'MANAGEMENT',
  'USHER_MANAGEMENT',
  'PARTNERS_COORDINATOR',
  'PRAYER_LINE_COORDINATOR',
  'VOLUNTEER',
  'USER',
  'MEMBER',
] as const;

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfWeek(d = new Date()) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const n = new Date(d);
  n.setDate(diff);
  n.setHours(0, 0, 0, 0);
  return n;
}

export type AdminStatsPayload = {
  totalMembers: number;
  totalBudget: number;
  attendanceRate: number;
  upcomingEvents: number;
  monthlyGrowth: number;
  monthlyIncome: number;
};

async function loadAdminStatsPayload(): Promise<AdminStatsPayload> {
  const now = new Date();
  const monthStart = startOfMonth();
  const safeCount = async (run: () => Promise<number>) => {
    try {
      return await run();
    } catch (e) {
      console.error('Admin stats count fallback:', e);
      return 0;
    }
  };
  const safeSumAmount = async (
    run: () => Promise<{ _sum: { amount: number | null } }>
  ) => {
    try {
      const result = await run();
      return result._sum.amount ?? 0;
    } catch (e) {
      console.error('Admin stats aggregate fallback:', e);
      return 0;
    }
  };

  const [totalMembers, totalBudget, upcomingEvents, membersThisMonth, monthlyIncome, attendanceMonth] =
    await Promise.all([
      safeCount(() => prisma.member.count()),
      safeSumAmount(() => prisma.budget.aggregate({ _sum: { amount: true } })),
      safeCount(() =>
        prisma.event.count({
          where: { startDate: { gte: now }, status: { not: 'CANCELLED' } },
        })
      ),
      safeCount(() => prisma.member.count({ where: { createdAt: { gte: monthStart } } })),
      safeSumAmount(() =>
        prisma.financialRecord.aggregate({
          where: { date: { gte: monthStart } },
          _sum: { amount: true },
        })
      ),
      safeCount(() => prisma.attendance.count({ where: { checkIn: { gte: monthStart } } })),
    ]);

  const monthlyGrowth =
    totalMembers > 0 ? Math.min(100, Math.round((membersThisMonth / totalMembers) * 100)) : 0;
  const attendanceRate =
    totalMembers > 0 ? Math.min(100, Math.round((attendanceMonth / Math.max(1, totalMembers * 3)) * 100)) : 0;

  return {
    totalMembers,
    totalBudget,
    attendanceRate,
    upcomingEvents,
    monthlyGrowth,
    monthlyIncome,
  };
}

/** Ministry portals shown on the admin control center (align with client routes / roles). */
const ADMIN_PORTAL_REGISTRY: Array<{
  id: string;
  label: string;
  description: string;
  path: string;
  roles: readonly string[];
}> = [
  {
    id: 'administrator',
    label: 'Administrator',
    description: 'Full system visibility',
    path: '/admin',
    roles: ['ADMIN'],
  },
  {
    id: 'finance',
    label: 'Finance & accounting',
    description: 'Live budget, expenses, vendors, giving, budget planning, builders',
    path: '/accountant',
    roles: ['ACCOUNTANT'],
  },
  {
    id: 'pastoral',
    label: 'Pastoral leadership',
    description: 'Pastoral care, members, prayer line coverage, partners, communications',
    path: '/pastor',
    roles: ['PASTOR', 'STAFF'],
  },
  {
    id: 'volunteers',
    label: 'Volunteer coordination',
    description: 'Teams, rosters, events',
    path: '/volunteer',
    roles: ['VOLUNTEER_COORDINATOR'],
  },
  {
    id: 'media',
    label: 'Media department',
    description: 'Production, comms, AV',
    path: '/media',
    roles: ['MEDIA_DEPARTMENT'],
  },
  {
    id: 'kitchen',
    label: 'Kitchen & restaurant',
    description: 'Hospitality & inventory',
    path: '/kitchen',
    roles: ['KITCHEN_RESTAURANT'],
  },
  {
    id: 'management',
    label: 'Management',
    description: 'Leadership reporting',
    path: '/management',
    roles: ['MANAGEMENT'],
  },
  {
    id: 'ushers',
    label: 'Usher management',
    description: 'Guest experience & seating',
    path: '/ushers',
    roles: ['USHER_MANAGEMENT'],
  },
  {
    id: 'partners',
    label: 'Ministry partners',
    description: 'Covenant partners & orgs',
    path: '/ministry-partners',
    roles: ['PARTNERS_COORDINATOR'],
  },
  {
    id: 'prayer_line',
    label: 'Prayer line',
    description: 'Coverage & intercessors',
    path: '/prayer-line-portal',
    roles: ['PRAYER_LINE_COORDINATOR'],
  },
  {
    id: 'operations',
    label: 'Operations staff',
    description: 'Shared operations console',
    path: '/dashboard',
    roles: ['STAFF'],
  },
];

function summarizePortalUsers(
  users: { role: string; isActive: boolean; updatedAt: Date }[],
  roles: readonly string[]
) {
  const subset = users.filter((u) => roles.includes(u.role));
  const active = subset.filter((u) => u.isActive);
  let last = new Date(0);
  for (const u of subset) {
    if (u.updatedAt > last) last = u.updatedAt;
  }
  return {
    accountCount: subset.length,
    activeAccountCount: active.length,
    lastAccountActivityAt: subset.length ? last.toISOString() : null as string | null,
  };
}

/** /api/admin/stats */
export const adminDashboardRouter = express.Router();
adminDashboardRouter.get(
  '/stats',
  authMiddleware,
  requireRole(['ADMIN']),
  requireRootAdmin(),
  async (_req, res) => {
  try {
    res.json(await loadAdminStatsPayload());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: 'Failed to load admin stats' } });
  }
  }
);

/** /api/admin/overview — stats + portal registry with live user counts + recent cross-system activity */
adminDashboardRouter.get(
  '/overview',
  authMiddleware,
  requireRole(['ADMIN']),
  requireRootAdmin(),
  async (_req, res) => {
  try {
    const [
      stats,
      portalUsers,
      recentMembers,
      recentEvents,
      recentGiving,
      recentExpenses,
      recentComms,
      recentPastoral,
      recentAttendance,
      recentVolunteer,
    ] = await Promise.all([
      loadAdminStatsPayload(),
      prisma.user.findMany({
        select: { role: true, isActive: true, updatedAt: true },
      }),
      prisma.member.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: { firstName: true, lastName: true, createdAt: true, status: true },
      }),
      prisma.event.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: { title: true, createdAt: true, status: true, type: true },
      }),
      prisma.financialRecord.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: { description: true, type: true, amount: true, date: true, createdAt: true },
      }),
      prisma.expense.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: { description: true, category: true, amount: true, status: true, date: true, createdAt: true },
      }),
      prisma.communication.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: { subject: true, method: true, status: true, createdAt: true },
      }),
      prisma.pastoralCareRecord.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: { type: true, description: true, status: true, createdAt: true },
      }),
      prisma.attendance.findMany({
        take: 6,
        orderBy: { checkIn: 'desc' },
        select: { checkIn: true, status: true, createdAt: true },
      }),
      prisma.volunteerAssignment.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: { role: true, status: true, createdAt: true },
      }),
    ]);

    const portals = ADMIN_PORTAL_REGISTRY.map((p) => ({
      ...p,
      ...summarizePortalUsers(portalUsers, p.roles),
    }));

    type Act = {
      at: string;
      kind: string;
      title: string;
      detail: string | null;
      portalId: string;
    };
    const activity: Act[] = [];

    for (const m of recentMembers) {
      activity.push({
        at: m.createdAt.toISOString(),
        kind: 'member',
        title: `Member: ${m.firstName} ${m.lastName}`,
        detail: m.status,
        portalId: 'pastoral',
      });
    }
    for (const e of recentEvents) {
      activity.push({
        at: e.createdAt.toISOString(),
        kind: 'event',
        title: e.title,
        detail: `${e.type} · ${e.status}`,
        portalId: 'volunteers',
      });
    }
    for (const g of recentGiving) {
      activity.push({
        at: g.createdAt.toISOString(),
        kind: 'giving',
        title: g.description || `Giving (${g.type})`,
        detail: `₦${g.amount.toLocaleString()}`,
        portalId: 'finance',
      });
    }
    for (const x of recentExpenses) {
      activity.push({
        at: x.createdAt.toISOString(),
        kind: 'expense',
        title: x.description,
        detail: `${x.category} · ${x.status} · ₦${x.amount.toLocaleString()}`,
        portalId: 'finance',
      });
    }
    for (const c of recentComms) {
      activity.push({
        at: c.createdAt.toISOString(),
        kind: 'communication',
        title: c.subject,
        detail: `${c.method} · ${c.status}`,
        portalId: 'media',
      });
    }
    for (const pc of recentPastoral) {
      activity.push({
        at: pc.createdAt.toISOString(),
        kind: 'pastoral',
        title: pc.type,
        detail:
          (pc.description || '').length > 120
            ? `${(pc.description || '').slice(0, 120)}…`
            : pc.description || null,
        portalId: 'pastoral',
      });
    }
    for (const a of recentAttendance) {
      activity.push({
        at: a.checkIn.toISOString(),
        kind: 'attendance',
        title: 'Attendance check-in',
        detail: a.status,
        portalId: 'ushers',
      });
    }
    for (const v of recentVolunteer) {
      activity.push({
        at: v.createdAt.toISOString(),
        kind: 'volunteer',
        title: `Volunteer: ${v.role}`,
        detail: v.status,
        portalId: 'volunteers',
      });
    }

    activity.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    const recentActivity = activity.slice(0, 24);

    res.json({ stats, portals, recentActivity });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: 'Failed to load admin overview' } });
  }
  }
);

/** /api/admin/users/roles — list users + role assignment metadata for admin panel */
adminDashboardRouter.get(
  '/users/roles',
  authMiddleware,
  requireRole(['ADMIN']),
  async (req, res) => {
    try {
      const rootAdminEmail = (process.env.ROOT_ADMIN_EMAIL || '').trim().toLowerCase();
      const requesterEmail = (((req as AuthRequest).email || '').trim()).toLowerCase();
      const canManageAdminRole = !!rootAdminEmail && requesterEmail === rootAdminEmail;

      const users = await prisma.user.findMany({
        orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        users,
        availableRoles: MANAGEABLE_USER_ROLES,
        rootAdminConfigured: !!(process.env.ROOT_ADMIN_EMAIL || '').trim(),
        canManageAdminRole,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: { message: 'Failed to load users for role management' } });
    }
  }
);

/** /api/admin/users/:id/role — update one user role (ADMIN changes require root admin identity). */
adminDashboardRouter.patch(
  '/users/:id/role',
  authMiddleware,
  requireRole(['ADMIN']),
  requireRootAdmin(),
  async (req, res) => {
    try {
    const userId = req.params.id;
    const role = String(req.body?.role || '').trim().toUpperCase();

    if (!MANAGEABLE_USER_ROLES.includes(role as (typeof MANAGEABLE_USER_ROLES)[number])) {
      return res.status(400).json({ error: { message: 'Invalid role value.' } });
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true },
    });
    if (!target) {
      return res.status(404).json({ error: { message: 'User not found.' } });
    }

      const requester = req as AuthRequest;
    if (requester.userId === target.id && role !== 'ADMIN') {
      return res.status(400).json({
        error: { message: 'You cannot remove your own ADMIN role from this panel.' },
      });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.json({
      message: 'User role updated successfully.',
      user: updated,
    });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: { message: 'Failed to update user role' } });
    }
  }
);

/**
 * POST /api/admin/sync/users-to-members
 * One-time / maintenance: create Member rows for Users not yet in the directory.
 * Root admin only (same as role management).
 */
adminDashboardRouter.post(
  '/sync/users-to-members',
  authMiddleware,
  requireRole(['ADMIN']),
  requireRootAdmin(),
  async (_req, res) => {
    try {
      const result = await syncUsersToMembers(prisma);
      res.json({
        message: 'Sync finished.',
        created: result.created,
        skipped: result.skipped,
        errors: result.errors,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: { message: 'Failed to sync users to members' } });
    }
  }
);

/** /api/accountant/stats */
export const accountantDashboardRouter = express.Router();
accountantDashboardRouter.get(
  '/stats',
  authMiddleware,
  requireRole(FINANCE_CORE_ROLES),
  async (_req, res) => {
    try {
      const monthStart = startOfMonth();
      const [budgetSum, incomeMonth, expenseSum, pending, financialRecent, expenseRecent] =
        await Promise.all([
          prisma.budget.aggregate({ _sum: { amount: true, spent: true } }),
          prisma.financialRecord.aggregate({
            where: { date: { gte: monthStart } },
            _sum: { amount: true },
          }),
          prisma.expense.aggregate({
            where: { date: { gte: monthStart } },
            _sum: { amount: true },
          }),
          prisma.expense.count({ where: { status: 'PENDING' } }),
          prisma.financialRecord.findMany({
            take: 5,
            orderBy: { date: 'desc' },
            select: { date: true, description: true, type: true, amount: true },
          }),
          prisma.expense.findMany({
            take: 5,
            orderBy: { date: 'desc' },
            select: { date: true, description: true, category: true, amount: true, status: true },
          }),
        ]);

      const recentTransactions = [
        ...financialRecent.map((r) => ({
          date: r.date.toISOString(),
          description: r.description || r.type,
          type: `Giving (${r.type})`,
          amount: r.amount,
        })),
        ...expenseRecent.map((r) => ({
          date: r.date.toISOString(),
          description: r.description,
          type: `Expense (${r.category})`,
          amount: -r.amount,
        })),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

      res.json({
        totalBudget: budgetSum._sum.amount ?? 0,
        monthlyIncome: incomeMonth._sum.amount ?? 0,
        totalExpenses: expenseSum._sum.amount ?? 0,
        pendingApprovals: pending,
        recentTransactions,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: { message: 'Failed to load accountant stats' } });
    }
  }
);

/** /api/pastor/stats */
export const pastorDashboardRouter = express.Router();
pastorDashboardRouter.get(
  '/stats',
  authMiddleware,
  requireRole(PASTOR_DASHBOARD_ROLES),
  async (_req, res) => {
    try {
      const weekStart = startOfWeek();
      const monthStart = startOfMonth();
      const [newMembersThisWeek, attendanceMonth, totalMembers, prayerRequests, pastoralVisits, recent] =
        await Promise.all([
          prisma.member.count({ where: { createdAt: { gte: weekStart } } }),
          prisma.attendance.count({ where: { checkIn: { gte: monthStart } } }),
          prisma.member.count(),
          prisma.pastoralCareRecord.count({ where: { status: 'OPEN' } }),
          prisma.pastoralCareRecord.count(),
          prisma.pastoralCareRecord.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { member: { select: { firstName: true, lastName: true } } },
          }),
        ]);

      const attendanceRate =
        totalMembers > 0 ? Math.min(100, Math.round((attendanceMonth / Math.max(1, totalMembers * 3)) * 100)) : 0;

      res.json({
        newMembersThisWeek,
        attendanceRate,
        prayerRequests,
        pastoralVisits,
        recentPrayerRequests: recent.map((r) => ({
          member: `${r.member.firstName} ${r.member.lastName}`,
          request: r.description.slice(0, 120),
          status: r.status,
          date: r.createdAt.toISOString(),
        })),
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: { message: 'Failed to load pastor stats' } });
    }
  }
);

/** /api/volunteer/stats */
export const volunteerCoordDashboardRouter = express.Router();
volunteerCoordDashboardRouter.get(
  '/stats',
  authMiddleware,
  requireRole(VOLUNTEER_COORD_ROLES),
  async (_req, res) => {
    try {
      const now = new Date();
      const [activeVolunteers, ministries, totalMembers, upcomingEvents, assignments] =
        await Promise.all([
          prisma.volunteerAssignment.count({ where: { status: 'ACTIVE' } }),
          prisma.ministry.count({ where: { isActive: true } }),
          prisma.member.count(),
          prisma.event.count({ where: { startDate: { gte: now }, status: { not: 'CANCELLED' } } }),
          prisma.volunteerAssignment.findMany({
            where: { status: 'ACTIVE' },
            take: 8,
            include: { ministry: { select: { name: true } } },
          }),
        ]);

      const engagementRate =
        totalMembers > 0 ? Math.min(100, Math.round((activeVolunteers / totalMembers) * 100)) : 0;

      const currentOpportunities = assignments.map((a) => ({
        role: a.role,
        ministry: a.ministry?.name ?? 'General',
        urgency: 'normal',
        volunteersNeeded: 1,
      }));

      res.json({
        activeVolunteers,
        openOpportunities: ministries,
        engagementRate,
        upcomingEvents,
        currentOpportunities,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: { message: 'Failed to load volunteer coordinator stats' } });
    }
  }
);

/** /api/member — MEMBER portal */
export const memberPortalRouter = express.Router();
memberPortalRouter.get(
  '/me/dashboard',
  authMiddleware,
  requireRole(['MEMBER', 'USER', 'VOLUNTEER']),
  async (req, res) => {
    try {
      const { userId } = req as AuthRequest;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: { message: 'User not found' } });
      }

      const member = user.email
        ? await prisma.member.findFirst({ where: { email: user.email } })
        : null;

      const displayName = member
        ? `${member.firstName} ${member.lastName}`
        : `${user.firstName} ${user.lastName}`;

      const now = new Date();
      const upcomingEvents = await prisma.event.findMany({
        where: { startDate: { gte: now }, status: { not: 'CANCELLED' } },
        take: 5,
        orderBy: { startDate: 'asc' },
        select: { title: true, startDate: true },
      });

      let givingMonthly = 0;
      let givingYearly = 0;
      let attMonthly = 0;
      let attYearly = 0;

      if (member) {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const monthStart = startOfMonth();
        const [gm, gy, am, ay] = await Promise.all([
          prisma.financialRecord.aggregate({
            where: { memberId: member.id, date: { gte: monthStart } },
            _sum: { amount: true },
          }),
          prisma.financialRecord.aggregate({
            where: { memberId: member.id, date: { gte: yearStart } },
            _sum: { amount: true },
          }),
          prisma.attendance.count({
            where: { memberId: member.id, checkIn: { gte: monthStart } },
          }),
          prisma.attendance.count({
            where: { memberId: member.id, checkIn: { gte: yearStart } },
          }),
        ]);
        givingMonthly = gm._sum.amount ?? 0;
        givingYearly = gy._sum.amount ?? 0;
        attMonthly = am;
        attYearly = ay;
      }

      res.json({
        name: displayName,
        email: user.email,
        /** Directory row id (`mem_…`) when a Member exists for this login email; otherwise null. */
        memberId: member?.id ?? null,
        joinDate: user.createdAt.toISOString().slice(0, 10),
        upcomingEvents: upcomingEvents.map((e) => ({
          title: e.title,
          date: e.startDate.toISOString().slice(0, 10),
          time: e.startDate.toISOString().slice(11, 16),
        })),
        givingHistory: { monthly: givingMonthly, yearly: givingYearly },
        attendanceRecord: { monthly: attMonthly, yearly: attYearly },
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: { message: 'Failed to load member dashboard' } });
    }
  }
);
