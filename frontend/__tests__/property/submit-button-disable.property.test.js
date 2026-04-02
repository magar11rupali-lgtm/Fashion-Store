import { render, cleanup, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import fc from 'fast-check';
import SignUpPage from '@/app/auth/signup/page';
import SignInPage from '@/app/auth/signin/page';
import ContactPage from '@/app/contact/page';
import AdminLoginPage from '@/app/auth/admin-login/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

jest.mock('@/hooks/useNotification', () => ({
  useNotification: () => ({
    showNotification: jest.fn(),
  }),
}));

jest.mock('@/app/context/CartContext', () => ({
  useCart: () => ({
    cart: [],
    totalPrice: 0,
    clearCart: jest.fn(),
  }),
}));

jest.mock('@/app/context/WishlistContext', () => ({
  useWishlist: () => ({
    wishlist: [],
    totalItems: 0,
  }),
}));

jest.mock('@/lib/admin-auth', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  checkAuth: jest.fn(),
}));

describe('Feature: ecommerce-fixes-and-enhancements, Property 46: Submit button disable during submission', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test('should disable submit button during signin form submission for any valid credentials', async () => {
    const emailArbitrary = fc.emailAddress();
    const passwordArbitrary = fc.string({ minLength: 6, maxLength: 50 });
    
    await fc.assert(
      fc.asyncProperty(
        emailArbitrary,
        passwordArbitrary,
        async (email, password) => {
          const { signIn } = require('next-auth/react');
          
          signIn.mockImplementation(() => new Promise(resolve => {
            setTimeout(() => resolve({ ok: true }), 100);
          }));

          const { container } = render(<SignInPage />);
          
          const emailInput = container.querySelector('input[type="email"]');
          const passwordInput = container.querySelector('input[type="password"]');
          const submitButton = container.querySelector('button[type="submit"]');

          expect(submitButton).not.toBeDisabled();

          fireEvent.change(emailInput, { target: { value: email } });
          fireEvent.change(passwordInput, { target: { value: password } });
          fireEvent.click(submitButton);

          expect(submitButton).toBeDisabled();
          
          cleanup();
        }
      ),
      { numRuns: 10 }
    );
  });

  test('should disable submit button during signup form submission for any valid credentials', async () => {
    const usernameArbitrary = fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s));
    const emailArbitrary = fc.emailAddress();
    const passwordArbitrary = fc.string({ minLength: 6, maxLength: 50 });
    
    await fc.assert(
      fc.asyncProperty(
        usernameArbitrary,
        emailArbitrary,
        passwordArbitrary,
        async (username, email, password) => {
          global.fetch = jest.fn(() => 
            new Promise(resolve => {
              setTimeout(() => resolve({
                ok: true,
                json: () => Promise.resolve({ jwt: 'test-token', user: {} })
              }), 100);
            })
          );

          const { container } = render(<SignUpPage />);
          
          const usernameInput = container.querySelector('input[name="username"]');
          const emailInput = container.querySelector('input[type="email"]');
          const passwordInputs = container.querySelectorAll('input[type="password"]');
          const submitButton = container.querySelector('button[type="submit"]');

          expect(submitButton).not.toBeDisabled();

          fireEvent.change(usernameInput, { target: { value: username } });
          fireEvent.change(emailInput, { target: { value: email } });
          fireEvent.change(passwordInputs[0], { target: { value: password } });
          fireEvent.change(passwordInputs[1], { target: { value: password } });

          fireEvent.click(submitButton);

          await waitFor(() => {
            expect(submitButton).toBeDisabled();
          }, { timeout: 100 });
          
          cleanup();
        }
      ),
      { numRuns: 10 }
    );
  });

  test('should disable submit button during contact form submission for any valid form data', async () => {
    const nameArbitrary = fc.string({ minLength: 2, maxLength: 50 }).filter(s => /^[a-zA-Z\s]+$/.test(s));
    const emailArbitrary = fc.emailAddress();
    const subjectArbitrary = fc.string({ minLength: 3, maxLength: 100 });
    const messageArbitrary = fc.string({ minLength: 10, maxLength: 500 });
    
    await fc.assert(
      fc.asyncProperty(
        nameArbitrary,
        emailArbitrary,
        subjectArbitrary,
        messageArbitrary,
        async (name, email, subject, message) => {
          global.fetch = jest.fn(() => 
            new Promise(resolve => {
              setTimeout(() => resolve({
                ok: true,
                json: () => Promise.resolve({ data: {} })
              }), 100);
            })
          );

          const { container } = render(<ContactPage />);
          
          const nameInput = container.querySelector('input[name="name"]');
          const emailInput = container.querySelector('input[type="email"]');
          const subjectInput = container.querySelector('input[name="subject"]');
          const messageInput = container.querySelector('textarea[name="message"]');
          const submitButton = container.querySelector('button[type="submit"]');

          expect(submitButton).not.toBeDisabled();

          fireEvent.change(nameInput, { target: { value: name } });
          fireEvent.change(emailInput, { target: { value: email } });
          fireEvent.change(subjectInput, { target: { value: subject } });
          fireEvent.change(messageInput, { target: { value: message } });
          fireEvent.click(submitButton);

          await waitFor(() => {
            expect(submitButton).toBeDisabled();
          }, { timeout: 100 });
          
          cleanup();
        }
      ),
      { numRuns: 10 }
    );
  });

  test('should disable submit button during admin login form submission for any credentials', async () => {
    const usernameArbitrary = fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s));
    const passwordArbitrary = fc.string({ minLength: 6, maxLength: 50 });
    
    await fc.assert(
      fc.asyncProperty(
        usernameArbitrary,
        passwordArbitrary,
        async (username, password) => {
          const { login } = require('@/lib/admin-auth');
          
          login.mockImplementation(() => new Promise(resolve => {
            setTimeout(() => resolve(true), 100);
          }));

          const { container } = render(<AdminLoginPage />);
          
          const usernameInput = container.querySelector('input[name="username"]');
          const passwordInput = container.querySelector('input[type="password"]');
          const submitButton = container.querySelector('button[type="submit"]');

          expect(submitButton).not.toBeDisabled();

          fireEvent.change(usernameInput, { target: { value: username } });
          fireEvent.change(passwordInput, { target: { value: password } });
          fireEvent.click(submitButton);

          await waitFor(() => {
            expect(submitButton).toBeDisabled();
          }, { timeout: 100 });
          
          cleanup();
        }
      ),
      { numRuns: 10 }
    );
  });
});
