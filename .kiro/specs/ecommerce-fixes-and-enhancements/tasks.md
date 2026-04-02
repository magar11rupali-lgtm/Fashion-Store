# Implementation Plan: E-Commerce Fixes and Enhancements

## Overview

This implementation plan addresses critical bugs and adds enhancements to the Next.js + Strapi e-commerce application. The work is organized into incremental steps that build upon each other, with testing integrated throughout. Each task includes specific requirements references for traceability.

The implementation follows this sequence:
1. Fix backend schema issues
2. Implement wishlist functionality
3. Fix checkout display and order persistence
4. Fix authentication flows
5. Add admin panel security
6. Create new pages
7. Implement UI/UX improvements
8. Final integration and testing

## Tasks

- [x] 1. Fix backend order schema
  - [x] 1.1 Rename "orde_status" to "order_status" in order schema
    - Update `backend/src/api/order/content-types/order/schema.json`
    - Change field name from "orde_status" to "order_status"
    - Fix enum format: change from single string to array of strings
    - Add "customer" field as JSON type
    - _Requirements: 5.1, 5.2_
  
  - [x] 1.2 Write unit tests for order schema validation
    - Test that only valid status values are accepted
    - Test that invalid status values are rejected
    - _Requirements: 5.2, 5.5_

- [x] 2. Create wishlist backend schema and API
  - [x] 2.1 Create wishlist content type in Strapi
    - Create `backend/src/api/wishlist/content-types/wishlist/schema.json`
    - Define schema with user relation, product relation, and addedAt timestamp
    - _Requirements: 1.1_
  
  - [x] 2.2 Configure wishlist API permissions
    - Allow authenticated users to create, read, update, delete their own wishlist items
    - _Requirements: 1.6_

- [x] 3. Implement wishlist frontend functionality
  - [x] 3.1 Create WishlistContext
    - Create `frontend/app/context/WishlistContext.js`
    - Implement state management with useState
    - Implement localStorage persistence for unauthenticated users
    - Implement backend API calls for authenticated users
    - Add addToWishlist, removeFromWishlist, moveToCart, clearWishlist functions
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, 1.7_
  
  - [x] 3.2 Write property test for wishlist addition
    - **Property 1: Wishlist addition**
    - **Validates: Requirements 1.2**
  
  - [x] 3.3 Write property test for wishlist removal
    - **Property 3: Wishlist removal**
    - **Validates: Requirements 1.4**
  
  - [x] 3.4 Write property test for wishlist to cart transfer
    - **Property 4: Wishlist to cart transfer**
    - **Validates: Requirements 1.5**
  
  - [x] 3.5 Create wishlist API helper functions
    - Create `frontend/lib/wishlist.js`
    - Implement fetchWishlist, addToWishlist, removeFromWishlist functions
    - Include JWT token in Authorization header
    - _Requirements: 1.6_
  
  - [x] 3.6 Implement wishlist merge on login
    - Update WishlistContext to merge localStorage and backend wishlist on authentication
    - Clear localStorage after successful merge
    - _Requirements: 1.8_
  
  - [x] 3.7 Write property test for wishlist merge
    - **Property 7: Wishlist merge on login**
    - **Validates: Requirements 1.8**

- [x] 4. Create wishlist UI components
  - [x] 4.1 Create WishlistButton component
    - Create `frontend/app/components/WishlistButton.jsx`
    - Add heart icon that toggles filled/unfilled based on wishlist state
    - Call addToWishlist/removeFromWishlist on click
    - Show notification on success
    - _Requirements: 1.2, 1.4_
  
  - [x] 4.2 Create WishlistDrawer component
    - Create `frontend/app/components/WishlistDrawer.jsx`
    - Display all wishlist items with images, names, prices, sizes
    - Add "Remove" button for each item
    - Add "Add to Cart" button with size selector
    - _Requirements: 1.3, 1.4, 1.5_
  
  - [x] 4.3 Write property test for wishlist display
    - **Property 2: Wishlist display completeness**
    - **Validates: Requirements 1.3**
  
  - [x] 4.4 Add wishlist icon to header
    - Update `frontend/app/components/Header.jsx`
    - Add wishlist icon with item count badge
    - Open WishlistDrawer on click
    - _Requirements: 1.3_

