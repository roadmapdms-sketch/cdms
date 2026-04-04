import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';
import { FINANCE_CORE_ROLES } from '../constants/accessRoles';

const prisma = new PrismaClient();

const PASTOR_DASHBOARD_ROLES = ['ADMIN', 'PASTOR', 'STAFF'];
const VOLUNTEER_COORD_ROLES = ['ADMIN', 'VOLUNTEER_COORDINATOR'];

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

/** /api/admin/stats */
export const adminDashboardRouter = express.Router();
adminDashboardRouter.get('/stats', authMiddleware, requireRole(['ADMIN']), async (_req, res) => {
  try {
    const now = new Date();
    const monthStart = startOfMonth();
    const [
      totalMembers,
      budgetSum,
      upcomingEvents,
      membersThisMonth,
      incomeMonth,
      attendanceMonth,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.budget.aggregate({ _sum: { amount: true } }),
      prisma.event.count({
        where: { startDate: { gte: now }, status: { not: 'CANCELLED' } },
      }),
      prisma.member.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.financialRecord.aggregate({
        where: { date: { gte: monthStart } },
        _sum: { amount: true },
      }),
      prisma.attendance.count({ where: { checkIn: { gte: monthStart } } }),
    ]);

    const monthlyGrowth =
      totalMembers > 0 ? Math.min(100, Math.round((membersThisMonth / totalMembers) * 100)) : 0;
    const attendanceRate =
      totalMembers > 0 ? Math.min(100, Math.round((attendanceMonth / Math.max(1, totalMembers * 3)) * 100)) : 0;

    res.json({
      totalMembers,
      totalBudget: budgetSum._sum.amount ?? 0,
      attendanceRate,
      upcomingEvents,
      monthlyGrowth,
      monthlyIncome: incomeMonth._sum.amount ?? 0,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: 'Failed to load admin stats' } });
  }
});

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
  requireRole(['MEMBER']),
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
