/**
 * Test script to diagnose signin issues
 */

const API_URL = 'http://localhost:1337/api';

async function testSignIn() {
  console.log('🔍 Testing Sign In Flow\n');
  console.log('API URL:', API_URL);
  console.log('');

  // Test 1: Check if backend is running
  console.log('1️⃣ Checking if backend is running...');
  try {
    const healthCheck = await fetch(`${API_URL.replace('/api', '')}/`);
    console.log('✓ Backend is running (status:', healthCheck.status, ')');
  } catch (error) {
    console.error('✗ Backend is not running or not accessible');
    console.error('   Error:', error.message);
    console.log('\n💡 Start the backend with: cd backend && npm run develop\n');
    return;
  }

  // Test 2: Try to authenticate with test credentials
  console.log('\n2️⃣ Testing authentication endpoint...');
  
  const testCredentials = [
    { email: 'test@example.com', password: 'Test123456' },
    { email: 'user@example.com', password: 'Password123' },
    { email: 'admin@example.com', password: 'Admin123456' },
  ];

  for (const creds of testCredentials) {
    console.log(`\n   Testing: ${creds.email}`);
    
    try {
      const res = await fetch(`${API_URL}/auth/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: creds.email,
          password: creds.password,
        }),
      });

      console.log('   Response status:', res.status);
      
      const data = await res.json();
      
      if (res.ok && data.jwt) {
        console.log('   ✓ Authentication successful!');
        console.log('   User ID:', data.user.id);
        console.log('   Username:', data.user.username);
        console.log('   Email:', data.user.email);
        console.log('   JWT token:', data.jwt.substring(0, 20) + '...');
        
        // Test 3: Try to access a protected endpoint
        console.log('\n3️⃣ Testing protected endpoint (wishlists)...');
        const wishlistRes = await fetch(`${API_URL}/wishlists?populate=product.image`, {
          headers: {
            'Authorization': `Bearer ${data.jwt}`,
          },
        });
        
        console.log('   Wishlist response status:', wishlistRes.status);
        
        if (wishlistRes.ok) {
          const wishlistData = await wishlistRes.json();
          console.log('   ✓ Protected endpoint accessible');
          console.log('   Wishlist items:', wishlistData.data?.length || 0);
        } else {
          const errorData = await wishlistRes.json();
          console.log('   ✗ Protected endpoint failed');
          console.log('   Error:', errorData);
        }
        
        return; // Exit after first successful login
      } else {
        console.log('   ✗ Authentication failed');
        console.log('   Error:', data.error?.message || JSON.stringify(data));
      }
    } catch (error) {
      console.log('   ✗ Request failed');
      console.log('   Error:', error.message);
    }
  }

  console.log('\n\n❌ All test credentials failed!');
  console.log('\n💡 Solutions:');
  console.log('   1. Create a test user account:');
  console.log('      - Go to http://localhost:3000/auth/signup');
  console.log('      - Or use the Strapi admin panel at http://localhost:1337/admin');
  console.log('   2. Check backend logs for errors');
  console.log('   3. Verify database is accessible (.tmp/data.db)');
  console.log('');
}

// Run the test
testSignIn().catch(console.error);
