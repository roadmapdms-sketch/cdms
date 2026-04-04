import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, requireRole } from '../middleware/auth';
import { STAFF_MODULE_ROLES } from '../constants/accessRoles';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);
router.use(requireRole(STAFF_MODULE_ROLES));

// Get inventory items with pagination and filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status,
      condition,
      location
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { location: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    if (category) {
      where.category = category;
    }
    if (status) {
      where.status = status;
    }
    if (condition) {
      where.condition = condition;
    }
    if (location) {
      where.location = { contains: location as string, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.inventoryItem.count({ where })
    ]);

    const pages = Math.ceil(total / Number(limit));

    res.json({
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch inventory items' }
    });
  }
});

// Get single inventory item
router.get('/:id', async (req, res) => {
  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: req.params.id },
      include: {
        checkouts: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { checkOutDate: 'desc' }
        }
      }
    });

    if (!item) {
      return res.status(404).json({ 
        error: { message: 'Inventory item not found' }
      });
    }

    res.json(item);
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch inventory item' }
    });
  }
});

// Create new inventory item
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      quantity = 1,
      condition = 'GOOD',
      location,
      purchaseDate,
      purchaseCost,
      currentValue,
      status = 'AVAILABLE',
      notes
    } = req.body;

    // Validate required fields
    if (!name || !category) {
      return res.status(400).json({ 
        error: { message: 'Name and category are required' }
      });
    }

    // Validate condition
    const validConditions = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'];
    if (!validConditions.includes(condition)) {
      return res.status(400).json({ 
        error: { message: 'Invalid condition' }
      });
    }

    // Validate status
    const validStatuses = ['AVAILABLE', 'CHECKED_OUT', 'MAINTENANCE', 'RETIRED', 'LOST'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: { message: 'Invalid status' }
      });
    }

    const item = await prisma.inventoryItem.create({
      data: {
        name,
        description,
        category,
        quantity: Number(quantity),
        condition,
        location,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchaseCost: purchaseCost ? Number(purchaseCost) : null,
        currentValue: currentValue ? Number(currentValue) : null,
        notes,
        status: 'AVAILABLE'
      }
    });

    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to create inventory item' }
    });
  }
});

// Update inventory item
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      quantity,
      condition,
      location,
      purchaseDate,
      purchaseCost,
      currentValue,
      status,
      notes
    } = req.body;

    const item = await prisma.inventoryItem.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(category && { category }),
        ...(quantity && { quantity: Number(quantity) }),
        ...(condition && { condition }),
        ...(location && { location }),
        ...(purchaseDate && { purchaseDate: new Date(purchaseDate) }),
        ...(purchaseCost && { purchaseCost: Number(purchaseCost) }),
        ...(currentValue && { currentValue: Number(currentValue) }),
        ...(status && { status }),
        ...(notes && { notes })
      }
    });

    res.json(item);
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to update inventory item' }
    });
  }
});

// Delete inventory item
router.delete('/:id', async (req, res) => {
  try {
    await prisma.inventoryItem.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to delete inventory item' }
    });
  }
});

// Get inventory statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      totalItems,
      available,
      checkedOut,
      maintenance,
      retired,
      lost,
      excellent,
      good,
      fair,
      poor,
      damaged,
      totalValue
    ] = await Promise.all([
      prisma.inventoryItem.count(),
      prisma.inventoryItem.count({ where: { status: 'AVAILABLE' } }),
      prisma.inventoryItem.count({ where: { status: 'CHECKED_OUT' } }),
      prisma.inventoryItem.count({ where: { status: 'MAINTENANCE' } }),
      prisma.inventoryItem.count({ where: { status: 'RETIRED' } }),
      prisma.inventoryItem.count({ where: { status: 'LOST' } }),
      prisma.inventoryItem.count({ where: { condition: 'EXCELLENT' } }),
      prisma.inventoryItem.count({ where: { condition: 'GOOD' } }),
      prisma.inventoryItem.count({ where: { condition: 'FAIR' } }),
      prisma.inventoryItem.count({ where: { condition: 'POOR' } }),
      prisma.inventoryItem.count({ where: { condition: 'DAMAGED' } }),
      prisma.inventoryItem.aggregate({
        _sum: { currentValue: true }
      })
    ]);

    const availabilityRate = totalItems > 0 ? ((available / totalItems) * 100).toFixed(1) : '0';

    res.json({
      totalItems,
      available,
      checkedOut,
      maintenance,
      retired,
      lost,
      availabilityRate: `${availabilityRate}%`,
      conditionBreakdown: {
        excellent,
        good,
        fair,
        poor,
        damaged
      },
      totalValue: totalValue._sum.currentValue || 0
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch inventory statistics' }
    });
  }
});

// Get inventory categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await prisma.inventoryItem.findMany({
      select: {
        category: true
      },
      distinct: ['category']
    });

    const categoryList = categories.map(item => item.category).filter(Boolean);
    
    res.json({ categories: categoryList });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch categories' }
    });
  }
});

// Checkout inventory item
router.post('/:id/checkout', async (req, res) => {
  try {
    const { memberId, dueDate, notes } = req.body;

    // Check if item exists and is available
    const item = await prisma.inventoryItem.findUnique({
      where: { id: req.params.id }
    });

    if (!item) {
      return res.status(404).json({ 
        error: { message: 'Inventory item not found' }
      });
    }

    if (item.status !== 'AVAILABLE') {
      return res.status(400).json({ 
        error: { message: 'Item is not available for checkout' }
      });
    }

    // Create checkout record
    const checkout = await prisma.inventoryCheckout.create({
      data: {
        itemId: req.params.id,
        userId: (req as any).user.id,
        memberId,
        checkOutDate: new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        notes
      }
    });

    // Update item status
    await prisma.inventoryItem.update({
      where: { id: req.params.id },
      data: { status: 'CHECKED_OUT' }
    });

    res.status(201).json(checkout);
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to checkout inventory item' }
    });
  }
});

// Return inventory item
router.post('/:id/return', async (req, res) => {
  try {
    const { notes } = req.body;

    // Find active checkout
    const checkout = await prisma.inventoryCheckout.findFirst({
      where: {
        itemId: req.params.id,
        returnDate: null
      }
    });

    if (!checkout) {
      return res.status(404).json({ 
        error: { message: 'No active checkout found for this item' }
      });
    }

    // Update checkout record
    const updatedCheckout = await prisma.inventoryCheckout.update({
      where: { id: checkout.id },
      data: {
        returnDate: new Date(),
        ...(notes && { notes })
      }
    });

    // Update item status
    await prisma.inventoryItem.update({
      where: { id: req.params.id },
      data: { status: 'AVAILABLE' }
    });

    res.json(updatedCheckout);
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to return inventory item' }
    });
  }
});

// Get checkout history
router.get('/checkouts/history', async (req, res) => {
  try {
    const { page = 1, limit = 10, itemId } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (itemId) {
      where.itemId = itemId;
    }

    const [checkouts, total] = await Promise.all([
      prisma.inventoryCheckout.findMany({
        where,
        include: {
          item: {
            select: {
              id: true,
              name: true,
              category: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { checkOutDate: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.inventoryCheckout.count({ where })
    ]);

    const pages = Math.ceil(total / Number(limit));

    res.json({
      checkouts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: { message: 'Failed to fetch checkout history' }
    });
  }
});

export default router;
