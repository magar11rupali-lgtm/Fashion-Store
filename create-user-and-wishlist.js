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

async function createUserAndAddWishlist() {
  console.log('=== Creating Test User and Wishlist Data ===\n');

  try {
    // Step 1: Register a new user
    console.log('1. Registering new test user...');
    const registerResponse = await makeRequest(`${API_URL}/api/auth/local/register`, {
      method: 'POST',
      data: {
        username: 'wishlisttester',
        email: 'wishlisttest@example.com',
        password: 'Test1234!'
      }
    });

    const jwt = registerResponse.data.jwt;
    const userId = registerResponse.data.user.id;
    console.log('✓ User registered successfully');
    console.log('User ID:', userId);
    console.log('Email: wishlisttest@example.com');
    console.log('Password: Test1234!');

    // Step 2: Get products
    console.log('\n2. Fetching products...');
    const productsResponse = await makeRequest(`${API_URL}/api/products?populate=*`);
    const products = productsResponse.data.data;
    console.log(`✓ Found ${products.length} products`);

    // Step 3: Add products to wishlist
    console.log('\n3. Adding products to wishlist...');
    const productsToAdd = products.slice(0, 5); // Add first 5 products
    
    for (const product of productsToAdd) {
      const productName = product.attributes?.name || product.name || `Product ${product.id}`;
      console.log(`\n   Adding: ${productName}`);
      
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

      console.log(`   ✓ Added (Wishlist ID: ${addResponse.data.data.id})`);
    }

    // Step 4: Verify wishlist
    console.log('\n4. Verifying wishlist...');
    const wishlistResponse = await makeRequest(`${API_URL}/api/wishlists`, {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });

    const wishlistItems = wishlistResponse.data.data || [];
    console.log(`\n✅ SUCCESS! Wishlist now has ${wishlistItems.length} items`);
    
    console.log('\n=== Wishlist Items ===');
    wishlistItems.forEach((item, index) => {
      const productName = item.attributes?.product?.data?.attributes?.name || 'Unknown';
      console.log(`${index + 1}. ${productName} (Wishlist ID: ${item.id})`);
    });

    console.log('\n=== Next Steps ===');
    console.log('1. Refresh the Strapi admin panel');
    console.log('2. You should now see 5 wishlist entries');
    console.log('3. Login to frontend with: wishlisttest@example.com / Test1234!');
    console.log('4. Your wishlist should display the 5 products');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 400 && error.response.data?.error?.message?.includes('already taken')) {
        console.log('\n⚠️  User already exists. Trying to login instead...');
        await loginAndAddWishlist();
      }
    }
  }
}

async function loginAndAddWishlist() {
  try {
    console.log('\nLogging in as wishlisttest@example.com...');
    const loginResponse = await makeRequest(`${API_URL}/api/auth/local`, {
      method: 'POST',
      data: {
        identifier: 'wishlisttest@example.com',
        password: 'Test1234!'
      }
    });

    const jwt = loginResponse.data.jwt;
    console.log('✓ Login successful');

    // Get products
    const productsResponse = await makeRequest(`${API_URL}/api/products?populate=*`);
    const products = productsResponse.data.data;

    // Add products to wishlist
    console.log('\nAdding products to wishlist...');
    const productsToAdd = products.slice(0, 5);
    
    for (const product of productsToAdd) {
      const productName = product.attributes?.name || product.name || `Product ${product.id}`;
      try {
        await makeRequest(`${API_URL}/api/wishlists`, {
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
        console.log(`✓ Added: ${productName}`);
      } catch (err) {
        if (err.response?.status === 400) {
          console.log(`  (Already in wishlist: ${productName})`);
        } else {
          throw err;
        }
      }
    }

    // Verify
    const wishlistResponse = await makeRequest(`${API_URL}/api/wishlists`, {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });

    console.log(`\n✅ Wishlist has ${wishlistResponse.data.data?.length || 0} items`);
    console.log('Refresh the admin panel to see the data!');

  } catch (error) {
    console.error('Login failed:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

createUserAndAddWishlist();
