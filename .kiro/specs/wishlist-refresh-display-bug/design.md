# Wishlist Refresh Display Bug - Bugfix Design

## Overview

This design addresses a critical bug where wishlist product details (image, price, name, sizes) disappear after page refresh for authenticated users. The root cause is that the backend API's populate query is not correctly structured to fetch nested product relations with their image data. The current query `populate[product][populate]=*` doesn't properly populate the image relation within the product, resulting in null or incomplete product data being returned to the frontend.

The fix involves correcting the populate query structure in the frontend API call to explicitly specify the image relation, ensuring the backend returns complete product data with all nested attributes. This is a minimal, targeted fix that addresses the root cause without modifying backend logic or frontend normalization code.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when an authenticated user refreshes the page and the backend returns wishlist items with null or incomplete product.image data
- **Property (P)**: The desired behavior - wishlist items should display with complete product information including image URL, name, price, and sizes
- **Preservation**: Existing wishlist functionality that must remain unchanged - adding items, removing items, localStorage fallback, and unauthenticated user behavior
- **fetchWishlist()**: The function in `frontend/lib/wishlist.js` that fetches wishlist data from the Strapi backend API
- **Populate Query**: The Strapi query parameter that specifies which relations to load - currently `populate[product][populate]=*` which doesn't properly fetch nested image relations
- **Normalization Logic**: The code in `fetchWishlist()` that transforms the nested Strapi response structure into a flat wishlist item format

## Bug Details

### Bug Condition

The bug manifests when an authenticated user refreshes the page and the backend API returns wishlist items where the product relation exists but the nested image data is null or incomplete. The `fetchWishlist()` function uses an incorrect populate query parameter that doesn't properly instruct Strapi to load the image relation within the product.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { userAuthenticated: boolean, pageAction: string }
  OUTPUT: boolean
  
  RETURN input.userAuthenticated = true
         AND input.pageAction = "refresh"
         AND backendReturnsIncompleteProductData()
         AND productImageDataIsNull()
