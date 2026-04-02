/**
 * Property-Based Tests for Contact Form Submission
 * Feature: ecommerce-fixes-and-enhancements
 */

import React from 'react';
import fc from 'fast-check';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import ContactPage from '../../app/contact/page';

// Mock Next.js components
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

// Mock useNotification hook
jest.mock('@/hooks/useNotification', () => ({
  useNotification: () => ({
    showNotification: jest.fn(),
    notifications: [],
  }),
}));

// Mock useFormValidation hook
jest.mock('@/hooks/useFormValidation', () => ({
  useFormValidation: (initialValues, validationRules) => {
    const [values, setValues] = React.useState(initialValues);
    const [errors, setErrors] = React.useState({});
    const [touched, setTouched] = React.useState({});

    return {
      values,
      errors,
      touched,
      handleChange: (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
      },
      handleBlur: (e) => {
        setTouched({ ...touched, [e.target.name]: true });
      },
      validateAll: () => {
        const validationErrors = validationRules(values);
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
      },
      reset: () => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
      },
    };
  },
  validators: {
    required: (value, fieldName) => !value || value.trim() === '' ? `${fieldName} is required` : null,
    email: (value) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email format' : null,
    minLength: (value, length, fieldName) => value && value.length < length ? `${fieldName} must be at least ${length} characters` : null,
  },
}));

// Mock FormInput component
jest.mock('../../app/components/FormInput', () => {
  return function MockFormInput({ label, name, type, value, onChange, onBlur, error, touched, placeholder, required, disabled }) {
    return (
      <div>
        <label htmlFor={name}>{label}{required && ' *'}</label>
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={label}
        />
        {touched && error && <span role="alert">{error}</span>}
      </div>
    );
  };
});

// Mock errors module
jest.mock('../../lib/errors', () => ({
  ERROR_MESSAGES: {
    GENERIC_ERROR: 'An error occurred',
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

// Arbitrary generator for contact form data
const contactFormArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  email: fc.emailAddress(),
  subject: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
  message: fc.string({ minLength: 10, maxLength: 1000 }).filter(s => s.trim().length >= 10),
});

describe('Feature: ecommerce-fixes-and-enhancements, Contact Form Submission Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cleanup();
    global.fetch.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Property 31: Contact form submission', () => {
    /**
     * **Validates: Requirements 7.3**
     * 
     * Property: For any valid contact form data, submitting the form should send 
     * the message to the configured email address (via backend API)
     */

    it('should send contact form data to backend API for any valid form data', async () => {
      await fc.assert(
        fc.asyncProperty(
          contactFormArbitrary,
          async (formData) => {
            // Arrange: Mock successful API response
            global.fetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({ data: { id: 1, ...formData } }),
            });

            // Act: Render contact page
            const { unmount } = render(<ContactPage />);

            // Fill in form fields
            const nameInput = screen.getByLabelText(/name/i);
            fireEvent.change(nameInput, { target: { value: formData.name } });

            const emailInput = screen.getByLabelText(/email/i);
            fireEvent.change(emailInput, { target: { value: formData.email } });

            const subjectInput = screen.getByLabelText(/subject/i);
            fireEvent.change(subjectInput, { target: { value: formData.subject } });

            const messageInput = screen.getByLabelText(/message/i);
            fireEvent.change(messageInput, { target: { value: formData.message } });

            // Submit form
            const submitButton = screen.getByRole('button', { name: /send message/i });
            fireEvent.click(submitButton);

            // Assert: fetch should be called with correct endpoint and data
            await waitFor(() => {
              expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/contact-messages'),
                expect.objectContaining({
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    data: {
                      name: formData.name,
                      email: formData.email,
                      subject: formData.subject,
                      message: formData.message,
                    },
                  }),
                })
              );
            }, { timeout: 3000 });

            // Assert: Success message should be displayed
            await waitFor(() => {
              expect(screen.getByText(/thank you for your message/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            // Cleanup
            unmount();
            cleanup();
          }
        ),
        { numRuns: 100 }
      );
    }, 120000); // 120 second timeout for property-based test
  });
});
