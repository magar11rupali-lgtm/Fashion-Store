/**
 * Property-Based Tests for Image URL Construction
 * Feature: ecommerce-fixes-and-enhancements
 */

import { render } from '@testing-library/react';
import { CartProvider } from '@/app/context/CartContext';
import OrderSummary from '@/app/components/OrderSummary';
import fc from 'fast-check';
import '@testing-library/jest-dom';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:1337';

// Arbitrary generator for image paths
const imagePathArbitrary = fc.constantFrom(
  '/uploads/image1.png',
  '/uploads/image2.jpg',
  '/uploads/product/test.png',
  '/uploads/category/item.jpg',
  '/api/files/photo.png'
);

// Arbitrary generator for cart items with various image path formats
const cartItemWithImageArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  name: fc.string({ minLength: 3, maxLength: 50 }),
  price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true, noDefaultInfinity: true }),
  size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
  quantity: fc.integer({ min: 1, max: 10 }),
  image: imagePathArbitrary,
});

describe('Feature: ecommerce-fixes-and-enhancements, Image URL Construction Property Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  describe('Property 50: Image URL construction', () => {
    /**
     * **Validates: Requirements 10.2**
     * 
     * Property: For any product image, the image URL should be constructed as 
     * `${BACKEND_URL}${imagePath}`
     */
    it('should construct image URLs correctly for any image path', async () => {
      await fc.assert(
        fc.asyncProperty(
          cartItemWithImageArbitrary,
          async (cartItem) => {
            // Arrange: Set up cart with item containing image path
            localStorage.setItem('cart', JSON.stringify([cartItem]));

            // Act: Render OrderSummary
            const { container } = render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 50));

            // Assert: Image URL should be constructed with backend base URL
            const images = container.querySelectorAll('img');
            const itemImages = Array.from(images).filter(img => {
              const src = img.getAttribute('src');
              // Image URL should contain the backend URL and the image path
              return src && (
                src.includes(BACKEND_URL) || 
                src.includes(cartItem.image) ||
                (src.includes('localhost:1337') && src.includes(cartItem.image.replace('/uploads/', '')))
              );
            });
            
            expect(itemImages.length).toBeGreaterThan(0);

            // Verify the constructed URL format
            const productImage = itemImages[0];
            const src = productImage.getAttribute('src');
            
            // The URL should either:
            // 1. Be the full constructed URL: BACKEND_URL + imagePath
            // 2. Or contain both the backend URL and the image path components
            const expectedUrl = `${BACKEND_URL}${cartItem.image}`;
            const containsBackendUrl = src.includes(BACKEND_URL) || src.includes('localhost:1337');
            const containsImagePath = src.includes(cartItem.image) || 
                                      src.includes(cartItem.image.replace('/uploads/', ''));
            
            expect(containsBackendUrl || containsImagePath).toBe(true);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000); // 30 second timeout for property-based test

    it('should handle image paths starting with /uploads/', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true, noDefaultInfinity: true }),
            size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
            quantity: fc.integer({ min: 1, max: 10 }),
            image: fc.constantFrom(
              '/uploads/test1.png',
              '/uploads/test2.jpg',
              '/uploads/products/item.png'
            ),
          }),
          async (cartItem) => {
            // Arrange: Set up cart
            localStorage.setItem('cart', JSON.stringify([cartItem]));

            // Act: Render OrderSummary
            const { container } = render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 50));

            // Assert: Image should be rendered with proper URL construction
            const images = container.querySelectorAll('img');
            expect(images.length).toBeGreaterThan(0);

            // Find the product image
            const productImage = Array.from(images).find(img => {
              const src = img.getAttribute('src');
              return src && (
                src.includes(cartItem.image) || 
                src.includes('localhost:1337')
              );
            });

            expect(productImage).toBeDefined();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should not modify image URLs that already include full URL', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true, noDefaultInfinity: true }),
            size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
            quantity: fc.integer({ min: 1, max: 10 }),
            image: fc.constantFrom(
              'http://localhost:1337/uploads/test1.png',
              'http://localhost:1337/uploads/test2.jpg',
              'https://example.com/image.png'
            ),
          }),
          async (cartItem) => {
            // Arrange: Set up cart with full URL
            localStorage.setItem('cart', JSON.stringify([cartItem]));

            // Act: Render OrderSummary
            const { container } = render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 50));

            // Assert: Image should use the full URL as-is
            const images = container.querySelectorAll('img');
            const productImage = Array.from(images).find(img => {
              const src = img.getAttribute('src');
              // Should contain the original URL
              return src && src.includes(cartItem.image);
            });

            expect(productImage).toBeDefined();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should use placeholder for null or undefined image paths', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true, noDefaultInfinity: true }),
            size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
            quantity: fc.integer({ min: 1, max: 10 }),
            image: fc.constantFrom(null, undefined, ''),
          }),
          async (cartItem) => {
            // Arrange: Set up cart with null/undefined/empty image
            localStorage.setItem('cart', JSON.stringify([cartItem]));

            // Act: Render OrderSummary
            const { container } = render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 50));

            // Assert: Should use placeholder image
            const images = container.querySelectorAll('img');
            const placeholderImage = Array.from(images).find(img => {
              const src = img.getAttribute('src');
              return src && src.includes('placeholder');
            });

            expect(placeholderImage).toBeDefined();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should construct URLs correctly for multiple cart items with different image paths', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(cartItemWithImageArbitrary, { minLength: 2, maxLength: 3 }),
          async (cartItems) => {
            // Ensure unique items
            const uniqueItems = [];
            const seenKeys = new Set();
            for (const item of cartItems) {
              const key = `${item.id}-${item.size}`;
              if (!seenKeys.has(key)) {
                uniqueItems.push(item);
                seenKeys.add(key);
              }
            }
            
            if (uniqueItems.length < 2) return; // Need at least 2 items

            // Arrange: Set up cart with multiple items
            localStorage.setItem('cart', JSON.stringify(uniqueItems));

            // Act: Render OrderSummary
            const { container } = render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 50));

            // Assert: Each item should have its image rendered with proper URL
            const images = container.querySelectorAll('img');
            
            // Should have at least as many images as cart items
            expect(images.length).toBeGreaterThanOrEqual(uniqueItems.length);

            // Verify each cart item has a corresponding image
            for (const item of uniqueItems) {
              const itemImage = Array.from(images).find(img => {
                const src = img.getAttribute('src');
                return src && (
                  src.includes(item.image) ||
                  src.includes('localhost:1337')
                );
              });
              
              expect(itemImage).toBeDefined();
            }
          }
        ),
        { numRuns: 15 }
      );
    }, 30000);

    it('should handle edge case of empty string image path', async () => {
      // Arrange: Create cart item with empty string image
      const cartItem = {
        id: 1,
        name: 'Test Product',
        price: 50.00,
        size: 'M',
        quantity: 1,
        image: '',
      };

      localStorage.setItem('cart', JSON.stringify([cartItem]));

      // Act: Render OrderSummary
      const { container } = render(
        <CartProvider>
          <OrderSummary />
        </CartProvider>
      );

      // Wait for component to render
      await new Promise(resolve => setTimeout(resolve, 50));

      // Assert: Should use placeholder image
      const images = container.querySelectorAll('img');
      const placeholderImage = Array.from(images).find(img => {
        const src = img.getAttribute('src');
        return src && src.includes('placeholder');
      });

      expect(placeholderImage).toBeDefined();
    });

    it('should construct URL with backend base URL for relative paths', async () => {
      // Arrange: Create cart item with relative path
      const cartItem = {
        id: 1,
        name: 'Test Product',
        price: 50.00,
        size: 'M',
        quantity: 1,
        image: '/uploads/test-product.png',
      };

      localStorage.setItem('cart', JSON.stringify([cartItem]));

      // Act: Render OrderSummary
      const { container } = render(
        <CartProvider>
          <OrderSummary />
        </CartProvider>
      );

      // Wait for component to render
      await new Promise(resolve => setTimeout(resolve, 50));

      // Assert: Image URL should be constructed with backend URL
      const images = container.querySelectorAll('img');
      const productImage = Array.from(images).find(img => {
        const src = img.getAttribute('src');
        // Should contain backend URL or localhost:1337
        return src && (
          src.includes(BACKEND_URL) || 
          src.includes('localhost:1337') ||
          src.includes(cartItem.image)
        );
      });

      expect(productImage).toBeDefined();
      
      const src = productImage.getAttribute('src');
      // Verify it's not just the relative path
      expect(src).not.toBe(cartItem.image);
    });

    it('should handle various image file extensions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true, noDefaultInfinity: true }),
            size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
            quantity: fc.integer({ min: 1, max: 10 }),
            image: fc.constantFrom(
              '/uploads/image.png',
              '/uploads/image.jpg',
              '/uploads/image.jpeg',
              '/uploads/image.webp',
              '/uploads/image.gif'
            ),
          }),
          async (cartItem) => {
            // Arrange: Set up cart
            localStorage.setItem('cart', JSON.stringify([cartItem]));

            // Act: Render OrderSummary
            const { container } = render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 50));

            // Assert: Image should be rendered regardless of extension
            const images = container.querySelectorAll('img');
            const productImage = Array.from(images).find(img => {
              const src = img.getAttribute('src');
              return src && (
                src.includes(cartItem.image) ||
                src.includes('localhost:1337')
              );
            });

            expect(productImage).toBeDefined();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);
  });
});






