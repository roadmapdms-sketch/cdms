"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const accessRoles_1 = require("../constants/accessRoles");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.use(auth_1.authMiddleware);
router.use((0, auth_1.requireRole)(accessRoles_1.STAFF_MODULE_ROLES));
// Get volunteer assignments with pagination and filters
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, memberId, eventId, role, status, dateFrom, dateTo } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
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
                where.startDate.gte = new Date(dateFrom);
            }
            if (dateTo) {
                where.startDate.lte = new Date(dateTo);
            }
        }
        const [assignments, total] = await Promise.all([
            prisma.volunteerAssignment.findMany({
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
            }),
            prisma.volunteerAssignment.count({ where })
        ]);
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
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch volunteer assignments' }
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
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch volunteer assignment' }
        });
    }
});
// Create new volunteer assignment
router.post('/', async (req, res) => {
    try {
        const { memberId, eventId, role, status = 'ASSIGNED', notes } = req.body;
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
                userId: req.user.id
            },
            include: {
                member: true,
                ministry: true,
                user: true
            }
        });
        res.status(201).json(assignment);
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to delete volunteer assignment' }
        });
    }
});
// Get volunteer statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const { dateFrom, dateTo, memberId } = req.query;
        const where = {};
        if (dateFrom || dateTo) {
            where.startDate = {};
            if (dateFrom) {
                where.startDate.gte = new Date(dateFrom);
            }
            if (dateTo) {
                where.startDate.lte = new Date(dateTo);
            }
        }
        if (memberId) {
            where.memberId = memberId;
        }
        const [totalAssignments, assigned, confirmed, declined, completed, noShow] = await Promise.all([
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
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch volunteer statistics' }
        });
    }
});
// Get top volunteers
router.get('/stats/top-volunteers', async (req, res) => {
    try {
        const { limit = 10, dateFrom, dateTo } = req.query;
        const where = {
            status: 'COMPLETED'
        };
        if (dateFrom || dateTo) {
            where.startDate = {};
            if (dateFrom) {
                where.startDate.gte = new Date(dateFrom);
            }
            if (dateTo) {
                where.startDate.lte = new Date(dateTo);
            }
        }
        const topVolunteers = await prisma.volunteerAssignment.groupBy({
            by: ['memberId'],
            where,
            _count: { id: true },
            orderBy: {
                _count: { id: 'desc' }
            },
            take: Number(limit)
        });
        // Get member details for each volunteer
        const volunteersWithDetails = await Promise.all(topVolunteers.map(async (volunteer) => {
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
        }));
        res.json({
            volunteers: volunteersWithDetails,
            period: {
                from: dateFrom || null,
                to: dateTo || null
            }
        });
    }
    catch (error) {
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
        const results = await Promise.all(volunteerAssignments.map(async (assignment) => {
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
                        userId: req.user.id
                    }
                });
                return {
                    memberId,
                    success: true,
                    assignment: volunteerAssignment
                };
            }
            catch (error) {
                return {
                    memberId,
                    success: false,
                    error: 'Failed to create volunteer assignment'
                };
            }
        }));
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        res.json({
            message: `Bulk volunteer assignment completed: ${successful} successful, ${failed} failed`,
            results
        });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to process bulk volunteer assignment' }
        });
    }
});
exports.default = router;
//# sourceMappingURL=volunteers.js.map