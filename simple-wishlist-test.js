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

async function test() {
  console.log('=== Simple Wishlist Test ===\n');

  // Use the user we just created
  const email = 'testuser1772685348393@example.com';
  const password = 'Test1234!';

  try {
    // Login
    console.log(`1. Logging in as ${email}...`);
    const loginResponse = await makeRequest(`${API_URL}/api/auth/local`, {
      method: 'POST',
      data: {
        identifier: email,
        password: password
      }
    });

    const jwt = loginResponse.data.jwt;
    const userId = loginResponse.data.user.id;
    console.log(`✓ Logged in (User ID: ${userId})\n`);

    // Get current wishlist
    console.log('2. Fetching current wishlist...');
    const currentWishlist = await makeRequest(`${API_URL}/api/wishlists`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    console.log(`✓ Current items: ${currentWishlist.data.data?.length || 0}\n`);

    // Get a product
    console.log('3. Getting a product to add...');
    const productsResponse = await makeRequest(`${API_URL}/api/products?pagination[start]=1&pagination[limit]=1`);
    const product = productsResponse.data.data[0];
    console.log(`✓ Product: ${product.attributes?.name || 'Unknown'} (ID: ${product.id})\n`);

    // Add to wishlist
    console.log('4. Adding to wishlist...');
    const addResponse = await makeRequest(`${API_URL}/api/wishlists`, {
      method: 'POST',
      data: { data: { product: product.id } },
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      }
    });

    const newItemId = addResponse.data.data.id;
    console.log(`✓ Added! Wishlist item ID: ${newItemId}\n`);

    // Fetch wishlist again
    console.log('5. Fetching updated wishlist...');
    const updatedWishlist = await makeRequest(`${API_URL}/api/wishlists`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    console.log(`✓ Updated items: ${updatedWishlist.data.data?.length || 0}`);
    
    console.log('\nWishlist items:');
    updatedWishlist.data.data.forEach((item, i) => {
      const name = item.attributes?.product?.data?.attributes?.name || 'Unknown';
      console.log(`   ${i + 1}. ${name} (Wishlist ID: ${item.id})`);
    });

    console.log('\n✅ SUCCESS! The API is working correctly.');
    console.log('\n📋 To see in Strapi admin panel:');
    console.log('   1. Refresh the page in your browser');
    console.log('   2. The new items should appear');
    console.log(`   3. Look for user ID: ${userId}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

test();
