const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Database connection
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    
    const { url, method } = req;
    
    // Handle different API routes
    if (url === '/api/auth/register' && method === 'POST') {
      return handleRegister(req, res);
    }
    
    if (url === '/api/auth/login' && method === 'POST') {
      return handleLogin(req, res);
    }
    
    if (url === '/api/health') {
      return res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
    }
    
    // For any other API route
    if (url.startsWith('/api/')) {
      return res.status(404).json({ error: { message: 'API endpoint not found' } });
    }
    
    // For non-API routes, this shouldn't be called but handle gracefully
    return res.status(404).json({ error: { message: 'Not found' } });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: { message: 'Internal server error' } });
  } finally {
    await prisma.$disconnect();
  }
};

async function handleRegister(req, res) {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: { message: 'All fields are required' } });
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: { message: 'User already exists' } });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'USER',
        isActive: true
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
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );
    
    console.log('✅ User created:', email);
    
    return res.status(201).json({
      message: 'User created successfully',
      user,
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: { message: 'Internal server error' } });
  }
}

async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: { message: 'Email and password are required' } });
    }
    
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );
    
    console.log('✅ User logged in:', email);
    
    return res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: { message: 'Internal server error' } });
  }
}
