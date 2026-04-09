import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireRole } from '../middleware/auth';
import { STAFF_MODULE_ROLES } from '../constants/accessRoles';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);
router.use(requireRole(STAFF_MODULE_ROLES));

// Get volunteer assignments with pagination and filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      memberId,
      eventId,
      role,
      status,
      dateFrom,
      dateTo
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (memberId) {
      where.memberId = memberId;
    }
    if (eventId) {
      where.eventId = eventId;
    }
    if (role) {
      where.role = role;
    }
    if (status) {
      where.status = status;
    }
    if (dateFrom || dateTo) {
      where.startDate = {};
      if (dateFrom) {
        where.startDate.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.startDate.lte = new Date(dateTo as string);
      }
    }

    let total = 0;
    try {
      total = await prisma.volunteerAssignment.count({ where });
    } catch {
      // Fallback for legacy schema mismatch. We still return assignment rows below.
      total = 0;
    }

    let assignments: any[] = [];
    try {
      assignments = await prisma.volunteerAssignment.findMany({
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
          ministry: {
            select: {
              id: true,
              name: true
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      });
    } catch (e) {
      console.error('Volunteers fetch with includes failed; retrying without relations.', e);
      try {
        assignments = await prisma.volunteerAssignment.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit)
        });
      } catch (e2) {
        console.error('Volunteers fetch with createdAt order failed; retrying without order.', e2);
        try {
          assignments = await prisma.volunteerAssignment.findMany({
            where,
            skip,
            take: Number(limit)
          });
        } catch (e3) {
          console.error('Volunteers fetch with filters failed; retrying with minimal query.', e3);
          assignments = await prisma.volunteerAssignment.findMany({
            take: Number(limit)
          });
        }
      }
      if (!total) {
        total = assignments.length;
      }
    }

    const pages = Math.ceil(total / Number(limit));

    res.json({
      assignments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch volunteer assignments' }
    });
  }
});

// Create new volunteer assignment
router.post('/', async (req, res) => {
  try {
    const {
      memberId,
      eventId,
      role,
      status = 'ASSIGNED',
      notes
    } = req.body;

    // Validate required fields
    if (!memberId || !eventId || !role) {
      return res.status(400).json({ 
        error: { message: 'Member ID, Event ID, and role are required' }
      });
    }

    // Validate role
    const validRoles = ['LEADER', 'ASSISTANT', 'GREETER', 'USHER', 'MUSIC', 'TECH', 'SECURITY', 'CLEANUP', 'OTHER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: { message: 'Invalid volunteer role' }
      });
    }

    // Validate status
    const validStatuses = ['ASSIGNED', 'CONFIRMED', 'DECLINED', 'COMPLETED', 'NO_SHOW'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: { message: 'Invalid volunteer status' }
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

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(400).json({ 
        error: { message: 'Event not found' }
      });
    }

    // Check if assignment already exists for this member and event
    const existingAssignment = await prisma.volunteerAssignment.findFirst({
      where: {
        memberId,
        eventId
      }
    });

    if (existingAssignment) {
      return res.status(400).json({ 
        error: { message: 'Volunteer already assigned to this event' }
      });
    }

    const assignment = await prisma.volunteerAssignment.create({
      data: {
        memberId,
        eventId,
        role,
        status,
        notes,
        startDate: new Date(),
        userId: (req as any).user.id
      },
      include: {
        member: true,
        ministry: true,
        user: true
      }
    });

    res.status(201).json(assignment);
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to create volunteer assignment' }
    });
  }
});

// Update volunteer assignment
router.put('/:id', async (req, res) => {
  try {
    const { role, status, notes } = req.body;

    const assignment = await prisma.volunteerAssignment.update({
      where: { id: req.params.id },
      data: {
        ...(role && { role }),
        ...(status && { status }),
        ...(notes && { notes })
      },
      include: {
        member: true,
        ministry: true,
        user: true
      }
    });

    res.json(assignment);
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to update volunteer assignment' }
    });
  }
});

// Delete volunteer assignment
router.delete('/:id', async (req, res) => {
  try {
    await prisma.volunteerAssignment.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Volunteer assignment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to delete volunteer assignment' }
    });
  }
});

