const Database = require('better-sqlite3');

const db = new Database('.tmp/data.db', { readonly: true });

console.log('=== Wishlist Backend Diagnostic ===\n');

// 1. Check wishlists
const wishlists = db.prepare('SELECT * FROM wishlists').all();
console.log('1. Wishlist items:', wishlists.length);
if (wishlists.length > 0) {
  console.log(JSON.stringify(wishlists, null, 2));
}

// 2. Check users
const users = db.prepare('SELECT id, username, email FROM up_users').all();
console.log('\n2. Users:', users.length);
users.forEach(u => console.log(`   - ID ${u.id}: ${u.email}`));

// 3. Check products
const products = db.prepare('SELECT COUNT(*) as count FROM products').get();
console.log('\n3. Products:', products.count);

// 4. Check permissions
const permissions = db.prepare(`
  SELECT p.action, p.enabled, r.name as role_name
  FROM up_permissions p
  JOIN up_roles r ON p.role = r.id
  WHERE p.action LIKE '%wishlist%'
`).all();

console.log('\n4. Wishlist Permissions:');
if (permissions.length > 0) {
  permissions.forEach(p => {
    console.log(`   - ${p.role_name}: ${p.action} (enabled: ${p.enabled})`);
  });
} else {
  console.log('   ⚠️  No wishlist permissions configured!');
}

db.close();
