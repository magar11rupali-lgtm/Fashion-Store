'use client';

import { useCart } from '../context/CartContext';
import Image from 'next/image';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:1337';
const PLACEHOLDER_IMAGE = '/placeholder.jpg';

export default function OrderSummary() {
  const { cart, totalPrice } = useCart();

  const subtotal = Number(totalPrice) || 0;
  const shipping = subtotal >= 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  // Construct image URL with proper error handling
  const getImageUrl = (imagePath) => {
    if (!imagePath) return PLACEHOLDER_IMAGE;
    
    // If imagePath already includes the full URL, return it
    if (imagePath.startsWith('http')) return imagePath;
    
    // Otherwise, construct the full URL
    return `${BACKEND_URL}${imagePath}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg border sticky top-24">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Order Summary
      </h2>

      {/* Cart Items */}
      <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
        {cart.map((item) => {
          const itemPrice = Number(item.price) || 0;
          const itemQuantity = Number(item.quantity) || 1;
          const lineTotal = itemPrice * itemQuantity;
          
          return (
            <div key={`${item.id}-${item.size}`} className="flex gap-3 pb-3 border-b last:border-b-0">
              <div className="relative w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                <Image
                  src={getImageUrl(item.image)}
                  alt={item.name || 'Product'}
                  fill
                  className="object-cover rounded"
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_IMAGE;
                  }}
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                  {item.name}
                </h3>
                <p className="text-xs text-gray-500 mb-1">
                  Size: {item.size}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    <span className="font-medium">${itemPrice.toFixed(2)}</span>
                    <span className="text-gray-400 mx-1">×</span>
                    <span>{itemQuantity}</span>
                  </div>
                  <div className="font-semibold text-gray-900">
                    ${lineTotal.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2 border-t pt-4">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Tax (10%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Free Shipping Notice */}
      {shipping > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          Add ${(100 - subtotal).toFixed(2)} more for free shipping!
        </div>
      )}
    </div>
  );
}
