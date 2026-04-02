/**
 * Debug script to test wishlist removal and identify the internal server error
 */

const API_URL = 'http://localhost:1337/api';

async function testWishlistRemoval() {
  console.log('=== Wishlist Removal Debug Test ===\n');

  // Step 1: Login to get token
  console.log('Step 1: Logging in...');
  const loginRes = await fetch(`${API_URL}/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'test@example.com',
      password: 'Test123456',
    }),
  });

  if (!loginRes.ok) {
    console.error('Login failed:', loginRes.status, loginRes.statusText);
    const errorText = await loginRes.text();
    console.error('Error details:', errorText);
    return;
  }

  const loginData = await loginRes.json();
  const token = loginData.jwt;
  console.log('✓ Login successful');
  console.log('Token:', token.substring(0, 20) + '...\n');

  // Step 2: Fetch wishlist
  console.log('Step 2: Fetching wishlist...');
  const wishlistRes = await fetch(`${API_URL}/wishlists?populate=product.image`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!wishlistRes.ok) {
    console.error('Failed to fetch wishlist:', wishlistRes.status, wishlistRes.statusText);
    const errorText = await wishlistRes.text();
    console.error('Error details:', errorText);
    return;
  }

  const wishlistData = await wishlistRes.json();
  console.log('✓ Wishlist fetched');
  console.log('Wishlist items:', wishlistData.data.length);
  
  if (wishlistData.data.length === 0) {
    console.log('\nNo items in wishlist. Please add items first.');
    return;
  }

  // Display wishlist items
  console.log('\nWishlist items:');
  wishlistData.data.forEach((item, index) => {
    console.log(`  ${index + 1}. ID: ${item.id}, Product: ${item.attributes?.product?.data?.attributes?.name || 'N/A'}`);
  });

  // Step 3: Try to remove the first item
  const itemToRemove = wishlistData.data[0];
  console.log(`\nStep 3: Attempting to remove item ID: ${itemToRemove.id}...`);
  
  const deleteRes = await fetch(`${API_URL}/wishlists/${itemToRemove.id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  console.log('Delete response status:', deleteRes.status, deleteRes.statusText);
  console.log('Delete response headers:', Object.fromEntries(deleteRes.headers.entries()));

  if (!deleteRes.ok) {
    console.error('✗ Failed to remove item');
    const errorText = await deleteRes.text();
    console.error('Error response body:', errorText);
    
    try {
      const errorJson = JSON.parse(errorText);
      console.error('Parsed error:', JSON.stringify(errorJson, null, 2));
    } catch (e) {
      console.error('Could not parse error as JSON');
    }
    return;
  }

  const deleteData = await deleteRes.json();
  console.log('✓ Item removed successfully');
  console.log('Delete response:', JSON.stringify(deleteData, null, 2));

  // Step 4: Verify removal
  console.log('\nStep 4: Verifying removal...');
  const verifyRes = await fetch(`${API_URL}/wishlists?populate=product.image`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const verifyData = await verifyRes.json();
  console.log('✓ Remaining items:', verifyData.data.length);
  
  console.log('\n=== Test Complete ===');
}

// Run the test
testWishlistRemoval().catch(error => {
  console.error('Test failed with error:', error);
});
