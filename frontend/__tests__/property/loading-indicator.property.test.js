/**
 * Property-Based Test for Loading Indicator Display
 * Feature: ecommerce-fixes-and-enhancements
 * Property 28: Loading indicator display
 * Validates: Requirements 6.5, 6.9
 */

import { render, screen, waitFor, cleanup } from '@testing-library/react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import fc from 'fast-check';
import React from 'react';

// Arbitrary generators for LoadingSpinner props
const variantArbitrary = fc.constantFrom('inline', 'fullPage');
const sizeArbitrary = fc.constantFrom('small', 'medium', 'large');
const messageArbitrary = fc.option(
  fc.string({ minLength: 1, maxLength: 100 }),
  { nil: '' }
);

describe('Feature: ecommerce-fixes-and-enhancements, Property 28: Loading indicator display', () => {
  afterEach(() => {
    cleanup();
  });
  /**
   * **Validates: Requirements 6.5, 6.9**
   * 
   * Property: For any asynchronous operation, a loading indicator should be displayed
   * 
   * This property verifies that:
   * 1. The LoadingSpinner component renders with any valid props
   * 2. The loading indicator has proper accessibility attributes (role="status")
   * 3. The loading indicator is visible in the DOM
   * 4. The loading indicator displays the correct variant (inline or fullPage)
   * 5. The loading indicator displays optional messages when provided
   */
  it('should display loading indicator with proper accessibility for any props', () => {
    fc.assert(
      fc.property(
        variantArbitrary,
        sizeArbitrary,
        messageArbitrary,
        (variant, size, message) => {
          // Clean up before each iteration
          cleanup();

          // Arrange & Act: Render LoadingSpinner with generated props
          const { container } = render(
            <LoadingSpinner 
              variant={variant} 
              size={size} 
              message={message}
            />
          );

          // Assert: Loading indicator should be present with proper accessibility
          const loadingElement = screen.getByRole('status');
          expect(loadingElement).toBeInTheDocument();
          expect(loadingElement).toHaveAttribute('aria-label', 'Loading');

          // Verify the spinner has animation class
          expect(loadingElement).toHaveClass('animate-spin');

          // Verify message is displayed if provided
          if (message && message.trim()) {
            expect(screen.getByText(message.trim())).toBeInTheDocument();
          }

          // Verify variant-specific rendering
          if (variant === 'fullPage') {
            // Full page variant should have fixed positioning
            const fullPageContainer = container.querySelector('.fixed.inset-0');
            expect(fullPageContainer).toBeInTheDocument();
          } else {
            // Inline variant should not have fixed positioning
            const fullPageContainer = container.querySelector('.fixed.inset-0');
            expect(fullPageContainer).not.toBeInTheDocument();
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should display loading indicator with correct size classes', () => {
    fc.assert(
      fc.property(
        sizeArbitrary,
        (size) => {
          // Clean up before each iteration
          cleanup();

          // Arrange & Act: Render LoadingSpinner with generated size
          render(<LoadingSpinner size={size} />);

          // Assert: Loading indicator should have correct size classes
          const loadingElement = screen.getByRole('status');
          expect(loadingElement).toBeInTheDocument();

          // Verify size-specific classes
          const sizeClasses = {
            small: 'w-4 h-4',
            medium: 'w-8 h-8',
            large: 'w-12 h-12'
          };

          expect(loadingElement).toHaveClass(sizeClasses[size].split(' ')[0]);
          expect(loadingElement).toHaveClass(sizeClasses[size].split(' ')[1]);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should display loading indicator during async operations', async () => {
    // Simulate async operation with loading state
    function AsyncComponent({ delay, testId }) {
      const [loading, setLoading] = React.useState(true);
      const [data, setData] = React.useState(null);

      React.useEffect(() => {
        const fetchData = async () => {
          setLoading(true);
          await new Promise(resolve => setTimeout(resolve, delay));
          setData('Data loaded');
          setLoading(false);
        };
        fetchData();
      }, [delay]);

      if (loading) {
        return <div data-testid={testId}><LoadingSpinner message="Loading data..." /></div>;
      }

      return <div data-testid={testId}>{data}</div>;
    }

    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 10, max: 100 }),
        async (delay) => {
          // Clean up before each iteration
          cleanup();

          const testId = `async-test-${delay}-${Date.now()}`;

          // Arrange & Act: Render component with async operation
          render(<AsyncComponent delay={delay} testId={testId} />);

          // Assert: Loading indicator should be displayed initially
          const loadingElement = screen.getByRole('status');
          expect(loadingElement).toBeInTheDocument();
          expect(screen.getByText('Loading data...')).toBeInTheDocument();

          // Wait for async operation to complete
          await waitFor(() => {
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
          }, { timeout: delay + 500 });

          // Verify data is displayed after loading
          const container = screen.getByTestId(testId);
          expect(container).toHaveTextContent('Data loaded');
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);

  it('should display loading indicator with proper visual feedback', () => {
    fc.assert(
      fc.property(
        variantArbitrary,
        messageArbitrary,
        (variant, message) => {
          // Clean up before each iteration
          cleanup();

          // Arrange & Act: Render LoadingSpinner
          const { container } = render(
            <LoadingSpinner variant={variant} message={message} />
          );

          // Assert: Loading indicator should provide visual feedback
          const loadingElement = screen.getByRole('status');
          
          // Verify spinner has rounded shape
          expect(loadingElement).toHaveClass('rounded-full');
          
          // Verify spinner has border styling
          expect(loadingElement.className).toMatch(/border-/);
          
          // Verify spinner has animation
          expect(loadingElement).toHaveClass('animate-spin');

          // Verify container has proper layout classes
          const flexContainer = container.querySelector('.flex');
          expect(flexContainer).toBeInTheDocument();
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should display loading indicator with default props when none provided', () => {
    // Arrange & Act: Render LoadingSpinner without props
    render(<LoadingSpinner />);

    // Assert: Loading indicator should render with defaults
    const loadingElement = screen.getByRole('status');
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement).toHaveAttribute('aria-label', 'Loading');
    
    // Default size should be medium
    expect(loadingElement).toHaveClass('w-8');
    expect(loadingElement).toHaveClass('h-8');
    
    // Default variant should be inline (no fixed positioning)
    const { container } = render(<LoadingSpinner />);
    const fullPageContainer = container.querySelector('.fixed.inset-0');
    expect(fullPageContainer).not.toBeInTheDocument();
  });

  it('should display loading indicator in forms during submission', async () => {
    // Simulate form submission with loading state
    function FormComponent({ submitDelay, testId }) {
      const [isSubmitting, setIsSubmitting] = React.useState(false);
      const [submitted, setSubmitted] = React.useState(false);

      const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, submitDelay));
        setSubmitted(true);
        setIsSubmitting(false);
      };

      return (
        <form onSubmit={handleSubmit} data-testid={testId}>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          {isSubmitting && <LoadingSpinner size="small" message="Processing..." />}
          {submitted && <div>Form submitted successfully</div>}
        </form>
      );
    }

    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 10, max: 100 }),
        async (submitDelay) => {
          // Clean up before each iteration
          cleanup();

          const testId = `form-test-${submitDelay}-${Date.now()}`;

          // Arrange: Render form component
          render(<FormComponent submitDelay={submitDelay} testId={testId} />);
          
          // Act: Submit form
          const form = screen.getByTestId(testId);
          const submitButton = form.querySelector('button[type="submit"]');
          submitButton.click();

          // Assert: Loading indicator should be displayed during submission
          await waitFor(() => {
            expect(screen.getByRole('status')).toBeInTheDocument();
          });
          
          expect(screen.getByText('Processing...')).toBeInTheDocument();
          expect(submitButton).toBeDisabled();
          expect(submitButton).toHaveTextContent('Submitting...');

          // Wait for submission to complete
          await waitFor(() => {
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
          }, { timeout: submitDelay + 500 });

          // Verify form submission completed
          expect(screen.getByText('Form submitted successfully')).toBeInTheDocument();
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);
});

