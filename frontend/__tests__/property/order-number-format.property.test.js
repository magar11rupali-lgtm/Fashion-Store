/**
 * Property-Based Tests for Order Number Format
 * Feature: ecommerce-fixes-and-enhancements
 * 
 * Property 16: Order number format
 * Validates: Requirements 3.9
 */

import { createOrder } from '@/lib/orders';
import fc from 'fast-check';

// Mock fetch globally
global.fetch = jest.fn();

// Arbitrary generators for property-based testing
const cartItemArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  name: fc.string({ minLength: 3, maxLength: 50 }),
  price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true, noDefaultInfinity: true }),
  size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
  quantity: fc.integer({ min: 1, max: 10 }),
  image: fc.option(fc.constantFrom('/uploads/image1.png', '/uploads/image2.png', null), { nil: null }),
});

const customerArbitrary = fc.record({
  firstName: fc.string({ minLength: 1, maxLength: 50 }),
  lastName: fc.string({ minLength: 1, maxLength: 50 }),
  email: fc.emailAddress(),
  phone: fc.string({ minLength: 10, maxLength: 15 }),
  address: fc.string({ minLength: 5, maxLength: 100 }),
  city: fc.string({ minLength: 2, maxLength: 50 }),
  postalCode: fc.string({ minLength: 5, maxLength: 10 }),
  country: fc.string({ minLength: 2, maxLength: 50 }),
});

const orderDataArbitrary = fc.record({
  customer: customerArbitrary,
  items: fc.array(cartItemArbitrary, { minLength: 1, maxLength: 20 }),
  paymentMethod: fc.constantFrom('cod', 'card', 'paypal'),
}).map(data => {
  // Calculate totals based on items
  const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return {
    ...data,
    subtotal,
    shipping,
    tax,
    total,
  };
});

