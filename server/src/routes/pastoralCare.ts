import express from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { authMiddleware, requireRole } from '../middleware/auth';
import { STAFF_MODULE_ROLES } from '../constants/accessRoles';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);
router.use(requireRole(STAFF_MODULE_ROLES));

// Get pastoral care records with pagination and filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,
      memberId,
      dateFrom,
      dateTo
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { description: { contains: search as string, mode: 'insensitive' } },
        { notes: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }
    if (memberId) {
      where.memberId = memberId;
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo as string);
      }
    }

    let records: any[] = [];
    let total = 0;

    try {
      [records, total] = await Promise.all([
        prisma.pastoralCareRecord.findMany({
          where,
          include: {
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            },
            user: {
              select: {
                id: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.pastoralCareRecord.count({ where })
      ]);
    } catch (queryError: any) {
      // Legacy databases can still have old camelCase/lowercase column mismatches.
      // Fall back to a minimal query so the records page remains usable.
      if (queryError?.code !== 'P2022') {
        throw queryError;
      }

      if (status && status !== 'OPEN') {
        records = [];
        total = 0;
      } else {
        const legacyConditions: Prisma.Sql[] = [];

        if (search) {
          const searchTerm = `%${String(search)}%`;
          legacyConditions.push(
            Prisma.sql`(
              COALESCE(reason, '') ILIKE ${searchTerm}
              OR COALESCE(details, '') ILIKE ${searchTerm}
              OR COALESCE(outcome, '') ILIKE ${searchTerm}
            )`
          );
        }

        if (type) {
          legacyConditions.push(Prisma.sql`caretype = ${String(type)}`);
        }

        if (memberId) {
          legacyConditions.push(Prisma.sql`memberid = ${String(memberId)}`);
        }

        if (dateFrom) {
          legacyConditions.push(Prisma.sql`createdat >= ${new Date(String(dateFrom))}`);
        }

        if (dateTo) {
          legacyConditions.push(Prisma.sql`createdat <= ${new Date(String(dateTo))}`);
        }

        const whereClause = legacyConditions.length
          ? Prisma.sql`WHERE ${Prisma.join(legacyConditions, ' AND ')}`
          : Prisma.sql``;

        const legacyRecordsPromise = prisma.$queryRaw<any[]>(Prisma.sql`
          SELECT
            id,
            memberid AS "memberId",
            pastorid AS "userId",
            caretype AS "type",
            COALESCE(details, reason, '') AS "description",
            'OPEN'::text AS "status",
            followupdate AS "followUpDate",
            outcome AS "notes",
            createdat AS "createdAt",
            createdat AS "updatedAt"
          FROM pastoral_care_records
          ${whereClause}
          ORDER BY createdat DESC
          OFFSET ${skip}
          LIMIT ${Number(limit)}
        `);

        const legacyCountPromise = prisma.$queryRaw<Array<{ count: bigint | number }>>(Prisma.sql`
          SELECT COUNT(*)::bigint AS count
          FROM pastoral_care_records
          ${whereClause}
        `);

        const [legacyRecords, legacyCountRows] = await Promise.all([legacyRecordsPromise, legacyCountPromise]);
        records = legacyRecords;
        total = Number(legacyCountRows[0]?.count ?? 0);
      }
    }

    const pages = Math.ceil(total / Number(limit));

    res.json({
      records,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch pastoral care records' }
    });
  }
});

// Create new pastoral care record
router.post('/', async (req, res) => {
  try {
    const {
      memberId,
      type,
      description,
      status = 'OPEN',
      followUpDate,
      notes
    } = req.body;

    // Validate required fields
    if (!memberId || !type || !description) {
      return res.status(400).json({ 
        error: { message: 'Member ID, type, and description are required' }
      });
    }

    // Validate care type
    const validTypes = ['VISIT', 'CALL', 'COUNSELING', 'PRAYER', 'SUPPORT', 'INTERVENTION', 'OTHER'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: { message: 'Invalid pastoral care type' }
      });
    }

    // Validate status
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: { message: 'Invalid pastoral care status' }
      });
    }

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      return res.status(400).json({ 
        error: { message: 'Member not found' }
      });
    }

    const record = await prisma.pastoralCareRecord.create({
      data: {
        memberId,
        type,
        description,
        status,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        notes,
        userId: (req as any).user.id
      },
      include: {
        member: true,
        user: {
          select: {
            id: true
          }
        }
      }
    });

    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to create pastoral care record' }
    });
  }
});

