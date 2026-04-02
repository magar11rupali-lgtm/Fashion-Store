/**
 * Test to see backend console logs
 */

const API_URL = 'http://localhost:1337/api';

async function test() {
  // Login
  const loginRes = await fetch(`${API_URL}/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'user@example.com',
      password: 'User123456',
    }),
  });

  if (!loginRes.ok) {
    console.error('Login failed');
    return;
  }

  const loginData = await loginRes.json();
  const token = loginData.jwt;
  console.log('Logged in successfully');

  // Fetch wishlist - this should trigger backend logs
  console.log('\nFetching wishlist (check backend console for logs)...');
  const wishlistRes = await fetch(
    `${API_URL}/wishlists?populate[product][populate]=*`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  const data = await wishlistRes.json();
  console.log('\nResponse received:');
  console.log(JSON.stringify(data, null, 2));
}

test().catch(console.error);
