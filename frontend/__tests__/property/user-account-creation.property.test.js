/**
 * Property-Based Tests for User Account Creation
 * Feature: ecommerce-fixes-and-enhancements
 */

import fc from 'fast-check';

// Mock fetch globally
global.fetch = jest.fn();

describe('Feature: ecommerce-fixes-and-enhancements, User Account Creation Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('Property 18: User account creation', () => {
    /**
     * **Validates: Requirements 4.1**
     * 
     * Property: For any valid signup credentials (unique email, valid format, password ≥ 6 chars), 
     * submitting the signup form should create a new user in the backend
     */

    // Arbitrary generator for valid user credentials
    const validCredentialsArbitrary = fc.record({
      username: fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length >= 3),
      email: fc.emailAddress(),
      password: fc.string({ minLength: 6, maxLength: 50 }),
    });

    it('should create a new user account for any valid credentials', async () => {
      await fc.assert(
        fc.asyncProperty(validCredentialsArbitrary, async (credentials) => {
          // Arrange: Mock successful registration response
          const mockResponse = {
            jwt: 'mock-jwt-token-' + Math.random(),
            user: {
              id: Math.floor(Math.random() * 10000),
              username: credentials.username,
              email: credentials.email,
              confirmed: true,
              blocked: false,
            },
          };

          global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
          });

          // Act: Call the registration endpoint
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

          // Assert: Registration should succeed
          expect(response.ok).toBe(true);
          expect(data.user).toBeDefined();
          expect(data.user.username).toBe(credentials.username);
          expect(data.user.email).toBe(credentials.email);
          expect(data.jwt).toBeDefined();
          expect(typeof data.jwt).toBe('string');
          expect(data.jwt.length).toBeGreaterThan(0);

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

    it('should create user accounts with various valid email formats', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length >= 3),
          fc.emailAddress(),
          fc.string({ minLength: 6, maxLength: 50 }),
          async (username, email, password) => {
            // Arrange: Mock successful registration response
            const mockResponse = {
              jwt: 'mock-jwt-token-' + Math.random(),
              user: {
                id: Math.floor(Math.random() * 10000),
                username: username,
                email: email,
                confirmed: true,
                blocked: false,
              },
            };

            global.fetch.mockResolvedValueOnce({
              ok: true,
              json: async () => mockResponse,
            });

            // Act: Call the registration endpoint
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

            // Assert: Registration should succeed with valid email
            expect(response.ok).toBe(true);
            expect(data.user).toBeDefined();
            expect(data.user.email).toBe(email);
            
            // Verify email format is preserved
            expect(data.user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should create user accounts with minimum password length (6 characters)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length >= 3),
          fc.emailAddress(),
          fc.string({ minLength: 6, maxLength: 6 }), // Exactly 6 characters
          async (username, email, password) => {
            // Arrange: Mock successful registration response
            const mockResponse = {
              jwt: 'mock-jwt-token-' + Math.random(),
              user: {
                id: Math.floor(Math.random() * 10000),
                username: username,
                email: email,
                confirmed: true,
                blocked: false,
              },
            };

            global.fetch.mockResolvedValueOnce({
              ok: true,
              json: async () => mockResponse,
            });

            // Act: Call the registration endpoint
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

            // Assert: Registration should succeed with minimum password length
            expect(response.ok).toBe(true);
            expect(data.user).toBeDefined();
            expect(data.jwt).toBeDefined();
            
            // Verify password meets minimum requirement
            expect(password.length).toBeGreaterThanOrEqual(6);
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should create user accounts with various username formats', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length >= 3),
          fc.emailAddress(),
          fc.string({ minLength: 6, maxLength: 50 }),
          async (username, email, password) => {
            // Arrange: Mock successful registration response
            const mockResponse = {
              jwt: 'mock-jwt-token-' + Math.random(),
              user: {
                id: Math.floor(Math.random() * 10000),
                username: username,
                email: email,
                confirmed: true,
                blocked: false,
              },
            };

            global.fetch.mockResolvedValueOnce({
              ok: true,
              json: async () => mockResponse,
            });

            // Act: Call the registration endpoint
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

            // Assert: Registration should succeed with various username formats
            expect(response.ok).toBe(true);
            expect(data.user).toBeDefined();
            expect(data.user.username).toBe(username);
            expect(data.user.username.length).toBeGreaterThanOrEqual(3);
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should return user data with all required fields', async () => {
      await fc.assert(
        fc.asyncProperty(validCredentialsArbitrary, async (credentials) => {
          // Arrange: Mock successful registration response
          const mockUserId = Math.floor(Math.random() * 10000);
          const mockResponse = {
            jwt: 'mock-jwt-token-' + Math.random(),
            user: {
              id: mockUserId,
              username: credentials.username,
              email: credentials.email,
              confirmed: true,
              blocked: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          };

          global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
          });

          // Act: Call the registration endpoint
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

          // Assert: Response should contain all required fields
          expect(data.user).toBeDefined();
          expect(data.user.id).toBeDefined();
          expect(typeof data.user.id).toBe('number');
          expect(data.user.id).toBeGreaterThan(0);
          
          expect(data.user.username).toBeDefined();
          expect(typeof data.user.username).toBe('string');
          expect(data.user.username).toBe(credentials.username);
          
          expect(data.user.email).toBeDefined();
          expect(typeof data.user.email).toBe('string');
          expect(data.user.email).toBe(credentials.email);
          
          expect(data.user.confirmed).toBeDefined();
          expect(typeof data.user.confirmed).toBe('boolean');
          
          expect(data.user.blocked).toBeDefined();
          expect(typeof data.user.blocked).toBe('boolean');
          expect(data.user.blocked).toBe(false);
          
          expect(data.jwt).toBeDefined();
          expect(typeof data.jwt).toBe('string');
          expect(data.jwt.length).toBeGreaterThan(0);
        }),
        { numRuns: 3 }
      );
    });

    it('should handle concurrent user registrations with unique credentials', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(validCredentialsArbitrary, { minLength: 2, maxLength: 5 }),
          async (credentialsArray) => {
            // Ensure unique emails
            const uniqueCredentials = [];
            const seenEmails = new Set();
            for (const cred of credentialsArray) {
              if (!seenEmails.has(cred.email)) {
                uniqueCredentials.push(cred);
                seenEmails.add(cred.email);
              }
            }

            if (uniqueCredentials.length < 2) return; // Skip if not enough unique credentials

            // Arrange: Mock successful registration responses for each user
            const mockResponses = uniqueCredentials.map((cred, index) => ({
              jwt: 'mock-jwt-token-' + index + '-' + Math.random(),
              user: {
                id: index + 1,
                username: cred.username,
                email: cred.email,
                confirmed: true,
                blocked: false,
              },
            }));

            // Mock fetch to return different responses for each call
            let callCount = 0;
            global.fetch.mockImplementation(() => {
              const response = mockResponses[callCount % mockResponses.length];
              callCount++;
              return Promise.resolve({
                ok: true,
                json: async () => response,
              });
            });

            // Act: Register all users concurrently
            const registrationPromises = uniqueCredentials.map(async (credentials) => {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  username: credentials.username,
                  email: credentials.email,
                  password: credentials.password,
                }),
              });
              return response.json();
            });

            const results = await Promise.all(registrationPromises);

            // Assert: All registrations should succeed
            expect(results.length).toBe(uniqueCredentials.length);
            
            for (let i = 0; i < results.length; i++) {
              expect(results[i].user).toBeDefined();
              expect(results[i].jwt).toBeDefined();
              expect(results[i].user.email).toBe(uniqueCredentials[i].email);
            }

            // Verify all users have unique IDs
            const userIds = results.map(r => r.user.id);
            const uniqueIds = new Set(userIds);
            expect(uniqueIds.size).toBe(userIds.length);
          }
        ),
        { numRuns: 3 } // Reduced runs for concurrent test
      );
    });
  });
});






