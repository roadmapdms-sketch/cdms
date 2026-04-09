import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';
import { STAFF_MODULE_ROLES } from '../constants/accessRoles';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);
router.use(requireRole(STAFF_MODULE_ROLES));

// Get events with pagination and filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,
      dateFrom,
      dateTo
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { location: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    if (type) {
      where.type = type;
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

    const total = await prisma.event.count({ where });
    let events: any[] = [];
    try {
      events = await prisma.event.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { startDate: 'asc' },
        skip,
        take: Number(limit)
      });
    } catch (e) {
      // Fallback for legacy rows where required creator relation is inconsistent.
      events = await prisma.event.findMany({
        where,
        orderBy: { startDate: 'asc' },
        skip,
        take: Number(limit)
      });
    }

    const pages = Math.ceil(total / Number(limit));

    res.json({
      events,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch events' }
    });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        creator: true
      }
    });

    if (!event) {
      return res.status(404).json({ 
        error: { message: 'Event not found' }
      });
    }

    res.json(event);
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch event' }
    });
  }
});

// Create new event
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      location,
      type,
      status = 'PLANNED',
      maxAttendees,
      registrationDeadline,
      notes
    } = req.body;

    // Validate required fields
    if (!title || !date || !location || !type) {
      return res.status(400).json({ 
        error: { message: 'Title, date, location, and type are required' }
      });
    }

    // Validate event type
    const validTypes = ['WORSHIP', 'MEETING', 'CONFERENCE', 'WORKSHOP', 'SOCIAL', 'OUTREACH', 'FUNDRAISER', 'OTHER'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: { message: 'Invalid event type' }
      });
    }

    // Validate event status
    const validStatuses = ['PLANNED', 'SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: { message: 'Invalid event status' }
      });
    }

    const authReq = req as AuthRequest;
    if (!authReq.userId) {
      return res.status(401).json({
        error: { message: 'Authentication required.' }
      });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        startDate: new Date(date),
        location,
        type,
        status,
        maxCapacity: maxAttendees ? Number(maxAttendees) : null,
        createdBy: authReq.userId
      },
      include: {
        creator: true
      }
    });

    res.status(201).json(event);
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to create event' }
    });
  }
});

// Update event
router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      location,
      type,
      status,
      maxAttendees,
      registrationDeadline,
      notes
    } = req.body;

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(date && { startDate: new Date(date) }),
        ...(location && { location }),
        ...(type && { type }),
        ...(status && { status }),
        ...(maxAttendees && { maxCapacity: Number(maxAttendees) }),
        ...(notes && { notes })
      },
      include: {
        creator: true
      }
    });

    res.json(event);
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to update event' }
    });
  }
});

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    await prisma.event.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to delete event' }
    });
  }
});

// Get event statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const { dateFrom, dateTo, type } = req.query;

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
    if (type) {
      where.type = type;
    }

    const [
      totalEvents,
      planned,
      scheduled,
      ongoing,
      completed,
      cancelled,
      worship,
      meetings,
      conferences,
      workshops,
      social,
      outreach
    ] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.count({ where: { ...where, status: 'PLANNED' } }),
      prisma.event.count({ where: { ...where, status: 'SCHEDULED' } }),
      prisma.event.count({ where: { ...where, status: 'ONGOING' } }),
      prisma.event.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.event.count({ where: { ...where, status: 'CANCELLED' } }),
      prisma.event.count({ where: { ...where, type: 'WORSHIP' } }),
      prisma.event.count({ where: { ...where, type: 'MEETING' } }),
      prisma.event.count({ where: { ...where, type: 'CONFERENCE' } }),
      prisma.event.count({ where: { ...where, type: 'WORKSHOP' } }),
      prisma.event.count({ where: { ...where, type: 'SOCIAL' } }),
      prisma.event.count({ where: { ...where, type: 'OUTREACH' } })
    ]);

    const completionRate = totalEvents > 0 ? ((completed / totalEvents) * 100).toFixed(1) : '0';

    res.json({
      totalEvents,
      planned,
      scheduled,
      ongoing,
      completed,
      cancelled,
      completionRate: `${completionRate}%`,
      breakdown: {
        worship,
        meetings,
        conferences,
        workshops,
        social,
        outreach
      },
      period: {
        from: dateFrom || null,
        to: dateTo || null
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch event statistics' }
    });
  }
});

// Get upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const events = await prisma.event.findMany({
      where: {
        startDate: {
          gte: new Date()
        },
        status: {
          in: ['PLANNED', 'SCHEDULED']
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { startDate: 'asc' },
      take: Number(limit)
    });

    res.json({ events });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch upcoming events' }
    });
  }
});

// Get event calendar data
router.get('/calendar', async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);

    const events = await prisma.event.findMany({
      where: {
        startDate: {
          gte: startDate,
          lte: endDate
        },
        status: {
          in: ['PLANNED', 'SCHEDULED', 'ONGOING']
        }
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        type: true,
        status: true,
        location: true
      },
      orderBy: { startDate: 'asc' }
    });

    const calendarEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.startDate,
      type: event.type,
      status: event.status,
      location: event.location
    }));

    res.json({
      year: Number(year),
      month: Number(month),
      events: calendarEvents
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch calendar data' }
    });
  }
});

// Register attendees for event
router.post('/:id/register', async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.userId) {
      return res.status(401).json({
        error: { message: 'Authentication required.' }
      });
    }

    const { memberIds } = req.body;

    if (!memberIds || !Array.isArray(memberIds)) {
      return res.status(400).json({ 
        error: { message: 'Member IDs array is required' }
      });
    }

    const eventId = req.params.id;

    // Check if event exists and has capacity
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({ 
        error: { message: 'Event not found' }
      });
    }

    // Check current attendance count
    const currentAttendance = await prisma.attendance.count({
      where: { eventId }
    });

    if (event.maxCapacity && currentAttendance >= event.maxCapacity) {
      return res.status(400).json({ 
        error: { message: 'Event is at full capacity' }
      });
    }

    const results = await Promise.all(
      memberIds.map(async (memberId: string) => {
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

          // Check if already registered
          const existing = await prisma.attendance.findFirst({
            where: { memberId, eventId }
          });

          if (existing) {
            return {
              memberId,
              success: false,
              error: 'Member already registered for this event'
            };
          }

          const attendance = await prisma.attendance.create({
            data: {
              memberId,
              eventId,
              checkIn: new Date(),
              status: 'REGISTERED',
              userId: authReq.userId
            }
          });

          return {
            memberId,
            success: true,
            attendance
          };
        } catch (error) {
          return {
            memberId,
            success: false,
            error: 'Failed to register member'
          };
        }
      })
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({
      message: `Event registration completed: ${successful} successful, ${failed} failed`,
      results
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to process event registration' }
    });
  }
});

export default router;
