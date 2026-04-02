const Database = require('better-sqlite3');

const db = new Database('.tmp/data.db', { readonly: true });

console.log('=== Strapi 5 Permissions Check ===\n');

// Get all tables with 'permission' in the name
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%permission%'").all();
console.log('Permission-related tables:');
tables.forEach(t => console.log(`   - ${t.name}`));

// Check up_permissions structure
console.log('\n=== up_permissions Table ===');
const permSchema = db.prepare("PRAGMA table_info(up_permissions)").all();
console.log('Columns:', permSchema.map(c => c.name).join(', '));

// Get all permissions
const allPerms = db.prepare('SELECT * FROM up_permissions LIMIT 10').all();
console.log('\nSample permissions:');
console.log(JSON.stringify(allPerms, null, 2));

// Check for wishlist permissions
const wishlistPerms = db.prepare("SELECT * FROM up_permissions WHERE action LIKE '%wishlist%'").all();
console.log(`\n=== Wishlist Permissions (${wishlistPerms.length} found) ===`);
if (wishlistPerms.length > 0) {
  console.log(JSON.stringify(wishlistPerms, null, 2));
} else {
  console.log('⚠️  No wishlist permissions configured!');
}

// Check link tables
const linkTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_links'").all();
console.log('\n=== Link Tables ===');
linkTables.forEach(t => console.log(`   - ${t.name}`));

// Check if there's a permissions-role link table
const permRoleLink = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%permission%role%'").all();
if (permRoleLink.length > 0) {
  console.log('\n=== Permission-Role Links ===');
  permRoleLink.forEach(t => {
    console.log(`Table: ${t.name}`);
    const data = db.prepare(`SELECT * FROM ${t.name} LIMIT 5`).all();
    console.log(JSON.stringify(data, null, 2));
  });
}

db.close();
