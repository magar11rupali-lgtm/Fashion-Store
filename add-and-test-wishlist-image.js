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
  console.log('=== Add and Test Wishlist Images ===\n');

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

    // Get a product with image
    console.log('1. Getting product with image...');
    const productsResponse = await makeRequest(`${API_URL}/api/products?populate=*&pagination[limit]=1`);
    const product = productsResponse.data.data[0];
    
    console.log('Product structure:');
    console.log('  ID:', product.id);
    console.log('  Name:', product.attributes?.name);
    console.log('  Image:', product.attributes?.image ? 'exists' : 'missing');
    
    if (product.attributes?.image?.data) {
      const imgData = product.attributes.image.data;
      if (Array.isArray(imgData)) {
        console.log('  Image URL:', imgData[0]?.attributes?.url);
      } else {
        console.log('  Image URL:', imgData.attributes?.url);
      }
    }

    // Add to wishlist
    console.log('\n2. Adding to wishlist...');
    const addResponse = await makeRequest(`${API_URL}/api/wishlists`, {
      method: 'POST',
      data: { data: { product: product.id } },
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✓ Added to wishlist');
    console.log('\nAdd response structure:');
    console.log(JSON.stringify(addResponse.data, null, 2));

    // Fetch wishlist
    console.log('\n3. Fetching wishlist...');
    const wishlistResponse = await makeRequest(
      `${API_URL}/api/wishlists?populate[product][populate]=*`,
      {
        headers: { Authorization: `Bearer ${jwt}` }
      }
    );

    console.log('\nWishlist response:');
    console.log(JSON.stringify(wishlistResponse.data, null, 2));

    // Analyze image path
    const items = wishlistResponse.data.data || [];
    if (items.length > 0) {
      console.log('\n=== Image Analysis ===');
      items.forEach((item, i) => {
        console.log(`\nItem ${i + 1}:`);
        const productData = item.attributes?.product?.data?.attributes;
        console.log('  Product name:', productData?.name);
        console.log('  Has image:', !!productData?.image);
        console.log('  Image structure:', productData?.image ? Object.keys(productData.image) : 'none');
        
        if (productData?.image?.data) {
          const imgData = productData.image.data;
          if (Array.isArray(imgData)) {
            console.log('  Image is array, length:', imgData.length);
            console.log('  First image URL:', imgData[0]?.attributes?.url);
          } else {
            console.log('  Image is object');
            console.log('  Image URL:', imgData.attributes?.url);
          }
        }
      });
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

test();
