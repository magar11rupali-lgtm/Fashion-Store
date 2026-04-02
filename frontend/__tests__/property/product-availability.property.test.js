/**
 * Property-Based Test for Product Availability Display
 * Feature: ecommerce-fixes-and-enhancements
 * Property 49: Product availability display
 * Validates: Requirements 9.13
 */

import { render, screen } from '@testing-library/react';
import ProductCard from '@/app/components/ProductCard';
import { CartProvider } from '@/app/context/CartContext';
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

// Arbitrary generator for products with different availability states
const productWithAvailabilityArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  name: fc.string({ minLength: 3, maxLength: 50 }),
  description: fc.array(
    fc.record({
      children: fc.array(
        fc.record({
          text: fc.string({ minLength: 10, maxLength: 100 }),
        })
      ),
    })
  ),
  price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true, noDefaultInfinity: true }),
  inStock: fc.boolean(),
  inventory: fc.integer({ min: 0, max: 100 }),
  image: fc.constantFrom(
    [{ url: '/uploads/image1.png' }],
    [{ url: '/uploads/image2.png' }],
    []
  ),
  category: fc.record({
    data: fc.record({
      attributes: fc.record({
        name: fc.constantFrom('Clothing', 'Accessories', 'Shoes', 'Electronics'),
      }),
    }),
  }),
});

// Helper function to determine expected availability status
function getExpectedAvailabilityStatus(inStock, inventory) {
  if (!inStock || inventory === 0) {
    return { label: 'Out of Stock', color: 'bg-red-500' };
  } else if (inventory <= 10) {
    return { label: 'Low Stock', color: 'bg-yellow-500' };
  } else {
    return { label: 'In Stock', color: 'bg-green-500' };
  }
}

