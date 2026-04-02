/**
 * Test script to verify wishlist data persists correctly after page refresh
 * Tests that name, price, and image are properly loaded
 */

const API_URL = 'http://localhost:1337/api';

async function testWishlistRefresh() {
  console.log('=== Testing Wishlist Refresh Fix ===\n');

  try {
    // Step 1: Login
    console.log('Step 1: Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'user@example.com',
        password: 'User1234!',
      }),
    });

    if (!loginRes.ok) {
      console.error('❌ Login failed:', loginRes.status);
      console.log('\nTrying alternative credentials...');
      
      // Try test@test.com
      const altLoginRes = await fetch(`${API_URL}/auth/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'test@test.com',
          password: 'Test1234!',
        }),
      });
      
      if (!altLoginRes.ok) {
        console.error('❌ Alternative login also failed');
        console.log('\n⚠️  Please ensure:');
        console.log('1. Backend is running (npm run develop in backend folder)');
        console.log('2. You have a user account created');
        console.log('3. Run: node create-user-and-wishlist.js');
        return;
      }
      
      const altLoginData = await altLoginRes.json();
      var token = altLoginData.jwt;
      console.log('✓ Login successful with test@test.com\n');
    } else {
      const loginData = await loginRes.json();
      var token = loginData.jwt;
      console.log('✓ Login successful with user@example.com\n');
    }

    // Step 2: Fetch wishlist
    console.log('Step 2: Fetching wishlist with full population...');
    const wishlistRes = await fetch(
      `${API_URL}/wishlists?populate[product][populate]=*`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!wishlistRes.ok) {
      console.error('❌ Wishlist fetch failed:', wishlistRes.status);
      const errorText = await wishlistRes.text();
      console.error('Error:', errorText);
      return;
    }

    const wishlistData = await wishlistRes.json();
    console.log('✓ Wishlist fetched successfully');
    console.log(`  Total items: ${wishlistData?.data?.length || 0}\n`);

    if (!wishlistData?.data || wishlistData.data.length === 0) {
      console.log('⚠️  No wishlist items found.');
      console.log('   Add items to wishlist first, then run this test again.\n');
      return;
    }

    // Step 3: Verify data structure
    console.log('Step 3: Verifying data structure...\n');
    
    let allValid = true;
    
    wishlistData.data.forEach((item, index) => {
      console.log(`Item ${index + 1}:`);
      console.log(`  Wishlist ID: ${item.id}`);
      
      const productData = item?.attributes?.product?.data;
      const productAttrs = productData?.attributes;
      
      if (!productData) {
        console.log('  ❌ Product data missing!');
        allValid = false;
        return;
      }
      
      console.log(`  Product ID: ${productData.id}`);
      
      // Check name
      if (productAttrs?.name) {
        console.log(`  ✓ Name: ${productAttrs.name}`);
      } else {
        console.log('  ❌ Name: MISSING');
        allValid = false;
      }
      
      // Check price
      if (productAttrs?.price !== undefined && productAttrs?.price !== null) {
        console.log(`  ✓ Price: $${productAttrs.price}`);
      } else {
        console.log('  ❌ Price: MISSING');
        allValid = false;
      }
      
      // Check image
      const imageData = productAttrs?.image?.data;
      if (imageData) {
        const imageUrl = Array.isArray(imageData) 
          ? imageData[0]?.attributes?.url 
          : imageData?.attributes?.url;
        
        if (imageUrl) {
          console.log(`  ✓ Image: ${imageUrl}`);
        } else {
          console.log('  ❌ Image URL: MISSING');
          allValid = false;
        }
      } else {
        console.log('  ❌ Image data: MISSING');
        allValid = false;
      }
      
      console.log('');
    });

    // Step 4: Test normalization (what frontend does)
    console.log('Step 4: Testing frontend normalization...\n');
    
    const normalized = wishlistData.data.map((item) => {
      const productData = item?.attributes?.product?.data?.attributes;
      const productId = item?.attributes?.product?.data?.id;
      
      let imageUrl = "";
      if (productData?.image) {
        if (productData.image.data) {
          if (Array.isArray(productData.image.data)) {
            imageUrl = productData.image.data[0]?.attributes?.url || "";
          } else {
            imageUrl = productData.image.data.attributes?.url || "";
          }
        } else if (Array.isArray(productData.image)) {
          imageUrl = productData.image[0]?.url || productData.image[0]?.attributes?.url || "";
        } else if (productData.image.url) {
          imageUrl = productData.image.url;
        } else if (typeof productData.image === 'string') {
          imageUrl = productData.image;
        }
      }

      return {
        id: item.id,
        productId: productId,
        name: productData?.name || "Unknown Product",
        price: productData?.price || 0,
        image: imageUrl,
        availableSizes: productData?.sizes || ['S', 'M', 'L', 'XL'],
        addedAt: item?.attributes?.addedAt || new Date().toISOString(),
      };
    });

    console.log('Normalized items for frontend:');
    normalized.forEach((item, index) => {
      console.log(`\nItem ${index + 1}:`);
      console.log(`  ID: ${item.id}`);
      console.log(`  Product ID: ${item.productId}`);
      console.log(`  Name: ${item.name || 'MISSING'}`);
      console.log(`  Price: $${item.price || 'MISSING'}`);
      console.log(`  Image: ${item.image || 'MISSING'}`);
      
      if (!item.name || !item.price || !item.image) {
        allValid = false;
      }
    });

    // Final result
    console.log('\n=== Test Result ===');
    if (allValid) {
      console.log('✓ SUCCESS: All wishlist items have name, price, and image!');
      console.log('  The wishlist should now display correctly after page refresh.');
    } else {
      console.log('❌ FAILED: Some items are missing data.');
      console.log('  Please check the backend logs for more details.');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testWishlistRefresh();
