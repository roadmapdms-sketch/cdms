import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireRole } from '../middleware/auth';
import { STAFF_MODULE_ROLES } from '../constants/accessRoles';

const router = express.Router();
const prisma = new PrismaClient();

// Health check endpoint (no authentication required)
router.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'CDMS Reports API'
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Health check failed' }
    });
  }
});

router.use(authMiddleware);
router.use(requireRole(STAFF_MODULE_ROLES));

// Get comprehensive dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    console.log('Dashboard request received:', req.query);
    const { period } = req.query;

    const where: any = {};
    if (period && period !== 'current') {
      where.date = { contains: period as string };
    }

    console.log('Where clause:', where);

    // Simplified queries to debug the issue
    const [
      totalMembers,
      totalEvents,
      upcomingEvents,
      totalExpenses,
      totalInventory,
      totalVendors
    ] = await Promise.all([
      prisma.member.count().catch(e => { console.error('Members count error:', e); return 0; }),
      prisma.event.count().catch(e => { console.error('Events count error:', e); return 0; }),
      prisma.event.count({ where: { startDate: { gte: new Date() } } }).catch(e => { console.error('Upcoming events error:', e); return 0; }),
      prisma.expense.count({ where }).catch(e => { console.error('Expenses count error:', e); return 0; }),
      prisma.inventoryItem.count().catch(e => { console.error('Inventory count error:', e); return 0; }),
      prisma.vendor.count().catch(e => { console.error('Vendor count error:', e); return 0; })
    ]);

    console.log('Basic counts completed');

    // Financial summaries
    const [totalGivingResult, totalExpensesResult] = await Promise.all([
      prisma.financialRecord.aggregate({ 
        _sum: { amount: true } 
      }).catch(e => { console.error('Financial aggregate error:', e); return { _sum: { amount: 0 } }; }),
      prisma.expense.aggregate({
        where,
        _sum: { amount: true }
      }).catch(e => { console.error('Expense aggregate error:', e); return { _sum: { amount: 0 } }; })
    ]);

    console.log('Financial summaries completed');

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    const [
      totalVolunteers,
      activeVolunteers,
      totalPastoralCare,
      openPastoralCare,
      totalCommunications,
      pendingCommunications,
      recentAttendanceCount,
      recentEvents,
    ] = await Promise.all([
      prisma.volunteerAssignment.count().catch(() => 0),
      prisma.volunteerAssignment
        .count({
          where: { status: { in: ['ACTIVE', 'ASSIGNED', 'CONFIRMED'] } },
        })
        .catch(() => 0),
      prisma.pastoralCareRecord.count().catch(() => 0),
      prisma.pastoralCareRecord.count({ where: { status: 'OPEN' } }).catch(() => 0),
      prisma.communication.count().catch(() => 0),
      prisma.communication.count({ where: { status: 'PENDING' } }).catch(() => 0),
      prisma.attendance.count({ where: { checkIn: { gte: weekStart } } }).catch(() => 0),
      prisma.event
        .findMany({
          where: { startDate: { gte: now }, status: { not: 'CANCELLED' } },
          orderBy: { startDate: 'asc' },
          take: 6,
          select: { id: true, title: true, startDate: true, type: true, status: true },
        })
        .catch(() => [] as { id: string; title: string; startDate: Date; type: string; status: string }[]),
    ]);

    const volunteerEngagementRate =
      totalMembers > 0
        ? `${Math.min(100, Math.round((activeVolunteers / Math.max(1, totalMembers)) * 100)).toFixed(1)}%`
        : '0%';

    const response = {
      overview: {
        totalMembers,
        activeMembers: totalMembers, // All members are considered active in this schema
        memberEngagementRate: totalMembers > 0 ? '100.0%' : '0%',
        totalEvents,
        upcomingEvents,
        totalVolunteers,
        activeVolunteers,
        volunteerEngagementRate,
      },
      financial: {
        totalGiving: totalGivingResult._sum.amount || 0,
        totalExpenses: totalExpensesResult._sum.amount || 0,
        totalBudget: 0,
        totalSpent: 0,
        budgetUtilizationRate: '0%',
        pendingExpenses: 0,
      },
      operations: {
        totalInventory,
        availableInventory: totalInventory,
        inventoryAvailabilityRate: totalInventory > 0 ? '100.0%' : '0%',
        totalVendors,
        activeVendors: totalVendors,
        vendorActivationRate: totalVendors > 0 ? '100.0%' : '0%',
        totalPastoralCare,
        openPastoralCare,
        totalCommunications,
        pendingCommunications,
        recentAttendanceCount,
      },
      recentEvents: recentEvents.map((e) => ({
        id: e.id,
        title: e.title,
        startDate: e.startDate.toISOString(),
        type: e.type,
        status: e.status,
      })),
    };

    console.log('Dashboard response prepared');
    res.json(response);
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch dashboard statistics', details: error.message }
    });
  }
});

