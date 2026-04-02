# Error Handling Guide

## Overview

This guide explains the standardized error handling approach used throughout the e-commerce application. All error messages are centralized in `frontend/lib/errors.js` to ensure consistency and maintainability.

## Core Principles

1. **Consistency**: All error messages use predefined constants from `ERROR_MESSAGES`
2. **User-Friendly**: Error messages are clear and actionable for end users
3. **Logging**: All errors are logged with context for debugging
4. **Graceful Degradation**: The application continues to function even when errors occur

## Using Standardized Error Messages

### Import the Error Utilities

```javascript
import { ERROR_MESSAGES, handleFetchError, createApiError, logError } from '@/lib/errors';
```

### Common Error Scenarios

#### 1. API Request Errors

```javascript
try {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await handleFetchError(new Error('Operation failed'), response);
    logError(error, { action: 'operationName', additionalContext });
    throw createApiError(error.message, error.status, error.data);
  }
  
  return response.json();
} catch (error) {
  if (error.status) {
    throw error; // Re-throw API errors
  }
  // Handle network errors
  logError(error, { action: 'operationName' });
  throw createApiError(ERROR_MESSAGES.NETWORK_ERROR);
}
```

#### 2. Form Validation Errors

```javascript
// Use predefined validation messages
if (!email) {
  setError('email', ERROR_MESSAGES.REQUIRED_FIELD);
}

if (!isValidEmail(email)) {
  setError('email', ERROR_MESSAGES.INVALID_EMAIL);
}

if (password.length < 6) {
  setError('password', ERROR_MESSAGES.INVALID_PASSWORD);
}
```

#### 3. User-Facing Error Messages

```javascript
try {
  await performOperation();
  showNotification('success', 'Operation completed successfully!');
} catch (error) {
  const errorMsg = error.message || ERROR_MESSAGES.GENERIC_ERROR;
  showNotification('error', errorMsg);
  logError(error, { action: 'performOperation' });
}
```

## Available Error Messages

### Network Errors
- `ERROR_MESSAGES.NETWORK_ERROR` - "Network error. Please check your connection."
- `ERROR_MESSAGES.TIMEOUT` - "Request timed out. Please try again."

### Authentication Errors
- `ERROR_MESSAGES.UNAUTHORIZED` - "Please log in to continue."
- `ERROR_MESSAGES.FORBIDDEN` - "Access denied."
- `ERROR_MESSAGES.INVALID_CREDENTIALS` - "Invalid email or password."
- `ERROR_MESSAGES.SESSION_EXPIRED` - "Your session has expired. Please log in again."

### Resource Errors
- `ERROR_MESSAGES.NOT_FOUND` - "Resource not found."

### Server Errors
- `ERROR_MESSAGES.SERVER_ERROR` - "Server error. Please try again later."

### Validation Errors
- `ERROR_MESSAGES.REQUIRED_FIELD` - "This field is required."
- `ERROR_MESSAGES.INVALID_EMAIL` - "Please enter a valid email address."
- `ERROR_MESSAGES.INVALID_PASSWORD` - "Password must be at least 6 characters."
- `ERROR_MESSAGES.PASSWORDS_DONT_MATCH` - "Passwords do not match."

### Operation Errors
- `ERROR_MESSAGES.CREATE_FAILED` - "Failed to create. Please try again."
- `ERROR_MESSAGES.UPDATE_FAILED` - "Failed to update. Please try again."
- `ERROR_MESSAGES.DELETE_FAILED` - "Failed to delete. Please try again."
- `ERROR_MESSAGES.FETCH_FAILED` - "Failed to load data. Please try again."

### Feature-Specific Errors
- `ERROR_MESSAGES.ORDER_CREATE_FAILED` - "Failed to create order. Please try again."
- `ERROR_MESSAGES.PAYMENT_FAILED` - "Payment failed. Please try again."
- `ERROR_MESSAGES.DUPLICATE_EMAIL` - "Email already exists. Please use a different email."