// Update pastoral care record
router.put('/:id', async (req, res) => {
  try {
    const {
      type,
      description,
      status,
      followUpDate,
      notes
    } = req.body;

    const record = await prisma.pastoralCareRecord.update({
      where: { id: req.params.id },
      data: {
        ...(type && { type }),
        ...(description && { description }),
        ...(status && { status }),
        ...(followUpDate && { followUpDate: new Date(followUpDate) }),
        ...(notes && { notes })
      },
      include: {
        member: true,
        user: {
          select: {
            id: true
          }
        }
      }
    });

    res.json(record);
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to update pastoral care record' }
    });
  }
});

// Delete pastoral care record
router.delete('/:id', async (req, res) => {
  try {
    await prisma.pastoralCareRecord.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Pastoral care record deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to delete pastoral care record' }
    });
  }
});

// Get pastoral care statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const { dateFrom, dateTo, memberId } = req.query;

    const where: any = {};

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo as string);
      }
    }
    if (memberId) {
      where.memberId = memberId;
    }

    const [
      totalRecords,
      open,
      inProgress,
      completed,
      closed,
      visits,
      calls,
      counseling,
      prayers,
      support,
      interventions
    ] = await Promise.all([
      prisma.pastoralCareRecord.count({ where }),
      prisma.pastoralCareRecord.count({ where: { ...where, status: 'OPEN' } }),
      prisma.pastoralCareRecord.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.pastoralCareRecord.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.pastoralCareRecord.count({ where: { ...where, status: 'CLOSED' } }),
      prisma.pastoralCareRecord.count({ where: { ...where, type: 'VISIT' } }),
      prisma.pastoralCareRecord.count({ where: { ...where, type: 'CALL' } }),
      prisma.pastoralCareRecord.count({ where: { ...where, type: 'COUNSELING' } }),
      prisma.pastoralCareRecord.count({ where: { ...where, type: 'PRAYER' } }),
      prisma.pastoralCareRecord.count({ where: { ...where, type: 'SUPPORT' } }),
      prisma.pastoralCareRecord.count({ where: { ...where, type: 'INTERVENTION' } })
    ]);

    const completionRate = totalRecords > 0 ? (((completed + closed) / totalRecords) * 100).toFixed(1) : '0';

    res.json({
      totalRecords,
      open,
      inProgress,
      completed,
      closed,
      completionRate: `${completionRate}%`,
      breakdown: {
        visits,
        calls,
        counseling,
        prayers,
        support,
        interventions
      },
      period: {
        from: dateFrom || null,
        to: dateTo || null
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch pastoral care statistics' }
    });
  }
});

// Get members needing follow-up
router.get('/follow-ups', async (req, res) => {
  try {
    const records = await prisma.pastoralCareRecord.findMany({
      where: {
        status: {
          in: ['OPEN', 'IN_PROGRESS']
        },
        OR: [
          {
            followUpDate: {
              lte: new Date()
            }
          },
          {
            followUpDate: null
          }
        ]
      },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        user: {
          select: {
            id: true
          }
        }
      },
      orderBy: { followUpDate: 'asc' }
    });

    res.json({ records });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch follow-up records' }
    });
  }
});

// Bulk update pastoral care records
router.post('/bulk-update', async (req, res) => {
  try {
    const { recordIds, updates } = req.body;

    if (!recordIds || !Array.isArray(recordIds) || !updates) {
      return res.status(400).json({ 
        error: { message: 'Record IDs array and updates object are required' }
      });
    }

    const results = await Promise.all(
      recordIds.map(async (recordId: string) => {
        try {
          const record = await prisma.pastoralCareRecord.update({
            where: { id: recordId },
            data: updates
          });

          return {
            recordId,
            success: true,
            record
          };
        } catch (error) {
          return {
            recordId,
            success: false,
            error: 'Failed to update record'
          };
        }
      })
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({
      message: `Bulk update completed: ${successful} successful, ${failed} failed`,
      results
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to process bulk update' }
    });
  }
});

// Get single pastoral care record
router.get('/:id', async (req, res) => {
  try {
    const record = await prisma.pastoralCareRecord.findUnique({
      where: { id: req.params.id },
      include: {
        member: true,
        user: {
          select: {
            id: true
          }
        }
      }
    });

    if (!record) {
      return res.status(404).json({ 
        error: { message: 'Pastoral care record not found' }
      });
    }

    res.json(record);
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch pastoral care record' }
    });
  }
});

export default router;