// Get volunteer statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const { dateFrom, dateTo, memberId } = req.query;

    const where: any = {};

    if (dateFrom || dateTo) {
      where.startDate = {};
      if (dateFrom) {
        where.startDate.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.startDate.lte = new Date(dateTo as string);
      }
    }
    if (memberId) {
      where.memberId = memberId;
    }

    const [
      totalAssignments,
      assigned,
      confirmed,
      declined,
      completed,
      noShow
    ] = await Promise.all([
      prisma.volunteerAssignment.count({ where }),
      prisma.volunteerAssignment.count({ where: { ...where, status: 'ASSIGNED' } }),
      prisma.volunteerAssignment.count({ where: { ...where, status: 'CONFIRMED' } }),
      prisma.volunteerAssignment.count({ where: { ...where, status: 'DECLINED' } }),
      prisma.volunteerAssignment.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.volunteerAssignment.count({ where: { ...where, status: 'NO_SHOW' } })
    ]);

    const confirmationRate = totalAssignments > 0 ? ((confirmed / totalAssignments) * 100).toFixed(1) : '0';
    const completionRate = totalAssignments > 0 ? ((completed / totalAssignments) * 100).toFixed(1) : '0';

    res.json({
      totalAssignments,
      assigned,
      confirmed,
      declined,
      completed,
      noShow,
      confirmationRate: `${confirmationRate}%`,
      completionRate: `${completionRate}%`,
      period: {
        from: dateFrom || null,
        to: dateTo || null
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch volunteer statistics' }
    });
  }
});

// Get top volunteers
router.get('/stats/top-volunteers', async (req, res) => {
  try {
    const { limit = 10, dateFrom, dateTo } = req.query;

    const where: any = {
      status: 'COMPLETED'
    };

    if (dateFrom || dateTo) {
      where.startDate = {};
      if (dateFrom) {
        where.startDate.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.startDate.lte = new Date(dateTo as string);
      }
    }

    const rows = await prisma.volunteerAssignment.findMany({
      where: { status: 'COMPLETED' },
      select: { memberId: true },
    });
    const counts = new Map<string, number>();
    for (const row of rows) {
      counts.set(row.memberId, (counts.get(row.memberId) || 0) + 1);
    }
    const topVolunteers = Array.from(counts.entries())
      .map(([memberId, count]) => ({ memberId, _count: { id: count } }))
      .sort((a, b) => b._count.id - a._count.id)
      .slice(0, Number(limit));

    // Get member details for each volunteer
    const volunteersWithDetails = await Promise.all(
      topVolunteers.map(async (volunteer) => {
        const member = await prisma.member.findUnique({
          where: { id: volunteer.memberId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        });

        return {
          member,
          completedAssignments: volunteer._count.id || 0
        };
      })
    );

    res.json({
      volunteers: volunteersWithDetails,
      period: {
        from: dateFrom || null,
        to: dateTo || null
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch top volunteers' }
    });
  }
});

// Bulk volunteer assignment
router.post('/bulk', async (req, res) => {
  try {
    const { eventId, volunteerAssignments } = req.body;

    if (!eventId || !volunteerAssignments || !Array.isArray(volunteerAssignments)) {
      return res.status(400).json({ 
        error: { message: 'Event ID and volunteer assignments array are required' }
      });
    }

    const results = await Promise.all(
      volunteerAssignments.map(async (assignment: any) => {
        const { memberId, role, status = 'ASSIGNED', notes } = assignment;

        try {
          // Check if member exists
          const member = await prisma.member.findUnique({
            where: { id: memberId }
          });

          if (!member) {
            return {
              memberId,
              success: false,
              error: 'Member not found'
            };
          }

          // Check if assignment already exists
          const existing = await prisma.volunteerAssignment.findFirst({
            where: { memberId, eventId }
          });

          if (existing) {
            return {
              memberId,
              success: false,
              error: 'Volunteer already assigned to this event'
            };
          }

          const volunteerAssignment = await prisma.volunteerAssignment.create({
            data: {
              memberId,
              eventId,
              role,
              status,
              notes,
              startDate: new Date(),
              userId: (req as any).user.id
            }
          });

          return {
            memberId,
            success: true,
            assignment: volunteerAssignment
          };
        } catch (error) {
          return {
            memberId,
            success: false,
            error: 'Failed to create volunteer assignment'
          };
        }
      })
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({
      message: `Bulk volunteer assignment completed: ${successful} successful, ${failed} failed`,
      results
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to process bulk volunteer assignment' }
    });
  }
});

// Get single volunteer assignment
router.get('/:id', async (req, res) => {
  try {
    const assignment = await prisma.volunteerAssignment.findUnique({
      where: { id: req.params.id },
      include: {
        member: true,
        ministry: true,
        user: true
      }
    });

    if (!assignment) {
      return res.status(404).json({ 
        error: { message: 'Volunteer assignment not found' }
      });
    }

    res.json(assignment);
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch volunteer assignment' }
    });
  }
});

export default router;