describe('Feature: ecommerce-fixes-and-enhancements, Property 49: Product availability display', () => {
  let container;
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    if (container) {
      container.remove();
      container = null;
    }
  });

  /**
   * **Validates: Requirements 9.13**
   * 
   * Property: For any product, the system should display availability status (In Stock, Out of Stock, or Low Stock)
   * 
   * This property verifies that:
   * 1. Products with inStock=false or inventory=0 show "Out of Stock"
   * 2. Products with inventory <= 10 show "Low Stock"
   * 3. Products with inventory > 10 show "In Stock"
   * 4. The availability badge is always displayed
   * 5. The correct color coding is applied (red for out of stock, yellow for low stock, green for in stock)
   */
  it('should display correct availability status for any product', async () => {
    await fc.assert(
      fc.asyncProperty(
        productWithAvailabilityArbitrary,
        async (product) => {
          // Arrange: Determine expected availability status
          const expectedStatus = getExpectedAvailabilityStatus(product.inStock, product.inventory);

          // Act: Render ProductCard
          const { container: testContainer, unmount } = render(
            <NotificationProvider>
              <CartProvider>
                <ProductCard product={product} />
              </CartProvider>
            </NotificationProvider>
          );

          try {
            // Assert: Availability badge should be displayed with correct text
            const availabilityBadge = testContainer.querySelector(`.${expectedStatus.color}`);
            expect(availabilityBadge).toBeInTheDocument();
            expect(availabilityBadge).toHaveTextContent(expectedStatus.label);

            // Verify the badge has the correct color class
            expect(availabilityBadge).toHaveClass(expectedStatus.color);

            // Verify the badge is visible
            expect(availabilityBadge).toBeVisible();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000); // 60 second timeout

  it('should show "Out of Stock" when inStock is false regardless of inventory', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 100 }),
        async (inventory) => {
          // Arrange: Product with inStock=false
          const product = {
            id: 1,
            name: 'Test Product',
            description: [{ children: [{ text: 'Test description' }] }],
            price: 99.99,
            inStock: false,
            inventory: inventory,
            image: [{ url: '/uploads/test.png' }],
            category: { data: { attributes: { name: 'Test' } } },
          };

          // Act: Render ProductCard
          const { container: testContainer, unmount } = render(
            <NotificationProvider>
              <CartProvider>
                <ProductCard product={product} />
              </CartProvider>
            </NotificationProvider>
          );

          try {
            // Assert: Should show "Out of Stock"
            const badge = testContainer.querySelector('.bg-red-500');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveTextContent('Out of Stock');
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  it('should show "Out of Stock" when inventory is 0 regardless of inStock flag', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(),
        async (inStock) => {
          // Arrange: Product with inventory=0
          const product = {
            id: 1,
            name: 'Test Product',
            description: [{ children: [{ text: 'Test description' }] }],
            price: 99.99,
            inStock: inStock,
            inventory: 0,
            image: [{ url: '/uploads/test.png' }],
            category: { data: { attributes: { name: 'Test' } } },
          };

          // Act: Render ProductCard
          const { container: testContainer, unmount } = render(
            <NotificationProvider>
              <CartProvider>
                <ProductCard product={product} />
              </CartProvider>
            </NotificationProvider>
          );

          try {
            // Assert: Should show "Out of Stock"
            const badge = testContainer.querySelector('.bg-red-500');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveTextContent('Out of Stock');
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  it('should show "Low Stock" when inventory is between 1 and 10', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        async (inventory) => {
          // Arrange: Product with low inventory
          const product = {
            id: 1,
            name: 'Test Product',
            description: [{ children: [{ text: 'Test description' }] }],
            price: 99.99,
            inStock: true,
            inventory: inventory,
            image: [{ url: '/uploads/test.png' }],
            category: { data: { attributes: { name: 'Test' } } },
          };

          // Act: Render ProductCard
          const { container: testContainer, unmount } = render(
            <NotificationProvider>
              <CartProvider>
                <ProductCard product={product} />
              </CartProvider>
            </NotificationProvider>
          );

          try {
            // Assert: Should show "Low Stock"
            const badge = testContainer.querySelector('.bg-yellow-500');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveTextContent('Low Stock');
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  it('should show "In Stock" when inventory is greater than 10', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 11, max: 1000 }),
        async (inventory) => {
          // Arrange: Product with high inventory
          const product = {
            id: 1,
            name: 'Test Product',
            description: [{ children: [{ text: 'Test description' }] }],
            price: 99.99,
            inStock: true,
            inventory: inventory,
            image: [{ url: '/uploads/test.png' }],
            category: { data: { attributes: { name: 'Test' } } },
          };

          // Act: Render ProductCard
          const { container: testContainer, unmount } = render(
            <NotificationProvider>
              <CartProvider>
                <ProductCard product={product} />
              </CartProvider>
            </NotificationProvider>
          );

          try {
            // Assert: Should show "In Stock"
            const badge = testContainer.querySelector('.bg-green-500');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveTextContent('In Stock');
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  it('should disable add to cart button when out of stock', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          inStock: fc.constant(false),
          inventory: fc.integer({ min: 0, max: 100 }),
        }),
        async ({ inStock, inventory }) => {
          // Arrange: Out of stock product
          const product = {
            id: 1,
            name: 'Test Product',
            description: [{ children: [{ text: 'Test description' }] }],
            price: 99.99,
            inStock: inStock,
            inventory: inventory,
            image: [{ url: '/uploads/test.png' }],
            category: { data: { attributes: { name: 'Test' } } },
          };

          // Act: Render ProductCard
          const { container: testContainer, unmount } = render(
            <NotificationProvider>
              <CartProvider>
                <ProductCard product={product} />
              </CartProvider>
            </NotificationProvider>
          );

          try {
            // Assert: Add to cart button should be disabled
            const button = testContainer.querySelector('button');
            expect(button).toBeDisabled();
            expect(button).toHaveTextContent('Unavailable');
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  it('should enable add to cart button when in stock', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100 }),
        async (inventory) => {
          // Arrange: In stock product
          const product = {
            id: 1,
            name: 'Test Product',
            description: [{ children: [{ text: 'Test description' }] }],
            price: 99.99,
            inStock: true,
            inventory: inventory,
            image: [{ url: '/uploads/test.png' }],
            category: { data: { attributes: { name: 'Test' } } },
          };

          // Act: Render ProductCard
          const { container: testContainer, unmount } = render(
            <NotificationProvider>
              <CartProvider>
                <ProductCard product={product} />
              </CartProvider>
            </NotificationProvider>
          );

          try {
            // Assert: Add to cart button should be enabled
            const button = testContainer.querySelector('button');
            expect(button).not.toBeDisabled();
            expect(button).toHaveTextContent('Add to Cart');
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  it('should display availability badge in correct position (top-right)', async () => {
    await fc.assert(
      fc.asyncProperty(
        productWithAvailabilityArbitrary,
        async (product) => {
          // Arrange & Act: Render ProductCard
          const { container: testContainer, unmount } = render(
            <NotificationProvider>
              <CartProvider>
                <ProductCard product={product} />
              </CartProvider>
            </NotificationProvider>
          );

          try {
            // Assert: Badge should have positioning classes
            const expectedStatus = getExpectedAvailabilityStatus(product.inStock, product.inventory);
            const badge = testContainer.querySelector(`.${expectedStatus.color}`);
            
            expect(badge).toHaveClass('absolute');
            expect(badge).toHaveClass('top-2');
            expect(badge).toHaveClass('right-2');
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  it('should always display exactly one availability status', async () => {
    await fc.assert(
      fc.asyncProperty(
        productWithAvailabilityArbitrary,
        async (product) => {
          // Arrange & Act: Render ProductCard
          const { container: testContainer, unmount } = render(
            <NotificationProvider>
              <CartProvider>
                <ProductCard product={product} />
              </CartProvider>
            </NotificationProvider>
          );

          try {
            // Assert: Should have exactly one of the three statuses
            const redBadges = testContainer.querySelectorAll('.bg-red-500');
            const yellowBadges = testContainer.querySelectorAll('.bg-yellow-500');
            const greenBadges = testContainer.querySelectorAll('.bg-green-500');
            
            const totalBadges = redBadges.length + yellowBadges.length + greenBadges.length;
            expect(totalBadges).toBe(1);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);
});

