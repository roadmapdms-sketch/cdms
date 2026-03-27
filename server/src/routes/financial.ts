import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// All financial routes will be protected
router.use(authMiddleware);

// Get financial records with pagination and filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      memberId,
      type,
      paymentMethod,
      status,
      dateFrom,
      dateTo
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (memberId) {
      where.memberId = memberId;
    }
    if (type) {
      where.type = type;
    }
    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }
    if (status) {
      where.status = status;
    }
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo as string);
      }
    }

    const [financialRecords, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.financialRecord.count({ where })
    ]);

    const pages = Math.ceil(total / Number(limit));

    res.json({
      financialRecords,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch financial records' }
    });
  }
});

// Get single financial record
router.get('/:id', async (req, res) => {
  try {
    const financialRecord = await prisma.financialRecord.findUnique({
      where: { id: req.params.id },
      include: {
        member: true,
        user: true
      }
    });

    if (!financialRecord) {
      return res.status(404).json({ 
        error: { message: 'Financial record not found' }
      });
    }

    res.json(financialRecord);
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch financial record' }
    });
  }
});

// Create new financial record
router.post('/', async (req, res) => {
  try {
    const {
      memberId,
      type,
      amount,
      paymentMethod,
      description,
      reference,
      date,
      status = 'RECORDED'
    } = req.body;

    // Validate required fields
    if (!type || !amount || !date) {
      return res.status(400).json({ 
        error: { message: 'Type, amount, and date are required' }
      });
    }

    // Validate financial type
    const validTypes = ['TITHE', 'OFFERING', 'DONATION', 'FEE', 'EXPENSE', 'REFUND'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: { message: 'Invalid financial type' }
      });
    }

    // Validate payment method
    const validPaymentMethods = ['CASH', 'CHECK', 'CREDIT_CARD', 'BANK_TRANSFER', 'ONLINE', 'OTHER'];
    if (paymentMethod && !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ 
        error: { message: 'Invalid payment method' }
      });
    }

    // If memberId is provided, check if member exists
    if (memberId) {
      const member = await prisma.member.findUnique({
        where: { id: memberId }
      });

      if (!member) {
        return res.status(400).json({ 
          error: { message: 'Member not found' }
        });
      }
    }

    const financialRecord = await prisma.financialRecord.create({
      data: {
        memberId,
        userId: (req as any).userId, // Get user from auth middleware
        type,
        amount: Number(amount),
        paymentMethod,
        description,
        reference,
        date: new Date(date),
        status
      },
      include: {
        member: true,
        user: true
      }
    });

    res.status(201).json(financialRecord);
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to create financial record' }
    });
  }
});

// Update financial record
router.put('/:id', async (req, res) => {
  try {
    const { type, amount, paymentMethod, description, reference, date, status } = req.body;

    const financialRecord = await prisma.financialRecord.update({
      where: { id: req.params.id },
      data: {
        ...(type && { type }),
        ...(amount && { amount: Number(amount) }),
        ...(paymentMethod && { paymentMethod }),
        ...(description && { description }),
        ...(reference && { reference }),
        ...(date && { date: new Date(date) }),
        ...(status && { status })
      },
      include: {
        member: true,
        user: true
      }
    });

    res.json(financialRecord);
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to update financial record' }
    });
  }
});

// Delete financial record
router.delete('/:id', async (req, res) => {
  try {
    await prisma.financialRecord.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Financial record deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to delete financial record' }
    });
  }
});

