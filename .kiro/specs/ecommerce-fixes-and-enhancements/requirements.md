# Requirements Document

## Introduction

This document specifies the requirements for fixing critical bugs and enhancing the Next.js + Strapi e-commerce application. The system currently has several critical issues preventing core functionality from working properly, including non-functional wishlist features, incomplete checkout displays, order persistence failures, and authentication problems. Additionally, the application requires UI/UX improvements, new pages for enhanced functionality, and a secure admin panel.

## Glossary

- **System**: The complete e-commerce application including frontend (Next.js) and backend (Strapi)
- **Frontend**: The Next.js 16.1.1 application running on http://localhost:3000
- **Backend**: The Strapi 5.33.1 CMS with SQLite database running on http://localhost:1337
- **Cart**: The shopping cart containing items the user intends to purchase
- **Wishlist**: A saved list of products the user is interested in but not ready to purchase
- **Order**: A completed purchase transaction with customer and payment information
- **User**: An authenticated customer who can browse, purchase, and track orders
- **Guest**: An unauthenticated visitor who can browse products but cannot checkout
- **Admin**: A privileged user with access to the admin dashboard for managing orders and products
- **Checkout_Page**: The page where users review their cart and enter shipping/payment information
- **Order_Summary**: The component displaying cart items, prices, and totals during checkout
- **Authentication_System**: NextAuth-based system for user login, registration, and session management
- **Cart_Context**: React context managing cart state and operations
- **Product**: An item available for purchase with attributes like name, price, size, and image

## Requirements

### Requirement 1: Wishlist Functionality

**User Story:** As a user, I want to save products to a wishlist, so that I can review and purchase them later without adding them to my cart immediately.

#### Acceptance Criteria

1. THE System SHALL provide a wishlist feature separate from the shopping cart
2. WHEN a user clicks the wishlist button on a product, THE System SHALL add the product to the user's wishlist
3. WHEN a user views their wishlist, THE System SHALL display all saved products with images, names, prices, and available sizes
4. WHEN a user clicks remove on a wishlist item, THE System SHALL remove that product from the wishlist
5. WHEN a user clicks "Add to Cart" from the wishlist, THE System SHALL move the product to the cart with the selected size
6. WHEN a user is authenticated, THE System SHALL persist the wishlist to the Backend
7. WHEN a user is not authenticated, THE System SHALL store the wishlist in localStorage
8. WHEN an authenticated user logs in, THE System SHALL merge their localStorage wishlist with their Backend wishlist

### Requirement 2: Complete Checkout Display

**User Story:** As a user, I want to see complete product information in the checkout page, so that I can verify my order details before completing the purchase.

#### Acceptance Criteria

1. WHEN a user views the Order_Summary, THE System SHALL display the product size for each cart item
2. WHEN a user views the Order_Summary, THE System SHALL display the individual unit price for each product
3. WHEN a user views the Order_Summary, THE System SHALL display the line total (unit price × quantity) for each product
4. WHEN a user views the Order_Summary, THE System SHALL display product images for all cart items
5. WHEN product images fail to load, THE System SHALL display a placeholder image
6. WHEN a user views the Order_Summary, THE System SHALL display the subtotal, shipping cost, tax amount, and grand total
7. THE System SHALL calculate the subtotal as the sum of all line totals
8. THE System SHALL calculate shipping as $10 for orders under $100 and free for orders $100 or more
9. THE System SHALL calculate tax as 10% of the subtotal
10. THE System SHALL calculate the grand total as subtotal + shipping + tax

### Requirement 3: Order Persistence to Backend

**User Story:** As a user, I want my orders to be saved to the database, so that I can view my order history and track my purchases across sessions.

#### Acceptance Criteria

1. WHEN a user completes checkout, THE System SHALL save the order to the Backend database
2. WHEN saving an order, THE System SHALL include the user's authentication token in the API request
3. WHEN saving an order, THE System SHALL include all cart items with product ID, name, price, size, quantity, and image URL
4. WHEN saving an order, THE System SHALL include customer information (name, email, phone, address, city, postal code, country)
5. WHEN saving an order, THE System SHALL include calculated totals (subtotal, shipping, tax, grand total)
6. WHEN saving an order, THE System SHALL include payment method and order timestamp
7. WHEN an order save fails, THE System SHALL display an error message to the user
8. WHEN an order save succeeds, THE System SHALL clear the cart and redirect to the order confirmation page
9. THE System SHALL generate a unique order number in the format "ORD-{timestamp}-{random}"
10. THE System SHALL set the initial order status to "pending"

### Requirement 4: Authentication System Fixes

**User Story:** As a user, I want to sign up and log in successfully, so that I can access checkout, save my information, and track my orders.

#### Acceptance Criteria

1. WHEN a user submits the signup form with valid credentials, THE System SHALL create a new user account in the Backend
2. WHEN a user submits the signup form with an existing email, THE System SHALL display an error message
3. WHEN a user submits the login form with valid credentials, THE System SHALL authenticate the user and create a session
4. WHEN a user submits the login form with invalid credentials, THE System SHALL display an error message
5. WHEN a user successfully logs in, THE System SHALL store the JWT token in the session
6. WHEN a user accesses the Checkout_Page without authentication, THE System SHALL redirect to the sign-in page
7. WHEN an authenticated user makes API requests, THE System SHALL include the JWT token in the Authorization header
8. WHEN a user logs out, THE System SHALL clear the session and redirect to the home page
9. THE System SHALL validate email format during signup
10. THE System SHALL require passwords to be at least 6 characters during signup

