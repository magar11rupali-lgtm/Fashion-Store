// Check if account exists and test authentication
// Run with: node check-account.js

const API_URL = 'http://localhost:1337/api';
const TEST_EMAIL = 'magar11rupa@gmail.com';

async function checkAccount() {
  console.log('🔍 Checking account status for:', TEST_EMAIL);
  console.log('🌐 Backend URL:', API_URL);
  console.log('');

  // Step 1: Check if backend is running
  console.log('1️⃣ Checking if backend is running...');
  try {
    const healthCheck = await fetch(`${API_URL}/users/me`, {
      headers: { 'Authorization': 'Bearer invalid' }
    });
    console.log('✅ Backend is running on', API_URL);
  } catch (error) {
    console.error('❌ Backend is NOT running!');
    console.error('   Please start it with: cd backend && npm run develop');
    return;
  }

  // Step 2: Try to register the account
  console.log('\n2️⃣ Attempting to register account...');
  console.log('   Email:', TEST_EMAIL);
  
  const testPassword = 'Test123456';
  
  try {
    const registerRes = await fetch(`${API_URL}/auth/local/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'magar11rupa',
        email: TEST_EMAIL,
        password: testPassword,
      }),
    });

    const registerData = await registerRes.json();

    if (registerRes.ok) {
      console.log('✅ Account created successfully!');
      console.log('   User ID:', registerData.user.id);
      console.log('   Username:', registerData.user.username);
      console.log('   Email:', registerData.user.email);
      console.log('');
      console.log('📝 Use these credentials to sign in:');
      console.log('   Email:', TEST_EMAIL);
      console.log('   Password:', testPassword);
      console.log('');
      console.log('🎉 Now try signing in at: http://localhost:3000/auth/signin');
    } else {
      // Account might already exist
      if (registerData.error?.message?.toLowerCase().includes('email')) {
        console.log('ℹ️  Account already exists!');
        console.log('   The email', TEST_EMAIL, 'is already registered.');
        console.log('');
        
        // Try to login with common passwords
        console.log('3️⃣ Testing common passwords...');
        const commonPasswords = ['Test123456', 'password123', 'Password123', '123456'];
        
        let loginSuccess = false;
        for (const pwd of commonPasswords) {
          const loginRes = await fetch(`${API_URL}/auth/local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identifier: TEST_EMAIL,
              password: pwd,
            }),
          });

          if (loginRes.ok) {
            const loginData = await loginRes.json();
            console.log('✅ Found working password:', pwd);
            console.log('   User:', loginData.user.username);
            console.log('');
            console.log('📝 Use these credentials:');
            console.log('   Email:', TEST_EMAIL);
            console.log('   Password:', pwd);
            loginSuccess = true;
            break;
          }
        }

        if (!loginSuccess) {
          console.log('❌ Could not find the correct password.');
          console.log('');
          console.log('💡 Solutions:');
          console.log('   1. Try to remember your password');
          console.log('   2. Create a new account with different email');
          console.log('   3. Reset password in Strapi admin panel:');
          console.log('      - Go to http://localhost:1337/admin');
          console.log('      - Navigate to Content Manager → User');
          console.log('      - Find your user and edit password');
          console.log('   4. Delete database and start fresh:');
          console.log('      - Stop backend');
          console.log('      - Delete backend/.tmp/data.db');
          console.log('      - Restart backend');
          console.log('      - Create new account');
        }
      } else {
        console.error('❌ Registration failed:', registerData.error?.message);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
checkAccount();
