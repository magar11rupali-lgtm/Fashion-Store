/**
 * Test script to debug wishlist removal issue
 */

const API_URL = 'http://localhost:1337/api';

async function testWishlistRemoval() {
  console.log('=== Testing Wishlist Removal ===\n');

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
    console.error('Login failed:', await loginRes.text());
    return;
  }

  const { jwt, user } = await loginRes.json();
  console.log('✓ Logged in as:', user.email);
  console.log('✓ User ID:', user.id);
  console.log('✓ Token:', jwt.substring(0, 20) + '...\n');

  // Step 2: Fetch current wishlist
  console.log('Step 2: Fetching wishlist...');
  const wishlistRes = await fetch(`${API_URL}/wishlists?populate=product.image`, {
    headers: { 'Authorization': `Bearer ${jwt}` },
  });

  if (!wishlistRes.ok) {
    console.error('Failed to fetch wishlist:', await wishlistRes.text());
    return;
  }

  const wishlistData = await wishlistRes.json();
  console.log('✓ Current wishlist items:', wishlistData.data.length);
  
  if (wishlistData.data.length === 0) {
    console.log('\n⚠ Wishlist is empty. Adding a test item first...');
    
    // Get first product
    const productsRes = await fetch(`${API_URL}/products?pagination[limit]=1`);
    const productsData = await productsRes.json();
    
    if (productsData.data.length === 0) {
      console.error('No products available to test with');
      return;
    }
    
    const productId = productsData.data[0].id;
    console.log('Adding product ID:', productId);
    
    const addRes = await fetch(`${API_URL}/wishlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: { product: productId },
      }),
    });
    
    if (!addRes.ok) {
      console.error('Failed to add item:', await addRes.text());
      return;
    }
    
    const addedItem = await addRes.json();
    console.log('✓ Added item to wishlist:', addedItem.data.id);
    wishlistData.data.push(addedItem.data);
  }

  // Display wishlist items
  console.log('\nWishlist items:');
  wishlistData.data.forEach((item, index) => {
    console.log(`  ${index + 1}. ID: ${item.id}, Product: ${item.attributes.product?.data?.id || 'N/A'}`);
  });

  // Step 3: Try to remove the first item
  const itemToRemove = wishlistData.data[0];
  console.log(`\nStep 3: Attempting to remove wishlist item ID: ${itemToRemove.id}`);
  
  const deleteRes = await fetch(`${API_URL}/wishlists/${itemToRemove.id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${jwt}`,
    },
  });

  console.log('Delete response status:', deleteRes.status);
  console.log('Delete response ok:', deleteRes.ok);

  if (!deleteRes.ok) {
    const errorText = await deleteRes.text();
    console.error('❌ Failed to delete:', errorText);
    
    // Try to parse error
    try {
      const errorJson = JSON.parse(errorText);
      console.error('Error details:', JSON.stringify(errorJson, null, 2));
    } catch (e) {
      console.error('Raw error:', errorText);
    }
    return;
  }

  const deleteResult = await deleteRes.json();
  console.log('✓ Delete successful!');
  console.log('Delete result:', JSON.stringify(deleteResult, null, 2));

  // Step 4: Verify removal
  console.log('\nStep 4: Verifying removal...');
  const verifyRes = await fetch(`${API_URL}/wishlists?populate=product.image`, {
    headers: { 'Authorization': `Bearer ${jwt}` },
  });

  const verifyData = await verifyRes.json();
  console.log('✓ Remaining wishlist items:', verifyData.data.length);
  
  const stillExists = verifyData.data.find(item => item.id === itemToRemove.id);
  if (stillExists) {
    console.error('❌ Item still exists in wishlist!');
  } else {
    console.log('✓ Item successfully removed from wishlist');
  }

  console.log('\n=== Test Complete ===');
}

testWishlistRemoval().catch(console.error);
