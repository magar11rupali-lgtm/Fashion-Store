'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../../lib/orders';
import Header from '../components/Header';
import Footer from '../components/Footer';
import OrderSummary from '../components/OrderSummary';
import { useNotification } from '@/hooks/useNotification';
import { useFormValidation, validators } from '@/hooks/useFormValidation';
import FormInput from '../components/FormInput';
import { ERROR_MESSAGES } from '../../lib/errors';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cart, totalPrice, clearCart } = useCart();
  const { showNotification } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/checkout');
    }
  }, [status, router]);

  // Validation rules
  const validationRules = (values) => {
    const errors = {};
    
    // First name validation
    const firstNameError = validators.required(values.firstName, 'First name');
    if (firstNameError) errors.firstName = firstNameError;
    
    // Last name validation
    const lastNameError = validators.required(values.lastName, 'Last name');
    if (lastNameError) errors.lastName = lastNameError;
    
    // Email validation
    const emailRequiredError = validators.required(values.email, 'Email');
    if (emailRequiredError) {
      errors.email = emailRequiredError;
    } else {
      const emailFormatError = validators.email(values.email);
      if (emailFormatError) errors.email = emailFormatError;
    }
    
    // Phone validation (optional but validate format if provided)
    if (values.phone) {
      const phoneError = validators.phone(values.phone);
      if (phoneError) errors.phone = phoneError;
    }
    
    // Address validation
    const addressError = validators.required(values.address, 'Address');
    if (addressError) errors.address = addressError;
    
    // City validation
    const cityError = validators.required(values.city, 'City');
    if (cityError) errors.city = cityError;
    
    // Postal code validation
    const postalRequiredError = validators.required(values.postalCode, 'Postal code');
    if (postalRequiredError) {
      errors.postalCode = postalRequiredError;
    } else {
      const postalFormatError = validators.postalCode(values.postalCode);
      if (postalFormatError) errors.postalCode = postalFormatError;
    }
    
    // Country validation
    const countryError = validators.required(values.country, 'Country');
    if (countryError) errors.country = countryError;
    
    return errors;
  };

  const {
    values: formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    setValues,
  } = useFormValidation(
    {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      paymentMethod: 'cod',
    },
    validationRules
  );

  // Update form with session data when available
  useEffect(() => {
    if (session?.user) {
      setValues({
        firstName: session.user.name?.split(' ')[0] || '',
        lastName: session.user.name?.split(' ')[1] || '',
        email: session.user.email || '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        paymentMethod: 'cod',
      });
    }
  }, [session, setValues]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) return;

    setIsSubmitting(true);
    setGeneralError('');

    try {
      const subtotal = totalPrice;
      const shipping = subtotal >= 100 ? 0 : 10;
      const tax = subtotal * 0.1;
      const total = subtotal + shipping + tax;

      const orderData = {
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        items: cart,
        subtotal,
        shipping,
        tax,
        total,
        paymentMethod: formData.paymentMethod,
      };

      // Save for admin dashboard (localStorage backup)
      const localOrderData = {
        id: Date.now(),
        ...orderData,
        date: new Date().toISOString(),
      };
      const existingOrders = JSON.parse(
        localStorage.getItem('orders') || '[]'
      );
      existingOrders.push(localOrderData);
      localStorage.setItem('orders', JSON.stringify(existingOrders));

      // Create order via API
      const response = await createOrder(orderData, session?.accessToken);

      // Clear cart only after successful order creation
      clearCart();
      
      showNotification('success', 'Order placed successfully!');
      
      // Redirect to confirmation page
      router.push(`/orders/${response.data.id}/confirmation`);
    } catch (error) {
      console.error('Order creation failed:', error);
      const errorMsg = error.message || ERROR_MESSAGES.ORDER_CREATE_FAILED;
      setGeneralError(errorMsg);
      showNotification('error', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    // Show loading state while redirecting
    return (
      <div>
        <Header />
        <main className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-600">Redirecting to sign in...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Checkout Form */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Shipping Information</h2>
          
          {generalError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm sm:text-base">
              {generalError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormInput
                label="First Name"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.firstName}
                touched={touched.firstName}
                placeholder="John"
                required
                disabled={isSubmitting}
              />

              <FormInput
                label="Last Name"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.lastName}
                touched={touched.lastName}
                placeholder="Doe"
                required
                disabled={isSubmitting}
              />
            </div>

            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              touched={touched.email}
              placeholder="john.doe@example.com"
              required
              disabled={isSubmitting}
            />

            <FormInput
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phone}
              touched={touched.phone}
              placeholder="+1 (555) 123-4567"
              disabled={isSubmitting}
            />

            <FormInput
              label="Address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.address}
              touched={touched.address}
              placeholder="123 Main Street, Apt 4B"
              required
              disabled={isSubmitting}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormInput
                label="City"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.city}
                touched={touched.city}
                placeholder="New York"
                required
                disabled={isSubmitting}
              />

              <FormInput
                label="Postal Code"
                name="postalCode"
                type="text"
                value={formData.postalCode}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.postalCode}
                touched={touched.postalCode}
                placeholder="10001"
                required
                disabled={isSubmitting}
              />
            </div>

            <FormInput
              label="Country"
              name="country"
              type="text"
              value={formData.country}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.country}
              touched={touched.country}
              placeholder="United States"
              required
              disabled={isSubmitting}
            />

            <div className="mb-3 sm:mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base min-h-[44px]"
                disabled={isSubmitting}
              >
                <option value="cod">Cash on Delivery</option>
                <option value="card">Credit/Debit Card</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white px-6 py-3 rounded font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px] touch-manipulation"
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <OrderSummary />
      </main>
      <Footer />
    </>
  );
}