### Requirement 5: Backend Order Schema Correction

**User Story:** As a developer, I want the order schema to have correct field names, so that order status can be properly stored and queried.

#### Acceptance Criteria

1. THE Backend SHALL rename the "orde_status" field to "order_status" in the order schema
2. THE Backend SHALL support order status values: "pending", "processing", "shipped", "delivered", "cancelled"
3. WHEN an order is created, THE System SHALL set the order_status to "pending"
4. THE Backend SHALL allow querying orders by order_status
5. THE Backend SHALL validate that order_status contains only allowed enumeration values

### Requirement 6: UI/UX Improvements

**User Story:** As a user, I want an appealing and modern interface, so that I have an enjoyable shopping experience.

#### Acceptance Criteria

1. THE System SHALL use a consistent color scheme across all pages
2. THE System SHALL display product images with consistent aspect ratios and proper sizing
3. THE System SHALL provide smooth transitions and hover effects on interactive elements
4. THE System SHALL use readable typography with appropriate font sizes and line heights
5. THE System SHALL provide visual feedback for user actions (button clicks, form submissions, loading states)
6. THE System SHALL display error messages in a clear and user-friendly manner
7. THE System SHALL use whitespace effectively to create visual hierarchy
8. THE System SHALL ensure all buttons and links have clear labels and purposes
9. THE System SHALL display loading indicators during asynchronous operations
10. THE System SHALL be responsive and functional on mobile, tablet, and desktop screen sizes

### Requirement 7: Additional Pages

**User Story:** As a user, I want access to additional informational and functional pages, so that I can learn more about the store and manage my account.

#### Acceptance Criteria

1. THE System SHALL provide an About page with store information and mission statement
2. THE System SHALL provide a Contact page with contact form, email, phone, and address
3. WHEN a user submits the contact form, THE System SHALL send the message to the store email
4. THE System SHALL provide an FAQ page with common questions and answers
5. THE System SHALL provide a User Profile page for authenticated users
6. WHEN a user views their profile, THE System SHALL display their name, email, and saved addresses
7. WHEN a user updates their profile, THE System SHALL save changes to the Backend
8. THE System SHALL provide an Order History page for authenticated users
9. WHEN a user views order history, THE System SHALL display all past orders with order number, date, total, and status
10. WHEN a user clicks on an order, THE System SHALL display detailed order information including items, shipping address, and tracking number
11. THE System SHALL provide a Privacy Policy page
12. THE System SHALL provide a Terms of Service page
13. THE System SHALL provide a Shipping & Returns page with shipping rates and return policy

### Requirement 8: Admin Panel Authentication

**User Story:** As a store owner, I want a secure admin panel with hardcoded credentials, so that only authorized personnel can access order management and analytics.

#### Acceptance Criteria

1. THE System SHALL protect the admin dashboard with authentication
2. WHEN an unauthenticated user accesses the admin dashboard, THE System SHALL redirect to an admin login page
3. THE System SHALL accept hardcoded admin credentials (username: "admin", password: "admin123secure")
4. WHEN a user enters correct admin credentials, THE System SHALL grant access to the admin dashboard
5. WHEN a user enters incorrect admin credentials, THE System SHALL display an error message
6. THE System SHALL store admin session separately from regular user sessions
7. WHEN an admin logs out, THE System SHALL clear the admin session and redirect to the admin login page
8. THE System SHALL display a logout button in the admin dashboard header
9. THE Admin dashboard SHALL be accessible only at the /admin route
10. THE System SHALL prevent regular authenticated users from accessing the admin dashboard

### Requirement 9: Enhanced User Experience

**User Story:** As a user, I want an intuitive and user-friendly interface, so that I can easily navigate and complete purchases without confusion.

#### Acceptance Criteria

1. THE System SHALL provide clear navigation with visible links to all major sections
2. THE System SHALL display a persistent header with logo, navigation menu, search, cart icon, and user account icon
3. THE System SHALL display the cart item count badge on the cart icon
4. WHEN a user adds an item to cart, THE System SHALL show a success notification
5. WHEN a user adds an item to wishlist, THE System SHALL show a success notification
6. THE System SHALL provide breadcrumb navigation on product and category pages
7. THE System SHALL display helpful placeholder text in all form inputs
8. THE System SHALL validate form inputs in real-time and display inline error messages
9. THE System SHALL disable submit buttons during form submission to prevent double-submission
10. THE System SHALL provide a search bar with autocomplete suggestions
11. THE System SHALL display "No results found" message when search returns no products
12. THE System SHALL provide filter and sort options on product listing pages
13. THE System SHALL display product availability status (In Stock, Out of Stock, Low Stock)
14. THE System SHALL provide a "Back to Top" button on long pages
15. THE System SHALL display a footer with links to important pages, social media, and newsletter signup

### Requirement 10: Product Images in Checkout

**User Story:** As a user, I want to see product images in the checkout page, so that I can visually confirm the items I'm purchasing.

#### Acceptance Criteria

1. WHEN a user views the Checkout_Page, THE System SHALL display product images for all cart items
2. THE System SHALL construct image URLs using the Backend base URL and image path
3. WHEN an image URL is invalid or missing, THE System SHALL display a placeholder image
4. THE System SHALL display images with consistent dimensions in the Order_Summary
5. THE System SHALL optimize image loading to prevent checkout page slowdown
6. THE System SHALL use the Next.js Image component for automatic optimization
7. WHEN a product has multiple images, THE System SHALL display the primary product image
