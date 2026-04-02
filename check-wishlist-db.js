const sqlite3 = require('./backend/node_modules/sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'backend', '.tmp', 'data.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to database');
});

// List all tables
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%wishlist%'", (err, tables) => {
  if (err) {
    console.error('Error listing tables:', err);
    return;
  }
  console.log('\n=== Wishlist-related Tables ===');
  console.log(tables);
  
  // Check products_wishlist_lnk table
  db.all("PRAGMA table_info(products_wishlist_lnk)", (err, columns) => {
    if (err) {
      console.error('Error getting products_wishlist_lnk structure:', err);
      return;
    }
    console.log('\n=== products_wishlist_lnk Table Structure ===');
    console.log(columns);
    
    db.all("SELECT * FROM products_wishlist_lnk ORDER BY id DESC LIMIT 10", (err, linkRows) => {
      if (err) {
        console.error('Error querying products_wishlist_lnk:', err);
        return;
      }
      console.log('\n=== Recent products_wishlist_lnk Entries ===');
      console.log(JSON.stringify(linkRows, null, 2));
      
      // Check wishlists_user_lnk table
      db.all("SELECT * FROM wishlists_user_lnk ORDER BY id DESC LIMIT 10", (err, userLinkRows) => {
        if (err) {
          console.error('Error querying wishlists_user_lnk:', err);
          return;
        }
        console.log('\n=== Recent wishlists_user_lnk Entries ===');
        console.log(JSON.stringify(userLinkRows, null, 2));
        
        // Check wishlist entries
        db.all("SELECT * FROM wishlists ORDER BY id DESC LIMIT 5", (err, wishlistRows) => {
          if (err) {
            console.error('Error querying wishlists:', err);
            return;
          }
          console.log('\n=== Recent wishlists Entries ===');
          console.log(JSON.stringify(wishlistRows, null, 2));
          
          db.close();
        });
      });
    });
  });
});
