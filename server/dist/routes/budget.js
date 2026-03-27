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
// All budget routes will be protected
router.use(auth_1.authMiddleware);
// Get budgets with pagination and filters
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search, category, status, period, dateFrom, dateTo } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (search) {
            where.OR = [
                { category: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { period: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (category) {
            where.category = category;
        }
        if (status) {
            where.status = status;
        }
        if (period) {
            where.period = { contains: period, mode: 'insensitive' };
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
        const [budgets, total] = await Promise.all([
            prisma.budget.findMany({
                where,
                orderBy: { startDate: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma.budget.count({ where })
        ]);
        const pages = Math.ceil(total / Number(limit));
        res.json({
            budgets,
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
            error: { message: 'Failed to fetch budgets' }
        });
    }
});
// Get single budget
router.get('/:id', async (req, res) => {
    try {
        const budget = await prisma.budget.findUnique({
            where: { id: req.params.id }
        });
        if (!budget) {
            return res.status(404).json({
                error: { message: 'Budget not found' }
            });
        }
        res.json(budget);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch budget' }
        });
    }
});
// Create new budget
router.post('/', async (req, res) => {
    try {
        const { category, description, amount, period, startDate, endDate, status = 'ACTIVE' } = req.body;
        // Validate required fields
        if (!category || !amount || !period || !startDate || !endDate) {
            return res.status(400).json({
                error: { message: 'Category, amount, period, start date, and end date are required' }
            });
        }
        // Validate status
        const validStatuses = ['ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: { message: 'Invalid budget status' }
            });
        }
        // Validate category
        const validCategories = ['GENERAL', 'EVENTS', 'MAINTENANCE', 'SALARIES', 'MARKETING', 'OUTREACH', 'EDUCATION', 'MISSIONS', 'WORSHIP', 'ADMINISTRATION', 'OTHER'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                error: { message: 'Invalid budget category' }
            });
        }
        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            return res.status(400).json({
                error: { message: 'Start date must be before end date' }
            });
        }
        const budget = await prisma.budget.create({
            data: {
                category,
                description,
                amount: Number(amount),
                period,
                startDate: start,
                endDate: end,
                status
            }
        });
        res.status(201).json(budget);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to create budget' }
        });
    }
});
// Update budget
router.put('/:id', async (req, res) => {
    try {
        const { category, description, amount, period, startDate, endDate, status, spent } = req.body;
        // Validate dates if provided
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (start >= end) {
                return res.status(400).json({
                    error: { message: 'Start date must be before end date' }
                });
            }
        }
        const budget = await prisma.budget.update({
            where: { id: req.params.id },
            data: {
                ...(category && { category }),
                ...(description && { description }),
                ...(amount && { amount: Number(amount) }),
                ...(period && { period }),
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate && { endDate: new Date(endDate) }),
                ...(status && { status }),
                ...(spent !== undefined && { spent: Number(spent) })
            }
        });
        res.json(budget);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to update budget' }
        });
    }
});
// Delete budget
router.delete('/:id', async (req, res) => {
    try {
        await prisma.budget.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Budget deleted successfully' });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to delete budget' }
        });
    }
});
// Get budget statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const { period, category, status } = req.query;
        const where = {};
        if (period) {
            where.period = { contains: period, mode: 'insensitive' };
        }
        if (category) {
            where.category = category;
        }
        if (status) {
            where.status = status;
        }
        const [totalBudgets, active, inactive, completed, cancelled, totalAllocated, totalSpent] = await Promise.all([
            prisma.budget.count({ where }),
            prisma.budget.count({ where: { ...where, status: 'ACTIVE' } }),
            prisma.budget.count({ where: { ...where, status: 'INACTIVE' } }),
            prisma.budget.count({ where: { ...where, status: 'COMPLETED' } }),
            prisma.budget.count({ where: { ...where, status: 'CANCELLED' } }),
            prisma.budget.aggregate({
                where,
                _sum: { amount: true }
            }),
            prisma.budget.aggregate({
                where,
                _sum: { spent: true }
            })
        ]);
        const totalAllocatedAmount = totalAllocated._sum.amount || 0;
        const totalSpentAmount = totalSpent._sum.spent || 0;
        const remainingAmount = totalAllocatedAmount - totalSpentAmount;
        const utilizationRate = totalAllocatedAmount > 0 ? ((totalSpentAmount / totalAllocatedAmount) * 100).toFixed(1) : '0';
        res.json({
            totalBudgets,
            active,
            inactive,
            completed,
            cancelled,
            totalAllocated: totalAllocatedAmount,
            totalSpent: totalSpentAmount,
            remaining: remainingAmount,
            utilizationRate: `${utilizationRate}%`,
            period: period || 'All Periods'
        });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch budget statistics' }
        });
    }
});
// Get budget categories
router.get('/categories/list', async (req, res) => {
    try {
        const categories = ['GENERAL', 'EVENTS', 'MAINTENANCE', 'SALARIES', 'MARKETING', 'OUTREACH', 'EDUCATION', 'MISSIONS', 'WORSHIP', 'ADMINISTRATION', 'OTHER'];
        res.json({ categories });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch categories' }
        });
    }
});
// Update budget spent amount
router.post('/:id/update-spent', async (req, res) => {
    try {
        const { amount } = req.body;
        if (amount === undefined || amount === null) {
            return res.status(400).json({
                error: { message: 'Spent amount is required' }
            });
        }
        const budget = await prisma.budget.findUnique({
            where: { id: req.params.id }
        });
        if (!budget) {
            return res.status(404).json({
                error: { message: 'Budget not found' }
            });
        }
        const updatedBudget = await prisma.budget.update({
            where: { id: req.params.id },
            data: {
                spent: Number(amount)
            }
        });
        res.json(updatedBudget);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to update spent amount' }
        });
    }
});
// Get budget utilization details
router.get('/:id/utilization', async (req, res) => {
    try {
        const budget = await prisma.budget.findUnique({
            where: { id: req.params.id }
        });
        if (!budget) {
            return res.status(404).json({
                error: { message: 'Budget not found' }
            });
        }
        const remaining = budget.amount - budget.spent;
        const utilizationRate = budget.amount > 0 ? ((budget.spent / budget.amount) * 100).toFixed(1) : '0';
        const overBudget = budget.spent > budget.amount;
        res.json({
            budget: {
                id: budget.id,
                category: budget.category,
                description: budget.description,
                amount: budget.amount,
                spent: budget.spent,
                remaining,
                utilizationRate: `${utilizationRate}%`,
                overBudget,
                period: budget.period,
                startDate: budget.startDate,
                endDate: budget.endDate,
                status: budget.status
            }
        });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch budget utilization' }
        });
    }
});
// Get budgets by period
router.get('/period/:periodName', async (req, res) => {
    try {
        const { periodName } = req.params;
        const budgets = await prisma.budget.findMany({
            where: {
                period: { contains: periodName }
            },
            orderBy: { category: 'asc' }
        });
        res.json({ budgets });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch budgets by period' }
        });
    }
});
// Get active budgets
router.get('/active/list', async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const budgets = await prisma.budget.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { startDate: 'desc' },
            take: Number(limit)
        });
        res.json({ budgets });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch active budgets' }
        });
    }
});
// Close budget
router.post('/:id/close', async (req, res) => {
    try {
        const { finalNotes } = req.body;
        const budget = await prisma.budget.findUnique({
            where: { id: req.params.id }
        });
        if (!budget) {
            return res.status(404).json({
                error: { message: 'Budget not found' }
            });
        }
        if (budget.status === 'COMPLETED') {
            return res.status(400).json({
                error: { message: 'Budget is already completed' }
            });
        }
        const updatedBudget = await prisma.budget.update({
            where: { id: req.params.id },
            data: {
                status: 'COMPLETED',
                ...(finalNotes && { description: `${budget.description || ''}\n\nFinal Notes: ${finalNotes}`.trim() })
            }
        });
        res.json(updatedBudget);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to close budget' }
        });
    }
});
exports.default = router;
//# sourceMappingURL=budget.js.map