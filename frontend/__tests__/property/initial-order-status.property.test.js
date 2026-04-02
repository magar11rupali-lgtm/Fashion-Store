/**
 * Property-Based Tests for Initial Order Status
 * Feature: ecommerce-fixes-and-enhancements
 * 
 * Property 17: Initial order status
 * Validates: Requirements 3.10, 5.3
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

describe('Feature: ecommerce-fixes-and-enhancements, Property 17: Initial Order Status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
    global.fetch.mockReset();
  });

  /**
   * **Validates: Requirements 3.10, 5.3**
   * 
   * Property: For any newly created order, the order_status should be "pending"
   * 
   * This property ensures that:
   * 1. All new orders start with status "pending" (Requirement 3.10)
   * 2. The order status field is correctly named "order_status" (Requirement 5.3)
   * 3. The initial status is consistent across all order types
   * 4. The status is set automatically without user input
   */
  it('should set order_status to "pending" for any newly created order', async () => {
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
                attributes: {
                  order_status: 'pending',
                },
              },
            }),
          });

          // Act: Create order
          await createOrder(orderData, userToken);

          // Assert: Verify order_status is set to "pending"
          const fetchCall = global.fetch.mock.calls[0];
          const [, options] = fetchCall;
          const requestBody = JSON.parse(options.body);

          // 1. Verify order_status field exists
          expect(requestBody.data).toHaveProperty('order_status');

          // 2. Verify order_status is exactly "pending"
          expect(requestBody.data.order_status).toBe('pending');

          // 3. Verify order_status is a string
          expect(typeof requestBody.data.order_status).toBe('string');

          // 4. Verify order_status is not empty
          expect(requestBody.data.order_status.length).toBeGreaterThan(0);

          // 5. Verify order_status is lowercase (as per enum definition)
          expect(requestBody.data.order_status).toBe(requestBody.data.order_status.toLowerCase());

          // 6. Verify order_status is one of the valid enum values
          const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
          expect(validStatuses).toContain(requestBody.data.order_status);

          // 7. Verify the field name is "order_status" not "orde_status" (typo fix)
          expect(requestBody.data).not.toHaveProperty('orde_status');
        }
      ),
      { numRuns: 3 }
    );
  });

  it('should consistently set initial status to "pending" regardless of order data', async () => {
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

          // Assert: Verify status is always "pending" regardless of:
          // - Number of items
          // - Order total
          // - Customer information
          // - Payment method
          const fetchCall = global.fetch.mock.calls[0];
          const [, options] = fetchCall;
          const requestBody = JSON.parse(options.body);

          expect(requestBody.data.order_status).toBe('pending');

          // Verify status is not influenced by order total
          const isHighValue = orderData.total > 1000;
          const isLowValue = orderData.total < 50;
          expect(requestBody.data.order_status).toBe('pending'); // Same regardless

          // Verify status is not influenced by payment method
          const isCOD = orderData.paymentMethod === 'cod';
          const isCard = orderData.paymentMethod === 'card';
          expect(requestBody.data.order_status).toBe('pending'); // Same regardless

          // Verify status is not influenced by number of items
          const hasManyItems = orderData.items.length > 10;
          const hasFewItems = orderData.items.length < 3;
          expect(requestBody.data.order_status).toBe('pending'); // Same regardless
        }
      ),
      { numRuns: 3 }
    );
  });

  it('should not set order_status to any other value initially', async () => {
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

          // Assert: Verify status is NOT any other valid status
          const fetchCall = global.fetch.mock.calls[0];
          const [, options] = fetchCall;
          const requestBody = JSON.parse(options.body);

          const orderStatus = requestBody.data.order_status;

          // Should not be any other valid status
          expect(orderStatus).not.toBe('processing');
          expect(orderStatus).not.toBe('shipped');
          expect(orderStatus).not.toBe('delivered');
          expect(orderStatus).not.toBe('cancelled');

          // Should not be invalid values
          expect(orderStatus).not.toBe('');
          expect(orderStatus).not.toBe(null);
          expect(orderStatus).not.toBe(undefined);
          expect(orderStatus).not.toBe('PENDING'); // Should be lowercase
          expect(orderStatus).not.toBe('Pending'); // Should be lowercase

          // Must be exactly "pending"
          expect(orderStatus).toBe('pending');
        }
      ),
      { numRuns: 3 }
    );
  });

  it('should set order_status field with correct field name (not typo "orde_status")', async () => {
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

          // Assert: Verify correct field name
          const fetchCall = global.fetch.mock.calls[0];
          const [, options] = fetchCall;
          const requestBody = JSON.parse(options.body);

          // Should have "order_status" field
          expect(requestBody.data).toHaveProperty('order_status');

          // Should NOT have typo field "orde_status"
          expect(requestBody.data).not.toHaveProperty('orde_status');

          // Verify the field name is exactly "order_status"
          const fieldNames = Object.keys(requestBody.data);
          expect(fieldNames).toContain('order_status');
          expect(fieldNames).not.toContain('orde_status');

          // Verify the value is "pending"
          expect(requestBody.data.order_status).toBe('pending');
        }
      ),
      { numRuns: 3 }
    );
  });

  it('should set order_status as a required field for any order', async () => {
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

          // Assert: Verify order_status is always present
          const fetchCall = global.fetch.mock.calls[0];
          const [, options] = fetchCall;
          const requestBody = JSON.parse(options.body);

          // order_status should always be present
          expect(requestBody.data.order_status).toBeDefined();
          expect(requestBody.data.order_status).not.toBeNull();
          expect(requestBody.data.order_status).not.toBeUndefined();

          // order_status should be a non-empty string
          expect(typeof requestBody.data.order_status).toBe('string');
          expect(requestBody.data.order_status.length).toBeGreaterThan(0);

          // order_status should be "pending"
          expect(requestBody.data.order_status).toBe('pending');
        }
      ),
      { numRuns: 3 }
    );
  });

  it('should set order_status to valid enum value from allowed statuses', async () => {
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

          // Assert: Verify order_status is a valid enum value
          const fetchCall = global.fetch.mock.calls[0];
          const [, options] = fetchCall;
          const requestBody = JSON.parse(options.body);

          // Define valid order status enum values (from Requirement 5.2)
          const validOrderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

          // order_status must be one of the valid enum values
          expect(validOrderStatuses).toContain(requestBody.data.order_status);

          // For new orders, it must specifically be "pending"
          expect(requestBody.data.order_status).toBe('pending');

          // Verify it's not an invalid value
          const invalidStatuses = ['new', 'created', 'confirmed', 'paid', 'completed', 'failed'];
          expect(invalidStatuses).not.toContain(requestBody.data.order_status);
        }
      ),
      { numRuns: 3 }
    );
  });

  it('should maintain order_status as "pending" across multiple order creations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(orderDataArbitrary, { minLength: 2, maxLength: 5 }),
        fc.string({ minLength: 20, maxLength: 100 }),
        async (orders, userToken) => {
          const statuses = [];

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

            // Extract order status from request
            const fetchCall = global.fetch.mock.calls[global.fetch.mock.calls.length - 1];
            const [, options] = fetchCall;
            const requestBody = JSON.parse(options.body);
            const orderStatus = requestBody.data.order_status;

            statuses.push(orderStatus);

            // Assert: Each order should have "pending" status
            expect(orderStatus).toBe('pending');
          }

          // Verify all orders have the same initial status
          const allPending = statuses.every(status => status === 'pending');
          expect(allPending).toBe(true);

          // Verify consistency
          const uniqueStatuses = new Set(statuses);
          expect(uniqueStatuses.size).toBe(1);
          expect(uniqueStatuses.has('pending')).toBe(true);
        }
      ),
      { numRuns: 3 } // Reduced runs for performance
    );
  });
});






