// Test Authentication Script
// Run with: node test-auth.js

const API_URL = 'http://localhost:1337/api';

async function testAuth() {
  console.log('🔍 Testing Strapi Authentication...\n');

  // Test 1: Check if backend is running
  console.log('1️⃣ Checking if backend is running...');
  try {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: { 'Authorization': 'Bearer invalid-token' }
    });
    console.log('✅ Backend is running on', API_URL);
  } catch (error) {
    console.error('❌ Backend is NOT running. Please start it with: cd backend && npm run develop');
    return;
  }

  // Test 2: Try to register a test user
  console.log('\n2️⃣ Testing user registration...');
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'Test123456'
  };

  try {
    const registerResponse = await fetch(`${API_URL}/auth/local/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const registerData = await registerResponse.json();

    if (registerResponse.ok) {
      console.log('✅ User registration successful!');
      console.log('   User ID:', registerData.user.id);
      console.log('   Email:', registerData.user.email);
      console.log('   JWT Token:', registerData.jwt.substring(0, 20) + '...');

      // Test 3: Try to login with the same credentials
      console.log('\n3️⃣ Testing user login...');
      const loginResponse = await fetch(`${API_URL}/auth/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: testUser.email,
          password: testUser.password
        })
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        console.log('✅ User login successful!');
        console.log('   User ID:', loginData.user.id);
        console.log('   Email:', loginData.user.email);
        console.log('   JWT Token:', loginData.jwt.substring(0, 20) + '...');

        // Test 4: Verify token works
        console.log('\n4️⃣ Testing authenticated request...');
        const meResponse = await fetch(`${API_URL}/users/me`, {
          headers: { 'Authorization': `Bearer ${loginData.jwt}` }
        });

        const meData = await meResponse.json();

        if (meResponse.ok) {
          console.log('✅ Authenticated request successful!');
          console.log('   User:', meData.username);
          console.log('   Email:', meData.email);
          
          console.log('\n✨ All authentication tests passed!');
          console.log('\n📝 You can now use these credentials to test login:');
          console.log('   Email:', testUser.email);
          console.log('   Password:', testUser.password);
        } else {
          console.error('❌ Authenticated request failed:', meData);
        }
      } else {
        console.error('❌ Login failed:', loginData);
      }
    } else {
      console.error('❌ Registration failed:', registerData);
      if (registerData.error?.message) {
        console.error('   Error:', registerData.error.message);
      }
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testAuth();
