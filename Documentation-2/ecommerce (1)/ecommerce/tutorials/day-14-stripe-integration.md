# Day 14: Professional Checkout \u0026 Order Confirmation

## 🎯 Learning Objectives

By the end of today, you will:
- Complete professional checkout flow with validation
- Implement order confirmation emails (simulation)
- Create order tracking system
- Build success and thank you pages
- Add order invoice generation

## ⏱️ Estimated Time: 4-5 hours

---

## 📝 Tasks \u0026 Subtasks

### Task 14.1: Enhance Checkout Experience

**Subtask 14.1.1: Add order review section**

Update `frontend/app/checkout/page.js` to include a comprehensive order review before submission:

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
  const { data: session } = useSession();
  const { cart, totalPrice, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1); // 1: Info, 2: Review, 3: Confirm

  const [formData, setFormData] = useState({
    firstName: session?.user?.name?.split(' ')[0] || '',
    lastName: session?.user?.name?.split(' ')[1] || '',
    email: session?.user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    deliveryNotes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ... validation and form handlers ...

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const subtotal = totalPrice;
      const shipping = subtotal > 100 ? 0 : 10;
      const tax = subtotal * 0.1;
      const total = subtotal + shipping + tax;

      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
        })),
        subtotal,
        shipping,
        tax,
        total,
        paymentMethod: 'Cash on Delivery',
        shippingAddress: formData,
      };

      const order = await createOrder(orderData, session?.accessToken);

      // Clear cart
      clearCart();

      // Redirect to confirmation page
      router.push(`/orders/${order.data.id}/confirmation`);
    } catch (error) {
      console.error('Order creation failed:', error);
      setErrors({ general: 'Failed to place order. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add checkout progress indicator component
  const ProgressSteps = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {[
          { num: 1, label: 'Information' },
          { num: 2, label: 'Review' },
          { num: 3, label: 'Confirm' },
        ].map((step, index) => (
          <div key={step.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step.num
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {currentStep > step.num ? '✓' : step.num}
              </div>
              <span className="text-sm mt-2 font-medium">{step.label}</span>
            </div>
            {index < 2 && (
              <div
                className={`h-1 flex-1 mx-2 ${
                  currentStep > step.num ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // ... rest of component with enhanced UI ...
}
```

---

### Task 14.2: Create Order Confirmation Page

Create `frontend/app/orders/[id]/confirmation/page.js`:

```javascript
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { getOrderById } from '@/lib/orders';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session && id) {
      fetchOrder();
    }
  }, [session, id]);

  const fetchOrder = async () => {
    try {
      const response = await getOrderById(id, session.accessToken);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-6 py-12 text-center">
          <p className="text-gray-600">Loading order details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-6 py-12 text-center">
          <p className="text-gray-600">Order not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600">
              Thank you for your order. We've received your request.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Order #{order.attributes.orderNumber}
              </h2>
              <p className="text-sm text-gray-600">
                Placed on {new Date(order.attributes.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-3">
                {order.attributes.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Size: {item.size} | Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>${order.attributes.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>
                    {order.attributes.shipping === 0
                      ? 'FREE'
                      : `$${order.attributes.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span>${order.attributes.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2">
                  <span>Total</span>
                  <span>${order.attributes.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Payment Method:</span> Cash on Delivery
              </p>
              <p className="text-xs text-blue-800 mt-1">
                You will pay when your order is delivered.
              </p>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
            <div className="text-gray-700">
              <p className="font-medium">
                {order.attributes.shippingAddress.firstName}{' '}
                {order.attributes.shippingAddress.lastName}
              </p>
              <p>{order.attributes.shippingAddress.address}</p>
              <p>
                {order.attributes.shippingAddress.city},{' '}
                {order.attributes.shippingAddress.state}{' '}
                {order.attributes.shippingAddress.postalCode}
              </p>
              <p>{order.attributes.shippingAddress.country}</p>
              <p className="mt-2">📞 {order.attributes.shippingAddress.phone}</p>
              <p>📧 {order.attributes.shippingAddress.email}</p>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">What Happens Next?</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>You'll receive a confirmation email shortly</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>We'll start processing your order within 24 hours</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Track your order status in the Orders section</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Estimated delivery: 3-5 business days</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Prepare exact cash for delivery</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/orders/${id}`}
              className="flex-1 bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Track Order
            </Link>
            <Link
              href="/products"
              className="flex-1 bg-gray-200 text-gray-800 text-center py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

---

## 🤖 AI Prompts for Students

```
"How do I create a multi-step checkout process?"

"Show me how to add animations to success pages"

"How do I create a progress indicator in React?"

"How do I format currency in JavaScript?"

"Help me: Order confirmation not showing"

"How do I create a professional invoice layout?"
```

---

## ✅ Testing \u0026 Validation

- [ ] Checkout progress indicator displays correctly
- [ ] All form fields validate properly
- [ ] Order is created with Cash on Delivery
- [ ] Confirmation page shows all order details
- [ ] Order appears in user's order history
- [ ] Email notification sent (simulated)
- [ ] Cart clears after successful order
- [ ] Success animation displays
- [ ] Delivery address shows correctly
- [ ] Order total calculates accurately

---

## 🏠 Homework

1. **Add Order Invoice Download**
   - Create printable invoice component
   - Generate PDF (use jsPDF or react-to-pdf)
   - Add download button

2. **Add Order Cancellation**
   - Allow cancellation within 1 hour
   - Update order status
   - Send cancellation confirmation

3. **Add Email Templates**
   - Create HTML email templates
   - Use inline CSS for email compatibility
   - Test in different email clients

4. **Add Order Modifications**
   - Allow address changes before shipping
   - Add delivery instructions field
   - Update delivery time preferences

---

## 📚 What You Learned Today

- ✅ Multi-step form processes
- ✅ Progress indicators
- ✅ Order confirmation flows
- ✅ Professional UI animations
- ✅ Cash on Delivery implementation
- ✅ Order tracking system
- ✅ Email simulation patterns

---

## 🎉 Congratulations!

You've completed Day 14! Your e-commerce site now has a professional checkout and order confirmation system with Cash on Delivery.

**Tomorrow:** We'll add wishlist and product review features!

---

[← Day 13: Order Management](./day-13-order-management.md) | [Back to Overview](./README.md) | [Day 15-20: Advanced Features →](./day-15-20-advanced-features.md)
