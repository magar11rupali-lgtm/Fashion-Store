/**
 * Test to identify the specific operation causing internal server error
 */

const API_URL = 'http://localhost:1337/api';

async function testEachOperation() {
  console.log('=== Testing Each Wishlist Operation ===\n');

  // Step 1: Create a new user to avoid conflicts
  console.log('Step 1: Creating new test user...');
  const timestamp = Date.now();
  const testEmail = `testuser${timestamp}@example.com`;
  const testUsername = `testuser${timestamp}`;

  try {
    const registerRes = await fetch(`${API_URL}/auth/local/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        email: testEmail,
        password: 'Test1234!',
      }),
    });

    if (!registerRes.ok) {
      console.error('❌ Registration failed:', registerRes.status);
      const error = await registerRes.text();
      console.error('Error:', error);
      return;
    }

    const { jwt, user } = await registerRes.json();
    console.log('✅ User created:', user.email);
    console.log('User ID:', user.id, '\n');

    // Step 2: Test fetching empty wishlist
    console.log('Step 2: Fetching empty wishlist...');
    const fetchRes1 = await fetch(`${API_URL}/wishlists?populate=product.image`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });

    console.log('Status:', fetchRes1.status);
    if (fetchRes1.ok) {
      const data = await fetchRes1.json();
      console.log('✅ Fetch successful - Items:', data.data.length, '\n');
    } else {
      console.error('❌ Fetch failed');
      console.error('Error:', await fetchRes1.text(), '\n');
      return;
    }

    // Step 3: Test adding to wishlist
    console.log('Step 3: Adding product 1 to wishlist...');
    const addRes = await fetch(`${API_URL}/wishlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: {
          product: 1,
        },
      }),
    });

    console.log('Status:', addRes.status);
    if (!addRes.ok) {
      console.error('❌ Add failed');
      console.error('Error:', await addRes.text(), '\n');
      return;
    }

    const addData = await addRes.json();
    const wishlistItemId = addData.data.id;
    console.log('✅ Add successful');
    console.log('Wishlist Item ID:', wishlistItemId);
    console.log('Response:', JSON.stringify(addData, null, 2), '\n');

    // Step 4: Test fetching wishlist with items
    console.log('Step 4: Fetching wishlist with items...');
    const fetchRes2 = await fetch(`${API_URL}/wishlists?populate=product.image`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });

    console.log('Status:', fetchRes2.status);
    if (fetchRes2.ok) {
      const data = await fetchRes2.json();
      console.log('✅ Fetch successful - Items:', data.data.length);
      console.log('First item:', JSON.stringify(data.data[0], null, 2).substring(0, 300), '...\n');
    } else {
      console.error('❌ Fetch failed');
      console.error('Error:', await fetchRes2.text(), '\n');
      return;
    }

    // Step 5: Test removing from wishlist
    console.log('Step 5: Removing item from wishlist...');
    console.log('Attempting to delete wishlist item ID:', wishlistItemId);
    
    const deleteRes = await fetch(`${API_URL}/wishlists/${wishlistItemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${jwt}` },
    });

    console.log('Status:', deleteRes.status);
    if (!deleteRes.ok) {
      console.error('❌ Delete failed');
      const errorText = await deleteRes.text();
      console.error('Error:', errorText);
      
      // Try to parse error details
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Error details:', JSON.stringify(errorJson, null, 2));
      } catch (e) {
        // Error is not JSON
      }
      console.log('\n⚠️  THIS IS WHERE THE ERROR OCCURS!\n');
      return;
    }

    const deleteData = await deleteRes.json();
    console.log('✅ Delete successful');
    console.log('Response:', JSON.stringify(deleteData, null, 2), '\n');

    // Step 6: Verify removal
    console.log('Step 6: Verifying item was removed...');
    const fetchRes3 = await fetch(`${API_URL}/wishlists?populate=product.image`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });

    if (fetchRes3.ok) {
      const data = await fetchRes3.json();
      console.log('✅ Verification successful - Items:', data.data.length);
      
      if (data.data.length === 0) {
        console.log('✅ Item successfully removed!\n');
      } else {
        console.log('⚠️  Item still exists in wishlist\n');
      }
    }

    console.log('=== All Tests Passed! ===\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testEachOperation().catch(console.error);
