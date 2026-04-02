/**
 * Property-Based Test for Add to Cart Notification
 * Feature: ecommerce-fixes-and-enhancements
 * Property 43: Add to cart notification
 * Validates: Requirements 9.4
 */

import { render, act, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from '@/app/context/CartContext';
import { NotificationProvider, useNotification } from '@/hooks/useNotification';
import fc from 'fast-check';
import React from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Arbitrary generator for products
const productArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  name: fc.string({ minLength: 3, maxLength: 50 }),
  price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true, noDefaultInfinity: true }),
  image: fc.option(fc.constantFrom('/uploads/image1.png', '/uploads/image2.png', null), { nil: null }),
}).map(product => ({
  id: product.id,
  attributes: {
    name: product.name,
    price: product.price,
    image: product.image ? { data: { attributes: { url: product.image } } } : null,
  },
}));

// Test component that captures cart and notification state
function TestComponent({ onStateChange }) {
  const cart = useCart();
  const notification = useNotification();
  
  React.useEffect(() => {
    onStateChange({ cart, notification });
  }, [cart.cart, notification.notifications]);
  
  return null;
}

describe('Feature: ecommerce-fixes-and-enhancements, Property 43: Add to cart notification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  /**
   * **Validates: Requirements 9.4**
   * 
   * Property: For any product added to cart, a success notification should be displayed
   * 
   * This property verifies that:
   * 1. When a product is added to the cart, a notification is created
   * 2. The notification has type 'success'
   * 3. The notification message contains the product name
   * 4. The notification is added to the notifications array
   */
  it('should display success notification when any product is added to cart', async () => {
    await fc.assert(
      fc.asyncProperty(
        productArbitrary,
        fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
        fc.integer({ min: 1, max: 10 }),
        async (product, size, quantity) => {
          // Arrange: Reset state for each iteration
          localStorageMock.clear();

          let state = { cart: null, notification: null };
          const onStateChange = (newState) => {
            state = newState;
          };

          // Render component with providers
          render(
            <NotificationProvider>
              <CartProvider>
                <TestComponent onStateChange={onStateChange} />
              </CartProvider>
            </NotificationProvider>
          );

          // Wait for initial render
          await waitFor(() => {
            expect(state.cart).not.toBeNull();
            expect(state.notification).not.toBeNull();
          });

          // Verify initial state - no notifications
          expect(state.notification.notifications.length).toBe(0);

          // Act: Add product to cart
          await act(async () => {
            state.cart.addToCart(product, quantity, size);
          });

          // Wait for notification to be added
          await waitFor(() => {
            expect(state.notification.notifications.length).toBeGreaterThan(0);
          }, { timeout: 2000 });

          // Assert: Notification should be displayed
          const notifications = state.notification.notifications;
          expect(notifications.length).toBeGreaterThan(0);

          // Find the notification for this product
          const notification = notifications[notifications.length - 1]; // Get the most recent notification

          // Verify notification properties
          expect(notification).toBeDefined();
          expect(notification.type).toBe('success');
          expect(notification.message).toBeDefined();
          expect(typeof notification.message).toBe('string');
          
          // Verify notification message contains product name
          const productName = product.attributes.name;
          expect(notification.message.toLowerCase()).toContain(productName.toLowerCase());
          
          // Verify notification has required fields
          expect(notification.id).toBeDefined();
          expect(typeof notification.id).toBe('string');
          expect(notification.duration).toBeDefined();
          expect(typeof notification.duration).toBe('number');
        }
      ),
      { numRuns: 10 }
    );
  }, 30000); // 30 second timeout

  it('should display notification with correct message format', async () => {
    await fc.assert(
      fc.asyncProperty(
        productArbitrary,
        async (product) => {
          // Arrange
          localStorageMock.clear();

          let state = { cart: null, notification: null };
          const onStateChange = (newState) => {
            state = newState;
          };

          render(
            <NotificationProvider>
              <CartProvider>
                <TestComponent onStateChange={onStateChange} />
              </CartProvider>
            </NotificationProvider>
          );

          await waitFor(() => {
            expect(state.cart).not.toBeNull();
            expect(state.notification).not.toBeNull();
          });

          // Act: Add product to cart
          await act(async () => {
            state.cart.addToCart(product, 1, 'M');
          });

          // Wait for notification
          await waitFor(() => {
            expect(state.notification.notifications.length).toBeGreaterThan(0);
          }, { timeout: 2000 });

          // Assert: Notification message should follow expected format
          const notification = state.notification.notifications[0];
          const productName = product.attributes.name;
          
          // The message should contain the product name and indicate it was added to cart
          expect(notification.message).toContain(productName);
          expect(notification.message.toLowerCase()).toMatch(/add(ed)?.*cart/i);
        }
      ),
      { numRuns: 10 }
    );
  }, 30000); // 30 second timeout

  it('should display notification with valid duration', async () => {
    await fc.assert(
      fc.asyncProperty(
        productArbitrary,
        async (product) => {
          // Arrange
          localStorageMock.clear();

          let state = { cart: null, notification: null };
          const onStateChange = (newState) => {
            state = newState;
          };

          render(
            <NotificationProvider>
              <CartProvider>
                <TestComponent onStateChange={onStateChange} />
              </CartProvider>
            </NotificationProvider>
          );

          await waitFor(() => {
            expect(state.cart).not.toBeNull();
            expect(state.notification).not.toBeNull();
          });

          // Act: Add product to cart
          await act(async () => {
            state.cart.addToCart(product, 1, 'M');
          });

          // Wait for notification
          await waitFor(() => {
            expect(state.notification.notifications.length).toBeGreaterThan(0);
          }, { timeout: 2000 });

          // Assert: Notification should have a valid duration
          const notification = state.notification.notifications[0];
          expect(notification.duration).toBeDefined();
          expect(typeof notification.duration).toBe('number');
          expect(notification.duration).toBeGreaterThan(0);
          expect(notification.duration).toBeLessThanOrEqual(10000); // Reasonable max duration
        }
      ),
      { numRuns: 10 }
    );
  }, 30000); // 30 second timeout
});
