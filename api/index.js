const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

module.exports = async (req, res) => {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('✅ Connected to Supabase');
    console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    // Initialize database if needed (create sample user if no users exist)
    await initializeDatabaseIfNeeded();
    
    const { url, method } = req;
    
    // Handle different API routes
    if (url === '/api/auth/register' && method === 'POST') {
      return handleRegister(req, res);
    }
    
    if (url === '/api/auth/login' && method === 'POST') {
      return handleLogin(req, res);
    }
    
    if (url === '/api/health') {
      const { data: users, error } = await supabase.from('users').select('count');
      const userCount = users?.length || 0;
      
      return res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        database: 'Supabase',
        users: userCount,
        host: process.env.NEXT_PUBLIC_SUPABASE_URL
      });
    }
    
    if (url === '/api/reset-db' && method === 'POST') {
      return handleResetDatabase(req, res);
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
  }
};

async function initializeDatabaseIfNeeded() {
  try {
    const { data: users, error } = await supabase.from('users').select('count');
    
    if (!users || users.length === 0) {
      console.log('📝 Creating sample user for first-time setup...');
      
      // Create sample user
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      const { data: sampleUser, error: createError } = await supabase
        .from('users')
        .insert([{
          email: 'testuser@church.com',
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (createError) {
        console.log('ℹ️ Sample user creation failed:', createError.message);
      } else {
        console.log('✅ Sample user created:', sampleUser.email);
        console.log('🔑 Login credentials:');
        console.log('   Email: testuser@church.com');
        console.log('   Password: password123');
      }
    }
  } catch (error) {
    console.log('ℹ️ Database initialization check completed');
  }
}

async function handleRegister(req, res) {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: { message: 'All fields are required' } });
    }
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return res.status(400).json({ error: { message: 'User already exists' } });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'USER',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ error: { message: 'Failed to create user' } });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );
    
    console.log('✅ User created:', email);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword,
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
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !user || !user.isActive) {
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

async function handleResetDatabase(req, res) {
  try {
    // Clear all users
    await supabase.from('users').delete().neq('id', '');
    console.log('🗑️ Database cleared - all users deleted');
    
    // Create new sample user
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const { data: sampleUser, error } = await supabase
      .from('users')
      .insert([{
        email: 'testuser@church.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Sample user creation error:', error);
      return res.status(500).json({ error: { message: 'Failed to create sample user' } });
    }
    
    console.log('✅ New sample user created:', sampleUser.email);
    console.log('🔑 Login credentials:');
    console.log('   Email: testuser@church.com');
    console.log('   Password: password123');
    
    return res.status(200).json({
      message: 'Database reset successfully',
      user: {
        email: sampleUser.email,
        firstName: sampleUser.firstName,
        lastName: sampleUser.lastName
      }
    });
    
  } catch (error) {
    console.error('Database reset error:', error);
    return res.status(500).json({ error: { message: 'Internal server error' } });
  }
}
