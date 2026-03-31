// =====================================================
// 🔍 API Debug Tool - Test Registration Process
// =====================================================

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Starting API Debug Process...');

// Test environment variables
console.log('📋 Environment Variables Check:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:', process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

// Test Supabase connection
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) {
  console.log('✅ Environment variables found, testing Supabase connection...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  );

  // Test basic connection
  supabase.from('users').select('count').then(
    result => {
      if (result.error) {
        console.log('❌ Supabase connection failed:', result.error.message);
        console.log('🔍 Error details:', result.error);
      } else {
        console.log('✅ Supabase connection successful!');
        console.log('📊 Current user count:', result.data?.length || 0);
        
        // Test table structure
        supabase.from('users').select('*').limit(1).then(
          tableResult => {
            if (tableResult.error) {
              console.log('❌ Users table access failed:', tableResult.error.message);
              if (tableResult.error.message.includes('does not exist')) {
                console.log('🔧 SOLUTION: Run setup_database_compatible.sql in Supabase');
              }
            } else {
              console.log('✅ Users table accessible');
              if (tableResult.data && tableResult.data.length > 0) {
                console.log('📋 Sample user structure:', Object.keys(tableResult.data[0]));
              }
            }
          }
        );
      }
    },
    error => {
      console.log('❌ Supabase client error:', error.message);
    }
  );
} else {
  console.log('❌ Environment variables not set');
  console.log('🔧 SOLUTION: Add environment variables in Vercel dashboard');
}

// Test registration process simulation
const testRegistration = {
  email: 'test@example.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User'
};

console.log('🧪 Testing registration with:', testRegistration);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req;
  
  if (url === '/api/debug') {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
        );

        // Test actual registration
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', testRegistration.email)
          .single();

        if (existingUser) {
          return res.json({
            status: 'USER_EXISTS',
            message: 'Test user already exists',
            user: existingUser
          });
        } else {
          return res.json({
            status: 'READY_FOR_REGISTRATION',
            message: 'Test registration data is valid',
            testData: testRegistration
          });
        }
      } else {
        return res.json({
          status: 'ENVIRONMENT_ERROR',
          message: 'Environment variables not set',
          envCheck: {
            NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
            JWT_SECRET: !!process.env.JWT_SECRET
          }
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: 'ERROR',
        message: error.message,
        error: error
      });
    }
  }

  return res.status(404).json({ error: { message: 'Debug endpoint not found' } });
};
