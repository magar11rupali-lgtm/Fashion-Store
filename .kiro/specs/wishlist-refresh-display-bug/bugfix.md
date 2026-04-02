# Bugfix Requirements Document

## Introduction

This document specifies the requirements for fixing a critical bug in the wishlist feature where product details (image, price, name, and other attributes) disappear from wishlist items after a page refresh. The bug affects authenticated users whose wishlist data is persisted in the backend. While the wishlist items themselves remain in the database, the associated product information is not being properly loaded and displayed after the page reloads.

The root cause is that the backend API returns wishlist items with product relations, but the product data may be null or incomplete when the populate query doesn't properly fetch the related product information. The frontend normalization logic in `fetchWishlist()` attempts to extract product details from the nested Strapi response structure, but when the product relation is null or missing attributes, it falls back to default values like "Unknown Product" and empty images.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN an authenticated user refreshes the page and the backend returns wishlist items where `item.attributes.product.data` is null THEN the system displays wishlist items with "Unknown Product" as the name, 0 as the price, and empty image URLs

1.2 WHEN an authenticated user refreshes the page and the backend returns wishlist items with incomplete product population THEN the system displays wishlist items missing their image, price, name, and available sizes

1.3 WHEN the `fetchWishlist()` function receives a response where `productData` is undefined or null THEN the normalization logic creates wishlist items with fallback values instead of the actual product information

### Expected Behavior (Correct)

2.1 WHEN an authenticated user refreshes the page THEN the system SHALL fetch wishlist items from the backend with fully populated product relations including all product attributes (name, price, image, sizes)

2.2 WHEN the backend returns wishlist items with complete product data THEN the system SHALL display each wishlist item with the correct product image, name, price, and available sizes

2.3 WHEN the `fetchWishlist()` API call is made THEN the system SHALL use the correct populate query parameter to ensure product relations are fully loaded with all nested attributes

2.4 WHEN the normalization logic processes the API response THEN the system SHALL correctly extract product details from the nested Strapi structure and create complete wishlist item objects

### Unchanged Behavior (Regression Prevention)

3.1 WHEN an authenticated user adds a new product to the wishlist THEN the system SHALL CONTINUE TO save the wishlist item to the backend and display it with complete product information

3.2 WHEN an unauthenticated user refreshes the page THEN the system SHALL CONTINUE TO load wishlist items from localStorage with all product details intact

3.3 WHEN an authenticated user removes a product from the wishlist THEN the system SHALL CONTINUE TO remove the item from both the backend and the displayed wishlist

3.4 WHEN an authenticated user logs in with items in localStorage THEN the system SHALL CONTINUE TO merge localStorage wishlist items with backend wishlist items

3.5 WHEN the backend API returns an error during wishlist fetch THEN the system SHALL CONTINUE TO fall back to localStorage and display appropriate error handling
