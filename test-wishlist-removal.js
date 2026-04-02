/**
 * Test script to debug wishlist removal issue
 */

const API_URL = 'http://localhost:1337/api';

async function testWishlistRemoval() {
  console.log('=== Testing Wishlist Removal ===\n');

  // Step 1: Login
  console.log('Step 1: Logging in...');
  const loginRes = await fetch(`${API_URL}/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'test@example.com',
      password: 'Test1234!',
    }),
  });

  if (!loginRes.ok) {
    console.error('❌ Login failed:', loginRes.status);
    const error = await loginRes.text();
    console.error('Error:', error);
    return;
  }

  const { jwt, user } = await loginRes.json();
  console.log('✅ Logged in as:', user.email);
  console.log('Token:', jwt.substring(0, 20) + '...\n');

  // Step 2: Fetch current wishlist
  console.log('Step 2: Fetching wishlist...');
  const wishlistRes = await fetch(`${API_URL}/wishlists?populate=product.image`, {
    headers: { 'Authorization': `Bearer ${jwt}` },
  });

  if (!wishlistRes.ok) {
    console.error('❌ Failed to fetch wishlist:', wishlistRes.status);
    return;
  }

  const wishlistData = await wishlistRes.json();
  console.log('✅ Current wishlist items:', wishlistData.data.length);
  
  if (wishlistData.data.length === 0) {
    console.log('⚠️  Wishlist is empty. Adding a product first...\n');
    
    // Add a product to wishlist
    console.log('Step 2a: Adding product to wishlist...');
    const addRes = await fetch(`${API_URL}/wishlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: {
          product: 1, // Assuming product ID 1 exists
        },
      }),
    });

    if (!addRes.ok) {
      console.error('❌ Failed to add product:', addRes.status);
      const error = await addRes.text();
      console.error('Error:', error);
      return;
    }

    const addedItem = await addRes.json();
    console.log('✅ Added product to wishlist');
    console.log('Wishlist item ID:', addedItem.data.id);
    console.log('Product ID:', addedItem.data.attributes.product?.data?.id, '\n');

    // Fetch wishlist again
    const updatedWishlistRes = await fetch(`${API_URL}/wishlists?populate=product.image`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    const updatedWishlistData = await updatedWishlistRes.json();
    wishlistData.data = updatedWishlistData.data;
  }

  // Display wishlist items
  console.log('\nCurrent wishlist items:');
  wishlistData.data.forEach((item, index) => {
    console.log(`  ${index + 1}. Wishlist ID: ${item.id}`);
    console.log(`     Product ID: ${item.attributes.product?.data?.id}`);
    console.log(`     Product Name: ${item.attributes.product?.data?.attributes?.name}`);
  });
  console.log('');

  // Step 3: Try to remove the first item
  const itemToRemove = wishlistData.data[0];
  console.log(`Step 3: Removing wishlist item ID ${itemToRemove.id}...`);
  
  const deleteRes = await fetch(`${API_URL}/wishlists/${itemToRemove.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${jwt}` },
  });

  console.log('Delete response status:', deleteRes.status);
  
  if (!deleteRes.ok) {
    console.error('❌ Failed to delete wishlist item');
    const error = await deleteRes.text();
    console.error('Error response:', error);
    return;
  }

  const deleteResult = await deleteRes.json();
  console.log('✅ Delete response:', JSON.stringify(deleteResult, null, 2));

  // Step 4: Verify removal
  console.log('\nStep 4: Verifying removal...');
  const verifyRes = await fetch(`${API_URL}/wishlists?populate=product.image`, {
    headers: { 'Authorization': `Bearer ${jwt}` },
  });

  const verifyData = await verifyRes.json();
  console.log('Remaining wishlist items:', verifyData.data.length);
  
  const stillExists = verifyData.data.find(item => item.id === itemToRemove.id);
  if (stillExists) {
    console.error('❌ Item still exists in wishlist!');
    console.error('Item:', JSON.stringify(stillExists, null, 2));
  } else {
    console.log('✅ Item successfully removed from wishlist');
  }

  console.log('\n=== Test Complete ===');
}

// Run the test
testWishlistRemoval().catch(console.error);
