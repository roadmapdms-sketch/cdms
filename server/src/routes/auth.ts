import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, Prisma } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { REGISTRATION_ALLOWED_ROLES } from '../constants/accessRoles';
import { generateMemberId } from '../utils/memberId';

const router = express.Router();
const prisma = new PrismaClient();

const isDev = () => process.env.NODE_ENV !== 'production';

/** Safe client message + HTTP status for registration failures (no secrets in production). */
function registrationFailure(error: unknown): { status: number; message: string } {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const targets = (error.meta?.target as string[] | undefined) ?? [];
      const label = targets.some((t) => /email/i.test(String(t))) ? 'email' : 'field';
      return { status: 400, message: `An account with this ${label} already exists.` };
    }
    if (isDev()) {
      return { status: 500, message: `Database error ${error.code}: ${error.message}` };
    }
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      status: 400,
      message: isDev() ? error.message : 'Invalid registration data.',
    };
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      status: 503,
      message:
        'Cannot connect to the database. Check DATABASE_URL and that the database accepts connections.',
    };
  }
  const msg = error instanceof Error ? error.message : String(error);
  const msgLower = msg.toLowerCase();
  if (/JWT_SECRET/i.test(msg)) {
    return { status: 500, message: 'Server is misconfigured (JWT secret missing).' };
  }
  if (
    msg.includes("Can't reach database") ||
    msg.includes('P1001') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('ETIMEDOUT')
  ) {
    return {
      status: 503,
      message:
        'Cannot reach the database from the server. Verify DATABASE_URL (pooler) and network access.',
    };
  }
  if (msg.includes('does not exist') && (msg.includes('relation') || msg.includes('table'))) {
    return {
      status: 503,
      message:
        'Database tables are missing. Apply migrations (e.g. GitHub Action or Supabase SQL) before registering.',
    };
  }
  if (
    msgLower.includes('permission denied') ||
    msgLower.includes('insufficient privilege') ||
    msg.includes('42501')
  ) {
    return {
      status: 503,
      message:
        'The database rejected this insert (permissions or Row Level Security). In Supabase: Table Editor → users → RLS — add a policy allowing INSERT for your connection role, or use the service role only from a trusted server.',
    };
  }
  if (
    (msgLower.includes('prepared statement') && msgLower.includes('does not exist')) ||
    msgLower.includes('protocol violation') ||
    msgLower.includes('bind message supplies')
  ) {
    return {
      status: 503,
      message:
        'Database pooler rejected the query (PgBouncer / prepared statements). Keep ?pgbouncer=true on DATABASE_URL and use Prisma 5+; or try the session pooler URI from Supabase if problems persist.',
    };
  }
  if (isDev()) {
    const name = error instanceof Error ? error.constructor.name : typeof error;
    return {
      status: 500,
      message: `Registration failed (dev ${name}): ${msg.slice(0, 500)}`,
    };
  }
  return { status: 500, message: 'Registration failed. Please try again later.' };
}

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role: requestedRole } = req.body;

    const role = REGISTRATION_ALLOWED_ROLES.includes(requestedRole)
      ? requestedRole
      : 'USER';

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
    const hashedPassword = await bcrypt.hash(password, saltRounds);

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

    // Keep directory in sync: self-service registrations should appear in Members.
    // If a member with this email already exists, do not duplicate.
    if (email) {
      const existingMember = await prisma.member.findUnique({ where: { email } });
      if (!existingMember) {
        await prisma.member.create({
          data: {
            id: generateMemberId(),
            firstName,
            lastName,
            email,
            status: 'ACTIVE',
            membershipDate: new Date(),
          },
        });
      }
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.status(201).json({
      message: 'User created successfully',
      user,
      token
    });
  } catch (error: unknown) {
    const { status, message } = registrationFailure(error);
    console.error('Registration error:', error);
    res.status(status).json({ error: { message } });
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
    const isValidPassword = await bcrypt.compare(password, user.password);

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
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: { message: 'Internal server error' } 
    });
  }
});

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;

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
  } catch (error: any) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      error: { message: 'Internal server error' } 
    });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
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
  } catch (error: any) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      error: { message: 'Internal server error' } 
    });
  }
});

// Change password
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
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
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ 
        error: { message: 'Current password is incorrect' } 
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Password change error:', error);
    res.status(500).json({ 
      error: { message: 'Internal server error' } 
    });
  }
});

export default router;
