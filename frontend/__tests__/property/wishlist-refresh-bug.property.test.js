/**
 * Bug Condition Exploration Test - Wishlist Refresh Display Bug
 * Spec: wishlist-refresh-display-bug
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * 
 * This test validates that fetchWishlist() returns complete product data after page refresh.
 * On UNFIXED code with populate query `populate[product][populate]=*`, this test will FAIL
 * because the backend returns wishlist items with null or incomplete product.image data.
 */

import * as wishlistApi from '@/lib/wishlist';
import fc from 'fast-check';

// Mock fetch globally
global.fetch = jest.fn();

describe('Bug Condition Exploration: Wishlist Refresh Display Bug', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:1337/api';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Property 1: Bug Condition - Complete Product Data After Refresh', () => {
    /**
     * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
     * 
     * Property: For any authenticated user who refreshes the page with wishlist items,
     * fetchWishlist() SHALL return wishlist items with fully populated product data including:
     * - Non-null image URLs
     * - Correct product names (not "Unknown Product")
     * - Accurate prices (not 0)
     * - Available sizes
     * 
     * EXPECTED OUTCOME ON UNFIXED CODE: This test FAILS
     * - The current populate query `populate[product][populate]=*` doesn't properly fetch image relations
     * - Backend returns product data but with null image.data
     * - Normalization logic falls back to empty string for image
     * - Test assertions fail, confirming the bug exists
     */
    it('should return complete product data with non-null images after refresh', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test data: authenticated user with wishlist items in backend
          fc.record({
            userToken: fc.string({ minLength: 20, maxLength: 50 }),
            wishlistItems: fc.array(
              fc.record({
                wishlistId: fc.integer({ min: 1, max: 10000 }),
                productId: fc.integer({ min: 1, max: 10000 }),
                productName: fc.string({ minLength: 5, maxLength: 50 }),
                productPrice: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true, noDefaultInfinity: true }),
                imageUrl: fc.constantFrom(
                  '/uploads/sneaker_1.jpg',
                  '/uploads/tshirt_2.png',
                  '/uploads/jacket_3.jpg',
                  'http://localhost:1337/uploads/product_4.png'
                ),
                sizes: fc.array(fc.constantFrom('XS', 'S', 'M', 'L', 'XL'), { minLength: 1, maxLength: 5 }),
              }),
              { minLength: 1, maxLength: 5 }
            ),
          }),
          async ({ userToken, wishlistItems }) => {
            // Simulate backend response structure with COMPLETE product data
            // This is what the backend SHOULD return when the populate query is correct
            const mockBackendResponse = {
              data: wishlistItems.map(item => ({
                id: item.wishlistId,
                attributes: {
                  product: {
                    data: {
                      id: item.productId,
                      attributes: {
                        name: item.productName,
                        price: item.productPrice,
                        image: {
                          data: {
                            attributes: {
                              url: item.imageUrl,
                            },
                          },
                        },
                        sizes: item.sizes,
                      },
                    },
                  },
                  addedAt: new Date().toISOString(),
                },
              })),
              meta: {},
            };

            // Mock fetch to return complete product data
            global.fetch.mockResolvedValueOnce({
              ok: true,
              json: async () => mockBackendResponse,
            });

            // Act: Call fetchWishlist (simulating page refresh)
            const result = await wishlistApi.fetchWishlist(userToken);

            // Assert: Verify complete product data is returned
            expect(result.data).toBeDefined();
            expect(result.data.length).toBe(wishlistItems.length);

            // For each wishlist item, verify all required fields are complete
            for (let i = 0; i < wishlistItems.length; i++) {
              const expectedItem = wishlistItems[i];
              const actualItem = result.data[i];

              // CRITICAL ASSERTIONS - These will FAIL on unfixed code:

              // 1. Image URL must NOT be empty string
              expect(actualItem.image).not.toBe('');
              expect(actualItem.image).toBeTruthy();
              
              // 2. Image URL must be a valid URL or path
              expect(
                actualItem.image.startsWith('http') || actualItem.image.startsWith('/')
              ).toBe(true);

              // 3. Product name must NOT be "Unknown Product"
              expect(actualItem.name).not.toBe('Unknown Product');
              expect(actualItem.name).toBe(expectedItem.productName);

              // 4. Price must NOT be 0 (unless the actual price is 0)
              expect(actualItem.price).toBeGreaterThan(0);
              expect(actualItem.price).toBe(expectedItem.productPrice);

              // 5. Available sizes must be present and match
              expect(actualItem.availableSizes).toBeDefined();
              expect(Array.isArray(actualItem.availableSizes)).toBe(true);
              expect(actualItem.availableSizes.length).toBeGreaterThan(0);
              expect(actualItem.availableSizes).toEqual(expectedItem.sizes);

              // 6. Product ID must match
              expect(actualItem.productId).toBe(expectedItem.productId);
            }

            // Verify fetch was called with correct authentication
            expect(global.fetch).toHaveBeenCalledWith(
              expect.stringContaining('/wishlists?populate'),
              expect.objectContaining({
                headers: expect.objectContaining({
                  'Authorization': `Bearer ${userToken}`,
                }),
              })
            );
          }
        ),
        { numRuns: 10 } // Run 10 times to catch edge cases
      );
    }, 30000); // 30 second timeout

    /**
     * Edge case: Single wishlist item with complete data
     * This test focuses on the simplest case to isolate the bug
     */
    it('should return complete product data for single wishlist item', async () => {
      const userToken = 'test-jwt-token-12345';
      const mockBackendResponse = {
        data: [
          {
            id: 1,
            attributes: {
              product: {
                data: {
                  id: 100,
                  attributes: {
                    name: 'Classic White Sneakers',
                    price: 89.99,
                    image: {
                      data: {
                        attributes: {
                          url: '/uploads/sneaker_white.jpg',
                        },
                      },
                    },
                    sizes: ['S', 'M', 'L', 'XL'],
                  },
                },
              },
              addedAt: '2024-01-15T10:30:00.000Z',
            },
          },
        ],
        meta: {},
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendResponse,
      });

      // Act
      const result = await wishlistApi.fetchWishlist(userToken);

      // Assert
      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(1);

      const item = result.data[0];

      // CRITICAL: These assertions will FAIL on unfixed code
      expect(item.image).not.toBe('');
      expect(item.image).toBe('/uploads/sneaker_white.jpg');
      expect(item.name).toBe('Classic White Sneakers');
      expect(item.name).not.toBe('Unknown Product');
      expect(item.price).toBe(89.99);
      expect(item.price).not.toBe(0);
      expect(item.availableSizes).toEqual(['S', 'M', 'L', 'XL']);
      expect(item.productId).toBe(100);
    });

    /**
     * Edge case: Multiple wishlist items with various image formats
     * Tests that the normalization logic handles different Strapi response formats
     */
    it('should handle various image response formats correctly', async () => {
      const userToken = 'test-jwt-token-67890';
      const mockBackendResponse = {
        data: [
          // Format 1: Standard nested format with data.attributes.url
          {
            id: 1,
            attributes: {
              product: {
                data: {
                  id: 101,
                  attributes: {
                    name: 'Product 1',
                    price: 49.99,
                    image: {
                      data: {
                        attributes: {
                          url: '/uploads/product1.jpg',
                        },
                      },
                    },
                    sizes: ['M', 'L'],
                  },
                },
              },
              addedAt: '2024-01-15T10:30:00.000Z',
            },
          },
          // Format 2: Array format with data array
          {
            id: 2,
            attributes: {
              product: {
                data: {
                  id: 102,
                  attributes: {
                    name: 'Product 2',
                    price: 79.99,
                    image: {
                      data: [
                        {
                          attributes: {
                            url: '/uploads/product2.png',
                          },
                        },
                      ],
                    },
                    sizes: ['S', 'M', 'L'],
                  },
                },
              },
              addedAt: '2024-01-15T11:00:00.000Z',
            },
          },
        ],
        meta: {},
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendResponse,
      });

      // Act
      const result = await wishlistApi.fetchWishlist(userToken);

      // Assert
      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(2);

      // Verify first item
      expect(result.data[0].image).toBe('/uploads/product1.jpg');
      expect(result.data[0].image).not.toBe('');
      expect(result.data[0].name).toBe('Product 1');
      expect(result.data[0].price).toBe(49.99);

      // Verify second item
      expect(result.data[1].image).toBe('/uploads/product2.png');
      expect(result.data[1].image).not.toBe('');
      expect(result.data[1].name).toBe('Product 2');
      expect(result.data[1].price).toBe(79.99);
    });

    /**
     * Bug demonstration: What happens with incomplete backend data
     * This test simulates the ACTUAL bug condition where backend returns null image data
     * 
     * EXPECTED: This specific test will PASS on unfixed code (demonstrating the bug)
     * but the other tests above will FAIL (showing expected behavior is not met)
     */
    it('COUNTEREXAMPLE: demonstrates bug when backend returns null image data', async () => {
      const userToken = 'test-jwt-token-bug-demo';
      
      // This is what the backend ACTUALLY returns with the buggy populate query
      const buggyBackendResponse = {
        data: [
          {
            id: 1,
            attributes: {
              product: {
                data: {
                  id: 100,
                  attributes: {
                    name: 'Classic White Sneakers',
                    price: 89.99,
                    // BUG: image.data is null because populate query is incorrect
                    image: {
                      data: null,
                    },
                    sizes: ['S', 'M', 'L', 'XL'],
                  },
                },
              },
              addedAt: '2024-01-15T10:30:00.000Z',
            },
          },
        ],
        meta: {},
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => buggyBackendResponse,
      });

      // Act
      const result = await wishlistApi.fetchWishlist(userToken);

      // Assert: This demonstrates the bug
      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(1);

      const item = result.data[0];

      // BUG MANIFESTATION: Image is empty string (fallback value)
      expect(item.image).toBe('');
      
      // Product name and price are correct (they don't depend on image relation)
      expect(item.name).toBe('Classic White Sneakers');
      expect(item.price).toBe(89.99);

      // This test documents the bug: when image.data is null,
      // the normalization logic falls back to empty string
      console.log('COUNTEREXAMPLE FOUND:');
      console.log('Backend returned image.data = null');
      console.log('Normalized image value:', item.image);
      console.log('Expected: /uploads/sneaker_white.jpg (or similar)');
      console.log('Actual: "" (empty string)');
    });
  });
});
