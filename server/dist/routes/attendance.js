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
// Get attendance records with pagination and filters
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, memberId, eventId, dateFrom, dateTo, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (memberId) {
            where.memberId = memberId;
        }
        if (eventId) {
            where.eventId = eventId;
        }
        if (dateFrom || dateTo) {
            where.checkIn = {};
            if (dateFrom) {
                where.checkIn.gte = new Date(dateFrom);
            }
            if (dateTo) {
                where.checkIn.lte = new Date(dateTo);
            }
        }
        if (status) {
            where.status = status;
        }
        const [attendance, total] = await Promise.all([
            prisma.attendance.findMany({
                where,
                include: {
                    member: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                },
                orderBy: { checkIn: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma.attendance.count({ where })
        ]);
        const pages = Math.ceil(total / Number(limit));
        res.json({
            attendance,
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
            error: { message: 'Failed to fetch attendance records' }
        });
    }
});
// Get single attendance record
router.get('/:id', async (req, res) => {
    try {
        const attendance = await prisma.attendance.findUnique({
            where: { id: req.params.id },
            include: {
                member: true
            }
        });
        if (!attendance) {
            return res.status(404).json({
                error: { message: 'Attendance record not found' }
            });
        }
        res.json(attendance);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch attendance record' }
        });
    }
});
// Create new attendance record
router.post('/', async (req, res) => {
    try {
        const { memberId, eventId, checkIn, status = 'PRESENT', notes } = req.body;
        // Validate required fields
        if (!memberId || !eventId || !checkIn) {
            return res.status(400).json({
                error: { message: 'Member ID, Event ID, and Check-in time are required' }
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
        // Check if attendance already exists for this member and event
        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                memberId,
                eventId
            }
        });
        if (existingAttendance) {
            return res.status(400).json({
                error: { message: 'Attendance already recorded for this member and event' }
            });
        }
        const attendance = await prisma.attendance.create({
            data: {
                memberId,
                eventId,
                checkIn: new Date(checkIn),
                status,
                notes
            },
            include: {
                member: true
            }
        });
        res.status(201).json(attendance);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to create attendance record' }
        });
    }
});
// Update attendance record
router.put('/:id', async (req, res) => {
    try {
        const { status, notes, checkOut } = req.body;
        const attendance = await prisma.attendance.update({
            where: { id: req.params.id },
            data: {
                ...(status && { status }),
                ...(notes && { notes }),
                ...(checkOut && { checkOut: new Date(checkOut) })
            },
            include: {
                member: true
            }
        });
        res.json(attendance);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to update attendance record' }
        });
    }
});
// Delete attendance record
router.delete('/:id', async (req, res) => {
    try {
        await prisma.attendance.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Attendance record deleted successfully' });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to delete attendance record' }
        });
    }
});
// Get attendance statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const { dateFrom, dateTo, eventId } = req.query;
        const where = {};
        if (dateFrom || dateTo) {
            where.checkIn = {};
            if (dateFrom) {
                where.checkIn.gte = new Date(dateFrom);
            }
            if (dateTo) {
                where.checkIn.lte = new Date(dateTo);
            }
        }
        if (eventId) {
            where.eventId = eventId;
        }
        const [total, present, absent, late] = await Promise.all([
            prisma.attendance.count({ where }),
            prisma.attendance.count({ where: { ...where, status: 'PRESENT' } }),
            prisma.attendance.count({ where: { ...where, status: 'ABSENT' } }),
            prisma.attendance.count({ where: { ...where, status: 'LATE' } })
        ]);
        const attendanceRate = total > 0 ? ((present / total) * 100).toFixed(1) : '0';
        res.json({
            totalRecords: total,
            present,
            absent,
            late,
            attendanceRate: `${attendanceRate}%`,
            period: {
                from: dateFrom || null,
                to: dateTo || null
            }
        });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch attendance statistics' }
        });
    }
});
// Bulk attendance recording for events
router.post('/bulk', async (req, res) => {
    try {
        const { eventId, checkIn, attendanceRecords } = req.body;
        if (!eventId || !checkIn || !attendanceRecords || !Array.isArray(attendanceRecords)) {
            return res.status(400).json({
                error: { message: 'Event ID, check-in time, and attendance records array are required' }
            });
        }
        const results = await Promise.all(attendanceRecords.map(async (record) => {
            const { memberId, status = 'PRESENT', notes } = record;
            try {
                // Check if attendance already exists
                const existing = await prisma.attendance.findFirst({
                    where: { memberId, eventId }
                });
                if (existing) {
                    return {
                        memberId,
                        success: false,
                        error: 'Attendance already recorded'
                    };
                }
                const attendance = await prisma.attendance.create({
                    data: {
                        memberId,
                        eventId,
                        checkIn: new Date(checkIn),
                        status,
                        notes
                    }
                });
                return {
                    memberId,
                    success: true,
                    attendance
                };
            }
            catch (error) {
                return {
                    memberId,
                    success: false,
                    error: 'Failed to record attendance'
                };
            }
        }));
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        res.json({
            message: `Bulk attendance completed: ${successful} successful, ${failed} failed`,
            results
        });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to process bulk attendance' }
        });
    }
});
exports.default = router;
//# sourceMappingURL=attendance.js.map