- [x] 5. Checkpoint - Test wishlist functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Fix checkout display issues
  - [x] 6.1 Enhance OrderSummary component
    - Update `frontend/app/components/OrderSummary.jsx`
    - Display product size for each cart item
    - Display individual unit price for each item
    - Display line total (price × quantity) for each item
    - Ensure product images are displayed with proper URL construction
    - Add placeholder image for missing images
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.1, 10.2, 10.3, 10.7_
  
  - [x] 6.2 Write property test for order summary display
    - **Property 8: Order summary display completeness**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 10.1**
  
  - [x] 6.3 Write property test for line total calculation
    - **Property 9: Line total calculation**
    - **Validates: Requirements 2.3**
  
  - [x] 6.4 Write property test for order totals calculation
    - **Property 10: Order totals calculation correctness**
    - **Validates: Requirements 2.6, 2.7, 2.8, 2.9, 2.10**
  
  - [x] 6.5 Write property test for image URL construction
    - **Property 50: Image URL construction**
    - **Validates: Requirements 10.2**

- [x] 7. Fix order persistence to backend
  - [x] 7.1 Update CartContext to properly extract product data
    - Update `frontend/app/context/CartContext.js`
    - Fix addToCart to properly extract price, name, and image from product attributes
    - Ensure all product data is correctly stored in cart items
    - _Requirements: 3.3_
  
  - [x] 7.2 Fix order creation API call
    - Update `frontend/lib/orders.js`
    - Ensure JWT token is included in Authorization header
    - Format order data to match backend schema
    - Include customer info in "customer" field as JSON
    - Set order_status to "pending"
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.9, 3.10_
  
  - [x] 7.3 Update checkout page to handle order creation
    - Update `frontend/app/checkout/page.js`
    - Ensure proper error handling for failed order creation
    - Display error messages to user
    - Clear cart and redirect on success
    - _Requirements: 3.7, 3.8_
  
  - [x] 7.4 Write property test for order persistence
    - **Property 11: Order persistence to backend**
    - **Validates: Requirements 3.1**
  
  - [x] 7.5 Write property test for order data completeness
    - **Property 13: Order data completeness**
    - **Validates: Requirements 3.3, 3.4, 3.5, 3.6**
  
  - [x] 7.6 Write property test for order number format
    - **Property 16: Order number format**
    - **Validates: Requirements 3.9**
  
  - [x] 7.7 Write property test for initial order status
    - **Property 17: Initial order status**
    - **Validates: Requirements 3.10, 5.3**

- [x] 8. Checkpoint - Test checkout and order creation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Fix authentication - signup
  - [x] 9.1 Fix signup page validation and error handling
    - Update `frontend/app/auth/signup/page.js`
    - Ensure email format validation works correctly
    - Ensure password length validation (min 6 characters)
    - Display specific error messages for validation failures
    - Handle duplicate email error from backend
    - Display loading state during submission
    - _Requirements: 4.1, 4.2, 4.9, 4.10_
  
  - [x] 9.2 Write property test for user account creation
    - **Property 18: User account creation**
    - **Validates: Requirements 4.1**
  
  - [x] 9.3 Write property test for duplicate email rejection
    - **Property 19: Duplicate email rejection**
    - **Validates: Requirements 4.2**
  
  - [x] 9.4 Write property test for email validation
    - **Property 24: Email format validation**
    - **Validates: Requirements 4.9**
  
  - [x] 9.5 Write property test for password validation
    - **Property 25: Password length validation**
    - **Validates: Requirements 4.10**

- [x] 10. Fix authentication - login
  - [x] 10.1 Fix login page error handling
    - Update `frontend/app/auth/signin/page.js`
    - Display error messages for invalid credentials
    - Display loading state during submission
    - Ensure JWT token is stored in session
    - _Requirements: 4.3, 4.4, 4.5_
  
  - [x] 10.2 Update NextAuth configuration
    - Update `frontend/app/api/auth/[...nextauth]/route.js`
    - Ensure JWT token is properly stored in session
    - Ensure token is accessible for API calls
    - _Requirements: 4.5, 4.7_
  
  - [x] 10.3 Write property test for successful login
    - **Property 20: Successful login session creation**
    - **Validates: Requirements 4.3, 4.5**
  
  - [x] 10.4 Write property test for invalid login
    - **Property 21: Invalid login error**
    - **Validates: Requirements 4.4**

