'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrderById } from '../lib/orders';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
        <div className="container mx-auto px-6 py-12 text-center">
          <p className="text-gray-600">Loading order...</p>
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

  const statusSteps = getStatusSteps(order.attributes.status);

  return (
    <div>
      <Header />
      <main className="container mx-auto px-6 py-12">
        <div className="mb-6">
          <Link href="/orders" className="text-blue-600 hover:underline">
            ← Back to Orders
          </Link>
        </div>

        <div className="bg-white rounded-lg border p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order #{order.attributes.orderNumber}
            </h1>
            <p className="text-gray-600">
              Placed on {new Date(order.attributes.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Order Status Timeline */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Status</h2>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => (
                <div key={step.name} className="flex-1 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {step.completed ? '✓' : index + 1}
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-700 capitalize">
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
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Items</h2>
            <div className="space-y-4">
              {order.attributes.items.map((item, index) => (
                <div key={index} className="flex justify-between border-b pb-4">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Size: {item.size} | Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900">
                {order.attributes.shippingAddress.firstName}{' '}
                {order.attributes.shippingAddress.lastName}
              </p>
              <p className="text-gray-600">{order.attributes.shippingAddress.address}</p>
              <p className="text-gray-600">
                {order.attributes.shippingAddress.city}, {order.attributes.shippingAddress.postalCode}
              </p>
              <p className="text-gray-600">{order.attributes.shippingAddress.country}</p>
              <p className="text-gray-600 mt-2">
                Email: {order.attributes.shippingAddress.email}
              </p>
              <p className="text-gray-600">
                Phone: {order.attributes.shippingAddress.phone}
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
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
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              <span className="font-semibold">Payment Method:</span>{' '}
              {order.attributes.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card'}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}