# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Complete Product Data After Refresh
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to authenticated users refreshing the page with wishlist items
  - Test that fetchWishlist() returns complete product data with non-null image URLs, correct product names, accurate prices, and available sizes
  - The test assertions should match the Expected Behavior Properties from design:
    - `result.data[i].image !== ""`
    - `result.data[i].name !== "Unknown Product"`
    - `result.data[i].price !== 0`
    - `result.data[i].image.startsWith("http") OR result.data[i].image.startsWith("/")`
  - Run test on UNFIXED code with current populate query `populate[product][populate]=*`
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found: API response shows `product.data.attributes.image.data` is null or undefined
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Wishlist Operations
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (adding items, removing items, localStorage operations)
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - Adding new products to wishlist saves items with complete product information
    - Removing products from wishlist works correctly
    - Unauthenticated users use localStorage with all product details intact
    - Merging localStorage wishlist with backend wishlist on login works
    - Error handling and fallback to localStorage functions correctly
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix for wishlist refresh display bug

  - [x] 3.1 Implement the fix in frontend/lib/wishlist.js
    - Update the populate query parameter in fetchWishlist() function
    - Change from: `${API_URL}/wishlists?populate[product][populate]=*`
    - Change to: `${API_URL}/wishlists?populate[product][populate][0]=image`
    - This explicitly tells Strapi to populate the image relation within the product relation
    - No changes to normalization logic required (defensive fallbacks remain intact)
    - No backend changes required (backend controller already uses correct populate syntax)
    - _Bug_Condition: isBugCondition(input) where input.userAuthenticated = true AND input.pageAction = "refresh" AND backendReturnsIncompleteProductData()_
    - _Expected_Behavior: For all authenticated users who refresh the page, fetchWishlist SHALL return wishlist items with fully populated product data including non-null image URLs, correct product names, accurate prices, and available sizes_
    - _Preservation: All wishlist operations that do NOT involve fetching existing data after page refresh (adding items, removing items, localStorage operations, unauthenticated user operations) SHALL produce exactly the same behavior as the original code_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Complete Product Data After Refresh
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify that wishlist items display with complete product information including image URL, name, price, and sizes after page refresh
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Wishlist Operations
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions in adding items, removing items, localStorage operations, unauthenticated user operations)

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
