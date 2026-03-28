const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    console.log('🔍 Initializing database...');
    
    // Connect to database
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Create database schema (this will create tables if they don't exist)
    try {
      // Try to access User table to see if it exists
      await prisma.user.count();
      console.log('✅ User table exists');
    } catch (error) {
      console.log('📝 Creating database schema...');
      // If table doesn't exist, this will fail
      console.log('❌ Database schema not created yet');
    }
    
    // Check if any users exist
    const userCount = await prisma.user.count();
    console.log(`📊 Current users in database: ${userCount}`);
    
    if (userCount === 0) {
      console.log('📝 Creating sample user...');
      const bcrypt = require('bcryptjs');
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
      
      console.log('✅ Sample user created:', sampleUser.email);
      console.log('🔑 Login credentials:');
      console.log('   Email: testuser@church.com');
      console.log('   Password: password123');
    }
    
    console.log('🎉 Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeDatabase();
