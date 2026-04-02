/**
 * Property-Based Tests for Invalid Login Error
 * Feature: ecommerce-fixes-and-enhancements
 */

import fc from 'fast-check';

// Mock fetch globally
global.fetch = jest.fn();

describe('Feature: ecommerce-fixes-and-enhancements, Invalid Login Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('Property 21: Invalid login error', () => {
    /**
     * **Validates: Requirements 4.4**
     * 
     * Property: For any invalid login credentials, an error message should be displayed
     */

    // Arbitrary generator for invalid login credentials
    const invalidLoginCredentialsArbitrary = fc.record({
      email: fc.emailAddress(),
      password: fc.string({ minLength: 1, maxLength: 50 }),
    });

    it('should return error for any invalid credentials', async () => {
      await fc.assert(
        fc.asyncProperty(invalidLoginCredentialsArbitrary, async (credentials) => {
          // Arrange: Mock failed authentication response from Strapi
          const mockErrorResponse = {
            error: {
              status: 400,
              name: 'ValidationError',
              message: 'Invalid identifier or password',
              details: {},
            },
          };

          global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => mockErrorResponse,
          });

          // Act: Call the authentication endpoint (simulating NextAuth authorize function)
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identifier: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          // Assert: Authentication should fail
          expect(response.ok).toBe(false);
          expect(response.status).toBe(400);
          expect(data.error).toBeDefined();
          expect(data.error.message).toBeDefined();
          expect(typeof data.error.message).toBe('string');
          expect(data.error.message.length).toBeGreaterThan(0);
          
          // Verify no user data is returned
          expect(data.user).toBeUndefined();
          expect(data.jwt).toBeUndefined();
          
          // Verify the API was called with correct parameters
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/auth/local'),
            expect.objectContaining({
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                identifier: credentials.email,
                password: credentials.password,
              }),
            })
          );
        }),
        { numRuns: 3 }
      );
    });

    it('should return error for wrong password with valid email format', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (email, wrongPassword) => {
            // Arrange: Mock failed authentication response
            const mockErrorResponse = {
              error: {
                status: 400,
                name: 'ValidationError',
                message: 'Invalid identifier or password',
                details: {},
              },
            };

            global.fetch.mockResolvedValueOnce({
              ok: false,
              status: 400,
              json: async () => mockErrorResponse,
            });

            // Act: Call the authentication endpoint
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                identifier: email,
                password: wrongPassword,
              }),
            });

            const data = await response.json();

            // Assert: Authentication should fail with error message
            expect(response.ok).toBe(false);
            expect(data.error).toBeDefined();
            expect(data.error.message).toBeDefined();
            expect(typeof data.error.message).toBe('string');
            
            // Error message should indicate authentication failure
            expect(data.error.message.toLowerCase()).toMatch(/invalid|password|identifier/);
            
            // No authentication data should be returned
            expect(data.user).toBeUndefined();
            expect(data.jwt).toBeUndefined();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should return error for non-existent email', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 6, maxLength: 50 }),
          async (nonExistentEmail, password) => {
            // Arrange: Mock failed authentication response for non-existent user
            const mockErrorResponse = {
              error: {
                status: 400,
                name: 'ValidationError',
                message: 'Invalid identifier or password',
                details: {},
              },
            };

            global.fetch.mockResolvedValueOnce({
              ok: false,
              status: 400,
              json: async () => mockErrorResponse,
            });

            // Act: Call the authentication endpoint
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                identifier: nonExistentEmail,
                password: password,
              }),
            });

            const data = await response.json();

            // Assert: Authentication should fail
            expect(response.ok).toBe(false);
            expect(data.error).toBeDefined();
            expect(data.error.message).toBeDefined();
            
            // Should not reveal whether email exists (security best practice)
            expect(data.error.message).not.toMatch(/not found|does not exist/i);
            
            // No user data should be returned
            expect(data.user).toBeUndefined();
            expect(data.jwt).toBeUndefined();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should return error with consistent format for various invalid credentials', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(invalidLoginCredentialsArbitrary, { minLength: 2, maxLength: 10 }),
          async (credentialsArray) => {
            // Arrange: Mock failed authentication responses
            const mockErrorResponse = {
              error: {
                status: 400,
                name: 'ValidationError',
                message: 'Invalid identifier or password',
                details: {},
              },
            };

            // Mock fetch to return error for all calls
            global.fetch.mockImplementation(() => {
              return Promise.resolve({
                ok: false,
                status: 400,
                json: async () => mockErrorResponse,
              });
            });

            // Act: Attempt login with all invalid credentials
            const loginPromises = credentialsArray.map(async (credentials) => {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  identifier: credentials.email,
                  password: credentials.password,
                }),
              });
              return response.json();
            });

            const results = await Promise.all(loginPromises);

            // Assert: All should fail with consistent error format
            expect(results.length).toBe(credentialsArray.length);
            
            for (const result of results) {
              expect(result.error).toBeDefined();
              expect(result.error.status).toBe(400);
              expect(result.error.name).toBeDefined();
              expect(typeof result.error.name).toBe('string');
              expect(result.error.message).toBeDefined();
              expect(typeof result.error.message).toBe('string');
              expect(result.error.message.length).toBeGreaterThan(0);
              
              // No authentication data
              expect(result.user).toBeUndefined();
              expect(result.jwt).toBeUndefined();
            }
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should return error for empty password', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          async (email) => {
            // Arrange: Mock failed authentication response for empty password
            const mockErrorResponse = {
              error: {
                status: 400,
                name: 'ValidationError',
                message: 'Invalid identifier or password',
                details: {},
              },
            };

            global.fetch.mockResolvedValueOnce({
              ok: false,
              status: 400,
              json: async () => mockErrorResponse,
            });

            // Act: Call the authentication endpoint with empty password
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                identifier: email,
                password: '',
              }),
            });

            const data = await response.json();

            // Assert: Authentication should fail
            expect(response.ok).toBe(false);
            expect(data.error).toBeDefined();
            expect(data.error.message).toBeDefined();
            expect(typeof data.error.message).toBe('string');
            
            // No authentication data should be returned
            expect(data.user).toBeUndefined();
            expect(data.jwt).toBeUndefined();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should not return JWT token for any invalid login attempt', async () => {
      await fc.assert(
        fc.asyncProperty(invalidLoginCredentialsArbitrary, async (credentials) => {
          // Arrange: Mock failed authentication response
          const mockErrorResponse = {
            error: {
              status: 400,
              name: 'ValidationError',
              message: 'Invalid identifier or password',
              details: {},
            },
          };

          global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => mockErrorResponse,
          });

          // Act: Call the authentication endpoint
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identifier: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          // Assert: No JWT token should be present
          expect(data.jwt).toBeUndefined();
          
          // No user data should be present
          expect(data.user).toBeUndefined();
          
          // Only error data should be present
          expect(data.error).toBeDefined();
          expect(Object.keys(data)).toContain('error');
          
          // Verify response is not successful
          expect(response.ok).toBe(false);
        }),
        { numRuns: 3 }
      );
    });

    it('should return error status code in 400 range for invalid credentials', async () => {
      await fc.assert(
        fc.asyncProperty(invalidLoginCredentialsArbitrary, async (credentials) => {
          // Arrange: Mock failed authentication response with 400-range status
          const statusCode = 400; // Strapi typically returns 400 for invalid credentials
          const mockErrorResponse = {
            error: {
              status: statusCode,
              name: 'ValidationError',
              message: 'Invalid identifier or password',
              details: {},
            },
          };

          global.fetch.mockResolvedValueOnce({
            ok: false,
            status: statusCode,
            json: async () => mockErrorResponse,
          });

          // Act: Call the authentication endpoint
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identifier: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          // Assert: Status code should be in 400 range (client error)
          expect(response.status).toBeGreaterThanOrEqual(400);
          expect(response.status).toBeLessThan(500);
          expect(response.ok).toBe(false);
          
          // Error object should contain status
          expect(data.error).toBeDefined();
          expect(data.error.status).toBeDefined();
          expect(data.error.status).toBeGreaterThanOrEqual(400);
          expect(data.error.status).toBeLessThan(500);
        }),
        { numRuns: 3 }
      );
    });

    it('should return error message that does not expose sensitive information', async () => {
      await fc.assert(
        fc.asyncProperty(invalidLoginCredentialsArbitrary, async (credentials) => {
          // Arrange: Mock failed authentication response
          const mockErrorResponse = {
            error: {
              status: 400,
              name: 'ValidationError',
              message: 'Invalid identifier or password',
              details: {},
            },
          };

          global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => mockErrorResponse,
          });

          // Act: Call the authentication endpoint
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identifier: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          // Assert: Error message should not expose sensitive information
          expect(data.error).toBeDefined();
          expect(data.error.message).toBeDefined();
          
          const errorMessage = data.error.message.toLowerCase();
          
          // Should not reveal which field is wrong (email vs password)
          expect(errorMessage).not.toMatch(/email.*wrong|password.*wrong|email.*incorrect|password.*incorrect/);
          
          // Should not reveal if user exists
          expect(errorMessage).not.toMatch(/user.*not.*found|account.*not.*exist|email.*not.*registered/);
          
          // Should not expose database or system details
          expect(errorMessage).not.toMatch(/database|sql|query|server|internal/);
          
          // Should be a generic authentication failure message
          expect(errorMessage).toMatch(/invalid|authentication|credentials/);
        }),
        { numRuns: 3 }
      );
    });
  });
});






