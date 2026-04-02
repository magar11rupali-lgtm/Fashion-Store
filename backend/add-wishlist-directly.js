const Database = require('better-sqlite3');

const db = new Database('.tmp/data.db');

console.log('=== Adding Wishlist Data Directly to Database ===\n');

try {
  // Get user
  const user = db.prepare('SELECT id, email FROM up_users LIMIT 1').get();
  console.log('User:', user);

  // Get products
  const products = db.prepare('SELECT id, document_id, name FROM products LIMIT 5').all();
  console.log(`\nProducts available: ${products.length}`);

  // Check current wishlist
  const currentWishlist = db.prepare('SELECT COUNT(*) as count FROM wishlists').get();
  console.log(`Current wishlist items: ${currentWishlist.count}\n`);

  // Add products to wishlist
  console.log('Adding products to wishlist...');
  
  const insertWishlistStmt = db.prepare(`
    INSERT INTO wishlists (document_id, added_at, created_at, updated_at, published_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertUserLinkStmt = db.prepare(`
    INSERT INTO wishlists_user_lnk (wishlist_id, user_id)
    VALUES (?, ?)
  `);

  const insertProductLinkStmt = db.prepare(`
    INSERT INTO wishlists_product_lnk (wishlist_id, product_id)
    VALUES (?, ?)
  `);

  const now = Date.now();

  for (const product of products) {
    try {
      // Generate a unique document_id (Strapi 5 format)
      const documentId = `wl${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      // Insert wishlist item
      const result = insertWishlistStmt.run(
        documentId,
        now,
        now,
        now,
        now
      );
      
      const wishlistId = result.lastInsertRowid;
      
      // Link to user
      insertUserLinkStmt.run(wishlistId, user.id);
      
      // Link to product
      insertProductLinkStmt.run(wishlistId, product.id);
      
      console.log(`✓ Added: ${product.name || 'Product ' + product.id} (Wishlist ID: ${wishlistId})`);
    } catch (err) {
      console.log(`  Skipped: ${product.name || 'Product ' + product.id} (${err.message})`);
    }
  }

  // Verify
  const finalCount = db.prepare('SELECT COUNT(*) as count FROM wishlists').get();
  console.log(`\n✅ Wishlist now has ${finalCount.count} items`);

  // Show the data
  const wishlistItems = db.prepare(`
    SELECT w.id, wu.user_id, wp.product_id, p.name as product_name
    FROM wishlists w
    LEFT JOIN wishlists_user_lnk wu ON w.id = wu.wishlist_id
    LEFT JOIN wishlists_product_lnk wp ON w.id = wp.wishlist_id
    LEFT JOIN products p ON wp.product_id = p.id
  `).all();

  console.log('\nWishlist items:');
  wishlistItems.forEach((item, index) => {
    console.log(`${index + 1}. ${item.product_name} (User: ${item.user_id}, Product: ${item.product_id})`);
  });

  console.log('\n✅ SUCCESS! Refresh the Strapi admin panel to see the data.');
  console.log('URL: http://localhost:1337/admin/content-manager/collection-types/api::wishlist.wishlist');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
} finally {
  db.close();
}