- [x] 11. Fix authentication - protected routes
  - [x] 11.1 Ensure checkout requires authentication
    - Update `frontend/app/checkout/page.js`
    - Verify authentication check and redirect logic works correctly
    - _Requirements: 4.6_
  
  - [x] 11.2 Add logout functionality
    - Update header component to include logout button for authenticated users
    - Implement logout handler that clears session and redirects
    - _Requirements: 4.8_
  
  - [x] 11.3 Write property test for checkout authentication
    - **Property 22: Checkout authentication requirement**
    - **Validates: Requirements 4.6**
  
  - [x] 11.4 Write property test for logout behavior
    - **Property 23: Logout behavior**
    - **Validates: Requirements 4.8**

- [x] 12. Checkpoint - Test authentication flows
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement admin authentication
  - [x] 13.1 Create admin authentication helper
    - Create `frontend/lib/admin-auth.js`
    - Implement hardcoded credential check (username: "admin", password: "admin123secure")
    - Implement session storage for admin session
    - Add login, logout, and checkAuth functions
    - _Requirements: 8.3, 8.6_
  
  - [x] 13.2 Create admin login page
    - Create `frontend/app/auth/admin-login/page.js`
    - Create login form with username and password fields
    - Call admin authentication on submit
    - Display error message for invalid credentials
    - Redirect to /admin on success
    - _Requirements: 8.2, 8.3, 8.4, 8.5_
  
  - [x] 13.3 Protect admin dashboard
    - Update `frontend/app/admin/page.js`
    - Check admin authentication on mount
    - Redirect to admin login if not authenticated
    - Add logout button in header
    - _Requirements: 8.1, 8.2, 8.7, 8.8_
  
  - [x] 13.4 Write property test for admin authentication
    - **Property 36: Admin dashboard authentication**
    - **Validates: Requirements 8.1, 8.2**
  
  - [x] 13.5 Write property test for admin session isolation
    - **Property 39: Admin session isolation**
    - **Validates: Requirements 8.6**
  
  - [x] 13.6 Write property test for regular user admin access prevention
    - **Property 41: Regular user admin access prevention**
    - **Validates: Requirements 8.10**

- [x] 14. Create user profile page
  - [x] 14.1 Create profile page
    - Create `frontend/app/profile/page.js`
    - Fetch user data from backend
    - Display name, email, phone, and saved addresses
    - Add edit mode for updating profile information
    - Implement save functionality that updates backend
    - Require authentication
    - _Requirements: 7.5, 7.6, 7.7_
  
  - [x] 14.2 Write property test for profile display
    - **Property 32: Profile display completeness**
    - **Validates: Requirements 7.6**
  
  - [x] 14.3 Write property test for profile update
    - **Property 33: Profile update persistence**
    - **Validates: Requirements 7.7**

- [x] 15. Create order history page
  - [x] 15.1 Create order history page
    - Create `frontend/app/orders/page.js`
    - Fetch user's orders from backend using getUserOrders
    - Display list of orders with order number, date, total, status, item count
    - Make each order clickable to view details
    - Require authentication
    - _Requirements: 7.8, 7.9_
  
  - [x] 15.2 Create order detail view
    - Create `frontend/app/orders/[id]/page.js`
    - Fetch order details using getOrderById
    - Display all order items with images, names, sizes, quantities, prices
    - Display shipping address and tracking number
    - Display order status and totals
    - _Requirements: 7.10_
  
  - [x] 15.3 Write property test for order history display
    - **Property 34: Order history display completeness**
    - **Validates: Requirements 7.9**
  
  - [x] 15.4 Write property test for order detail display
    - **Property 35: Order detail display completeness**
    - **Validates: Requirements 7.10**

