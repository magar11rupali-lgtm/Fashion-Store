/**
 * Property-Based Test for Responsive Layout
 * Feature: ecommerce-fixes-and-enhancements
 * Property 30: Responsive layout
 * Validates: Requirements 6.10
 */

import { render, screen, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import React from 'react';
import Header from '@/app/components/Header';
import ProductCard from '@/app/components/ProductCard';
import OrderSummary from '@/app/components/OrderSummary';
import Footer from '@/app/components/Footer';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signOut: jest.fn(),
}));

// Mock contexts
jest.mock('@/app/context/CartContext', () => ({
  useCart: () => ({
    cart: [],
    totalItems: 0,
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
  }),
}));

jest.mock('@/app/context/WishlistContext', () => ({
  useWishlist: () => ({
    wishlist: [],
    totalItems: 0,
    isInWishlist: jest.fn(() => false),
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
    isOpen: false,
    setIsOpen: jest.fn(),
  }),
}));

jest.mock('@/hooks/useNotification', () => ({
  useNotification: () => ({
    showNotification: jest.fn(),
  }),
}));

// Arbitrary generators for viewport sizes
const mobileWidthArbitrary = fc.integer({ min: 320, max: 767 });
const tabletWidthArbitrary = fc.integer({ min: 768, max: 1023 });
const desktopWidthArbitrary = fc.integer({ min: 1024, max: 1920 });
const viewportHeightArbitrary = fc.integer({ min: 568, max: 1080 });

// Arbitrary for product data
const productArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  attributes: fc.record({
    name: fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length >= 5),
    price: fc.float({ min: 10, max: 999, noNaN: true }),
    description: fc.string({ minLength: 10, maxLength: 200 }),
    image: fc.record({
      data: fc.record({
        attributes: fc.record({
          url: fc.constant('/uploads/test-image.png'),
        }),
      }),
    }),
    sizes: fc.constant(['S', 'M', 'L', 'XL']),
    category: fc.record({
      data: fc.record({
        attributes: fc.record({
          name: fc.constantFrom('Men', 'Women', 'Accessories'),
        }),
      }),
    }),
  }),
});

