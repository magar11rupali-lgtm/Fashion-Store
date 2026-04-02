'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SessionProvider, useSession, signIn } from 'next-auth/react';
import { useNotification } from '@/hooks/useNotification';
import { useFormValidation, validators } from '@/hooks/useFormValidation';
import FormInput from '@/app/components/FormInput';
import { ERROR_MESSAGES } from '@/lib/errors';

function SignInInner() {
  const router = useRouter();
  const { status } = useSession();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fromCheckout, setFromCheckout] = useState(false);

  // Validation rules
  const validationRules = (values) => {
    const errors = {};
    
    // Email validation
    const emailRequiredError = validators.required(values.email, 'Email');
    if (emailRequiredError) {
      errors.email = emailRequiredError;
    } else {
      const emailFormatError = validators.email(values.email);
      if (emailFormatError) errors.email = emailFormatError;
    }
    
    // Password validation
    const passwordError = validators.required(values.password, 'Password');
    if (passwordError) errors.password = passwordError;
    
    return errors;
  };

  const {
    values: formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
  } = useFormValidation(
    {
      email: '',
      password: '',
    },
    validationRules
  );

  // Check if redirected from checkout (client-side only)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const callbackUrl = urlParams.get('callbackUrl');
    setFromCheckout(callbackUrl?.includes('/checkout') || false);
  }, []);

  // Redirect authenticated users
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'authenticated') {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAll()) return;
    
    setGeneralError('');
    setLoading(true);

    try {
      // Get callback URL from query params
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get('callbackUrl') || '/';

      console.log('Attempting sign in with:', formData.email);

      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      console.log('Sign in result:', result);

      if (result?.error) {
        console.error('Sign in error:', result.error);
        setGeneralError(ERROR_MESSAGES.INVALID_CREDENTIALS);
        showNotification('error', ERROR_MESSAGES.INVALID_CREDENTIALS);
        setLoading(false);
      } else if (result?.ok) {
        showNotification('success', 'Signed in successfully!');
        console.log('Redirecting to:', callbackUrl);
        // Redirect to callback URL (e.g., /checkout) or home
        router.push(callbackUrl);
      }
    } catch (err) {
      console.error('Sign in exception:', err);
      setGeneralError(ERROR_MESSAGES.GENERIC_ERROR);
      showNotification('error', ERROR_MESSAGES.GENERIC_ERROR);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 shadow-lg rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Sign In</h2>

        {fromCheckout && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
            Please sign in to continue with checkout
          </div>
        )}

        {generalError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {generalError}
          </div>
        )}

        <FormInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          touched={touched.email}
          placeholder="Enter your email address"
          required
          disabled={loading}
        />

        <FormInput
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          touched={touched.password}
          placeholder="Enter your password"
          required
          disabled={loading}
        />

        <button 
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed mt-2"
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <a href="/auth/signup" className="text-blue-600 hover:underline font-medium">
            Sign Up
          </a>
        </p>
      </form>
    </div>
  );
}
export default function SignInPage() {
  return (
    <SessionProvider>
      <SignInInner />
    </SessionProvider>
  );
}