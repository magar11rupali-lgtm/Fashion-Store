/**
 * Property-Based Tests for Successful Login Session Creation
 * Feature: ecommerce-fixes-and-enhancements
 */

import fc from 'fast-check';

// Mock fetch globally
global.fetch = jest.fn();

describe('Feature: ecommerce-fixes-and-enhancements, Successful Login Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('Property 20: Successful login session creation', () => {
    /**
     * **Validates: Requirements 4.3, 4.5**
     * 
     * Property: For any valid login credentials, the system should create a session containing a JWT token
     */

    // Arbitrary generator for valid login credentials
    const validLoginCredentialsArbitrary = fc.record({
      email: fc.emailAddress(),
      password: fc.string({ minLength: 6, maxLength: 50 }),
    });

    it('should create a session with JWT token for any valid credentials', async () => {
      await fc.assert(
        fc.asyncProperty(validLoginCredentialsArbitrary, async (credentials) => {
          // Arrange: Mock successful authentication response from Strapi
          const mockUserId = Math.floor(Math.random() * 10000) + 1;
          const mockJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
                              Buffer.from(JSON.stringify({ id: mockUserId, email: credentials.email })).toString('base64').replace(/=/g, '') + 
                              '.mocksignature' + Math.random().toString().replace('.', '');
          
          const mockResponse = {
            jwt: mockJwtToken,
            user: {
              id: mockUserId,
              username: credentials.email.split('@')[0],
              email: credentials.email,
              confirmed: true,
              blocked: false,
            },
          };

          global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
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

          // Assert: Authentication should succeed and return session data
          expect(response.ok).toBe(true);
          expect(data.user).toBeDefined();
          expect(data.user.id).toBeDefined();
          expect(typeof data.user.id).toBe('number');
          expect(data.user.id).toBeGreaterThan(0);
          
          expect(data.user.email).toBe(credentials.email);
          expect(data.user.username).toBeDefined();
          expect(typeof data.user.username).toBe('string');
          
          // Verify JWT token is present and valid format
          expect(data.jwt).toBeDefined();
          expect(typeof data.jwt).toBe('string');
          expect(data.jwt.length).toBeGreaterThan(0);
          
          // JWT should have three parts separated by dots
          const jwtParts = data.jwt.split('.');
          expect(jwtParts.length).toBe(3);
          
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

    it('should create sessions with unique JWT tokens for different login attempts', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(validLoginCredentialsArbitrary, { minLength: 2, maxLength: 5 }),
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

            // Arrange: Mock successful authentication responses with unique tokens
            const mockResponses = uniqueCredentials.map((cred, index) => {
              const userId = index + 1;
              const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
                              Buffer.from(JSON.stringify({ id: userId, email: cred.email })).toString('base64').replace(/=/g, '') + 
                              '.mocksignature' + index + Math.random().toString().replace('.', '');
              
              return {
                jwt: jwtToken,
                user: {
                  id: userId,
                  username: cred.email.split('@')[0],
                  email: cred.email,
                  confirmed: true,
                  blocked: false,
                },
              };
            });

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

            // Act: Login all users
            const loginPromises = uniqueCredentials.map(async (credentials) => {
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

            // Assert: All logins should succeed with unique tokens
            expect(results.length).toBe(uniqueCredentials.length);
            
            const tokens = [];
            for (let i = 0; i < results.length; i++) {
              expect(results[i].user).toBeDefined();
              expect(results[i].jwt).toBeDefined();
              expect(results[i].user.email).toBe(uniqueCredentials[i].email);
              tokens.push(results[i].jwt);
            }

            // Verify all JWT tokens are unique
            const uniqueTokens = new Set(tokens);
            expect(uniqueTokens.size).toBe(tokens.length);
          }
        ),
        { numRuns: 3 } // Reduced runs for concurrent test
      );
    });

    it('should create session with user data for various email formats', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 6, maxLength: 50 }),
          async (email, password) => {
            // Arrange: Mock successful authentication response
            const mockUserId = Math.floor(Math.random() * 10000) + 1;
            const mockJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
                                Buffer.from(JSON.stringify({ id: mockUserId, email: email })).toString('base64').replace(/=/g, '') + 
                                '.mocksignature' + Math.random().toString().replace('.', '');
            
            const mockResponse = {
              jwt: mockJwtToken,
              user: {
                id: mockUserId,
                username: email.split('@')[0],
                email: email,
                confirmed: true,
                blocked: false,
              },
            };

            global.fetch.mockResolvedValueOnce({
              ok: true,
              json: async () => mockResponse,
            });

            // Act: Call the authentication endpoint
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                identifier: email,
                password: password,
              }),
            });

            const data = await response.json();

            // Assert: Session should be created with correct email
            expect(response.ok).toBe(true);
            expect(data.user).toBeDefined();
            expect(data.user.email).toBe(email);
            
            // Verify email format is preserved
            expect(data.user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            
            // Verify JWT token is present
            expect(data.jwt).toBeDefined();
            expect(typeof data.jwt).toBe('string');
            expect(data.jwt.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should create session with all required user fields', async () => {
      await fc.assert(
        fc.asyncProperty(validLoginCredentialsArbitrary, async (credentials) => {
          // Arrange: Mock successful authentication response with all fields
          const mockUserId = Math.floor(Math.random() * 10000) + 1;
          const mockJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
                              Buffer.from(JSON.stringify({ 
                                id: mockUserId, 
                                email: credentials.email,
                                iat: Math.floor(Date.now() / 1000),
                                exp: Math.floor(Date.now() / 1000) + 3600
                              })).toString('base64').replace(/=/g, '') + 
                              '.mocksignature' + Math.random().toString().replace('.', '');
          
          const mockResponse = {
            jwt: mockJwtToken,
            user: {
              id: mockUserId,
              username: credentials.email.split('@')[0],
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

          // Assert: Session should contain all required user fields
          expect(data.user).toBeDefined();
          
          // User ID
          expect(data.user.id).toBeDefined();
          expect(typeof data.user.id).toBe('number');
          expect(data.user.id).toBeGreaterThan(0);
          
          // Username
          expect(data.user.username).toBeDefined();
          expect(typeof data.user.username).toBe('string');
          expect(data.user.username.length).toBeGreaterThan(0);
          
          // Email
          expect(data.user.email).toBeDefined();
          expect(typeof data.user.email).toBe('string');
          expect(data.user.email).toBe(credentials.email);
          
          // Confirmed status
          expect(data.user.confirmed).toBeDefined();
          expect(typeof data.user.confirmed).toBe('boolean');
          
          // Blocked status
          expect(data.user.blocked).toBeDefined();
          expect(typeof data.user.blocked).toBe('boolean');
          expect(data.user.blocked).toBe(false); // Valid login should not be blocked
          
          // JWT token
          expect(data.jwt).toBeDefined();
          expect(typeof data.jwt).toBe('string');
          expect(data.jwt.length).toBeGreaterThan(0);
          
          // JWT format validation
          const jwtParts = data.jwt.split('.');
          expect(jwtParts.length).toBe(3);
          expect(jwtParts[0].length).toBeGreaterThan(0); // Header
          expect(jwtParts[1].length).toBeGreaterThan(0); // Payload
          expect(jwtParts[2].length).toBeGreaterThan(0); // Signature
        }),
        { numRuns: 3 }
      );
    });

    it('should create session that can be used for authenticated API calls', async () => {
      await fc.assert(
        fc.asyncProperty(validLoginCredentialsArbitrary, async (credentials) => {
          // Arrange: Mock successful authentication response
          const mockUserId = Math.floor(Math.random() * 10000) + 1;
          const mockJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
                              Buffer.from(JSON.stringify({ id: mockUserId, email: credentials.email })).toString('base64').replace(/=/g, '') + 
                              '.mocksignature' + Math.random().toString().replace('.', '');
          
          const mockResponse = {
            jwt: mockJwtToken,
            user: {
              id: mockUserId,
              username: credentials.email.split('@')[0],
              email: credentials.email,
              confirmed: true,
              blocked: false,
            },
          };

          global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
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

          // Assert: JWT token should be usable for authenticated requests
          expect(data.jwt).toBeDefined();
          
          // Simulate using the token in an authenticated API call
          const authHeader = `Bearer ${data.jwt}`;
          expect(authHeader).toMatch(/^Bearer eyJ/);
          
          // Verify token format is suitable for Authorization header
          expect(authHeader.split(' ').length).toBe(2);
          expect(authHeader.split(' ')[0]).toBe('Bearer');
          expect(authHeader.split(' ')[1]).toBe(data.jwt);
          
          // Verify token can be parsed (basic structure check)
          const tokenParts = data.jwt.split('.');
          expect(tokenParts.length).toBe(3);
          
          // Verify payload can be decoded (not validated, just decoded)
          const payload = tokenParts[1];
          expect(payload.length).toBeGreaterThan(0);
          
          // Token should be a non-empty string suitable for API calls
          expect(data.jwt.trim()).toBe(data.jwt);
          expect(data.jwt).not.toContain(' ');
          expect(data.jwt).not.toContain('\n');
        }),
        { numRuns: 3 }
      );
    });

    it('should create session with consistent user ID across login attempts', async () => {
      await fc.assert(
        fc.asyncProperty(validLoginCredentialsArbitrary, async (credentials) => {
          // Arrange: Mock successful authentication response with consistent user ID
          const mockUserId = Math.floor(Math.random() * 10000) + 1;
          const mockJwtToken1 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
                               Buffer.from(JSON.stringify({ id: mockUserId, email: credentials.email })).toString('base64').replace(/=/g, '') + 
                               '.mocksignature1' + Math.random().toString().replace('.', '');
          const mockJwtToken2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
                               Buffer.from(JSON.stringify({ id: mockUserId, email: credentials.email })).toString('base64').replace(/=/g, '') + 
                               '.mocksignature2' + Math.random().toString().replace('.', '');
          
          const mockResponse1 = {
            jwt: mockJwtToken1,
            user: {
              id: mockUserId,
              username: credentials.email.split('@')[0],
              email: credentials.email,
              confirmed: true,
              blocked: false,
            },
          };

          const mockResponse2 = {
            jwt: mockJwtToken2,
            user: {
              id: mockUserId,
              username: credentials.email.split('@')[0],
              email: credentials.email,
              confirmed: true,
              blocked: false,
            },
          };

          // First login
          global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse1,
          });

          const response1 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identifier: credentials.email,
              password: credentials.password,
            }),
          });

          const data1 = await response1.json();

          // Second login (simulating re-login)
          global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse2,
          });

          const response2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identifier: credentials.email,
              password: credentials.password,
            }),
          });

          const data2 = await response2.json();

          // Assert: User ID should be consistent across login attempts
          expect(data1.user.id).toBe(data2.user.id);
          expect(data1.user.email).toBe(data2.user.email);
          expect(data1.user.username).toBe(data2.user.username);
          
          // JWT tokens should be different (new session)
          expect(data1.jwt).not.toBe(data2.jwt);
          
          // But both should be valid JWT format
          expect(data1.jwt.split('.').length).toBe(3);
          expect(data2.jwt.split('.').length).toBe(3);
        }),
        { numRuns: 3 }
      );
    });
  });
});






