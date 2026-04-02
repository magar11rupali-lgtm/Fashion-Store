'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useNotification } from '@/hooks/useNotification';
import { useFormValidation, validators } from '@/hooks/useFormValidation';
import FormInput from '@/app/components/FormInput';
import { ERROR_MESSAGES } from '@/lib/errors';

export default function SignUpPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Validation rules with real-time validation
  const validationRules = (values) => {
    const errors = {};
    
    // Username validation
    const usernameError = validators.required(values.username, 'Username');
    if (usernameError) errors.username = usernameError;
    
    // Email validation
    const emailRequiredError = validators.required(values.email, 'Email');
    if (emailRequiredError) {
      errors.email = emailRequiredError;
    } else {
      const emailFormatError = validators.email(values.email);
      if (emailFormatError) errors.email = emailFormatError;
    }
    
    // Password validation
    const passwordRequiredError = validators.required(values.password, 'Password');
    if (passwordRequiredError) {
      errors.password = passwordRequiredError;
    } else {
      const passwordLengthError = validators.minLength(values.password, 6, 'Password');
      if (passwordLengthError) errors.password = passwordLengthError;
    }
    
    // Confirm password validation
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  const {
    values: formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    setError,
  } = useFormValidation(
    {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationRules
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) return;

    setIsLoading(true);
    setGeneralError(''); // Clear previous errors

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showNotification('success', 'Account created successfully! Please sign in.');
        router.push('/auth/signin?registered=true');
      } else {
        // Handle specific error cases
        const errorMessage = data.error?.message || '';
        
        // Check for duplicate email error
        if (errorMessage.toLowerCase().includes('email') && 
            (errorMessage.toLowerCase().includes('already') || 
             errorMessage.toLowerCase().includes('taken') ||
             errorMessage.toLowerCase().includes('exists'))) {
          setError('email', ERROR_MESSAGES.DUPLICATE_EMAIL);
          showNotification('error', ERROR_MESSAGES.DUPLICATE_EMAIL);
        } else if (errorMessage.toLowerCase().includes('username') && 
                   (errorMessage.toLowerCase().includes('already') || 
                    errorMessage.toLowerCase().includes('taken'))) {
          const errorMsg = 'This username is already taken. Please choose a different username.';
          setError('username', errorMsg);
          showNotification('error', errorMsg);
        } else {
          const errorMsg = errorMessage || ERROR_MESSAGES.CREATE_FAILED;
          setGeneralError(errorMsg);
          showNotification('error', errorMsg);
        }
      }
    } catch (error) {
      setGeneralError(ERROR_MESSAGES.NETWORK_ERROR);
      showNotification('error', ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg border">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Create Account
          </h1>

          {generalError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.username}
              touched={touched.username}
              placeholder="Enter your username"
              required
              disabled={isLoading}
            />

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
              disabled={isLoading}
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
              placeholder="At least 6 characters"
              required
              disabled={isLoading}
            />

            <FormInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
              placeholder="Re-enter your password"
              required
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
 
          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-blue-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}