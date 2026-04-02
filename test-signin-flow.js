// Test the complete sign-in flow
const API_URL = 'http://localhost:1337/api';
const TEST_EMAIL = 'magar11rupa@gmail.com';
const TEST_PASSWORD = 'Test123456';

async function testSignIn() {
  console.log('🧪 Testing Sign-In Flow\n');
  
  // Test 1: Direct Strapi authentication
  console.log('1️⃣ Testing direct Strapi authentication...');
  try {
    const res = await fetch(`${API_URL}/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    });

    const data = await res.json();
    
    console.log('   Status:', res.status);
    console.log('   Response:', JSON.stringify(data, null, 2));
    
    if (res.ok && data.user) {
      console.log('   ✅ Direct authentication works!\n');
      
      // Test 2: Verify the JWT token works
      console.log('2️⃣ Testing JWT token...');
      const meRes = await fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${data.jwt}`
        }
      });
      
      const meData = await meRes.json();
      console.log('   Status:', meRes.status);
      console.log('   User data:', JSON.stringify(meData, null, 2));
      
      if (meRes.ok) {
        console.log('   ✅ JWT token works!\n');
      } else {
        console.log('   ❌ JWT token failed\n');
      }
      
      console.log('✅ Backend authentication is working correctly!');
      console.log('\n📝 Credentials to use:');
      console.log('   Email:', TEST_EMAIL);
      console.log('   Password:', TEST_PASSWORD);
      console.log('\n🌐 Try signing in at: http://localhost:3000/auth/signin');
      console.log('\n💡 If still getting CredentialsSignin error:');
      console.log('   1. Check browser console for detailed logs');
      console.log('   2. Check frontend terminal for NextAuth logs');
      console.log('   3. Verify NEXT_PUBLIC_API_URL in frontend/.env.local');
      console.log('   4. Try restarting the frontend server');
      
    } else {
      console.log('   ❌ Authentication failed:', data.error?.message);
      console.log('\n💡 The account might not exist or password is wrong.');
      console.log('   Run: node check-account.js');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure backend is running:');
    console.log('   cd backend && npm run develop');
  }
}

testSignIn();
