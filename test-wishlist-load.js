/**
 * Test script to check wishlist loading after refresh
 */

const API_URL = 'http://localhost:1337/api';

async function testWishlistLoad() {
  try {
    // Try to login with different credentials
    console.log('1. Attempting login...');
    
    const credentials = [
      { identifier: 'user@example.com', password: 'User1234!' },
      { identifier: 'test@test.com', password: 'Test1234!' },
      { identifier: 'admin@example.com', password: 'Admin1234!' },
    ];

    let token = null;
    
    for (const cred of credentials) {
      try {
        const loginRes = await fetch(`${API_URL}/auth/local`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cred),
        });

        if (loginRes.ok) {
          const loginData = await loginRes.json();
          token = loginData.jwt;
          console.log(`✓ Login successful with ${cred.identifier}`);
          break;
        }
      } catch (err) {
        console.log(`Failed with ${cred.identifier}`);
      }
    }

    if (!token) {
      console.error('❌ Could not login with any credentials');
      console.log('\nPlease ensure:');
      console.log('1. Backend is running (npm run develop in backend folder)');
      console.log('2. You have a user account created');
      return;
    }

    // Fetch wishlist with full population
    console.log('\n2. Fetching wishlist with populate...');
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
    
    console.log('\n3. Wishlist Response Structure:');
    console.log('Total items:', wishlistData?.data?.length || 0);
    
    if (wishlistData?.data?.length > 0) {
      const firstItem = wishlistData.data[0];
      console.log('\nFirst item structure:');
      console.log('- Item ID:', firstItem.id);
      console.log('- Has attributes:', !!firstItem.attributes);
      console.log('- Has product:', !!firstItem.attributes?.product);
      console.log('- Product structure:', firstItem.attributes?.product?.data ? 'nested data' : 'direct');
      
      if (firstItem.attributes?.product?.data) {
        const product = firstItem.attributes.product.data;
        console.log('\nProduct details:');
        console.log('- Product ID:', product.id);
        console.log('- Has attributes:', !!product.attributes);
        console.log('- Name:', product.attributes?.name);
        console.log('- Price:', product.attributes?.price);
        console.log('- Has image:', !!product.attributes?.image);
        console.log('- Image structure:', product.attributes?.image?.data ? 'has data' : 'no data');
        
        if (product.attributes?.image?.data) {
          const imageData = product.attributes.image.data;
          if (Array.isArray(imageData)) {
            console.log('- Image is array, first URL:', imageData[0]?.attributes?.url);
          } else {
            console.log('- Image URL:', imageData?.attributes?.url);
          }
        }
      }
      
      console.log('\n4. Full first item:');
      console.log(JSON.stringify(firstItem, null, 2));
    } else {
      console.log('\n⚠️  No wishlist items found. Add some items first!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testWishlistLoad();
