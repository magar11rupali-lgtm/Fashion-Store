const sqlite3 = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', '.tmp', 'data.db');
const db = sqlite3(dbPath);

console.log('=== Checking Wishlist Data ===\n');

// Check wishlists table
console.log('1. Wishlists table:');
const wishlists = db.prepare('SELECT * FROM wishlists').all();
console.log(`Found ${wishlists.length} wishlist entries`);
if (wishlists.length > 0) {
  console.log(JSON.stringify(wishlists, null, 2));
}

// Check wishlists_user_lnk table
console.log('\n2. Wishlists-User links:');
const userLinks = db.prepare('SELECT * FROM wishlists_user_lnk').all();
console.log(`Found ${userLinks.length} user links`);
if (userLinks.length > 0) {
  console.log(JSON.stringify(userLinks, null, 2));
}

// Check wishlists_product_lnk table
console.log('\n3. Wishlists-Product links:');
const productLinks = db.prepare('SELECT * FROM wishlists_product_lnk').all();
console.log(`Found ${productLinks.length} product links`);
if (productLinks.length > 0) {
  console.log(JSON.stringify(productLinks, null, 2));
}

// Check users
console.log('\n4. Users:');
const users = db.prepare('SELECT id, username, email FROM up_users').all();
console.log(`Found ${users.length} users`);
console.log(JSON.stringify(users, null, 2));

// Check products
console.log('\n5. Products:');
const products = db.prepare('SELECT id, document_id, name FROM products LIMIT 5').all();
console.log(`Found ${products.length} products (showing first 5)`);
console.log(JSON.stringify(products, null, 2));

db.close();
