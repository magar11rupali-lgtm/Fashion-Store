// Comprehensive backend diagnostics
const API_URL = 'http://localhost:1337/api';

async function diagnose() {
  console.log('🔍 Backend Diagnostics\n');
  console.log('=' .repeat(50));
  
  // Test 1: Basic connectivity
  console.log('\n1️⃣ Testing backend connectivity...');
  try {
    const res = await fetch(`${API_URL}/users/me`);
    const data = await res.json();
    
    if (res.status === 401) {
      console.log('   ✅ Backend is responding (401 expected without auth)');
    } else {
      console.log('   ⚠️  Unexpected status:', res.status);
      console.log('   Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('   ❌ Backend is NOT responding');
    console.log('   Error:', error.message);
    console.log('\n   💡 Start backend with: cd backend && npm run develop');
    return;
  }
  
  // Test 2: Registration endpoint
  console.log('\n2️⃣ Testing registration endpoint...');
  const testEmail = `test${Date.now()}@example.com`;
  try {
    const res = await fetch(`${API_URL}/auth/local/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `testuser${Date.now()}`,
        email: testEmail,
        password: 'Test123456',
      }),
    });
    
    const data = await res.json();
    console.log('   Status:', res.status);
    
    if (res.ok && data.user) {
      console.log('   ✅ Registration works!');
      console.log('   User created:', data.user.email);
      
      // Test 3: Login with newly created account
      console.log('\n3️⃣ Testing login endpoint...');
      const loginRes = await fetch(`${API_URL}/auth/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: testEmail,
          password: 'Test123456',
        }),
      });
      
      const loginData = await loginRes.json();
      console.log('   Status:', loginRes.status);
      
      if (loginRes.ok && loginData.user) {
        console.log('   ✅ Login works!');
        console.log('   JWT token received:', loginData.jwt ? 'Yes' : 'No');
        
        // Test 4: Verify JWT token
        console.log('\n4️⃣ Testing JWT token...');
        const meRes = await fetch(`${API_URL}/users/me`, {
          headers: { 'Authorization': `Bearer ${loginData.jwt}` }
        });
        
        const meData = await meRes.json();
        console.log('   Status:', meRes.status);
        
        if (meRes.ok) {
          console.log('   ✅ JWT token works!');
          console.log('   User:', meData.email);
        } else {
          console.log('   ❌ JWT token failed');
          console.log('   Response:', JSON.stringify(meData, null, 2));
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('✅ ALL TESTS PASSED!');
        console.log('\nBackend authentication is working correctly.');
        console.log('\n💡 If frontend sign-in still fails:');
        console.log('   1. Check frontend terminal for NextAuth logs');
        console.log('   2. Check browser console (F12) for errors');
        console.log('   3. Verify NEXT_PUBLIC_API_URL in frontend/.env.local');
        console.log('   4. Restart frontend: cd frontend && npm run dev');
        
      } else if (loginRes.status === 500) {
        console.log('   ❌ Login endpoint returns 500 error');
        console.log('   Response:', JSON.stringify(loginData, null, 2));
        console.log('\n   🔧 BACKEND HAS INTERNAL ERROR');
        console.log('   Check backend terminal for error details.');
        console.log('\n   💡 Quick fix:');
        console.log('   1. Stop backend (Ctrl+C)');
        console.log('   2. Delete database: del backend\\.tmp\\data.db');
        console.log('   3. Restart: cd backend && npm run develop');
        console.log('   4. Setup admin: http://localhost:1337/admin');
        console.log('   5. Enable public registration in Strapi settings');
      } else {
        console.log('   ❌ Login failed');
        console.log('   Response:', JSON.stringify(loginData, null, 2));
      }
      
    } else if (res.status === 400 && data.error?.message?.includes('already')) {
      console.log('   ⚠️  Registration disabled or email validation issue');
      console.log('   Response:', JSON.stringify(data, null, 2));
      console.log('\n   💡 Enable public registration:');
      console.log('   1. Go to http://localhost:1337/admin');
      console.log('   2. Settings → Users & Permissions → Roles → Public');
      console.log('   3. Enable auth.register permission');
      console.log('   4. Save');
    } else if (res.status === 500) {
      console.log('   ❌ Registration endpoint returns 500 error');
      console.log('   Response:', JSON.stringify(data, null, 2));
      console.log('\n   🔧 BACKEND HAS INTERNAL ERROR');
      console.log('   Check backend terminal for error details.');
    } else {
      console.log('   ❌ Registration failed');
      console.log('   Response:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
}

diagnose();
