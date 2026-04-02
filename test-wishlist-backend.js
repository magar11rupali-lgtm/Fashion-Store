/**
 * Test script to debug wishlist backend error
 */

const API_URL = 'http://localhost:1337/api';

async function testWishlistEndpoint() {
  console.log('Testing wishlist endpoint...\n');

  // First, let's try to sign in to get a valid token
  console.log('1. Signing in to get authentication token...');
  try {
    const signInResponse = await fetch(`${API_URL}/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'test@example.com',
        password: 'Test123456',
      }),
    });

    if (!signInResponse.ok) {
      const errorData = await signInResponse.json();
      console.error('Sign in failed:', errorData);
      console.log('\nNote: Make sure you have a test user account created.');
      return;
    }

    const signInData = await signInResponse.json();
    console.log('✓ Sign in successful');
    console.log('User ID:', signInData.user.id);
    console.log('Token:', signInData.jwt.substring(0, 20) + '...\n');

    // Now test the wishlist endpoint
    console.log('2. Fetching wishlist...');
    const wishlistResponse = await fetch(`${API_URL}/wishlists?populate=product.image`, {
      headers: {
        'Authorization': `Bearer ${signInData.jwt}`,
      },
    });

    console.log('Response status:', wishlistResponse.status);
    console.log('Response status text:', wishlistResponse.statusText);

    const responseText = await wishlistResponse.text();
    console.log('\nResponse body:');
    console.log(responseText);

    if (wishlistResponse.ok) {
      const data = JSON.parse(responseText);
      console.log('\n✓ Wishlist fetched successfully');
      console.log('Number of items:', data.data?.length || 0);
    } else {
      console.error('\n✗ Wishlist fetch failed');
      try {
        const errorData = JSON.parse(responseText);
        console.error('Error details:', JSON.stringify(errorData, null, 2));
      } catch (e) {
        console.error('Raw error:', responseText);
      }
    }

  } catch (error) {
    console.error('Test failed with error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testWishlistEndpoint();
