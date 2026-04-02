/**
 * Test script to debug wishlist display issue after refresh
 * This will check what data is actually returned from the backend
 */

const API_URL = 'http://localhost:1337/api';

async function testWishlistDisplay() {
  console.log('=== Testing Wishlist Display Issue ===\n');

  // Step 1: Login to get a token
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
    console.error('Login failed:', loginRes.status);
    const error = await loginRes.text();
    console.error('Error:', error);
    return;
  }

  const loginData = await loginRes.json();
  const token = loginData.jwt;
  console.log('✓ Login successful\n');

  // Step 2: Fetch wishlist with full population
  console.log('Step 2: Fetching wishlist...');
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
    const error = await wishlistRes.text();
    console.error('Error:', error);
    return;
  }

  const wishlistData = await wishlistRes.json();
  console.log('\n=== RAW WISHLIST RESPONSE ===');
  console.log(JSON.stringify(wishlistData, null, 2));

  // Step 3: Analyze the structure
  console.log('\n=== ANALYSIS ===');
  console.log('Number of items:', wishlistData.data?.length || 0);
  
  if (wishlistData.data && wishlistData.data.length > 0) {
    const firstItem = wishlistData.data[0];
    console.log('\nFirst item structure:');
    console.log('- ID:', firstItem.id);
    console.log('- Has attributes:', !!firstItem.attributes);
    console.log('- Has product:', !!firstItem.attributes?.product);
    console.log('- Product has data:', !!firstItem.attributes?.product?.data);
    
    if (firstItem.attributes?.product?.data) {
      const product = firstItem.attributes.product.data;
      console.log('\nProduct details:');
      console.log('- Product ID:', product.id);
      console.log('- Has attributes:', !!product.attributes);
      console.log('- Name:', product.attributes?.name);
      console.log('- Price:', product.attributes?.price);
      console.log('- Has image:', !!product.attributes?.image);
      console.log('- Image structure:', typeof product.attributes?.image);
      
      if (product.attributes?.image) {
        console.log('\nImage details:');
        console.log('- Has data property:', !!product.attributes.image.data);
        console.log('- Is array:', Array.isArray(product.attributes.image.data));
        
        if (product.attributes.image.data) {
          const imageData = Array.isArray(product.attributes.image.data) 
            ? product.attributes.image.data[0] 
            : product.attributes.image.data;
          
          console.log('- Image ID:', imageData?.id);
          console.log('- Has attributes:', !!imageData?.attributes);
          console.log('- URL:', imageData?.attributes?.url);
        }
      }
    }
  }
}

testWishlistDisplay().catch(console.error);
