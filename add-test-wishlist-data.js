const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (options.data) {
      reqOptions.headers['Content-Type'] = 'application/json';
    }

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            const error = new Error(`HTTP ${res.statusCode}`);
            error.response = { status: res.statusCode, data: parsed };
            reject(error);
          } else {
            resolve({ status: res.statusCode, data: parsed });
          }
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (options.data) {
      req.write(JSON.stringify(options.data));
    }
    req.end();
  });
}

const API_URL = 'http://localhost:1337';

async function addTestWishlistData() {
  console.log('=== Adding Test Wishlist Data ===\n');

  try {
    // Step 1: Get products
    console.log('1. Fetching products...');
    const productsResponse = await makeRequest(`${API_URL}/api/products?populate=*`);
    const products = productsResponse.data.data;
    console.log(`✓ Found ${products.length} products`);
    
    if (products.length === 0) {
      console.log('❌ No products available. Cannot add to wishlist.');
      return;
    }

    // Step 2: Login as test user
    console.log('\n2. Logging in as user123@gmail.com...');
    const loginResponse = await makeRequest(`${API_URL}/api/auth/local`, {
      method: 'POST',
      data: {
        identifier: 'user123@gmail.com',
        password: 'Test1234!'
      }
    });

    const jwt = loginResponse.data.jwt;
    const userId = loginResponse.data.user.id;
    console.log('✓ Login successful');
    console.log('User ID:', userId);

    // Step 3: Check current wishlist
    console.log('\n3. Checking current wishlist...');
    const currentWishlist = await makeRequest(`${API_URL}/api/wishlists`, {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });
    console.log(`Current wishlist items: ${currentWishlist.data.data?.length || 0}`);

    // Step 4: Add first 3 products to wishlist
    console.log('\n4. Adding products to wishlist...');
    const productsToAdd = products.slice(0, 3);
    
    for (const product of productsToAdd) {
      console.log(`\n   Adding: ${product.attributes.name} (ID: ${product.id})`);
      
      const addResponse = await makeRequest(`${API_URL}/api/wishlists`, {
        method: 'POST',
        data: {
          data: {
            product: product.id
          }
        },
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`   ✓ Added successfully (Wishlist ID: ${addResponse.data.data.id})`);
    }

    // Step 5: Verify wishlist
    console.log('\n5. Verifying wishlist...');
    const finalWishlist = await makeRequest(`${API_URL}/api/wishlists`, {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });

    console.log(`\n✓ Wishlist now has ${finalWishlist.data.data?.length || 0} items`);
    
    if (finalWishlist.data.data?.length > 0) {
      console.log('\nWishlist items:');
      finalWishlist.data.data.forEach((item, index) => {
        const productName = item.attributes?.product?.data?.attributes?.name || 'Unknown';
        console.log(`   ${index + 1}. ${productName} (Wishlist ID: ${item.id})`);
      });
    }

    console.log('\n✅ SUCCESS! Refresh the Strapi admin panel to see the data.');
    console.log('Go to: http://localhost:1337/admin/content-manager/collection-types/api::wishlist.wishlist');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

addTestWishlistData();
