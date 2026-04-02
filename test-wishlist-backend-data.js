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

async function testWishlistBackend() {
  console.log('=== Testing Wishlist Backend ===\n');

  try {
    // Step 1: Login to get JWT
    console.log('1. Logging in...');
    const loginResponse = await makeRequest(`${API_URL}/api/auth/local`, {
      method: 'POST',
      data: {
        identifier: 'test@example.com',
        password: 'Test1234!'
      }
    });

    const jwt = loginResponse.data.jwt;
    const userId = loginResponse.data.user.id;
    console.log('✓ Login successful');
    console.log('User ID:', userId);
    console.log('JWT:', jwt.substring(0, 20) + '...\n');

    // Step 2: Check wishlist data
    console.log('2. Fetching wishlist data...');
    const wishlistResponse = await makeRequest(`${API_URL}/api/wishlists`, {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });

    console.log('✓ Wishlist response received');
    console.log('Status:', wishlistResponse.status);
    console.log('Data:', JSON.stringify(wishlistResponse.data, null, 2));
    console.log('Number of items:', wishlistResponse.data.data?.length || 0);

    // Step 3: Check if there are products available
    console.log('\n3. Checking available products...');
    const productsResponse = await makeRequest(`${API_URL}/api/products?populate=*`);
    console.log('✓ Products found:', productsResponse.data.data?.length || 0);
    
    if (productsResponse.data.data?.length > 0) {
      console.log('First product:', {
        id: productsResponse.data.data[0].id,
        name: productsResponse.data.data[0].attributes?.name
      });
    }

    // Step 4: Try to add a product to wishlist if none exist
    if (wishlistResponse.data.data?.length === 0 && productsResponse.data.data?.length > 0) {
      console.log('\n4. Adding first product to wishlist...');
      const productId = productsResponse.data.data[0].id;
      
      const addResponse = await makeRequest(`${API_URL}/api/wishlists`, {
        method: 'POST',
        data: {
          data: {
            product: productId
          }
        },
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✓ Product added to wishlist');
      console.log('Response:', JSON.stringify(addResponse.data, null, 2));

      // Fetch wishlist again
      console.log('\n5. Fetching wishlist again...');
      const updatedWishlistResponse = await makeRequest(`${API_URL}/api/wishlists`, {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      });
      console.log('Updated wishlist:', JSON.stringify(updatedWishlistResponse.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testWishlistBackend();
