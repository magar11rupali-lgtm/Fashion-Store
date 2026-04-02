'use client';

import { useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function WishlistDrawer() {
  const { wishlist, removeFromWishlist, moveToCart, isOpen, setIsOpen, isLoading } = useWishlist();
  const { addToCart } = useCart();
  const [selectedSizes, setSelectedSizes] = useState({});
  const [notification, setNotification] = useState(null);

  if (!isOpen) return null;

  const handleRemove = async (productId) => {
    console.log('WishlistDrawer: Removing product', productId);
    try {
      await removeFromWishlist(productId);
      // Note: notification is now shown by WishlistContext
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      showNotification('Failed to remove item', true);
    }
  };

  const handleAddToCart = async (item) => {
    const size = selectedSizes[item.productId] || item.availableSizes[0] || 'M';
    
    try {
      await moveToCart(item.productId, size, addToCart);
      showNotification('Moved to cart');
    } catch (error) {
      console.error('Failed to move to cart:', error);
      showNotification('Failed to add to cart', true);
    }
  };

  const handleSizeChange = (productId, size) => {
    setSelectedSizes(prev => ({
      ...prev,
      [productId]: size
    }));
  };

  const showNotification = (message, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Wishlist Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 md:w-[28rem] bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Wishlist</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
            aria-label="Close wishlist"
          >
            ✕
          </button>
        </div>

        {/* Wishlist Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-base sm:text-lg">Loading...</p>
            </div>
          ) : wishlist.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-base sm:text-lg mb-4">Your wishlist is empty</p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-blue-600 hover:underline min-h-[44px] px-4 touch-manipulation"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlist.map((item, index) => (
                <div
                  key={item.id || item.productId || `wishlist-item-${index}`}
                  className="flex gap-3 sm:gap-4 border-b pb-4"
                >
                  {/* Image */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded flex-shrink-0">
                    {item.image ? (
                      <img
                        src={
                          typeof item.image === 'string'
                            ? item.image.startsWith('http')
                              ? item.image
                              : `http://localhost:1337${item.image}`
                            : '/placeholder.jpg'
                        }
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{item.name}</h3>
                    <p className="text-sm sm:text-base font-bold text-gray-900 mt-1">
                      ${item.price ? item.price.toFixed(2) : '0.00'}
                    </p>

                    {/* Size Selector */}
                    <div className="mt-2">
                      <label className="text-xs text-gray-600 block mb-1">Size:</label>
                      <select
                        value={selectedSizes[item.productId] || item.availableSizes?.[0] || 'M'}
                        onChange={(e) => handleSizeChange(item.productId, e.target.value)}
                        className="text-xs sm:text-sm border rounded px-2 py-1.5 w-full min-h-[44px]"
                      >
                        {(item.availableSizes && item.availableSizes.length > 0 
                          ? item.availableSizes 
                          : ['XS', 'S', 'M', 'L', 'XL']
                        ).map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex-1 bg-blue-600 text-white text-xs sm:text-sm py-2 px-3 rounded hover:bg-blue-700 transition-colors min-h-[44px] touch-manipulation"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="text-red-500 hover:text-red-700 text-xs sm:text-sm px-2 min-h-[44px] touch-manipulation"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div className="border-t p-4 sm:p-6">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-blue-600 hover:underline text-sm sm:text-base min-h-[44px] touch-manipulation"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      {/* Notification */}
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
