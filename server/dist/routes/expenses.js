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
// All expense routes will be protected
router.use(auth_1.authMiddleware);
// Get expenses with pagination and filters
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search, category, status, vendor, dateFrom, dateTo, eventId } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (search) {
            where.OR = [
                { description: { contains: search, mode: 'insensitive' } },
                { vendor: { contains: search, mode: 'insensitive' } },
                { notes: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (category) {
            where.category = category;
        }
        if (status) {
            where.status = status;
        }
        if (vendor) {
            where.vendor = { contains: vendor, mode: 'insensitive' };
        }
        if (eventId) {
            where.eventId = eventId;
        }
        if (dateFrom || dateTo) {
            where.date = {};
            if (dateFrom) {
                where.date.gte = new Date(dateFrom);
            }
            if (dateTo) {
                where.date.lte = new Date(dateTo);
            }
        }
        const [expenses, total] = await Promise.all([
            prisma.expense.findMany({
                where,
                include: {
                    event: {
                        select: {
                            id: true,
                            title: true,
                            startDate: true
                        }
                    }
                },
                orderBy: { date: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma.expense.count({ where })
        ]);
        const pages = Math.ceil(total / Number(limit));
        res.json({
            expenses,
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
            error: { message: 'Failed to fetch expenses' }
        });
    }
});
// Get single expense
router.get('/:id', async (req, res) => {
    try {
        const expense = await prisma.expense.findUnique({
            where: { id: req.params.id },
            include: {
                event: true
            }
        });
        if (!expense) {
            return res.status(404).json({
                error: { message: 'Expense not found' }
            });
        }
        res.json(expense);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch expense' }
        });
    }
});
// Create new expense
router.post('/', async (req, res) => {
    try {
        const { description, amount, category, vendor, date, status = 'PENDING', eventId, notes } = req.body;
        // Validate required fields
        if (!description || !amount || !category || !date) {
            return res.status(400).json({
                error: { message: 'Description, amount, category, and date are required' }
            });
        }
        // Validate status
        const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'PAID'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: { message: 'Invalid expense status' }
            });
        }
        // Validate category
        const validCategories = ['SUPPLIES', 'RENT', 'UTILITIES', 'SALARIES', 'MARKETING', 'EVENTS', 'MAINTENANCE', 'EQUIPMENT', 'TRAVEL', 'OTHER'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                error: { message: 'Invalid expense category' }
            });
        }
        // Check if event exists if provided
        if (eventId) {
            const event = await prisma.event.findUnique({
                where: { id: eventId }
            });
            if (!event) {
                return res.status(400).json({
                    error: { message: 'Event not found' }
                });
            }
        }
        const expense = await prisma.expense.create({
            data: {
                description,
                amount: Number(amount),
                category,
                vendor,
                date: new Date(date),
                status,
                eventId: eventId || null,
                notes
            },
            include: {
                event: true
            }
        });
        res.status(201).json(expense);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to create expense' }
        });
    }
});
// Update expense
router.put('/:id', async (req, res) => {
    try {
        const { description, amount, category, vendor, date, status, eventId, notes } = req.body;
        // Check if event exists if provided
        if (eventId) {
            const event = await prisma.event.findUnique({
                where: { id: eventId }
            });
            if (!event) {
                return res.status(400).json({
                    error: { message: 'Event not found' }
                });
            }
        }
        const expense = await prisma.expense.update({
            where: { id: req.params.id },
            data: {
                ...(description && { description }),
                ...(amount && { amount: Number(amount) }),
                ...(category && { category }),
                ...(vendor && { vendor }),
                ...(date && { date: new Date(date) }),
                ...(status && { status }),
                ...(eventId !== undefined && { eventId: eventId || null }),
                ...(notes && { notes })
            },
            include: {
                event: true
            }
        });
        res.json(expense);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to update expense' }
        });
    }
});
// Delete expense
router.delete('/:id', async (req, res) => {
    try {
        await prisma.expense.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Expense deleted successfully' });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to delete expense' }
        });
    }
});
// Get expense statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const { dateFrom, dateTo, category, status } = req.query;
        const where = {};
        if (dateFrom || dateTo) {
            where.date = {};
            if (dateFrom) {
                where.date.gte = new Date(dateFrom);
            }
            if (dateTo) {
                where.date.lte = new Date(dateTo);
            }
        }
        if (category) {
            where.category = category;
        }
        if (status) {
            where.status = status;
        }
        const [totalExpenses, pending, approved, rejected, paid, totalAmount, supplies, rent, utilities, salaries, marketing, events, maintenance, equipment, travel, other] = await Promise.all([
            prisma.expense.count({ where }),
            prisma.expense.count({ where: { ...where, status: 'PENDING' } }),
            prisma.expense.count({ where: { ...where, status: 'APPROVED' } }),
            prisma.expense.count({ where: { ...where, status: 'REJECTED' } }),
            prisma.expense.count({ where: { ...where, status: 'PAID' } }),
            prisma.expense.aggregate({
                where,
                _sum: { amount: true }
            }),
            prisma.expense.aggregate({
                where: { ...where, category: 'SUPPLIES' },
                _sum: { amount: true }
            }),
            prisma.expense.aggregate({
                where: { ...where, category: 'RENT' },
                _sum: { amount: true }
            }),
            prisma.expense.aggregate({
                where: { ...where, category: 'UTILITIES' },
                _sum: { amount: true }
            }),
            prisma.expense.aggregate({
                where: { ...where, category: 'SALARIES' },
                _sum: { amount: true }
            }),
            prisma.expense.aggregate({
                where: { ...where, category: 'MARKETING' },
                _sum: { amount: true }
            }),
            prisma.expense.aggregate({
                where: { ...where, category: 'EVENTS' },
                _sum: { amount: true }
            }),
            prisma.expense.aggregate({
                where: { ...where, category: 'MAINTENANCE' },
                _sum: { amount: true }
            }),
            prisma.expense.aggregate({
                where: { ...where, category: 'EQUIPMENT' },
                _sum: { amount: true }
            }),
            prisma.expense.aggregate({
                where: { ...where, category: 'TRAVEL' },
                _sum: { amount: true }
            }),
            prisma.expense.aggregate({
                where: { ...where, category: 'OTHER' },
                _sum: { amount: true }
            })
        ]);
        const approvalRate = totalExpenses > 0 ? ((approved / totalExpenses) * 100).toFixed(1) : '0';
        res.json({
            totalExpenses,
            pending,
            approved,
            rejected,
            paid,
            totalAmount: totalAmount._sum.amount || 0,
            approvalRate: `${approvalRate}%`,
            categoryBreakdown: {
                supplies: supplies._sum.amount || 0,
                rent: rent._sum.amount || 0,
                utilities: utilities._sum.amount || 0,
                salaries: salaries._sum.amount || 0,
                marketing: marketing._sum.amount || 0,
                events: events._sum.amount || 0,
                maintenance: maintenance._sum.amount || 0,
                equipment: equipment._sum.amount || 0,
                travel: travel._sum.amount || 0,
                other: other._sum.amount || 0
            },
            period: {
                from: dateFrom || null,
                to: dateTo || null
            }
        });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch expense statistics' }
        });
    }
});
// Get expense categories
router.get('/categories/list', async (req, res) => {
    try {
        const categories = ['SUPPLIES', 'RENT', 'UTILITIES', 'SALARIES', 'MARKETING', 'EVENTS', 'MAINTENANCE', 'EQUIPMENT', 'TRAVEL', 'OTHER'];
        res.json({ categories });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch categories' }
        });
    }
});
// Approve expense
router.post('/:id/approve', async (req, res) => {
    try {
        const { notes } = req.body;
        const expense = await prisma.expense.update({
            where: { id: req.params.id },
            data: {
                status: 'APPROVED',
                approvedBy: req.user.id,
                approvedAt: new Date(),
                ...(notes && { notes })
            },
            include: {
                event: true
            }
        });
        res.json(expense);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to approve expense' }
        });
    }
});
// Reject expense
router.post('/:id/reject', async (req, res) => {
    try {
        const { notes } = req.body;
        const expense = await prisma.expense.update({
            where: { id: req.params.id },
            data: {
                status: 'REJECTED',
                approvedBy: req.user.id,
                approvedAt: new Date(),
                ...(notes && { notes })
            },
            include: {
                event: true
            }
        });
        res.json(expense);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to reject expense' }
        });
    }
});
// Mark expense as paid
router.post('/:id/pay', async (req, res) => {
    try {
        const { paymentDate = new Date(), notes } = req.body;
        const expense = await prisma.expense.update({
            where: { id: req.params.id },
            data: {
                status: 'PAID',
                ...(notes && { notes })
            },
            include: {
                event: true
            }
        });
        res.json(expense);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to mark expense as paid' }
        });
    }
});
// Get pending expenses
router.get('/pending/list', async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const expenses = await prisma.expense.findMany({
            where: { status: 'PENDING' },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        startDate: true
                    }
                }
            },
            orderBy: { date: 'desc' },
            take: Number(limit)
        });
        res.json({ expenses });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch pending expenses' }
        });
    }
});
// Bulk approve expenses
router.post('/bulk-approve', async (req, res) => {
    try {
        const { expenseIds, notes } = req.body;
        if (!expenseIds || !Array.isArray(expenseIds)) {
            return res.status(400).json({
                error: { message: 'Expense IDs array is required' }
            });
        }
        const results = await Promise.all(expenseIds.map(async (expenseId) => {
            try {
                const expense = await prisma.expense.update({
                    where: { id: expenseId },
                    data: {
                        status: 'APPROVED',
                        approvedBy: req.user.id,
                        approvedAt: new Date(),
                        ...(notes && { notes })
                    }
                });
                return {
                    expenseId,
                    success: true,
                    expense
                };
            }
            catch (error) {
                return {
                    expenseId,
                    success: false,
                    error: 'Failed to approve expense'
                };
            }
        }));
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        res.json({
            message: `Bulk approval completed: ${successful} successful, ${failed} failed`,
            results
        });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to process bulk approval' }
        });
    }
});
exports.default = router;
//# sourceMappingURL=expenses.js.map