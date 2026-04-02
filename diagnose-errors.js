/**
 * Diagnostic script to identify the source of Internal Server Errors
 * Run this with: node diagnose-errors.js
 */

const API_URL = 'http://localhost:1337/api';

async function checkBackendHealth() {
  console.log('=== Backend Health Check ===\n');
  
  try {
    const response = await fetch(`${API_URL}/products`);
    console.log('✓ Backend is reachable');
    console.log(`  Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`  Products found: ${data.data?.length || 0}`);
    } else {
      console.log('✗ Backend returned error');
      const error = await response.text();
      console.log(`  Error: ${error}`);
    }
  } catch (error) {
    console.log('✗ Cannot reach backend');
    console.log(`  Error: ${error.message}`);
    console.log('\n  Make sure backend is running:');
    console.log('  cd backend && npm run develop');
  }
}

async function checkWishlistEndpoint() {
  console.log('\n=== Wishlist Endpoint Check ===\n');
  
  try {
    // Try without auth first
    const response = await fetch(`${API_URL}/wishlists`);
    console.log(`Status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('✓ Endpoint requires authentication (expected)');
    } else if (response.status === 403) {
      console.log('✓ Endpoint is protected (expected)');
    } else if (response.status === 500) {
      console.log('✗ Server error detected');
      const error = await response.text();
      console.log(`  Error: ${error}`);
    } else {
      console.log('? Unexpected status code');
    }
  } catch (error) {
    console.log('✗ Cannot reach wishlist endpoint');
    console.log(`  Error: ${error.message}`);
  }
}

async function checkCORS() {
  console.log('\n=== CORS Check ===\n');
  
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'OPTIONS',
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
    };
    
    console.log('CORS Headers:');
    Object.entries(corsHeaders).forEach(([key, value]) => {
      console.log(`  ${key}: ${value || 'not set'}`);
    });
    
    if (corsHeaders['Access-Control-Allow-Origin']) {
      console.log('\n✓ CORS is configured');
    } else {
      console.log('\n⚠ CORS might not be configured properly');
    }
  } catch (error) {
    console.log('✗ CORS check failed');
    console.log(`  Error: ${error.message}`);
  }
}

async function runDiagnostics() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Internal Server Error Diagnostics     ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  await checkBackendHealth();
  await checkWishlistEndpoint();
  await checkCORS();
  
  console.log('\n=== Recommendations ===\n');
  console.log('1. Check backend console for detailed error messages');
  console.log('2. Verify environment variables in frontend/.env.local');
  console.log('3. Clear browser cache and storage');
  console.log('4. Check Network tab in browser DevTools');
  console.log('5. Ensure you are signed in with a valid account');
  
  console.log('\n=== Common Solutions ===\n');
  console.log('• Backend not running: cd backend && npm run develop');
  console.log('• CORS issues: Check backend/config/middlewares.ts');
  console.log('• Auth issues: Sign out and sign in again');
  console.log('• Database issues: Check backend console logs');
}

// Run diagnostics
runDiagnostics().catch(console.error);
