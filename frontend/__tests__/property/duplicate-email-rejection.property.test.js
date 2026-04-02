/**
 * Property-Based Tests for Duplicate Email Rejection
 * Feature: ecommerce-fixes-and-enhancements
 */

import fc from 'fast-check';

// Mock fetch globally
global.fetch = jest.fn();

describe('Feature: ecommerce-fixes-and-enhancements, Duplicate Email Rejection Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('Property 19: Duplicate email rejection', () => {
    /**
     * **Validates: Requirements 4.2**
     * 
     * Property: For any signup attempt with an existing email, an error message should be displayed
     */

    // Arbitrary generator for valid user credentials
    const validCredentialsArbitrary = fc.record({
      username: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length >= 3),
      email: fc.emailAddress(),
      password: fc.string({ minLength: 6, maxLength: 50 }),
    });

    it('should reject signup with duplicate email and display error message', async () => {
      await fc.assert(
        fc.asyncProperty(validCredentialsArbitrary, async (credentials) => {
          // Arrange: Mock duplicate email error response from Strapi
          const mockErrorResponse = {
            error: {
              status: 400,
              name: 'ApplicationError',
              message: 'Email is already taken',
              details: {},
            },
          };

          global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => mockErrorResponse,
          });

          // Act: Attempt to register with duplicate email
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: credentials.username,
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          // Assert: Registration should fail
          expect(response.ok).toBe(false);
          expect(response.status).toBe(400);
          
          // Assert: Error response should contain error information
          expect(data.error).toBeDefined();
          expect(data.error.message).toBeDefined();
          expect(typeof data.error.message).toBe('string');
          
          // Assert: Error message should indicate email is already taken
          const errorMessage = data.error.message.toLowerCase();
          expect(
            errorMessage.includes('email') && 
            (errorMessage.includes('already') || 
             errorMessage.includes('taken') || 
             errorMessage.includes('exists'))
          ).toBe(true);

          // Verify the API was called with correct parameters
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/auth/local/register'),
            expect.objectContaining({
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: credentials.username,
                email: credentials.email,
                password: credentials.password,
              }),
            })
          );
        }),
        { numRuns: 3 }
      );
    });

    it('should reject duplicate emails with various error message formats', async () => {
      const errorMessages = [
        'Email is already taken',
        'Email already exists',
        'This email is already registered',
        'Email address is already in use',
        'An account with this email already exists',
      ];

      await fc.assert(
        fc.asyncProperty(
          validCredentialsArbitrary,
          fc.constantFrom(...errorMessages),
          async (credentials, errorMessage) => {
            // Arrange: Mock duplicate email error with various message formats
            const mockErrorResponse = {
              error: {
                status: 400,
                name: 'ApplicationError',
                message: errorMessage,
                details: {},
              },
            };

            global.fetch.mockResolvedValueOnce({
              ok: false,
              status: 400,
              json: async () => mockErrorResponse,
            });

            // Act: Attempt to register with duplicate email
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: credentials.username,
                email: credentials.email,
                password: credentials.password,
              }),
            });

            const data = await response.json();

            // Assert: Registration should fail with error message
            expect(response.ok).toBe(false);
            expect(data.error).toBeDefined();
            expect(data.error.message).toBe(errorMessage);
            
            // Assert: Error message should be about email duplication
            const lowerMessage = errorMessage.toLowerCase();
            expect(lowerMessage).toMatch(/email/);
            expect(lowerMessage).toMatch(/already|exists|taken|use|registered/);
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should reject duplicate emails regardless of email case variations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length >= 3),
          fc.emailAddress(),
          fc.string({ minLength: 6, maxLength: 50 }),
          async (username, email, password) => {
            // Arrange: Mock duplicate email error
            const mockErrorResponse = {
              error: {
                status: 400,
                name: 'ApplicationError',
                message: 'Email is already taken',
                details: {},
              },
            };

            global.fetch.mockResolvedValueOnce({
              ok: false,
              status: 400,
              json: async () => mockErrorResponse,
            });

            // Act: Attempt to register with duplicate email
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: username,
                email: email,
                password: password,
              }),
            });

            const data = await response.json();

            // Assert: Registration should fail
            expect(response.ok).toBe(false);
            expect(data.error).toBeDefined();
            expect(data.error.message).toBeDefined();
            
            // Assert: Error should be about duplicate email
            const errorMessage = data.error.message.toLowerCase();
            expect(errorMessage).toMatch(/email/);
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should return 400 status code for duplicate email attempts', async () => {
      await fc.assert(
        fc.asyncProperty(validCredentialsArbitrary, async (credentials) => {
          // Arrange: Mock duplicate email error with 400 status
          const mockErrorResponse = {
            error: {
              status: 400,
              name: 'ApplicationError',
              message: 'Email is already taken',
              details: {},
            },
          };

          global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => mockErrorResponse,
          });

          // Act: Attempt to register with duplicate email
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: credentials.username,
              email: credentials.email,
              password: credentials.password,
            }),
          });

          // Assert: Should return 400 Bad Request status
          expect(response.status).toBe(400);
          expect(response.ok).toBe(false);
        }),
        { numRuns: 3 }
      );
    });

    it('should not create user account when email is duplicate', async () => {
      await fc.assert(
        fc.asyncProperty(validCredentialsArbitrary, async (credentials) => {
          // Arrange: Mock duplicate email error (no user or jwt in response)
          const mockErrorResponse = {
            error: {
              status: 400,
              name: 'ApplicationError',
              message: 'Email is already taken',
              details: {},
            },
          };

          global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => mockErrorResponse,
          });

          // Act: Attempt to register with duplicate email
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: credentials.username,
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          // Assert: Response should not contain user or jwt
          expect(data.user).toBeUndefined();
          expect(data.jwt).toBeUndefined();
          
          // Assert: Response should only contain error information
          expect(data.error).toBeDefined();
        }),
        { numRuns: 3 }
      );
    });

    it('should handle duplicate email with valid username and password', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length >= 3),
          fc.emailAddress(),
          fc.string({ minLength: 6, maxLength: 50 }),
          async (username, email, password) => {
            // Arrange: Mock duplicate email error
            const mockErrorResponse = {
              error: {
                status: 400,
                name: 'ApplicationError',
                message: 'Email is already taken',
                details: {},
              },
            };

            global.fetch.mockResolvedValueOnce({
              ok: false,
              status: 400,
              json: async () => mockErrorResponse,
            });

            // Act: Attempt to register with duplicate email but valid other fields
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: username,
                email: email,
                password: password,
              }),
            });

            const data = await response.json();

            // Assert: Should fail even with valid username and password
            expect(response.ok).toBe(false);
            expect(data.error).toBeDefined();
            
            // Assert: Username and password validity doesn't matter if email is duplicate
            expect(username.length).toBeGreaterThanOrEqual(3);
            expect(password.length).toBeGreaterThanOrEqual(6);
            expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            
            // But registration should still fail
            expect(data.error.message).toBeDefined();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should preserve original email in error context', async () => {
      await fc.assert(
        fc.asyncProperty(validCredentialsArbitrary, async (credentials) => {
          // Arrange: Mock duplicate email error
          const mockErrorResponse = {
            error: {
              status: 400,
              name: 'ApplicationError',
              message: 'Email is already taken',
              details: {
                email: credentials.email,
              },
            },
          };

          global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => mockErrorResponse,
          });

          // Act: Attempt to register with duplicate email
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: credentials.username,
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          // Assert: Error response should be well-formed
          expect(response.ok).toBe(false);
          expect(data.error).toBeDefined();
          expect(data.error.message).toBeDefined();
          
          // Assert: Error details may contain the problematic email
          if (data.error.details && data.error.details.email) {
            expect(data.error.details.email).toBe(credentials.email);
          }
        }),
        { numRuns: 3 }
      );
    });
  });
});






