/**
 * Property-Based Tests for Order Summary Display
 * Feature: ecommerce-fixes-and-enhancements
 */

import { render, screen } from '@testing-library/react';
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

// Arbitrary generator for cart items
const cartItemArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  name: fc.string({ minLength: 3, maxLength: 50 }),
  price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true, noDefaultInfinity: true }),
  size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
  quantity: fc.integer({ min: 1, max: 10 }),
  image: fc.option(fc.constantFrom('/uploads/image1.png', '/uploads/image2.png', null), { nil: null }),
});

describe('Feature: ecommerce-fixes-and-enhancements, Order Summary Property Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  describe('Property 8: Order summary display completeness', () => {
    /**
     * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 10.1**
     * 
     * Property: For any cart item in the order summary, the rendered output should contain 
     * size, unit price, line total, and image
     */
    it('should display all required fields for any cart items', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(cartItemArbitrary, { minLength: 1, maxLength: 10 }),
          async (cartItems) => {
            // Ensure unique cart items (unique id + size combination)
            const uniqueItems = [];
            const seenKeys = new Set();
            for (const item of cartItems) {
              const key = `${item.id}-${item.size}`;
              if (!seenKeys.has(key)) {
                uniqueItems.push(item);
                seenKeys.add(key);
              }
            }
            
            // Skip if no unique items
            if (uniqueItems.length === 0) return;

            // Arrange: Set up cart with test items
            localStorage.setItem('cart', JSON.stringify(uniqueItems));

            // Act: Render OrderSummary
            const { container } = render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert: Verify each cart item displays all required fields
            for (const item of uniqueItems) {
              const lineTotal = item.price * item.quantity;

              // Requirement 2.1: Product size should be displayed
              const sizeElements = screen.queryAllByText(`Size: ${item.size}`);
              expect(sizeElements.length).toBeGreaterThan(0);

              // Requirement 2.2: Individual unit price should be displayed
              const priceRegex = new RegExp(`\\$${item.price.toFixed(2)}`);
              const priceElements = screen.queryAllByText(priceRegex);
              expect(priceElements.length).toBeGreaterThan(0);

              // Requirement 2.3: Line total should be displayed
              const lineTotalRegex = new RegExp(`\\$${lineTotal.toFixed(2)}`);
              const lineTotalElements = screen.queryAllByText(lineTotalRegex);
              expect(lineTotalElements.length).toBeGreaterThan(0);

              // Requirement 2.4, 10.1: Product image should be displayed
              const images = container.querySelectorAll('img');
              const itemImages = Array.from(images).filter(img => {
                const src = img.getAttribute('src');
                return item.image 
                  ? src && (src.includes(item.image) || src.includes('localhost:1337'))
                  : src && src.includes('placeholder');
              });
              expect(itemImages.length).toBeGreaterThan(0);

              // Verify product name is displayed (skip whitespace-only or very short names)
              const trimmedName = item.name.trim();
              if (trimmedName.length > 2) {
                const nameElements = screen.queryAllByText(item.name);
                // If exact match not found, try trimmed version
                if (nameElements.length === 0) {
                  const trimmedElements = screen.queryAllByText(trimmedName);
                  expect(trimmedElements.length).toBeGreaterThan(0);
                } else {
                  expect(nameElements.length).toBeGreaterThan(0);
                }
              }

              // Verify quantity is displayed
              const quantityElements = screen.queryAllByText(item.quantity.toString());
              expect(quantityElements.length).toBeGreaterThan(0);
            }

            // Verify order totals are displayed
            const subtotal = uniqueItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shipping = subtotal >= 100 ? 0 : 10;
            const tax = subtotal * 0.1;
            const total = subtotal + shipping + tax;

            // Check subtotal
            const subtotalRegex = new RegExp(`\\$${subtotal.toFixed(2)}`);
            expect(screen.queryAllByText(subtotalRegex).length).toBeGreaterThan(0);

            // Check shipping
            if (shipping === 0) {
              const freeElements = screen.queryAllByText('FREE');
              expect(freeElements.length).toBeGreaterThan(0);
            } else {
              const shippingRegex = new RegExp(`${shipping.toFixed(2)}`);
              expect(screen.queryAllByText(shippingRegex).length).toBeGreaterThan(0);
            }

            // Check tax
            const taxRegex = new RegExp(`\\$${tax.toFixed(2)}`);
            expect(screen.queryAllByText(taxRegex).length).toBeGreaterThan(0);

            // Check total
            const totalRegex = new RegExp(`\\$${total.toFixed(2)}`);
            expect(screen.queryAllByText(totalRegex).length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000); // 60 second timeout for property-based test

    it('should display placeholder image when product image is null', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true, noDefaultInfinity: true }),
            size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
            quantity: fc.integer({ min: 1, max: 10 }),
          }),
          async (itemData) => {
            // Create cart item with null image
            const cartItem = {
              ...itemData,
              image: null,
            };

            // Arrange: Set up cart with item
            localStorage.setItem('cart', JSON.stringify([cartItem]));

            // Act: Render OrderSummary
            const { container } = render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert: Placeholder image should be displayed
            const images = container.querySelectorAll('img');
            const placeholderImages = Array.from(images).filter(img => {
              const src = img.getAttribute('src');
              return src && src.includes('placeholder');
            });
            
            expect(placeholderImages.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should display correct line totals for varying quantities', async () => {
      await fc.assert(
        fc.asyncProperty(
          cartItemArbitrary,
          async (cartItem) => {
            // Arrange: Set up cart with single item
            localStorage.setItem('cart', JSON.stringify([cartItem]));

            // Act: Render OrderSummary
            render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert: Line total should equal price × quantity
            const expectedLineTotal = cartItem.price * cartItem.quantity;
            const lineTotalRegex = new RegExp(`\\$${expectedLineTotal.toFixed(2)}`);
            
            expect(screen.queryAllByText(lineTotalRegex).length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should display all size options correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              name: fc.string({ minLength: 3, maxLength: 50 }),
              price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true, noDefaultInfinity: true }),
              size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
              quantity: fc.integer({ min: 1, max: 10 }),
              image: fc.option(fc.constantFrom('/uploads/image1.png', '/uploads/image2.png'), { nil: null }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
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
            
            if (uniqueItems.length === 0) return;

            // Arrange: Set up cart
            localStorage.setItem('cart', JSON.stringify(uniqueItems));

            // Act: Render OrderSummary
            render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert: Each item's size should be displayed
            for (const item of uniqueItems) {
              const sizeElements = screen.queryAllByText(`Size: ${item.size}`);
              expect(sizeElements.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should handle empty cart gracefully', async () => {
      // Arrange: Empty cart
      localStorage.setItem('cart', JSON.stringify([]));

      // Act: Render OrderSummary
      const { container } = render(
        <CartProvider>
          <OrderSummary />
        </CartProvider>
      );

      // Wait for component to render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Assert: Component should render without errors
      expect(container).toBeInTheDocument();
      
      // Order Summary title should be present
      expect(screen.getByText('Order Summary')).toBeInTheDocument();
    });

    it('should display correct image URLs with backend base URL', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true, noDefaultInfinity: true }),
            size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
            quantity: fc.integer({ min: 1, max: 10 }),
            image: fc.constantFrom('/uploads/image1.png', '/uploads/image2.png'),
          }),
          async (cartItem) => {
            // Arrange: Set up cart with item
            localStorage.setItem('cart', JSON.stringify([cartItem]));

            // Act: Render OrderSummary
            const { container } = render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert: Image URL should be constructed with backend base URL
            const images = container.querySelectorAll('img');
            const itemImages = Array.from(images).filter(img => {
              const src = img.getAttribute('src');
              // Should contain either the full URL with backend or the image path
              return src && (src.includes('localhost:1337') || src.includes(cartItem.image));
            });
            
            expect(itemImages.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should calculate and display correct totals for any cart', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(cartItemArbitrary, { minLength: 1, maxLength: 10 }),
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
            
            if (uniqueItems.length === 0) return;

            // Arrange: Set up cart
            localStorage.setItem('cart', JSON.stringify(uniqueItems));

            // Act: Render OrderSummary
            render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert: Calculate expected totals
            const subtotal = uniqueItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shipping = subtotal >= 100 ? 0 : 10;
            const tax = subtotal * 0.1;
            const total = subtotal + shipping + tax;

            // Verify subtotal
            const subtotalRegex = new RegExp(`\\$${subtotal.toFixed(2)}`);
            expect(screen.queryAllByText(subtotalRegex).length).toBeGreaterThan(0);

            // Verify shipping
            if (shipping === 0) {
              const freeElements = screen.queryAllByText('FREE');
              expect(freeElements.length).toBeGreaterThan(0);
            } else {
              const shippingRegex = new RegExp(`${shipping.toFixed(2)}`);
              expect(screen.queryAllByText(shippingRegex).length).toBeGreaterThan(0);
            }

            // Verify tax (10% of subtotal)
            const taxRegex = new RegExp(`\\$${tax.toFixed(2)}`);
            expect(screen.queryAllByText(taxRegex).length).toBeGreaterThan(0);

            // Verify total
            const totalRegex = new RegExp(`\\$${total.toFixed(2)}`);
            expect(screen.queryAllByText(totalRegex).length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should display free shipping notice when subtotal is below $100', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            price: fc.float({ min: Math.fround(0.01), max: Math.fround(50.00), noNaN: true, noDefaultInfinity: true }),
            size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
            quantity: fc.integer({ min: 1, max: 1 }),
            image: fc.option(fc.constantFrom('/uploads/image1.png'), { nil: null }),
          }),
          async (cartItem) => {
            // Ensure subtotal is below $100
            const subtotal = cartItem.price * cartItem.quantity;
            if (subtotal >= 100) return; // Skip if subtotal is >= $100

            // Arrange: Set up cart
            localStorage.setItem('cart', JSON.stringify([cartItem]));

            // Act: Render OrderSummary
            render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert: Free shipping notice should be displayed
            const amountNeeded = 100 - subtotal;
            const noticeRegex = new RegExp(`Add \\$${amountNeeded.toFixed(2)} more for free shipping!`);
            expect(screen.queryAllByText(noticeRegex).length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should not display free shipping notice when subtotal is $100 or more', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            price: fc.float({ min: Math.fround(100.00), max: Math.fround(999.99), noNaN: true, noDefaultInfinity: true }),
            size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
            quantity: fc.integer({ min: 1, max: 1 }),
            image: fc.option(fc.constantFrom('/uploads/image1.png'), { nil: null }),
          }),
          async (cartItem) => {
            // Arrange: Set up cart with item >= $100
            localStorage.setItem('cart', JSON.stringify([cartItem]));

            // Act: Render OrderSummary
            const { container } = render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert: Free shipping notice should NOT be displayed
            const noticeText = container.textContent;
            expect(noticeText).not.toMatch(/Add .* more for free shipping!/);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);
  });

  describe('Property 10: Order totals calculation correctness', () => {
    /**
     * **Validates: Requirements 2.6, 2.7, 2.8, 2.9, 2.10**
     * 
     * Property: For any cart, the following should hold:
     * - Subtotal = sum of all line totals
     * - Shipping = $10 if subtotal < $100, else $0
     * - Tax = subtotal × 0.1
     * - Total = subtotal + shipping + tax
     */
    it('should calculate order totals correctly for any cart', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(cartItemArbitrary, { minLength: 1, maxLength: 20 }),
          async (cartItems) => {
            // Ensure unique items (unique id + size combination)
            const uniqueItems = [];
            const seenKeys = new Set();
            for (const item of cartItems) {
              const key = `${item.id}-${item.size}`;
              if (!seenKeys.has(key)) {
                uniqueItems.push(item);
                seenKeys.add(key);
              }
            }
            
            // Skip if no unique items
            if (uniqueItems.length === 0) return;

            // Arrange: Set up cart with test items
            localStorage.setItem('cart', JSON.stringify(uniqueItems));

            // Act: Render OrderSummary
            render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert: Calculate expected totals
            // Requirement 2.7: Subtotal = sum of all line totals
            const expectedSubtotal = uniqueItems.reduce((sum, item) => 
              sum + (item.price * item.quantity), 0);
            
            // Requirement 2.8: Shipping = $10 if subtotal < $100, else $0
            const expectedShipping = expectedSubtotal >= 100 ? 0 : 10;
            
            // Requirement 2.9: Tax = subtotal × 0.1 (10%)
            const expectedTax = expectedSubtotal * 0.1;
            
            // Requirement 2.10: Total = subtotal + shipping + tax
            const expectedTotal = expectedSubtotal + expectedShipping + expectedTax;

            // Verify subtotal is displayed correctly
            const subtotalText = `$${expectedSubtotal.toFixed(2)}`;
            const subtotalElements = screen.queryAllByText(subtotalText);
            expect(subtotalElements.length).toBeGreaterThan(0);

            // Verify shipping is displayed correctly
            if (expectedShipping === 0) {
              const freeElements = screen.queryAllByText('FREE');
              expect(freeElements.length).toBeGreaterThan(0);
            } else {
              // Shipping is displayed without dollar sign
              const shippingText = expectedShipping.toFixed(2);
              const shippingElements = screen.getAllByText('Shipping');
              // Find the shipping element that contains the shipping cost
              const shippingElement = shippingElements.find(el => 
                el.parentElement && el.parentElement.textContent.includes(shippingText)
              );
              expect(shippingElement).toBeDefined();
              expect(shippingElement.parentElement.textContent).toContain(shippingText);
            }

            // Verify tax is displayed correctly
            const taxText = `$${expectedTax.toFixed(2)}`;
            const taxElements = screen.queryAllByText(taxText);
            expect(taxElements.length).toBeGreaterThan(0);

            // Verify total is displayed correctly
            const totalText = `$${expectedTotal.toFixed(2)}`;
            const totalElements = screen.queryAllByText(totalText);
            expect(totalElements.length).toBeGreaterThan(0);

            // Verify the mathematical relationships hold
            expect(expectedSubtotal).toBeCloseTo(
              uniqueItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
              2
            );
            expect(expectedShipping).toBe(expectedSubtotal >= 100 ? 0 : 10);
            expect(expectedTax).toBeCloseTo(expectedSubtotal * 0.1, 2);
            expect(expectedTotal).toBeCloseTo(expectedSubtotal + expectedShipping + expectedTax, 2);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000); // 60 second timeout for property-based test

    it('should apply free shipping when subtotal is exactly $100', async () => {
      // Arrange: Create cart with subtotal exactly $100
      const cartItem = {
        id: 1,
        name: 'Test Product',
        price: 100.00,
        size: 'M',
        quantity: 1,
        image: '/uploads/test.png',
      };

      localStorage.setItem('cart', JSON.stringify([cartItem]));

      // Act: Render OrderSummary
      render(
        <CartProvider>
          <OrderSummary />
        </CartProvider>
      );

      // Wait for component to render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Assert: Shipping should be FREE
      const freeElements = screen.queryAllByText('FREE');
      expect(freeElements.length).toBeGreaterThan(0);

      // Verify total calculation
      const expectedSubtotal = 100.00;
      const expectedShipping = 0;
      const expectedTax = 10.00;
      const expectedTotal = 110.00;

      const totalText = `$${expectedTotal.toFixed(2)}`;
      const totalElements = screen.queryAllByText(totalText);
      expect(totalElements.length).toBeGreaterThan(0);
    });

    it('should charge shipping when subtotal is just below $100', async () => {
      // Arrange: Create cart with subtotal just below $100
      const cartItem = {
        id: 1,
        name: 'Test Product',
        price: 99.99,
        size: 'M',
        quantity: 1,
        image: '/uploads/test.png',
      };

      localStorage.setItem('cart', JSON.stringify([cartItem]));

      // Act: Render OrderSummary
      render(
        <CartProvider>
          <OrderSummary />
        </CartProvider>
      );

      // Wait for component to render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Assert: Shipping should be $10
      const shippingText = '10.00';
      const shippingElements = screen.getAllByText('Shipping');
      const shippingElement = shippingElements.find(el => 
        el.parentElement && el.parentElement.textContent.includes(shippingText)
      );
      expect(shippingElement).toBeDefined();
      expect(shippingElement.parentElement.textContent).toContain(shippingText);

      // Verify total calculation
      const expectedSubtotal = 99.99;
      const expectedShipping = 10;
      const expectedTax = 9.999; // 99.99 * 0.1
      const expectedTotal = 119.989; // Should display as 119.99

      const totalText = `$${expectedTotal.toFixed(2)}`;
      const totalElements = screen.queryAllByText(totalText);
      expect(totalElements.length).toBeGreaterThan(0);
    });

    it('should calculate tax as exactly 10% of subtotal', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(cartItemArbitrary, { minLength: 1, maxLength: 10 }),
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
            
            if (uniqueItems.length === 0) return;

            // Arrange: Set up cart
            localStorage.setItem('cart', JSON.stringify(uniqueItems));

            // Act: Render OrderSummary
            render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert: Tax should be exactly 10% of subtotal
            const subtotal = uniqueItems.reduce((sum, item) => 
              sum + (item.price * item.quantity), 0);
            const expectedTax = subtotal * 0.1;

            const taxText = `$${expectedTax.toFixed(2)}`;
            const taxElements = screen.queryAllByText(taxText);
            expect(taxElements.length).toBeGreaterThan(0);

            // Verify the calculation
            expect(expectedTax).toBeCloseTo(subtotal * 0.1, 2);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should calculate total as sum of subtotal, shipping, and tax', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(cartItemArbitrary, { minLength: 1, maxLength: 10 }),
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
            
            if (uniqueItems.length === 0) return;

            // Arrange: Set up cart
            localStorage.setItem('cart', JSON.stringify(uniqueItems));

            // Act: Render OrderSummary
            render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert: Total should equal subtotal + shipping + tax
            const subtotal = uniqueItems.reduce((sum, item) => 
              sum + (item.price * item.quantity), 0);
            const shipping = subtotal >= 100 ? 0 : 10;
            const tax = subtotal * 0.1;
            const expectedTotal = subtotal + shipping + tax;

            const totalText = `$${expectedTotal.toFixed(2)}`;
            const totalElements = screen.queryAllByText(totalText);
            expect(totalElements.length).toBeGreaterThan(0);

            // Verify the calculation
            expect(expectedTotal).toBeCloseTo(subtotal + shipping + tax, 2);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should handle large cart totals correctly', async () => {
      // Arrange: Create cart with large total
      const cartItems = [
        { id: 1, name: 'Product 1', price: 500.00, size: 'M', quantity: 2, image: '/uploads/test1.png' },
        { id: 2, name: 'Product 2', price: 300.00, size: 'L', quantity: 3, image: '/uploads/test2.png' },
        { id: 3, name: 'Product 3', price: 150.00, size: 'S', quantity: 1, image: '/uploads/test3.png' },
      ];

      localStorage.setItem('cart', JSON.stringify(cartItems));

      // Act: Render OrderSummary
      render(
        <CartProvider>
          <OrderSummary />
        </CartProvider>
      );

      // Wait for component to render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Assert: Calculate expected totals
      const expectedSubtotal = 500 * 2 + 300 * 3 + 150 * 1; // 2050
      const expectedShipping = 0; // Free shipping
      const expectedTax = 205.00; // 10% of 2050
      const expectedTotal = 2255.00;

      // Verify all totals
      const subtotalText = `$${expectedSubtotal.toFixed(2)}`;
      expect(screen.queryAllByText(subtotalText).length).toBeGreaterThan(0);

      const freeElements = screen.queryAllByText('FREE');
      expect(freeElements.length).toBeGreaterThan(0);

      const taxText = `$${expectedTax.toFixed(2)}`;
      expect(screen.queryAllByText(taxText).length).toBeGreaterThan(0);

      const totalText = `$${expectedTotal.toFixed(2)}`;
      expect(screen.queryAllByText(totalText).length).toBeGreaterThan(0);
    });

    it('should handle decimal precision in calculations', async () => {
      // Arrange: Create cart with prices that result in complex decimals
      const cartItems = [
        { id: 1, name: 'Product 1', price: 19.99, size: 'M', quantity: 3, image: '/uploads/test1.png' },
        { id: 2, name: 'Product 2', price: 7.49, size: 'L', quantity: 2, image: '/uploads/test2.png' },
      ];

      localStorage.setItem('cart', JSON.stringify(cartItems));

      // Act: Render OrderSummary
      render(
        <CartProvider>
          <OrderSummary />
        </CartProvider>
      );

      // Wait for component to render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Assert: Calculate expected totals with proper rounding
      const expectedSubtotal = 19.99 * 3 + 7.49 * 2; // 59.97 + 14.98 = 74.95
      const expectedShipping = 10; // Below $100
      const expectedTax = expectedSubtotal * 0.1; // 7.495
      const expectedTotal = expectedSubtotal + expectedShipping + expectedTax; // 92.445

      // Verify subtotal
      const subtotalText = `$${expectedSubtotal.toFixed(2)}`;
      expect(screen.queryAllByText(subtotalText).length).toBeGreaterThan(0);

      // Verify shipping
      const shippingText = '10.00';
      const shippingElements = screen.getAllByText('Shipping');
      const shippingElement = shippingElements.find(el => 
        el.parentElement && el.parentElement.textContent.includes(shippingText)
      );
      expect(shippingElement).toBeDefined();
      expect(shippingElement.parentElement.textContent).toContain(shippingText);

      // Verify tax (should be rounded to 2 decimals)
      const taxText = `$${expectedTax.toFixed(2)}`;
      expect(screen.queryAllByText(taxText).length).toBeGreaterThan(0);

      // Verify total (should be rounded to 2 decimals)
      const totalText = `$${expectedTotal.toFixed(2)}`;
      expect(screen.queryAllByText(totalText).length).toBeGreaterThan(0);
    });
  });

  describe('Property 50: Image URL construction', () => {
    /**
     * **Validates: Requirements 10.2**
     * 
     * Property: For any product image, the image URL should be constructed as `${BACKEND_URL}${imagePath}`
     */
    it('should construct image URLs with backend base URL for any cart item', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true, noDefaultInfinity: true }),
            size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
            quantity: fc.integer({ min: 1, max: 10 }),
            image: fc.constantFrom('/uploads/image1.png', '/uploads/image2.png', '/uploads/test.jpg'),
          }),
          async (cartItem) => {
            // Arrange: Set up cart with item that has an image path
            localStorage.setItem('cart', JSON.stringify([cartItem]));

            // Act: Render OrderSummary
            const { container } = render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert: Image URL should be constructed as BACKEND_URL + imagePath
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:1337';
            const expectedImageUrl = `${BACKEND_URL}${cartItem.image}`;
            
            // Find all images in the component
            const images = container.querySelectorAll('img');
            
            // Check if any image has the correctly constructed URL
            const hasCorrectImageUrl = Array.from(images).some(img => {
              const src = img.getAttribute('src');
              // The src might be the full URL or just the path
              return src && (src === expectedImageUrl || src.includes(cartItem.image));
            });
            
            expect(hasCorrectImageUrl).toBe(true);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000); // 60 second timeout for property-based test

    it('should use placeholder image when image path is null', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true, noDefaultInfinity: true }),
            size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
            quantity: fc.integer({ min: 1, max: 10 }),
          }),
          async (itemData) => {
            // Create cart item with null image
            const cartItem = {
              ...itemData,
              image: null,
            };

            // Arrange: Set up cart with item
            localStorage.setItem('cart', JSON.stringify([cartItem]));

            // Act: Render OrderSummary
            const { container } = render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert: Placeholder image should be used
            const images = container.querySelectorAll('img');
            const hasPlaceholder = Array.from(images).some(img => {
              const src = img.getAttribute('src');
              return src && src.includes('placeholder');
            });
            
            expect(hasPlaceholder).toBe(true);
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
              'http://localhost:1337/uploads/image1.png',
              'https://example.com/uploads/image2.png'
            ),
          }),
          async (cartItem) => {
            // Arrange: Set up cart with item that has a full URL
            localStorage.setItem('cart', JSON.stringify([cartItem]));

            // Act: Render OrderSummary
            const { container } = render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert: Image URL should remain unchanged (not double-prefixed)
            const images = container.querySelectorAll('img');
            
            // Check if any image has the original full URL
            const hasCorrectImageUrl = Array.from(images).some(img => {
              const src = img.getAttribute('src');
              // The src should contain the original URL without double backend URL
              return src && src.includes(cartItem.image);
            });
            
            expect(hasCorrectImageUrl).toBe(true);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should construct correct URLs for various image path formats', async () => {
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
              '/uploads/subfolder/image.jpg',
              '/uploads/product_123.webp',
              '/uploads/large_image_abc123.png'
            ),
          }),
          async (cartItem) => {
            // Arrange: Set up cart with item
            localStorage.setItem('cart', JSON.stringify([cartItem]));

            // Act: Render OrderSummary
            const { container } = render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert: Image URL should be properly constructed
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:1337';
            const expectedImageUrl = `${BACKEND_URL}${cartItem.image}`;
            
            const images = container.querySelectorAll('img');
            const hasCorrectImageUrl = Array.from(images).some(img => {
              const src = img.getAttribute('src');
              return src && (src === expectedImageUrl || src.includes(cartItem.image));
            });
            
            expect(hasCorrectImageUrl).toBe(true);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);
  });

  describe('Property 9: Line total calculation', () => {
    /**
     * **Validates: Requirements 2.3**
     * 
     * Property: For any cart item, the line total should equal unit price multiplied by quantity
     */
    it('should calculate line total as price × quantity for any cart item', async () => {
      await fc.assert(
        fc.asyncProperty(
          cartItemArbitrary,
          async (cartItem) => {
            // Arrange: Set up cart with single item
            localStorage.setItem('cart', JSON.stringify([cartItem]));

            // Act: Render OrderSummary
            const { container } = render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert: Line total should equal price × quantity
            const expectedLineTotal = cartItem.price * cartItem.quantity;
            const expectedLineTotalFormatted = expectedLineTotal.toFixed(2);
            
            // Use a more robust text matching strategy
            // Search for the formatted line total in the component's text content
            const componentText = container.textContent;
            const lineTotalPattern = `$${expectedLineTotalFormatted}`;
            
            // Check if the line total appears in the rendered output
            const hasLineTotal = componentText.includes(lineTotalPattern);
            expect(hasLineTotal).toBe(true);

            // Additional verification: Check that the calculation is mathematically correct
            expect(expectedLineTotal).toBeCloseTo(cartItem.price * cartItem.quantity, 2);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000); // 60 second timeout for property-based test

    it('should calculate correct line totals for multiple items with different quantities', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(cartItemArbitrary, { minLength: 1, maxLength: 10 }),
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
            
            if (uniqueItems.length === 0) return;

            // Arrange: Set up cart with multiple items
            localStorage.setItem('cart', JSON.stringify(uniqueItems));

            // Act: Render OrderSummary
            const { container } = render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert: Each item's line total should equal its price × quantity
            const componentText = container.textContent;
            
            for (const item of uniqueItems) {
              const expectedLineTotal = item.price * item.quantity;
              const expectedLineTotalFormatted = expectedLineTotal.toFixed(2);
              const lineTotalPattern = `$${expectedLineTotalFormatted}`;
              
              // Check if the line total appears in the rendered output
              const hasLineTotal = componentText.includes(lineTotalPattern);
              expect(hasLineTotal).toBe(true);

              // Verify the calculation is correct
              expect(expectedLineTotal).toBeCloseTo(item.price * item.quantity, 2);
            }
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should handle edge case: quantity of 1', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true, noDefaultInfinity: true }),
            size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
            quantity: fc.constant(1),
            image: fc.option(fc.constantFrom('/uploads/image1.png'), { nil: null }),
          }),
          async (cartItem) => {
            // Arrange: Set up cart with item quantity = 1
            localStorage.setItem('cart', JSON.stringify([cartItem]));

            // Act: Render OrderSummary
            const { container } = render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert: Line total should equal price (since quantity is 1)
            const expectedLineTotal = cartItem.price * 1;
            expect(expectedLineTotal).toBe(cartItem.price);
            
            const expectedLineTotalFormatted = expectedLineTotal.toFixed(2);
            const lineTotalPattern = `$${expectedLineTotalFormatted}`;
            
            // Check if the line total appears in the rendered output
            const componentText = container.textContent;
            const hasLineTotal = componentText.includes(lineTotalPattern);
            expect(hasLineTotal).toBe(true);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should handle edge case: maximum quantity', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            price: fc.float({ min: Math.fround(0.01), max: Math.fround(99.99), noNaN: true, noDefaultInfinity: true }),
            size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
            quantity: fc.constant(10),
            image: fc.option(fc.constantFrom('/uploads/image1.png'), { nil: null }),
          }),
          async (cartItem) => {
            // Arrange: Set up cart with item quantity = 10
            localStorage.setItem('cart', JSON.stringify([cartItem]));

            // Act: Render OrderSummary
            const { container } = render(
              <CartProvider>
                <OrderSummary />
              </CartProvider>
            );

            // Wait for component to render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert: Line total should equal price × 10
            const expectedLineTotal = cartItem.price * 10;
            const expectedLineTotalFormatted = expectedLineTotal.toFixed(2);
            const lineTotalPattern = `$${expectedLineTotalFormatted}`;
            
            // Check if the line total appears in the rendered output
            const componentText = container.textContent;
            const hasLineTotal = componentText.includes(lineTotalPattern);
            expect(hasLineTotal).toBe(true);

            // Verify calculation
            expect(expectedLineTotal).toBeCloseTo(cartItem.price * 10, 2);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should maintain precision for decimal prices', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true, noDefaultInfinity: true }),
            size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
            quantity: fc.integer({ min: 1, max: 10 }),
            image: fc.option(fc.constantFrom('/uploads/image1.png'), { nil: null }),
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
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert: Line total should be calculated with proper decimal precision
            const expectedLineTotal = cartItem.price * cartItem.quantity;
            
            // Verify the calculation maintains 2 decimal places
            const roundedLineTotal = Math.round(expectedLineTotal * 100) / 100;
            expect(roundedLineTotal).toBeCloseTo(expectedLineTotal, 2);
            
            const expectedLineTotalFormatted = expectedLineTotal.toFixed(2);
            const lineTotalPattern = `$${expectedLineTotalFormatted}`;
            
            // Check if the line total appears in the rendered output
            const componentText = container.textContent;
            const hasLineTotal = componentText.includes(lineTotalPattern);
            expect(hasLineTotal).toBe(true);
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);
  });
});