END FUNCTION
```

### Examples

- **Example 1**: User adds "Classic White Sneakers" to wishlist, sees complete product details (image, $89.99, name, sizes). User refreshes page. Wishlist shows "Unknown Product", $0, empty image, default sizes.

- **Example 2**: User has 3 items in wishlist before refresh. After refresh, all 3 items display with "Unknown Product" and missing images, even though the wishlist count shows 3 items.

- **Example 3**: User adds item to wishlist, logs out, logs back in. Wishlist items display correctly. User refreshes page. Product details disappear.

- **Edge Case**: Unauthenticated user adds items to wishlist (localStorage), refreshes page. Items display correctly with all details (expected behavior - no bug).

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Adding new products to the wishlist must continue to save items with complete product information
- Removing products from the wishlist must continue to work correctly
- Unauthenticated users must continue to use localStorage with all product details intact
- Merging localStorage wishlist with backend wishlist on login must continue to work
- Error handling and fallback to localStorage must continue to function

**Scope:**
All wishlist operations that do NOT involve fetching existing wishlist data from the backend after page refresh should be completely unaffected by this fix. This includes:
- Adding items to wishlist (both authenticated and unauthenticated)
- Removing items from wishlist
- Moving items from wishlist to cart
- Clearing the entire wishlist
- Checking if a product is in the wishlist

## Hypothesized Root Cause

Based on the bug description and code analysis, the most likely issue is:

1. **Incorrect Populate Query Structure**: The current query `populate[product][populate]=*` is not the correct Strapi v4/v5 syntax for populating nested relations
   - Strapi requires explicit relation names in nested populate queries
   - The wildcard `*` at the nested level doesn't properly populate the image relation
   - The correct syntax should be `populate[product][populate][0]=image` or `populate=product.image`

2. **Backend Returns Incomplete Data**: When the populate query is incorrect, Strapi returns the product relation but with null image data
   - The product object exists with id and basic attributes
   - The image relation is not populated, resulting in null or undefined image data
   - The frontend normalization logic receives incomplete data and falls back to defaults

3. **Frontend Normalization Fallback**: The normalization logic correctly handles missing data by using fallback values
   - This is actually correct defensive programming
   - The issue is that it's receiving incomplete data when it should receive complete data
   - The fix should ensure complete data is returned, not modify the fallback logic

## Correctness Properties

Property 1: Bug Condition - Complete Product Data After Refresh

_For any_ authenticated user who refreshes the page with wishlist items in the backend, the fixed fetchWishlist function SHALL return wishlist items with fully populated product data including non-null image URLs, correct product names, accurate prices, and available sizes.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Preservation - Existing Wishlist Operations

_For any_ wishlist operation that is NOT fetching existing data after page refresh (adding items, removing items, localStorage operations, unauthenticated user operations), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `frontend/lib/wishlist.js`

**Function**: `fetchWishlist()`

**Specific Changes**:
1. **Update Populate Query Parameter**: Change the fetch URL from:
   ```javascript
   `${API_URL}/wishlists?populate[product][populate]=*`
   ```
   to:
   ```javascript
   `${API_URL}/wishlists?populate[product][populate][0]=image`
   ```
   This explicitly tells Strapi to populate the image relation within the product relation.

2. **Alternative Syntax (if needed)**: If the above doesn't work, try the dot notation:
   ```javascript
   `${API_URL}/wishlists?populate=product.image`
   ```

3. **No Changes to Normalization Logic**: The existing normalization code that extracts image URLs from various Strapi response formats should continue to work correctly once the backend returns complete data.

4. **No Backend Changes Required**: The backend controller already uses the correct populate syntax in its entityService query. The issue is purely in the frontend API call.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code by observing the API response structure, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis by examining the actual API response structure.

**Test Plan**: Write a diagnostic script that makes the current API call with the existing populate query and logs the complete response structure. Run this on the UNFIXED code to observe what data is actually being returned and confirm that product.image data is null or incomplete.

**Test Cases**:
1. **Current API Response Test**: Call the API with `populate[product][populate]=*` and log the response (will show incomplete image data on unfixed code)
2. **Product Data Structure Test**: Examine whether product.data exists and has attributes (will show product exists but image is null)
3. **Image Relation Test**: Check if product.attributes.image.data exists (will be null or undefined on unfixed code)
4. **Compare with Backend Query**: Verify that the backend controller uses correct populate syntax (will confirm frontend query is the issue)

**Expected Counterexamples**:
- API response shows `product.data.attributes.image.data` is null or undefined
- Product name, price exist but image relation is not populated
- Possible causes: incorrect populate query syntax, Strapi not recognizing the nested wildcard

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (authenticated user refreshing page), the fixed function produces the expected behavior (complete product data with images).

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := fetchWishlist_fixed(userToken)
  ASSERT result.data[i].image !== ""
  ASSERT result.data[i].name !== "Unknown Product"
  ASSERT result.data[i].price !== 0
  ASSERT result.data[i].image.startsWith("http") OR result.data[i].image.startsWith("/")
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (adding items, removing items, unauthenticated users), the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT wishlistOperation_original(input) = wishlistOperation_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across different wishlist operations
- It catches edge cases like empty wishlists, multiple items, concurrent operations
- It provides strong guarantees that behavior is unchanged for all non-refresh scenarios

**Test Plan**: Observe behavior on UNFIXED code first for adding/removing items and localStorage operations, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Add Item Preservation**: Verify adding items to wishlist continues to work with complete product data
2. **Remove Item Preservation**: Verify removing items from wishlist continues to work correctly
3. **LocalStorage Preservation**: Verify unauthenticated users' wishlist in localStorage continues to work
4. **Merge Preservation**: Verify merging localStorage with backend on login continues to work

### Unit Tests

- Test fetchWishlist with corrected populate query returns complete product data
- Test that image URLs are properly extracted from the response
- Test that product names, prices, and sizes are correctly populated
- Test error handling when API call fails (should fall back to localStorage)

### Property-Based Tests

- Generate random wishlist states and verify refresh always loads complete product data
- Generate random product configurations and verify all attributes are preserved after refresh
- Test that adding/removing items works correctly across many scenarios
- Test localStorage and backend synchronization across various user authentication states

### Integration Tests

- Test full user flow: add items, refresh page, verify items display correctly
- Test authentication flow: add items while unauthenticated, sign in, refresh, verify merge works
- Test that wishlist drawer displays correct product information after refresh
- Test that moving items from wishlist to cart works after refresh
