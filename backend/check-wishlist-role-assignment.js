const Database = require('better-sqlite3');

const db = new Database('.tmp/data.db', { readonly: true });

console.log('=== Wishlist Permission Role Assignment ===\n');

// Get roles
const roles = db.prepare('SELECT * FROM up_roles').all();
console.log('Available Roles:');
roles.forEach(r => console.log(`   - ${r.name} (ID: ${r.id}, type: ${r.type})`));

// Get wishlist permissions
const wishlistPerms = db.prepare("SELECT * FROM up_permissions WHERE action LIKE '%wishlist%'").all();
console.log(`\nWishlist Permissions (${wishlistPerms.length}):`);

// For each wishlist permission, check which role it's assigned to
wishlistPerms.forEach(perm => {
  const roleLinks = db.prepare('SELECT role_id FROM up_permissions_role_lnk WHERE permission_id = ?').all(perm.id);
  
  console.log(`\n   ${perm.action}:`);
  if (roleLinks.length > 0) {
    roleLinks.forEach(link => {
      const role = roles.find(r => r.id === link.role_id);
      console.log(`      ✓ Assigned to: ${role?.name || 'Unknown'} (ID: ${link.role_id})`);
    });
  } else {
    console.log(`      ⚠️  NOT assigned to any role!`);
  }
});

// Summary
console.log('\n=== Summary ===');
const authenticatedRole = roles.find(r => r.type === 'authenticated');
const publicRole = roles.find(r => r.type === 'public');

console.log(`Authenticated Role ID: ${authenticatedRole?.id}`);
console.log(`Public Role ID: ${publicRole?.id}`);

// Check which wishlist permissions are assigned to authenticated role
const authWishlistPerms = db.prepare(`
  SELECT p.action 
  FROM up_permissions p
  JOIN up_permissions_role_lnk l ON p.id = l.permission_id
  WHERE l.role_id = ? AND p.action LIKE '%wishlist%'
`).all(authenticatedRole?.id);

console.log(`\nAuthenticated role has ${authWishlistPerms.length} wishlist permissions:`);
authWishlistPerms.forEach(p => console.log(`   - ${p.action}`));

db.close();
