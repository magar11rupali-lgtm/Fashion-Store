/**
 * Property-Based Tests for Real-Time Form Validation
 * Feature: ecommerce-fixes-and-enhancements
 */

import fc from 'fast-check';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { useFormValidation, validators } from '../../hooks/useFormValidation';
import FormInput from '../../app/components/FormInput';

describe('Feature: ecommerce-fixes-and-enhancements, Real-Time Validation Property Tests', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Property 45: Real-time form validation', () => {
    /**
     * **Validates: Requirements 9.8**
     * 
     * Property: For any form input with validation rules, invalid input should display 
     * an inline error message immediately
     */

    // Arbitrary generators for different types of invalid inputs
    const invalidEmailArbitrary = fc.oneof(
      fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('@')),
      fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '@'),
      fc.constant(''),
      fc.constant('   ')
    );

    const shortPasswordArbitrary = fc.string({ minLength: 0, maxLength: 5 });

    const emptyStringArbitrary = fc.oneof(
      fc.constant(''),
      fc.constant('   '),
      fc.constant('\t'),
      fc.constant('\n')
    );

    it('should display error message immediately for invalid email after blur', async () => {
      await fc.assert(
        fc.asyncProperty(
          invalidEmailArbitrary,
          async (invalidEmail) => {
            // Arrange: Create validation rules (combine required + email validation)
            const validationRules = (values) => {
              const errors = {};
              const requiredError = validators.required(values.email, 'Email');
              if (requiredError) {
                errors.email = requiredError;
              } else {
                const emailError = validators.email(values.email);
                if (emailError) errors.email = emailError;
              }
              return errors;
            };

            // Render hook
            const { result } = renderHook(() => 
              useFormValidation({ email: '' }, validationRules)
            );

            // Act: Simulate user typing invalid email
            act(() => {
              result.current.handleChange({
                target: { name: 'email', value: invalidEmail }
              });
            });

            // Act: Simulate blur event (user leaves field)
            act(() => {
              result.current.handleBlur({
                target: { name: 'email', value: invalidEmail }
              });
            });

            // Assert: Error should be present after blur
            expect(result.current.errors.email).toBeTruthy();
            expect(result.current.touched.email).toBe(true);
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should display error message for short password after blur', async () => {
      await fc.assert(
        fc.asyncProperty(
          shortPasswordArbitrary,
          async (shortPassword) => {
            // Arrange: Create validation rules (combine required + minLength validation)
            const validationRules = (values) => {
              const errors = {};
              const requiredError = validators.required(values.password, 'Password');
              if (requiredError) {
                errors.password = requiredError;
              } else {
                const passwordError = validators.minLength(values.password, 6, 'Password');
                if (passwordError) errors.password = passwordError;
              }
              return errors;
            };

            // Render hook
            const { result } = renderHook(() => 
              useFormValidation({ password: '' }, validationRules)
            );

            // Act: Simulate user typing short password
            act(() => {
              result.current.handleChange({
                target: { name: 'password', value: shortPassword }
              });
            });

            // Act: Simulate blur event
            act(() => {
              result.current.handleBlur({
                target: { name: 'password', value: shortPassword }
              });
            });

            // Assert: Error should be present after blur
            expect(result.current.errors.password).toBeTruthy();
            expect(result.current.touched.password).toBe(true);
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should display error message for required field when empty after blur', async () => {
      await fc.assert(
        fc.asyncProperty(
          emptyStringArbitrary,
          fc.constantFrom('name', 'email', 'phone', 'address'),
          async (emptyValue, fieldName) => {
            // Arrange: Create validation rules
            const validationRules = (values) => {
              const errors = {};
              const requiredError = validators.required(values[fieldName], fieldName);
              if (requiredError) errors[fieldName] = requiredError;
              return errors;
            };

            // Render hook
            const { result } = renderHook(() => 
              useFormValidation({ [fieldName]: '' }, validationRules)
            );

            // Act: Simulate user entering empty value
            act(() => {
              result.current.handleChange({
                target: { name: fieldName, value: emptyValue }
              });
            });

            // Act: Simulate blur event
            act(() => {
              result.current.handleBlur({
                target: { name: fieldName, value: emptyValue }
              });
            });

            // Assert: Error should be present after blur
            expect(result.current.errors[fieldName]).toBeTruthy();
            expect(result.current.touched[fieldName]).toBe(true);
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should clear error message when user corrects invalid input', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          async (validEmail) => {
            // Arrange: Create validation rules
            const validationRules = (values) => {
              const errors = {};
              const emailError = validators.email(values.email);
              if (emailError) errors.email = emailError;
              return errors;
            };

            // Render hook
            const { result } = renderHook(() => 
              useFormValidation({ email: '' }, validationRules)
            );

            // Act: First enter invalid email and blur
            act(() => {
              result.current.handleChange({
                target: { name: 'email', value: 'invalid' }
              });
            });

            act(() => {
              result.current.handleBlur({
                target: { name: 'email', value: 'invalid' }
              });
            });

            // Verify error exists
            expect(result.current.errors.email).toBeTruthy();

            // Act: Now correct the email
            act(() => {
              result.current.handleChange({
                target: { name: 'email', value: validEmail }
              });
            });

            // Assert: Error should be cleared
            expect(result.current.errors.email).toBeFalsy();
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should display inline error in FormInput component when field is touched and invalid', () => {
      // Arrange: Render FormInput with error
      const { container } = render(
        <FormInput
          label="Email"
          name="email"
          value="invalid-email"
          onChange={() => {}}
          onBlur={() => {}}
          error="Please enter a valid email address"
          touched={true}
        />
      );

      // Assert: Error message should be visible
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent('Please enter a valid email address');

      // Assert: Input should have error styling
      const input = container.querySelector('input');
      expect(input).toHaveClass('border-red-500');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should not display error in FormInput when field is not touched', () => {
      // Arrange: Render FormInput with error but not touched
      const { container } = render(
        <FormInput
          label="Email"
          name="email"
          value="invalid-email"
          onChange={() => {}}
          onBlur={() => {}}
          error="Please enter a valid email address"
          touched={false}
        />
      );

      // Assert: Error message should NOT be visible
      const errorElement = screen.queryByRole('alert');
      expect(errorElement).not.toBeInTheDocument();

      // Assert: Input should NOT have error styling
      const input = container.querySelector('input');
      expect(input).not.toHaveClass('border-red-500');
    });

    it('should validate multiple fields independently in real-time', async () => {
      await fc.assert(
        fc.asyncProperty(
          invalidEmailArbitrary,
          shortPasswordArbitrary,
          async (invalidEmail, shortPassword) => {
            // Arrange: Create validation rules for multiple fields
            const validationRules = (values) => {
              const errors = {};
              
              const emailRequiredError = validators.required(values.email, 'Email');
              if (emailRequiredError) {
                errors.email = emailRequiredError;
              } else {
                const emailError = validators.email(values.email);
                if (emailError) errors.email = emailError;
              }
              
              const passwordRequiredError = validators.required(values.password, 'Password');
              if (passwordRequiredError) {
                errors.password = passwordRequiredError;
              } else {
                const passwordError = validators.minLength(values.password, 6, 'Password');
                if (passwordError) errors.password = passwordError;
              }
              
              return errors;
            };

            // Render hook
            const { result } = renderHook(() => 
              useFormValidation({ email: '', password: '' }, validationRules)
            );

            // Act: Enter invalid email and blur
            act(() => {
              result.current.handleChange({
                target: { name: 'email', value: invalidEmail }
              });
            });

            act(() => {
              result.current.handleBlur({
                target: { name: 'email', value: invalidEmail }
              });
            });

            // Assert: Email error should exist, password error should not (not touched yet)
            expect(result.current.errors.email).toBeTruthy();
            expect(result.current.touched.email).toBe(true);
            expect(result.current.touched.password).toBeFalsy();

            // Act: Enter short password and blur
            act(() => {
              result.current.handleChange({
                target: { name: 'password', value: shortPassword }
              });
            });

            act(() => {
              result.current.handleBlur({
                target: { name: 'password', value: shortPassword }
              });
            });

            // Assert: Both errors should exist now
            expect(result.current.errors.email).toBeTruthy();
            expect(result.current.errors.password).toBeTruthy();
            expect(result.current.touched.password).toBe(true);
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should validate phone number format in real-time', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant('abc'),
            fc.constant('123'),
            fc.constant('12-34'),
            fc.string({ minLength: 1, maxLength: 5 }).filter(s => !/^\d+$/.test(s))
          ),
          async (invalidPhone) => {
            // Arrange: Create validation rules
            const validationRules = (values) => {
              const errors = {};
              const phoneError = validators.phone(values.phone);
              if (phoneError) errors.phone = phoneError;
              return errors;
            };

            // Render hook
            const { result } = renderHook(() => 
              useFormValidation({ phone: '' }, validationRules)
            );

            // Act: Enter invalid phone and blur
            act(() => {
              result.current.handleChange({
                target: { name: 'phone', value: invalidPhone }
              });
            });

            act(() => {
              result.current.handleBlur({
                target: { name: 'phone', value: invalidPhone }
              });
            });

            // Assert: Error should be present
            expect(result.current.errors.phone).toBeTruthy();
            expect(result.current.touched.phone).toBe(true);
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should not show error before field is touched (blur)', () => {
      // Arrange: Create validation rules
      const validationRules = (values) => {
        const errors = {};
        const emailError = validators.email(values.email);
        if (emailError) errors.email = emailError;
        return errors;
      };

      // Render hook
      const { result } = renderHook(() => 
        useFormValidation({ email: '' }, validationRules)
      );

      // Act: Only change value, don't blur
      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'invalid' }
        });
      });

      // Assert: Error should NOT be present (field not touched)
      expect(result.current.errors.email).toBeFalsy();
      expect(result.current.touched.email).toBeFalsy();
    });
  });
});
