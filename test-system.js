#!/usr/bin/env node

/**
 * Church Data Management System - Test Script
 * 
 * This script performs basic health checks and functionality tests
 * to verify that the CDMS system is working correctly.
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logTest(message) {
  log(`🧪 ${message}`, colors.cyan);
}

// Test helper functions
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      timeout: TEST_CONFIG.timeout,
      headers
    };

    if (data) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status 
    };
  }
}

async function retryRequest(method, endpoint, data, headers) {
  let lastError;
  
  for (let attempt = 1; attempt <= TEST_CONFIG.retryAttempts; attempt++) {
    const result = await makeRequest(method, endpoint, data, headers);
    
    if (result.success) {
      return result;
    }
    
    lastError = result.error;
    
    if (attempt < TEST_CONFIG.retryAttempts) {
      logWarning(`Attempt ${attempt} failed for ${method} ${endpoint}. Retrying...`);
      await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.retryDelay));
    }
  }
  
  return { success: false, error: lastError };
}

// Test functions
async function testServerHealth() {
  logTest('Testing server health...');
  
  const result = await makeRequest('GET', '/health');
  
  if (result.success) {
    logSuccess(`Server is healthy - Status: ${result.data.status}`);
    logInfo(`Uptime: ${result.data.uptime}s`);
    logInfo(`Memory usage: ${Math.round(result.data.memory.heapUsed / 1024 / 1024)}MB`);
    return true;
  } else {
    logError(`Server health check failed: ${result.error}`);
    return false;
  }
}

async function testAuthentication() {
  logTest('Testing authentication...');
  
  // Test login with invalid credentials
  const invalidLogin = await makeRequest('POST', '/auth/login', {
    email: 'invalid@test.com',
    password: 'wrongpassword'
  });
  
  if (!invalidLogin.success && invalidLogin.status === 401) {
    logSuccess('Invalid login correctly rejected');
  } else {
    logError('Invalid login should be rejected');
    return false;
  }
  
  // Test login with valid credentials (if test user exists)
  const validLogin = await makeRequest('POST', '/auth/login', {
    email: 'admin@church.com',
    password: 'admin123'
  });
  
  if (validLogin.success) {
    logSuccess('Valid login successful');
    return validLogin.data.token;
  } else {
    logWarning('Valid login failed (test user may not exist)');
    return null;
  }
}

async function testMembersAPI(token) {
  logTest('Testing members API...');
  
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
  // Test getting members without authentication
  const unauthorized = await makeRequest('GET', '/members', null, headers);
  
  if (!token && !unauthorized.success && unauthorized.status === 401) {
    logSuccess('Unauthorized access correctly blocked');
  } else if (token) {
    // Test getting members with authentication
    const members = await makeRequest('GET', '/members', null, headers);
    
    if (members.success) {
      logSuccess(`Members API working - Found ${members.data.members?.length || 0} members`);
      
      // Test creating a member
      const newMember = await makeRequest('POST', '/members', {
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@example.com`,
        phone: '+1234567890',
        status: 'ACTIVE'
      }, headers);
      
      if (newMember.success) {
        logSuccess('Member creation successful');
        
        // Test updating the member
        const updateMember = await makeRequest('PUT', `/members/${newMember.data.id}`, {
          firstName: 'Updated',
          lastName: 'User'
        }, headers);
        
        if (updateMember.success) {
          logSuccess('Member update successful');
          
          // Test deleting the member
          const deleteMember = await makeRequest('DELETE', `/members/${newMember.data.id}`, null, headers);
          
          if (deleteMember.success) {
            logSuccess('Member deletion successful');
          } else {
            logError('Member deletion failed');
          }
        } else {
          logError('Member update failed');
        }
      } else {
        logError('Member creation failed');
      }
    } else {
      logError('Members API failed');
    }
  }
}

async function testEventsAPI(token) {
  logTest('Testing events API...');
  
  const headers = { Authorization: `Bearer ${token}` };
  
  const events = await makeRequest('GET', '/events', null, headers);
  
  if (events.success) {
    logSuccess(`Events API working - Found ${events.data.events?.length || 0} events`);
    
    // Test creating an event
    const newEvent = await makeRequest('POST', '/events', {
      title: 'Test Event',
      description: 'Test event description',
      type: 'MEETING',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3600000).toISOString(),
      location: 'Test Location'
    }, headers);
    
    if (newEvent.success) {
      logSuccess('Event creation successful');
      
      // Clean up - delete test event
      await makeRequest('DELETE', `/events/${newEvent.data.id}`, null, headers);
    } else {
      logError('Event creation failed');
    }
  } else {
    logError('Events API failed');
  }
}

async function testReportsAPI(token) {
  logTest('Testing reports API...');
  
  const headers = { Authorization: `Bearer ${token}` };
  
  const dashboard = await makeRequest('GET', '/reports/dashboard', null, headers);
  
  if (dashboard.success) {
    logSuccess('Dashboard API working');
    logInfo(`Total members: ${dashboard.data.overview?.totalMembers || 0}`);
    logInfo(`Total events: ${dashboard.data.overview?.totalEvents || 0}`);
  } else {
    logError('Dashboard API failed');
  }
}

async function testDatabaseConnection() {
  logTest('Testing database connection...');
  
  try {
    // This would require importing the Prisma client
    // For now, we'll test it indirectly through the health endpoint
    const result = await makeRequest('GET', '/health');
    
    if (result.success) {
      logSuccess('Database connection appears to be working');
      return true;
    }
  } catch (error) {
    logError('Database connection test failed');
    return false;
  }
  
  return false;
}

async function runPerformanceTest() {
  logTest('Running performance test...');
  
  const startTime = Date.now();
  const requests = [];
  const concurrentRequests = 10;
  
  // Make concurrent requests
  for (let i = 0; i < concurrentRequests; i++) {
    requests.push(makeRequest('GET', '/health'));
  }
  
  await Promise.all(requests);
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  const avgResponseTime = totalTime / concurrentRequests;
  
  logInfo(`Performance test completed:`);
  logInfo(`  - Total time: ${totalTime}ms`);
  logInfo(`  - Average response time: ${avgResponseTime}ms`);
  logInfo(`  - Requests per second: ${(concurrentRequests / totalTime * 1000).toFixed(2)}`);
  
  if (avgResponseTime < 1000) {
    logSuccess('Performance is good');
  } else if (avgResponseTime < 3000) {
    logWarning('Performance is acceptable');
  } else {
    logError('Performance needs improvement');
  }
}

async function generateTestReport(results) {
  log('\n' + '='.repeat(60));
  log('📊 TEST REPORT SUMMARY', colors.cyan);
  log('='.repeat(60));
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;
  const failedTests = totalTests - passedTests;
  
  log(`Total Tests: ${totalTests}`);
  logSuccess(`Passed: ${passedTests}`);
  
  if (failedTests > 0) {
    logError(`Failed: ${failedTests}`);
  }
  
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  log(`Success Rate: ${successRate}%`);
  
  if (passedTests === totalTests) {
    logSuccess('\n🎉 All tests passed! The system is ready for deployment.');
  } else {
    logWarning('\n⚠️  Some tests failed. Please review the issues above.');
  }
  
  log('='.repeat(60));
}

// Main test execution
async function runTests() {
  log('🚀 Starting Church Data Management System Tests', colors.blue);
  log('='.repeat(60));
  
  const results = {};
  
  // Basic connectivity test
  results.serverHealth = await testServerHealth();
  
  if (!results.serverHealth) {
    logError('Server is not responding. Please ensure the server is running on port 5000.');
    return;
  }
  
  // Database connection test
  results.databaseConnection = await testDatabaseConnection();
  
  // Authentication tests
  const token = await testAuthentication();
  results.authentication = !!token;
  
  if (token) {
    // API tests (require authentication)
    results.membersAPI = await testMembersAPI(token);
    results.eventsAPI = await testEventsAPI(token);
    results.reportsAPI = await testReportsAPI(token);
  }
  
  // Performance test
  await runPerformanceTest();
  
  // Generate report
  await generateTestReport(results);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logError(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    logError(`Test execution failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testServerHealth,
  testAuthentication,
  testMembersAPI,
  testEventsAPI,
  testReportsAPI
};
