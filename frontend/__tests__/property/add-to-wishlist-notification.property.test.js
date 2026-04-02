/**
 * Property-Based Test for Add to Wishlist Notification
 * Feature: ecommerce-fixes-and-enhancements
 * Property 44: Add to wishlist notification
 * Validates: Requirements 9.5
 */

import { render, act, waitFor } from '@testing-library/react';
import { WishlistProvider, useWishlist } from '@/app/context/WishlistContext';
import { NotificationProvider, useNotification } from '@/hooks/useNotification';
import { SessionProvider } from 'next-auth/react';
import fc from 'fast-check';
import React from 'react';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }) => children,
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
}));

// Mock wishlist API
jest.mock('@/lib/wishlist', () => ({
  fetchWishlist: jest.fn(),
  addToWishlist: jest.fn(),
  removeFromWishlist: jest.fn(),
}));

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
  sizes: fc.constantFrom(
    ['XS', 'S', 'M', 'L', 'XL'],
    ['S', 'M', 'L'],
    ['One Size']
  ),
}).map(product => ({
  id: product.id,
  attributes: {
    name: product.name,
    price: product.price,
    image: product.image ? { data: { attributes: { url: product.image } } } : null,
    sizes: product.sizes,
  },
}));

// Test component that captures wishlist and notification state
function TestComponent({ onStateChange }) {
  const wishlist = useWishlist();
  const notification = useNotification();
  
  React.useEffect(() => {
    onStateChange({ wishlist, notification });
  }, [wishlist.wishlist, notification.notifications]);
  
  return null;
}

describe('Feature: ecommerce-fixes-and-enhancements, Property 44: Add to wishlist notification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  /**
   * **Validates: Requirements 9.5**
   * 
   * Property: For any product added to wishlist, a success notification should be displayed
   * 
   * This property verifies that:
   * 1. When a product is added to the wishlist, a notification is created
   * 2. The notification has type 'success'
   * 3. The notification message contains the product name
   * 4. The notification is added to the notifications array
   */
  it('should display success notification when any product is added to wishlist', async () => {
    await fc.assert(
      fc.asyncProperty(
        productArbitrary,
        async (product) => {
          // Arrange: Reset state for each iteration
          localStorageMock.clear();

          let state = { wishlist: null, notification: null };
          const onStateChange = (newState) => {
            state = newState;
          };

          // Render component with providers
          render(
            <SessionProvider session={null}>
              <NotificationProvider>
                <WishlistProvider>
                  <TestComponent onStateChange={onStateChange} />
                </WishlistProvider>
              </NotificationProvider>
            </SessionProvider>
          );

          // Wait for initial render
          await waitFor(() => {
            expect(state.wishlist).not.toBeNull();
            expect(state.notification).not.toBeNull();
          });

          // Verify initial state - no notifications
          expect(state.notification.notifications.length).toBe(0);

          // Act: Add product to wishlist
          await act(async () => {
            await state.wishlist.addToWishlist(product);
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

          let state = { wishlist: null, notification: null };
          const onStateChange = (newState) => {
            state = newState;
          };

          render(
            <SessionProvider session={null}>
              <NotificationProvider>
                <WishlistProvider>
                  <TestComponent onStateChange={onStateChange} />
                </WishlistProvider>
              </NotificationProvider>
            </SessionProvider>
          );

          await waitFor(() => {
            expect(state.wishlist).not.toBeNull();
            expect(state.notification).not.toBeNull();
          });

          // Act: Add product to wishlist
          await act(async () => {
            await state.wishlist.addToWishlist(product);
          });

          // Wait for notification
          await waitFor(() => {
            expect(state.notification.notifications.length).toBeGreaterThan(0);
          }, { timeout: 2000 });

          // Assert: Notification message should follow expected format
          const notification = state.notification.notifications[0];
          const productName = product.attributes.name;
          
          // The message should contain the product name and indicate it was added to wishlist
          expect(notification.message).toContain(productName);
          expect(notification.message.toLowerCase()).toMatch(/add(ed)?.*wishlist/i);
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

          let state = { wishlist: null, notification: null };
          const onStateChange = (newState) => {
            state = newState;
          };

          render(
            <SessionProvider session={null}>
              <NotificationProvider>
                <WishlistProvider>
                  <TestComponent onStateChange={onStateChange} />
                </WishlistProvider>
              </NotificationProvider>
            </SessionProvider>
          );

          await waitFor(() => {
            expect(state.wishlist).not.toBeNull();
            expect(state.notification).not.toBeNull();
          });

          // Act: Add product to wishlist
          await act(async () => {
            await state.wishlist.addToWishlist(product);
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

  it('should not display notification when product is already in wishlist', async () => {
    await fc.assert(
      fc.asyncProperty(
        productArbitrary,
        async (product) => {
          // Arrange
          localStorageMock.clear();

          let state = { wishlist: null, notification: null };
          const onStateChange = (newState) => {
            state = newState;
          };

          render(
            <SessionProvider session={null}>
              <NotificationProvider>
                <WishlistProvider>
                  <TestComponent onStateChange={onStateChange} />
                </WishlistProvider>
              </NotificationProvider>
            </SessionProvider>
          );

          await waitFor(() => {
            expect(state.wishlist).not.toBeNull();
            expect(state.notification).not.toBeNull();
          });

          // Act: Add product to wishlist first time
          await act(async () => {
            await state.wishlist.addToWishlist(product);
          });

          // Wait for first notification
          await waitFor(() => {
            expect(state.notification.notifications.length).toBeGreaterThan(0);
          }, { timeout: 2000 });

          const firstNotificationCount = state.notification.notifications.length;
          const firstNotification = state.notification.notifications[firstNotificationCount - 1];
          expect(firstNotification.type).toBe('success');

          // Act: Try to add the same product again
          await act(async () => {
            await state.wishlist.addToWishlist(product);
          });

          // Wait a bit to see if a new notification appears
          await waitFor(() => {
            expect(state.notification.notifications.length).toBeGreaterThan(firstNotificationCount);
          }, { timeout: 2000 });

          // Assert: Should show an info notification (not success)
          const secondNotification = state.notification.notifications[state.notification.notifications.length - 1];
          expect(secondNotification.type).toBe('info');
          expect(secondNotification.message.toLowerCase()).toContain('already');
        }
      ),
      { numRuns: 10 }
    );
  }, 30000); // 30 second timeout
});
