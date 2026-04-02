'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getUserOrders } from '../../lib/orders';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ERROR_MESSAGES } from '../../lib/errors';

export default function OrderHistoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/orders');
    }
  }, [status, router]);

  // Fetch orders when authenticated
  useEffect(() => {
    if (session?.accessToken) {
      fetchOrders();
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getUserOrders(session.accessToken);
      setOrders(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.message || ERROR_MESSAGES.FETCH_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price) => {
    return `$${Number(price).toFixed(2)}`;
  };

  const getItemCount = (items) => {
    if (!items) return 0;
    return items.reduce((total, item) => total + (item.quantity || 1), 0);
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
          <h1 className="text-3xl font-bold mb-8">Order History</h1>

          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading your orders...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
              <button
                onClick={() => router.push('/')}
                className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
              >
                Start Shopping
              </button>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => {
                const orderData = order.attributes || order;
                const itemCount = getItemCount(orderData.items);
                
                return (
                  <div
                    key={order.id}
                    onClick={() => router.push(`/orders/${order.id}`)}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold mb-2">
                          Order #{orderData.orderNumber}
                        </h2>
                        <p className="text-gray-600 text-sm">
                          Placed on {formatDate(orderData.createdAt || order.createdAt)}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Total</p>
                          <p className="text-xl font-bold">
                            {formatPrice(orderData.total)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Status</p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              orderData.order_status === 'delivered'
                                ? 'bg-green-100 text-green-800'
                                : orderData.order_status === 'shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : orderData.order_status === 'processing'
                                ? 'bg-yellow-100 text-yellow-800'
                                : orderData.order_status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {orderData.order_status
                              ? orderData.order_status.charAt(0).toUpperCase() +
                                orderData.order_status.slice(1)
                              : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
