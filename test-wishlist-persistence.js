/**
 * Test script to verify wishlist persistence
 * This tests that product name, price, and image are correctly saved and retrieved
 */

const API_URL = 'http://localhost:1337/api';

async function testWishlistPersistence() {
  console.log('🧪 Testing Wishlist Persistence\n');

  // Step 1: Login to get JWT token
  console.log('1️⃣ Logging in...');
  const loginRes = await fetch(`${API_URL}/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'test@example.com',
      password: 'Test123456',
    }),
  });

  if (!loginRes.ok) {
    console.error('❌ Login failed:', await loginRes.text());
    return;
  }

  const { jwt } = await loginRes.json();
  console.log('✅ Login successful\n');

  // Step 2: Get a product to add to wishlist
  console.log('2️⃣ Fetching products...');
  const productsRes = await fetch(`${API_URL}/products?populate=*`);
  const productsData = await productsRes.json();
  
  if (!productsData.data || productsData.data.length === 0) {
    console.error('❌ No products found');
    return;
  }

  const product = productsData.data[0];
  const productId = product.id;
  const productName = product.attributes.name;
  const productPrice = product.attributes.price;
  const productImage = product.attributes.image?.data?.[0]?.attributes?.url;

  console.log(`✅ Found product: ${productName}`);
  console.log(`   Price: $${productPrice}`);
  console.log(`   Image: ${productImage}\n`);

  // Step 3: Add product to wishlist
  console.log('3️⃣ Adding product to wishlist...');
  const addRes = await fetch(`${API_URL}/wishlists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      data: {
        product: productId,
      },
    }),
  });

  if (!addRes.ok) {
    console.error('❌ Failed to add to wishlist:', await addRes.text());
    return;
  }

  const addData = await addRes.json();
  console.log('✅ Added to wishlist');
  console.log('Response:', JSON.stringify(addData, null, 2));
  console.log();

  // Step 4: Fetch wishlist to verify data persistence
  console.log('4️⃣ Fetching wishlist...');
  const wishlistRes = await fetch(`${API_URL}/wishlists?populate[product][populate]=*`, {
    headers: {
      'Authorization': `Bearer ${jwt}`,
    },
  });

  if (!wishlistRes.ok) {
    console.error('❌ Failed to fetch wishlist:', await wishlistRes.text());
    return;
  }

  const wishlistData = await wishlistRes.json();
  console.log('✅ Wishlist fetched');
  console.log('Response:', JSON.stringify(wishlistData, null, 2));
  console.log();

  // Step 5: Verify data integrity
  console.log('5️⃣ Verifying data integrity...');
  const wishlistItem = wishlistData.data[0];
  
  if (!wishlistItem) {
    console.error('❌ No wishlist items found');
    return;
  }

  const savedProduct = wishlistItem.attributes?.product?.data?.attributes;
  const savedName = savedProduct?.name;
  const savedPrice = savedProduct?.price;
  const savedImage = savedProduct?.image?.data?.[0]?.attributes?.url || savedProduct?.image?.data?.attributes?.url;

  console.log('Saved product data:');
  console.log(`   Name: ${savedName}`);
  console.log(`   Price: $${savedPrice}`);
  console.log(`   Image: ${savedImage}`);
  console.log();

  // Verify all fields are present
  let allFieldsPresent = true;
  
  if (!savedName) {
    console.error('❌ Product name is missing!');
    allFieldsPresent = false;
  } else {
    console.log('✅ Product name is present');
  }

  if (!savedPrice) {
    console.error('❌ Product price is missing!');
    allFieldsPresent = false;
  } else {
    console.log('✅ Product price is present');
  }

  if (!savedImage) {
    console.error('❌ Product image is missing!');
    allFieldsPresent = false;
  } else {
    console.log('✅ Product image is present');
  }

  console.log();

  // Step 6: Clean up - remove from wishlist
  console.log('6️⃣ Cleaning up...');
  const deleteRes = await fetch(`${API_URL}/wishlists/${wishlistItem.id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${jwt}`,
    },
  });

  if (!deleteRes.ok) {
    console.error('❌ Failed to delete wishlist item:', await deleteRes.text());
  } else {
    console.log('✅ Wishlist item deleted');
  }

  console.log();
  console.log('='.repeat(50));
  if (allFieldsPresent) {
    console.log('✅ TEST PASSED: All product data persists correctly!');
  } else {
    console.log('❌ TEST FAILED: Some product data is missing!');
  }
  console.log('='.repeat(50));
}

// Run the test
testWishlistPersistence().catch(console.error);
