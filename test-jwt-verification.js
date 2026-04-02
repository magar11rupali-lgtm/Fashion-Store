/**
 * Test JWT token verification and wishlist removal
 */

const API_URL = 'http://localhost:1337/api';

async function testJWTAndWishlist() {
  console.log('=== JWT Verification and Wishlist Test ===\n');

  // Step 1: Create a new account
  console.log('Step 1: Creating test account...');
  const signupRes = await fetch(`${API_URL}/auth/local/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'Test123456',
    }),
  });

  if (!signupRes.ok) {
    console.error('Signup failed:', signupRes.status);
    const errorText = await signupRes.text();
    console.error('Error:', errorText);
    return;
  }

  const signupData = await signupRes.json();
  const token = signupData.jwt;
  const userId = signupData.user.id;
  
  console.log('✓ Account created');
  console.log('User ID:', userId);
  console.log('Token (first 30 chars):', token.substring(0, 30) + '...');
  console.log('Token length:', token.length);

  // Step 2: Verify token works immediately
  console.log('\nStep 2: Testing token immediately after creation...');
  const meRes = await fetch(`${API_URL}/users/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!meRes.ok) {
    console.error('✗ Token verification failed immediately');
    const errorText = await meRes.text();
    console.error('Error:', errorText);
    return;
  }

  const meData = await meRes.json();
  console.log('✓ Token verified successfully');
  console.log('User:', meData.email);

  // Step 3: Get a product to add to wishlist
  console.log('\nStep 3: Fetching products...');
  const productsRes = await fetch(`${API_URL}/products?pagination[limit]=1`);
  const productsData = await productsRes.json();
  
  if (!productsData.data || productsData.data.length === 0) {
    console.error('No products found');
    return;
  }

  const productId = productsData.data[0].id;
  console.log('✓ Product found, ID:', productId);

  // Step 4: Add product to wishlist
  console.log('\nStep 4: Adding product to wishlist...');
  const addRes = await fetch(`${API_URL}/wishlists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      data: {
        product: productId,
      },
    }),
  });

  if (!addRes.ok) {
    console.error('✗ Failed to add to wishlist');
    const errorText = await addRes.text();
    console.error('Error:', errorText);
    return;
  }

  const addData = await addRes.json();
  const wishlistItemId = addData.data.id;
  console.log('✓ Added to wishlist');
  console.log('Wishlist item ID:', wishlistItemId);

  // Step 5: Immediately try to remove it
  console.log('\nStep 5: Removing from wishlist (immediately)...');
  const deleteRes = await fetch(`${API_URL}/wishlists/${wishlistItemId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  console.log('Delete response status:', deleteRes.status);
  console.log('Delete response headers:');
  deleteRes.headers.forEach((value, key) => {
    console.log(`  ${key}: ${value}`);
  });

  if (!deleteRes.ok) {
    console.error('✗ Failed to remove from wishlist');
    const errorText = await deleteRes.text();
    console.error('Error response:', errorText);
    
    // Try to parse as JSON
    try {
      const errorJson = JSON.parse(errorText);
      console.error('\nParsed error:');
      console.error(JSON.stringify(errorJson, null, 2));
    } catch (e) {
      // Not JSON
    }
    
    // Check if token still works
    console.log('\nStep 6: Verifying token still works...');
    const verifyRes = await fetch(`${API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (verifyRes.ok) {
      console.log('✓ Token still valid');
    } else {
      console.error('✗ Token is now invalid');
    }
    
    return;
  }

  const deleteData = await deleteRes.json();
  console.log('✓ Successfully removed from wishlist');
  console.log('Delete response:', JSON.stringify(deleteData, null, 2));

  console.log('\n=== Test Complete ===');
}

testJWTAndWishlist().catch(error => {
  console.error('Test failed:', error);
});
