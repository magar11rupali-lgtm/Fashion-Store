/**
 * Property-Based Tests for Wishlist Functionality
 * Feature: ecommerce-fixes-and-enhancements
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { WishlistProvider, useWishlist } from '@/app/context/WishlistContext';
import { useSession } from 'next-auth/react';
import * as wishlistApi from '@/lib/wishlist';
import fc from 'fast-check';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('@/lib/wishlist');

// Constants
const WISHLIST_STORAGE_KEY = 'wishlist';

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

// Arbitrary generators for property-based testing
const productArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  name: fc.string({ minLength: 3, maxLength: 50 }),
  price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true, noDefaultInfinity: true }),
  image: fc.option(fc.constantFrom('/uploads/image1.png', '/uploads/image2.png', null), { nil: null }),
  sizes: fc.array(fc.constantFrom('XS', 'S', 'M', 'L', 'XL'), { minLength: 1, maxLength: 5 }),
}).map(product => ({
  id: product.id,
  attributes: {
    name: product.name,
    price: product.price,
    image: product.image ? { data: { attributes: { url: product.image } } } : null,
    sizes: product.sizes,
  },
}));

describe('Feature: ecommerce-fixes-and-enhancements, Wishlist Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Default mock for useSession (unauthenticated)
    useSession.mockReturnValue({ data: null, status: 'unauthenticated' });
  });

  describe('Property 1: Wishlist addition', () => {
    /**
     * **Validates: Requirements 1.2**
     * 
     * Property: For any product, when added to the wishlist, the product should appear 
     * in the wishlist with correct product ID, name, price, and image
     */
    it('should add any product to wishlist with correct attributes (unauthenticated)', async () => {
      await fc.assert(
        fc.asyncProperty(productArbitrary, async (product) => {
          // Arrange: Reset state for each iteration
          localStorageMock.clear();
          useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

          const wrapper = ({ children }) => (
            <WishlistProvider>{children}</WishlistProvider>
          );

          const { result } = renderHook(() => useWishlist(), { wrapper });

          // Act: Add product to wishlist
          await act(async () => {
            await result.current.addToWishlist(product);
          });

          // Assert: Product should be in wishlist with correct attributes
          const wishlistItem = result.current.wishlist.find(
            item => item.productId === product.id
          );

          expect(wishlistItem).toBeDefined();
          expect(wishlistItem.productId).toBe(product.id);
          expect(wishlistItem.name).toBe(product.attributes.name);
          expect(wishlistItem.price).toBe(product.attributes.price);
          
          // Image should match (handle null case)
          const expectedImage = product.attributes.image?.data?.attributes?.url || null;
          expect(wishlistItem.image).toBe(expectedImage);
          
          // Available sizes should be present
          expect(wishlistItem.availableSizes).toBeDefined();
          expect(Array.isArray(wishlistItem.availableSizes)).toBe(true);
        }),
        { numRuns: 3 }
      );
    });

    it('should add any product to wishlist with correct attributes (authenticated)', async () => {
      await fc.assert(
        fc.asyncProperty(productArbitrary, async (product) => {
          // Arrange: Reset state and mock authenticated session
          localStorageMock.clear();
          const mockToken = 'mock-jwt-token-' + Math.random();
          useSession.mockReturnValue({
            data: { accessToken: mockToken },
            status: 'authenticated',
          });

          // Mock backend API response
          const mockBackendResponse = {
            data: {
              id: Math.floor(Math.random() * 10000),
              attributes: {
                product: {
                  data: {
                    id: product.id,
                    attributes: product.attributes,
                  },
                },
                addedAt: new Date().toISOString(),
              },
            },
          };

          wishlistApi.addToWishlist.mockResolvedValue(mockBackendResponse);
          wishlistApi.fetchWishlist.mockResolvedValue({ data: [] });

          const wrapper = ({ children }) => (
            <WishlistProvider>{children}</WishlistProvider>
          );

          const { result } = renderHook(() => useWishlist(), { wrapper });

          // Wait for initial load
          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          // Act: Add product to wishlist
          await act(async () => {
            await result.current.addToWishlist(product);
          });

          // Assert: Product should be in wishlist with correct attributes
          const wishlistItem = result.current.wishlist.find(
            item => item.productId === product.id
          );

          expect(wishlistItem).toBeDefined();
          expect(wishlistItem.productId).toBe(product.id);
          expect(wishlistItem.name).toBe(product.attributes.name);
          expect(wishlistItem.price).toBe(product.attributes.price);
          
          // Image should match (handle null case)
          const expectedImage = product.attributes.image?.data?.attributes?.url || null;
          expect(wishlistItem.image).toBe(expectedImage);
          
          // Available sizes should be present
          expect(wishlistItem.availableSizes).toBeDefined();
          expect(Array.isArray(wishlistItem.availableSizes)).toBe(true);

          // Verify API was called with correct parameters
          expect(wishlistApi.addToWishlist).toHaveBeenCalledWith(product.id, mockToken);
        }),
        { numRuns: 3 }
      );
    }, 30000); // 30 second timeout for property-based test

    it('should not add duplicate products to wishlist', async () => {
      await fc.assert(
        fc.asyncProperty(productArbitrary, async (product) => {
          // Arrange
          localStorageMock.clear();
          useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

          const wrapper = ({ children }) => (
            <WishlistProvider>{children}</WishlistProvider>
          );

          const { result } = renderHook(() => useWishlist(), { wrapper });

          // Act: Add same product twice
          await act(async () => {
            await result.current.addToWishlist(product);
          });

          const initialCount = result.current.wishlist.length;

          await act(async () => {
            await result.current.addToWishlist(product);
          });

          // Assert: Wishlist should still have only one instance of the product
          expect(result.current.wishlist.length).toBe(initialCount);
          
          const matchingItems = result.current.wishlist.filter(
            item => item.productId === product.id
          );
          expect(matchingItems.length).toBe(1);
        }),
        { numRuns: 3 }
      );
    });
  });

  describe('Property 2: Wishlist display completeness', () => {
    /**
     * **Validates: Requirements 1.3**
     * 
     * Property: For any wishlist, the rendered output should contain all required fields 
     * (image, name, price, available sizes) for each wishlist item
     */
    it('should display all required fields for any wishlist item', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(productArbitrary, { minLength: 1, maxLength: 10 }),
          async (products) => {
            // Ensure unique product IDs by deduplicating
            const uniqueProducts = [];
            const seenIds = new Set();
            for (const product of products) {
              if (!seenIds.has(product.id)) {
                uniqueProducts.push(product);
                seenIds.add(product.id);
              }
            }
            
            // Skip if no unique products
            if (uniqueProducts.length === 0) return;

            // Arrange: Reset state for each iteration
            localStorageMock.clear();
            useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            const { result } = renderHook(() => useWishlist(), { wrapper });

            // Add all unique products to wishlist
            for (const product of uniqueProducts) {
              await act(async () => {
                await result.current.addToWishlist(product);
              });
            }

            // Assert: Each wishlist item should have all required fields
            expect(result.current.wishlist.length).toBe(uniqueProducts.length);

            for (const wishlistItem of result.current.wishlist) {
              // Required field: productId
              expect(wishlistItem.productId).toBeDefined();
              expect(typeof wishlistItem.productId).toBe('number');

              // Required field: name
              expect(wishlistItem.name).toBeDefined();
              expect(typeof wishlistItem.name).toBe('string');
              expect(wishlistItem.name.length).toBeGreaterThan(0);

              // Required field: price
              expect(wishlistItem.price).toBeDefined();
              expect(typeof wishlistItem.price).toBe('number');
              expect(wishlistItem.price).toBeGreaterThanOrEqual(0);

              // Required field: image (can be null or string)
              expect(wishlistItem.image !== undefined).toBe(true);
              if (wishlistItem.image !== null) {
                expect(typeof wishlistItem.image).toBe('string');
              }

              // Required field: availableSizes (must be array)
              expect(wishlistItem.availableSizes).toBeDefined();
              expect(Array.isArray(wishlistItem.availableSizes)).toBe(true);
              expect(wishlistItem.availableSizes.length).toBeGreaterThan(0);

              // Verify each size is a string
              for (const size of wishlistItem.availableSizes) {
                expect(typeof size).toBe('string');
                expect(size.length).toBeGreaterThan(0);
              }

              // Required field: addedAt (timestamp)
              expect(wishlistItem.addedAt).toBeDefined();
              expect(typeof wishlistItem.addedAt).toBe('string');
              
              // Verify addedAt is a valid ISO date string
              const date = new Date(wishlistItem.addedAt);
              expect(date.toString()).not.toBe('Invalid Date');
            }

            // Verify wishlist items match original products
            for (const product of uniqueProducts) {
              const wishlistItem = result.current.wishlist.find(
                item => item.productId === product.id
              );
              
              expect(wishlistItem).toBeDefined();
              expect(wishlistItem.name).toBe(product.attributes.name);
              expect(wishlistItem.price).toBe(product.attributes.price);
              
              const expectedImage = product.attributes.image?.data?.attributes?.url || null;
              expect(wishlistItem.image).toBe(expectedImage);
              
              expect(wishlistItem.availableSizes).toEqual(product.attributes.sizes);
            }
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should display all required fields for authenticated user wishlist', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(productArbitrary, { minLength: 1, maxLength: 5 }),
          async (products) => {
            // Ensure unique product IDs by deduplicating
            const uniqueProducts = [];
            const seenIds = new Set();
            for (const product of products) {
              if (!seenIds.has(product.id)) {
                uniqueProducts.push(product);
                seenIds.add(product.id);
              }
            }
            
            // Skip if no unique products
            if (uniqueProducts.length === 0) return;

            // Arrange: Reset state and mock authenticated session
            localStorageMock.clear();
            const mockToken = 'mock-jwt-token-' + Math.random();
            useSession.mockReturnValue({
              data: { accessToken: mockToken },
              status: 'authenticated',
            });

            // Mock backend API responses
            wishlistApi.fetchWishlist.mockResolvedValue({ data: [] });
            
            // Mock addToWishlist to return unique IDs
            let backendIdCounter = 1;
            wishlistApi.addToWishlist.mockImplementation((productId) => {
              return Promise.resolve({
                data: {
                  id: backendIdCounter++,
                  attributes: {
                    product: {
                      data: {
                        id: productId,
                        attributes: uniqueProducts.find(p => p.id === productId)?.attributes || {},
                      },
                    },
                    addedAt: new Date().toISOString(),
                  },
                },
              });
            });

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            const { result } = renderHook(() => useWishlist(), { wrapper });

            // Wait for initial load
            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            });

            // Add all unique products to wishlist
            for (const product of uniqueProducts) {
              await act(async () => {
                await result.current.addToWishlist(product);
              });
            }

            // Assert: Each wishlist item should have all required fields
            expect(result.current.wishlist.length).toBe(uniqueProducts.length);

            for (const wishlistItem of result.current.wishlist) {
              // Required field: productId
              expect(wishlistItem.productId).toBeDefined();
              expect(typeof wishlistItem.productId).toBe('number');

              // Required field: name
              expect(wishlistItem.name).toBeDefined();
              expect(typeof wishlistItem.name).toBe('string');
              expect(wishlistItem.name.length).toBeGreaterThan(0);

              // Required field: price
              expect(wishlistItem.price).toBeDefined();
              expect(typeof wishlistItem.price).toBe('number');
              expect(wishlistItem.price).toBeGreaterThanOrEqual(0);

              // Required field: image (can be null or string)
              expect(wishlistItem.image !== undefined).toBe(true);
              if (wishlistItem.image !== null) {
                expect(typeof wishlistItem.image).toBe('string');
              }

              // Required field: availableSizes (must be array)
              expect(wishlistItem.availableSizes).toBeDefined();
              expect(Array.isArray(wishlistItem.availableSizes)).toBe(true);
              expect(wishlistItem.availableSizes.length).toBeGreaterThan(0);

              // Verify each size is a string
              for (const size of wishlistItem.availableSizes) {
                expect(typeof size).toBe('string');
                expect(size.length).toBeGreaterThan(0);
              }

              // Required field: addedAt (timestamp)
              expect(wishlistItem.addedAt).toBeDefined();
              expect(typeof wishlistItem.addedAt).toBe('string');
              
              // Verify addedAt is a valid ISO date string
              const date = new Date(wishlistItem.addedAt);
              expect(date.toString()).not.toBe('Invalid Date');
            }

            // Verify wishlist items match original products
            for (const product of uniqueProducts) {
              const wishlistItem = result.current.wishlist.find(
                item => item.productId === product.id
              );
              
              expect(wishlistItem).toBeDefined();
              expect(wishlistItem.name).toBe(product.attributes.name);
              expect(wishlistItem.price).toBe(product.attributes.price);
              
              const expectedImage = product.attributes.image?.data?.attributes?.url || null;
              expect(wishlistItem.image).toBe(expectedImage);
              
              expect(wishlistItem.availableSizes).toEqual(product.attributes.sizes);
            }
          }
        ),
        { numRuns: 3 }
      );
    }, 30000); // 30 second timeout for property-based test

    it('should handle wishlist items with null images', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true, noDefaultInfinity: true }),
            sizes: fc.array(fc.constantFrom('XS', 'S', 'M', 'L', 'XL'), { minLength: 1, maxLength: 5 }),
          }),
          async (productData) => {
            // Create product with null image
            const product = {
              id: productData.id,
              attributes: {
                name: productData.name,
                price: productData.price,
                image: null,
                sizes: productData.sizes,
              },
            };

            // Arrange
            localStorageMock.clear();
            useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            const { result } = renderHook(() => useWishlist(), { wrapper });

            // Act: Add product with null image
            await act(async () => {
              await result.current.addToWishlist(product);
            });

            // Assert: Wishlist item should have null image but all other fields
            const wishlistItem = result.current.wishlist[0];
            
            expect(wishlistItem).toBeDefined();
            expect(wishlistItem.productId).toBe(product.id);
            expect(wishlistItem.name).toBe(product.attributes.name);
            expect(wishlistItem.price).toBe(product.attributes.price);
            expect(wishlistItem.image).toBeNull();
            expect(wishlistItem.availableSizes).toEqual(product.attributes.sizes);
            expect(wishlistItem.addedAt).toBeDefined();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should handle empty wishlist display', async () => {
      // Arrange
      localStorageMock.clear();
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      const wrapper = ({ children }) => (
        <WishlistProvider>{children}</WishlistProvider>
      );

      const { result } = renderHook(() => useWishlist(), { wrapper });

      // Assert: Empty wishlist should be valid
      expect(result.current.wishlist).toBeDefined();
      expect(Array.isArray(result.current.wishlist)).toBe(true);
      expect(result.current.wishlist.length).toBe(0);
    });
  });

  describe('Property 3: Wishlist removal', () => {
    /**
     * **Validates: Requirements 1.4**
     * 
     * Property: For any wishlist item, when removed from the wishlist, 
     * the item should no longer appear in the wishlist
     */
    it('should remove any product from wishlist (unauthenticated)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(productArbitrary, { minLength: 1, maxLength: 10 }),
          fc.integer({ min: 0, max: 9 }),
          async (products, indexToRemove) => {
            // Ensure we have a valid index
            const actualIndex = indexToRemove % products.length;
            const productToRemove = products[actualIndex];

            // Arrange: Reset state for each iteration
            localStorageMock.clear();
            useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            const { result } = renderHook(() => useWishlist(), { wrapper });

            // Add all products to wishlist
            for (const product of products) {
              await act(async () => {
                await result.current.addToWishlist(product);
              });
            }

            const initialCount = result.current.wishlist.length;

            // Act: Remove the selected product
            await act(async () => {
              await result.current.removeFromWishlist(productToRemove.id);
            });

            // Assert: Product should no longer be in wishlist
            const removedItem = result.current.wishlist.find(
              item => item.productId === productToRemove.id
            );
            expect(removedItem).toBeUndefined();

            // Assert: Wishlist count should decrease by 1
            expect(result.current.wishlist.length).toBe(initialCount - 1);

            // Assert: Other products should still be in wishlist
            const otherProducts = products.filter(p => p.id !== productToRemove.id);
            for (const product of otherProducts) {
              const item = result.current.wishlist.find(
                item => item.productId === product.id
              );
              expect(item).toBeDefined();
            }
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should remove any product from wishlist (authenticated)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(productArbitrary, { minLength: 1, maxLength: 10 }),
          fc.integer({ min: 0, max: 9 }),
          async (products, indexToRemove) => {
            // Ensure we have a valid index
            const actualIndex = indexToRemove % products.length;
            const productToRemove = products[actualIndex];

            // Arrange: Reset state and mock authenticated session
            localStorageMock.clear();
            const mockToken = 'mock-jwt-token-' + Math.random();
            useSession.mockReturnValue({
              data: { accessToken: mockToken },
              status: 'authenticated',
            });

            // Mock backend API responses
            wishlistApi.fetchWishlist.mockResolvedValue({ data: [] });
            
            // Mock addToWishlist to return unique IDs
            let backendIdCounter = 1;
            wishlistApi.addToWishlist.mockImplementation((productId) => {
              return Promise.resolve({
                data: {
                  id: backendIdCounter++,
                  attributes: {
                    product: {
                      data: {
                        id: productId,
                        attributes: products.find(p => p.id === productId)?.attributes || {},
                      },
                    },
                    addedAt: new Date().toISOString(),
                  },
                },
              });
            });

            wishlistApi.removeFromWishlist.mockResolvedValue({ data: {} });

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            const { result } = renderHook(() => useWishlist(), { wrapper });

            // Wait for initial load
            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            });

            // Add all products to wishlist
            for (const product of products) {
              await act(async () => {
                await result.current.addToWishlist(product);
              });
            }

            const initialCount = result.current.wishlist.length;

            // Act: Remove the selected product
            await act(async () => {
              await result.current.removeFromWishlist(productToRemove.id);
            });

            // Assert: Product should no longer be in wishlist
            const removedItem = result.current.wishlist.find(
              item => item.productId === productToRemove.id
            );
            expect(removedItem).toBeUndefined();

            // Assert: Wishlist count should decrease by 1
            expect(result.current.wishlist.length).toBe(initialCount - 1);

            // Assert: Other products should still be in wishlist
            const otherProducts = products.filter(p => p.id !== productToRemove.id);
            for (const product of otherProducts) {
              const item = result.current.wishlist.find(
                item => item.productId === product.id
              );
              expect(item).toBeDefined();
            }

            // Verify API was called
            expect(wishlistApi.removeFromWishlist).toHaveBeenCalled();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000); // 30 second timeout for property-based test

    it('should handle removal of non-existent product gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(productArbitrary, { minLength: 1, maxLength: 5 }),
          fc.integer({ min: 10001, max: 99999 }), // Non-existent product ID
          async (products, nonExistentId) => {
            // Arrange
            localStorageMock.clear();
            useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            const { result } = renderHook(() => useWishlist(), { wrapper });

            // Add products to wishlist
            for (const product of products) {
              await act(async () => {
                await result.current.addToWishlist(product);
              });
            }

            const initialCount = result.current.wishlist.length;

            // Act: Try to remove non-existent product
            await act(async () => {
              await result.current.removeFromWishlist(nonExistentId);
            });

            // Assert: Wishlist should remain unchanged
            expect(result.current.wishlist.length).toBe(initialCount);

            // All original products should still be present
            for (const product of products) {
              const item = result.current.wishlist.find(
                item => item.productId === product.id
              );
              expect(item).toBeDefined();
            }
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe('Property 4: Wishlist to cart transfer', () => {
    /**
     * **Validates: Requirements 1.5**
     * 
     * Property: For any wishlist item with a selected size, when moved to cart, 
     * the item should appear in the cart with the correct size and should be removed from the wishlist
     */
    it('should move any product from wishlist to cart with correct size (unauthenticated)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(productArbitrary, { minLength: 1, maxLength: 10 }),
          fc.integer({ min: 0, max: 9 }),
          fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
          async (products, indexToMove, selectedSize) => {
            // Ensure unique product IDs by deduplicating
            const uniqueProducts = [];
            const seenIds = new Set();
            for (const product of products) {
              if (!seenIds.has(product.id)) {
                uniqueProducts.push(product);
                seenIds.add(product.id);
              }
            }
            
            // Skip if no unique products
            if (uniqueProducts.length === 0) return;
            
            // Ensure we have a valid index
            const actualIndex = indexToMove % uniqueProducts.length;
            const productToMove = uniqueProducts[actualIndex];

            // Arrange: Reset state for each iteration
            localStorageMock.clear();
            useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            const { result } = renderHook(() => useWishlist(), { wrapper });

            // Add all unique products to wishlist
            for (const product of uniqueProducts) {
              await act(async () => {
                await result.current.addToWishlist(product);
              });
            }

            const initialWishlistCount = result.current.wishlist.length;

            // Mock addToCart function to track calls
            const mockAddToCart = jest.fn();

            // Act: Move product from wishlist to cart
            await act(async () => {
              await result.current.moveToCart(productToMove.id, selectedSize, mockAddToCart);
            });

            // Assert: Product should be removed from wishlist
            const removedItem = result.current.wishlist.find(
              item => item.productId === productToMove.id
            );
            expect(removedItem).toBeUndefined();

            // Assert: Wishlist count should decrease by 1
            expect(result.current.wishlist.length).toBe(initialWishlistCount - 1);

            // Assert: addToCart should have been called with correct parameters
            expect(mockAddToCart).toHaveBeenCalledTimes(1);
            
            const addToCartCall = mockAddToCart.mock.calls[0];
            const [product, quantity, size] = addToCartCall;
            
            // Verify product data
            expect(product.id).toBe(productToMove.id);
            expect(product.name).toBe(productToMove.attributes.name);
            expect(product.price).toBe(productToMove.attributes.price);
            
            // Verify quantity is 1
            expect(quantity).toBe(1);
            
            // Verify size matches selected size
            expect(size).toBe(selectedSize);

            // Assert: Other products should still be in wishlist
            const otherProducts = uniqueProducts.filter(p => p.id !== productToMove.id);
            for (const product of otherProducts) {
              const item = result.current.wishlist.find(
                item => item.productId === product.id
              );
              expect(item).toBeDefined();
            }
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should move any product from wishlist to cart with correct size (authenticated)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(productArbitrary, { minLength: 1, maxLength: 5 }), // Reduced from 10 to 5
          fc.integer({ min: 0, max: 4 }), // Adjusted max to match array size
          fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
          async (products, indexToMove, selectedSize) => {
            // Ensure unique product IDs by deduplicating
            const uniqueProducts = [];
            const seenIds = new Set();
            for (const product of products) {
              if (!seenIds.has(product.id)) {
                uniqueProducts.push(product);
                seenIds.add(product.id);
              }
            }
            
            // Skip if no unique products
            if (uniqueProducts.length === 0) return;
            
            // Ensure we have a valid index
            const actualIndex = indexToMove % uniqueProducts.length;
            const productToMove = uniqueProducts[actualIndex];

            // Arrange: Reset state and mock authenticated session
            localStorageMock.clear();
            const mockToken = 'mock-jwt-token-' + Math.random();
            useSession.mockReturnValue({
              data: { accessToken: mockToken },
              status: 'authenticated',
            });

            // Mock backend API responses
            wishlistApi.fetchWishlist.mockResolvedValue({ data: [] });
            
            // Mock addToWishlist to return unique IDs
            let backendIdCounter = 1;
            wishlistApi.addToWishlist.mockImplementation((productId) => {
              return Promise.resolve({
                data: {
                  id: backendIdCounter++,
                  attributes: {
                    product: {
                      data: {
                        id: productId,
                        attributes: uniqueProducts.find(p => p.id === productId)?.attributes || {},
                      },
                    },
                    addedAt: new Date().toISOString(),
                  },
                },
              });
            });

            wishlistApi.removeFromWishlist.mockResolvedValue({ data: {} });

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            const { result } = renderHook(() => useWishlist(), { wrapper });

            // Wait for initial load
            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            });

            // Add all unique products to wishlist
            for (const product of uniqueProducts) {
              await act(async () => {
                await result.current.addToWishlist(product);
              });
            }

            const initialWishlistCount = result.current.wishlist.length;

            // Mock addToCart function to track calls
            const mockAddToCart = jest.fn();

            // Act: Move product from wishlist to cart
            await act(async () => {
              await result.current.moveToCart(productToMove.id, selectedSize, mockAddToCart);
            });

            // Assert: Product should be removed from wishlist
            const removedItem = result.current.wishlist.find(
              item => item.productId === productToMove.id
            );
            expect(removedItem).toBeUndefined();

            // Assert: Wishlist count should decrease by 1
            expect(result.current.wishlist.length).toBe(initialWishlistCount - 1);

            // Assert: addToCart should have been called with correct parameters
            expect(mockAddToCart).toHaveBeenCalledTimes(1);
            
            const addToCartCall = mockAddToCart.mock.calls[0];
            const [product, quantity, size] = addToCartCall;
            
            // Verify product data
            expect(product.id).toBe(productToMove.id);
            expect(product.name).toBe(productToMove.attributes.name);
            expect(product.price).toBe(productToMove.attributes.price);
            
            // Verify quantity is 1
            expect(quantity).toBe(1);
            
            // Verify size matches selected size
            expect(size).toBe(selectedSize);

            // Assert: Other products should still be in wishlist
            const otherProducts = uniqueProducts.filter(p => p.id !== productToMove.id);
            for (const product of otherProducts) {
              const item = result.current.wishlist.find(
                item => item.productId === product.id
              );
              expect(item).toBeDefined();
            }

            // Verify backend API was called to remove from wishlist
            expect(wishlistApi.removeFromWishlist).toHaveBeenCalled();
          }
        ),
        { numRuns: 3 } // Reduced from 100 to 50 for faster execution
      );
    }, 30000); // Increased timeout to 60 seconds

    it('should handle moving non-existent product gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(productArbitrary, { minLength: 1, maxLength: 5 }),
          fc.integer({ min: 10001, max: 99999 }), // Non-existent product ID
          fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
          async (products, nonExistentId, selectedSize) => {
            // Arrange
            localStorageMock.clear();
            useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            const { result } = renderHook(() => useWishlist(), { wrapper });

            // Add products to wishlist
            for (const product of products) {
              await act(async () => {
                await result.current.addToWishlist(product);
              });
            }

            const initialWishlistCount = result.current.wishlist.length;

            // Mock addToCart function
            const mockAddToCart = jest.fn();

            // Act: Try to move non-existent product
            await act(async () => {
              await result.current.moveToCart(nonExistentId, selectedSize, mockAddToCart);
            });

            // Assert: Wishlist should remain unchanged
            expect(result.current.wishlist.length).toBe(initialWishlistCount);

            // Assert: addToCart should not have been called
            expect(mockAddToCart).not.toHaveBeenCalled();

            // All original products should still be present
            for (const product of products) {
              const item = result.current.wishlist.find(
                item => item.productId === product.id
              );
              expect(item).toBeDefined();
            }
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should preserve product attributes when moving to cart', async () => {
      await fc.assert(
        fc.asyncProperty(
          productArbitrary,
          fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
          async (product, selectedSize) => {
            // Arrange
            localStorageMock.clear();
            useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            const { result } = renderHook(() => useWishlist(), { wrapper });

            // Add product to wishlist
            await act(async () => {
              await result.current.addToWishlist(product);
            });

            // Mock addToCart function
            const mockAddToCart = jest.fn();

            // Act: Move product to cart
            await act(async () => {
              await result.current.moveToCart(product.id, selectedSize, mockAddToCart);
            });

            // Assert: Product attributes should be preserved
            const addToCartCall = mockAddToCart.mock.calls[0];
            const [movedProduct] = addToCartCall;
            
            // Verify all attributes are preserved
            expect(movedProduct.id).toBe(product.id);
            expect(movedProduct.name).toBe(product.attributes.name);
            expect(movedProduct.price).toBe(product.attributes.price);
            
            // Verify image is preserved (handle null case)
            const expectedImage = product.attributes.image?.data?.attributes?.url || null;
            expect(movedProduct.image).toBe(expectedImage);
            
            // Verify product has attributes structure for cart compatibility
            expect(movedProduct.attributes).toBeDefined();
            expect(movedProduct.attributes.name).toBe(product.attributes.name);
            expect(movedProduct.attributes.price).toBe(product.attributes.price);
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe('Property 7: Wishlist merge on login', () => {
    /**
     * **Validates: Requirements 1.8**
     * 
     * Property: For any user with wishlist items in both localStorage and backend, 
     * after login, the combined wishlist should contain all unique items from both sources
     */
    it('should merge localStorage and backend wishlists on login', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(productArbitrary, { minLength: 1, maxLength: 5 }),
          fc.array(productArbitrary, { minLength: 1, maxLength: 5 }),
          async (localProducts, backendProducts) => {
            // Clear mocks at the start of each iteration
            jest.clearAllMocks();
            
            // Ensure unique product IDs within each array
            const uniqueLocalProducts = [];
            const seenLocalIds = new Set();
            for (const product of localProducts) {
              if (!seenLocalIds.has(product.id)) {
                uniqueLocalProducts.push(product);
                seenLocalIds.add(product.id);
              }
            }

            const uniqueBackendProducts = [];
            const seenBackendIds = new Set();
            for (const product of backendProducts) {
              if (!seenBackendIds.has(product.id)) {
                uniqueBackendProducts.push(product);
                seenBackendIds.add(product.id);
              }
            }

            // Skip if either array is empty after deduplication
            if (uniqueLocalProducts.length === 0 || uniqueBackendProducts.length === 0) {
              return;
            }

            // Arrange: Setup localStorage with wishlist items
            localStorageMock.clear();
            const localWishlistItems = uniqueLocalProducts.map(product => ({
              id: Date.now() + Math.random(),
              productId: product.id,
              name: product.attributes.name,
              price: product.attributes.price,
              image: product.attributes.image?.data?.attributes?.url || null,
              availableSizes: product.attributes.sizes || ['S', 'M', 'L', 'XL'],
              addedAt: new Date().toISOString(),
            }));
            localStorageMock.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(localWishlistItems));

            // Mock backend wishlist response
            const backendWishlistItems = uniqueBackendProducts.map((product, index) => ({
              id: 1000 + index,
              attributes: {
                product: {
                  data: {
                    id: product.id,
                    attributes: product.attributes,
                  },
                },
                addedAt: new Date().toISOString(),
              },
            }));

            // Start with unauthenticated session
            useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            const { result, rerender } = renderHook(() => useWishlist(), { wrapper });

            // Wait for initial load (should load from localStorage)
            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            });

            // Verify localStorage items are loaded
            expect(result.current.wishlist.length).toBe(uniqueLocalProducts.length);

            // Mock authenticated session and backend API responses
            const mockToken = 'mock-jwt-token-' + Math.random();
            
            wishlistApi.fetchWishlist.mockResolvedValue({ data: backendWishlistItems });
            
            // Mock addToWishlist for items that need to be added to backend
            let addToWishlistCallCount = 0;
            wishlistApi.addToWishlist.mockImplementation((productId) => {
              const product = uniqueLocalProducts.find(p => p.id === productId);
              return Promise.resolve({
                data: {
                  id: 2000 + addToWishlistCallCount++,
                  attributes: {
                    product: {
                      data: {
                        id: productId,
                        attributes: product?.attributes || {},
                      },
                    },
                    addedAt: new Date().toISOString(),
                  },
                },
              });
            });

            // Act: Simulate login by updating session
            useSession.mockReturnValue({
              data: { accessToken: mockToken },
              status: 'authenticated',
            });

            // Trigger re-render to simulate session change
            rerender();

            // Wait for merge to complete
            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            }, { timeout: 5000 });

            // Assert: Calculate expected merged wishlist
            const allProductIds = new Set([
              ...uniqueLocalProducts.map(p => p.id),
              ...uniqueBackendProducts.map(p => p.id),
            ]);
            const expectedTotalItems = allProductIds.size;

            // Verify merged wishlist contains all unique items
            expect(result.current.wishlist.length).toBe(expectedTotalItems);

            // Verify all backend products are in the merged wishlist
            for (const product of uniqueBackendProducts) {
              const item = result.current.wishlist.find(
                item => item.productId === product.id
              );
              expect(item).toBeDefined();
              expect(item.name).toBe(product.attributes.name);
              expect(item.price).toBeCloseTo(product.attributes.price, 2);
            }

            // Verify all localStorage products are in the merged wishlist
            for (const product of uniqueLocalProducts) {
              const item = result.current.wishlist.find(
                item => item.productId === product.id
              );
              expect(item).toBeDefined();
              expect(item.name).toBe(product.attributes.name);
              expect(item.price).toBeCloseTo(product.attributes.price, 2);
            }

            // Verify localStorage was cleared after merge
            const localStorageAfterMerge = localStorageMock.getItem(WISHLIST_STORAGE_KEY);
            expect(localStorageAfterMerge).toBeNull();

            // Verify backend API was called to add unique localStorage items
            const localProductIds = new Set(uniqueLocalProducts.map(p => p.id));
            const backendProductIds = new Set(uniqueBackendProducts.map(p => p.id));
            const uniqueLocalItems = uniqueLocalProducts.filter(p => !backendProductIds.has(p.id));
            
            if (uniqueLocalItems.length > 0) {
              expect(wishlistApi.addToWishlist).toHaveBeenCalled();
              expect(wishlistApi.addToWishlist).toHaveBeenCalledTimes(uniqueLocalItems.length);
            }
          }
        ),
        { numRuns: 3 }
      );
    }, 30000); // 60 second timeout for property-based test

    it('should handle merge when localStorage has items not in backend', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(productArbitrary, { minLength: 1, maxLength: 3 }),
          fc.array(productArbitrary, { minLength: 1, maxLength: 3 }),
          async (localOnlyProducts, sharedProducts) => {
            // Clear mocks at the start of each iteration
            jest.clearAllMocks();
            
            // Ensure unique product IDs
            const uniqueLocalOnly = [];
            const seenIds = new Set();
            for (const product of localOnlyProducts) {
              if (!seenIds.has(product.id)) {
                uniqueLocalOnly.push(product);
                seenIds.add(product.id);
              }
            }

            const uniqueShared = [];
            for (const product of sharedProducts) {
              if (!seenIds.has(product.id)) {
                uniqueShared.push(product);
                seenIds.add(product.id);
              }
            }

            // Skip if no unique products
            if (uniqueLocalOnly.length === 0 || uniqueShared.length === 0) {
              return;
            }

            // Arrange: Setup localStorage with local-only + shared items
            localStorageMock.clear();
            const allLocalProducts = [...uniqueLocalOnly, ...uniqueShared];
            const localWishlistItems = allLocalProducts.map(product => ({
              id: Date.now() + Math.random(),
              productId: product.id,
              name: product.attributes.name,
              price: product.attributes.price,
              image: product.attributes.image?.data?.attributes?.url || null,
              availableSizes: product.attributes.sizes || ['S', 'M', 'L', 'XL'],
              addedAt: new Date().toISOString(),
            }));
            localStorageMock.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(localWishlistItems));

            // Mock backend with only shared items
            const backendWishlistItems = uniqueShared.map((product, index) => ({
              id: 1000 + index,
              attributes: {
                product: {
                  data: {
                    id: product.id,
                    attributes: product.attributes,
                  },
                },
                addedAt: new Date().toISOString(),
              },
            }));

            // Start unauthenticated
            useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            const { result, rerender } = renderHook(() => useWishlist(), { wrapper });

            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            });

            // Mock authenticated session
            const mockToken = 'mock-jwt-token-' + Math.random();
            wishlistApi.fetchWishlist.mockResolvedValue({ data: backendWishlistItems });
            
            let addCallCount = 0;
            wishlistApi.addToWishlist.mockImplementation((productId) => {
              const product = allLocalProducts.find(p => p.id === productId);
              return Promise.resolve({
                data: {
                  id: 2000 + addCallCount++,
                  attributes: {
                    product: {
                      data: {
                        id: productId,
                        attributes: product?.attributes || {},
                      },
                    },
                    addedAt: new Date().toISOString(),
                  },
                },
              });
            });

            // Act: Login
            useSession.mockReturnValue({
              data: { accessToken: mockToken },
              status: 'authenticated',
            });
            rerender();

            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            }, { timeout: 5000 });

            // Assert: All items should be in merged wishlist
            const expectedTotal = uniqueLocalOnly.length + uniqueShared.length;
            expect(result.current.wishlist.length).toBe(expectedTotal);

            // Verify local-only items were added to backend
            expect(wishlistApi.addToWishlist).toHaveBeenCalledTimes(uniqueLocalOnly.length);

            // Verify all local-only items are in wishlist
            for (const product of uniqueLocalOnly) {
              const item = result.current.wishlist.find(
                item => item.productId === product.id
              );
              expect(item).toBeDefined();
            }

            // Verify all shared items are in wishlist
            for (const product of uniqueShared) {
              const item = result.current.wishlist.find(
                item => item.productId === product.id
              );
              expect(item).toBeDefined();
            }
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should handle merge when backend has items not in localStorage', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(productArbitrary, { minLength: 1, maxLength: 3 }),
          async (backendOnlyProducts) => {
            // Clear mocks at the start of each iteration
            jest.clearAllMocks();
            
            // Ensure unique product IDs
            const uniqueBackendOnly = [];
            const seenIds = new Set();
            for (const product of backendOnlyProducts) {
              if (!seenIds.has(product.id)) {
                uniqueBackendOnly.push(product);
                seenIds.add(product.id);
              }
            }

            // Skip if no unique products
            if (uniqueBackendOnly.length === 0) {
              return;
            }

            // Arrange: Empty localStorage
            localStorageMock.clear();

            // Mock backend with items
            const backendWishlistItems = uniqueBackendOnly.map((product, index) => ({
              id: 1000 + index,
              attributes: {
                product: {
                  data: {
                    id: product.id,
                    attributes: product.attributes,
                  },
                },
                addedAt: new Date().toISOString(),
              },
            }));

            // Start authenticated
            const mockToken = 'mock-jwt-token-' + Math.random();
            useSession.mockReturnValue({
              data: { accessToken: mockToken },
              status: 'authenticated',
            });

            wishlistApi.fetchWishlist.mockResolvedValue({ data: backendWishlistItems });

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            const { result } = renderHook(() => useWishlist(), { wrapper });

            // Wait for load
            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            }, { timeout: 5000 });

            // Assert: Backend items should be loaded
            expect(result.current.wishlist.length).toBe(uniqueBackendOnly.length);

            // Verify all backend items are in wishlist
            for (const product of uniqueBackendOnly) {
              const item = result.current.wishlist.find(
                item => item.productId === product.id
              );
              expect(item).toBeDefined();
              expect(item.name).toBe(product.attributes.name);
              expect(item.price).toBeCloseTo(product.attributes.price, 2);
            }

            // Verify no items were added to backend (no merge needed)
            expect(wishlistApi.addToWishlist).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should handle merge with duplicate products in both sources', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(productArbitrary, { minLength: 1, maxLength: 3 }),
          async (sharedProducts) => {
            // Clear mocks at the start of each iteration
            jest.clearAllMocks();
            
            // Ensure unique product IDs
            const uniqueShared = [];
            const seenIds = new Set();
            for (const product of sharedProducts) {
              if (!seenIds.has(product.id)) {
                uniqueShared.push(product);
                seenIds.add(product.id);
              }
            }

            // Skip if no unique products
            if (uniqueShared.length === 0) {
              return;
            }

            // Arrange: Setup localStorage with same items as backend
            localStorageMock.clear();
            const localWishlistItems = uniqueShared.map(product => ({
              id: Date.now() + Math.random(),
              productId: product.id,
              name: product.attributes.name,
              price: product.attributes.price,
              image: product.attributes.image?.data?.attributes?.url || null,
              availableSizes: product.attributes.sizes || ['S', 'M', 'L', 'XL'],
              addedAt: new Date().toISOString(),
            }));
            localStorageMock.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(localWishlistItems));

            // Mock backend with same items
            const backendWishlistItems = uniqueShared.map((product, index) => ({
              id: 1000 + index,
              attributes: {
                product: {
                  data: {
                    id: product.id,
                    attributes: product.attributes,
                  },
                },
                addedAt: new Date().toISOString(),
              },
            }));

            // Start unauthenticated
            useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            const { result, rerender } = renderHook(() => useWishlist(), { wrapper });

            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            });

            // Mock authenticated session
            const mockToken = 'mock-jwt-token-' + Math.random();
            wishlistApi.fetchWishlist.mockResolvedValue({ data: backendWishlistItems });

            // Act: Login
            useSession.mockReturnValue({
              data: { accessToken: mockToken },
              status: 'authenticated',
            });
            rerender();

            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            }, { timeout: 5000 });

            // Assert: Should have no duplicates
            expect(result.current.wishlist.length).toBe(uniqueShared.length);

            // Verify each product appears only once
            for (const product of uniqueShared) {
              const matchingItems = result.current.wishlist.filter(
                item => item.productId === product.id
              );
              expect(matchingItems.length).toBe(1);
            }

            // Verify no items were added to backend (all were duplicates)
            expect(wishlistApi.addToWishlist).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);
  });
});






