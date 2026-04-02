/**
 * Test basic authentication flow
 */

const API_URL = 'http://localhost:1337/api';

async function testBasicAuth() {
  console.log('=== Basic Authentication Test ===\n');

  // Test 1: Check if API is accessible
  console.log('Test 1: Checking API accessibility...');
  try {
    const res = await fetch(`${API_URL}/products?pagination[limit]=1`);
    if (res.ok) {
      console.log('✓ API is accessible');
    } else {
      console.error('✗ API returned:', res.status);
    }
  } catch (error) {
    console.error('✗ Cannot reach API:', error.message);
    return;
  }

  // Test 2: Try to access protected endpoint without auth
  console.log('\nTest 2: Accessing protected endpoint without auth...');
  try {
    const res = await fetch(`${API_URL}/users/me`);
    console.log('Status:', res.status);
    if (res.status === 401 || res.status === 403) {
      console.log('✓ Protected endpoint correctly requires auth');
    } else {
      console.log('⚠ Unexpected status for protected endpoint');
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
  }

  // Test 3: Try to login with existing user
  console.log('\nTest 3: Attempting login...');
  console.log('Note: This test assumes you have a user account');
  console.log('If you don\'t, please create one in the Strapi admin panel\n');

  // Try common test credentials
  const testCredentials = [
    { identifier: 'test@example.com', password: 'Test123456' },
    { identifier: 'user@example.com', password: 'User123456' },
    { identifier: 'demo@example.com', password: 'Demo123456' },
  ];

  let successfulLogin = null;

  for (const creds of testCredentials) {
    console.log(`Trying: ${creds.identifier}...`);
    try {
      const res = await fetch(`${API_URL}/auth/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`✓ Login successful with ${creds.identifier}`);
        successfulLogin = data;
        break;
      } else {
        const errorData = await res.json();
        console.log(`  Status: ${res.status} - ${errorData.error?.message || 'Failed'}`);
      }
    } catch (error) {
      console.log(`  Error: ${error.message}`);
    }
  }

  if (!successfulLogin) {
    console.log('\n⚠ No test accounts found. Please create a user account first.');
    console.log('You can do this by:');
    console.log('1. Going to http://localhost:1337/admin');
    console.log('2. Navigate to Content Manager > User');
    console.log('3. Create a new user with email: test@example.com, password: Test123456');
    return;
  }

  // Test 4: Use the token to access protected endpoint
  console.log('\nTest 4: Using token to access protected endpoint...');
  const token = successfulLogin.jwt;
  console.log('Token (first 30 chars):', token.substring(0, 30) + '...');

  try {
    const res = await fetch(`${API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Status:', res.status);
    
    if (res.ok) {
      const data = await res.json();
      console.log('✓ Token works! User:', data.email);
    } else {
      const errorText = await res.text();
      console.error('✗ Token verification failed');
      console.error('Response:', errorText);
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
  }

  console.log('\n=== Test Complete ===');
}

testBasicAuth().catch(error => {
  console.error('Test failed:', error);
});