// Get financial statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const { dateFrom, dateTo, type, memberId } = req.query;

    const where: any = {};

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo as string);
      }
    }
    if (type) {
      where.type = type;
    }
    if (memberId) {
      where.memberId = memberId;
    }

    const [
      totalRecords,
      totalIncome,
      totalExpenses,
      tithes,
      offerings,
      donations,
      fees
    ] = await Promise.all([
      prisma.financialRecord.count({ where }),
      prisma.financialRecord.aggregate({
        where: { ...where, type: { in: ['TITHE', 'OFFERING', 'DONATION'] } },
        _sum: { amount: true }
      }),
      prisma.financialRecord.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true }
      }),
      prisma.financialRecord.aggregate({
        where: { ...where, type: 'TITHE' },
        _sum: { amount: true }
      }),
      prisma.financialRecord.aggregate({
        where: { ...where, type: 'OFFERING' },
        _sum: { amount: true }
      }),
      prisma.financialRecord.aggregate({
        where: { ...where, type: 'DONATION' },
        _sum: { amount: true }
      }),
      prisma.financialRecord.aggregate({
        where: { ...where, type: 'FEE' },
        _sum: { amount: true }
      })
    ]);

    const netIncome = (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0);

    res.json({
      totalRecords,
      totalIncome: totalIncome._sum.amount || 0,
      totalExpenses: totalExpenses._sum.amount || 0,
      netIncome,
      breakdown: {
        tithes: tithes._sum.amount || 0,
        offerings: offerings._sum.amount || 0,
        donations: donations._sum.amount || 0,
        fees: fees._sum.amount || 0
      },
      period: {
        from: dateFrom || null,
        to: dateTo || null
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch financial statistics' }
    });
  }
});

// Get monthly financial trends
router.get('/stats/monthly', async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const monthlyData = await Promise.all(
      Array.from({ length: 12 }, (_, month) => {
        const startDate = new Date(Number(year), month, 1);
        const endDate = new Date(Number(year), month + 1, 0, 23, 59, 59, 999);

        return prisma.financialRecord.aggregate({
          where: {
            date: {
              gte: startDate,
              lte: endDate
            }
          },
          _sum: { amount: true },
          _count: { id: true }
        });
      })
    );

    const formattedData = monthlyData.map((data, index) => ({
      month: new Date(Number(year), index).toLocaleDateString('default', { month: 'short' }),
      income: data._sum.amount || 0,
      transactions: data._count.id || 0
    }));

    res.json({
      year: Number(year),
      data: formattedData
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch monthly financial trends' }
    });
  }
});

// Get top donors
router.get('/stats/top-donors', async (req, res) => {
  try {
    const { limit = 10, dateFrom, dateTo } = req.query;

    const where: any = {
      type: { in: ['TITHE', 'OFFERING', 'DONATION'] }
    };

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo as string);
      }
    }

    const topDonors = await prisma.financialRecord.groupBy({
      by: ['memberId'],
      where,
      _sum: { amount: true },
      _count: { id: true },
      orderBy: {
        _sum: { amount: 'desc' }
      },
      take: Number(limit)
    });

    // Get member details for each donor
    const donorsWithDetails = await Promise.all(
      topDonors.map(async (donor) => {
        if (!donor.memberId) return null;

        const member = await prisma.member.findUnique({
          where: { id: donor.memberId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        });

        return {
          member,
          totalAmount: donor._sum.amount || 0,
          transactionCount: donor._count.id || 0
        };
      })
    );

    res.json({
      donors: donorsWithDetails.filter(Boolean),
      period: {
        from: dateFrom || null,
        to: dateTo || null
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch top donors' }
    });
  }
});

// Generate financial report
router.post('/reports/generate', async (req, res) => {
  try {
    const { type, dateFrom, dateTo, format = 'JSON' } = req.body;

    const where: any = {};

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo);
      }
    }

    if (type && type !== 'ALL') {
      where.type = type;
    }

    const records = await prisma.financialRecord.findMany({
      where,
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    if (format === 'CSV') {
      // Generate CSV format
      const csvHeader = 'Date,Type,Member,Amount,Payment Method,Description,Status\n';
      const csvData = records.map(record => 
        `${record.date.toISOString()},${record.type},${record.member ? `${record.member.firstName} ${record.member.lastName}` : 'N/A'},${record.amount},${record.paymentMethod || 'N/A'},"${record.description || ''}",${record.status}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=financial-report.csv');
      res.send(csvHeader + csvData);
    } else {
      res.json({
        report: {
          type: type || 'ALL',
          period: { dateFrom, dateTo },
          records,
          generatedAt: new Date().toISOString()
        }
      });
    }
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to generate financial report' }
    });
  }
});

export default router;
