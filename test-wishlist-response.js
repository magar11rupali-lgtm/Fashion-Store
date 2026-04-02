/**
 * Test script to check wishlist API response structure
 */

const API_URL = 'http://localhost:1337/api';

async function testWishlistResponse() {
  try {
    // First, login to get a token
    console.log('1. Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'test@example.com',
        password: 'Test1234!',
      }),
    });

    if (!loginRes.ok) {
      console.error('Login failed:', loginRes.status);
      return;
    }

    const loginData = await loginRes.json();
    const token = loginData.jwt;
    console.log('✓ Login successful');

    // Fetch wishlist
    console.log('\n2. Fetching wishlist...');
    const wishlistRes = await fetch(
      `${API_URL}/wishlists?populate[product][populate]=*`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!wishlistRes.ok) {
      console.error('Wishlist fetch failed:', wishlistRes.status);
      const errorText = await wishlistRes.text();
      console.error('Error:', errorText);
      return;
    }

    const wishlistData = await wishlistRes.json();
    console.log('\n3. Raw API Response:');
    console.log(JSON.stringify(wishlistData, null, 2));

    // Test normalization
    console.log('\n4. Testing normalization...');
    const normalized = (wishlistData?.data || []).map((item) => {
      const productData = item?.attributes?.product?.data?.attributes || item?.product;
      const productId = item?.attributes?.product?.data?.id || item?.product?.id;
      
      let imageUrl = "";
      if (productData?.image?.data) {
        if (Array.isArray(productData.image.data)) {
          imageUrl = productData.image.data[0]?.attributes?.url || "";
        } else {
          imageUrl = productData.image.data.attributes?.url || "";
        }
      }

      console.log(`\nItem ${item.id}:`, {
        itemId: item.id,
        productId,
        hasProductData: !!productData,
        name: productData?.name,
        price: productData?.price,
        imageUrl,
        rawImageStructure: productData?.image?.data ? 'exists' : 'missing'
      });

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

    console.log('\n5. Normalized items:');
    console.log(JSON.stringify(normalized, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testWishlistResponse();