// Get member statistics report
router.get('/members', async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
      if (dateTo) where.createdAt.lte = new Date(dateTo as string);
    }

    const [
      totalMembers,
      newMembers,
      membersByStatus,
      recentMembers
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where }),
      prisma.member.groupBy({
        by: ['status'],
        where,
        _count: true
      }),
      prisma.member.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true
        }
      })
    ]);

    const growthRate = newMembers > 0 ? ((newMembers / totalMembers) * 100).toFixed(1) : '0';

    res.json({
      summary: {
        totalMembers,
        activeMembers: totalMembers, // All members are active in this schema
        newMembers,
        growthRate: `${growthRate}%`
      },
      byStatus: membersByStatus.map((item: any) => ({
        status: item.status,
        count: item._count
      })),
      recentMembers
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch member report' }
    });
  }
});

// Get financial summary report
router.get('/financial', async (req, res) => {
  try {
    const { dateFrom, dateTo, category } = req.query;

    const where: any = {};
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom as string);
      if (dateTo) where.date.lte = new Date(dateTo as string);
    }
    if (category) {
      where.category = category;
    }

    const [
      totalExpenses,
      totalContributions,
      expensesByCategory,
      expensesByStatus,
      budgetSummary,
      recentTransactions
    ] = await Promise.all([
      prisma.expense.aggregate({
        where,
        _sum: { amount: true },
        _count: true
      }),
      prisma.financialRecord.aggregate({
        where,
        _sum: { amount: true },
        _count: true
      }),
      prisma.expense.groupBy({
        by: ['category'],
        where,
        _sum: { amount: true },
        _count: true
      }),
      prisma.expense.groupBy({
        by: ['status'],
        where,
        _count: true
      }),
      prisma.budget.aggregate({
        where,
        _sum: { amount: true },
        _count: true
      }),
      prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        take: 10,
        select: {
          id: true,
          description: true,
          amount: true,
          category: true,
          status: true,
          date: true,
          vendor: true
        }
      })
    ]);

    const netIncome = (totalContributions._sum.amount || 0) - (totalExpenses._sum.amount || 0);
    const budgetUtilization = budgetSummary._sum.amount ? 
      ((budgetSummary._sum.amount / budgetSummary._sum.amount) * 100).toFixed(1) : '0';

    res.json({
      summary: {
        totalIncome: totalContributions._sum.amount || 0,
        totalExpenses: totalExpenses._sum.amount || 0,
        netIncome,
        budgetUtilizationRate: `${budgetUtilization}%`,
        totalTransactions: (totalExpenses._count || 0) + (totalContributions._count || 0)
      },
      expensesByCategory: expensesByCategory.map((item: any) => ({
        category: item.category,
        amount: item._sum.amount || 0,
        count: item._count
      })),
      expensesByStatus: expensesByStatus.map((item: any) => ({
        status: item.status,
        count: item._count
      })),
      budget: {
        totalAllocated: budgetSummary._sum.amount || 0,
        remaining: 0 // Simplified for now
      },
      recentTransactions
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch financial report' }
    });
  }
});

// Get attendance report
router.get('/attendance', async (req, res) => {
  try {
    const { dateFrom, dateTo, eventId } = req.query;

    const where: any = {};
    if (dateFrom || dateTo) {
      where.checkIn = {};
      if (dateFrom) where.checkIn.gte = new Date(dateFrom as string);
      if (dateTo) where.checkIn.lte = new Date(dateTo as string);
    }
    if (eventId) {
      where.eventId = eventId;
    }

    const [
      totalAttendances,
      uniqueAttendees,
      attendanceByEvent,
      attendanceTrends
    ] = await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.groupBy({
        by: ['memberId'],
        where,
        _count: true
      }),
      prisma.attendance.groupBy({
        by: ['eventId'],
        where,
        _count: true
      }),
      prisma.attendance.findMany({
        where,
        orderBy: { checkIn: 'desc' },
        take: 20,
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      })
    ]);

    const averageAttendance = attendanceByEvent.length > 0 ? 
      (attendanceByEvent.reduce((sum: number, item: any) => sum + item._count, 0) / attendanceByEvent.length).toFixed(1) : '0';

    res.json({
      summary: {
        totalAttendances,
        uniqueAttendees: uniqueAttendees.length,
        averageAttendance,
        eventsWithAttendance: attendanceByEvent.length
      },
      byEvent: attendanceByEvent.map((item: any) => ({
        eventId: item.eventId,
        attendanceCount: item._count
      })),
      trends: attendanceTrends
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch attendance report' }
    });
  }
});

