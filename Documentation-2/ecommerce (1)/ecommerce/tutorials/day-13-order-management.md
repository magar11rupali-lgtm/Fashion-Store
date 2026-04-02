# Day 13: Order Management \u0026 History

## 🎯 Learning Objectives

By the end of today, you will:
- Create order model in Strapi
- Implement order creation on checkout
- Build order history page
- Create order tracking with status updates
- Send order confirmation

## ⏱️ Estimated Time: 5-6 hours

---

## 📝 Tasks \u0026 Subtasks

### Task 13.1: Create Order Model in Strapi

**Subtask 13.1.1: Create Order collection type**

In Strapi Admin → Content-Type Builder:

1. Create new Collection Type: `Order`
2. Add fields:
   - `orderNumber` (Text, required, unique)
   - `user` (Relation: many-to-one with User)
   - `items` (JSON)
   - `subtotal` (Decimal)
   - `shipping` (Decimal)
   - `tax` (Decimal)
   - `total` (Decimal)
   - `status` (Enumeration: pending, processing, shipped, delivered, cancelled)
   - `paymentMethod` (Text)
   - `shippingAddress` (JSON)
   - `trackingNumber` (Text)
   - `notes` (Rich text)

3. Save and publish

**Subtask 13.1.2: Set permissions**

Settings → Roles → Authenticated:
- Enable `find`, `findOne`, `create` for Order
- Users should only see their own orders

---

### Task 13.2: Create Order Service

Create `frontend/lib/orders.js`:

```javascript
export async function createOrder(orderData, userToken) {
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
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
      },
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to create order');
  }

  return res.json();
}

export async function getUserOrders(userToken) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/orders?populate=*&sort=createdAt:desc`,
    {
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch orders');
  }

  return res.json();
}

export async function getOrderById(orderId, userToken) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}?populate=*`,
    {
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch order');
  }

  return res.json();
}
```

---

