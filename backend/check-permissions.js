const Database = require('better-sqlite3');

const db = new Database('.tmp/data.db', { readonly: true });

console.log('=== Checking Permissions Structure ===\n');

// Check permissions table schema
const schema = db.prepare("PRAGMA table_info(up_permissions)").all();
console.log('Permissions table columns:');
schema.forEach(col => console.log(`   - ${col.name} (${col.type})`));

// Get all wishlist-related permissions
console.log('\n=== Wishlist Permissions ===');
const permissions = db.prepare(`
  SELECT p.*, r.name as role_name
  FROM up_permissions p
  JOIN up_roles r ON p.role = r.id
  WHERE p.action LIKE '%wishlist%'
`).all();

if (permissions.length > 0) {
  console.log(`Found ${permissions.length} wishlist permissions:`);
  permissions.forEach(p => {
    console.log(`\n   Role: ${p.role_name}`);
    console.log(`   Action: ${p.action}`);
    console.log(`   Fields:`, Object.keys(p).join(', '));
  });
} else {
  console.log('⚠️  No wishlist permissions found!');
  console.log('\nThis means the Wishlist content type permissions need to be configured in Strapi admin.');
}

// Check all roles
console.log('\n=== Available Roles ===');
const roles = db.prepare('SELECT * FROM up_roles').all();
roles.forEach(r => console.log(`   - ${r.name} (ID: ${r.id})`));

db.close();
