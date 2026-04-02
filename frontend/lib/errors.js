/**
 * Error handling utilities for consistent error messages across the application
 */

/**
 * Standard error messages for common scenarios
 */
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  
  // Authentication errors
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'Access denied.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  
  // Resource errors
  NOT_FOUND: 'Resource not found.',
  
  // Server errors
  SERVER_ERROR: 'Server error. Please try again later.',
  
  // Validation errors
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 6 characters.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  
  // Operation errors
  CREATE_FAILED: 'Failed to create. Please try again.',
  UPDATE_FAILED: 'Failed to update. Please try again.',
  DELETE_FAILED: 'Failed to delete. Please try again.',
  FETCH_FAILED: 'Failed to load data. Please try again.',
  
  // Specific feature errors
  ORDER_CREATE_FAILED: 'Failed to create order. Please try again.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  DUPLICATE_EMAIL: 'Email already exists. Please use a different email.',
  
  // Generic fallback
  GENERIC_ERROR: 'Something went wrong. Please try again.',
};

/**
 * HTTP status code to error message mapping
 */
const STATUS_CODE_MESSAGES = {
  400: 'Invalid request. Please check your input.',
  401: ERROR_MESSAGES.UNAUTHORIZED,
  403: ERROR_MESSAGES.FORBIDDEN,
  404: ERROR_MESSAGES.NOT_FOUND,
  408: ERROR_MESSAGES.TIMEOUT,
  409: 'Conflict. The resource already exists.',
  422: 'Validation failed. Please check your input.',
  429: 'Too many requests. Please try again later.',
  500: ERROR_MESSAGES.SERVER_ERROR,
  502: 'Bad gateway. Please try again later.',
  503: 'Service unavailable. Please try again later.',
  504: ERROR_MESSAGES.TIMEOUT,
};

/**
 * Parse API error response and return user-friendly message
 * @param {Response} response - Fetch API response object
 * @param {Object} errorData - Parsed error data from response
 * @returns {string} User-friendly error message
 */
export function getApiErrorMessage(response, errorData = {}) {
  // Check for specific error messages from the API
  if (errorData?.error?.message) {
    return formatErrorMessage(errorData.error.message);
  }
  
  if (errorData?.message) {
    return formatErrorMessage(errorData.message);
  }
  
  // Check for validation errors
  if (errorData?.error?.details?.errors) {
    const errors = errorData.error.details.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      return errors.map(err => err.message).join('. ');
    }
  }
  
  // Fall back to status code mapping
  if (response?.status) {
    return STATUS_CODE_MESSAGES[response.status] || ERROR_MESSAGES.GENERIC_ERROR;
  }
  
  return ERROR_MESSAGES.GENERIC_ERROR;
}

/**
 * Format error message to be more user-friendly
 * @param {string} message - Raw error message
 * @returns {string} Formatted error message
 */
function formatErrorMessage(message) {
  // Handle common backend error patterns
  const errorPatterns = {
    'email already exists': ERROR_MESSAGES.DUPLICATE_EMAIL,
    'invalid credentials': ERROR_MESSAGES.INVALID_CREDENTIALS,
    'unauthorized': ERROR_MESSAGES.UNAUTHORIZED,
    'forbidden': ERROR_MESSAGES.FORBIDDEN,
    'not found': ERROR_MESSAGES.NOT_FOUND,
    'network error': ERROR_MESSAGES.NETWORK_ERROR,
    'timeout': ERROR_MESSAGES.TIMEOUT,
  };
  
  const lowerMessage = message.toLowerCase();
  
  for (const [pattern, userMessage] of Object.entries(errorPatterns)) {
    if (lowerMessage.includes(pattern)) {
      return userMessage;
    }
  }
  
  // Return original message if no pattern matches
  return message;
}

/**
 * Handle fetch errors and return standardized error object
 * @param {Error} error - Error object from fetch
 * @param {Response} response - Fetch API response object (optional)
 * @returns {Object} Standardized error object with message
 */
export async function handleFetchError(error, response = null) {
  // Network error (no response)
  if (!response) {
    if (error.name === 'AbortError') {
      return { message: ERROR_MESSAGES.TIMEOUT };
    }
    return { message: ERROR_MESSAGES.NETWORK_ERROR };
  }
  
  // Try to parse error response
  let errorData = {};
  try {
    errorData = await response.json();
  } catch (e) {
    // Response is not JSON
  }
  
  const message = getApiErrorMessage(response, errorData);
  
  return {
    message,
    status: response.status,
    data: errorData,
  };
}

/**
 * Create a standardized API error
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {Object} data - Additional error data
 * @returns {Error} Error object with additional properties
 */
export function createApiError(message, status = 500, data = {}) {
  const error = new Error(message);
  error.status = status;
  error.data = data;
  return error;
}

/**
 * Validate form field and return error message if invalid
 * @param {string} fieldName - Name of the field
 * @param {any} value - Field value
 * @param {Object} rules - Validation rules
 * @returns {string|null} Error message or null if valid
 */
export function validateField(fieldName, value, rules = {}) {
  if (rules.required && (!value || value.toString().trim() === '')) {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }
  
  if (rules.email && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return ERROR_MESSAGES.INVALID_EMAIL;
    }
  }
  
  if (rules.minLength && value && value.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters.`;
  }
  
  if (rules.maxLength && value && value.length > rules.maxLength) {
    return `Must be no more than ${rules.maxLength} characters.`;
  }
  
  if (rules.pattern && value && !rules.pattern.test(value)) {
    return rules.patternMessage || 'Invalid format.';
  }
  
  if (rules.custom && typeof rules.custom === 'function') {
    return rules.custom(value);
  }
  
  return null;
}

/**
 * Log error for debugging (can be extended to send to error tracking service)
 * @param {Error} error - Error object
 * @param {Object} context - Additional context about the error
 */
export function logError(error, context = {}) {
  if (process.env.NODE_ENV === 'development') {
    // Handle empty or malformed error objects
    if (!error || (typeof error === 'object' && Object.keys(error).length === 0)) {
      console.error('Empty error object received');
      console.error('Context:', context);
      return;
    }
    
    // Log error with proper formatting
    if (error instanceof Error) {
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
    } else {
      console.error('Error:', error);
    }
    
    if (Object.keys(context).length > 0) {
      console.error('Context:', context);
    }
  }
  
  // In production, you would send this to an error tracking service
  // Example: Sentry.captureException(error, { extra: context });
}