### Task 13.3: Update Checkout to Create Orders

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
  const { data: session } = useSession();
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

  // ... existing validation and form handlers ...

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

      const order = await createOrder(orderData, session?.accessToken);

      // Clear cart
      clearCart();

      // Redirect to thank you page with order number
      router.push(`/orders/${order.data.id}/confirmation`);
    } catch (error) {
      console.error('Order creation failed:', error);
      setErrors({ general: 'Failed to place order. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guest checkout warning
  if (!session) {
    return (
      <div>
        <Header />
        <main className=\"container mx-auto px-6 py-12\">
          <div className=\"max-w-2xl mx-auto text-center\">
            <h1 className=\"text-3xl font-bold mb-4\">Sign In Required</h1>
            <p className=\"text-gray-600 mb-6\">
              Please sign in to continue with checkout and track your orders.
            </p>
            <a
              href=\"/auth/signin\"
              className=\"bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700\"
            >
              Sign In
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ... rest of checkout form ...
}
```

---

### Task 13.4: Create Order History Page

Create `frontend/app/orders/page.js`:

```javascript
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserOrders } from '@/lib/orders';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session) {
      fetchOrders();
    }
  }, [session, status, router]);

  const fetchOrders = async () => {
    try {
      const response = await getUserOrders(session.accessToken);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className=\"container mx-auto px-6 py-12 text-center\">
          <p className=\"text-gray-600\">Loading orders...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className=\"container mx-auto px-6 py-12\">
        <h1 className=\"text-4xl font-bold text-gray-800 mb-8\">My Orders</h1>

        {orders.length === 0 ? (
          <div className=\"text-center py-12 bg-white rounded-lg border\">
            <p className=\"text-gray-600 mb-4\">You haven't placed any orders yet.</p>
            <Link
              href=\"/products\"
              className=\"text-blue-600 hover:underline\"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className=\"space-y-6\">
            {orders.map((order) => (
              <div
                key={order.id}
                className=\"bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow\"
              >
                <div className=\"flex justify-between items-start mb-4\">
                  <div>
                    <h2 className=\"text-xl font-semibold text-gray-900\">
                      Order #{order.attributes.orderNumber}
                    </h2>
                    <p className=\"text-gray-600 text-sm\">
                      {new Date(order.attributes.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      order.attributes.status
                    )}`}
                  >
                    {order.attributes.status.charAt(0).toUpperCase() + order.attributes.status.slice(1)}
                  </span>
                </div>

                <div className=\"border-t pt-4 mb-4\">
                  <p className=\"text-gray-700 mb-2\">
                    {order.attributes.items.length} item(s)
                  </p>
                  <div className=\"flex flex-wrap gap-2\">
                    {order.attributes.items.slice(0, 3).map((item, index) => (
                      <span key={index} className=\"text-sm text-gray-600\">
                        {item.name} (x{item.quantity})
                        {index < Math.min(order.attributes.items.length, 3) - 1 && ','}
                      </span>
                    ))}
                    {order.attributes.items.length > 3 && (
                      <span className=\"text-sm text-gray-600\">
                        +{order.attributes.items.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className=\"flex justify-between items-center border-t pt-4\">
                  <div>
                    <span className=\"text-gray-600\">Total: </span>
                    <span className=\"text-xl font-bold text-gray-900\">
                      ${order.attributes.total.toFixed(2)}
                    </span>
                  </div>
                  <Link
                    href={`/orders/${order.id}`}
                    className=\"bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors\"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
```

---

### Task 13.5: Create Order Detail Page

Create `frontend/app/orders/[id]/page.js`:

```javascript
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrderById } from '@/lib/orders';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session && id) {
      fetchOrder();
    }
  }, [session, status, id, router]);

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

  const getStatusSteps = (currentStatus) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = steps.indexOf(currentStatus);
    
    return steps.map((step, index) => ({
      name: step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className=\"container mx-auto px-6 py-12 text-center\">
          <p className=\"text-gray-600\">Loading order...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <Header />
        <div className=\"container mx-auto px-6 py-12 text-center\">
          <p className=\"text-gray-600\">Order not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const statusSteps = getStatusSteps(order.attributes.status);

  return (
    <div>
      <Header />
      <main className=\"container mx-auto px-6 py-12\">
        <div className=\"mb-6\">
          <Link href=\"/orders\" className=\"text-blue-600 hover:underline\">
            ← Back to Orders
          </Link>
        </div>

        <div className=\"bg-white rounded-lg border p-8\">
          <div className=\"mb-8\">
            <h1 className=\"text-3xl font-bold text-gray-900 mb-2\">
              Order #{order.attributes.orderNumber}
            </h1>
            <p className=\"text-gray-600\">
              Placed on {new Date(order.attributes.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Order Status Timeline */}
          <div className=\"mb-8\">
            <h2 className=\"text-xl font-semibold text-gray-900 mb-4\">Order Status</h2>
            <div className=\"flex items-center justify-between\">
              {statusSteps.map((step, index) => (
                <div key={step.name} className=\"flex-1 relative\">
                  <div className=\"flex flex-col items-center\">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {step.completed ? '✓' : index + 1}
                    </div>
                    <p className=\"mt-2 text-sm font-medium text-gray-700 capitalize\">
                      {step.name}
                    </p>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`absolute top-5 left-1/2 w-full h-0.5 ${
                        step.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      style={{ zIndex: -1 }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div className=\"mb-8\">
            <h2 className=\"text-xl font-semibold text-gray-900 mb-4\">Items</h2>
            <div className=\"space-y-4\">
              {order.attributes.items.map((item, index) => (
                <div key={index} className=\"flex justify-between border-b pb-4\">
                  <div>
                    <p className=\"font-medium text-gray-900\">{item.name}</p>
                    <p className=\"text-sm text-gray-600\">
                      Size: {item.size} | Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className=\"font-semibold text-gray-900\">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className=\"mb-8\">
            <h2 className=\"text-xl font-semibold text-gray-900 mb-4\">Shipping Address</h2>
            <div className=\"bg-gray-50 p-4 rounded-lg\">
              <p className=\"text-gray-900\">
                {order.attributes.shippingAddress.firstName}{' '}
                {order.attributes.shippingAddress.lastName}
              </p>
              <p className=\"text-gray-600\">{order.attributes.shippingAddress.address}</p>
              <p className=\"text-gray-600\">
                {order.attributes.shippingAddress.city}, {order.attributes.shippingAddress.postalCode}
              </p>
              <p className=\"text-gray-600\">{order.attributes.shippingAddress.country}</p>
              <p className=\"text-gray-600 mt-2\">
                Email: {order.attributes.shippingAddress.email}
              </p>
              <p className=\"text-gray-600\">
                Phone: {order.attributes.shippingAddress.phone}
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className=\"border-t pt-6\">
            <h2 className=\"text-xl font-semibold text-gray-900 mb-4\">Order Summary</h2>
            <div className=\"space-y-2\">
              <div className=\"flex justify-between text-gray-700\">
                <span>Subtotal</span>
                <span>${order.attributes.subtotal.toFixed(2)}</span>
              </div>
              <div className=\"flex justify-between text-gray-700\">
                <span>Shipping</span>
                <span>
                  {order.attributes.shipping === 0
                    ? 'FREE'
                    : `$${order.attributes.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className=\"flex justify-between text-gray-700\">
                <span>Tax</span>
                <span>${order.attributes.tax.toFixed(2)}</span>
              </div>
              <div className=\"flex justify-between text-xl font-bold text-gray-900 border-t pt-2\">
                <span>Total</span>
                <span>${order.attributes.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className=\"mt-6 bg-gray-50 p-4 rounded-lg\">
            <p className=\"text-gray-700\">
              <span className=\"font-semibold\">Payment Method:</span>{' '}
              {order.attributes.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card'}
            </p>
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
\"How do I create a collection type in Strapi?\"

\"Show me how to save order data to database\"

\"How do I create a timeline component in React?\"

\"How do I filter orders by user in Strapi?\"

\"Help me: Orders not showing for logged-in user\"

\"How do I format dates in JavaScript?\"

\"How do I create a status badge component?\"
```

---

## ✅ Testing \u0026 Validation

- [ ] Order is created on checkout
- [ ] Order number is generated uniquely
- [ ] Order appears in user's order history
- [ ] Order details page shows all information
- [ ] Status timeline displays correctly
- [ ] Orders are sorted by date (newest first)
- [ ] Guest users are redirected to login
- [ ] Users can only see their own orders
- [ ] Order totals calculate correctly
- [ ] Shipping address displays properly

---

## 🏠 Homework

1. **Add Order Cancellation**
   - Add cancel button for pending orders
   - Update order status to cancelled
   - Prevent cancelling shipped orders

2. **Add Order Search**
   - Search orders by order number
   - Filter by status
   - Date range filter

3. **Add Invoice Download**
   - Generate PDF invoice
   - Download/print functionality

---

## 📚 What You Learned Today

- ✅ Creating complex data models in Strapi
- ✅ User-specific data filtering
- ✅ Order management system
- ✅ Timeline/progress components
- ✅ Authenticated API calls
- ✅ Date formatting in JavaScript

---

## 🎉 Congratulations!

You've completed Day 13! Users can now track their order history and see detailed order information.

**Tomorrow:** We'll integrate Stripe for real payments!

---

[← Day 12: User Authentication](./day-12-user-authentication.md) | [Back to Overview](./README.md) | [Day 14: Stripe Integration →](./day-14-stripe-integration.md)
