'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getOrderById } from '../../../lib/orders';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Image from 'next/image';
import { ERROR_MESSAGES } from '../../../lib/errors';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const orderId = params.id;

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/orders');
    }
  }, [status, router]);

  // Fetch order details when authenticated
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await getOrderById(orderId, session.accessToken);
        setOrder(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        
        // Handle 404 specifically
        if (err.status === 404) {
          setError('Order not found. This order may not exist or you may not have permission to view it.');
        } else {
          setError(err.message || ERROR_MESSAGES.FETCH_FAILED);
        }
      } finally {
        setLoading(false);
      }
    };

    if (session?.accessToken && orderId) {
      fetchOrder();
    }
  }, [session, orderId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price) => {
    return `$${Number(price).toFixed(2)}`;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
  };

  if (status === 'loading' || !session) {
    return (
      <div>
        <Header />
        <main className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => router.push('/orders')}
            className="mb-6 text-gray-600 hover:text-black transition flex items-center gap-2"
          >
            <span>←</span> Back to Orders
          </button>

          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading order details...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <svg 
                  className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <div>
                  <h3 className="text-red-800 font-semibold mb-1">Unable to Load Order</h3>
                  <p className="text-red-700">{error}</p>
                  <button
                    onClick={() => router.push('/orders')}
                    className="mt-3 text-red-800 hover:text-red-900 font-medium underline"
                  >
                    View all orders
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && order && (
            <div>
              {/* Order Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                  Order #{order.attributes?.orderNumber || order.orderNumber}
                </h1>
                <p className="text-gray-600">
                  Placed on {formatDate(order.attributes?.createdAt || order.createdAt)}
                </p>
              </div>

              {/* Order Status */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Status</p>
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                        (order.attributes?.order_status || order.order_status) === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : (order.attributes?.order_status || order.order_status) === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : (order.attributes?.order_status || order.order_status) === 'processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : (order.attributes?.order_status || order.order_status) === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {(order.attributes?.order_status || order.order_status)
                        ? (order.attributes?.order_status || order.order_status).charAt(0).toUpperCase() +
                          (order.attributes?.order_status || order.order_status).slice(1)
                        : 'Pending'}
                    </span>
                  </div>

                  {(order.attributes?.trackingNumber || order.trackingNumber) && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                      <p className="font-mono font-semibold">
                        {order.attributes?.trackingNumber || order.trackingNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="border border-gray-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                <div className="space-y-4">
                  {(order.attributes?.items || order.items || []).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
                    >
                      {/* Product Image */}
                      <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded">
                        <Image
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                          onError={(e) => {
                            e.target.src = '/placeholder.png';
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-600">Size: {item.size}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(item.price)}</p>
                        <p className="text-sm text-gray-600">
                          Total: {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border border-gray-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                {(order.attributes?.customer || order.customer) && (
                  <div className="text-gray-700">
                    <p className="font-medium">
                      {(order.attributes?.customer || order.customer).firstName}{' '}
                      {(order.attributes?.customer || order.customer).lastName}
                    </p>
                    <p>{(order.attributes?.customer || order.customer).address}</p>
                    <p>
                      {(order.attributes?.customer || order.customer).city},{' '}
                      {(order.attributes?.customer || order.customer).postalCode}
                    </p>
                    <p>{(order.attributes?.customer || order.customer).country}</p>
                    {(order.attributes?.customer || order.customer).phone && (
                      <p className="mt-2">Phone: {(order.attributes?.customer || order.customer).phone}</p>
                    )}
                    {(order.attributes?.customer || order.customer).email && (
                      <p>Email: {(order.attributes?.customer || order.customer).email}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(order.attributes?.subtotal || order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>{formatPrice(order.attributes?.shipping || order.shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>{formatPrice(order.attributes?.tax || order.tax)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-semibold text-lg">
                      {formatPrice(order.attributes?.total || order.total)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Payment Method:{' '}
                    <span className="font-medium text-gray-900">
                      {(order.attributes?.paymentMethod || order.paymentMethod) === 'cod'
                        ? 'Cash on Delivery'
                        : (order.attributes?.paymentMethod || order.paymentMethod) === 'card'
                        ? 'Credit/Debit Card'
                        : (order.attributes?.paymentMethod || order.paymentMethod) === 'paypal'
                        ? 'PayPal'
                        : order.attributes?.paymentMethod || order.paymentMethod}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
