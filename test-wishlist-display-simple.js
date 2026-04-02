/**
 * Simple test to check wishlist data structure
 */

const API_URL = 'http://localhost:1337/api';

async function testWishlist() {
  console.log('=== Testing Wishlist Display ===\n');

  // Try to register a new user first
  console.log('Creating test user...');
  const email = `test${Date.now()}@example.com`;
  const password = 'Test123456!';

  const registerRes = await fetch(`${API_URL}/auth/local/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: email,
      email: email,
      password: password,
    }),
  });

  if (!registerRes.ok) {
    console.error('Registration failed:', registerRes.status);
    const error = await registerRes.text();
    console.error('Error:', error);
    
    // Try to login with existing user
    console.log('\nTrying to login with existing user...');
    const loginRes = await fetch(`${API_URL}/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'user@example.com',
        password: 'User123456',
      }),
    });

    if (!loginRes.ok) {
      console.error('Login also failed:', loginRes.status);
      return;
    }

    const loginData = await loginRes.json();
    const token = loginData.jwt;
    console.log('✓ Login successful\n');
    
    await checkWishlist(token);
    return;
  }

  const registerData = await registerRes.json();
  const token = registerData.jwt;
  console.log('✓ User created and logged in\n');

  // Get first product
  console.log('Fetching a product to add to wishlist...');
  const productsRes = await fetch(`${API_URL}/products?populate=*&pagination[limit]=1`);
  const productsData = await productsRes.json();
  
  if (!productsData.data || productsData.data.length === 0) {
    console.error('No products found');
    return;
  }

  const product = productsData.data[0];
  console.log('Product found:', product.attributes?.name || product.name);
  console.log('Product ID:', product.id);
  console.log('Product structure:', JSON.stringify(product, null, 2));

  // Add to wishlist
  console.log('\nAdding product to wishlist...');
  const addRes = await fetch(`${API_URL}/wishlists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      data: {
        product: product.id,
      },
    }),
  });

  if (!addRes.ok) {
    console.error('Add to wishlist failed:', addRes.status);
    const error = await addRes.text();
    console.error('Error:', error);
    return;
  }

  const addData = await addRes.json();
  console.log('✓ Added to wishlist\n');
  console.log('Add response:', JSON.stringify(addData, null, 2));

  // Fetch wishlist
  await checkWishlist(token);
}

async function checkWishlist(token) {
  console.log('\n=== Fetching Wishlist ===');
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
    return;
  }

  const wishlistData = await wishlistRes.json();
  console.log('\nWishlist response:');
  console.log(JSON.stringify(wishlistData, null, 2));

  // Analyze structure
  if (wishlistData.data && wishlistData.data.length > 0) {
    console.log('\n=== STRUCTURE ANALYSIS ===');
    const item = wishlistData.data[0];
    console.log('Item ID:', item.id);
    console.log('Product path:', item.attributes?.product?.data ? 'EXISTS' : 'MISSING');
    console.log('Product ID:', item.attributes?.product?.data?.id);
    console.log('Product name:', item.attributes?.product?.data?.attributes?.name);
    console.log('Product price:', item.attributes?.product?.data?.attributes?.price);
    console.log('Product image:', item.attributes?.product?.data?.attributes?.image ? 'EXISTS' : 'MISSING');
    
    if (item.attributes?.product?.data?.attributes?.image) {
      const img = item.attributes.product.data.attributes.image;
      console.log('Image has data:', !!img.data);
      console.log('Image is array:', Array.isArray(img.data));
      if (img.data) {
        const imgData = Array.isArray(img.data) ? img.data[0] : img.data;
        console.log('Image URL:', imgData?.attributes?.url);
      }
    }
  }
}

testWishlist().catch(console.error);
