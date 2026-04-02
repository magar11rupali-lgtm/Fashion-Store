'use client';

import { useCart } from '../context/CartContext';
import WishlistButton from './WishlistButton';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  
  // Handle both direct properties and nested attributes structure
  const name = product.name || product.attributes?.name || '';
  const description = product.description || product.attributes?.description;
  const price = product.price ?? product.attributes?.price ?? 0;
  const category = product.category || product.attributes?.category;
  const image = product.image || product.attributes?.image;
  const inStock = product.inStock ?? product.attributes?.inStock ?? true;
  const inventory = product.inventory ?? product.attributes?.inventory ?? 100;

  // ✅ Strapi image safe handling
  const imageUrl = (() => {
    // Handle nested attributes structure
    const imgData = image?.data?.attributes?.url || image?.[0]?.url;
    
    if (imgData) {
      return imgData.startsWith('http') ? imgData : `http://localhost:1337${imgData}`;
    }
    
    return '/placeholder.jpg';
  })();

  // Determine availability status
  const getAvailabilityStatus = () => {
    if (!inStock || inventory === 0) {
      return { label: 'Out of Stock', color: 'bg-red-500', show: true };
    } else if (inventory <= 10) {
      return { label: 'Low Stock', color: 'bg-yellow-500', show: false }; // Don't show Low Stock
    } else {
      return { label: 'In Stock', color: 'bg-green-500', show: false }; // Don't show In Stock
    }
  };

  const availabilityStatus = getAvailabilityStatus();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      
      {/* IMAGE SECTION */}
      <div className="relative h-64 bg-gray-200">
        {/* ✅ Use normal img (works 100%) */}
        <img
          src={imageUrl}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Wishlist Button - Top Left */}
        <div className="absolute top-2 left-2 z-10">
          <WishlistButton product={product} className="bg-white rounded-full p-2 shadow-md hover:shadow-lg" />
        </div>

        {/* Availability Badge - Only show Out of Stock */}
        {availabilityStatus.show && (
          <div className={`absolute top-2 right-2 ${availabilityStatus.color} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
            {availabilityStatus.label}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-6">
        <div className="mb-2">
          <span className="text-xs font-semibold text-blue-600 uppercase">
            {category?.data?.attributes?.name}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {name}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {description?.[0]?.children?.[0]?.text || ''}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            ${Number(price).toFixed(2)}
          </span>

          <button
            onClick={() => addToCart(product)}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              inStock && inventory > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!inStock || inventory === 0}
          >
            {inStock && inventory > 0 ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
 );
}