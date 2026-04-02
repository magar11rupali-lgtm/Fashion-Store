/**
 * Property-Based Tests for Regular User Admin Access Prevention
 * Feature: ecommerce-fixes-and-enhancements
 */

import fc from 'fast-check';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdminDashboard from '../../app/admin/page';
import * as adminAuth from '../../lib/admin-auth';

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock admin-auth module
jest.mock('../../lib/admin-auth', () => ({
  checkAuth: jest.fn(),
  logout: jest.fn(),
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

jest.mock('../../app/components/admin/DashboardStats', () => {
  return function MockDashboardStats() {
    return <div data-testid="dashboard-stats">Dashboard Stats</div>;
  };
});

jest.mock('../../app/components/admin/ProductsTable', () => {
  return function MockProductsTable() {
    return <div data-testid="products-table">Products Table</div>;
  };
});

jest.mock('../../app/components/admin/OrdersTable', () => {
  return function MockOrdersTable() {
    return <div data-testid="orders-table">Orders Table</div>;
  };
});

describe('Feature: ecommerce-fixes-and-enhancements, Regular User Admin Access Prevention', () => {
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

  describe('Property 41: Regular user admin access prevention', () => {
    /**
     * **Validates: Requirements 8.10**
     * 
     * Property: For any regular authenticated user (non-admin), attempting to access
     * the admin dashboard should be denied and redirected to admin login page
     */

    // Arbitrary generator for regular user sessions
    const regularUserSessionArbitrary = fc.record({
      user: fc.record({
        id: fc.integer({ min: 1, max: 10000 }),
        name: fc.string({ minLength: 3, maxLength: 30 }),
        email: fc.emailAddress(),
      }),
      accessToken: fc.string({ minLength: 20, maxLength: 100 }),
      expires: fc.integer({ min: Date.now(), max: Date.now() + 86400000 }).map(timestamp => new Date(timestamp).toISOString()),
    });

    it('should prevent regular authenticated users from accessing admin dashboard', async () => {
      await fc.assert(
        fc.asyncProperty(
          regularUserSessionArbitrary,
          async (userSession) => {
            // Arrange: Mock regular user session (authenticated via NextAuth)
            useSession.mockReturnValue({
              data: userSession,
              status: 'authenticated',
            });

            // Mock admin authentication as false (not admin)
            adminAuth.checkAuth.mockReturnValue(false);

            // Act: Render admin dashboard
            const { unmount } = render(<AdminDashboard />);

            // Assert: Should redirect to admin login page
            await waitFor(() => {
              expect(mockPush).toHaveBeenCalledWith('/auth/admin-login');
            });

            // Verify admin dashboard content is NOT rendered
            expect(screen.queryByText(/manage your e-commerce store/i)).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();

            // Verify loading/redirect state is shown
            expect(screen.queryByText(/verifying authentication/i)).toBeInTheDocument();
            
            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should redirect regular users regardless of their user ID', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 999999 }),
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.emailAddress(),
          async (userId, userName, userEmail) => {
            // Arrange: Mock regular user session with various user IDs
            useSession.mockReturnValue({
              data: {
                user: {
                  id: userId,
                  name: userName,
                  email: userEmail,
                },
                accessToken: 'valid-jwt-token',
                expires: new Date(Date.now() + 86400000).toISOString(),
              },
              status: 'authenticated',
            });

            // Mock admin authentication as false
            adminAuth.checkAuth.mockReturnValue(false);

            // Act: Render admin dashboard
            const { unmount } = render(<AdminDashboard />);

            // Assert: Should always redirect regardless of user ID
            await waitFor(() => {
              expect(mockPush).toHaveBeenCalledWith('/auth/admin-login');
            });

            // Verify admin content is not accessible
            expect(screen.queryByText(/manage your e-commerce store/i)).not.toBeInTheDocument();
            
            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should not grant admin access based on NextAuth session alone', async () => {
      await fc.assert(
        fc.asyncProperty(
          regularUserSessionArbitrary,
          async (userSession) => {
            // Arrange: Mock regular user with valid NextAuth session
            useSession.mockReturnValue({
              data: userSession,
              status: 'authenticated',
            });

            // Mock admin authentication as false (critical: NextAuth session ≠ admin session)
            adminAuth.checkAuth.mockReturnValue(false);

            // Act: Render admin dashboard
            const { unmount } = render(<AdminDashboard />);

            // Assert: NextAuth session should NOT grant admin access
            await waitFor(() => {
              expect(mockPush).toHaveBeenCalledWith('/auth/admin-login');
            });

            // Verify checkAuth was called (admin auth check is separate from NextAuth)
            expect(adminAuth.checkAuth).toHaveBeenCalled();

            // Verify admin dashboard is not rendered
            expect(screen.queryByText(/admin dashboard/i)).not.toBeInTheDocument();
            expect(screen.queryByTestId('dashboard-stats')).not.toBeInTheDocument();
            
            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should enforce admin authentication check even with valid user tokens', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 50, maxLength: 200 }),
          regularUserSessionArbitrary,
          async (accessToken, userSession) => {
            // Arrange: Mock regular user with valid access token
            useSession.mockReturnValue({
              data: {
                ...userSession,
                accessToken: accessToken,
              },
              status: 'authenticated',
            });

            // Mock admin authentication as false
            adminAuth.checkAuth.mockReturnValue(false);

            // Act: Render admin dashboard
            const { unmount } = render(<AdminDashboard />);

            // Assert: Valid user token should NOT bypass admin authentication
            await waitFor(() => {
              expect(mockPush).toHaveBeenCalledWith('/auth/admin-login');
            });

            // Verify admin authentication check was performed
            expect(adminAuth.checkAuth).toHaveBeenCalled();

            // Verify admin content is not accessible
            expect(screen.queryByText(/📊 overview/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/📦 products/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/🛒 orders/i)).not.toBeInTheDocument();
            
            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should consistently deny admin access across multiple regular user sessions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(regularUserSessionArbitrary, { minLength: 2, maxLength: 5 }),
          async (userSessions) => {
            // Test multiple different regular user sessions
            for (const userSession of userSessions) {
              // Arrange: Mock regular user session
              useSession.mockReturnValue({
                data: userSession,
                status: 'authenticated',
              });

              // Mock admin authentication as false
              adminAuth.checkAuth.mockReturnValue(false);

              // Act: Render admin dashboard
              const { unmount } = render(<AdminDashboard />);

              // Assert: Should consistently redirect for all regular users
              await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/auth/admin-login');
              });

              // Verify admin content is not rendered
              expect(screen.queryByText(/manage your e-commerce store/i)).not.toBeInTheDocument();

              // Cleanup for next iteration
              unmount();
              cleanup();
              mockPush.mockClear();
              adminAuth.checkAuth.mockClear();
            }
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should not expose admin functionality to regular users', async () => {
      await fc.assert(
        fc.asyncProperty(
          regularUserSessionArbitrary,
          async (userSession) => {
            // Arrange: Mock regular user session
            useSession.mockReturnValue({
              data: userSession,
              status: 'authenticated',
            });

            // Mock admin authentication as false
            adminAuth.checkAuth.mockReturnValue(false);

            // Act: Render admin dashboard
            const { unmount } = render(<AdminDashboard />);

            // Assert: No admin functionality should be exposed
            expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
            expect(screen.queryByText(/📊 overview/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/📦 products/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/🛒 orders/i)).not.toBeInTheDocument();
            expect(screen.queryByTestId('dashboard-stats')).not.toBeInTheDocument();
            expect(screen.queryByTestId('products-table')).not.toBeInTheDocument();
            expect(screen.queryByTestId('orders-table')).not.toBeInTheDocument();

            // Verify redirect is called
            await waitFor(() => {
              expect(mockPush).toHaveBeenCalledWith('/auth/admin-login');
            });
            
            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should maintain separation between user authentication and admin authentication', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userAuthenticated: fc.constant(true),
            adminAuthenticated: fc.constant(false),
            userSession: regularUserSessionArbitrary,
          }),
          async ({ userAuthenticated, adminAuthenticated, userSession }) => {
            // Arrange: Mock regular user authenticated, but NOT admin authenticated
            useSession.mockReturnValue({
              data: userSession,
              status: userAuthenticated ? 'authenticated' : 'unauthenticated',
            });

            adminAuth.checkAuth.mockReturnValue(adminAuthenticated);

            // Act: Render admin dashboard
            const { unmount } = render(<AdminDashboard />);

            // Assert: User authentication should NOT grant admin access
            await waitFor(() => {
              expect(mockPush).toHaveBeenCalledWith('/auth/admin-login');
            });

            // Verify both authentication systems are checked independently
            expect(adminAuth.checkAuth).toHaveBeenCalled();

            // Verify admin dashboard is not accessible
            expect(screen.queryByText(/admin dashboard/i)).not.toBeInTheDocument();
            
            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should redirect regular users with any email domain', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          async (email) => {
            // Arrange: Mock regular user with various email domains
            useSession.mockReturnValue({
              data: {
                user: {
                  id: 123,
                  name: 'Regular User',
                  email: email,
                },
                accessToken: 'valid-token',
                expires: new Date(Date.now() + 86400000).toISOString(),
              },
              status: 'authenticated',
            });

            // Mock admin authentication as false
            adminAuth.checkAuth.mockReturnValue(false);

            // Act: Render admin dashboard
            const { unmount } = render(<AdminDashboard />);

            // Assert: Should redirect regardless of email domain
            await waitFor(() => {
              expect(mockPush).toHaveBeenCalledWith('/auth/admin-login');
            });

            // Verify admin content is not accessible
            expect(screen.queryByText(/manage your e-commerce store/i)).not.toBeInTheDocument();
            
            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should prevent admin access for users with expired sessions', async () => {
      await fc.assert(
        fc.asyncProperty(
          regularUserSessionArbitrary,
          async (userSession) => {
            // Arrange: Mock regular user with expired session
            useSession.mockReturnValue({
              data: {
                ...userSession,
                expires: new Date(Date.now() - 86400000).toISOString(), // Expired
              },
              status: 'authenticated', // Still marked as authenticated
            });

            // Mock admin authentication as false
            adminAuth.checkAuth.mockReturnValue(false);

            // Act: Render admin dashboard
            const { unmount } = render(<AdminDashboard />);

            // Assert: Should redirect even with expired session
            await waitFor(() => {
              expect(mockPush).toHaveBeenCalledWith('/auth/admin-login');
            });

            // Verify admin content is not accessible
            expect(screen.queryByText(/admin dashboard/i)).not.toBeInTheDocument();
            
            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should verify admin authentication check is the sole gatekeeper', async () => {
      await fc.assert(
        fc.asyncProperty(
          regularUserSessionArbitrary,
          fc.boolean(),
          async (userSession, hasUserSession) => {
            // Arrange: Mock user session (may or may not exist)
            useSession.mockReturnValue({
              data: hasUserSession ? userSession : null,
              status: hasUserSession ? 'authenticated' : 'unauthenticated',
            });

            // Mock admin authentication as false (this is the critical check)
            adminAuth.checkAuth.mockReturnValue(false);

            // Act: Render admin dashboard
            const { unmount } = render(<AdminDashboard />);

            // Assert: Admin authentication check should be the sole gatekeeper
            await waitFor(() => {
              expect(mockPush).toHaveBeenCalledWith('/auth/admin-login');
            });

            // Verify checkAuth was called (the sole gatekeeper)
            expect(adminAuth.checkAuth).toHaveBeenCalled();

            // Verify admin content is not accessible regardless of user session
            expect(screen.queryByText(/manage your e-commerce store/i)).not.toBeInTheDocument();
            
            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should show loading state before redirect for regular users', async () => {
      await fc.assert(
        fc.asyncProperty(
          regularUserSessionArbitrary,
          async (userSession) => {
            // Arrange: Mock regular user session
            useSession.mockReturnValue({
              data: userSession,
              status: 'authenticated',
            });

            // Mock admin authentication as false
            adminAuth.checkAuth.mockReturnValue(false);

            // Act: Render admin dashboard
            const { unmount } = render(<AdminDashboard />);

            // Assert: Loading state should be visible before redirect
            expect(screen.queryByText(/verifying authentication/i)).toBeInTheDocument();

            // Loading spinner should be rendered
            const spinner = document.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();

            // Admin dashboard content should NOT be visible
            expect(screen.queryByText(/manage your e-commerce store/i)).not.toBeInTheDocument();

            // Redirect should be called
            await waitFor(() => {
              expect(mockPush).toHaveBeenCalledWith('/auth/admin-login');
            });
            
            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should prevent admin access for any non-admin authentication state', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userSession: fc.option(regularUserSessionArbitrary, { nil: null }),
            userStatus: fc.constantFrom('authenticated', 'unauthenticated', 'loading'),
            adminAuth: fc.constant(false),
          }),
          async ({ userSession, userStatus, adminAuth: isAdmin }) => {
            // Arrange: Mock various user authentication states
            useSession.mockReturnValue({
              data: userSession,
              status: userStatus,
            });

            // Mock admin authentication as false (critical check)
            adminAuth.checkAuth.mockReturnValue(isAdmin);

            // Act: Render admin dashboard
            const { unmount } = render(<AdminDashboard />);

            // Assert: Should always redirect when admin auth is false
            await waitFor(() => {
              expect(mockPush).toHaveBeenCalledWith('/auth/admin-login');
            });

            // Verify admin content is not accessible
            expect(screen.queryByText(/manage your e-commerce store/i)).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
            
            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should enforce admin route protection immediately on mount', async () => {
      await fc.assert(
        fc.asyncProperty(
          regularUserSessionArbitrary,
          async (userSession) => {
            // Arrange: Mock regular user session
            useSession.mockReturnValue({
              data: userSession,
              status: 'authenticated',
            });

            // Mock admin authentication as false
            adminAuth.checkAuth.mockReturnValue(false);

            // Track when component mounts
            const mountTime = Date.now();

            // Act: Render admin dashboard
            const { unmount } = render(<AdminDashboard />);

            // Assert: Protection should be enforced immediately
            await waitFor(() => {
              expect(adminAuth.checkAuth).toHaveBeenCalled();
              expect(mockPush).toHaveBeenCalledWith('/auth/admin-login');
              
              // Should happen quickly (within 1 second)
              const elapsed = Date.now() - mountTime;
              expect(elapsed).toBeLessThan(1000);
            });
            
            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should not allow regular users to bypass admin check through any means', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.integer({ min: 1, max: 999999 }),
            userName: fc.string({ minLength: 1, maxLength: 50 }),
            userEmail: fc.emailAddress(),
            accessToken: fc.string({ minLength: 20, maxLength: 200 }),
            expires: fc.integer({ min: Date.now(), max: Date.now() + 86400000 }).map(timestamp => new Date(timestamp).toISOString()),
          }),
          async (userSessionData) => {
            // Arrange: Mock regular user with complete session data
            useSession.mockReturnValue({
              data: {
                user: {
                  id: userSessionData.userId,
                  name: userSessionData.userName,
                  email: userSessionData.userEmail,
                },
                accessToken: userSessionData.accessToken,
                expires: userSessionData.expires,
              },
              status: 'authenticated',
            });

            // Mock admin authentication as false (the critical gatekeeper)
            adminAuth.checkAuth.mockReturnValue(false);

            // Act: Render admin dashboard
            const { unmount } = render(<AdminDashboard />);

            // Assert: No bypass should be possible
            await waitFor(() => {
              expect(mockPush).toHaveBeenCalledWith('/auth/admin-login');
            });

            // Verify admin authentication check was performed
            expect(adminAuth.checkAuth).toHaveBeenCalled();

            // Verify no admin functionality is exposed
            expect(screen.queryByText(/admin dashboard/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/📊 overview/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/📦 products/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/🛒 orders/i)).not.toBeInTheDocument();
            expect(screen.queryByTestId('dashboard-stats')).not.toBeInTheDocument();
            expect(screen.queryByTestId('products-table')).not.toBeInTheDocument();
            expect(screen.queryByTestId('orders-table')).not.toBeInTheDocument();
            
            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 3 }
      );
    });
  });
});






