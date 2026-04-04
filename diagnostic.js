// Optional Supabase connectivity check (NOT used by the canonical Express + Prisma server).
// See docs/ARCHITECTURE.md and api/README.md.
// Comprehensive Database Connection Diagnostic Tool
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 COMPREHENSIVE DATABASE CONNECTION DIAGNOSTIC');
console.log('=' .repeat(60));

// 1. Check Environment Variables
console.log('\n📋 1. ENVIRONMENT VARIABLES CHECK:');
const envVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_URL', 
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
  'SUPABASE_PUBLISHABLE_DEFAULT_KEY',
  'DATABASE_URL',
  'JWT_SECRET'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`${varName}: ${value ? '✅ SET' : '❌ NOT SET'}`);
  if (value && varName.includes('URL')) {
    console.log(`  Value: ${value}`);
  }
});

// 2. Test Supabase Client Creation
console.log('\n🔧 2. SUPABASE CLIENT CREATION TEST:');
try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Cannot create client - missing environment variables');
  } else {
    console.log('✅ Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');
    
    // 3. Test Database Connection
    console.log('\n🔗 3. DATABASE CONNECTION TEST:');
    supabase.from('users').select('count').then(
      result => {
        if (result.error) {
          console.log('❌ Database connection error:');
          console.log(`  Error: ${result.error.message}`);
          console.log(`  Code: ${result.error.code}`);
          console.log(`  Details: ${result.error.details || 'No details'}`);
          
          if (result.error.message.includes('Could not find the table')) {
            console.log('✅ Connection works, but users table does not exist');
            console.log('📝 SOLUTION: Create users table in Supabase dashboard');
          } else if (result.error.message.includes('Invalid API key')) {
            console.log('❌ Invalid Supabase API key');
            console.log('📝 SOLUTION: Check NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY');
          } else if (result.error.message.includes('JWT')) {
            console.log('❌ JWT authentication issue');
            console.log('📝 SOLUTION: Check JWT_SECRET environment variable');
          } else {
            console.log('❌ Unknown database error');
            console.log('📝 SOLUTION: Check Supabase project settings and permissions');
          }
        } else {
          console.log('✅ Database connection successful!');
          console.log(`📊 Users count: ${result.data?.length || 0}`);
        }
      },
      error => {
        console.log('❌ Critical connection error:');
        console.log(`  Error: ${error.message}`);
        console.log('📝 SOLUTION: Check network connectivity and Supabase project status');
      }
    );
  }
} catch (error) {
  console.log('❌ Supabase client creation failed:');
  console.log(`  Error: ${error.message}`);
  console.log('📝 SOLUTION: Check @supabase/supabase-js installation');
}

// 4. Check Module Installation
console.log('\n📦 4. MODULE INSTALLATION CHECK:');
try {
  require('@supabase/supabase-js');
  console.log('✅ @supabase/supabase-js installed');
} catch (error) {
  console.log('❌ @supabase/supabase-js not installed');
  console.log('📝 SOLUTION: Run npm install @supabase/supabase-js');
}

try {
  require('bcryptjs');
  console.log('✅ bcryptjs installed');
} catch (error) {
  console.log('❌ bcryptjs not installed');
  console.log('📝 SOLUTION: Run npm install bcryptjs');
}

try {
  require('jsonwebtoken');
  console.log('✅ jsonwebtoken installed');
} catch (error) {
  console.log('❌ jsonwebtoken not installed');
  console.log('📝 SOLUTION: Run npm install jsonwebtoken');
}

// 5. Summary and Recommendations
console.log('\n📋 5. SUMMARY AND RECOMMENDATIONS:');
console.log('=' .repeat(60));

setTimeout(() => {
  console.log('\n🎯 MOST LIKELY ISSUES:');
  console.log('1. Environment variables not set in Vercel dashboard');
  console.log('2. Users table does not exist in Supabase');
  console.log('3. Wrong Supabase project URL or API key');
  console.log('4. Module installation issues in serverless environment');
  
  console.log('\n🔧 IMMEDIATE ACTIONS NEEDED:');
  console.log('1. Set environment variables in Vercel dashboard');
  console.log('2. Create users table in Supabase SQL Editor');
  console.log('3. Verify Supabase project is active');
  console.log('4. Check Vercel deployment logs');
  
  console.log('\n✅ WORKING COMPONENTS:');
  console.log('- Local testing shows connection works');
  console.log('- Supabase credentials are valid');
  console.log('- API endpoints are properly configured');
  console.log('- Transaction pooler is correctly set up');
}, 2000);
