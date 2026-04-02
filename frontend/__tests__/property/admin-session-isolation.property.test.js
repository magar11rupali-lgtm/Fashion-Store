/**
 * Property-Based Tests for Admin Session Isolation
 * Feature: ecommerce-fixes-and-enhancements
 */

import fc from 'fast-check';
import * as adminAuth from '../../lib/admin-auth';

// Mock window and storage
let sessionStorageMock;
let localStorageMock;

describe('Feature: ecommerce-fixes-and-enhancements, Admin Session Isolation Property Tests', () => {
  beforeEach(() => {
    // Create fresh storage mocks for each test
    sessionStorageMock = {};
    localStorageMock = {};

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn((key) => sessionStorageMock[key] || null),
        setItem: jest.fn((key, value) => {
          sessionStorageMock[key] = value;
        }),
        removeItem: jest.fn((key) => {
          delete sessionStorageMock[key];
        }),
        clear: jest.fn(() => {
          sessionStorageMock = {};
        }),
      },
      writable: true,
    });

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => localStorageMock[key] || null),
        setItem: jest.fn((key, value) => {
          localStorageMock[key] = value;
        }),
        removeItem: jest.fn((key) => {
          delete localStorageMock[key];
        }),
        clear: jest.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    sessionStorageMock = {};
    localStorageMock = {};
  });

  describe('Property 39: Admin session isolation', () => {
    /**
     * **Validates: Requirements 8.6**
     * 
     * Property: For any admin session, it should be stored separately from regular user sessions
     * and not interfere with user authentication
     */

    it('should store admin session in sessionStorage, not localStorage', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            username: fc.constant('admin'),
            password: fc.constant('admin123secure'),
          }),
          async ({ username, password }) => {
            // Arrange: Clear all storage
            sessionStorageMock = {};
            localStorageMock = {};

            // Act: Login as admin
            const result = adminAuth.login(username, password);

            // Assert: Admin session should be in sessionStorage
            expect(result.success).toBe(true);
            expect(sessionStorageMock['admin_session']).toBeDefined();
            
            // Parse and verify session data
            const sessionData = JSON.parse(sessionStorageMock['admin_session']);
            expect(sessionData.isAdmin).toBe(true);
            expect(sessionData.username).toBe(username);
            expect(sessionData.loginTime).toBeDefined();

            // Assert: localStorage should remain empty (no admin data)
            expect(localStorageMock['admin_session']).toBeUndefined();
            expect(Object.keys(localStorageMock).length).toBe(0);
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should not interfere with user data in localStorage', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userToken: fc.string({ minLength: 10, maxLength: 50 }),
            userEmail: fc.emailAddress(),
            cartData: fc.array(fc.record({
              id: fc.integer({ min: 1, max: 1000 }),
              name: fc.string({ minLength: 3, maxLength: 30 }),
              quantity: fc.integer({ min: 1, max: 10 }),
            }), { minLength: 0, maxLength: 5 }),
          }),
          async ({ userToken, userEmail, cartData }) => {
            // Arrange: Simulate user data in localStorage
            localStorageMock['user_token'] = userToken;
            localStorageMock['user_email'] = userEmail;
            localStorageMock['cart'] = JSON.stringify(cartData);
            
            const originalLocalStorageKeys = Object.keys(localStorageMock);
            const originalLocalStorageData = { ...localStorageMock };

            // Act: Login as admin
            const result = adminAuth.login('admin', 'admin123secure');

            // Assert: Admin login should succeed
            expect(result.success).toBe(true);

            // Assert: localStorage should remain unchanged
            expect(Object.keys(localStorageMock)).toEqual(originalLocalStorageKeys);
            expect(localStorageMock['user_token']).toBe(originalLocalStorageData['user_token']);
            expect(localStorageMock['user_email']).toBe(originalLocalStorageData['user_email']);
            expect(localStorageMock['cart']).toBe(originalLocalStorageData['cart']);

            // Assert: Admin session should be in sessionStorage only
            expect(sessionStorageMock['admin_session']).toBeDefined();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should not interfere with NextAuth session data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            nextAuthToken: fc.string({ minLength: 20, maxLength: 100 }),
            userId: fc.integer({ min: 1, max: 10000 }),
            userEmail: fc.emailAddress(),
          }),
          async ({ nextAuthToken, userId, userEmail }) => {
            // Arrange: Simulate NextAuth session data in localStorage
            const nextAuthSession = {
              user: {
                id: userId,
                email: userEmail,
              },
              accessToken: nextAuthToken,
              expires: new Date(Date.now() + 86400000).toISOString(),
            };
            localStorageMock['nextauth.session-token'] = nextAuthToken;
            localStorageMock['nextauth.session'] = JSON.stringify(nextAuthSession);

            const originalNextAuthToken = localStorageMock['nextauth.session-token'];
            const originalNextAuthSession = localStorageMock['nextauth.session'];

            // Act: Login as admin
            const result = adminAuth.login('admin', 'admin123secure');

            // Assert: Admin login should succeed
            expect(result.success).toBe(true);

            // Assert: NextAuth data should remain unchanged
            expect(localStorageMock['nextauth.session-token']).toBe(originalNextAuthToken);
            expect(localStorageMock['nextauth.session']).toBe(originalNextAuthSession);

            // Assert: Admin session should be separate in sessionStorage
            expect(sessionStorageMock['admin_session']).toBeDefined();
            const adminSession = JSON.parse(sessionStorageMock['admin_session']);
            expect(adminSession.isAdmin).toBe(true);

            // Assert: Admin session should not contain user session data
            expect(adminSession.accessToken).toBeUndefined();
            expect(adminSession.user).toBeUndefined();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should isolate admin logout from user session', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userToken: fc.string({ minLength: 10, maxLength: 50 }),
            wishlistData: fc.array(fc.record({
              productId: fc.integer({ min: 1, max: 1000 }),
              name: fc.string({ minLength: 3, maxLength: 30 }),
            }), { minLength: 0, maxLength: 5 }),
          }),
          async ({ userToken, wishlistData }) => {
            // Arrange: Setup both admin and user sessions
            adminAuth.login('admin', 'admin123secure');
            localStorageMock['user_token'] = userToken;
            localStorageMock['wishlist'] = JSON.stringify(wishlistData);

            const originalUserToken = localStorageMock['user_token'];
            const originalWishlist = localStorageMock['wishlist'];

            // Verify admin session exists
            expect(sessionStorageMock['admin_session']).toBeDefined();

            // Act: Logout admin
            adminAuth.logout();

            // Assert: Admin session should be cleared
            expect(sessionStorageMock['admin_session']).toBeUndefined();

            // Assert: User data should remain intact
            expect(localStorageMock['user_token']).toBe(originalUserToken);
            expect(localStorageMock['wishlist']).toBe(originalWishlist);
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should maintain separate authentication states for admin and user', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            hasUserSession: fc.boolean(),
            hasAdminSession: fc.boolean(),
          }),
          async ({ hasUserSession, hasAdminSession }) => {
            // Arrange: Clear storage before each iteration
            sessionStorageMock = {};
            localStorageMock = {};

            // Setup sessions based on test parameters
            if (hasUserSession) {
              localStorageMock['user_token'] = 'user-jwt-token-' + Math.random();
              localStorageMock['user_authenticated'] = 'true';
            }

            if (hasAdminSession) {
              adminAuth.login('admin', 'admin123secure');
            }

            // Act: Check admin authentication
            const isAdminAuthenticated = adminAuth.checkAuth();

            // Assert: Admin authentication should only depend on admin session
            expect(isAdminAuthenticated).toBe(hasAdminSession);

            // Assert: User session presence should not affect admin authentication
            if (hasUserSession && !hasAdminSession) {
              expect(isAdminAuthenticated).toBe(false);
            }

            // Assert: Storage isolation is maintained
            if (hasAdminSession) {
              expect(sessionStorageMock['admin_session']).toBeDefined();
            }
            if (hasUserSession) {
              expect(localStorageMock['user_token']).toBeDefined();
            }
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should use different storage keys for admin and user sessions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(true),
          async () => {
            // Arrange: Clear all storage
            sessionStorageMock = {};
            localStorageMock = {};

            // Act: Login as admin
            adminAuth.login('admin', 'admin123secure');

            // Assert: Admin session key should be in sessionStorage
            expect(sessionStorageMock['admin_session']).toBeDefined();

            // Assert: Common user session keys should not be used by admin
            expect(sessionStorageMock['user_session']).toBeUndefined();
            expect(sessionStorageMock['session']).toBeUndefined();
            expect(sessionStorageMock['auth_token']).toBeUndefined();
            expect(sessionStorageMock['jwt']).toBeUndefined();

            // Assert: Admin session should not leak into localStorage
            expect(localStorageMock['admin_session']).toBeUndefined();
            expect(localStorageMock['admin_token']).toBeUndefined();
            expect(localStorageMock['isAdmin']).toBeUndefined();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should not expose admin session data through getSession when user data exists', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userEmail: fc.emailAddress(),
            userName: fc.string({ minLength: 3, maxLength: 20 }),
          }),
          async ({ userEmail, userName }) => {
            // Arrange: Setup user data in localStorage
            localStorageMock['user_email'] = userEmail;
            localStorageMock['user_name'] = userName;

            // Act: Login as admin
            adminAuth.login('admin', 'admin123secure');
            const adminSession = adminAuth.getSession();

            // Assert: Admin session should be retrieved correctly
            expect(adminSession).toBeDefined();
            expect(adminSession.isAdmin).toBe(true);
            expect(adminSession.username).toBe('admin');

            // Assert: Admin session should not contain user data
            expect(adminSession.email).toBeUndefined();
            expect(adminSession.name).toBeUndefined();

            // Assert: User data should still exist in localStorage
            expect(localStorageMock['user_email']).toBe(userEmail);
            expect(localStorageMock['user_name']).toBe(userName);
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should clear only admin session on logout, preserving all user data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userData: fc.record({
              token: fc.string({ minLength: 10, maxLength: 50 }),
              email: fc.emailAddress(),
              cart: fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 0, maxLength: 10 }),
              wishlist: fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 0, maxLength: 10 }),
              preferences: fc.record({
                theme: fc.constantFrom('light', 'dark'),
                language: fc.constantFrom('en', 'es', 'fr'),
              }),
            }),
          }),
          async ({ userData }) => {
            // Arrange: Setup comprehensive user data
            localStorageMock['user_token'] = userData.token;
            localStorageMock['user_email'] = userData.email;
            localStorageMock['cart'] = JSON.stringify(userData.cart);
            localStorageMock['wishlist'] = JSON.stringify(userData.wishlist);
            localStorageMock['preferences'] = JSON.stringify(userData.preferences);

            // Login as admin
            adminAuth.login('admin', 'admin123secure');

            // Verify both sessions exist
            expect(sessionStorageMock['admin_session']).toBeDefined();
            expect(Object.keys(localStorageMock).length).toBeGreaterThan(0);

            // Snapshot localStorage before logout
            const localStorageSnapshot = { ...localStorageMock };

            // Act: Logout admin
            adminAuth.logout();

            // Assert: Admin session should be cleared
            expect(sessionStorageMock['admin_session']).toBeUndefined();

            // Assert: All user data should remain unchanged
            expect(localStorageMock['user_token']).toBe(localStorageSnapshot['user_token']);
            expect(localStorageMock['user_email']).toBe(localStorageSnapshot['user_email']);
            expect(localStorageMock['cart']).toBe(localStorageSnapshot['cart']);
            expect(localStorageMock['wishlist']).toBe(localStorageSnapshot['wishlist']);
            expect(localStorageMock['preferences']).toBe(localStorageSnapshot['preferences']);

            // Assert: localStorage should have same number of keys
            expect(Object.keys(localStorageMock).length).toBe(Object.keys(localStorageSnapshot).length);
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should maintain isolation across multiple admin login/logout cycles', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            cycles: fc.integer({ min: 2, max: 5 }),
            userToken: fc.string({ minLength: 10, maxLength: 50 }),
          }),
          async ({ cycles, userToken }) => {
            // Arrange: Setup user session
            localStorageMock['user_token'] = userToken;
            const originalUserToken = localStorageMock['user_token'];

            // Act: Perform multiple admin login/logout cycles
            for (let i = 0; i < cycles; i++) {
              // Login
              const loginResult = adminAuth.login('admin', 'admin123secure');
              expect(loginResult.success).toBe(true);
              expect(sessionStorageMock['admin_session']).toBeDefined();

              // Verify user token unchanged
              expect(localStorageMock['user_token']).toBe(originalUserToken);

              // Logout
              adminAuth.logout();
              expect(sessionStorageMock['admin_session']).toBeUndefined();

              // Verify user token still unchanged
              expect(localStorageMock['user_token']).toBe(originalUserToken);
            }

            // Assert: After all cycles, user token should still be intact
            expect(localStorageMock['user_token']).toBe(originalUserToken);
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should prevent admin session data from leaking into localStorage keys', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(true),
          async () => {
            // Arrange: Clear all storage
            sessionStorageMock = {};
            localStorageMock = {};

            // Act: Login as admin
            const result = adminAuth.login('admin', 'admin123secure');
            expect(result.success).toBe(true);

            // Get admin session
            const adminSession = adminAuth.getSession();
            expect(adminSession).toBeDefined();

            // Assert: No admin-related keys should appear in localStorage
            const localStorageKeys = Object.keys(localStorageMock);
            
            // Check for any admin-related keys
            const adminRelatedKeys = localStorageKeys.filter(key => 
              key.toLowerCase().includes('admin') ||
              key.toLowerCase().includes('isadmin') ||
              key === 'admin_session'
            );

            expect(adminRelatedKeys.length).toBe(0);

            // Assert: Admin session should only be in sessionStorage
            expect(sessionStorageMock['admin_session']).toBeDefined();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should maintain isolation when both admin and user perform concurrent operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userOperations: fc.array(
              fc.record({
                key: fc.constantFrom('cart', 'wishlist', 'preferences', 'recent_views'),
                value: fc.string({ minLength: 5, maxLength: 50 }),
              }),
              { minLength: 1, maxLength: 5 }
            ),
          }),
          async ({ userOperations }) => {
            // Arrange: Clear storage and login as admin first
            sessionStorageMock = {};
            localStorageMock = {};
            
            adminAuth.login('admin', 'admin123secure');
            expect(sessionStorageMock['admin_session']).toBeDefined();

            // Act: Simulate user operations while admin is logged in
            // Store the last value for each key (since keys can repeat)
            const expectedValues = {};
            userOperations.forEach(op => {
              localStorageMock[op.key] = op.value;
              expectedValues[op.key] = op.value;
            });

            // Assert: Admin session should still exist
            expect(sessionStorageMock['admin_session']).toBeDefined();
            const adminSession = adminAuth.getSession();
            expect(adminSession.isAdmin).toBe(true);

            // Assert: User operations should not affect admin session
            const adminSessionData = JSON.parse(sessionStorageMock['admin_session']);
            expect(adminSessionData.isAdmin).toBe(true);
            expect(adminSessionData.username).toBe('admin');

            // Assert: All user operations should be in localStorage (check final values)
            Object.keys(expectedValues).forEach(key => {
              expect(localStorageMock[key]).toBe(expectedValues[key]);
            });

            // Assert: No cross-contamination
            expect(localStorageMock['admin_session']).toBeUndefined();
            expect(sessionStorageMock['cart']).toBeUndefined();
            expect(sessionStorageMock['wishlist']).toBeUndefined();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should use sessionStorage exclusively for admin authentication checks', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            fakeAdminDataInLocalStorage: fc.record({
              isAdmin: fc.boolean(),
              username: fc.string({ minLength: 3, maxLength: 20 }),
              adminToken: fc.string({ minLength: 10, maxLength: 50 }),
            }),
          }),
          async ({ fakeAdminDataInLocalStorage }) => {
            // Arrange: Clear storage first
            sessionStorageMock = {};
            localStorageMock = {};
            
            // Put fake admin data in localStorage (simulating attack or confusion)
            localStorageMock['admin_session'] = JSON.stringify(fakeAdminDataInLocalStorage);
            localStorageMock['isAdmin'] = String(fakeAdminDataInLocalStorage.isAdmin);
            localStorageMock['admin_token'] = fakeAdminDataInLocalStorage.adminToken;

            // Act: Check admin authentication (should only check sessionStorage)
            const isAuthenticated = adminAuth.checkAuth();

            // Assert: Should return false because sessionStorage is empty
            expect(isAuthenticated).toBe(false);

            // Assert: Fake localStorage data should not grant admin access
            expect(localStorageMock['admin_session']).toBeDefined(); // Still there
            expect(sessionStorageMock['admin_session']).toBeUndefined(); // Not in sessionStorage

            // Act: Now login properly
            adminAuth.login('admin', 'admin123secure');

            // Assert: Now should be authenticated
            expect(adminAuth.checkAuth()).toBe(true);

            // Assert: Real admin session is in sessionStorage
            expect(sessionStorageMock['admin_session']).toBeDefined();

            // Assert: Fake localStorage data should still be ignored
            const realAdminSession = JSON.parse(sessionStorageMock['admin_session']);
            expect(realAdminSession.isAdmin).toBe(true);
            expect(realAdminSession.username).toBe('admin');
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should maintain session isolation across page reloads (sessionStorage vs localStorage behavior)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userToken: fc.string({ minLength: 10, maxLength: 50 }),
            cartItems: fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 5 }),
          }),
          async ({ userToken, cartItems }) => {
            // Arrange: Setup user data (persists across reloads via localStorage)
            localStorageMock['user_token'] = userToken;
            localStorageMock['cart'] = JSON.stringify(cartItems);

            // Login as admin (sessionStorage - cleared on tab close)
            adminAuth.login('admin', 'admin123secure');

            // Verify both sessions exist
            expect(sessionStorageMock['admin_session']).toBeDefined();
            expect(localStorageMock['user_token']).toBeDefined();

            // Act: Simulate page reload by clearing sessionStorage (but not localStorage)
            sessionStorageMock = {};

            // Assert: Admin session should be gone (sessionStorage cleared)
            expect(adminAuth.checkAuth()).toBe(false);
            expect(adminAuth.getSession()).toBeNull();

            // Assert: User data should persist (localStorage not cleared)
            expect(localStorageMock['user_token']).toBe(userToken);
            expect(localStorageMock['cart']).toBe(JSON.stringify(cartItems));

            // This demonstrates the isolation: admin session is temporary (sessionStorage)
            // while user data persists (localStorage)
          }
        ),
        { numRuns: 3 }
      );
    });
  });
});






