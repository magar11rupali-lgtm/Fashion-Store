/**
 * Preservation Property Tests - Wishlist Refresh Display Bug
 * Spec: wishlist-refresh-display-bug
 * Task 2: Write preservation property tests (BEFORE implementing fix)
 * 
 * CRITICAL: These tests MUST PASS on unfixed code
 * 
 * These tests verify that all NON-refresh wishlist operations continue to work correctly.
 * They establish a baseline of behavior that must be preserved after the fix is applied.
 * 
 * Property 2: Preservation - Existing Wishlist Operations
 * 
 * Tests cover:
 * - Adding new products to wishlist (Req 3.1)
 * - Unauthenticated users using localStorage (Req 3.2)
 * - Removing products from wishlist (Req 3.3)
 * - Merging localStorage with backend on login (Req 3.4)
 * - Error handling and fallback to localStorage (Req 3.5)
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { WishlistProvider, useWishlist } from '@/app/context/WishlistContext';
import { useSession } from 'next-auth/react';
import * as wishlistApi from '@/lib/wishlist';
import fc from 'fast-check';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('@/lib/wishlist');
jest.mock('@/hooks/useNotification', () => ({
  useNotification: () => ({
    showNotification: jest.fn(),
    removeNotification: jest.fn(),
    notifications: [],
  }),
}));

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
  image: fc.option(fc.constantFrom('/uploads/image1.png', '/uploads/image2.png', '/uploads/image3.jpg'), { nil: null }),
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

describe('Preservation Property Tests: Wishlist Operations (UNFIXED CODE)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Default mock for useSession (unauthenticated)
    useSession.mockReturnValue({ data: null, status: 'unauthenticated' });
  });

  describe('Property 2.1: Adding Products to Wishlist (Req 3.1)', () => {
    /**
     * **Validates: Requirements 3.1**
     * 
     * Property: For any product added to the wishlist, the system SHALL save the item
     * with complete product information including name, price, image, and sizes.
     * 
     * EXPECTED OUTCOME: Tests PASS on unfixed code (baseline behavior)
     */
    it('should add products with complete information (unauthenticated)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(productArbitrary, { minLength: 1, maxLength: 5 }),
          async (products) => {
            // Arrange
            localStorageMock.clear();
            useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            const { result } = renderHook(() => useWishlist(), { wrapper });

            // Act: Add all products to wishlist
            for (const product of products) {
              await act(async () => {
                await result.current.addToWishlist(product);
              });
            }

            // Assert: All products should be in wishlist with complete information
            for (const product of products) {
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
              expect(wishlistItem.availableSizes.length).toBeGreaterThan(0);
              
              // Timestamp should be present
              expect(wishlistItem.addedAt).toBeDefined();
            }

            // Verify localStorage was updated
            const stored = JSON.parse(localStorageMock.getItem(WISHLIST_STORAGE_KEY));
            expect(stored).toBeDefined();
            expect(stored.length).toBe(products.length);
          }
        ),
        { numRuns: 10 }
      );
    });


    it('should add products with complete information (authenticated)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(productArbitrary, { minLength: 1, maxLength: 5 }),
          async (products) => {
            // Clear mocks at the start of each iteration
            jest.clearAllMocks();
            
            // Arrange
            localStorageMock.clear();
            const mockToken = 'test-jwt-token-' + Math.random();
            useSession.mockReturnValue({
              data: { accessToken: mockToken },
              status: 'authenticated',
            });

            // Mock backend responses
            wishlistApi.fetchWishlist.mockResolvedValue({ data: [] });
            
            let backendIdCounter = 1;
            wishlistApi.addToWishlist.mockImplementation((productId) => {
              const product = products.find(p => p.id === productId);
              return Promise.resolve({
                data: {
                  id: backendIdCounter++,
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

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            const { result } = renderHook(() => useWishlist(), { wrapper });

            // Wait for initial load
            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            });

            // Act: Add all products to wishlist
            for (const product of products) {
              await act(async () => {
                await result.current.addToWishlist(product);
              });
            }

            // Assert: All products should be in wishlist with complete information
            for (const product of products) {
              const wishlistItem = result.current.wishlist.find(
                item => item.productId === product.id
              );

              expect(wishlistItem).toBeDefined();
              expect(wishlistItem.productId).toBe(product.id);
              expect(wishlistItem.name).toBe(product.attributes.name);
              expect(wishlistItem.price).toBe(product.attributes.price);
              
              const expectedImage = product.attributes.image?.data?.attributes?.url || null;
              expect(wishlistItem.image).toBe(expectedImage);
              
              expect(wishlistItem.availableSizes).toBeDefined();
              expect(Array.isArray(wishlistItem.availableSizes)).toBe(true);
              expect(wishlistItem.availableSizes.length).toBeGreaterThan(0);
              
              expect(wishlistItem.addedAt).toBeDefined();
            }

            // Verify backend API was called
            expect(wishlistApi.addToWishlist).toHaveBeenCalledTimes(products.length);
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);
  });


  describe('Property 2.2: LocalStorage Operations (Req 3.2)', () => {
    /**
     * **Validates: Requirements 3.2**
     * 
     * Property: For any unauthenticated user, wishlist items SHALL be loaded from
     * localStorage with all product details intact (name, price, image, sizes).
     * 
     * EXPECTED OUTCOME: Tests PASS on unfixed code (baseline behavior)
     */
    it('should load wishlist from localStorage with all details intact', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(productArbitrary, { minLength: 1, maxLength: 5 }),
          async (products) => {
            // Arrange: Pre-populate localStorage with wishlist items
            localStorageMock.clear();
            const localWishlistItems = products.map(product => ({
              id: Date.now() + Math.random(),
              productId: product.id,
              name: product.attributes.name,
              price: product.attributes.price,
              image: product.attributes.image?.data?.attributes?.url || null,
              availableSizes: product.attributes.sizes,
              addedAt: new Date().toISOString(),
            }));
            localStorageMock.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(localWishlistItems));

            useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            // Act: Render hook (should load from localStorage)
            const { result } = renderHook(() => useWishlist(), { wrapper });

            // Wait for initial load
            await waitFor(() => {
              expect(result.current.wishlist.length).toBe(products.length);
            });

            // Assert: All items should be loaded with complete details
            for (let i = 0; i < products.length; i++) {
              const product = products[i];
              const wishlistItem = result.current.wishlist.find(
                item => item.productId === product.id
              );

              expect(wishlistItem).toBeDefined();
              expect(wishlistItem.name).toBe(product.attributes.name);
              expect(wishlistItem.price).toBe(product.attributes.price);
              
              const expectedImage = product.attributes.image?.data?.attributes?.url || null;
              expect(wishlistItem.image).toBe(expectedImage);
              
              expect(wishlistItem.availableSizes).toEqual(product.attributes.sizes);
              expect(wishlistItem.addedAt).toBeDefined();
            }
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should persist wishlist changes to localStorage', async () => {
      await fc.assert(
        fc.asyncProperty(
          productArbitrary,
          async (product) => {
            // Arrange
            localStorageMock.clear();
            useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            const { result } = renderHook(() => useWishlist(), { wrapper });

            // Act: Add product
            await act(async () => {
              await result.current.addToWishlist(product);
            });

            // Assert: localStorage should be updated
            const stored = JSON.parse(localStorageMock.getItem(WISHLIST_STORAGE_KEY));
            expect(stored).toBeDefined();
            expect(stored.length).toBe(1);
            expect(stored[0].productId).toBe(product.id);
            expect(stored[0].name).toBe(product.attributes.name);
            expect(stored[0].price).toBe(product.attributes.price);

            // Act: Remove product
            await act(async () => {
              await result.current.removeFromWishlist(product.id);
            });

            // Assert: localStorage should be updated
            const storedAfterRemoval = JSON.parse(localStorageMock.getItem(WISHLIST_STORAGE_KEY));
            expect(storedAfterRemoval).toBeDefined();
            expect(storedAfterRemoval.length).toBe(0);
          }
        ),
        { numRuns: 10 }
      );
    });
  });


  describe('Property 2.3: Removing Products (Req 3.3)', () => {
    /**
     * **Validates: Requirements 3.3**
     * 
     * Property: For any wishlist item, when removed, the item SHALL no longer appear
     * in the wishlist and SHALL be removed from both backend and localStorage.
     * 
     * EXPECTED OUTCOME: Tests PASS on unfixed code (baseline behavior)
     */
    it('should remove products correctly (unauthenticated)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(productArbitrary, { minLength: 2, maxLength: 5 }),
          fc.integer({ min: 0, max: 4 }),
          async (products, indexToRemove) => {
            // Ensure unique product IDs
            const uniqueProducts = [];
            const seenIds = new Set();
            for (const product of products) {
              if (!seenIds.has(product.id)) {
                uniqueProducts.push(product);
                seenIds.add(product.id);
              }
            }
            
            if (uniqueProducts.length < 2) return;

            const actualIndex = indexToRemove % uniqueProducts.length;
            const productToRemove = uniqueProducts[actualIndex];

            // Arrange
            localStorageMock.clear();
            useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            const { result } = renderHook(() => useWishlist(), { wrapper });

            // Add all products
            for (const product of uniqueProducts) {
              await act(async () => {
                await result.current.addToWishlist(product);
              });
            }

            const initialCount = result.current.wishlist.length;

            // Act: Remove selected product
            await act(async () => {
              await result.current.removeFromWishlist(productToRemove.id);
            });

            // Assert: Product should be removed
            const removedItem = result.current.wishlist.find(
              item => item.productId === productToRemove.id
            );
            expect(removedItem).toBeUndefined();
            expect(result.current.wishlist.length).toBe(initialCount - 1);

            // Assert: Other products should remain
            const otherProducts = uniqueProducts.filter(p => p.id !== productToRemove.id);
            for (const product of otherProducts) {
              const item = result.current.wishlist.find(
                item => item.productId === product.id
              );
              expect(item).toBeDefined();
            }

            // Assert: localStorage should be updated
            const stored = JSON.parse(localStorageMock.getItem(WISHLIST_STORAGE_KEY));
            expect(stored.length).toBe(initialCount - 1);
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should remove products correctly (authenticated)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(productArbitrary, { minLength: 2, maxLength: 5 }),
          fc.integer({ min: 0, max: 4 }),
          async (products, indexToRemove) => {
            // Ensure unique product IDs
            const uniqueProducts = [];
            const seenIds = new Set();
            for (const product of products) {
              if (!seenIds.has(product.id)) {
                uniqueProducts.push(product);
                seenIds.add(product.id);
              }
            }
            
            if (uniqueProducts.length < 2) return;

            const actualIndex = indexToRemove % uniqueProducts.length;
            const productToRemove = uniqueProducts[actualIndex];

            // Arrange
            localStorageMock.clear();
            const mockToken = 'test-jwt-token-' + Math.random();
            useSession.mockReturnValue({
              data: { accessToken: mockToken },
              status: 'authenticated',
            });

            wishlistApi.fetchWishlist.mockResolvedValue({ data: [] });
            
            let backendIdCounter = 1;
            wishlistApi.addToWishlist.mockImplementation((productId) => {
              const product = uniqueProducts.find(p => p.id === productId);
              return Promise.resolve({
                data: {
                  id: backendIdCounter++,
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

            wishlistApi.removeFromWishlist.mockResolvedValue({ data: {} });

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            const { result } = renderHook(() => useWishlist(), { wrapper });

            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            });

            // Add all products
            for (const product of uniqueProducts) {
              await act(async () => {
                await result.current.addToWishlist(product);
              });
            }

            const initialCount = result.current.wishlist.length;

            // Act: Remove selected product
            await act(async () => {
              await result.current.removeFromWishlist(productToRemove.id);
            });

            // Assert: Product should be removed
            const removedItem = result.current.wishlist.find(
              item => item.productId === productToRemove.id
            );
            expect(removedItem).toBeUndefined();
            expect(result.current.wishlist.length).toBe(initialCount - 1);

            // Assert: Backend API was called
            expect(wishlistApi.removeFromWishlist).toHaveBeenCalled();

            // Assert: Other products should remain
            const otherProducts = uniqueProducts.filter(p => p.id !== productToRemove.id);
            for (const product of otherProducts) {
              const item = result.current.wishlist.find(
                item => item.productId === product.id
              );
              expect(item).toBeDefined();
            }
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);
  });


  describe('Property 2.4: Merging LocalStorage with Backend (Req 3.4)', () => {
    /**
     * **Validates: Requirements 3.4**
     * 
     * Property: For any user with items in localStorage who logs in, the system SHALL
     * merge localStorage wishlist items with backend wishlist items, preserving all
     * unique items from both sources.
     * 
     * EXPECTED OUTCOME: Tests PASS on unfixed code (baseline behavior)
     */
    it('should merge localStorage and backend wishlists on login', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(productArbitrary, { minLength: 1, maxLength: 3 }),
          fc.array(productArbitrary, { minLength: 1, maxLength: 3 }),
          async (localProducts, backendProducts) => {
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
              availableSizes: product.attributes.sizes,
              addedAt: new Date().toISOString(),
            }));
            localStorageMock.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(localWishlistItems));

            // Mock backend wishlist response
            const backendWishlistItems = uniqueBackendProducts.map((product, index) => ({
              id: 1000 + index,
              productId: product.id,
              name: product.attributes.name,
              price: product.attributes.price,
              image: product.attributes.image?.data?.attributes?.url || null,
              availableSizes: product.attributes.sizes,
              addedAt: new Date().toISOString(),
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

            // Verify localStorage items are loaded
            expect(result.current.wishlist.length).toBe(uniqueLocalProducts.length);

            // Mock authenticated session
            const mockToken = 'test-jwt-token-' + Math.random();
            
            wishlistApi.fetchWishlist.mockResolvedValue({ data: backendWishlistItems });
            
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

            // Act: Simulate login
            useSession.mockReturnValue({
              data: { accessToken: mockToken },
              status: 'authenticated',
            });
            rerender();

            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            }, { timeout: 5000 });

            // Assert: Calculate expected merged wishlist
            const allProductIds = new Set([
              ...uniqueLocalProducts.map(p => p.id),
              ...uniqueBackendProducts.map(p => p.id),
            ]);
            const expectedTotalItems = allProductIds.size;

            expect(result.current.wishlist.length).toBe(expectedTotalItems);

            // Verify all backend products are in merged wishlist
            for (const product of uniqueBackendProducts) {
              const item = result.current.wishlist.find(
                item => item.productId === product.id
              );
              expect(item).toBeDefined();
              expect(item.name).toBe(product.attributes.name);
            }

            // Verify all localStorage products are in merged wishlist
            for (const product of uniqueLocalProducts) {
              const item = result.current.wishlist.find(
                item => item.productId === product.id
              );
              expect(item).toBeDefined();
              expect(item.name).toBe(product.attributes.name);
            }

            // Verify localStorage was cleared after merge
            const localStorageAfterMerge = localStorageMock.getItem(WISHLIST_STORAGE_KEY);
            expect(localStorageAfterMerge).toBeNull();
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);
  });


  describe('Property 2.5: Error Handling and Fallback (Req 3.5)', () => {
    /**
     * **Validates: Requirements 3.5**
     * 
     * Property: When the backend API returns an error during wishlist fetch, the system
     * SHALL fall back to localStorage and display appropriate error handling.
     * 
     * EXPECTED OUTCOME: Tests PASS on unfixed code (baseline behavior)
     */
    it('should fallback to localStorage when backend fetch fails', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(productArbitrary, { minLength: 1, maxLength: 3 }),
          async (products) => {
            // Ensure unique product IDs
            const uniqueProducts = [];
            const seenIds = new Set();
            for (const product of products) {
              if (!seenIds.has(product.id)) {
                uniqueProducts.push(product);
                seenIds.add(product.id);
              }
            }
            
            if (uniqueProducts.length === 0) return;

            // Arrange: Setup localStorage with wishlist items
            localStorageMock.clear();
            const localWishlistItems = uniqueProducts.map(product => ({
              id: Date.now() + Math.random(),
              productId: product.id,
              name: product.attributes.name,
              price: product.attributes.price,
              image: product.attributes.image?.data?.attributes?.url || null,
              availableSizes: product.attributes.sizes,
              addedAt: new Date().toISOString(),
            }));
            localStorageMock.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(localWishlistItems));

            // Mock authenticated session
            const mockToken = 'test-jwt-token-' + Math.random();
            useSession.mockReturnValue({
              data: { accessToken: mockToken },
              status: 'authenticated',
            });

            // Mock backend to return error
            const backendError = new Error('Network error');
            backendError.status = 500;
            wishlistApi.fetchWishlist.mockRejectedValue(backendError);

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            // Act: Render hook (should fallback to localStorage)
            const { result } = renderHook(() => useWishlist(), { wrapper });

            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            }, { timeout: 5000 });

            // Assert: Should load from localStorage despite backend error
            expect(result.current.wishlist.length).toBe(uniqueProducts.length);

            // Verify all items from localStorage are loaded
            for (const product of uniqueProducts) {
              const item = result.current.wishlist.find(
                item => item.productId === product.id
              );
              expect(item).toBeDefined();
              expect(item.name).toBe(product.attributes.name);
              expect(item.price).toBe(product.attributes.price);
            }

            // Verify backend was called (and failed)
            expect(wishlistApi.fetchWishlist).toHaveBeenCalledWith(mockToken);
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);

    it('should handle backend add failure gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          productArbitrary,
          async (product) => {
            // Arrange
            localStorageMock.clear();
            const mockToken = 'test-jwt-token-' + Math.random();
            useSession.mockReturnValue({
              data: { accessToken: mockToken },
              status: 'authenticated',
            });

            wishlistApi.fetchWishlist.mockResolvedValue({ data: [] });
            
            // Mock backend to return error on add
            const addError = new Error('Failed to add to wishlist');
            addError.status = 500;
            wishlistApi.addToWishlist.mockRejectedValue(addError);

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            const { result } = renderHook(() => useWishlist(), { wrapper });

            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            });

            // Act: Try to add product (should fail)
            let errorThrown = false;
            try {
              await act(async () => {
                await result.current.addToWishlist(product);
              });
            } catch (error) {
              errorThrown = true;
            }

            // Assert: Error should be thrown
            expect(errorThrown).toBe(true);

            // Assert: Wishlist should remain empty (add failed)
            expect(result.current.wishlist.length).toBe(0);

            // Verify backend was called
            expect(wishlistApi.addToWishlist).toHaveBeenCalledWith(product.id, mockToken);
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);

    it('should handle backend remove failure gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          productArbitrary,
          async (product) => {
            // Arrange
            localStorageMock.clear();
            const mockToken = 'test-jwt-token-' + Math.random();
            useSession.mockReturnValue({
              data: { accessToken: mockToken },
              status: 'authenticated',
            });

            // Mock successful add
            const mockWishlistItem = {
              id: 1,
              productId: product.id,
              name: product.attributes.name,
              price: product.attributes.price,
              image: product.attributes.image?.data?.attributes?.url || null,
              availableSizes: product.attributes.sizes,
              addedAt: new Date().toISOString(),
            };

            wishlistApi.fetchWishlist.mockResolvedValue({ data: [mockWishlistItem] });
            
            // Mock backend to return error on remove
            const removeError = new Error('Failed to remove from wishlist');
            removeError.status = 500;
            wishlistApi.removeFromWishlist.mockRejectedValue(removeError);

            const wrapper = ({ children }) => (
              <WishlistProvider>{children}</WishlistProvider>
            );

            const { result } = renderHook(() => useWishlist(), { wrapper });

            await waitFor(() => {
              expect(result.current.isLoading).toBe(false);
            });

            // Verify item is loaded
            expect(result.current.wishlist.length).toBe(1);

            // Act: Try to remove product (should fail)
            let errorThrown = false;
            try {
              await act(async () => {
                await result.current.removeFromWishlist(product.id);
              });
            } catch (error) {
              errorThrown = true;
            }

            // Assert: Error should be thrown
            expect(errorThrown).toBe(true);

            // Assert: Item should still be in wishlist (remove failed)
            expect(result.current.wishlist.length).toBe(1);

            // Verify backend was called
            expect(wishlistApi.removeFromWishlist).toHaveBeenCalled();
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);
  });
});
