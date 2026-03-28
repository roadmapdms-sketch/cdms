const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAPI() {
  try {
    await prisma.$connect();
    console.log('✅ API Database connection working!');
    
    const users = await prisma.user.findMany({ take: 3 });
    console.log('📊 Users in database:', users.length);
    users.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email})`);
    });
    
  } catch (error) {
    console.error('❌ API Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();