- [x] 16. Create informational pages
  - [x] 16.1 Create About page
    - Create `frontend/app/about/page.js`
    - Add store information, mission statement, and team info
    - Use consistent styling with rest of site
    - _Requirements: 7.1_
  
  - [x] 16.2 Create Contact page
    - Create `frontend/app/contact/page.js`
    - Add contact form with name, email, subject, message fields
    - Display store email, phone, and address
    - Implement form submission (email service or save to Strapi)
    - _Requirements: 7.2, 7.3_
  
  - [x] 16.3 Write property test for contact form submission
    - **Property 31: Contact form submission**
    - **Validates: Requirements 7.3**
  
  - [x] 16.4 Create FAQ page
    - Create `frontend/app/faq/page.js`
    - Add accordion-style Q&A sections
    - Include common questions about ordering, shipping, returns, payments
    - _Requirements: 7.4_
  
  - [x] 16.5 Create Privacy Policy page
    - Create `frontend/app/privacy/page.js`
    - Add privacy policy content covering data collection and usage
    - _Requirements: 7.11_
  
  - [x] 16.6 Create Terms of Service page
    - Create `frontend/app/terms/page.js`
    - Add terms and conditions content
    - _Requirements: 7.12_
  
  - [x] 16.7 Create Shipping & Returns page
    - Create `frontend/app/shipping/page.js`
    - Add shipping rates, delivery times, and return policy
    - _Requirements: 7.13_

- [x] 17. Checkpoint - Test new pages
  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. Implement notification system
  - [x] 18.1 Create notification context and hook
    - Create `frontend/hooks/useNotification.js`
    - Implement notification state management
    - Add showNotification and removeNotification functions
    - Support success, error, info, warning types
    - Auto-dismiss after configurable duration
    - _Requirements: 9.4, 9.5_
  
  - [x] 18.2 Create Notification component
    - Create `frontend/app/components/Notification.jsx`
    - Display toast-style notifications in top-right corner
    - Support stacking multiple notifications
    - Add smooth enter/exit animations
    - _Requirements: 9.4, 9.5_
  
  - [x] 18.3 Integrate notifications throughout app
    - Add notifications for add to cart success
    - Add notifications for add to wishlist success
    - Add notifications for form submission success/failure
    - Add notifications for authentication success/failure
    - _Requirements: 9.4, 9.5_
  
  - [x] 18.4 Write property test for add to cart notification
    - **Property 43: Add to cart notification**
    - **Validates: Requirements 9.4**
  
  - [x] 18.5 Write property test for add to wishlist notification
    - **Property 44: Add to wishlist notification**
    - **Validates: Requirements 9.5**

- [x] 19. Implement loading states
  - [x] 19.1 Create LoadingSpinner component
    - Create `frontend/app/components/LoadingSpinner.jsx`
    - Support full-page and inline variants
    - Use consistent styling
    - _Requirements: 6.9_
  
  - [x] 19.2 Add loading states to forms
    - Update all forms to show loading state during submission
    - Disable submit buttons during submission
    - _Requirements: 6.9, 9.9_
  
  - [x] 19.3 Add loading states to data fetching
    - Add loading indicators to pages that fetch data (profile, orders, products)
    - _Requirements: 6.9_
  
  - [x] 19.4 Write property test for loading indicators
    - **Property 28: Loading indicator display**
    - **Validates: Requirements 6.5, 6.9**
  
  - [x] 19.5 Write property test for submit button disable
    - **Property 46: Submit button disable during submission**
    - **Validates: Requirements 9.9**

- [x] 20. Implement enhanced header and navigation
  - [x] 20.1 Update header component
    - Update `frontend/app/components/Header.jsx`
    - Ensure logo, navigation menu, search, cart icon, wishlist icon, user account icon are present
    - Add cart item count badge
    - Add wishlist item count badge
    - Add user dropdown menu with profile, orders, logout links
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 20.2 Write property test for cart count badge
    - **Property 42: Cart count badge accuracy**
    - **Validates: Requirements 9.3**
  
  - [x] 20.3 Add breadcrumb navigation
    - Create breadcrumb component
    - Add to product and category pages
    - _Requirements: 9.6_
  
  - [x] 20.4 Update footer component
    - Update `frontend/app/components/Footer.jsx`
    - Add links to all new pages (About, Contact, FAQ, Privacy, Terms, Shipping)
    - Add social media links
    - Add newsletter signup form
    - _Requirements: 9.15_

