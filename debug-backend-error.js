/**
 * Debug script to identify the internal server error
 */

const API_URL = 'http://localhost:1337/api';

async function debugBackendError() {
  console.log('=== Debugging Backend Internal Server Error ===\n');

  // Test 1: Check if backend is running
  console.log('Test 1: Checking if backend is running...');
  try {
    const healthRes = await fetch(`${API_URL}/products?pagination[limit]=1`);
    console.log('Backend status:', healthRes.status);
    if (healthRes.ok) {
      console.log('✅ Backend is running\n');
    } else {
      console.log('⚠️  Backend returned:', healthRes.status, '\n');
    }
  } catch (error) {
    console.error('❌ Backend is not accessible:', error.message);
    console.log('Please start the backend with: cd backend && npm run develop\n');
    return;
  }

  // Test 2: Try to register a new user
  console.log('Test 2: Testing user registration...');
  const randomEmail = `test${Date.now()}@example.com`;
  try {
    const registerRes = await fetch(`${API_URL}/auth/local/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `testuser${Date.now()}`,
        email: randomEmail,
        password: 'Test1234!',
      }),
    });

    console.log('Registration status:', registerRes.status);
    
    if (registerRes.ok) {
      const data = await registerRes.json();
      console.log('✅ Registration successful');
      console.log('User ID:', data.user.id);
      console.log('Email:', data.user.email);
      console.log('Token:', data.jwt.substring(0, 20) + '...\n');
      
      // Use this token for further tests
      return data.jwt;
    } else {
      const error = await registerRes.text();
      console.log('❌ Registration failed');
      console.log('Error:', error, '\n');
    }
  } catch (error) {
    console.error('❌ Registration error:', error.message, '\n');
  }

  // Test 3: Try to login with existing user
  console.log('Test 3: Testing login with existing user...');
  try {
    const loginRes = await fetch(`${API_URL}/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'test@example.com',
        password: 'Test1234!',
      }),
    });

    console.log('Login status:', loginRes.status);
    
    if (loginRes.ok) {
      const data = await loginRes.json();
      console.log('✅ Login successful');
      console.log('User ID:', data.user.id);
      console.log('Email:', data.user.email);
      console.log('Token:', data.jwt.substring(0, 20) + '...\n');
      return data.jwt;
    } else {
      const error = await registerRes.text();
      console.log('❌ Login failed');
      console.log('Error:', error);
      console.log('Response body:', await loginRes.text(), '\n');
    }
  } catch (error) {
    console.error('❌ Login error:', error.message, '\n');
  }

  return null;
}

async function testWishlistEndpoints(token) {
  if (!token) {
    console.log('⚠️  No token available, skipping wishlist tests\n');
    return;
  }

  console.log('=== Testing Wishlist Endpoints ===\n');

  // Test 1: Fetch wishlist
  console.log('Test 1: Fetching wishlist...');
  try {
    const res = await fetch(`${API_URL}/wishlists?populate=product.image`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    console.log('Fetch wishlist status:', res.status);
    
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Fetch successful');
      console.log('Items in wishlist:', data.data.length);
      console.log('Response structure:', JSON.stringify(data, null, 2).substring(0, 500), '...\n');
    } else {
      const error = await res.text();
      console.log('❌ Fetch failed');
      console.log('Error:', error, '\n');
    }
  } catch (error) {
    console.error('❌ Fetch error:', error.message, '\n');
  }

  // Test 2: Add to wishlist
  console.log('Test 2: Adding product to wishlist...');
  try {
    const res = await fetch(`${API_URL}/wishlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          product: 1,
        },
      }),
    });

    console.log('Add to wishlist status:', res.status);
    
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Add successful');
      console.log('Wishlist item ID:', data.data.id);
      console.log('Product ID:', data.data.attributes?.product?.data?.id, '\n');
      return data.data.id;
    } else {
      const error = await res.text();
      console.log('❌ Add failed');
      console.log('Error:', error, '\n');
    }
  } catch (error) {
    console.error('❌ Add error:', error.message, '\n');
  }

  return null;
}

async function runDiagnostics() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║     Backend Error Diagnostic Tool         ║');
  console.log('╚════════════════════════════════════════════╝\n');

  const token = await debugBackendError();
  
  if (token) {
    await testWishlistEndpoints(token);
  }

  console.log('╔════════════════════════════════════════════╗');
  console.log('║              Diagnostic Complete           ║');
  console.log('╚════════════════════════════════════════════╝\n');

  console.log('Next steps:');
  console.log('1. Check the backend terminal for detailed error logs');
  console.log('2. Look for stack traces or error messages');
  console.log('3. Check if the database file exists: backend/.tmp/data.db');
  console.log('4. Try restarting the backend: cd backend && npm run develop');
}

runDiagnostics().catch(console.error);
