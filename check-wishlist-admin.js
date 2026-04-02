const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';

async function checkWishlistData() {
  console.log('=== Checking Wishlist Data via Strapi API ===\n');

  try {
    // First, login as admin to get a token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${STRAPI_URL}/admin/login`, {
      email: 'admin@example.com',
      password: 'Admin@123'
    });

    const adminToken = loginResponse.data.data.token;
    console.log('✓ Admin logged in successfully\n');

    // Query wishlists via Content Manager API
    console.log('2. Fetching wishlists from Content Manager...');
    const wishlistResponse = await axios.get(
      `${STRAPI_URL}/content-manager/collection-types/api::wishlist.wishlist`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        },
        params: {
          page: 1,
          pageSize: 100
        }
      }
    );

    console.log(`✓ Found ${wishlistResponse.data.results?.length || 0} wishlist entries`);
    
    if (wishlistResponse.data.results && wishlistResponse.data.results.length > 0) {
      console.log('\nWishlist entries:');
      wishlistResponse.data.results.forEach((item, index) => {
        console.log(`\n${index + 1}. Wishlist ID: ${item.id}`);
        console.log(`   Document ID: ${item.documentId}`);
        console.log(`   Added At: ${item.addedAt}`);
        console.log(`   User: ${item.user?.username || 'N/A'}`);
        console.log(`   Product: ${item.product?.name || 'N/A'}`);
      });
    } else {
      console.log('\n⚠ No wishlist entries found in database');
    }

    // Also check via public API
    console.log('\n3. Checking public API endpoint...');
    try {
      const publicResponse = await axios.get(`${STRAPI_URL}/api/wishlists`);
      console.log(`Public API returned: ${publicResponse.data.data?.length || 0} items`);
    } catch (error) {
      console.log(`Public API error: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }
}

checkWishlistData();
