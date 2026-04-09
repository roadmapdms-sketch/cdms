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
router.use((0, auth_1.requireRole)(accessRoles_1.FINANCE_CORE_ROLES));
// Get vendors with pagination and filters
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search, isActive, services } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { contactPerson: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
                { services: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }
        if (services) {
            where.services = { contains: services, mode: 'insensitive' };
        }
        const [vendors, total] = await Promise.all([
            prisma.vendor.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma.vendor.count({ where })
        ]);
        const pages = Math.ceil(total / Number(limit));
        res.json({
            vendors,
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
            error: { message: 'Failed to fetch vendors' }
        });
    }
});
// Create new vendor
router.post('/', async (req, res) => {
    try {
        const { name, contactPerson, email, phone, address, services, notes, isActive = true } = req.body;
        // Validate required fields
        if (!name) {
            return res.status(400).json({
                error: { message: 'Vendor name is required' }
            });
        }
        const vendor = await prisma.vendor.create({
            data: {
                name,
                contactPerson,
                email,
                phone,
                address,
                services,
                notes,
                isActive
            }
        });
        res.status(201).json(vendor);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to create vendor' }
        });
    }
});
// Update vendor
router.put('/:id', async (req, res) => {
    try {
        const { name, contactPerson, email, phone, address, services, notes, isActive } = req.body;
        const vendor = await prisma.vendor.update({
            where: { id: req.params.id },
            data: {
                ...(name && { name }),
                ...(contactPerson && { contactPerson }),
                ...(email && { email }),
                ...(phone && { phone }),
                ...(address && { address }),
                ...(services && { services }),
                ...(notes && { notes }),
                ...(isActive !== undefined && { isActive })
            }
        });
        res.json(vendor);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to update vendor' }
        });
    }
});
// Delete vendor
router.delete('/:id', async (req, res) => {
    try {
        await prisma.vendor.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Vendor deleted successfully' });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to delete vendor' }
        });
    }
});
// Get vendor statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const [totalVendors, active, inactive, withContact, withEmail, withPhone, withAddress, withServices] = await Promise.all([
            prisma.vendor.count(),
            prisma.vendor.count({ where: { isActive: true } }),
            prisma.vendor.count({ where: { isActive: false } }),
            prisma.vendor.count({ where: { contactPerson: { not: null } } }),
            prisma.vendor.count({ where: { email: { not: null } } }),
            prisma.vendor.count({ where: { phone: { not: null } } }),
            prisma.vendor.count({ where: { address: { not: null } } }),
            prisma.vendor.count({ where: { services: { not: null } } })
        ]);
        const activationRate = totalVendors > 0 ? ((active / totalVendors) * 100).toFixed(1) : '0';
        res.json({
            totalVendors,
            active,
            inactive,
            activationRate: `${activationRate}%`,
            completeness: {
                withContact,
                withEmail,
                withPhone,
                withAddress,
                withServices
            }
        });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch vendor statistics' }
        });
    }
});
// Get active vendors
router.get('/active/list', async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const vendors = await prisma.vendor.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
            take: Number(limit)
        });
        res.json({ vendors });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch active vendors' }
        });
    }
});
// Get vendors by service type
router.get('/services/search', async (req, res) => {
    try {
        const { service } = req.query;
        if (!service) {
            return res.status(400).json({
                error: { message: 'Service parameter is required' }
            });
        }
        const vendors = await prisma.vendor.findMany({
            where: {
                isActive: true,
                services: { contains: service }
            },
            orderBy: { name: 'asc' }
        });
        res.json({ vendors });
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to search vendors by service' }
        });
    }
});
// Toggle vendor active status
router.post('/:id/toggle-status', async (req, res) => {
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { id: req.params.id }
        });
        if (!vendor) {
            return res.status(404).json({
                error: { message: 'Vendor not found' }
            });
        }
        const updatedVendor = await prisma.vendor.update({
            where: { id: req.params.id },
            data: { isActive: !vendor.isActive }
        });
        res.json(updatedVendor);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to toggle vendor status' }
        });
    }
});
// Bulk update vendors
router.post('/bulk-update', async (req, res) => {
    try {
        const { vendorIds, updates } = req.body;
        if (!vendorIds || !Array.isArray(vendorIds) || !updates) {
            return res.status(400).json({
                error: { message: 'Vendor IDs array and updates object are required' }
            });
        }
        const results = await Promise.all(vendorIds.map(async (vendorId) => {
            try {
                const vendor = await prisma.vendor.update({
                    where: { id: vendorId },
                    data: updates
                });
                return {
                    vendorId,
                    success: true,
                    vendor
                };
            }
            catch (error) {
                return {
                    vendorId,
                    success: false,
                    error: 'Failed to update vendor'
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
// Get single vendor
router.get('/:id', async (req, res) => {
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { id: req.params.id }
        });
        if (!vendor) {
            return res.status(404).json({
                error: { message: 'Vendor not found' }
            });
        }
        res.json(vendor);
    }
    catch (error) {
        res.status(500).json({
            error: { message: 'Failed to fetch vendor' }
        });
    }
});
exports.default = router;
//# sourceMappingURL=vendors.js.map