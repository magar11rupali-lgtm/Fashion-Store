// Automated authentication fix script
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:1337/api';
const ADMIN_URL = 'http://localhost:1337/admin';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkBackend() {
  console.log('🔍 Checking if backend is running...');
  try {
    const res = await fetch(`${API_URL}/users/me`);
    if (res.status === 401 || res.status === 500) {
      console.log('✅ Backend is running on http://localhost:1337\n');
      return true;
    }
  } catch (error) {
    console.log('❌ Backend is NOT running!\n');
    console.log('Please start it with:');
    console.log('  cd backend');
    console.log('  npm run develop\n');
    return false;
  }
}

async function testAuth() {
  console.log('🧪 Testing authentication...\n');
  
  // Test registration
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'Test123456';
  
  console.log('1️⃣ Testing registration...');
  try {
    const regRes = await fetch(`${API_URL}/auth/local/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `testuser${Date.now()}`,
        email: testEmail,
        password: testPassword,
      }),
    });
    
    const regData = await regRes.json();
    
    if (regRes.ok && regData.user) {
      console.log('   ✅ Registration works!\n');
      
      // Test login
      console.log('2️⃣ Testing login...');
      await sleep(1000); // Wait a bit
      
      const loginRes = await fetch(`${API_URL}/auth/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: testEmail,
          password: testPassword,
        }),
      });
      
      const loginData = await loginRes.json();
      
      if (loginRes.ok && loginData.user) {
        console.log('   ✅ Login works!\n');
        console.log('=' .repeat(60));
        console.log('✅ AUTHENTICATION IS WORKING!');
        console.log('=' .repeat(60));
        console.log('\n📝 You can now sign in at: http://localhost:3000/auth/signin');
        console.log('\n💡 Create your account:');
        console.log('   1. Go to: http://localhost:3000/auth/signup');
        console.log('   2. Fill in your details');
        console.log('   3. Click "Sign Up"');
        console.log('   4. Then sign in with those credentials\n');
        return true;
      } else if (loginRes.status === 500) {
        console.log('   ❌ Login returns 500 error\n');
        console.log('=' .repeat(60));
        console.log('❌ BACKEND HAS INTERNAL ERROR');
        console.log('=' .repeat(60));
        console.log('\n🔧 FIX REQUIRED:\n');
        console.log('The backend database is corrupted. Follow these steps:\n');
        console.log('1. Stop the backend (Ctrl+C in backend terminal)');
        console.log('2. Delete database:');
        console.log('   del backend\\.tmp\\data.db');
        console.log('3. Restart backend:');
        console.log('   cd backend');
        console.log('   npm run develop');
        console.log('4. Setup admin account:');
        console.log('   http://localhost:1337/admin');
        console.log('5. Enable public registration:');
        console.log('   Settings → Users & Permissions → Roles → Public');
        console.log('   Enable all auth.* permissions');
        console.log('6. Run this script again: node fix-auth-automated.js\n');
        return false;
      } else {
        console.log('   ❌ Login failed:', loginData.error?.message || 'Unknown error\n');
        return false;
      }
    } else if (regRes.status === 400) {
      console.log('   ⚠️  Registration might be disabled\n');
      console.log('=' .repeat(60));
      console.log('⚠️  PUBLIC REGISTRATION NOT ENABLED');
      console.log('=' .repeat(60));
      console.log('\n🔧 FIX REQUIRED:\n');
      console.log('Enable public registration in Strapi:\n');
      console.log('1. Go to: http://localhost:1337/admin');
      console.log('2. Login to admin panel');
      console.log('3. Click: Settings → Users & Permissions plugin → Roles');
      console.log('4. Click: Public');
      console.log('5. Enable these permissions:');
      console.log('   ✅ auth.callback');
      console.log('   ✅ auth.connect');
      console.log('   ✅ auth.forgotPassword');
      console.log('   ✅ auth.register');
      console.log('   ✅ auth.resetPassword');
      console.log('   ✅ auth.emailConfirmation');
      console.log('6. Click: Save');
      console.log('7. Run this script again: node fix-auth-automated.js\n');
      return false;
    } else if (regRes.status === 500) {
      console.log('   ❌ Registration returns 500 error\n');
      console.log('=' .repeat(60));
      console.log('❌ BACKEND HAS INTERNAL ERROR');
      console.log('=' .repeat(60));
      console.log('\nSee fix steps above.\n');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message, '\n');
    return false;
  }
}

async function checkDatabase() {
  const dbPath = path.join(__dirname, 'backend', '.tmp', 'data.db');
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    console.log('📊 Database info:');
    console.log('   Location:', dbPath);
    console.log('   Size:', Math.round(stats.size / 1024), 'KB');
    console.log('   Modified:', stats.mtime.toLocaleString());
    console.log('');
  } else {
    console.log('⚠️  Database not found at:', dbPath);
    console.log('   Backend needs to be started to create it.\n');
  }
}

async function main() {
  console.log('🔧 Authentication Fix Tool');
  console.log('=' .repeat(60));
  console.log('');
  
  // Check database
  checkDatabase();
  
  // Check backend
  const backendRunning = await checkBackend();
  if (!backendRunning) {
    return;
  }
  
  // Test authentication
  await testAuth();
}

main();
