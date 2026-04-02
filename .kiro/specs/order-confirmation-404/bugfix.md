# Bugfix Requirements Document

## Introduction

After a user successfully places an order, they are redirected to `/orders/[id]/confirmation` (e.g. `localhost:3000/orders/30/confirmation`). Instead of showing the order confirmation page, Next.js returns a 404 "This page could not be found" error. The root cause is a routing conflict: a literal directory `frontend/app/orders/id/` exists alongside the dynamic segment directory `frontend/app/orders/[id]/`. In Next.js App Router, this sibling conflict prevents the dynamic route from resolving correctly, so any URL matching `/orders/<number>/confirmation` falls through to a 404.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user completes checkout and is redirected to `/orders/{id}/confirmation` THEN the system returns a 404 "This page could not be found" error instead of rendering the confirmation page.

1.2 WHEN a user navigates directly to `/orders/{id}/confirmation` for any numeric order ID THEN the system returns a 404 error.

### Expected Behavior (Correct)

2.1 WHEN a user completes checkout and is redirected to `/orders/{id}/confirmation` THEN the system SHALL render the order confirmation page displaying the order details for that order ID.

2.2 WHEN a user navigates directly to `/orders/{id}/confirmation` for a valid order ID THEN the system SHALL render the order confirmation page for that order.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user navigates to `/orders/{id}` (the order detail page) THEN the system SHALL CONTINUE TO render the order detail page correctly.

3.2 WHEN a user navigates to `/orders` (the orders list page) THEN the system SHALL CONTINUE TO display the list of their orders.

3.3 WHEN a user completes checkout THEN the system SHALL CONTINUE TO create the order in the backend and clear the cart before redirecting.