describe('Feature: ecommerce-fixes-and-enhancements, Property 16: Order Number Format', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
    global.fetch.mockReset();
  });

  /**
   * **Validates: Requirements 3.9**
   * 
   * Property: For any generated order number, it should match the pattern "ORD-{timestamp}-{alphanumeric}"
   * 
   * The order number format must:
   * 1. Start with "ORD-" prefix
   * 2. Contain a valid timestamp (numeric)
   * 3. End with an alphanumeric suffix (uppercase letters and numbers)
   * 4. Use hyphens as separators between components
   */
  it('should generate order numbers matching pattern ORD-{timestamp}-{alphanumeric} for any order', async () => {
    await fc.assert(
      fc.asyncProperty(
        orderDataArbitrary,
        fc.string({ minLength: 20, maxLength: 100 }), // JWT token
        async (orderData, userToken) => {
          // Reset mock for each iteration
          global.fetch.mockClear();
          global.fetch.mockReset();
          
          // Arrange: Mock successful backend response
          global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              data: {
                id: Math.floor(Math.random() * 10000),
                attributes: {},
              },
            }),
          });

          // Act: Create order
          await createOrder(orderData, userToken);

          // Assert: Verify order number format
          const fetchCall = global.fetch.mock.calls[0];
          const [, options] = fetchCall;
          const requestBody = JSON.parse(options.body);
          const orderNumber = requestBody.data.orderNumber;

          // 1. Verify overall pattern: ORD-{timestamp}-{alphanumeric}
          expect(orderNumber).toMatch(/^ORD-\d+-[A-Z0-9]+$/);

          // 2. Verify order number structure
          const parts = orderNumber.split('-');
          expect(parts.length).toBe(3);

          // 3. Verify prefix is "ORD"
          expect(parts[0]).toBe('ORD');

          // 4. Verify timestamp component is numeric and valid
          const timestamp = parts[1];
          expect(timestamp).toMatch(/^\d+$/);
          const timestampValue = parseInt(timestamp, 10);
          expect(timestampValue).toBeGreaterThan(0);
          expect(timestampValue).toBeLessThanOrEqual(Date.now());
          // Timestamp should be reasonable (not from the distant past)
          const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
          expect(timestampValue).toBeGreaterThan(oneYearAgo);

          // 5. Verify alphanumeric suffix component
          const suffix = parts[2];
          expect(suffix).toMatch(/^[A-Z0-9]+$/);
          expect(suffix.length).toBeGreaterThan(0);
          expect(suffix.length).toBeLessThanOrEqual(20); // Reasonable length limit

          // 6. Verify no lowercase letters in suffix (should be uppercase)
          expect(suffix).not.toMatch(/[a-z]/);

          // 7. Verify no special characters except hyphens as separators
          expect(orderNumber).not.toMatch(/[^A-Z0-9-]/);

          // 8. Verify order number is not empty
          expect(orderNumber.length).toBeGreaterThan(0);

          // 9. Verify order number has reasonable total length
          expect(orderNumber.length).toBeGreaterThan(10); // Minimum reasonable length
          expect(orderNumber.length).toBeLessThan(100); // Maximum reasonable length
        }
      ),
      { numRuns: 3 }
    );
  });

  it('should generate unique order numbers with valid format for multiple orders', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(orderDataArbitrary, { minLength: 2, maxLength: 10 }),
        fc.string({ minLength: 20, maxLength: 100 }), // JWT token
        async (orders, userToken) => {
          const orderNumbers = new Set();

          for (const orderData of orders) {
            // Reset mock for each order
            global.fetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({
                data: {
                  id: Math.floor(Math.random() * 10000),
                  attributes: {},
                },
              }),
            });

            // Act: Create order
            await createOrder(orderData, userToken);

            // Extract order number from request
            const fetchCall = global.fetch.mock.calls[global.fetch.mock.calls.length - 1];
            const [, options] = fetchCall;
            const requestBody = JSON.parse(options.body);
            const orderNumber = requestBody.data.orderNumber;

            // Assert: Verify format for each order number
            expect(orderNumber).toMatch(/^ORD-\d+-[A-Z0-9]+$/);

            // Verify uniqueness
            expect(orderNumbers.has(orderNumber)).toBe(false);
            orderNumbers.add(orderNumber);

            // Verify structure
            const parts = orderNumber.split('-');
            expect(parts.length).toBe(3);
            expect(parts[0]).toBe('ORD');
            expect(parts[1]).toMatch(/^\d+$/);
            expect(parts[2]).toMatch(/^[A-Z0-9]+$/);
          }

          // Verify all order numbers are unique
          expect(orderNumbers.size).toBe(orders.length);
        }
      ),
      { numRuns: 3 } // Reduced runs for performance
    );
  });

  it('should generate order numbers with consistent format across different order data', async () => {
    await fc.assert(
      fc.asyncProperty(
        orderDataArbitrary,
        fc.string({ minLength: 20, maxLength: 100 }),
        async (orderData, userToken) => {
          // Reset mock for each iteration
          global.fetch.mockClear();
          global.fetch.mockReset();
          
          // Arrange: Mock successful backend response
          global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              data: {
                id: Math.floor(Math.random() * 10000),
                attributes: {},
              },
            }),
          });

          // Act: Create order
          await createOrder(orderData, userToken);

          // Assert: Verify format consistency
          const fetchCall = global.fetch.mock.calls[0];
          const [, options] = fetchCall;
          const requestBody = JSON.parse(options.body);
          const orderNumber = requestBody.data.orderNumber;

          // Verify the format is consistent regardless of order data
          const orderNumberRegex = /^ORD-\d+-[A-Z0-9]+$/;
          expect(orderNumber).toMatch(orderNumberRegex);

          // Verify format components
          const [prefix, timestamp, suffix] = orderNumber.split('-');

          // Prefix should always be "ORD"
          expect(prefix).toBe('ORD');

          // Timestamp should be a valid number
          expect(Number.isNaN(parseInt(timestamp, 10))).toBe(false);

          // Suffix should only contain uppercase alphanumeric characters
          expect(/^[A-Z0-9]+$/.test(suffix)).toBe(true);

          // Verify order number structure is independent of order data
          // The format should always be: ORD-{timestamp}-{random_suffix}
          // regardless of customer info, items, or totals
          
          // Verify the three-part structure
          expect(orderNumber.split('-').length).toBe(3);
          
          // Verify prefix is always "ORD"
          expect(orderNumber.startsWith('ORD-')).toBe(true);
          
          // Verify timestamp is numeric
          const timestampPart = orderNumber.split('-')[1];
          expect(/^\d+$/.test(timestampPart)).toBe(true);
          
          // Verify suffix is alphanumeric uppercase
          const suffixPart = orderNumber.split('-')[2];
          expect(/^[A-Z0-9]+$/.test(suffixPart)).toBe(true);
        }
      ),
      { numRuns: 3 }
    );
  });

  it('should generate order numbers with valid timestamp component', async () => {
    await fc.assert(
      fc.asyncProperty(
        orderDataArbitrary,
        fc.string({ minLength: 20, maxLength: 100 }),
        async (orderData, userToken) => {
          // Reset mock for each iteration
          global.fetch.mockClear();
          global.fetch.mockReset();
          
          // Record time before order creation
          const beforeTime = Date.now();

          // Arrange: Mock successful backend response
          global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              data: {
                id: Math.floor(Math.random() * 10000),
                attributes: {},
              },
            }),
          });

          // Act: Create order
          await createOrder(orderData, userToken);

          // Record time after order creation
          const afterTime = Date.now();

          // Assert: Verify timestamp is within reasonable range
          const fetchCall = global.fetch.mock.calls[0];
          const [, options] = fetchCall;
          const requestBody = JSON.parse(options.body);
          const orderNumber = requestBody.data.orderNumber;

          const parts = orderNumber.split('-');
          const timestamp = parseInt(parts[1], 10);

          // Timestamp should be between before and after times (with small buffer)
          expect(timestamp).toBeGreaterThanOrEqual(beforeTime - 1000); // 1 second buffer
          expect(timestamp).toBeLessThanOrEqual(afterTime + 1000); // 1 second buffer

          // Timestamp should be a valid Unix timestamp (milliseconds)
          expect(timestamp).toBeGreaterThan(1000000000000); // After year 2001
          expect(timestamp).toBeLessThan(9999999999999); // Before year 2286
        }
      ),
      { numRuns: 3 }
    );
  });

  it('should generate order numbers with non-empty alphanumeric suffix', async () => {
    await fc.assert(
      fc.asyncProperty(
        orderDataArbitrary,
        fc.string({ minLength: 20, maxLength: 100 }),
        async (orderData, userToken) => {
          // Reset mock for each iteration
          global.fetch.mockClear();
          global.fetch.mockReset();
          
          // Arrange: Mock successful backend response
          global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              data: {
                id: Math.floor(Math.random() * 10000),
                attributes: {},
              },
            }),
          });

          // Act: Create order
          await createOrder(orderData, userToken);

          // Assert: Verify suffix properties
          const fetchCall = global.fetch.mock.calls[0];
          const [, options] = fetchCall;
          const requestBody = JSON.parse(options.body);
          const orderNumber = requestBody.data.orderNumber;

          const parts = orderNumber.split('-');
          const suffix = parts[2];

          // Suffix should not be empty
          expect(suffix.length).toBeGreaterThan(0);

          // Suffix should only contain uppercase letters and numbers
          expect(suffix).toMatch(/^[A-Z0-9]+$/);

          // Suffix should not contain only numbers (should have some randomness)
          // This is a probabilistic check - with random generation, it's unlikely to be all numbers
          const isAllNumbers = /^\d+$/.test(suffix);
          // We don't strictly enforce this, but it's good to check the implementation
          // The current implementation uses base36 which includes letters

          // Suffix should have reasonable length (not too short, not too long)
          expect(suffix.length).toBeGreaterThanOrEqual(1);
          expect(suffix.length).toBeLessThanOrEqual(20);
        }
      ),
      { numRuns: 3 }
    );
  });

  it('should generate order numbers that are URL-safe', async () => {
    await fc.assert(
      fc.asyncProperty(
        orderDataArbitrary,
        fc.string({ minLength: 20, maxLength: 100 }),
        async (orderData, userToken) => {
          // Reset mock for each iteration
          global.fetch.mockClear();
          global.fetch.mockReset();
          
          // Arrange: Mock successful backend response
          global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              data: {
                id: Math.floor(Math.random() * 10000),
                attributes: {},
              },
            }),
          });

          // Act: Create order
          await createOrder(orderData, userToken);

          // Assert: Verify order number is URL-safe
          const fetchCall = global.fetch.mock.calls[0];
          const [, options] = fetchCall;
          const requestBody = JSON.parse(options.body);
          const orderNumber = requestBody.data.orderNumber;

          // Order number should not contain URL-unsafe characters
          // Only alphanumeric and hyphens are allowed
          expect(orderNumber).toMatch(/^[A-Z0-9-]+$/);

          // Verify no spaces
          expect(orderNumber).not.toContain(' ');

          // Verify no special characters that need URL encoding
          const urlUnsafeChars = ['/', '?', '#', '&', '=', '%', '+', '@', '!', '*', '(', ')', ',', ';', ':', '$'];
          for (const char of urlUnsafeChars) {
            expect(orderNumber).not.toContain(char);
          }

          // Verify order number can be used in URL without encoding
          const encoded = encodeURIComponent(orderNumber);
          expect(encoded).toBe(orderNumber);
        }
      ),
      { numRuns: 3 }
    );
  });
});






