const API_URL = 'http://localhost:1337/api';

// Test credentials
const credentials = {
  identifier: 'test@example.com',
  password: 'test123456'
};

async function testWishlistFix() {
  try {
    console.log('1. Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (!loginRes.ok) {
      throw new Error(`Login failed: ${loginRes.status}`);
    }
    
    const { jwt } = await loginRes.json();
    console.log('✓ Logged in successfully');
    
    console.log('\n2. Fetching wishlist...');
    const wishlistRes = await fetch(`${API_URL}/wishlists?populate[product][populate]=*`, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });
    
    if (!wishlistRes.ok) {
      throw new Error(`Wishlist fetch failed: ${wishlistRes.status}`);
    }
    
    const wishlistData = await wishlistRes.json();
    console.log('✓ Wishlist fetched successfully');
    console.log('\n=== Wishlist Data ===');
    console.log(JSON.stringify(wishlistData, null, 2));
    
    // Check if products are populated
    if (wishlistData.data && wishlistData.data.length > 0) {
      const firstItem = wishlistData.data[0];
      const hasProduct = firstItem.attributes?.product?.data !== null;
      
      console.log('\n=== Validation ===');
      console.log(`Total wishlist items: ${wishlistData.data.length}`);
      console.log(`First item has product: ${hasProduct}`);
      
      if (hasProduct) {
        const product = firstItem.attributes.product.data;
        console.log(`Product ID: ${product.id}`);
        console.log(`Product Name: ${product.attributes?.name}`);
        console.log(`Product Price: ${product.attributes?.price}`);
        console.log(`Has Image: ${!!product.attributes?.image}`);
        console.log('\n✅ FIX SUCCESSFUL - Products are now populated!');
      } else {
        console.log('\n❌ FIX INCOMPLETE - Products are still null');
      }
    } else {
      console.log('\n⚠️  Wishlist is empty');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

testWishlistFix();
