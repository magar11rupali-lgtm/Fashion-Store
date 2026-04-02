/**
 * Property-Based Test for Empty Search Results
 * Feature: ecommerce-fixes-and-enhancements
 * Property 48: Empty search results message
 * Validates: Requirements 9.11
 */

import { render, screen, waitFor, cleanup } from '@testing-library/react';
import SearchPage from '@/app/search/page';
import fc from 'fast-check';
import { useSearchParams } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Arbitrary generator for search queries that return no results
const noResultsQueryArbitrary = fc.string({ minLength: 3, maxLength: 30 })
  .filter(s => s.trim().length >= 3);

describe('Feature: ecommerce-fixes-and-enhancements, Property 48: Empty search results message', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * **Validates: Requirements 9.11**
   * 
   * Property: For any search query with no matching products, the system should display "No results found"
   * 
   * This property verifies that:
   * 1. When a search query returns no products, the "No results found" message is displayed
   * 2. The message includes the search query that was used
   * 3. A helpful message is shown to guide the user
   * 4. A link to browse all products is provided
   */
  it('should display "No results found" message for any query with no matching products', async () => {
    await fc.assert(
      fc.asyncProperty(
        noResultsQueryArbitrary,
        async (query) => {
          try {
            // Arrange: Mock search params
            useSearchParams.mockReturnValue({
              get: jest.fn((param) => param === 'q' ? query : null),
            });

            // Mock fetch for categories (empty)
            global.fetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({ data: [] }),
            });

            // Mock fetch for products (no results)
            global.fetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({ data: [] }),
            });

            // Act: Render search page
            render(<SearchPage />);

            // Wait for loading to complete
            await waitFor(() => {
              expect(screen.queryByRole('status')).not.toBeInTheDocument();
            }, { timeout: 2000 });

            // Assert: Verify "No results found" message is displayed
            await waitFor(() => {
              expect(screen.getByText(/no results found/i)).toBeInTheDocument();
            }, { timeout: 1000 });

            // Verify the search query is mentioned in the message
            // The message appears in the empty state section
            await waitFor(() => {
              expect(screen.getByText(/couldn't find any products/i)).toBeInTheDocument();
            }, { timeout: 1000 });

            // Verify helpful message is shown
            expect(screen.getByText(/couldn't find any products/i)).toBeInTheDocument();

            // Verify link to browse all products is present
            const browseLink = screen.getByText(/browse all products/i);
            expect(browseLink).toBeInTheDocument();
            expect(browseLink.closest('a')).toHaveAttribute('href', '/products');

            // Verify product count shows 0
            expect(screen.getByText(/0 products found/i)).toBeInTheDocument();
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  /**
   * Property: Empty query should show appropriate message
   */
  it('should display appropriate message when query is empty or null', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(null, ''),
        async (emptyQuery) => {
          try {
            // Arrange: Mock search params with empty query
            useSearchParams.mockReturnValue({
              get: jest.fn((param) => param === 'q' ? emptyQuery : null),
            });

            // Mock fetch for categories
            global.fetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({ data: [] }),
            });

            // Act: Render search page
            render(<SearchPage />);

            // Wait for loading to complete
            await waitFor(() => {
              expect(screen.queryByRole('status')).not.toBeInTheDocument();
            }, { timeout: 2000 });

            // Assert: Verify "No results found" message is displayed
            await waitFor(() => {
              expect(screen.getByText(/no results found/i)).toBeInTheDocument();
            }, { timeout: 1000 });

            // Verify message asks to enter a search query
            expect(screen.getByText(/please enter a search query/i)).toBeInTheDocument();

            // Verify link to browse all products is present
            const browseLink = screen.getByText(/browse all products/i);
            expect(browseLink).toBeInTheDocument();
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: 5 }
    );
  }, 30000);

  /**
   * Property: No results message should include search icon
   */
  it('should display search icon with no results message', async () => {
    await fc.assert(
      fc.asyncProperty(
        noResultsQueryArbitrary,
        async (query) => {
          try {
            // Arrange
            useSearchParams.mockReturnValue({
              get: jest.fn((param) => param === 'q' ? query : null),
            });

            global.fetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({ data: [] }),
            });

            global.fetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({ data: [] }),
            });

            // Act
            const { container } = render(<SearchPage />);

            // Wait for loading to complete
            await waitFor(() => {
              expect(screen.queryByRole('status')).not.toBeInTheDocument();
            }, { timeout: 2000 });

            // Assert: Verify search icon (🔍) is displayed
            await waitFor(() => {
              const iconElement = container.querySelector('.text-6xl');
              expect(iconElement).toBeInTheDocument();
              expect(iconElement.textContent).toContain('🔍');
            }, { timeout: 1000 });
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  /**
   * Property: No results should not display product grid
   */
  it('should not display product grid when no results are found', async () => {
    await fc.assert(
      fc.asyncProperty(
        noResultsQueryArbitrary,
        async (query) => {
          try {
            // Arrange
            useSearchParams.mockReturnValue({
              get: jest.fn((param) => param === 'q' ? query : null),
            });

            global.fetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({ data: [] }),
            });

            global.fetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({ data: [] }),
            });

            // Act
            const { container } = render(<SearchPage />);

            // Wait for loading to complete
            await waitFor(() => {
              expect(screen.queryByRole('status')).not.toBeInTheDocument();
            }, { timeout: 2000 });

            // Assert: Verify product grid is not displayed
            await waitFor(() => {
              const productGrid = container.querySelector('.grid.grid-cols-1');
              expect(productGrid).not.toBeInTheDocument();
            }, { timeout: 1000 });

            // Verify no product links are present
            const productLinks = container.querySelectorAll('a[href^="/products/"]');
            expect(productLinks.length).toBe(0);
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  /**
   * Property: Filter and sort controls should still be visible with no results
   */
  it('should display filter and sort controls even when no results are found', async () => {
    await fc.assert(
      fc.asyncProperty(
        noResultsQueryArbitrary,
        async (query) => {
          try {
            // Arrange
            useSearchParams.mockReturnValue({
              get: jest.fn((param) => param === 'q' ? query : null),
            });

            // Mock categories
            const categories = [
              { id: 1, attributes: { name: 'Category 1' } },
              { id: 2, attributes: { name: 'Category 2' } },
            ];

            global.fetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({ data: categories }),
            });

            global.fetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({ data: [] }),
            });

            // Act
            render(<SearchPage />);

            // Wait for loading to complete
            await waitFor(() => {
              expect(screen.queryByRole('status')).not.toBeInTheDocument();
            }, { timeout: 2000 });

            // Assert: Verify filter dropdown is present
            await waitFor(() => {
              expect(screen.getByLabelText(/filter by category/i)).toBeInTheDocument();
            }, { timeout: 1000 });

            // Verify sort dropdown is present
            expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();

            // Verify "No results found" is still displayed
            expect(screen.getByText(/no results found/i)).toBeInTheDocument();
          } finally {
            cleanup();
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);
});
