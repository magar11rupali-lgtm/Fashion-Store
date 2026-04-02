const Database = require('better-sqlite3');

const db = new Database('.tmp/data.db', { readonly: true });

console.log('=== Wishlist Table Schema ===\n');

const schema = db.prepare('PRAGMA table_info(wishlists)').all();
console.log('Columns:');
schema.forEach(c => console.log(`  - ${c.name} (${c.type})`));

// Check link tables
console.log('\n=== Checking for Link Tables ===');
const linkTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%wishlist%'").all();
linkTables.forEach(t => console.log(`  - ${t.name}`));

// Check if there's a user link table
const userLinkTable = linkTables.find(t => t.name.includes('user'));
if (userLinkTable) {
  console.log(`\nUser link table: ${userLinkTable.name}`);
  const linkSchema = db.prepare(`PRAGMA table_info(${userLinkTable.name})`).all();
  console.log('Columns:');
  linkSchema.forEach(c => console.log(`  - ${c.name} (${c.type})`));
}

db.close();
