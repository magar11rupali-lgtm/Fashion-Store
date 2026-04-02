const API_URL = 'http://localhost:1337/api';

async function testWishlistEndpoint() {
  console.log('Testing wishlist endpoint without authentication...\n');
  
  try {
    const response = await fetch(`${API_URL}/wishlists?populate[product][populate]=*`);
    
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    const text = await response.text();
    console.log('\nResponse body:');
    console.log(text);
    
    if (response.status === 401) {
      console.log('\n✅ This is expected - endpoint requires authentication');
    } else if (response.status === 500) {
      console.log('\n❌ Server error - there might be an issue with the schema or controller');
      console.log('   Check the backend console for error details');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testWishlistEndpoint();
