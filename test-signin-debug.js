// Test script to debug signin issue
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAuth() {
  console.log('🔍 Testing Strapi Authentication...\n');
  
  const API_URL = 'http://localhost:1337/api';
  
  // Test 1: Check if Strapi is running
  console.log('1️⃣ Checking if Strapi is running...');
  try {
    const healthCheck = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
    });
    console.log(`   Status: ${healthCheck.status}`);
    if (healthCheck.status === 401) {
      console.log('   ✅ Strapi is running (401 expected without auth)\n');
    }
  } catch (error) {
    console.error('   ❌ Strapi is not running or not accessible');
    console.error('   Error:', error.message);
    console.log('\n   Please start Strapi with: cd backend && npm run develop\n');
    return;
  }
  
  // Test 2: Try to authenticate with test credentials
  console.log('2️⃣ Testing authentication endpoint...');
  const testCredentials = [
    { identifier: 'test@example.com', password: 'Test123456' },
    { identifier: 'admin@example.com', password: 'Admin123456' },
    { identifier: 'user@example.com', password: 'User123456' },
  ];
  
  for (const creds of testCredentials) {
    console.log(`\n   Testing: ${creds.identifier}`);
    try {
      const response = await fetch(`${API_URL}/auth/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      
      const data = await response.json();
      console.log(`   Status: ${response.status}`);
      
      if (response.ok && data.jwt) {
        console.log('   ✅ Authentication successful!');
        console.log(`   User: ${data.user.username} (${data.user.email})`);
        console.log(`   JWT: ${data.jwt.substring(0, 20)}...`);
        return;
      } else {
        console.log(`   ❌ Failed: ${data.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`   ❌ Exception:`, error.message);
    }
  }
  
  console.log('\n3️⃣ No valid credentials found.');
  console.log('\n📝 To fix this issue:');
  console.log('   1. Make sure Strapi backend is running: cd backend && npm run develop');
  console.log('   2. Go to http://localhost:1337/admin');
  console.log('   3. Navigate to Content Manager > User (under Users-Permissions)');
  console.log('   4. Create a new user or check existing users');
  console.log('   5. Make sure the user is confirmed (confirmed: true)');
  console.log('   6. Try signing in with those credentials\n');
}

testAuth().catch(console.error);
