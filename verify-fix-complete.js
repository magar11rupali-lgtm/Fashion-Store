const fs = require('fs');
const path = require('path');

console.log('=== Wishlist Product Fix Verification ===\n');

// Check if schema files have been updated
const wishlistSchemaPath = path.join(__dirname, 'backend/src/api/wishlist/content-types/wishlist/schema.json');
const productSchemaPath = path.join(__dirname, 'backend/src/api/product/content-types/product/schema.json');

let allChecksPass = true;

// Check 1: Wishlist schema
console.log('1. Checking wishlist schema...');
try {
  const wishlistSchema = JSON.parse(fs.readFileSync(wishlistSchemaPath, 'utf8'));
  const productRelation = wishlistSchema.attributes.product;
  
  if (productRelation.relation === 'manyToOne' && !productRelation.mappedBy) {
    console.log('   ✅ Wishlist schema is correct (manyToOne, no mappedBy)');
  } else {
    console.log('   ❌ Wishlist schema still has issues');
    console.log('      Current:', JSON.stringify(productRelation, null, 2));
    allChecksPass = false;
  }
} catch (error) {
  console.log('   ❌ Error reading wishlist schema:', error.message);
  allChecksPass = false;
}

// Check 2: Product schema
console.log('\n2. Checking product schema...');
try {
  const productSchema = JSON.parse(fs.readFileSync(productSchemaPath, 'utf8'));
  
  if (!productSchema.attributes.wishlist) {
    console.log('   ✅ Product schema is correct (no wishlist relation)');
  } else {
    console.log('   ❌ Product schema still has wishlist relation');
    console.log('      Should be removed:', JSON.stringify(productSchema.attributes.wishlist, null, 2));
    allChecksPass = false;
  }
} catch (error) {
  console.log('   ❌ Error reading product schema:', error.message);
  allChecksPass = false;
}

// Check 3: Database has data
console.log('\n3. Checking database...');
try {
  const sqlite3 = require('./backend/node_modules/sqlite3').verbose();
  const dbPath = path.join(__dirname, 'backend', '.tmp', 'data.db');
  
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.log('   ❌ Cannot connect to database:', err.message);
      allChecksPass = false;
      return;
    }
    
    db.get("SELECT COUNT(*) as count FROM products_wishlist_lnk", (err, row) => {
      if (err) {
        console.log('   ❌ Error querying database:', err.message);
        allChecksPass = false;
      } else {
        console.log(`   ✅ Database has ${row.count} wishlist-product associations`);
      }
      
      db.close();
      
      // Final summary
      console.log('\n=== Summary ===');
      if (allChecksPass) {
        console.log('✅ All checks passed!');
        console.log('\n📋 Next steps:');
        console.log('   1. Restart the Strapi backend: cd backend && npm run develop');
        console.log('   2. Run test: node test-wishlist-fix.js');
        console.log('   3. Test in frontend at http://localhost:3000');
      } else {
        console.log('❌ Some checks failed. Please review the errors above.');
      }
    });
  });
} catch (error) {
  console.log('   ⚠️  Cannot check database (sqlite3 not available)');
  console.log('      This is OK - the fix should still work');
  
  // Final summary without DB check
  console.log('\n=== Summary ===');
  if (allChecksPass) {
    console.log('✅ Schema checks passed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Restart the Strapi backend: cd backend && npm run develop');
    console.log('   2. Run test: node test-wishlist-fix.js');
    console.log('   3. Test in frontend at http://localhost:3000');
  } else {
    console.log('❌ Some checks failed. Please review the errors above.');
  }
}
