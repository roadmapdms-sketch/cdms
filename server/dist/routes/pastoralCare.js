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
// Get pastoral care records with pagination and filters
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search, type, status, memberId, dateFrom, dateTo } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (search) {
            where.OR = [
                { description: { contains: search, mode: 'insensitive' } },
                { notes: { contains: search, mode: 'insensitive' } }
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
                where.createdAt.gte = new Date(dateFrom);
            }
            if (dateTo) {
                where.createdAt.lte = new Date(dateTo);
            }
        }
        const [records, total] = await Promise.all([
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
            prisma.pastoralCareRecord.count({ where })
        ]);
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
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch pastoral care records' }
        });
    }
});
// Create new pastoral care record
router.post('/', async (req, res) => {
    try {
        const { memberId, type, description, status = 'OPEN', followUpDate, notes } = req.body;
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
                userId: req.user.id
            },
            include: {
                member: true,
                user: true
            }
        });
        res.status(201).json(record);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to create pastoral care record' }
        });
    }
});
// Update pastoral care record
router.put('/:id', async (req, res) => {
    try {
        const { type, description, status, followUpDate, notes } = req.body;
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
                user: true
            }
        });
        res.json(record);
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to delete pastoral care record' }
        });
    }
});
// Get pastoral care statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const { dateFrom, dateTo, memberId } = req.query;
        const where = {};
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) {
                where.createdAt.gte = new Date(dateFrom);
            }
            if (dateTo) {
                where.createdAt.lte = new Date(dateTo);
            }
        }
        if (memberId) {
            where.memberId = memberId;
        }
        const [totalRecords, open, inProgress, completed, closed, visits, calls, counseling, prayers, support, interventions] = await Promise.all([
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
    }
    catch (error) {
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
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: { followUpDate: 'asc' }
        });
        res.json({ records });
    }
    catch (error) {
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
        const results = await Promise.all(recordIds.map(async (recordId) => {
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
            }
            catch (error) {
                return {
                    recordId,
                    success: false,
                    error: 'Failed to update record'
                };
            }
        }));
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        res.json({
            message: `Bulk update completed: ${successful} successful, ${failed} failed`,
            results
        });
    }
    catch (error) {
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
                user: true
            }
        });
        if (!record) {
            return res.status(404).json({
                error: { message: 'Pastoral care record not found' }
            });
        }
        res.json(record);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch pastoral care record' }
        });
    }
});
exports.default = router;
//# sourceMappingURL=pastoralCare.js.map