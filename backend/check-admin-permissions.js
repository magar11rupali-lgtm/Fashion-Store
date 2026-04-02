const Database = require('better-sqlite3');

const db = new Database('.tmp/data.db', { readonly: true });

console.log('=== Admin Panel Permissions Check ===\n');

// Check admin permissions for wishlist
const adminPerms = db.prepare(`
  SELECT p.action, p.subject, p.properties, p.conditions
  FROM admin_permissions p
  WHERE p.action LIKE '%wishlist%' OR p.subject LIKE '%wishlist%'
`).all();

console.log(`Admin wishlist permissions: ${adminPerms.length}`);
if (adminPerms.length > 0) {
  console.log(JSON.stringify(adminPerms, null, 2));
} else {
  console.log('⚠️  No admin permissions found for wishlist!');
  console.log('\nThis means the admin role needs permissions to view wishlist content.');
}

// Check admin roles
console.log('\n=== Admin Roles ===');
const adminRoles = db.prepare('SELECT * FROM admin_roles').all();
adminRoles.forEach(r => console.log(`  - ${r.name} (ID: ${r.id})`));

// Check all admin permissions
console.log('\n=== Sample Admin Permissions ===');
const samplePerms = db.prepare('SELECT action, subject FROM admin_permissions LIMIT 10').all();
samplePerms.forEach(p => console.log(`  - ${p.action} on ${p.subject}`));

db.close();

console.log('\n=== Solution ===');
console.log('The Strapi admin panel needs permissions to view wishlist content.');
console.log('\nTo fix:');
console.log('1. Go to: http://localhost:1337/admin');
console.log('2. Navigate to: Settings > Administration Panel > Roles');
console.log('3. Click on your admin role (usually "Super Admin" or "Editor")');
console.log('4. Find "Wishlist" in the permissions list');
console.log('5. Enable: Read, Create, Update, Delete permissions');
console.log('6. Save');
console.log('7. Refresh the Wishlist content manager page');
