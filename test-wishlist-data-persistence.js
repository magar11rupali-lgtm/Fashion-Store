/**
 * Test script to verify wishlist data persistence issue
 * This will help identify if the problem is in the backend or frontend
 */

const API_URL = 'http://localhost:1337/api';

async function testWishlistPersistence() {
  console.log('🧪 Testing Wishlist Data Persistence\n');
  
  // Step 1: Login to get token
  console.log('Step 1: Logging in...');
  const loginRes = await fetch(`${API_URL}/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'test@example.com',
      password: 'Test123456'
    })
  });
  
  if (!loginRes.ok) {
    console.error('❌ Login failed:', loginRes.status);
    const error = await loginRes.text();
    console.error('Error:', error);
    return;
  }
  
  const { jwt, user } = await loginRes.json();
  console.log('✅ Logged in as:', user.email);
  console.log('User ID:', user.id);
  
  // Step 2: Get a product to add to wishlist
  console.log('\nStep 2: Fetching a product...');
  const productsRes = await fetch(`${API_URL}/products?populate=*&pagination[limit]=1`);
  const productsData = await productsRes.json();
  
  if (!productsData.data || productsData.data.length === 0) {
    console.error('❌ No products found');
    return;
  }
  
  const product = productsData.data[0];
  console.log('✅ Found product:', product.attributes.name);
  console.log('Product ID:', product.id);
  console.log('Product price:', product.attributes.price);
  console.log('Product has image:', !!product.attributes.image);
  
  // Step 3: Add product to wishlist
  console.log('\nStep 3: Adding product to wishlist...');
  const addRes = await fetch(`${API_URL}/wishlists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    },
    body: JSON.stringify({
      data: {
        product: product.id
      }
    })
  });
  
  if (!addRes.ok) {
    console.error('❌ Failed to add to wishlist:', addRes.status);
    const error = await addRes.text();
    console.error('Error:', error);
    return;
  }
  
  const addData = await addRes.json();
  console.log('✅ Added to wishlist');
  console.log('Wishlist item ID:', addData.data.id);
  console.log('\n📦 Response structure:');
  console.log(JSON.stringify(addData, null, 2));
  
  // Step 4: Fetch wishlist immediately
  console.log('\nStep 4: Fetching wishlist immediately after adding...');
  const wishlistRes1 = await fetch(`${API_URL}/wishlists?populate[product][populate]=*`, {
    headers: {
      'Authorization': `Bearer ${jwt}`
    }
  });
  
  const wishlistData1 = await wishlistRes1.json();
  console.log('✅ Fetched wishlist');
  console.log('Number of items:', wishlistData1.data.length);
  
  if (wishlistData1.data.length > 0) {
    const item = wishlistData1.data[0];
    console.log('\n📦 First wishlist item structure:');
    console.log(JSON.stringify(item, null, 2));
    
    console.log('\n🔍 Checking product data:');
    console.log('Has product relation:', !!item.attributes.product);
    console.log('Product data exists:', !!item.attributes.product?.data);
    console.log('Product name:', item.attributes.product?.data?.attributes?.name);
    console.log('Product price:', item.attributes.product?.data?.attributes?.price);
    console.log('Product image:', item.attributes.product?.data?.attributes?.image);
  }
  
  // Step 5: Wait 2 seconds and fetch again (simulating navigation away and back)
  console.log('\nStep 5: Waiting 2 seconds (simulating navigation)...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('Fetching wishlist again...');
  const wishlistRes2 = await fetch(`${API_URL}/wishlists?populate[product][populate]=*`, {
    headers: {
      'Authorization': `Bearer ${jwt}`
    }
  });
  
  const wishlistData2 = await wishlistRes2.json();
  console.log('✅ Fetched wishlist again');
  console.log('Number of items:', wishlistData2.data.length);
  
  if (wishlistData2.data.length > 0) {
    const item = wishlistData2.data[0];
    console.log('\n🔍 Checking product data after re-fetch:');
    console.log('Has product relation:', !!item.attributes.product);
    console.log('Product data exists:', !!item.attributes.product?.data);
    console.log('Product name:', item.attributes.product?.data?.attributes?.name);
    console.log('Product price:', item.attributes.product?.data?.attributes?.price);
    console.log('Product image:', item.attributes.product?.data?.attributes?.image);
    
    // Compare with first fetch
    const firstItem = wishlistData1.data[0];
    const secondItem = wishlistData2.data[0];
    
    console.log('\n🔄 Comparing first and second fetch:');
    console.log('Same wishlist item ID:', firstItem.id === secondItem.id);
    console.log('Same product name:', 
      firstItem.attributes.product?.data?.attributes?.name === 
      secondItem.attributes.product?.data?.attributes?.name
    );
    console.log('Same product price:', 
      firstItem.attributes.product?.data?.attributes?.price === 
      secondItem.attributes.product?.data?.attributes?.price
    );
  }
  
  // Step 6: Clean up - remove the wishlist item
  console.log('\nStep 6: Cleaning up...');
  const deleteRes = await fetch(`${API_URL}/wishlists/${addData.data.id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${jwt}`
    }
  });
  
  if (deleteRes.ok) {
    console.log('✅ Cleaned up test data');
  }
  
  console.log('\n✅ Test completed!');
}

// Run the test
testWishlistPersistence().catch(console.error);
