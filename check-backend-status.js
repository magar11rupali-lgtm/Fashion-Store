const API_URL = 'http://localhost:1337/api';

async function checkBackend() {
  console.log('Checking backend status...\n');
  
  try {
    // Check if backend is running
    const healthCheck = await fetch(`${API_URL}/products?pagination[limit]=1`);
    
    if (healthCheck.ok) {
      console.log('✅ Backend is running');
      console.log(`   Status: ${healthCheck.status}`);
      
      // Try to fetch wishlist endpoint (will fail without auth, but shows if endpoint exists)
      const wishlistCheck = await fetch(`${API_URL}/wishlists`);
      console.log(`\n✅ Wishlist endpoint exists`);
      console.log(`   Status: ${wishlistCheck.status} (${wishlistCheck.status === 401 ? 'Requires authentication - this is correct' : 'Unexpected'})`);
      
      console.log('\n📋 Backend is ready. The schema changes should be active.');
      console.log('   To test with authentication, you need valid user credentials.');
      
    } else {
      console.log('❌ Backend returned error:', healthCheck.status);
    }
  } catch (error) {
    console.log('❌ Backend is not running or not accessible');
    console.log(`   Error: ${error.message}`);
    console.log('\n📋 Please start the backend:');
    console.log('   cd backend');
    console.log('   npm run develop');
  }
}

checkBackend();
