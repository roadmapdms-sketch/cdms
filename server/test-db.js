const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Database connection
const prisma = new PrismaClient();

async function createSampleUser() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Connect to database
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Check if sample user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'testuser@church.com' }
    });
    
    if (existingUser) {
      console.log('✅ Sample user already exists:', existingUser.email);
      console.log('📊 User details:', {
        id: existingUser.id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        role: existingUser.role,
        isActive: existingUser.isActive,
        createdAt: existingUser.createdAt
      });
      return;
    }
    
    // Create sample user
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const sampleUser = await prisma.user.create({
      data: {
        email: 'testuser@church.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        isActive: true
      }
    });
    
    console.log('✅ Sample user created successfully!');
    console.log('📊 User details:', {
      id: sampleUser.id,
      email: sampleUser.email,
      firstName: sampleUser.firstName,
      lastName: sampleUser.lastName,
      role: sampleUser.role,
      isActive: sampleUser.isActive,
      createdAt: sampleUser.createdAt
    });
    
    console.log('🔑 Login credentials:');
    console.log('   Email: testuser@church.com');
    console.log('   Password: password123');
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
createSampleUser();
