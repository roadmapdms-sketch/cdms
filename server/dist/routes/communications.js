"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// All communication routes will be protected
router.use(auth_1.authMiddleware);
// Get communications with pagination and filters
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, memberId, type, method, status, dateFrom, dateTo } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (memberId) {
            where.memberId = memberId;
        }
        if (type) {
            where.type = type;
        }
        if (method) {
            where.method = method;
        }
        if (status) {
            where.status = status;
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
        const [communications, total] = await Promise.all([
            prisma.communication.findMany({
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
            prisma.communication.count({ where })
        ]);
        const pages = Math.ceil(total / Number(limit));
        res.json({
            communications,
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
            error: { message: 'Failed to fetch communications' }
        });
    }
});
// Get single communication
router.get('/:id', async (req, res) => {
    try {
        const communication = await prisma.communication.findUnique({
            where: { id: req.params.id },
            include: {
                member: true,
                user: true
            }
        });
        if (!communication) {
            return res.status(404).json({
                error: { message: 'Communication not found' }
            });
        }
        res.json(communication);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch communication' }
        });
    }
});
// Create new communication
router.post('/', async (req, res) => {
    try {
        const { memberId, type, subject, content, method, scheduled, status = 'PENDING' } = req.body;
        // Validate required fields
        if (!type || !subject || !content || !method) {
            return res.status(400).json({
                error: { message: 'Type, subject, content, and method are required' }
            });
        }
        // Validate communication type
        const validTypes = ['EMAIL', 'SMS', 'PHONE', 'MAIL', 'SOCIAL_MEDIA', 'IN_PERSON'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                error: { message: 'Invalid communication type' }
            });
        }
        // Validate method
        const validMethods = ['EMAIL', 'SMS', 'PHONE_CALL', 'MAIL', 'SOCIAL_MEDIA', 'IN_PERSON'];
        if (!validMethods.includes(method)) {
            return res.status(400).json({
                error: { message: 'Invalid communication method' }
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
        const communication = await prisma.communication.create({
            data: {
                memberId,
                userId: req.user.id, // Get user from auth middleware
                type,
                subject,
                content,
                method,
                scheduled: scheduled ? new Date(scheduled) : null,
                status
            },
            include: {
                member: true,
                user: true
            }
        });
        res.status(201).json(communication);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to create communication' }
        });
    }
});
// Update communication
router.put('/:id', async (req, res) => {
    try {
        const { type, subject, content, method, scheduled, status, response, sent } = req.body;
        const communication = await prisma.communication.update({
            where: { id: req.params.id },
            data: {
                ...(type && { type }),
                ...(subject && { subject }),
                ...(content && { content }),
                ...(method && { method }),
                ...(scheduled && { scheduled: new Date(scheduled) }),
                ...(status && { status }),
                ...(response && { response }),
                ...(sent && { sent: new Date(sent) })
            },
            include: {
                member: true,
                user: true
            }
        });
        res.json(communication);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to update communication' }
        });
    }
});
// Delete communication
router.delete('/:id', async (req, res) => {
    try {
        await prisma.communication.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Communication deleted successfully' });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to delete communication' }
        });
    }
});
// Send communication (Mark as sent)
router.post('/:id/send', async (req, res) => {
    try {
        const communication = await prisma.communication.update({
            where: { id: req.params.id },
            data: {
                status: 'SENT',
                sent: new Date()
            },
            include: {
                member: true,
                user: true
            }
        });
        res.json({
            message: 'Communication marked as sent',
            communication
        });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to send communication' }
        });
    }
});
// Get communication statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const { dateFrom, dateTo, type, method } = req.query;
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
        if (type) {
            where.type = type;
        }
        if (method) {
            where.method = method;
        }
        const [total, pending, sent, failed] = await Promise.all([
            prisma.communication.count({ where }),
            prisma.communication.count({ where: { ...where, status: 'PENDING' } }),
            prisma.communication.count({ where: { ...where, status: 'SENT' } }),
            prisma.communication.count({ where: { ...where, status: 'FAILED' } })
        ]);
        res.json({
            total,
            pending,
            sent,
            failed,
            period: {
                from: dateFrom || null,
                to: dateTo || null
            }
        });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch communication statistics' }
        });
    }
});
// Bulk communication to multiple members
router.post('/bulk', async (req, res) => {
    try {
        const { memberIds, type, subject, content, method, scheduled } = req.body;
        if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
            return res.status(400).json({
                error: { message: 'Member IDs array is required' }
            });
        }
        if (!type || !subject || !content || !method) {
            return res.status(400).json({
                error: { message: 'Type, subject, content, and method are required' }
            });
        }
        const results = await Promise.all(memberIds.map(async (memberId) => {
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
                const communication = await prisma.communication.create({
                    data: {
                        memberId,
                        userId: req.user.id,
                        type,
                        subject,
                        content,
                        method,
                        scheduled: scheduled ? new Date(scheduled) : null,
                        status: 'PENDING'
                    }
                });
                return {
                    memberId,
                    success: true,
                    communication
                };
            }
            catch (error) {
                return {
                    memberId,
                    success: false,
                    error: 'Failed to create communication'
                };
            }
        }));
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        res.json({
            message: `Bulk communication created: ${successful} successful, ${failed} failed`,
            results
        });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to process bulk communication' }
        });
    }
});
// Get communication templates
router.get('/templates', async (req, res) => {
    try {
        const templates = [
            {
                id: 'welcome',
                name: 'Welcome Message',
                type: 'EMAIL',
                subject: 'Welcome to Our Church Family!',
                content: 'Dear {firstName},\n\nWe are so excited to welcome you to our church family! We are thrilled to have you join us and look forward to getting to know you better.\n\nIf you have any questions or need anything at all, please don\'t hesitate to reach out to us.\n\nBlessings,\nThe Church Team'
            },
            {
                id: 'event_invitation',
                name: 'Event Invitation',
                type: 'EMAIL',
                subject: 'Invitation: {eventName}',
                content: 'Dear {firstName},\n\nYou are invited to join us for {eventName} on {eventDate} at {eventTime}.\n\n{eventDescription}\n\nWe would love to see you there!\n\nRSVP by {rsvpDate}\n\nBlessings,\nThe Church Team'
            },
            {
                id: 'prayer_request',
                name: 'Prayer Request Follow-up',
                type: 'EMAIL',
                subject: 'Regarding Your Prayer Request',
                content: 'Dear {firstName},\n\nThank you for sharing your prayer request with us. Our church family is praying for you during this time.\n\n{prayerDetails}\n\nPlease know that you are not alone, and we are here to support you in any way we can.\n\nIn prayer,\nThe Pastoral Team'
            },
            {
                id: 'birthday',
                name: 'Birthday Greeting',
                type: 'EMAIL',
                subject: 'Happy Birthday, {firstName}!',
                content: 'Happy Birthday, {firstName}!\n\nWe are so grateful to have you as part of our church family. May God bless you richly on this special day and throughout the coming year.\n\nWishing you a wonderful day filled with joy and celebration!\n\nWith love,\nYour Church Family'
            }
        ];
        res.json(templates);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch communication templates' }
        });
    }
});
exports.default = router;
//# sourceMappingURL=communications.js.map