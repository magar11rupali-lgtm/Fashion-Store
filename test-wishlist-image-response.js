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

async function testImageResponse() {
  console.log('=== Testing Wishlist Image Response ===\n');

  try {
    // Login
    const loginResponse = await makeRequest(`${API_URL}/api/auth/local`, {
      method: 'POST',
      data: {
        identifier: 'testuser1772685348393@example.com',
        password: 'Test1234!'
      }
    });

    const jwt = loginResponse.data.jwt;
    console.log('✓ Logged in\n');

    // Fetch wishlist with full populate
    console.log('Fetching wishlist with populate...');
    const wishlistResponse = await makeRequest(
      `${API_URL}/api/wishlists?populate[product][populate]=*`,
      {
        headers: { Authorization: `Bearer ${jwt}` }
      }
    );

    console.log('Response structure:');
    console.log(JSON.stringify(wishlistResponse.data, null, 2));

    // Analyze each item
    console.log('\n=== Analyzing Each Item ===');
    const items = wishlistResponse.data.data || [];
    
    items.forEach((item, index) => {
      console.log(`\nItem ${index + 1}:`);
      console.log('  ID:', item.id);
      console.log('  Attributes:', Object.keys(item.attributes || {}));
      
      const product = item.attributes?.product;
      console.log('  Product structure:', product ? Object.keys(product) : 'none');
      
      const productData = product?.data;
      console.log('  Product data:', productData ? Object.keys(productData) : 'none');
      
      const productAttrs = productData?.attributes;
      console.log('  Product attributes:', productAttrs ? Object.keys(productAttrs) : 'none');
      
      const image = productAttrs?.image;
      console.log('  Image structure:', image ? Object.keys(image) : 'none');
      
      const imageData = image?.data;
      console.log('  Image data:', imageData ? (Array.isArray(imageData) ? 'array' : 'object') : 'none');
      
      if (imageData) {
        if (Array.isArray(imageData)) {
          console.log('  Image URL:', imageData[0]?.attributes?.url || 'not found');
        } else {
          console.log('  Image URL:', imageData.attributes?.url || 'not found');
        }
      }
    });

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testImageResponse();
