/**
 * Property-Based Tests for Order Persistence
 * Feature: ecommerce-fixes-and-enhancements
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

describe('Feature: ecommerce-fixes-and-enhancements, Order Persistence Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
    global.fetch.mockReset();
  });

  describe('Property 11: Order persistence to backend', () => {
    /**
     * **Validates: Requirements 3.1**
     * 
     * Property: For any completed checkout, the backend should contain an order record 
     * with matching order data
     */
    it('should persist any order to backend with correct data', async () => {
      await fc.assert(
        fc.asyncProperty(
          orderDataArbitrary,
          fc.string({ minLength: 20, maxLength: 100 }), // JWT token
          async (orderData, userToken) => {
            // Reset mock for each iteration
            global.fetch.mockClear();
            global.fetch.mockReset();
            
            // Arrange: Mock successful backend response
            const mockOrderId = Math.floor(Math.random() * 10000);
            const mockBackendResponse = {
              data: {
                id: mockOrderId,
                attributes: {
                  orderNumber: expect.stringMatching(/^ORD-\d+-[A-Z0-9]+$/),
                  customer: orderData.customer,
                  items: orderData.items.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    size: item.size,
                    quantity: item.quantity,
                    image: item.image || '',
                  })),
                  subtotal: orderData.subtotal,
                  shipping: orderData.shipping,
                  tax: orderData.tax,
                  total: orderData.total,
                  paymentMethod: orderData.paymentMethod,
                  order_status: 'pending',
                },
              },
            };

            global.fetch.mockResolvedValueOnce({
              ok: true,
              json: async () => mockBackendResponse,
            });

            // Act: Create order
            const response = await createOrder(orderData, userToken);

            // Assert: Verify fetch was called with correct parameters
            expect(global.fetch).toHaveBeenCalledTimes(1);
            
            const fetchCall = global.fetch.mock.calls[0];
            const [url, options] = fetchCall;

            // Verify URL
            expect(url).toContain('/orders');

            // Verify HTTP method
            expect(options.method).toBe('POST');

            // Verify headers
            expect(options.headers['Content-Type']).toBe('application/json');
            expect(options.headers['Authorization']).toBe(`Bearer ${userToken}`);

            // Verify request body
            const requestBody = JSON.parse(options.body);
            expect(requestBody.data).toBeDefined();

            // Verify order number format
            expect(requestBody.data.orderNumber).toMatch(/^ORD-\d+-[A-Z0-9]+$/);

            // Verify customer data
            expect(requestBody.data.customer).toEqual(orderData.customer);

            // Verify items data
            expect(requestBody.data.items).toHaveLength(orderData.items.length);
            for (let i = 0; i < orderData.items.length; i++) {
              const requestItem = requestBody.data.items[i];
              const originalItem = orderData.items[i];

              expect(requestItem.productId).toBe(originalItem.id);
              expect(requestItem.name).toBe(originalItem.name);
              expect(requestItem.price).toBe(originalItem.price);
              expect(requestItem.size).toBe(originalItem.size);
              expect(requestItem.quantity).toBe(originalItem.quantity);
              expect(requestItem.image).toBe(originalItem.image || '');
            }

            // Verify totals
            expect(requestBody.data.subtotal).toBeCloseTo(orderData.subtotal, 2);
            expect(requestBody.data.shipping).toBeCloseTo(orderData.shipping, 2);
            expect(requestBody.data.tax).toBeCloseTo(orderData.tax, 2);
            expect(requestBody.data.total).toBeCloseTo(orderData.total, 2);

            // Verify payment method
            expect(requestBody.data.paymentMethod).toBe(orderData.paymentMethod);

            // Verify initial order status
            expect(requestBody.data.order_status).toBe('pending');

            // Verify response
            expect(response).toEqual(mockBackendResponse);
            expect(response.data.id).toBe(mockOrderId);
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should include JWT token in Authorization header for any order', async () => {
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

            // Assert: Verify Authorization header
            const fetchCall = global.fetch.mock.calls[0];
            const [, options] = fetchCall;

            expect(options.headers['Authorization']).toBe(`Bearer ${userToken}`);
            expect(options.headers['Authorization']).toContain(userToken);
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should generate unique order numbers for any orders', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(orderDataArbitrary, { minLength: 2, maxLength: 10 }),
          fc.string({ minLength: 20, maxLength: 100 }), // JWT token
          async (orders, userToken) => {
            // Arrange: Mock successful backend responses
            const orderNumbers = new Set();

            for (const orderData of orders) {
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

              // Assert: Order number should be unique
              expect(orderNumbers.has(orderNumber)).toBe(false);
              orderNumbers.add(orderNumber);

              // Verify order number format
              expect(orderNumber).toMatch(/^ORD-\d+-[A-Z0-9]+$/);
            }

            // Verify all order numbers are unique
            expect(orderNumbers.size).toBe(orders.length);
          }
        ),
        { numRuns: 3 } // Reduced runs for performance
      );
    });

    it('should handle missing images in cart items', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            customer: customerArbitrary,
            items: fc.array(
              fc.record({
                id: fc.integer({ min: 1, max: 10000 }),
                name: fc.string({ minLength: 3, maxLength: 50 }),
                price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true, noDefaultInfinity: true }),
                size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
                quantity: fc.integer({ min: 1, max: 10 }),
                image: fc.constant(null), // Always null
              }),
              { minLength: 1, maxLength: 5 }
            ),
            paymentMethod: fc.constantFrom('cod', 'card', 'paypal'),
          }).map(data => {
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
          }),
          fc.string({ minLength: 20, maxLength: 100 }),
          async (orderData, userToken) => {
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

            // Assert: Verify items with null images are converted to empty strings
            const fetchCall = global.fetch.mock.calls[0];
            const [, options] = fetchCall;
            const requestBody = JSON.parse(options.body);

            for (const item of requestBody.data.items) {
              expect(item.image).toBe('');
              expect(item.image).not.toBeNull();
              expect(item.image).not.toBeUndefined();
            }
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should throw error when backend returns non-ok response', async () => {
      await fc.assert(
        fc.asyncProperty(
          orderDataArbitrary,
          fc.string({ minLength: 20, maxLength: 100 }),
          fc.integer({ min: 400, max: 599 }), // HTTP error codes
          fc.string({ minLength: 10, maxLength: 100 }), // Error message
          async (orderData, userToken, errorCode, errorMessage) => {
            // Reset mock for each iteration
            global.fetch.mockClear();
            global.fetch.mockReset();
            
            // Arrange: Mock failed backend response
            global.fetch.mockResolvedValueOnce({
              ok: false,
              status: errorCode,
              json: async () => ({
                error: {
                  message: errorMessage,
                },
              }),
            });

            // Act & Assert: Should throw error
            await expect(createOrder(orderData, userToken)).rejects.toThrow();

            // Verify fetch was called
            expect(global.fetch).toHaveBeenCalledTimes(1);
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should handle backend response without error message', async () => {
      await fc.assert(
        fc.asyncProperty(
          orderDataArbitrary,
          fc.string({ minLength: 20, maxLength: 100 }),
          fc.integer({ min: 400, max: 599 }),
          async (orderData, userToken, errorCode) => {
            // Reset mock for each iteration
            global.fetch.mockClear();
            global.fetch.mockReset();
            
            // Arrange: Mock failed backend response without error message
            global.fetch.mockResolvedValueOnce({
              ok: false,
              status: errorCode,
              json: async () => ({}), // No error object
            });

            // Act & Assert: Should throw generic error
            await expect(createOrder(orderData, userToken)).rejects.toThrow('Failed to create order');

            // Verify fetch was called
            expect(global.fetch).toHaveBeenCalledTimes(1);
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should preserve all customer information fields', async () => {
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

            // Assert: Verify all customer fields are present
            const fetchCall = global.fetch.mock.calls[0];
            const [, options] = fetchCall;
            const requestBody = JSON.parse(options.body);

            const customer = requestBody.data.customer;

            // Verify all required customer fields
            expect(customer.firstName).toBe(orderData.customer.firstName);
            expect(customer.lastName).toBe(orderData.customer.lastName);
            expect(customer.email).toBe(orderData.customer.email);
            expect(customer.phone).toBe(orderData.customer.phone);
            expect(customer.address).toBe(orderData.customer.address);
            expect(customer.city).toBe(orderData.customer.city);
            expect(customer.postalCode).toBe(orderData.customer.postalCode);
            expect(customer.country).toBe(orderData.customer.country);

            // Verify no fields are missing
            expect(Object.keys(customer)).toContain('firstName');
            expect(Object.keys(customer)).toContain('lastName');
            expect(Object.keys(customer)).toContain('email');
            expect(Object.keys(customer)).toContain('phone');
            expect(Object.keys(customer)).toContain('address');
            expect(Object.keys(customer)).toContain('city');
            expect(Object.keys(customer)).toContain('postalCode');
            expect(Object.keys(customer)).toContain('country');
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should preserve all item fields for any cart items', async () => {
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

            // Assert: Verify all item fields are present
            const fetchCall = global.fetch.mock.calls[0];
            const [, options] = fetchCall;
            const requestBody = JSON.parse(options.body);

            const items = requestBody.data.items;

            expect(items).toHaveLength(orderData.items.length);

            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              const originalItem = orderData.items[i];

              // Verify all required item fields
              expect(item.productId).toBe(originalItem.id);
              expect(item.name).toBe(originalItem.name);
              expect(item.price).toBe(originalItem.price);
              expect(item.size).toBe(originalItem.size);
              expect(item.quantity).toBe(originalItem.quantity);
              expect(typeof item.image).toBe('string');

              // Verify no fields are missing
              expect(Object.keys(item)).toContain('productId');
              expect(Object.keys(item)).toContain('name');
              expect(Object.keys(item)).toContain('price');
              expect(Object.keys(item)).toContain('size');
              expect(Object.keys(item)).toContain('quantity');
              expect(Object.keys(item)).toContain('image');
            }
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should calculate and include correct totals for any order', async () => {
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

            // Assert: Verify totals are correct
            const fetchCall = global.fetch.mock.calls[0];
            const [, options] = fetchCall;
            const requestBody = JSON.parse(options.body);

            // Verify subtotal
            const expectedSubtotal = orderData.items.reduce(
              (sum, item) => sum + (item.price * item.quantity),
              0
            );
            expect(requestBody.data.subtotal).toBeCloseTo(expectedSubtotal, 2);

            // Verify shipping
            const expectedShipping = expectedSubtotal >= 100 ? 0 : 10;
            expect(requestBody.data.shipping).toBeCloseTo(expectedShipping, 2);

            // Verify tax
            const expectedTax = expectedSubtotal * 0.1;
            expect(requestBody.data.tax).toBeCloseTo(expectedTax, 2);

            // Verify total
            const expectedTotal = expectedSubtotal + expectedShipping + expectedTax;
            expect(requestBody.data.total).toBeCloseTo(expectedTotal, 2);
          }
        ),
        { numRuns: 3 }
      );
    });
  });

  describe('Property 13: Order data completeness', () => {
    /**
     * **Validates: Requirements 3.3, 3.4, 3.5, 3.6**
     * 
     * Property: For any saved order, the order should contain all required fields:
     * - items (with productId, name, price, size, quantity, image)
     * - customer info (firstName, lastName, email, phone, address, city, postalCode, country)
     * - totals (subtotal, shipping, tax, total)
     * - paymentMethod
     * - timestamp
     */
    it('should contain all required fields for any saved order', async () => {
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

            // Assert: Verify complete order data structure
            const fetchCall = global.fetch.mock.calls[0];
            const [, options] = fetchCall;
            const requestBody = JSON.parse(options.body);
            const orderRequest = requestBody.data;

            // 1. Verify all top-level required fields exist
            expect(orderRequest).toHaveProperty('orderNumber');
            expect(orderRequest).toHaveProperty('customer');
            expect(orderRequest).toHaveProperty('items');
            expect(orderRequest).toHaveProperty('subtotal');
            expect(orderRequest).toHaveProperty('shipping');
            expect(orderRequest).toHaveProperty('tax');
            expect(orderRequest).toHaveProperty('total');
            expect(orderRequest).toHaveProperty('paymentMethod');
            expect(orderRequest).toHaveProperty('order_status');

            // 2. Verify customer info completeness (Requirements 3.4)
            const customer = orderRequest.customer;
            expect(customer).toBeDefined();
            expect(customer).toHaveProperty('firstName');
            expect(customer).toHaveProperty('lastName');
            expect(customer).toHaveProperty('email');
            expect(customer).toHaveProperty('phone');
            expect(customer).toHaveProperty('address');
            expect(customer).toHaveProperty('city');
            expect(customer).toHaveProperty('postalCode');
            expect(customer).toHaveProperty('country');

            // Verify customer fields are not empty/null
            expect(customer.firstName).toBeTruthy();
            expect(customer.lastName).toBeTruthy();
            expect(customer.email).toBeTruthy();
            expect(customer.phone).toBeTruthy();
            expect(customer.address).toBeTruthy();
            expect(customer.city).toBeTruthy();
            expect(customer.postalCode).toBeTruthy();
            expect(customer.country).toBeTruthy();

            // 3. Verify items completeness (Requirements 3.3)
            const items = orderRequest.items;
            expect(Array.isArray(items)).toBe(true);
            expect(items.length).toBeGreaterThan(0);

            // Verify each item has all required fields
            for (const item of items) {
              expect(item).toHaveProperty('productId');
              expect(item).toHaveProperty('name');
              expect(item).toHaveProperty('price');
              expect(item).toHaveProperty('size');
              expect(item).toHaveProperty('quantity');
              expect(item).toHaveProperty('image');

              // Verify item fields are valid
              expect(typeof item.productId).toBe('number');
              expect(item.productId).toBeGreaterThan(0);
              expect(typeof item.name).toBe('string');
              expect(item.name.length).toBeGreaterThan(0);
              expect(typeof item.price).toBe('number');
              expect(item.price).toBeGreaterThan(0);
              expect(typeof item.size).toBe('string');
              expect(item.size.length).toBeGreaterThan(0);
              expect(typeof item.quantity).toBe('number');
              expect(item.quantity).toBeGreaterThan(0);
              expect(typeof item.image).toBe('string');
            }

            // 4. Verify totals completeness (Requirements 3.5)
            expect(typeof orderRequest.subtotal).toBe('number');
            expect(orderRequest.subtotal).toBeGreaterThanOrEqual(0);
            expect(typeof orderRequest.shipping).toBe('number');
            expect(orderRequest.shipping).toBeGreaterThanOrEqual(0);
            expect(typeof orderRequest.tax).toBe('number');
            expect(orderRequest.tax).toBeGreaterThanOrEqual(0);
            expect(typeof orderRequest.total).toBe('number');
            expect(orderRequest.total).toBeGreaterThan(0);

            // 5. Verify payment method (Requirements 3.6)
            expect(typeof orderRequest.paymentMethod).toBe('string');
            expect(orderRequest.paymentMethod.length).toBeGreaterThan(0);
            expect(['cod', 'card', 'paypal']).toContain(orderRequest.paymentMethod);

            // 6. Verify order status
            expect(orderRequest.order_status).toBe('pending');

            // 7. Verify order number format (timestamp component)
            expect(orderRequest.orderNumber).toMatch(/^ORD-\d+-[A-Z0-9]+$/);
            
            // Extract timestamp from order number
            const orderNumberParts = orderRequest.orderNumber.split('-');
            expect(orderNumberParts.length).toBe(3);
            const timestamp = parseInt(orderNumberParts[1], 10);
            expect(timestamp).toBeGreaterThan(0);
            expect(timestamp).toBeLessThanOrEqual(Date.now());

            // 8. Verify data integrity - items match original order data
            expect(items.length).toBe(orderData.items.length);
            for (let i = 0; i < items.length; i++) {
              const requestItem = items[i];
              const originalItem = orderData.items[i];

              expect(requestItem.productId).toBe(originalItem.id);
              expect(requestItem.name).toBe(originalItem.name);
              expect(requestItem.price).toBe(originalItem.price);
              expect(requestItem.size).toBe(originalItem.size);
              expect(requestItem.quantity).toBe(originalItem.quantity);
            }

            // 9. Verify data integrity - customer matches original order data
            expect(customer.firstName).toBe(orderData.customer.firstName);
            expect(customer.lastName).toBe(orderData.customer.lastName);
            expect(customer.email).toBe(orderData.customer.email);
            expect(customer.phone).toBe(orderData.customer.phone);
            expect(customer.address).toBe(orderData.customer.address);
            expect(customer.city).toBe(orderData.customer.city);
            expect(customer.postalCode).toBe(orderData.customer.postalCode);
            expect(customer.country).toBe(orderData.customer.country);

            // 10. Verify data integrity - totals match calculated values
            expect(orderRequest.subtotal).toBeCloseTo(orderData.subtotal, 2);
            expect(orderRequest.shipping).toBeCloseTo(orderData.shipping, 2);
            expect(orderRequest.tax).toBeCloseTo(orderData.tax, 2);
            expect(orderRequest.total).toBeCloseTo(orderData.total, 2);

            // 11. Verify data integrity - payment method matches
            expect(orderRequest.paymentMethod).toBe(orderData.paymentMethod);
          }
        ),
        { numRuns: 3 }
      );
    });
  });
});






