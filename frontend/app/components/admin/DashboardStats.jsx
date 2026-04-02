'use client';

import { useState, useEffect } from 'react';
import { getAllProducts } from '../../lib/api';


export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    async function fetchStats() {
      const products = await getAllProducts();
      
      // Get orders from localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      
      // Calculate stats
       //const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order?.total || 0),0);

      //const lowStock = products.filter(p => !p.attributes.inStock).length;

      const lowStock = products.filter(
  (p) => p?.attributes?.inStock === false
).length;

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue: totalRevenue,
        lowStockProducts: lowStock,
      });

      // Get recent orders (last 5)
      setRecentOrders(orders.slice(-5).reverse());
    }

    fetchStats();
  }, []);

  return (
    
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">📦</div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Total Products</p>
              <p className="text-3xl font-bold">{stats.totalProducts}</p>
            </div>
          </div>
          <div className="text-blue-100 text-sm">
            {stats.lowStockProducts} out of stock
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">🛒</div>
            <div className="text-right">
              <p className="text-green-100 text-sm">Total Orders</p>
              <p className="text-3xl font-bold">{stats.totalOrders}</p>
            </div>
          </div>
          <div className="text-green-100 text-sm">
            All time orders
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">💰</div>
            <div className="text-right">
              <p className="text-purple-100 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-purple-100 text-sm">
            All time revenue
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">📈</div>
            <div className="text-right">
              <p className="text-orange-100 text-sm">Avg Order Value</p>
              <p className="text-3xl font-bold">
                ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
          <div className="text-orange-100 text-sm">
            Per order average
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Recent Orders
        </h2>
        
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No orders yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">#{order.id}</td>
                    <td className="py-3 px-4">₹{order.total}
                      {order?.customer?.firstName || "Unknown"} {order?.customer?.lastName || ""}
                    </td>
                    <td className="py-3 px-4">{order.items.length} items</td>
                    <td className="py-3 px-4 font-semibold">${Number(order?.total || 0).toFixed(2)}</td>

                    <td className="py-3 px-4 text-gray-600">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/admin?tab=products"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-4xl mb-3">➕</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Add New Product
          </h3>
          <p className="text-gray-600 text-sm">
            Add products to your store
          </p>
        </a>

        <a
          href="/admin?tab=orders"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            View All Orders
          </h3>
          <p className="text-gray-600 text-sm">
            Manage customer orders
          </p>
        </a>

        <a
          href="http://localhost:1337/admin"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-4xl mb-3">⚙️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Strapi Admin
          </h3>
          <p className="text-gray-600 text-sm">
            Access Strapi CMS
          </p>
        </a>
      </div>
    </div>
  );
}
