/**
 * Property-Based Tests for Order Detail Display Completeness
 * Feature: ecommerce-fixes-and-enhancements
 */

import fc from 'fast-check';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import OrderDetailPage from '../../app/orders/[id]/page';
import * as ordersLib from '../../lib/orders';

// Mock Next.js modules
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Mock orders lib
jest.mock('../../lib/orders', () => ({
  getUserOrders: jest.fn(),
  getOrderById: jest.fn(),
  createOrder: jest.fn(),
}));

// Mock components
jest.mock('../../app/components/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('../../app/components/Footer', () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer</div>;
  };
});

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Arbitrary generator for order items
const orderItemArbitrary = fc.record({
  productId: fc.integer({ min: 1, max: 10000 }),
  name: fc.string({ minLength: 3, maxLength: 50 }).filter(s => s.trim().length >= 3),
  price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99), noNaN: true }),
  size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
  quantity: fc.integer({ min: 1, max: 10 }),
  image: fc.option(fc.constant('/uploads/test.png'), { nil: '' }),
});

// Arbitrary generator for customer data
const customerArbitrary = fc.record({
  firstName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length >= 1),
  lastName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length >= 1),
  email: fc.emailAddress(),
  phone: fc.string({ minLength: 10, maxLength: 15 }),
  address: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length >= 5),
  city: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length >= 2),
  postalCode: fc.string({ minLength: 3, maxLength: 10 }).filter(s => s.trim().length >= 3),
  country: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length >= 2),
});

// Arbitrary generator for order detail data
const orderDetailArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 100000 }),
  attributes: fc.record({
    orderNumber: fc.string({ minLength: 10, maxLength: 30 }).map(s => `ORD-${Date.now()}-${s}`),
    items: fc.array(orderItemArbitrary, { minLength: 1, maxLength: 10 }),
    customer: customerArbitrary,
    subtotal: fc.float({ min: Math.fround(1), max: Math.fround(10000), noNaN: true }),
    shipping: fc.float({ min: Math.fround(0), max: Math.fround(50), noNaN: true }),
    tax: fc.float({ min: Math.fround(0), max: Math.fround(1000), noNaN: true }),
    total: fc.float({ min: Math.fround(1), max: Math.fround(11000), noNaN: true }),
    order_status: fc.constantFrom('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
    paymentMethod: fc.constantFrom('cod', 'card', 'paypal'),
    trackingNumber: fc.option(fc.string({ minLength: 10, maxLength: 30 }), { nil: null }),
    createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date() }).map(d => d.toISOString()),
  }),
});