// Get volunteer report
router.get('/volunteers', async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const where: any = {};
    if (dateFrom || dateTo) {
      where.startDate = {};
      if (dateFrom) where.startDate.gte = new Date(dateFrom as string);
      if (dateTo) where.startDate.lte = new Date(dateTo as string);
    }

    const [
      totalVolunteers,
      activeVolunteers,
      volunteersByStatus,
      recentVolunteers
    ] = await Promise.all([
      prisma.volunteerAssignment.count({ where }),
      prisma.volunteerAssignment.count({ where: { ...where, status: 'ASSIGNED' } }),
      prisma.volunteerAssignment.groupBy({
        by: ['status'],
        where,
        _count: true
      }),
      prisma.volunteerAssignment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        }
      })
    ]);

    const engagementRate = totalVolunteers > 0 ? ((activeVolunteers / totalVolunteers) * 100).toFixed(1) : '0';

    res.json({
      summary: {
        totalVolunteers,
        activeVolunteers,
        engagementRate: `${engagementRate}%`
      },
      byStatus: volunteersByStatus.map((item: any) => ({
        status: item.status,
        count: item._count
      })),
      recentVolunteers: recentVolunteers.map((item: any) => ({
        id: item.id,
        firstName: item.member.firstName,
        lastName: item.member.lastName,
        email: item.member.email,
        phone: item.member.phone,
        status: item.status,
        createdAt: item.createdAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch volunteer report' }
    });
  }
});

// Get inventory report
router.get('/inventory', async (req, res) => {
  try {
    const { category, status, condition } = req.query;

    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (condition) where.condition = condition;

    const [
      totalItems,
      itemsByCategory,
      itemsByStatus,
      itemsByCondition,
      totalValue,
      recentCheckouts,
      lowStockItems
    ] = await Promise.all([
      prisma.inventoryItem.count({ where }),
      prisma.inventoryItem.groupBy({
        by: ['category'],
        where,
        _count: true
      }),
      prisma.inventoryItem.groupBy({
        by: ['status'],
        where,
        _count: true
      }),
      prisma.inventoryItem.groupBy({
        by: ['condition'],
        where,
        _count: true
      }),
      prisma.inventoryItem.aggregate({
        where,
        _sum: { currentValue: true }
      }),
      prisma.inventoryCheckout.findMany({
        where: { returnDate: null },
        orderBy: { checkOutDate: 'desc' },
        take: 10,
        include: {
          item: {
            select: {
              id: true,
              name: true,
              category: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.inventoryItem.findMany({
        where: { quantity: { lte: 5 } },
        orderBy: { quantity: 'asc' },
        take: 10
      })
    ]);

    const availabilityRate = totalItems > 0 ? 
      ((itemsByStatus.find((item: any) => item.status === 'AVAILABLE')?._count || 0) / totalItems * 100).toFixed(1) : '0';

    res.json({
      summary: {
        totalItems,
        availabilityRate: `${availabilityRate}%`,
        totalValue: totalValue._sum.currentValue || 0,
        checkedOutItems: recentCheckouts.length,
        lowStockItems: lowStockItems.length
      },
      byCategory: itemsByCategory.map((item: any) => ({
        category: item.category,
        count: item._count
      })),
      byStatus: itemsByStatus.map((item: any) => ({
        status: item.status,
        count: item._count
      })),
      byCondition: itemsByCondition.map((item: any) => ({
        condition: item.condition,
        count: item._count
      })),
      recentCheckouts,
      lowStockItems
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch inventory report' }
    });
  }
});

// Get custom report
router.post('/custom', async (req, res) => {
  try {
    const { reportType, dateFrom, dateTo, filters } = req.body;

    // This is a placeholder for custom report generation
    // In a real implementation, this would dynamically generate reports based on parameters
    res.json({
      message: 'Custom report generation',
      reportType,
      dateFrom,
      dateTo,
      filters,
      data: []
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to generate custom report' }
    });
  }
});

// Get events report
router.get('/events', async (req, res) => {
  try {
    const { dateFrom, dateTo, status } = req.query;

    const where: any = {};
    if (dateFrom || dateTo) {
      where.startDate = {};
      if (dateFrom) where.startDate.gte = new Date(dateFrom as string);
      if (dateTo) where.startDate.lte = new Date(dateTo as string);
    }
    if (status) {
      where.status = status;
    }

    const [
      totalEvents,
      eventsByStatus,
      eventsByType,
      upcomingEvents
    ] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.groupBy({
        by: ['status'],
        where,
        _count: true
      }),
      prisma.event.groupBy({
        by: ['type'],
        where,
        _count: true
      }),
      prisma.event.findMany({
        where: {
          ...where,
          status: 'PLANNED',
          startDate: { gte: new Date() }
        },
        orderBy: { startDate: 'asc' },
        take: 5
      })
    ]);

    res.json({
      summary: {
        totalEvents,
        upcomingEvents: upcomingEvents.length,
        averageAttendance: '0' // Placeholder
      },
      byStatus: eventsByStatus.map(item => ({
        status: item.status,
        count: item._count
      })),
      byType: eventsByType.map(item => ({
        type: item.type,
        count: item._count
      })),
      upcoming: upcomingEvents
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to generate events report' }
    });
  }
});

export default router;
