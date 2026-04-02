/**
 * Check environment variables
 */

require('dotenv').config({ path: './backend/.env' });

console.log('=== Environment Variables Check ===\n');

const requiredVars = [
  'HOST',
  'PORT',
  'APP_KEYS',
  'API_TOKEN_SALT',
  'ADMIN_JWT_SECRET',
  'TRANSFER_TOKEN_SALT',
  'JWT_SECRET',
];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const displayValue = value.length > 20 ? value.substring(0, 20) + '...' : value;
    console.log(`✓ ${varName}: ${displayValue}`);
  } else {
    console.log(`✗ ${varName}: NOT SET`);
  }
});

console.log('\n=== Check Complete ===');
