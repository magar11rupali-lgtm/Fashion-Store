const http = require('http');
const { execSync } = require('child_process');

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

async function testFrontendWishlist() {
  console.log('=== Testing Frontend Wishlist Flow ===\n');

  try {
    // Get the latest user from database
    console.log('Getting latest user from database...');
    const userQuery = execSync('node -e "const db = require(\'better-sqlite3\')(\'backend/.tmp/data.db\', {readonly: true}); const user = db.prepare(\'SELECT id, email FROM up_users ORDER BY id DESC LIMIT 1\').get(); console.log(JSON.stringify(user)); db.close();"', { encoding: 'utf8' });
    const latestUser = JSON.parse(userQuery.trim());

    console.log(`Using user: ${latestUser.email} (ID: ${latestUser.id})`);
    console.log('Password: Test1234!\n');

    // Login
    console.log('1. Logging in...');
    const loginResponse = await makeRequest(`${API_URL}/api/auth/local`, {
      method: 'POST',
      data: {
        identifier: latestUser.email,
        password: 'Test1234!'
      }
    });

    const jwt = loginResponse.data.jwt;
    console.log('✓ Login successful\n');

    // Get products
    console.log('2. Getting products...');
    const productsResponse = await makeRequest(`${API_URL}/api/products?pagination[limit]=3`);
    const products = productsResponse.data.data;
    console.log(`✓ Found ${products.length} products\n`);

    // Add each product to wishlist
    console.log('3. Adding products to wishlist...');
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const productName = product.attributes?.name || `Product ${product.id}`;
      
      try {
        console.log(`\n   [${i + 1}] Adding: ${productName} (ID: ${product.id})`);
        
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

        const wishlistId = addResponse.data.data?.id;
        console.log(`   ✓ Created wishlist item ID: ${wishlistId}`);
        
        // Immediately verify it exists
        const verifyQuery = execSync(`node -e "const db = require('better-sqlite3')('backend/.tmp/data.db', {readonly: true}); const exists = db.prepare('SELECT id FROM wishlists WHERE id = ${wishlistId}').get(); console.log(JSON.stringify(exists)); db.close();"`, { encoding: 'utf8' });
        const exists = JSON.parse(verifyQuery.trim());
        
        if (exists) {
          console.log(`   ✓ Confirmed in database`);
        } else {
          console.log(`   ⚠️  NOT found in database!`);
        }
        
      } catch (err) {
        if (err.response?.status === 400) {
          console.log(`   (Already in wishlist)`);
        } else {
          console.error(`   ❌ Failed: ${err.message}`);
        }
      }
    }

    // Final verification
    console.log('\n4. Final verification...');
    
    const { execSync } = require('child_process');
    const dbCountQuery = execSync(`node -e "const db = require('better-sqlite3')('backend/.tmp/data.db', {readonly: true}); const count = db.prepare('SELECT COUNT(*) as count FROM wishlists w JOIN wishlists_user_lnk wu ON w.id = wu.wishlist_id WHERE wu.user_id = ${latestUser.id}').get(); console.log(JSON.stringify(count)); db.close();"`, { encoding: 'utf8' });
    const dbCount = JSON.parse(dbCountQuery.trim());
    
    console.log(`   Database: ${dbCount.count} items for user ${latestUser.id}`);

    const apiResponse = await makeRequest(`${API_URL}/api/wishlists`, {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });
    
    console.log(`   API: ${apiResponse.data.data?.length || 0} items returned`);

    console.log('\n✅ TEST COMPLETE');
    console.log('\n📋 To view in Strapi admin:');
    console.log('   1. Go to: http://localhost:1337/admin');
    console.log('   2. Navigate to: Content Manager > Wishlist');
    console.log('   3. Click refresh or reload the page');
    console.log(`   4. Filter by user ID: ${latestUser.id}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testFrontendWishlist();
