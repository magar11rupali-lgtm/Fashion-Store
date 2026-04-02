// Test frontend authentication flow
const API_URL = 'http://localhost:1337/api';

async function testFrontendAuth() {
  console.log('🧪 Testing Frontend Authentication Flow\n');
  console.log('=' .repeat(60));
  
  // Create a test account
  const testEmail = 'frontendtest@example.com';
  const testPassword = 'Test123456';
  
  console.log('\n1️⃣ Creating test account...');
  try {
    // First, try to register
    const regRes = await fetch(`${API_URL}/auth/local/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'frontendtest',
        email: testEmail,
        password: testPassword,
      }),
    });
    
    const regData = await regRes.json();
    
    if (regRes.ok) {
      console.log('   ✅ Account created:', testEmail);
    } else if (regData.error?.message?.includes('already')) {
      console.log('   ℹ️  Account already exists:', testEmail);
    } else {
      console.log('   ❌ Registration failed:', regData.error?.message);
      return;
    }
    
    // Now test login exactly as NextAuth does
    console.log('\n2️⃣ Testing login (as NextAuth does)...');
    const loginRes = await fetch(`${API_URL}/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testEmail,
        password: testPassword,
      }),
    });
    
    const loginData = await loginRes.json();
    
    console.log('   Status:', loginRes.status);
    console.log('   Response:', JSON.stringify(loginData, null, 2));
    
    if (loginRes.ok && loginData.user && loginData.jwt) {
      console.log('\n   ✅ Login successful!');
      console.log('   User ID:', loginData.user.id);
      console.log('   Username:', loginData.user.username);
      console.log('   Email:', loginData.user.email);
      console.log('   JWT:', loginData.jwt.substring(0, 20) + '...');
      
      console.log('\n' + '='.repeat(60));
      console.log('✅ BACKEND AUTHENTICATION WORKS PERFECTLY!');
      console.log('='.repeat(60));
      
      console.log('\n📝 Test Credentials:');
      console.log('   Email:', testEmail);
      console.log('   Password:', testPassword);
      
      console.log('\n🔧 If frontend still fails, the issue is:');
      console.log('   1. NextAuth configuration problem');
      console.log('   2. Frontend not reading .env.local correctly');
      console.log('   3. Frontend needs restart');
      
      console.log('\n💡 SOLUTION:');
      console.log('   1. Stop frontend (Ctrl+C)');
      console.log('   2. Restart: cd frontend && npm run dev');
      console.log('   3. Try signing in with:');
      console.log('      Email:', testEmail);
      console.log('      Password:', testPassword);
      console.log('   4. Check browser console (F12) for errors');
      console.log('   5. Check frontend terminal for NextAuth logs\n');
      
    } else {
      console.log('\n   ❌ Login failed');
      console.log('   This should not happen if backend is working\n');
    }
    
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
}

testFrontendAuth();
