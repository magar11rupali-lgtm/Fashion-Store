'use client';

import { useState } from 'react';
import { useWishlist } from '../context/WishlistContext';

export default function WishlistButton({ product, className = '' }) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [notification, setNotification] = useState(null);
  
  // Ensure we have a valid product ID
  const productId = product?.id || product?.attributes?.id;
  const inWishlist = isInWishlist(productId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productId) {
      console.error('Product ID is missing:', product);
      showNotification('Failed to update wishlist', true);
      return;
    }

    try {
      if (inWishlist) {
        console.log('WishlistButton: Removing product', productId);
        await removeFromWishlist(productId);
        // Note: notification is now shown by WishlistContext
      } else {
        await addToWishlist(product);
        // Note: notification is shown by WishlistContext
      }
    } catch (error) {
      console.error('Wishlist operation failed:', error);
      showNotification('Failed to update wishlist', true);
    }
  };

  const showNotification = (message, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`relative transition-all hover:scale-110 flex items-center justify-center ${className}`}
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {inWishlist ? (
          <svg
            className="w-5 h-5 text-red-500"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        )}
      </button>

      {notification && (
        <div
          className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all ${
            notification.isError
              ? 'bg-red-500 text-white'
              : 'bg-green-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}
    </>
  );
}
