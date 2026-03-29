const { PrismaClient } = require('@prisma/client');

// Test database connection
async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  // Use direct DATABASE_URL
  const DATABASE_URL = process.env.DATABASE_URL;
  
  console.log('🔗 Database URL:', DATABASE_URL.replace(/:([^@]+)@/, ':***@'));
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL
      }
    }
  });
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('📊 Database version:', result);
    
    // Check if User table exists
    try {
      const userCount = await prisma.user.count();
      console.log('👥 Users in database:', userCount);
    } catch (error) {
      console.log('❌ User table does not exist:', error.message);
      console.log('📝 Need to create tables...');
      
      // Try to create tables
      console.log('🔨 Creating database tables...');
      await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'USER',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );`;
      
      console.log('✅ User table created successfully!');
      
      // Create sample user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      await prisma.$executeRaw`INSERT INTO "User" (id, email, password, firstName, lastName, role, isActive, createdAt, updatedAt)
        VALUES (gen_random_uuid(), 'testuser@church.com', $1, 'Test', 'User', 'USER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (email) DO NOTHING;`, [hashedPassword];
      
      console.log('✅ Sample user created: testuser@church.com');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
