/**
 * Test script to diagnose wishlist 500 error
 */

const API_URL = 'http://localhost:1337/api';

async function testWishlistEndpoint() {
  console.log('Testing wishlist endpoint...\n');

  // First, let's try to sign in to get a token
  console.log('1. Signing in...');
  try {
    const signInRes = await fetch(`${API_URL}/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'test@example.com',
        password: 'Test123456',
      }),
    });

    if (!signInRes.ok) {
      console.error('Sign in failed:', signInRes.status);
      const error = await signInRes.text();
      console.error('Error:', error);
      return;
    }

    const signInData = await signInRes.json();
    console.log('✓ Sign in successful');
    console.log('User ID:', signInData.user.id);
    console.log('Token:', signInData.jwt.substring(0, 20) + '...\n');

    // Now test the wishlist endpoint
    console.log('2. Fetching wishlist...');
    const wishlistRes = await fetch(`${API_URL}/wishlists?populate=product.image`, {
      headers: {
        'Authorization': `Bearer ${signInData.jwt}`,
      },
    });

    console.log('Response status:', wishlistRes.status);
    console.log('Response headers:', Object.fromEntries(wishlistRes.headers.entries()));

    if (!wishlistRes.ok) {
      console.error('✗ Wishlist fetch failed');
      const errorText = await wishlistRes.text();
      console.error('Error response:', errorText);
      return;
    }

    const wishlistData = await wishlistRes.json();
    console.log('✓ Wishlist fetch successful');
    console.log('Wishlist data:', JSON.stringify(wishlistData, null, 2));

  } catch (error) {
    console.error('✗ Test failed with error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testWishlistEndpoint();
