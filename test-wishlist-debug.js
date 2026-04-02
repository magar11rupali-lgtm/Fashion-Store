/**
 * Debug script to test wishlist functionality
 * Run with: node test-wishlist-debug.js
 */

const API_URL = 'http://localhost:1337/api';

async function testWishlist() {
  console.log('=== Wishlist Debug Test ===\n');

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
    console.error('❌ Login failed:', loginRes.status);
    const error = await loginRes.text();
    console.error('Error:', error);
    return;
  }

  const loginData = await loginRes.json();
  console.log('✅ Login successful');
  console.log('User ID:', loginData.user.id);
  console.log('Token:', loginData.jwt.substring(0, 20) + '...\n');

  const token = loginData.jwt;

  // Step 2: Get products
  console.log('2. Fetching products...');
  const productsRes = await fetch(`${API_URL}/products?populate=*`);
  const productsData = await productsRes.json();
  
  if (!productsData.data || productsData.data.length === 0) {
    console.error('❌ No products found');
    return;
  }

  const testProduct = productsData.data[0];
  console.log('✅ Found product:', testProduct.attributes.name);
  console.log('Product ID:', testProduct.id, '\n');

  // Step 3: Fetch current wishlist
  console.log('3. Fetching current wishlist...');
  const wishlistRes = await fetch(`${API_URL}/wishlists?populate=product.image`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  console.log('Wishlist response status:', wishlistRes.status);
  const wishlistData = await wishlistRes.json();
  console.log('Wishlist response:', JSON.stringify(wishlistData, null, 2), '\n');

  // Step 4: Add to wishlist
  console.log('4. Adding product to wishlist...');
  const addRes = await fetch(`${API_URL}/wishlists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      data: {
        product: testProduct.id,
      },
    }),
  });

  console.log('Add response status:', addRes.status);
  const addData = await addRes.json();
  console.log('Add response:', JSON.stringify(addData, null, 2));

  if (!addRes.ok) {
    console.error('❌ Failed to add to wishlist');
    return;
  }

  console.log('✅ Added to wishlist');
  const wishlistItemId = addData.data?.id || addData.id;
  console.log('Wishlist item ID:', wishlistItemId, '\n');

  // Step 5: Fetch wishlist again
  console.log('5. Fetching wishlist after add...');
  const wishlistRes2 = await fetch(`${API_URL}/wishlists?populate=product.image`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const wishlistData2 = await wishlistRes2.json();
  console.log('Wishlist response:', JSON.stringify(wishlistData2, null, 2), '\n');

  // Step 6: Remove from wishlist
  if (wishlistItemId) {
    console.log('6. Removing from wishlist...');
    const removeRes = await fetch(`${API_URL}/wishlists/${wishlistItemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    console.log('Remove response status:', removeRes.status);
    const removeData = await removeRes.json();
    console.log('Remove response:', JSON.stringify(removeData, null, 2));

    if (removeRes.ok) {
      console.log('✅ Removed from wishlist\n');
    } else {
      console.error('❌ Failed to remove from wishlist\n');
    }
  }

  console.log('=== Test Complete ===');
}

testWishlist().catch(console.error);