describe('Feature: ecommerce-fixes-and-enhancements, Order Detail Display Property Tests', () => {
  let mockPush;
  let mockRouter;

  beforeEach(() => {
    jest.clearAllMocks();
    cleanup();
    mockPush = jest.fn();
    mockRouter = { push: mockPush };
    useRouter.mockReturnValue(mockRouter);
  });

  afterEach(() => {
    cleanup();
  });

  describe('Property 35: Order detail display completeness', () => {
    /**
     * **Validates: Requirements 7.10**
     * 
     * Property: For any order detail view, the display should contain all items,
     * shipping address, and tracking number (if available)
     */

    it('should display all order items with complete information', async () => {
      await fc.assert(
        fc.asyncProperty(
          orderDetailArbitrary,
          async (order) => {
            // Clear mocks before each iteration
            jest.clearAllMocks();
            cleanup();

            // Arrange: Mock authenticated session
            const mockSession = {
              user: {
                id: 1,
                email: 'test@example.com',
              },
              accessToken: 'mock-token-123',
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            // Mock useParams to return order ID
            useParams.mockReturnValue({
              id: order.id.toString(),
            });

            // Mock getOrderById to return the test order
            ordersLib.getOrderById.mockResolvedValue({
              data: order,
            });

            // Act: Render order detail page
            const { unmount } = render(<OrderDetailPage />);

            // Wait for order to load
            await waitFor(() => {
              expect(ordersLib.getOrderById).toHaveBeenCalledWith(
                order.id.toString(),
                'mock-token-123'
              );
            }, { timeout: 3000 });

            // Assert: Verify all order items are displayed with complete information
            const orderData = order.attributes;

            for (const item of orderData.items) {
              // Requirement 7.10: Item name should be displayed
              await waitFor(() => {
                expect(screen.getByText(item.name)).toBeInTheDocument();
              });

              // Requirement 7.10: Item size should be displayed
              await waitFor(() => {
                expect(screen.getByText(`Size: ${item.size}`)).toBeInTheDocument();
              });

              // Requirement 7.10: Item quantity should be displayed
              await waitFor(() => {
                expect(screen.getByText(`Quantity: ${item.quantity}`)).toBeInTheDocument();
              });

              // Requirement 7.10: Item price should be displayed
              const formattedPrice = Number(item.price).toFixed(2);
              await waitFor(() => {
                const priceElements = screen.getAllByText(formattedPrice);
                expect(priceElements.length).toBeGreaterThan(0);
              });

              // Requirement 7.10: Item line total should be displayed
              const lineTotal = Number(item.price * item.quantity).toFixed(2);
              await waitFor(() => {
                const lineTotalElements = screen.getAllByText(new RegExp(`Total: ${lineTotal}`, 'i'));
                expect(lineTotalElements.length).toBeGreaterThan(0);
              });
            }

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000); // 120 second timeout for property-based test

    it('should display complete shipping address information', async () => {
      await fc.assert(
        fc.asyncProperty(
          orderDetailArbitrary,
          async (order) => {
            // Clear mocks before each iteration
            jest.clearAllMocks();
            cleanup();

            // Arrange: Mock authenticated session
            const mockSession = {
              user: {
                id: 1,
                email: 'test@example.com',
              },
              accessToken: 'mock-token-123',
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            useParams.mockReturnValue({
              id: order.id.toString(),
            });

            ordersLib.getOrderById.mockResolvedValue({
              data: order,
            });

            // Act: Render order detail page
            const { unmount } = render(<OrderDetailPage />);

            // Wait for order to load
            await waitFor(() => {
              expect(ordersLib.getOrderById).toHaveBeenCalledWith(
                order.id.toString(),
                'mock-token-123'
              );
            }, { timeout: 3000 });

            // Assert: Verify shipping address is displayed
            const customer = order.attributes.customer;

            // Requirement 7.10: Customer name should be displayed
            await waitFor(() => {
              const fullName = `${customer.firstName} ${customer.lastName}`;
              expect(screen.getByText(fullName)).toBeInTheDocument();
            });

            // Requirement 7.10: Street address should be displayed
            await waitFor(() => {
              expect(screen.getByText(customer.address)).toBeInTheDocument();
            });

            // Requirement 7.10: City and postal code should be displayed
            await waitFor(() => {
              const cityPostal = `${customer.city}, ${customer.postalCode}`;
              expect(screen.getByText(cityPostal)).toBeInTheDocument();
            });

            // Requirement 7.10: Country should be displayed
            await waitFor(() => {
              expect(screen.getByText(customer.country)).toBeInTheDocument();
            });

            // Requirement 7.10: Phone should be displayed
            await waitFor(() => {
              expect(screen.getByText(new RegExp(`Phone: ${customer.phone}`, 'i'))).toBeInTheDocument();
            });

            // Requirement 7.10: Email should be displayed
            await waitFor(() => {
              expect(screen.getByText(new RegExp(`Email: ${customer.email}`, 'i'))).toBeInTheDocument();
            });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should display tracking number when available', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 100000 }),
            attributes: fc.record({
              orderNumber: fc.string({ minLength: 10, maxLength: 30 }).map(s => `ORD-${Date.now()}-${s}`),
              items: fc.array(orderItemArbitrary, { minLength: 1, maxLength: 5 }),
              customer: customerArbitrary,
              subtotal: fc.float({ min: Math.fround(1), max: Math.fround(10000), noNaN: true }),
              shipping: fc.float({ min: Math.fround(0), max: Math.fround(50), noNaN: true }),
              tax: fc.float({ min: Math.fround(0), max: Math.fround(1000), noNaN: true }),
              total: fc.float({ min: Math.fround(1), max: Math.fround(11000), noNaN: true }),
              order_status: fc.constantFrom('shipped', 'delivered'), // Only shipped/delivered have tracking
              paymentMethod: fc.constantFrom('cod', 'card', 'paypal'),
              trackingNumber: fc.string({ minLength: 10, maxLength: 30 }), // Always has tracking
              createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date() }).map(d => d.toISOString()),
            }),
          }),
          async (order) => {
            // Clear mocks before each iteration
            jest.clearAllMocks();
            cleanup();

            // Arrange: Mock authenticated session
            const mockSession = {
              user: {
                id: 1,
                email: 'test@example.com',
              },
              accessToken: 'mock-token-123',
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            useParams.mockReturnValue({
              id: order.id.toString(),
            });

            ordersLib.getOrderById.mockResolvedValue({
              data: order,
            });

            // Act: Render order detail page
            const { unmount } = render(<OrderDetailPage />);

            // Wait for order to load
            await waitFor(() => {
              expect(ordersLib.getOrderById).toHaveBeenCalledWith(
                order.id.toString(),
                'mock-token-123'
              );
            }, { timeout: 3000 });

            // Assert: Requirement 7.10: Tracking number should be displayed when available
            await waitFor(() => {
              expect(screen.getByText('Tracking Number')).toBeInTheDocument();
              expect(screen.getByText(order.attributes.trackingNumber)).toBeInTheDocument();
            });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should not display tracking number section when not available', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 100000 }),
            attributes: fc.record({
              orderNumber: fc.string({ minLength: 10, maxLength: 30 }).map(s => `ORD-${Date.now()}-${s}`),
              items: fc.array(orderItemArbitrary, { minLength: 1, maxLength: 5 }),
              customer: customerArbitrary,
              subtotal: fc.float({ min: Math.fround(1), max: Math.fround(10000), noNaN: true }),
              shipping: fc.float({ min: Math.fround(0), max: Math.fround(50), noNaN: true }),
              tax: fc.float({ min: Math.fround(0), max: Math.fround(1000), noNaN: true }),
              total: fc.float({ min: Math.fround(1), max: Math.fround(11000), noNaN: true }),
              order_status: fc.constantFrom('pending', 'processing'), // No tracking yet
              paymentMethod: fc.constantFrom('cod', 'card', 'paypal'),
              trackingNumber: fc.constant(null), // No tracking number
              createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date() }).map(d => d.toISOString()),
            }),
          }),
          async (order) => {
            // Clear mocks before each iteration
            jest.clearAllMocks();
            cleanup();

            // Arrange: Mock authenticated session
            const mockSession = {
              user: {
                id: 1,
                email: 'test@example.com',
              },
              accessToken: 'mock-token-123',
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            useParams.mockReturnValue({
              id: order.id.toString(),
            });

            ordersLib.getOrderById.mockResolvedValue({
              data: order,
            });

            // Act: Render order detail page
            const { unmount } = render(<OrderDetailPage />);

            // Wait for order to load
            await waitFor(() => {
              expect(ordersLib.getOrderById).toHaveBeenCalledWith(
                order.id.toString(),
                'mock-token-123'
              );
            }, { timeout: 3000 });

            // Assert: Tracking number section should not be displayed
            await waitFor(() => {
              expect(screen.queryByText('Tracking Number')).not.toBeInTheDocument();
            });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should display order header with order number and date', async () => {
      await fc.assert(
        fc.asyncProperty(
          orderDetailArbitrary,
          async (order) => {
            // Clear mocks before each iteration
            jest.clearAllMocks();
            cleanup();

            // Arrange: Mock authenticated session
            const mockSession = {
              user: {
                id: 1,
                email: 'test@example.com',
              },
              accessToken: 'mock-token-123',
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            useParams.mockReturnValue({
              id: order.id.toString(),
            });

            ordersLib.getOrderById.mockResolvedValue({
              data: order,
            });

            // Act: Render order detail page
            const { unmount } = render(<OrderDetailPage />);

            // Wait for order to load
            await waitFor(() => {
              expect(ordersLib.getOrderById).toHaveBeenCalledWith(
                order.id.toString(),
                'mock-token-123'
              );
            }, { timeout: 3000 });

            // Assert: Order number should be displayed
            await waitFor(() => {
              expect(screen.getByText(new RegExp(`Order #${order.attributes.orderNumber}`, 'i'))).toBeInTheDocument();
            });

            // Assert: Order date should be displayed
            const formattedDate = new Date(order.attributes.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
            await waitFor(() => {
              expect(screen.getByText(new RegExp(`Placed on ${formattedDate}`, 'i'))).toBeInTheDocument();
            });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should display order status with correct styling', async () => {
      await fc.assert(
        fc.asyncProperty(
          orderDetailArbitrary,async (order) => {  // Clear mocks before each iteration  jest.clearAllMocks();  cleanup();  // Arrange: Mock authenticated session
            const mockSession = {
              user: {
                id: 1,
                email: 'test@example.com',
              },
              accessToken: 'mock-token-123',
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            useParams.mockReturnValue({
              id: order.id.toString(),
            });

            ordersLib.getOrderById.mockResolvedValue({
              data: order,
            });

            // Act: Render order detail page
            const { unmount } = render(<OrderDetailPage />);

            // Wait for order to load
            await waitFor(() => {
              expect(ordersLib.getOrderById).toHaveBeenCalledWith(
                order.id.toString(),
                'mock-token-123'
              );
            }, { timeout: 3000 });

            // Assert: Order status should be displayed
            const statusText = order.attributes.order_status.charAt(0).toUpperCase() + 
                              order.attributes.order_status.slice(1);
            await waitFor(() => {
              expect(screen.getByText(statusText)).toBeInTheDocument();
            });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should display order summary with all totals', async () => {
      await fc.assert(
        fc.asyncProperty(
          orderDetailArbitrary,async (order) => {  // Clear mocks before each iteration  jest.clearAllMocks();  cleanup();  // Arrange: Mock authenticated session
            const mockSession = {
              user: {
                id: 1,
                email: 'test@example.com',
              },
              accessToken: 'mock-token-123',
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            useParams.mockReturnValue({
              id: order.id.toString(),
            });

            ordersLib.getOrderById.mockResolvedValue({
              data: order,
            });

            // Act: Render order detail page
            const { unmount } = render(<OrderDetailPage />);

            // Wait for order to load
            await waitFor(() => {
              expect(ordersLib.getOrderById).toHaveBeenCalledWith(
                order.id.toString(),
                'mock-token-123'
              );
            }, { timeout: 3000 });

            // Assert: Subtotal should be displayed
            const formattedSubtotal = Number(order.attributes.subtotal).toFixed(2);
            await waitFor(() => {
              const subtotalElements = screen.getAllByText(formattedSubtotal);
              expect(subtotalElements.length).toBeGreaterThan(0);
            });

            // Assert: Shipping should be displayed
            const formattedShipping = Number(order.attributes.shipping).toFixed(2);
            await waitFor(() => {
              const shippingElements = screen.getAllByText(formattedShipping);
              expect(shippingElements.length).toBeGreaterThan(0);
            });

            // Assert: Tax should be displayed
            const formattedTax = Number(order.attributes.tax).toFixed(2);
            await waitFor(() => {
              const taxElements = screen.getAllByText(formattedTax);
              expect(taxElements.length).toBeGreaterThan(0);
            });

            // Assert: Total should be displayed
            const formattedTotal = Number(order.attributes.total).toFixed(2);
            await waitFor(() => {
              const totalElements = screen.getAllByText(formattedTotal);
              expect(totalElements.length).toBeGreaterThan(0);
            });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should display payment method information', async () => {
      await fc.assert(
        fc.asyncProperty(
          orderDetailArbitrary,async (order) => {  // Clear mocks before each iteration  jest.clearAllMocks();  cleanup();  // Arrange: Mock authenticated session
            const mockSession = {
              user: {
                id: 1,
                email: 'test@example.com',
              },
              accessToken: 'mock-token-123',
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            useParams.mockReturnValue({
              id: order.id.toString(),
            });

            ordersLib.getOrderById.mockResolvedValue({
              data: order,
            });

            // Act: Render order detail page
            const { unmount } = render(<OrderDetailPage />);

            // Wait for order to load
            await waitFor(() => {
              expect(ordersLib.getOrderById).toHaveBeenCalledWith(
                order.id.toString(),
                'mock-token-123'
              );
            }, { timeout: 3000 });

            // Assert: Payment method should be displayed
            await waitFor(() => {
              expect(screen.getByText(/Payment Method:/i)).toBeInTheDocument();
            });

            // Verify payment method text is displayed
            const paymentMethodMap = {
              'cod': 'Cash on Delivery',
              'card': 'Credit/Debit Card',
              'paypal': 'PayPal',
            };
            const expectedPaymentMethod = paymentMethodMap[order.attributes.paymentMethod] || 
                                         order.attributes.paymentMethod;
            await waitFor(() => {
              expect(screen.getByText(expectedPaymentMethod)).toBeInTheDocument();
            });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should display product images for all items', async () => {
      await fc.assert(
        fc.asyncProperty(
          orderDetailArbitrary,async (order) => {  // Clear mocks before each iteration  jest.clearAllMocks();  cleanup();  // Arrange: Mock authenticated session
            const mockSession = {
              user: {
                id: 1,
                email: 'test@example.com',
              },
              accessToken: 'mock-token-123',
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            useParams.mockReturnValue({
              id: order.id.toString(),
            });

            ordersLib.getOrderById.mockResolvedValue({
              data: order,
            });

            // Act: Render order detail page
            const { unmount, container } = render(<OrderDetailPage />);

            // Wait for order to load
            await waitFor(() => {
              expect(ordersLib.getOrderById).toHaveBeenCalledWith(
                order.id.toString(),
                'mock-token-123'
              );
            }, { timeout: 3000 });

            // Assert: Each item should have an image
            await waitFor(() => {
              const images = container.querySelectorAll('img');
              // Filter out header/footer images, focus on product images
              const productImages = Array.from(images).filter(img => 
                img.alt && order.attributes.items.some(item => item.name === img.alt)
              );
              expect(productImages.length).toBe(order.attributes.items.length);
            });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should display back to orders button', async () => {
      await fc.assert(
        fc.asyncProperty(
          orderDetailArbitrary,async (order) => {  // Clear mocks before each iteration  jest.clearAllMocks();  cleanup();  // Arrange: Mock authenticated session
            const mockSession = {
              user: {
                id: 1,
                email: 'test@example.com',
              },
              accessToken: 'mock-token-123',
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            useParams.mockReturnValue({
              id: order.id.toString(),
            });

            ordersLib.getOrderById.mockResolvedValue({
              data: order,
            });

            // Act: Render order detail page
            const { unmount } = render(<OrderDetailPage />);

            // Wait for order to load
            await waitFor(() => {
              expect(ordersLib.getOrderById).toHaveBeenCalledWith(
                order.id.toString(),
                'mock-token-123'
              );
            }, { timeout: 3000 });

            // Assert: Back button should be displayed
            await waitFor(() => {
              expect(screen.getByText(/Back to Orders/i)).toBeInTheDocument();
            });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should handle orders with multiple items correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.integer({ min: 1, max: 100000 }),
            attributes: fc.record({
              orderNumber: fc.string({ minLength: 10, maxLength: 30 }).map(s => `ORD-${Date.now()}-${s}`),
              items: fc.array(orderItemArbitrary, { minLength: 3, maxLength: 10 }), // Multiple items
              customer: customerArbitrary,
              subtotal: fc.float({ min: Math.fround(1), max: Math.fround(10000), noNaN: true }),
              shipping: fc.float({ min: Math.fround(0), max: Math.fround(50), noNaN: true }),
              tax: fc.float({ min: Math.fround(0), max: Math.fround(1000), noNaN: true }),
              total: fc.float({ min: Math.fround(1), max: Math.fround(11000), noNaN: true }),
              order_status: fc.constantFrom('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
              paymentMethod: fc.constantFrom('cod', 'card', 'paypal'),
              trackingNumber: fc.option(fc.string({ minLength: 10, maxLength: 30 }), { nil: null }),
              createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date() }).map(d => d.toISOString()),
            }),
          }),async (order) => {  // Clear mocks before each iteration  jest.clearAllMocks();  cleanup();  // Arrange: Mock authenticated session
            const mockSession = {
              user: {
                id: 1,
                email: 'test@example.com',
              },
              accessToken: 'mock-token-123',
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            useParams.mockReturnValue({
              id: order.id.toString(),
            });

            ordersLib.getOrderById.mockResolvedValue({
              data: order,
            });

            // Act: Render order detail page
            const { unmount } = render(<OrderDetailPage />);

            // Wait for order to load
            await waitFor(() => {
              expect(ordersLib.getOrderById).toHaveBeenCalledWith(
                order.id.toString(),
                'mock-token-123'
              );
            }, { timeout: 3000 });

            // Assert: All items should be displayed
            for (const item of order.attributes.items) {
              await waitFor(() => {
                expect(screen.getByText(item.name)).toBeInTheDocument();
              });
            }

            // Assert: Order Items section should be present
            await waitFor(() => {
              expect(screen.getByText('Order Items')).toBeInTheDocument();
            });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should display loading state before order is fetched', async () => {
      await fc.assert(
        fc.asyncProperty(
          orderDetailArbitrary,async (order) => {  // Clear mocks before each iteration  jest.clearAllMocks();  cleanup();  // Arrange: Mock authenticated session
            const mockSession = {
              user: {
                id: 1,
                email: 'test@example.com',
              },
              accessToken: 'mock-token-123',
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            useParams.mockReturnValue({
              id: order.id.toString(),
            });

            // Mock getOrderById with a delay to capture loading state
            let resolveOrder;
            const orderPromise = new Promise(resolve => {
              resolveOrder = resolve;
            });
            ordersLib.getOrderById.mockReturnValue(orderPromise);

            // Act: Render order detail page
            const { unmount } = render(<OrderDetailPage />);

            // Assert: Should show loading message initially
            await waitFor(() => {
              expect(screen.getByText(/Loading order details/i)).toBeInTheDocument();
            });

            // Resolve the order
            resolveOrder({ data: order });

            // Wait for order to load
            await waitFor(() => {
              expect(ordersLib.getOrderById).toHaveBeenCalledWith(
                order.id.toString(),
                'mock-token-123'
              );
            }, { timeout: 3000 });

            // After loading, order details should be displayed
            await waitFor(() => {
              expect(screen.getByText(new RegExp(`Order #${order.attributes.orderNumber}`, 'i'))).toBeInTheDocument();
            });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should display error message when order fetch fails', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 100000 }),
          fc.string({ minLength: 10, maxLength: 100 }),
          async (orderId, errorMessage) => {
            // Clear mocks before each iteration
            jest.clearAllMocks();
            cleanup();

            // Arrange: Mock authenticated session
            const mockSession = {
              user: {
                id: 1,
                email: 'test@example.com',
              },
              accessToken: 'mock-token-123',
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            useParams.mockReturnValue({
              id: orderId.toString(),
            });

            // Mock getOrderById to throw an error
            ordersLib.getOrderById.mockRejectedValue(new Error(errorMessage));

            // Act: Render order detail page
            const { unmount } = render(<OrderDetailPage />);

            // Wait for error to be displayed
            await waitFor(() => {
              expect(ordersLib.getOrderById).toHaveBeenCalledWith(
                orderId.toString(),
                'mock-token-123'
              );
            }, { timeout: 3000 });

            // Assert: Should show error message
            await waitFor(() => {
              expect(screen.getByText(/Failed to load order details/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);

    it('should call getOrderById with correct parameters', async () => {
      await fc.assert(
        fc.asyncProperty(
          orderDetailArbitrary,
          fc.string({ minLength: 10, maxLength: 50 }),
          async (order, accessToken) => {
            // Clear mocks before each iteration
            jest.clearAllMocks();

            // Arrange: Mock authenticated session with custom token
            const mockSession = {
              user: {
                id: 1,
                email: 'test@example.com',
              },
              accessToken: accessToken,
            };

            useSession.mockReturnValue({
              data: mockSession,
              status: 'authenticated',
            });

            useParams.mockReturnValue({
              id: order.id.toString(),
            });

            ordersLib.getOrderById.mockResolvedValue({
              data: order,
            });

            // Act: Render order detail page
            const { unmount } = render(<OrderDetailPage />);

            // Assert: getOrderById should be called with correct parameters
            await waitFor(() => {
              expect(ordersLib.getOrderById).toHaveBeenCalledWith(
                order.id.toString(),
                accessToken
              );
            }, { timeout: 3000 });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    }, 30000);
  });
});









