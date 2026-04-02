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
          resolve({ status: res.statusCode, data: parsed });
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

async function testAdminAPI() {
  console.log('=== Testing Admin Content Manager API ===\n');

  try {
    // The admin panel uses the Content Manager API
    // This is different from the public API
    
    console.log('1. Testing public API endpoint...');
    const publicResponse = await makeRequest(`${API_URL}/api/wishlists`);
    console.log(`Status: ${publicResponse.status}`);
    console.log(`Response: ${JSON.stringify(publicResponse.data, null, 2).substring(0, 200)}...\n`);

    console.log('2. Testing Content Manager API endpoint...');
    // The Content Manager uses a different endpoint
    const cmResponse = await makeRequest(`${API_URL}/content-manager/collection-types/api::wishlist.wishlist`);
    console.log(`Status: ${cmResponse.status}`);
    console.log(`Response: ${JSON.stringify(cmResponse.data, null, 2).substring(0, 500)}...\n`);

    console.log('3. Checking database directly...');
    const { execSync } = require('child_process');
    const dbQuery = execSync('node -e "const db = require(\'better-sqlite3\')(\'backend/.tmp/data.db\', {readonly: true}); const count = db.prepare(\'SELECT COUNT(*) as count FROM wishlists\').get(); console.log(JSON.stringify(count)); db.close();"', { encoding: 'utf8', cwd: '.' });
    const dbCount = JSON.parse(dbQuery.trim());
    console.log(`Database has ${dbCount.count} wishlist items\n`);

    console.log('=== Analysis ===');
    console.log('If the database has items but the admin panel shows 0:');
    console.log('  - The admin panel might be cached');
    console.log('  - Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)');
    console.log('  - Or clear browser cache and reload');
    console.log('  - Or try in an incognito/private window');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAdminAPI();
