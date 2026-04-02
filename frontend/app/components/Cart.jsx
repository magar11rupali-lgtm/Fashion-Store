import { useCart } from '../context/CartContext';
import Link from 'next/link';

export default function Cart() {
  const { cart, addToCart, removeFromCart, updateQuantity, totalPrice, isOpen, setIsOpen } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 md:w-[28rem] bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Shopping Cart</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-base sm:text-lg mb-4">Your cart is empty</p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-blue-600 hover:underline min-h-[44px] px-4 touch-manipulation"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
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
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{item.name}</h3>
                    
                    {/* Size Selector */}
                    <div className="flex items-center gap-2 mt-1">
                      <label className="text-xs sm:text-sm text-gray-700 font-medium">Size:</label>
                      <select
                        value={item.size || 'M'}
                        onChange={(e) => {
                          const newSize = e.target.value;
                          // Remove old item and add with new size
                          removeFromCart(item.id, item.size);
                          addToCart(
                            { id: item.id, name: item.name, price: item.price, image: item.image },
                            item.quantity,
                            newSize
                          );
                        }}
                        className="text-xs sm:text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                      </select>
                    </div>
                    
                    <p className="text-sm sm:text-base font-bold text-gray-900 mt-1">
                      ${item.price ? item.price.toFixed(2) : '0.00'}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.size, item.quantity - 1)
                        }
                        className="w-8 h-8 sm:w-9 sm:h-9 border rounded hover:bg-gray-100 flex items-center justify-center touch-manipulation"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm sm:text-base">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.size, item.quantity + 1)
                        }
                        className="w-8 h-8 sm:w-9 sm:h-9 border rounded hover:bg-gray-100 flex items-center justify-center touch-manipulation"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id, item.size)}
                    className="text-red-500 hover:text-red-700 text-xs sm:text-sm min-h-[44px] px-2 touch-manipulation"
                    aria-label="Remove item"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t p-4 sm:p-6 space-y-3 sm:space-y-4">
            {/* Subtotal */}
            <div className="flex justify-between text-base sm:text-lg font-semibold">
              <span>Subtotal:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="block w-full bg-blue-600 text-white text-center py-3 sm:py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
            >
              Proceed to Checkout
            </Link>

            {/* Continue Shopping */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-blue-600 hover:underline text-sm sm:text-base min-h-[44px] touch-manipulation"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}