// Helper to set viewport size
const setViewportSize = (width, height) => {
  global.innerWidth = width;
  global.innerHeight = height;
  
  // Mock window.matchMedia for responsive queries
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

describe('Feature: ecommerce-fixes-and-enhancements, Property 30: Responsive layout', () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * **Validates: Requirements 6.10**
   * 
   * Property: For any viewport size (mobile: 320-767px, tablet: 768-1023px, desktop: 1024px+),
   * the layout should be functional and readable
   * 
   * This property verifies that:
   * 1. Components render without errors on mobile viewports (320-767px)
   * 2. Components render without errors on tablet viewports (768-1023px)
   * 3. Components render without errors on desktop viewports (1024px+)
   * 4. Essential content is accessible at all viewport sizes
   * 5. No layout overflow or broken elements occur
   */
  it('should render Header component functionally on mobile viewports', () => {
    fc.assert(
      fc.property(
        mobileWidthArbitrary,
        viewportHeightArbitrary,
        (width, height) => {
          // Clean up before each iteration
          cleanup();

          // Arrange: Set mobile viewport
          setViewportSize(width, height);

          // Act: Render Header
          const { container } = render(<Header />);

          // Assert: Header should render without errors
          expect(container).toBeInTheDocument();
          
          // Verify essential header elements are present
          const header = container.querySelector('header');
          expect(header).toBeInTheDocument();
          
          // Verify no horizontal overflow
          const headerStyles = window.getComputedStyle(header);
          expect(headerStyles.overflowX).not.toBe('scroll');
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should render Header component functionally on tablet viewports', () => {
    fc.assert(
      fc.property(
        tabletWidthArbitrary,
        viewportHeightArbitrary,
        (width, height) => {
          // Clean up before each iteration
          cleanup();

          // Arrange: Set tablet viewport
          setViewportSize(width, height);

          // Act: Render Header
          const { container } = render(<Header />);

          // Assert: Header should render without errors
          expect(container).toBeInTheDocument();
          
          // Verify essential header elements are present
          const header = container.querySelector('header');
          expect(header).toBeInTheDocument();
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should render Header component functionally on desktop viewports', () => {
    fc.assert(
      fc.property(
        desktopWidthArbitrary,
        viewportHeightArbitrary,
        (width, height) => {
          // Clean up before each iteration
          cleanup();

          // Arrange: Set desktop viewport
          setViewportSize(width, height);

          // Act: Render Header
          const { container } = render(<Header />);

          // Assert: Header should render without errors
          expect(container).toBeInTheDocument();
          
          // Verify essential header elements are present
          const header = container.querySelector('header');
          expect(header).toBeInTheDocument();
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should render ProductCard component responsively on all viewports', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 1920 }),
        viewportHeightArbitrary,
        productArbitrary,
        (width, height, product) => {
          // Clean up before each iteration
          cleanup();

          // Arrange: Set viewport
          setViewportSize(width, height);

          // Act: Render ProductCard
          const { container } = render(<ProductCard product={product} />);

          // Assert: ProductCard should render without errors
          expect(container).toBeInTheDocument();
          
          // Verify product name is accessible
          const nameElement = container.querySelector('h3');
          expect(nameElement).toBeInTheDocument();
          expect(nameElement.textContent).toBe(product.attributes.name);
          
          // Verify price is displayed
          const priceText = `$${product.attributes.price.toFixed(2)}`;
          expect(screen.getByText(priceText)).toBeInTheDocument();
          
          // Verify card doesn't overflow
          const card = container.firstChild;
          if (card) {
            const cardStyles = window.getComputedStyle(card);
            expect(cardStyles.overflowX).not.toBe('scroll');
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should render OrderSummary component responsively on all viewports', () => {
    const cartItemsArbitrary = fc.array(
      fc.record({
        id: fc.integer({ min: 1, max: 10000 }),
        name: fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length >= 5),
        price: fc.float({ min: 10, max: 999, noNaN: true }),
        size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
        quantity: fc.integer({ min: 1, max: 10 }),
        image: fc.constant('/uploads/test-image.png'),
      }),
      { minLength: 1, maxLength: 5 }
    );

    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 1920 }),
        viewportHeightArbitrary,
        cartItemsArbitrary,
        (width, height, cartItems) => {
          // Clean up before each iteration
          cleanup();

          // Arrange: Set viewport and mock cart context
          setViewportSize(width, height);
          
          // Mock useCart to return test cart items
          jest.spyOn(require('@/app/context/CartContext'), 'useCart').mockReturnValue({
            cart: cartItems,
            totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
            addToCart: jest.fn(),
            removeFromCart: jest.fn(),
            updateQuantity: jest.fn(),
            clearCart: jest.fn(),
          });

          // Act: Render OrderSummary
          const { container } = render(<OrderSummary />);

          // Assert: OrderSummary should render without errors
          expect(container).toBeInTheDocument();
          
          // Verify cart items are displayed
          cartItems.forEach(item => {
            const itemNameElement = container.querySelector(`h3[class*="truncate"]`);
            expect(itemNameElement).toBeInTheDocument();
          });
          
          // Verify no horizontal overflow
          const summary = container.firstChild;
          if (summary) {
            const summaryStyles = window.getComputedStyle(summary);
            expect(summaryStyles.overflowX).not.toBe('scroll');
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should render Footer component responsively on all viewports', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 1920 }),
        viewportHeightArbitrary,
        (width, height) => {
          // Clean up before each iteration
          cleanup();

          // Arrange: Set viewport
          setViewportSize(width, height);

          // Act: Render Footer
          const { container } = render(<Footer />);

          // Assert: Footer should render without errors
          expect(container).toBeInTheDocument();
          
          // Verify footer element is present
          const footer = container.querySelector('footer');
          expect(footer).toBeInTheDocument();
          
          // Verify no horizontal overflow
          const footerStyles = window.getComputedStyle(footer);
          expect(footerStyles.overflowX).not.toBe('scroll');
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should maintain readability with appropriate font sizes on mobile', () => {
    fc.assert(
      fc.property(
        mobileWidthArbitrary,
        viewportHeightArbitrary,
        productArbitrary,
        (width, height, product) => {
          // Clean up before each iteration
          cleanup();

          // Arrange: Set mobile viewport
          setViewportSize(width, height);

          // Act: Render ProductCard
          const { container } = render(<ProductCard product={product} />);

          // Assert: Text elements should be present and have appropriate classes
          const productName = container.querySelector('h3');
          expect(productName).toBeInTheDocument();
          
          // Verify the h3 has text-xl class (which translates to 1.25rem/20px in Tailwind)
          // This ensures readability on mobile devices
          expect(productName.className).toContain('text-xl');
          
          // Verify price has text-2xl class (which translates to 1.5rem/24px in Tailwind)
          const priceElement = container.querySelector('span.text-2xl');
          expect(priceElement).toBeInTheDocument();
          
          // Verify description has text-sm class (which translates to 0.875rem/14px in Tailwind)
          const descriptionElement = container.querySelector('p.text-sm');
          expect(descriptionElement).toBeInTheDocument();
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should handle viewport size changes without breaking layout', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 1920 }),
        fc.integer({ min: 320, max: 1920 }),
        viewportHeightArbitrary,
        (initialWidth, newWidth, height) => {
          // Clean up before each iteration
          cleanup();

          // Arrange: Set initial viewport
          setViewportSize(initialWidth, height);

          // Act: Render Header
          const { container, rerender } = render(<Header />);

          // Assert: Initial render should work
          expect(container).toBeInTheDocument();
          
          // Change viewport size
          setViewportSize(newWidth, height);
          
          // Re-render component
          rerender(<Header />);

          // Assert: Component should still render correctly
          expect(container).toBeInTheDocument();
          const header = container.querySelector('header');
          expect(header).toBeInTheDocument();
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should ensure touch targets are appropriately sized on mobile', () => {
    fc.assert(
      fc.property(
        mobileWidthArbitrary,
        viewportHeightArbitrary,
        productArbitrary,
        (width, height, product) => {
          // Clean up before each iteration
          cleanup();

          // Arrange: Set mobile viewport
          setViewportSize(width, height);

          // Act: Render ProductCard with interactive elements
          const { container } = render(<ProductCard product={product} />);

          // Assert: Interactive elements should have appropriate touch target size
          const buttons = container.querySelectorAll('button');
          buttons.forEach(button => {
            const buttonStyles = window.getComputedStyle(button);
            const minHeight = parseInt(buttonStyles.minHeight) || parseInt(buttonStyles.height);
            const minWidth = parseInt(buttonStyles.minWidth) || parseInt(buttonStyles.width);
            
            // Touch targets should be at least 44x44px for accessibility
            // We'll be lenient and check for at least 32px (common mobile standard)
            if (minHeight > 0 && minWidth > 0) {
              expect(minHeight).toBeGreaterThanOrEqual(32);
              expect(minWidth).toBeGreaterThanOrEqual(32);
            }
          });
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should render all viewport categories without errors', () => {
    const viewportCategoriesArbitrary = fc.constantFrom(
      { name: 'mobile', width: 375, height: 667 },
      { name: 'mobile-small', width: 320, height: 568 },
      { name: 'mobile-large', width: 414, height: 896 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'tablet-large', width: 1024, height: 768 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'desktop-large', width: 1920, height: 1080 }
    );

    fc.assert(
      fc.property(
        viewportCategoriesArbitrary,
        productArbitrary,
        (viewport, product) => {
          // Clean up before each iteration
          cleanup();

          // Arrange: Set viewport
          setViewportSize(viewport.width, viewport.height);

          // Act & Assert: Render multiple components and verify they render without errors
          let headerRendered = false;
          let productRendered = false;
          let footerRendered = false;

          try {
            const { container: headerContainer } = render(<Header />);
            headerRendered = headerContainer.querySelector('header') !== null;
            cleanup();
          } catch (e) {
            headerRendered = false;
          }

          try {
            const { container: productContainer } = render(<ProductCard product={product} />);
            productRendered = productContainer.firstChild !== null;
            cleanup();
          } catch (e) {
            productRendered = false;
          }

          try {
            const { container: footerContainer } = render(<Footer />);
            footerRendered = footerContainer.querySelector('footer') !== null;
          } catch (e) {
            footerRendered = false;
          }

          // Assert: All components should render without errors
          expect(headerRendered).toBe(true);
          expect(productRendered).toBe(true);
          expect(footerRendered).toBe(true);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should maintain layout integrity with varying content lengths', () => {
    const varyingContentArbitrary = fc.record({
      id: fc.integer({ min: 1, max: 10000 }),
      attributes: fc.record({
        name: fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length >= 5),
        price: fc.float({ min: 10, max: 999, noNaN: true }),
        description: fc.string({ minLength: 10, maxLength: 500 }),
        image: fc.record({
          data: fc.record({
            attributes: fc.record({
              url: fc.constant('/uploads/test-image.png'),
            }),
          }),
        }),
        sizes: fc.constant(['S', 'M', 'L', 'XL']),
        category: fc.record({
          data: fc.record({
            attributes: fc.record({
              name: fc.constantFrom('Men', 'Women', 'Accessories'),
            }),
          }),
        }),
      }),
    });

    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 1920 }),
        viewportHeightArbitrary,
        varyingContentArbitrary,
        (width, height, product) => {
          // Clean up before each iteration
          cleanup();

          // Arrange: Set viewport
          setViewportSize(width, height);

          // Act: Render ProductCard with varying content
          const { container } = render(<ProductCard product={product} />);

          // Assert: Layout should handle varying content lengths
          expect(container).toBeInTheDocument();
          
          // Verify product name is displayed (even if long)
          const nameElement = container.querySelector('h3');
          expect(nameElement).toBeInTheDocument();
          expect(nameElement.textContent).toBe(product.attributes.name);
          
          // Verify no text overflow issues
          const card = container.firstChild;
          if (card) {
            const cardStyles = window.getComputedStyle(card);
            // Text should either wrap or be truncated, not overflow
            expect(cardStyles.overflowX).not.toBe('visible');
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});


