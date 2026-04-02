# Wishlist Persistence Fix

## Problem
When saving items to the wishlist in the frontend, the price, image, and product name were visible. However, after navigating to the backend and returning to the frontend, these details would disappear from the wishlist.

## Root Cause
The issue was in the data normalization logic in `frontend/lib/wishlist.js`. The `fetchWishlist` function was returning a nested structure:

```javascript
{
  id: 1,
  product: {
    id: 5,
    name: "Product Name",
    price: 29.99,
    image: "/uploads/image.png"
  }
}
```

However, the `WishlistDrawer` component and `WishlistContext` expected a flat structure:

```javascript
{
  id: 1,
  productId: 5,
  name: "Product Name",
  price: 29.99,
  image: "/uploads/image.png",
  availableSizes: ['S', 'M', 'L', 'XL'],
  addedAt: "2026-03-03T..."
}
```

## Solution
Fixed the normalization in `frontend/lib/wishlist.js` to flatten the product data directly onto the wishlist item object, matching the expected structure throughout the application.

### Changes Made

1. **frontend/lib/wishlist.js** - Updated `fetchWishlist()` function:
   - Changed the normalized structure to flatten product data
   - Added `productId`, `name`, `price`, `image`, `availableSizes`, and `addedAt` directly on the item
   - Removed the nested `product` object

2. **frontend/app/context/WishlistContext.js** - Simplified `loadWishlist()` function:
   - Removed complex data transformation logic
   - Now directly uses the normalized data from `wishlist.js`
   - Updated `addToWishlist()` to properly extract image URLs from backend response

## Testing
To verify the fix:

1. Sign in to your account
2. Add products to your wishlist
3. Verify that name, price, and image are visible
4. Navigate to the backend admin panel (http://localhost:1337/admin)
5. Return to the frontend
6. Open the wishlist drawer
7. Confirm that all product details (name, price, image) are still visible

## Technical Details
The fix ensures consistency between:
- Data structure returned from backend API
- Data structure stored in localStorage (for unauthenticated users)
- Data structure expected by UI components

All three now use the same flat structure with product details directly accessible on the wishlist item object.
