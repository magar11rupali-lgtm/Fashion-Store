'use client';

import { useState, useEffect } from 'react';
import { getAllProducts } from '../../lib/api';

import Image from 'next/image';

export default function ProductsTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      const data = await getAllProducts();
      setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // const filteredProducts = products.filter(product =>
  //   product.attributes.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const filteredProducts = products.filter((product) =>
  product?.attributes?.name
    ?.toLowerCase()
    .includes(searchTerm.toLowerCase())
);

  if (loading) {
    return <div className="text-center py-12">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Products ({products.length})
        </h2>
        <a
          href="http://localhost:1337/admin/content-manager/collectionType/api::product.product/create"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          + Add Product
        </a>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
        />
        <span className="absolute left-4 top-3.5 text-xl">🔍</span>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Image</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const { name, category, price, image, inStock } = product.attributes;
                const imageUrl = image?.data?.attributes?.url
                  ? `http://localhost:1337${image.data.attributes.url}`
                  : '/placeholder.jpg';

                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="relative w-16 h-16 bg-gray-100 rounded">
                        <Image
                          src={imageUrl}
                          alt={name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{name}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                        {category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">${price.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      {inStock ? (
                        <span className="text-green-600 font-semibold">In Stock</span>
                      ) : (
                        <span className="text-red-600 font-semibold">Out of Stock</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <a
                          href={`/products/${product.id}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </a>
                        <a
                          href={`http://localhost:1337/admin/content-manager/collectionType/api::product.product/${product.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800"
                        >
                          Edit
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          No products found
        </p>
      )}
    </div>
  );
}