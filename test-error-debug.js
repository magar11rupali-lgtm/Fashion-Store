/**
 * Debug script to test the exact error scenario
 * Run this in your browser console while on the page with errors
 */

// Test 1: Check if session exists
console.log('=== Session Check ===');
console.log('Session:', window.sessionStorage);

// Test 2: Try to fetch wishlist
async function testWishlistFetch() {
  console.log('=== Testing Wishlist Fetch ===');
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api';
  
  // Get token from session storage (NextAuth stores it there)
  const sessionData = sessionStorage.getItem('next-auth.session-token');
  console.log('Session token:', sessionData ? 'Found' : 'Not found');
  
  try {
    const response = await fetch(`${API_URL}/wishlists?populate=product.image`, {
      headers: {
        'Authorization': `Bearer ${sessionData}`,
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (!response.ok) {
      console.error('Error details:', data);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// Test 3: Check what's triggering the errors
console.log('=== Checking Error Sources ===');
console.log('Look for these in Network tab:');
console.log('- Failed requests to /api/wishlists');
console.log('- Failed requests to /api/products');
console.log('- Any 500 status codes');

// Run the test
testWishlistFetch();
