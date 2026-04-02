import { useState, useCallback } from 'react';

/**
 * Custom hook for real-time form validation
 * @param {Object} initialValues - Initial form values
 * @param {Function} validationRules - Function that returns validation errors
 * @returns {Object} Form state and handlers
 */
export function useFormValidation(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validate a single field
  const validateField = useCallback((name, value) => {
    const fieldErrors = validationRules({ ...values, [name]: value });
    return fieldErrors[name] || '';
  }, [values, validationRules]);

  // Handle input change with real-time validation
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Update value
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing (if field was touched)
    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }
  }, [touched, validateField]);

  // Handle input blur - mark field as touched and validate
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field
    const fieldError = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  }, [validateField]);

  // Validate all fields
  const validateAll = useCallback(() => {
    const allErrors = validationRules(values);
    setErrors(allErrors);
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    return Object.keys(allErrors).length === 0;
  }, [values, validationRules]);

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // Set a specific error (for server-side errors)
  const setError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setError,
    setValues,
  };
}

// Common validation rules
export const validators = {
  required: (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return '';
  },

  email: (value) => {
    if (!value) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  },

  minLength: (value, min, fieldName = 'This field') => {
    if (!value) return '';
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return '';
  },

  maxLength: (value, max, fieldName = 'This field') => {
    if (!value) return '';
    if (value.length > max) {
      return `${fieldName} must be no more than ${max} characters`;
    }
    return '';
  },

  phone: (value) => {
    if (!value) return '';
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
      return 'Please enter a valid phone number';
    }
    return '';
  },

  postalCode: (value) => {
    if (!value) return '';
    const postalRegex = /^[A-Za-z0-9\s\-]{3,10}$/;
    if (!postalRegex.test(value)) {
      return 'Please enter a valid postal code';
    }
    return '';
  },
};
