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

async function testAddNewWishlist() {
  console.log('=== Testing Add New Wishlist Item ===\n');

  try {
    // Step 1: Get a product
    console.log('1. Getting a product...');
    const productsResponse = await makeRequest(`${API_URL}/api/products?pagination[limit]=1`);
    
    if (!productsResponse.data.data || productsResponse.data.data.length === 0) {
      console.log('❌ No products found');
      return;
    }
    
    const product = productsResponse.data.data[0];
    const productName = product.attributes?.name || product.name || 'Unknown Product';
    console.log(`✓ Product: ${productName} (ID: ${product.id})`);

    // Step 2: Register a brand new user
    console.log('\n2. Creating a new test user...');
    const timestamp = Date.now();
    const email = `testuser${timestamp}@example.com`;
    
    const registerResponse = await makeRequest(`${API_URL}/api/auth/local/register`, {
      method: 'POST',
      data: {
        username: `testuser${timestamp}`,
        email: email,
        password: 'Test1234!'
      }
    });

    const jwt = registerResponse.data.jwt;
    const userId = registerResponse.data.user.id;
    console.log(`✓ User created: ${email}`);
    console.log(`  User ID: ${userId}`);

    // Step 3: Check wishlist is empty
    console.log('\n3. Checking initial wishlist...');
    const initialWishlist = await makeRequest(`${API_URL}/api/wishlists`, {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });
    console.log(`✓ Initial wishlist items: ${initialWishlist.data.data?.length || 0}`);

    // Step 4: Add product to wishlist
    console.log('\n4. Adding product to wishlist via API...');
    console.log(`   Product ID: ${product.id}`);
    console.log(`   Request body: { data: { product: ${product.id} } }`);
    
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

    console.log('✓ API Response:');
    console.log(JSON.stringify(addResponse.data, null, 2));

    // Step 5: Verify in database
    console.log('\n5. Checking database directly...');
    const Database = require('better-sqlite3');
    const db = new Database('./backend/.tmp/data.db', { readonly: true });
    
    const dbWishlists = db.prepare(`
      SELECT w.id, w.document_id, wu.user_id, wp.product_id
      FROM wishlists w
      LEFT JOIN wishlists_user_lnk wu ON w.id = wu.wishlist_id
      LEFT JOIN wishlists_product_lnk wp ON w.id = wp.wishlist_id
      WHERE wu.user_id = ?
    `).all(userId);
    
    console.log(`✓ Database shows ${dbWishlists.length} wishlist items for user ${userId}`);
    if (dbWishlists.length > 0) {
      console.log('   Items:', JSON.stringify(dbWishlists, null, 2));
    }
    
    db.close();

    // Step 6: Fetch via API again
    console.log('\n6. Fetching wishlist via API...');
    const finalWishlist = await makeRequest(`${API_URL}/api/wishlists`, {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });

    console.log(`✓ API returns ${finalWishlist.data.data?.length || 0} items`);
    console.log('Response:', JSON.stringify(finalWishlist.data, null, 2));

    console.log('\n✅ TEST COMPLETE');
    console.log('\nTo see in Strapi admin:');
    console.log('1. Go to: http://localhost:1337/admin/content-manager/collection-types/api::wishlist.wishlist');
    console.log('2. Refresh the page');
    console.log(`3. Look for wishlist items with user ID: ${userId}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('Stack:', error.stack);
  }
}

testAddNewWishlist();
