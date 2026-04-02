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