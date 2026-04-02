/**
 * Complete wishlist test - checks all operations
 */

const API_URL = 'http://localhost:1337/api';

async function testCompleteWishlist() {
  console.log('=== Complete Wishlist Test ===\n');

  // Step 1: Login
  console.log('1. Logging in...');
  const loginRes = await fetch(`${API_URL}/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'test@example.com',
      password: 'Test123456',
    }),
  });

  if (!loginRes.ok) {
    console.error('❌ Login failed');
    return;
  }

  const { jwt, user } = await loginRes.json();
  console.log('✅ Logged in as:', user.email);
  console.log('User ID:', user.id, '\n');

  // Step 2: Clear existing wishlist
  console.log('2. Clearing existing wishlist...');
  const existingRes = await fetch(`${API_URL}/wishlists?populate=product.image`, {
    headers: { 'Authorization': `Bearer ${jwt}` },
  });
  
  const existingData = await existingRes.json();
  console.log('Existing wishlist response structure:', Object.keys(existingData));
  console.log('Full response:', JSON.stringify(existingData, null, 2));
  
  const existingItems = existingData.data || existingData;
  if (Array.isArray(existingItems) && existingItems.length > 0) {
    console.log(`Found ${existingItems.length} existing items, removing...`);
    for (const item of existingItems) {
      const itemId = item.id;
      await fetch(`${API_URL}/wishlists/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${jwt}` },
      });
    }
    console.log('✅ Cleared existing wishlist\n');
  } else {
    console.log('✅ Wishlist already empty\n');
  }

  // Step 3: Get a product
  console.log('3. Fetching products...');
  const productsRes = await fetch(`${API_URL}/products?populate=*`);
  const productsData = await productsRes.json();
  
  if (!productsData.data || productsData.data.length === 0) {
    console.error('❌ No products found');
    return;
  }

  const product = productsData.data[0];
  console.log('✅ Using product:', product.attributes.name);
  console.log('Product ID:', product.id);
  console.log('Product price:', product.attributes.price, '\n');

  // Step 4: Add to wishlist
  console.log('4. Adding to wishlist...');
  const addRes = await fetch(`${API_URL}/wishlists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      data: {
        product: product.id,
      },
    }),
  });

  console.log('Add response status:', addRes.status);
  const addData = await addRes.json();
  console.log('Add response structure:', Object.keys(addData));
  console.log('Full add response:', JSON.stringify(addData, null, 2));

  if (!addRes.ok) {
    console.error('❌ Failed to add to wishlist');
    return;
  }

  const wishlistItemId = addData.data?.id || addData.id;
  console.log('✅ Added to wishlist, item ID:', wishlistItemId, '\n');

  // Step 5: Fetch wishlist
  console.log('5. Fetching wishlist...');
  const fetchRes = await fetch(`${API_URL}/wishlists?populate=product.image`, {
    headers: { 'Authorization': `Bearer ${jwt}` },
  });

  const fetchData = await fetchRes.json();
  console.log('Fetch response structure:', Object.keys(fetchData));
  console.log('Full fetch response:', JSON.stringify(fetchData, null, 2), '\n');

  // Step 6: Remove from wishlist
  console.log('6. Removing from wishlist...');
  const removeRes = await fetch(`${API_URL}/wishlists/${wishlistItemId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${jwt}` },
  });

  console.log('Remove response status:', removeRes.status);
  const removeData = await removeRes.json();
  console.log('Remove response:', JSON.stringify(removeData, null, 2));

  if (removeRes.ok) {
    console.log('✅ Removed from wishlist\n');
  } else {
    console.error('❌ Failed to remove\n');
  }

  // Step 7: Verify empty
  console.log('7. Verifying wishlist is empty...');
  const verifyRes = await fetch(`${API_URL}/wishlists?populate=product.image`, {
    headers: { 'Authorization': `Bearer ${jwt}` },
  });

  const verifyData = await verifyRes.json();
  const items = verifyData.data || verifyData;
  console.log('Items count:', Array.isArray(items) ? items.length : 'not an array');
  
  if (Array.isArray(items) && items.length === 0) {
    console.log('✅ Wishlist is empty\n');
  } else {
    console.log('⚠️ Wishlist still has items:', items.length, '\n');
  }

  console.log('=== Test Complete ===');
}

testCompleteWishlist().catch(console.error);
