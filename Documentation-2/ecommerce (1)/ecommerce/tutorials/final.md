# Complete E-Commerce Platform - Final Implementation Guide

## 📋 Table of Contents

1. [Critical Bug Fixes](#critical-bug-fixes)
2. [Backend Order Processing](#backend-order-processing)
3. [User Authentication Issues](#user-authentication-issues)
4. [Complete Implementation Checklist](#complete-implementation-checklist)
5. [Testing Guide](#testing-guide)
6. [Production Deployment](#production-deployment)
7. [Common Issues & Solutions](#common-issues--solutions)

---

## 🚨 Critical Bug Fixes

### Issue 1: Order Not Getting Placed in Backend

**Problem:** Orders are simulated in frontend but not saved to Strapi backend.

**Root Causes:**
1. Missing Strapi Order collection type
2. Missing authentication token in API calls
3. Incorrect order data structure
4. Missing API permissions

**Complete Solution:**

#### Step 1: Create Order Collection Type in Strapi

1. Open Strapi Admin: `http://localhost:1337/admin`
2. Go to **Content-Type Builder**
3. Click **Create new collection type**
4. Name: `order`

Add these fields:

| Field Name | Type | Required | Unique | Additional Settings |
|------------|------|----------|--------|-------------------|
| orderNumber | Text | ✓ | ✓ | - |
| user | Relation | ✓ | - | Many-to-one with User |
| items | JSON | ✓ | - | - |
| subtotal | Decimal | ✓ | - | Default: 0 |
| shipping | Decimal | ✓ | - | Default: 0 |
| tax | Decimal | ✓ | - | Default: 0 |
| total | Decimal | ✓ | - | Default: 0 |
| status | Enumeration | ✓ | - | Values: pending, processing, shipped, delivered, cancelled |
| paymentMethod | Text | ✓ | - | - |
| shippingAddress | JSON | ✓ | - | - |
| trackingNumber | Text | - | - | - |
| notes | Rich Text | - | - | - |

4. Click **Save** and **Restart** Strapi

#### Step 2: Set API Permissions

1. Go to **Settings → Roles → Authenticated**
2. Under **Order** permissions, enable:
   - `find` (view own orders)
   - `findOne` (view order details)
   - `create` (create new orders)
3. Click **Save**

#### Step 3: Create Order Service Library

Create `frontend/lib/orders.js`:

```javascript
/**
 * Order Service - Handles all order-related API calls
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api';

/**
 * Generate unique order number
 */
function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Create a new order in Strapi
 * @param {Object} orderData - Order information
 * @param {string} userToken - JWT authentication token
 * @returns {Promise<Object>} Created order
 */
export async function createOrder(orderData, userToken) {
  if (!userToken) {
    throw new Error('Authentication required to create order');
  }

  const orderNumber = generateOrderNumber();
  
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        data: {
          orderNumber,
          ...orderData,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Order creation failed:', errorData);
      throw new Error(errorData.error?.message || 'Failed to create order');
    }

    const result = await response.json();
    console.log('Order created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Get all orders for the authenticated user
 * @param {string} userToken - JWT authentication token
 * @returns {Promise<Array>} User's orders
 */
export async function getUserOrders(userToken) {
  if (!userToken) {
    throw new Error('Authentication required to fetch orders');
  }

  try {
    const response = await fetch(
      `${API_URL}/orders?populate=*&sort=createdAt:desc`,
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

/**
 * Get a specific order by ID
 * @param {string} orderId - Order ID
 * @param {string} userToken - JWT authentication token
 * @returns {Promise<Object>} Order details
 */
export async function getOrderById(orderId, userToken) {
  if (!userToken) {
    throw new Error('Authentication required to fetch order');
  }

  try {
    const response = await fetch(
      `${API_URL}/orders/${orderId}?populate=*`,
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

/**
 * Update order status (admin only)
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @param {string} userToken - JWT authentication token
 * @returns {Promise<Object>} Updated order
 */
export async function updateOrderStatus(orderId, status, userToken) {
  if (!userToken) {
    throw new Error('Authentication required to update order');
  }

  try {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        data: { status },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update order status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}
```

#### Step 4: Update Checkout Page to Save Orders

Update `frontend/app/checkout/page.js`:

```javascript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/orders';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrderSummary from '@/components/OrderSummary';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cart, totalPrice, clearCart } = useCart();

  const [formData, setFormData] = useState({
    firstName: session?.user?.name?.split(' ')[0] || '',
    lastName: session?.user?.name?.split(' ')[1] || '',
    email: session?.user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    paymentMethod: 'cod',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  if (status === 'loading') {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-6 py-12 text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto text-center bg-white p-8 rounded-lg border">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Sign In Required
            </h1>
            <p className="text-gray-600 mb-6">
              Please sign in to continue with checkout and track your orders.
            </p>
            <a
              href="/auth/signin"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Redirect if cart is empty
  if (cart.length === 0) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-8">
            Add some products to your cart before checking out.
          </p>
          <a
            href="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Continue Shopping
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate order totals
      const subtotal = totalPrice;
      const shipping = subtotal > 100 ? 0 : 10;
      const tax = subtotal * 0.1;
      const total = subtotal + shipping + tax;

      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          size: item.size,
          image: item.image,
        })),
        subtotal: Number(subtotal.toFixed(2)),
        shipping: Number(shipping.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(total.toFixed(2)),
        paymentMethod: formData.paymentMethod,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
      };

      console.log('Creating order with data:', orderData);

      // Create order in backend
      const order = await createOrder(orderData, session?.accessToken);

      console.log('Order created successfully:', order);

      // Clear cart
      clearCart();

      // Redirect to order confirmation page
      router.push(`/orders/${order.data.id}/confirmation`);
    } catch (error) {
      console.error('Order creation failed:', error);
      setErrors({ 
        general: error.message || 'Failed to place order. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Header />
      <main className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Checkout</h1>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white p-6 rounded-lg border">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.firstName
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.lastName
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.email
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="1234567890"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.phone
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white p-6 rounded-lg border">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="123 Main Street"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.address
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.city
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.postalCode
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      />
                      {errors.postalCode && (
                        <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.country
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      />
                      {errors.country && (
                        <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-lg border">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">Cash on Delivery</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">Credit/Debit Card</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-lg text-lg font-semibold transition-colors ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

---

### Issue 2: Price Total and Size Not Being Saved

**Problem:** Order items missing size information and price calculations incorrect.

**Solution:**

Update `frontend/components/OrderSummary.jsx` to ensure correct calculations:

```javascript
'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';

export default function OrderSummary() {
  const { cart, totalPrice } = useCart();

  // Calculate totals
  const subtotal = Number(totalPrice.toFixed(2));
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = Number((subtotal * 0.1).toFixed(2));
  const total = Number((subtotal + shipping + tax).toFixed(2));

  return (
    <div className="bg-white p-6 rounded-lg border sticky top-24">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Order Summary
      </h2>

      {/* Cart Items */}
      <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
        {cart.map((item) => (
          <div key={`${item.id}-${item.size}`} className="flex gap-3">
            <div className="relative w-16 h-16 bg-gray-100 rounded flex-shrink-0">
              {item.image && (
                <Image
                  src={`http://localhost:1337${item.image}`}
                  alt={item.name}
                  fill
                  className="object-cover rounded"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm truncate">
                {item.name}
              </h3>
              <p className="text-xs text-gray-500">
                Size: {item.size} | Qty: {item.quantity}
              </p>
              <p className="text-sm font-semibold text-gray-900">
                ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2 border-t pt-4">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Tax (10%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Free Shipping Notice */}
      {shipping > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          Add ${(100 - subtotal).toFixed(2)} more for free shipping!
        </div>
      )}
    </div>
  );
}
```

---

### Issue 3: User Signup and Login Not Working

**Problem:** NextAuth.js configuration issues and Strapi authentication not properly connected.

**Complete Solution:**

#### Step 1: Install Required Dependencies

```bash
cd frontend
npm install next-auth@latest bcryptjs
```

#### Step 2: Configure Strapi for Authentication

1. Open Strapi Admin: `http://localhost:1337/admin`
2. Go to **Settings → Users & Permissions plugin → Providers**
3. Enable **Email** provider
4. Go to **Settings → Roles → Public**
5. Enable these permissions:
   - `auth/local` (login)
   - `auth/local/register` (signup)
6. Click **Save**

#### Step 3: Create NextAuth Configuration

Create `frontend/app/api/auth/[...nextauth]/route.js`:

```javascript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Call Strapi authentication endpoint
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identifier: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (res.ok && data.user) {
            return {
              id: data.user.id.toString(),
              name: data.user.username,
              email: data.user.email,
              token: data.jwt,
            };
          }

          // Return null if authentication failed
          console.error('Authentication failed:', data);
          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
```

#### Step 4: Update Environment Variables

Create/update `frontend/.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:1337/api

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32

# To generate a secret, run: openssl rand -base64 32
```

#### Step 5: Create Sign Up Page

Create `frontend/app/auth/signup/page.js`:

```javascript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

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
        // Registration successful
        console.log('Registration successful:', data);
        router.push('/auth/signin?registered=true');
      } else {
        // Handle errors
        console.error('Registration failed:', data);
        
        if (data.error?.message) {
          setErrors({ general: data.error.message });
        } else if (data.error?.details?.errors) {
          // Handle validation errors from Strapi
          const strapiErrors = {};
          data.error.details.errors.forEach(err => {
            strapiErrors[err.path[0]] = err.message;
          });
          setErrors(strapiErrors);
        } else {
          setErrors({ general: 'Registration failed. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'An error occurred. Please try again.' });
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

          {errors.general && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.username ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

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
```

#### Step 6: Create Sign In Page

Create `frontend/app/auth/signin/page.js`:

```javascript
'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Show success message if user just registered
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Account created successfully! Please sign in.');
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result.error) {
        setError('Invalid email or password');
      } else {
        // Redirect to home page or previous page
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An error occurred. Please try again.');
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
            Sign In
          </h1>

          {successMessage && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

#### Step 7: Create Session Provider

Create `frontend/components/SessionProvider.jsx`:

```javascript
'use client';

import { SessionProvider as NextAuthProvider } from 'next-auth/react';

export default function SessionProvider({ children }) {
  return <NextAuthProvider>{children}</NextAuthProvider>;
}
```

#### Step 8: Update Root Layout

Update `frontend/app/layout.js`:

```javascript
import { CartProvider } from '@/context/CartContext';
import SessionProvider from '@/components/SessionProvider';
import './globals.css';

export const metadata = {
  title: 'Fashion Store',
  description: 'Your one-stop shop for fashion',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

---

## ✅ Complete Implementation Checklist

### Backend (Strapi) Setup

- [ ] Strapi is running on `http://localhost:1337`
- [ ] Product collection type created with all fields
- [ ] Order collection type created with all fields
- [ ] User collection extended with address fields
- [ ] API permissions set for Public role (products)
- [ ] API permissions set for Authenticated role (orders, user data)
- [ ] Sample products added and published
- [ ] Email provider enabled for authentication

### Frontend (Next.js) Setup

- [ ] Next.js app created and running on `http://localhost:3000`
- [ ] NextAuth.js installed and configured
- [ ] Environment variables set in `.env.local`
- [ ] SessionProvider added to root layout
- [ ] CartProvider added to root layout

### Authentication

- [ ] Sign up page created and working
- [ ] Sign in page created and working
- [ ] Session persists across page refreshes
- [ ] Protected routes redirect to sign in
- [ ] User dropdown shows in header when logged in
- [ ] Sign out functionality works

### Shopping Cart

- [ ] Add to cart functionality works
- [ ] Cart count updates in header
- [ ] Cart sidebar opens and closes
- [ ] Remove from cart works
- [ ] Update quantity works
- [ ] Cart persists in localStorage
- [ ] Different sizes create separate cart items

### Checkout & Orders

- [ ] Checkout page requires authentication
- [ ] Form validation works correctly
- [ ] Order is created in Strapi backend
- [ ] Order includes all items with size and quantity
- [ ] Price calculations are correct (subtotal, shipping, tax, total)
- [ ] Cart clears after successful order
- [ ] Redirect to order confirmation page

### Order Management

- [ ] Order history page shows user's orders
- [ ] Order detail page shows full order information
- [ ] Order status timeline displays correctly
- [ ] Orders are sorted by date (newest first)
- [ ] Users can only see their own orders

---

## 🧪 Testing Guide

### Test 1: User Registration

1. Go to `/auth/signup`
2. Fill in all fields with valid data
3. Click "Sign Up"
4. Verify redirect to sign in page with success message
5. Check Strapi admin → Users to confirm user was created

**Expected Result:** User created successfully, can sign in

### Test 2: User Login

1. Go to `/auth/signin`
2. Enter valid credentials
3. Click "Sign In"
4. Verify redirect to home page
5. Check header shows user name and dropdown

**Expected Result:** User logged in, session persists

### Test 3: Add to Cart

1. Browse products
2. Click on a product
3. Select size
4. Select quantity
5. Click "Add to Cart"
6. Verify cart count updates in header

**Expected Result:** Item added to cart with correct size and quantity

### Test 4: Complete Checkout

1. Add items to cart
2. Sign in (if not already)
3. Go to cart and click "Checkout"
4. Fill in all shipping information
5. Select payment method
6. Click "Place Order"
7. Verify order created in Strapi
8. Verify redirect to confirmation page
9. Verify cart is cleared

**Expected Result:** Order created successfully in backend

### Test 5: View Order History

1. Sign in
2. Go to `/orders`
3. Verify your orders are listed
4. Click "View Details" on an order
5. Verify all order information is correct

**Expected Result:** All orders displayed with correct information

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] All features tested and working
- [ ] No console errors
- [ ] Environment variables configured for production
- [ ] Images optimized
- [ ] API URLs updated for production
- [ ] CORS configured correctly
- [ ] SSL certificates configured
- [ ] Database backed up

### Environment Variables for Production

```env
# Frontend (.env.production)
NEXT_PUBLIC_API_URL=https://your-strapi-domain.com/api
NEXTAUTH_URL=https://your-frontend-domain.com
NEXTAUTH_SECRET=your-production-secret-key

# Backend (Strapi)
DATABASE_URL=your-production-database-url
JWT_SECRET=your-jwt-secret
ADMIN_JWT_SECRET=your-admin-jwt-secret
APP_KEYS=your-app-keys
```

---

## 🔧 Common Issues & Solutions

### Issue: "Failed to fetch products"

**Solution:**
1. Check Strapi is running
2. Verify API permissions are set
3. Check products are published
4. Verify API URL in environment variables

### Issue: "Authentication required"

**Solution:**
1. Check user is signed in
2. Verify session token is being sent
3. Check API permissions for authenticated users
4. Clear browser cache and cookies

### Issue: "Order not created"

**Solution:**
1. Check browser console for errors
2. Verify order collection type exists in Strapi
3. Check API permissions for order creation
4. Verify all required fields are being sent

### Issue: "Cart items disappear on refresh"

**Solution:**
1. Check localStorage is enabled in browser
2. Verify CartContext saves to localStorage
3. Check for console errors
4. Clear localStorage and try again

---

## 📊 Database Schema Reference

### Product Collection

```javascript
{
  name: String (required),
  description: Text (required),
  price: Decimal (required),
  category: String,
  sizes: JSON,
  colors: JSON,
  inStock: Boolean,
  featured: Boolean,
  image: Media (single),
  images: Media (multiple)
}
```

### Order Collection

```javascript
{
  orderNumber: String (required, unique),
  user: Relation (many-to-one with User),
  items: JSON (required),
  subtotal: Decimal (required),
  shipping: Decimal (required),
  tax: Decimal (required),
  total: Decimal (required),
  status: Enum (pending, processing, shipped, delivered, cancelled),
  paymentMethod: String (required),
  shippingAddress: JSON (required),
  trackingNumber: String,
  notes: RichText
}
```

### User Collection (Extended)

```javascript
{
  // Default Strapi fields
  username: String (required, unique),
  email: String (required, unique),
  password: String (required),
  
  // Custom fields
  phone: String,
  address: String,
  city: String,
  postalCode: String,
  country: String
}
```

---

## 🎯 Next Steps

After completing all bug fixes:

1. **Test thoroughly** - Go through all features
2. **Add error handling** - Improve user experience
3. **Optimize performance** - Lazy loading, code splitting
4. **Add analytics** - Track user behavior
5. **Deploy to production** - Make it live!

---

## 📞 Support Resources

- **Strapi Documentation:** https://docs.strapi.io
- **Next.js Documentation:** https://nextjs.org/docs
- **NextAuth.js Documentation:** https://next-auth.js.org
- **Troubleshooting Guide:** `./resources/troubleshooting.md`

---

## ✨ Success Criteria

Your e-commerce platform is complete when:

✅ Users can sign up and sign in
✅ Users can browse products
✅ Users can add items to cart with size selection
✅ Cart persists across sessions
✅ Users can complete checkout
✅ Orders are saved to backend
✅ Users can view order history
✅ All calculations are correct
✅ No critical bugs or errors

---

**Congratulations!** You've built a complete, production-ready e-commerce platform! 🎉

This documentation covers all critical issues and provides complete solutions. Keep this as your reference guide for troubleshooting and implementation.