- [x] 21. Implement search functionality
  - [x] 21.1 Create search component with autocomplete
    - Create `frontend/app/components/SearchBar.jsx`
    - Implement search input with autocomplete dropdown
    - Fetch product suggestions as user types
    - Navigate to search results page on submit
    - _Requirements: 9.10_
  
  - [x] 21.2 Create search results page
    - Create `frontend/app/search/page.js`
    - Display search results with filters and sorting
    - Show "No results found" message when appropriate
    - _Requirements: 9.11_
  
  - [x] 21.3 Write property test for search autocomplete
    - **Property 47: Search autocomplete**
    - **Validates: Requirements 9.10**
  
  - [x] 21.4 Write property test for empty search results
    - **Property 48: Empty search results message**
    - **Validates: Requirements 9.11**

- [x] 22. Implement form validation improvements
  - [x] 22.1 Add real-time validation to all forms
    - Update signup, login, checkout, contact, profile forms
    - Display inline error messages as user types
    - Clear errors when user corrects input
    - Add helpful placeholder text
    - _Requirements: 9.7, 9.8_
  
  - [x] 22.2 Write property test for real-time validation
    - **Property 45: Real-time form validation**
    - **Validates: Requirements 9.8**

- [x] 23. Add product enhancements
  - [x] 23.1 Add product availability display
    - Update product components to show availability status
    - Display "In Stock", "Out of Stock", or "Low Stock" based on inventory
    - _Requirements: 9.13_
  
  - [x] 23.2 Write property test for availability display
    - **Property 49: Product availability display**
    - **Validates: Requirements 9.13**
  
  - [x] 23.3 Add filter and sort options to product listing
    - Update product listing pages with filter sidebar
    - Add sort dropdown (price, name, newest)
    - _Requirements: 9.12_
  
  - [x] 23.4 Add "Back to Top" button
    - Create BackToTop component
    - Show on long pages when user scrolls down
    - Smooth scroll to top on click
    - _Requirements: 9.14_

- [x] 24. Implement responsive design improvements
  - [x] 24.1 Test and fix mobile layout
    - Test all pages on mobile viewport (320-767px)
    - Fix any layout issues
    - Ensure touch targets are appropriately sized
    - _Requirements: 6.10_
  
  - [x] 24.2 Test and fix tablet layout
    - Test all pages on tablet viewport (768-1023px)
    - Fix any layout issues
    - _Requirements: 6.10_
  
  - [x] 24.3 Write property test for responsive layout
    - **Property 30: Responsive layout**
    - **Validates: Requirements 6.10**

- [x] 25. Implement error handling improvements
  - [x] 25.1 Add error boundary component
    - Create error boundary to catch React errors
    - Display fallback UI when errors occur
    - Log errors for debugging
    - _Requirements: 6.6_
  
  - [x] 25.2 Standardize error messages
    - Create consistent error message format
    - Ensure all API errors display user-friendly messages
    - _Requirements: 6.6_
  
  - [x] 25.3 Write property test for error message display
    - **Property 29: Error message display**
    - **Validates: Requirements 6.6**

- [x] 26. Final integration and testing
  - [x] 26.1 Test complete user flows
    - Test signup → login → browse → add to wishlist → add to cart → checkout flow
    - Test admin login → view orders → manage products flow
    - Test profile update flow
    - Test order history flow
  
  - [x] 26.2 Fix any integration issues
    - Address any bugs found during integration testing
    - Ensure all components work together correctly
  
  - [x] 26.3 Verify all requirements are met
    - Review requirements document
    - Verify each requirement has been implemented
    - Test acceptance criteria

- [x] 27. Final checkpoint - Complete testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- The implementation builds incrementally: backend fixes → wishlist → checkout → auth → admin → pages → UI/UX
- All API calls must include proper authentication tokens
- All forms must have proper validation and error handling
- All images must have fallback placeholders
- All async operations must show loading states
