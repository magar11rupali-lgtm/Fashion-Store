/**
 * Property-Based Test for Cart Count Badge Accuracy
 * Feature: ecommerce-fixes-and-enhancements
 * Property 42: Cart count badge accuracy
 * Validates: Requirements 9.3
 */

import { render, act, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from '@/app/context/CartContext';
import { NotificationProvider } from '@/hooks/useNotification';
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

// Arbitrary generator for cart operations
const cartOperationArbitrary = fc.record({
  product: productArbitrary,
  quantity: fc.integer({ min: 1, max: 10 }),
  size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
});

// Test component that captures cart state
function TestComponent({ onStateChange }) {
  const cart = useCart();
  
  React.useEffect(() => {
    onStateChange({ cart });
  }, [cart.cart, cart.totalItems]);
  
  return null;
}

describe('Feature: ecommerce-fixes-and-enhancements, Property 42: Cart count badge accuracy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  /**
   * **Validates: Requirements 9.3**
   * 
   * Property: For any cart state, the cart icon badge should display the total quantity of items in the cart
   * 
   * This property verifies that:
   * 1. The totalItems value equals the sum of all item quantities in the cart
   * 2. When items are added, the count increases by the added quantity
   * 3. When items are removed, the count decreases appropriately
   * 4. The count is always accurate regardless of cart operations
   */
  it('should display accurate cart count for any sequence of cart operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(cartOperationArbitrary, { minLength: 1, maxLength: 10 }),
        async (operations) => {
          // Arrange: Reset state for each iteration
          localStorageMock.clear();

          let state = { cart: null };
          const onStateChange = (newState) => {
            state = newState;
          };

          // Render component with provider
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
          });

          // Verify initial state - empty cart
          expect(state.cart.totalItems).toBe(0);
          expect(state.cart.cart.length).toBe(0);

          // Act: Perform cart operations
          let expectedTotalQuantity = 0;
          const addedItems = new Map(); // Track items by id+size

          for (const operation of operations) {
            await act(async () => {
              state.cart.addToCart(operation.product, operation.quantity, operation.size);
            });

            // Track expected quantity
            const key = `${operation.product.id}-${operation.size}`;
            const currentQty = addedItems.get(key) || 0;
            addedItems.set(key, currentQty + operation.quantity);
            expectedTotalQuantity += operation.quantity;
          }

          // Wait for state to update
          await waitFor(() => {
            expect(state.cart.cart.length).toBeGreaterThan(0);
          });

          // Assert: totalItems should equal sum of all quantities
          const actualTotalQuantity = state.cart.cart.reduce((sum, item) => sum + item.quantity, 0);
          
          expect(state.cart.totalItems).toBe(expectedTotalQuantity);
          expect(state.cart.totalItems).toBe(actualTotalQuantity);
          
          // Verify totalItems matches manual calculation
          let manualCount = 0;
          for (const item of state.cart.cart) {
            expect(item.quantity).toBeGreaterThan(0);
            manualCount += item.quantity;
          }
          expect(state.cart.totalItems).toBe(manualCount);
        }
      ),
      { numRuns: 10 }
    );
  }, 60000); // 60 second timeout

  it('should maintain accurate count when adding same product with different sizes', async () => {
    await fc.assert(
      fc.asyncProperty(
        productArbitrary,
        fc.array(fc.constantFrom('XS', 'S', 'M', 'L', 'XL'), { minLength: 1, maxLength: 5 }),
        fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 1, maxLength: 5 }),
        async (product, sizes, quantities) => {
          // Ensure arrays have same length
          const minLength = Math.min(sizes.length, quantities.length);
          const sizesToUse = sizes.slice(0, minLength);
          const quantitiesToUse = quantities.slice(0, minLength);

          // Arrange
          localStorageMock.clear();

          let state = { cart: null };
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
          });

          // Act: Add same product with different sizes
          let expectedTotal = 0;
          for (let i = 0; i < sizesToUse.length; i++) {
            await act(async () => {
              state.cart.addToCart(product, quantitiesToUse[i], sizesToUse[i]);
            });
            expectedTotal += quantitiesToUse[i];
          }

          await waitFor(() => {
            expect(state.cart.cart.length).toBeGreaterThan(0);
          });

          // Assert: Count should include all sizes
          expect(state.cart.totalItems).toBe(expectedTotal);
          
          // Verify each size is tracked separately
          const actualTotal = state.cart.cart.reduce((sum, item) => sum + item.quantity, 0);
          expect(actualTotal).toBe(expectedTotal);
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  it('should update count correctly when removing items', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(cartOperationArbitrary, { minLength: 2, maxLength: 5 }),
        async (operations) => {
          // Arrange
          localStorageMock.clear();

          let state = { cart: null };
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
          });

          // Act: Add items
          for (const operation of operations) {
            await act(async () => {
              state.cart.addToCart(operation.product, operation.quantity, operation.size);
            });
          }

          await waitFor(() => {
            expect(state.cart.cart.length).toBeGreaterThan(0);
          });

          const countAfterAdding = state.cart.totalItems;
          expect(countAfterAdding).toBeGreaterThan(0);

          // Remove first item
          const firstItem = state.cart.cart[0];
          const removedQuantity = firstItem.quantity;

          await act(async () => {
            state.cart.removeFromCart(firstItem.id, firstItem.size);
          });

          await waitFor(() => {
            expect(state.cart.totalItems).toBe(countAfterAdding - removedQuantity);
          });

          // Assert: Count should decrease by removed quantity
          expect(state.cart.totalItems).toBe(countAfterAdding - removedQuantity);
          
          // Verify manual calculation
          const actualTotal = state.cart.cart.reduce((sum, item) => sum + item.quantity, 0);
          expect(state.cart.totalItems).toBe(actualTotal);
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  it('should update count correctly when updating quantities', async () => {
    await fc.assert(
      fc.asyncProperty(
        cartOperationArbitrary,
        fc.integer({ min: 1, max: 10 }),
        async (operation, newQuantity) => {
          // Arrange
          localStorageMock.clear();

          let state = { cart: null };
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
          });

          // Act: Add item
          await act(async () => {
            state.cart.addToCart(operation.product, operation.quantity, operation.size);
          });

          await waitFor(() => {
            expect(state.cart.cart.length).toBe(1);
          });

          expect(state.cart.totalItems).toBe(operation.quantity);

          // Update quantity
          await act(async () => {
            state.cart.updateQuantity(operation.product.id, operation.size, newQuantity);
          });

          await waitFor(() => {
            expect(state.cart.totalItems).toBe(newQuantity);
          });

          // Assert: Count should reflect new quantity
          expect(state.cart.totalItems).toBe(newQuantity);
          expect(state.cart.cart[0].quantity).toBe(newQuantity);
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  it('should show zero count for empty cart', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          // Arrange
          localStorageMock.clear();

          let state = { cart: null };
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
          });

          // Assert: Empty cart should have zero count
          expect(state.cart.totalItems).toBe(0);
          expect(state.cart.cart.length).toBe(0);
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);

  it('should reset count to zero when cart is cleared', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(cartOperationArbitrary, { minLength: 1, maxLength: 5 }),
        async (operations) => {
          // Arrange
          localStorageMock.clear();

          let state = { cart: null };
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
          });

          // Act: Add items
          for (const operation of operations) {
            await act(async () => {
              state.cart.addToCart(operation.product, operation.quantity, operation.size);
            });
          }

          await waitFor(() => {
            expect(state.cart.cart.length).toBeGreaterThan(0);
          });

          expect(state.cart.totalItems).toBeGreaterThan(0);

          // Clear cart
          await act(async () => {
            state.cart.clearCart();
          });

          await waitFor(() => {
            expect(state.cart.cart.length).toBe(0);
          });

          // Assert: Count should be zero after clearing
          expect(state.cart.totalItems).toBe(0);
          expect(state.cart.cart.length).toBe(0);
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);
});

