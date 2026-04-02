const sqlite3 = require('./backend/node_modules/sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'backend', '.tmp', 'data.db');

console.log('=== Complete Wishlist Diagnostic ===\n');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  
  // First, list all tables
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%wishlist%' OR name LIKE '%product%' ORDER BY name", (err, tables) => {
    if (err) {
      console.error('Error listing tables:', err);
      return;
    }
    
    console.log('=== All Wishlist/Product Related Tables ===');
    tables.forEach(t => console.log(`  ${t.name}`));
    console.log();
  });
  
  // Get all users
  db.all("SELECT id, username, email FROM up_users ORDER BY id DESC LIMIT 5", (err, users) => {
    if (err) {
      console.error('Error querying users:', err);
      return;
    }
    
    console.log('=== Recent Users ===');
    users.forEach(u => console.log(`  User ${u.id}: ${u.username} (${u.email})`));
    
    // Get all wishlists
    db.all("SELECT * FROM wishlists ORDER BY id DESC", (err, wishlists) => {
      if (err) {
        console.error('Error querying wishlists:', err);
        return;
      }
      
      console.log('\n=== All Wishlists ===');
      console.log(`  Total: ${wishlists.length}`);
      wishlists.forEach(w => console.log(`  Wishlist ${w.id}: added_at=${new Date(w.added_at).toISOString()}`));
      
      // Get wishlist-user links
      db.all("SELECT * FROM wishlists_user_lnk ORDER BY id DESC", (err, userLinks) => {
        if (err) {
          console.error('Error querying user links:', err);
          return;
        }
        
        console.log('\n=== Wishlist-User Links ===');
        userLinks.forEach(l => console.log(`  Wishlist ${l.wishlist_id} → User ${l.user_id}`));
        
        // Get wishlist-product links
        db.all("SELECT * FROM wishlists_product_lnk ORDER BY id DESC", (err, productLinks) => {
          if (err) {
            console.error('Error querying product links:', err);
            return;
          }
          
          console.log('\n=== Wishlist-Product Links ===');
          productLinks.forEach(l => console.log(`  Wishlist ${l.wishlist_id} → Product ${l.product_id}`));
          
          // Get products
          db.all("SELECT id, name, price FROM products WHERE id IN (SELECT product_id FROM wishlists_product_lnk)", (err, products) => {
            if (err) {
              console.error('Error querying products:', err);
              return;
            }
            
            console.log('\n=== Products in Wishlists ===');
            products.forEach(p => console.log(`  Product ${p.id}: ${p.name} ($${p.price})`));
            
            // Summary
            console.log('\n=== Summary ===');
            console.log(`  Users: ${users.length}`);
            console.log(`  Wishlists: ${wishlists.length}`);
            console.log(`  User Links: ${userLinks.length}`);
            console.log(`  Product Links: ${productLinks.length}`);
            console.log(`  Products: ${products.length}`);
            
            if (wishlists.length > 0 && productLinks.length > 0) {
              console.log('\n✅ Database has wishlist data');
              console.log('   If API returns empty, the issue is in the query/controller');
            } else {
              console.log('\n⚠️  Database has no wishlist data');
              console.log('   Try adding items to wishlist from the frontend');
            }
            
            db.close();
          });
        });
      });
    });
  });
});
