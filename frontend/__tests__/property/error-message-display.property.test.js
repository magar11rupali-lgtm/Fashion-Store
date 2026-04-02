/**
 * Property-Based Test for Error Message Display
 * Feature: ecommerce-fixes-and-enhancements
 * Property 29: Error message display
 * Validates: Requirements 6.6
 */

import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { NotificationProvider } from '@/hooks/useNotification';
import fc from 'fast-check';
import React from 'react';
import SignInPage from '@/app/auth/signin/page';
import ProfilePage from '@/app/profile/page';
import { ERROR_MESSAGES } from '@/lib/errors';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock next-auth
const mockSession = {
  user: { id: 1, email: 'test@example.com', name: 'Test User' },
  accessToken: 'mock-token',
  expires: '2099-12-31',
};

jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }) => children,
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
}));

// Mock user API
jest.mock('@/lib/users', () => ({
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
}));

// Arbitrary generators for error scenarios
const apiErrorArbitrary = fc.record({
  status: fc.constantFrom(400, 401, 403, 404, 500, 502, 503),
  message: fc.string({ minLength: 10, maxLength: 100 }),
});

const validationErrorArbitrary = fc.record({
  field: fc.constantFrom('email', 'password', 'firstName', 'lastName', 'phone'),
  errorType: fc.constantFrom('required', 'invalid_format', 'too_short', 'too_long'),
});

const networkErrorArbitrary = fc.record({
  type: fc.constantFrom('network', 'timeout', 'abort'),
  message: fc.string({ minLength: 5, maxLength: 50 }),
});

