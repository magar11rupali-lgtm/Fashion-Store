'use client';

import { useState } from 'react';
import { useCart } from './context/CartContext';

export default function ProductActions({ product, inStock }) {
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (inStock) {
      addToCart(product, quantity, selectedSize);
    }
  };

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <>
      {/* Size Selector */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Select Size
        </h3>
        <div className="flex space-x-3">
          {['S', 'M', 'L', 'XL'].map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`w-12 h-12 border-2 rounded-lg font-semibold transition-colors ${
                selectedSize === size
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-300 hover:border-blue-600 hover:text-blue-600'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Quantity
        </h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={decreaseQuantity}
            className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-semibold"
          >
            -
          </button>
          <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
          <button
            onClick={increaseQuantity}
            className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-semibold"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        className={`w-full py-4 rounded-lg text-lg font-semibold transition-colors mb-4 ${
          inStock
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        disabled={!inStock}
      >
        {inStock ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </>
  );
}