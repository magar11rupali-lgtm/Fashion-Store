const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', '.tmp', 'data.db');

try {
  const db = new Database(dbPath, { readonly: true });
  
  console.log('=== Wishlist Backend Diagnostic ===\n');
  
  // 1. Check wishlists table
  console.log('1. Wishlist Table:');
  const wishlists = db.prepare('SELECT * FROM wishlists').all();
  console.log(`   Found ${wishlists.length} wishlist items`);
  if (wishlists.length > 0) {
    console.log('   Data:', JSON.stringify(wishlists, null, 2));
  }
  
  // 2. Check users
  console.log('\n2. Users:');
  const users = db.prepare('SELECT id, username, email FROM up_users').all();
  console.log(`   Found ${users.length} users`);
  users.forEach(u => console.log(`   - ID ${u.id}: ${u.email} (${u.username})`));
  
  // 3. Check products
  console.log('\n3. Products:');
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
  console.log(`   Found ${productCount.count} products`);
  
  // 4. Check permissions for wishlist
  console.log('\n4. Wishlist Permissions:');
  const permissions = db.prepare(`
    SELECT p.action, p.enabled, r.name as role_name
    FROM up_permissions p
    JOIN up_roles r ON p.role = r.id
    WHERE p.action LIKE '%wishlist%'
  `).all();
  
  if (permissions.length > 0) {
    console.log('   Permissions found:');
    permissions.forEach(p => {
      console.log(`   - ${p.role_name}: ${p.action} (enabled: ${p.enabled})`);
    });
  } else {
    console.log('   ⚠️  No wishlist permissions found in database!');
  }
  
  // 5. Check all tables
  console.log('\n5. All Tables:');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  console.log('   Tables:', tables.map(t => t.name).join(', '));
  
  db.close();
  
  console.log('\n=== Diagnostic Complete ===');
  console.log('\nNext Steps:');
  console.log('1. Start the backend: cd backend && npm run develop');
  console.log('2. Go to http://localhost:1337/admin');
  console.log('3. Navigate to Settings > Users & Permissions > Roles > Public');
  console.log('4. Enable "find" and "findOne" for Wishlist');
  console.log('5. Navigate to Settings > Users & Permissions > Roles > Authenticated');
  console.log('6. Enable all actions (find, findOne, create, update, delete) for Wishlist');
  
} catch (error) {
  console.error('Error:', error.message);
  console.error('\nMake sure the backend database exists at:', dbPath);
}
