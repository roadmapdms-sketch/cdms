"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, role = 'USER' } = req.body;
        // Validate input
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                error: { message: 'All fields are required' }
            });
        }
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({
                error: { message: 'User already exists' }
            });
        }
        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });
        // Generate JWT token
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        res.status(201).json({
            message: 'User created successfully',
            user,
            token
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: { message: 'Internal server error' }
        });
    }
});
// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                error: { message: 'Email and password are required' }
            });
        }
        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user || !user.isActive) {
            return res.status(401).json({
                error: { message: 'Invalid credentials' }
            });
        }
        // Check password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                error: { message: 'Invalid credentials' }
            });
        }
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        // Generate JWT token
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        res.json({
            message: 'Login successful',
            user: userWithoutPassword,
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: { message: 'Internal server error' }
        });
    }
});
// Get current user profile
router.get('/profile', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            return res.status(404).json({
                error: { message: 'User not found' }
            });
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            error: { message: 'Internal server error' }
        });
    }
});
// Update user profile
router.put('/profile', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { firstName, lastName } = req.body;
        const user = await prisma.user.update({
            where: { id: userId },
            data: { firstName, lastName },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.json({
            message: 'Profile updated successfully',
            user
        });
    }
    catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            error: { message: 'Internal server error' }
        });
    }
});
// Change password
router.put('/password', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: { message: 'Current and new passwords are required' }
            });
        }
        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({
                error: { message: 'User not found' }
            });
        }
        // Verify current password
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                error: { message: 'Current password is incorrect' }
            });
        }
        // Hash new password
        const saltRounds = 12;
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, saltRounds);
        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({
            error: { message: 'Internal server error' }
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map