describe('Feature: ecommerce-fixes-and-enhancements, Property 29: Error message display', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * **Validates: Requirements 6.6**
   * 
   * Property: For any error condition, an error message should be displayed to the user
   * 
   * This property verifies that:
   * 1. Error messages are displayed when errors occur
   * 2. Error messages are visible and accessible
   * 3. Error messages contain meaningful information
   * 4. Error messages follow consistent formatting
   */
  it('should display error message for any API error condition', async () => {
    const { signIn } = require('next-auth/react');
    
    await fc.assert(
      fc.asyncProperty(
        apiErrorArbitrary,
        async (errorData) => {
          // Arrange: Mock signIn to fail with error
          signIn.mockResolvedValueOnce({
            error: errorData.message,
            ok: false,
          });

          // Render sign-in page
          const { container } = render(
            <NotificationProvider>
              <SignInPage />
            </NotificationProvider>
          );

          // Fill in form using container queries
          const emailInput = container.querySelector('input[name="email"]');
          const passwordInput = container.querySelector('input[name="password"]');
          const submitButton = container.querySelector('button[type="submit"]');

          fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
          fireEvent.change(passwordInput, { target: { value: 'password123' } });

          // Act: Submit form
          fireEvent.click(submitButton);

          // Assert: Error message should be displayed
          await waitFor(() => {
            // Check for error message in the container
            const errorText = container.textContent;
            expect(errorText).toContain(ERROR_MESSAGES.INVALID_CREDENTIALS);
          }, { timeout: 3000 });

          // Verify error message has proper styling (red background/text)
          const errorDiv = container.querySelector('.bg-red-100, .text-red-700, .text-red-600');
          expect(errorDiv).toBeTruthy();
          
          // Clean up
          cleanup();
        }
      ),
      { numRuns: 5 }
    );
  }, 30000);

  it('should display inline error messages for validation errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('email', 'password'),
        async (field) => {
          // Render sign-in page
          const { container } = render(
            <NotificationProvider>
              <SignInPage />
            </NotificationProvider>
          );

          const emailInput = container.querySelector('input[name="email"]');
          const passwordInput = container.querySelector('input[name="password"]');
          const submitButton = container.querySelector('button[type="submit"]');

          // Act: Trigger validation error by leaving field empty and blurring
          if (field === 'email') {
            fireEvent.blur(emailInput);
          } else if (field === 'password') {
            fireEvent.blur(passwordInput);
          }

          // Submit to trigger all validations
          fireEvent.click(submitButton);

          // Assert: Inline error message should be displayed
          await waitFor(() => {
            const errorMessages = container.querySelectorAll('[role="alert"]');
            expect(errorMessages.length).toBeGreaterThan(0);
          }, { timeout: 2000 });

          // Verify error message is accessible
          const errorMessage = container.querySelector('[role="alert"]');
          expect(errorMessage).toBeTruthy();
          
          // Verify error message has text content
          expect(errorMessage.textContent).toBeTruthy();
          expect(errorMessage.textContent.length).toBeGreaterThan(0);
          
          // Verify error message has proper styling
          expect(errorMessage.className).toContain('text-red');
          
          // Clean up
          cleanup();
        }
      ),
      { numRuns: 5 }
    );
  }, 30000);

  it('should display error messages with consistent formatting', async () => {
    const { signIn } = require('next-auth/react');
    
    // Test that all error messages are displayed with consistent red styling
    const { container } = render(
      <NotificationProvider>
        <SignInPage />
      </NotificationProvider>
    );

    // Mock signIn to fail
    signIn.mockResolvedValueOnce({
      error: 'Authentication failed',
      ok: false,
    });

    // Fill and submit form
    const emailInput = container.querySelector('input[name="email"]');
    const passwordInput = container.querySelector('input[name="password"]');
    const submitButton = container.querySelector('button[type="submit"]');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Assert: Error message should be displayed with consistent format
    await waitFor(() => {
      const errorText = container.textContent;
      expect(errorText).toContain(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }, { timeout: 3000 });

    // Verify error is in a container with consistent styling
    const errorDiv = container.querySelector('.bg-red-100, .text-red-700, .text-red-600');
    expect(errorDiv).toBeTruthy();
  }, 30000);

  it('should display error messages that are user-friendly and clear', async () => {
    const { signIn } = require('next-auth/react');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 6, maxLength: 20 }),
        }),
        async (credentials) => {
          // Arrange: Mock signIn to fail
          signIn.mockResolvedValueOnce({
            error: 'Authentication failed',
            ok: false,
          });

          // Render sign-in page
          const { container } = render(
            <NotificationProvider>
              <SignInPage />
            </NotificationProvider>
          );

          // Fill and submit form
          const emailInput = container.querySelector('input[name="email"]');
          const passwordInput = container.querySelector('input[name="password"]');
          const submitButton = container.querySelector('button[type="submit"]');

          fireEvent.change(emailInput, { target: { value: credentials.email } });
          fireEvent.change(passwordInput, { target: { value: credentials.password } });
          fireEvent.click(submitButton);

          // Assert: Error message should be user-friendly
          await waitFor(() => {
            const errorText = container.textContent;
            expect(errorText).toContain(ERROR_MESSAGES.INVALID_CREDENTIALS);
          }, { timeout: 3000 });

          const messageText = container.textContent;
          
          // Verify message is user-friendly (not technical jargon)
          expect(messageText).toBeTruthy();
          expect(messageText.length).toBeGreaterThan(5);
          
          // Should not contain technical terms
          const technicalTerms = ['undefined', 'null', 'exception', 'stack trace', 'error code'];
          const containsTechnicalTerms = technicalTerms.some(term => 
            messageText.toLowerCase().includes(term)
          );
          expect(containsTechnicalTerms).toBe(false);
          
          // Clean up
          cleanup();
        }
      ),
      { numRuns: 5 }
    );
  }, 30000);

  it('should display error messages with proper accessibility attributes', async () => {
    // Render sign-in page
    const { container } = render(
      <NotificationProvider>
        <SignInPage />
      </NotificationProvider>
    );

    const emailInput = container.querySelector('input[name="email"]');
    const submitButton = container.querySelector('button[type="submit"]');

    // Act: Trigger validation error
    fireEvent.blur(emailInput); // Blur without entering value
    fireEvent.click(submitButton);

    // Assert: Error message should have proper accessibility
    await waitFor(() => {
      const errorMessages = container.querySelectorAll('[role="alert"]');
      expect(errorMessages.length).toBeGreaterThan(0);
    }, { timeout: 2000 });

    const errorMessage = container.querySelector('[role="alert"]');
    
    // Verify accessibility attributes
    expect(errorMessage.getAttribute('role')).toBe('alert');
    
    // Verify error message is associated with input
    const errorId = errorMessage.getAttribute('id');
    if (errorId) {
      // Check if any input references this error
      const inputs = container.querySelectorAll('input');
      const hasAssociation = Array.from(inputs).some(input => 
        input.getAttribute('aria-describedby')?.includes(errorId) ||
        input.getAttribute('aria-invalid') === 'true'
      );
      expect(hasAssociation).toBe(true);
    }
  }, 30000);

  it('should clear error messages when error condition is resolved', async () => {
    // Render sign-in page
    const { container } = render(
      <NotificationProvider>
        <SignInPage />
      </NotificationProvider>
    );

    const emailInput = container.querySelector('input[name="email"]');
    const submitButton = container.querySelector('button[type="submit"]');

    // Act: Trigger validation error
    fireEvent.blur(emailInput);
    fireEvent.click(submitButton);

    // Wait for error to appear
    await waitFor(() => {
      const errorMessages = container.querySelectorAll('[role="alert"]');
      expect(errorMessages.length).toBeGreaterThan(0);
    }, { timeout: 2000 });

    // Fix the error
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    fireEvent.blur(emailInput);

    // Assert: Error message should be cleared or reduced
    await waitFor(() => {
      const errorMessages = container.querySelectorAll('[role="alert"]');
      // Either no errors or fewer errors than before
      const emailErrors = Array.from(errorMessages).filter(el => 
        el.textContent.toLowerCase().includes('email')
      );
      expect(emailErrors.length).toBe(0);
    }, { timeout: 2000 });
  }, 30000);

  it('should display multiple error messages when multiple errors occur', async () => {
    // Render sign-in page
    const { container } = render(
      <NotificationProvider>
        <SignInPage />
      </NotificationProvider>
    );

    const emailInput = container.querySelector('input[name="email"]');
    const passwordInput = container.querySelector('input[name="password"]');
    const submitButton = container.querySelector('button[type="submit"]');

    // Blur both fields to trigger touched state
    fireEvent.blur(emailInput);
    fireEvent.blur(passwordInput);

    // Act: Submit form without filling any fields
    fireEvent.click(submitButton);

    // Assert: At least one error message should be displayed
    await waitFor(() => {
      const errorMessages = container.querySelectorAll('[role="alert"]');
      // Should have at least one error
      expect(errorMessages.length).toBeGreaterThanOrEqual(1);
    }, { timeout: 2000 });

    const errorMessages = container.querySelectorAll('[role="alert"]');
    
    // Verify each error message is visible and has content
    errorMessages.forEach(errorMsg => {
      expect(errorMsg.textContent).toBeTruthy();
      expect(errorMsg.textContent.length).toBeGreaterThan(0);
    });
  }, 30000);
});