### Generic Fallback
- `ERROR_MESSAGES.GENERIC_ERROR` - "Something went wrong. Please try again."

## Error Logging

Always log errors with context to help with debugging:

```javascript
logError(error, {
  action: 'functionName',
  userId: user?.id,
  additionalData: relevantData
});
```

In development, errors are logged to the console. In production, you can extend the `logError` function to send errors to an error tracking service like Sentry.

## HTTP Status Code Mapping

The `handleFetchError` function automatically maps HTTP status codes to user-friendly messages:

- 400: "Invalid request. Please check your input."
- 401: "Please log in to continue."
- 403: "Access denied."
- 404: "Resource not found."
- 408: "Request timed out. Please try again."
- 409: "Conflict. The resource already exists."
- 422: "Validation failed. Please check your input."
- 429: "Too many requests. Please try again later."
- 500: "Server error. Please try again later."
- 502: "Bad gateway. Please try again later."
- 503: "Service unavailable. Please try again later."
- 504: "Request timed out. Please try again."

## Best Practices

1. **Always use ERROR_MESSAGES constants** instead of hardcoded strings
2. **Log errors with context** to help with debugging
3. **Provide fallback messages** using `error.message || ERROR_MESSAGES.GENERIC_ERROR`
4. **Display user-friendly messages** in notifications and UI
5. **Don't expose sensitive information** in error messages
6. **Handle both API and network errors** appropriately
7. **Use error boundaries** to catch React component errors

## Error Boundary Usage

Wrap your application or specific components with the ErrorBoundary component:

```javascript
import ErrorBoundary from '@/app/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

The ErrorBoundary will catch any React errors and display a fallback UI while logging the error for debugging.

## Examples from the Codebase

### Checkout Page
```javascript
try {
  const response = await createOrder(orderData, session.accessToken);
  clearCart();
  showNotification('success', 'Order placed successfully!');
  router.push(`/orders/${response.data.id}/confirmation`);
} catch (error) {
  console.error('Order creation failed:', error);
  const errorMsg = error.message || ERROR_MESSAGES.ORDER_CREATE_FAILED;
  setGeneralError(errorMsg);
  showNotification('error', errorMsg);
}
```

### Profile Page
```javascript
try {
  const userData = await getUserProfile(session.accessToken);
  setProfile(userData);
} catch (err) {
  console.error('Failed to fetch profile:', err);
  setGeneralError(err.message || ERROR_MESSAGES.FETCH_FAILED);
}
```

### Authentication
```javascript
if (result?.error) {
  setGeneralError(ERROR_MESSAGES.INVALID_CREDENTIALS);
  showNotification('error', ERROR_MESSAGES.INVALID_CREDENTIALS);
} else if (result?.ok) {
  router.push('/');
}
```

## Extending Error Messages

To add new error messages:

1. Add the constant to `ERROR_MESSAGES` in `frontend/lib/errors.js`
2. Use descriptive, user-friendly language
3. Keep messages concise and actionable
4. Update this guide with the new message

## Testing Error Handling

When testing error scenarios:

1. Test with invalid inputs
2. Test with network failures (disconnect network)
3. Test with API errors (mock failed responses)
4. Verify error messages are displayed correctly
5. Verify errors are logged with proper context
6. Test error boundary fallback UI

## Troubleshooting

If you encounter issues with error handling:

1. Check that you're importing from `@/lib/errors`
2. Verify you're using the correct ERROR_MESSAGES constant
3. Ensure errors are being logged with context
4. Check the browser console for logged errors
5. Verify the error boundary is properly wrapping components

## Summary

By following this standardized approach to error handling, we ensure:
- Consistent user experience across the application
- Easier maintenance and updates to error messages
- Better debugging with contextual error logging
- Graceful degradation when errors occur
- Clear, actionable feedback for users
