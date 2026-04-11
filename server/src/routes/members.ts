import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireRole } from '../middleware/auth';
import { STAFF_MODULE_ROLES } from '../constants/accessRoles';
import { generateMemberId } from '../utils/memberId';

const router = express.Router();
const prisma = new PrismaClient();

/** Tries family include + createdAt order, then plain list, then id order (legacy DBs missing usable createdAt). */
async function findMembersPage(where: Record<string, unknown>, skip: number, take: number): Promise<any[]> {
  const w = where as any;
  const strategies: Array<() => Promise<any[]>> = [
    () =>
      prisma.member.findMany({
        where: w,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          family: { include: { family: true } },
        },
      }),
    () =>
      prisma.member.findMany({
        where: w,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
    () =>
      prisma.member.findMany({
        where: w,
        skip,
        take,
        orderBy: { id: 'asc' },
      }),
  ];
  let last: unknown;
  for (const run of strategies) {
    try {
      return await run();
    } catch (e) {
      last = e;
      console.warn('Members list query strategy failed; retrying with a simpler query.', e);
    }
  }
  throw last;
}

router.use(authMiddleware);
router.use(requireRole(STAFF_MODULE_ROLES));

// Registered before `/:id` so paths like `/stats/...` are never treated as an id segment.
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      membersByStatus
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { status: 'ACTIVE' } }),
      prisma.member.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.member.groupBy({
        by: ['status'],
        _count: true
      })
    ]);

    res.json({
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      membersByStatus: membersByStatus.map(item => ({
        status: item.status,
        count: item._count
      }))
    });
  } catch (error: any) {
    console.error('Get member stats error:', error);
    res.status(500).json({ 
      error: { message: 'Internal server error' } 
    });
  }
});

// Get all members with pagination and search
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (status) {
      where.status = status;
    }

    const total = await prisma.member.count({ where });
    const members = await findMembersPage(where, skip, limit);

    res.json({
      members,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Get members error:', error);
    res.status(500).json({ 
      error: { message: 'Internal server error' } 
    });
  }
});

// Get single member by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        family: {
          include: {
            family: {
              include: {
                members: {
                  include: {
                    member: true
                  }
                }
              }
            }
          }
        },
        attendance: {
          orderBy: { checkIn: 'desc' },
          take: 10
        },
        financialRecords: {
          orderBy: { date: 'desc' },
          take: 10
        },
        spiritualMilestones: {
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!member) {
      return res.status(404).json({ 
        error: { message: 'Member not found' } 
      });
    }

    res.json({ member });
  } catch (error: any) {
    console.error('Get member error:', error);
    res.status(500).json({ 
      error: { message: 'Internal server error' } 
    });
  }
});

// Create new member
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      maritalStatus,
      address,
      city,
      state,
      zipCode,
      country,
      membershipDate,
      photo,
      notes
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({ 
        error: { message: 'First name and last name are required' } 
      });
    }

    // Check if email already exists
    if (email) {
      const existingMember = await prisma.member.findUnique({
        where: { email }
      });

      if (existingMember) {
        return res.status(400).json({ 
          error: { message: 'Email already exists' } 
        });
      }
    }

    const member = await prisma.member.create({
      data: {
        id: generateMemberId(),
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        maritalStatus,
        address,
        city,
        state,
        zipCode,
        country,
        membershipDate: membershipDate ? new Date(membershipDate) : null,
        photo,
        notes
      }
    });

    res.status(201).json({
      message: 'Member created successfully',
      member
    });
  } catch (error: any) {
    console.error('Create member error:', error);
    res.status(500).json({ 
      error: { message: 'Internal server error' } 
    });
  }
});

// Update member
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      maritalStatus,
      address,
      city,
      state,
      zipCode,
      country,
      membershipDate,
      status,
      photo,
      notes
    } = req.body;

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id }
    });

    if (!existingMember) {
      return res.status(404).json({ 
        error: { message: 'Member not found' } 
      });
    }

    // Check if email already exists (excluding current member)
    if (email && email !== existingMember.email) {
      const emailExists = await prisma.member.findUnique({
        where: { email }
      });

      if (emailExists) {
        return res.status(400).json({ 
          error: { message: 'Email already exists' } 
        });
      }
    }

    const member = await prisma.member.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        maritalStatus,
        address,
        city,
        state,
        zipCode,
        country,
        membershipDate: membershipDate ? new Date(membershipDate) : null,
        status,
        photo,
        notes
      }
    });

    res.json({
      message: 'Member updated successfully',
      member
    });
  } catch (error: any) {
    console.error('Update member error:', error);
    res.status(500).json({ 
      error: { message: 'Internal server error' } 
    });
  }
});

// Delete member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id }
    });

    if (!existingMember) {
      return res.status(404).json({ 
        error: { message: 'Member not found' } 
      });
    }

    // Delete member (cascade will handle related records)
    await prisma.member.delete({
      where: { id }
    });

    res.json({
      message: 'Member deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete member error:', error);
    res.status(500).json({ 
      error: { message: 'Internal server error' } 
    });
  }
});

export default router;
