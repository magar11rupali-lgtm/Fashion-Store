# Day 6: Shopping Cart Functionality

## 🎯 Learning Objectives

By the end of today, you will:
- Understand state management in React
- Learn about Context API
- Implement shopping cart logic
- Make Add to Cart buttons functional

## ⏱️ Estimated Time: 4-5 hours

---

## 📝 Tasks & Subtasks

### Task 6.1: Learn State Management

**Subtask 6.1.1: Understand React Context API**

Context API lets you share data across your entire app without passing props through every component.

Think of it like a global storage box that any component can access.

**Subtask 6.1.2: Global state vs local state**

- **Local state**: Data used in one component (like a form input)
- **Global state**: Data used across many components (like shopping cart)

**Subtask 6.1.3: useContext and useState hooks**

- `useState`: Creates state in a component
- `useContext`: Accesses global state from Context

---

### Task 6.2: Create Cart Context

**Subtask 6.2.1: Create context folder**

```bash
cd frontend
mkdir context
```

**Subtask 6.2.2-6.2.7: Create CartContext**

Create `frontend/context/CartContext.js`:

```javascript
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addToCart = (product, quantity = 1, size = 'M') => {
    setCart((prevCart) => {
      // Check if item already exists
      const existingItem = prevCart.find(
        (item) => item.id === product.id && item.size === size
      );

      if (existingItem) {
        // Increase quantity
        return prevCart.map((item) =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.attributes.name,
            price: product.attributes.price,
            image: product.attributes.image?.data?.attributes?.url,
            size,
            quantity,
          },
        ];
      }
    });

    // Show success message
    setIsOpen(true);
  };

  // Remove item from cart
  const removeFromCart = (id, size) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.id === id && item.size === size))
    );
  };

  // Update quantity
  const updateQuantity = (id, size, quantity) => {
    if (quantity < 1) {
      removeFromCart(id, size);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Calculate totals
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isOpen,
    setIsOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
```

**Subtask 6.2.7: Wrap app with CartProvider**

Update `frontend/app/layout.js`:

```javascript
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Fashion Store',
  description: 'Your one-stop shop for trendy fashion',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
```

---

### Task 6.3: Build Cart Component

**Subtask 6.3.1-6.3.7: Create Cart sidebar**

Create `frontend/components/Cart.jsx`:

```jsx
'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice, isOpen, setIsOpen } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-blue-600 hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  className="flex gap-4 border-b pb-4"
                >
                  {/* Image */}
                  <div className="relative w-20 h-20 bg-gray-100 rounded">
                    {item.image && (
                      <Image
                        src={`http://localhost:1337${item.image}`}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">Size: {item.size}</p>
                    <p className="text-sm font-bold text-gray-900">
                      ${item.price.toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.size, item.quantity - 1)
                        }
                        className="w-6 h-6 border rounded hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.size, item.quantity + 1)
                        }
                        className="w-6 h-6 border rounded hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id, item.size)}
                    className="text-red-500 hover:text-red-700 text-sm"
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
          <div className="border-t p-6 space-y-4">
            {/* Subtotal */}
            <div className="flex justify-between text-lg font-semibold">
              <span>Subtotal:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Proceed to Checkout
            </Link>

            {/* Continue Shopping */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-blue-600 hover:underline"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
```

---

### Task 6.4: Add Cart to Header

**Subtask 6.4.1-6.4.4: Update Header**

Update `frontend/components/Header.jsx`:

```jsx
'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Cart from './Cart';

export default function Header() {
  const { totalItems, setIsOpen } = useCart();

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-30">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-800">
              Fashion Store
            </Link>
            
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Home
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-blue-600">
                Shop
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600">
                Contact
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsOpen(true)}
                className="relative text-gray-700 hover:text-blue-600 flex items-center gap-2"
              >
                <span className="text-2xl">🛒</span>
                <span className="hidden md:inline">Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>
      
      <Cart />
    </>
  );
}
```

---

### Task 6.5: Connect Add to Cart Buttons

**Subtask 6.5.1-6.5.4: Update Product Detail Page**

Update the Add to Cart section in `frontend/app/products/[id]/page.js`:

First, create a client component for the interactive parts:

Create `frontend/components/ProductActions.jsx`:

```jsx
'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';

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
```

Then update `frontend/app/products/[id]/page.js` to use it:

```javascript
import ProductActions from '@/components/ProductActions';

// ... in the details section, replace the size selector, quantity, and button with:

<ProductActions product={product} inStock={inStock} />
```

---

## 🤖 AI Prompts for Students

When you get stuck, try asking:

```
"Explain React Context API like I'm 14"

"How do I create a shopping cart context in React?"

"Show me how to add items to cart in React"

"How do I calculate total price of cart items?"

"Help me: Cart items disappear when I refresh the page"

"How do I create a cart icon with item count badge?"

"How do I save cart to localStorage?"

"Why do I need 'use client' directive in Next.js?"
```

---

## 📖 Tutorial Steps

### Step 1: Create Cart Context

1. Create `context` folder in `frontend`
2. Create `CartContext.js`
3. Copy the CartContext code
4. Save the file

### Step 2: Wrap App with Provider

1. Open `app/layout.js`
2. Import CartProvider
3. Wrap children with CartProvider
4. Save the file

### Step 3: Create Cart Component

1. Create `Cart.jsx` in `components`
2. Copy the Cart code
3. Save the file

### Step 4: Update Header

1. Open `components/Header.jsx`
2. Replace with updated code
3. Save the file

### Step 5: Create ProductActions

1. Create `ProductActions.jsx` in `components`
2. Copy the code
3. Save the file

### Step 6: Update Product Detail Page

1. Open `app/products/[id]/page.js`
2. Import ProductActions
3. Replace interactive sections
4. Save the file

### Step 7: Test Everything

1. Go to a product page
2. Select size and quantity
3. Click "Add to Cart"
4. Cart should slide in from right
5. Check cart icon shows item count

---

## ✅ Testing & Validation

Check that everything works:

- [ ] Add to Cart button adds items to cart
- [ ] Cart icon shows correct item count
- [ ] Cart sidebar slides in when clicking cart icon
- [ ] Cart displays all added items
- [ ] Item images show in cart
- [ ] Quantity can be increased/decreased
- [ ] Items can be removed from cart
- [ ] Total price calculates correctly
- [ ] Cart persists on page navigation
- [ ] Cart persists on page refresh (localStorage)
- [ ] Empty cart shows appropriate message
- [ ] Size selection works
- [ ] Quantity selection works
- [ ] Can add same product with different sizes
- [ ] Close button closes cart
- [ ] Clicking overlay closes cart
- [ ] No console errors

---

## 🏠 Homework

Before Day 7, complete these tasks:

1. **Add animation when item is added to cart**
   - Show a toast notification
   - "Product added to cart!" message
   - Auto-dismiss after 3 seconds

2. **Save cart to localStorage** 
   - Already done! ✅
   - But test it: Add items, refresh page, items should remain

3. **Add "Continue Shopping" button in cart**
   - Already done! ✅

4. **Create a mini cart preview**
   - Show on hover over cart icon
   - Display last 3 items
   - Show total

---

## 🐛 Common Errors & Solutions

### Error: "useCart must be used within CartProvider"
**Solution:**
- Make sure layout.js wraps children with CartProvider
- Check that CartProvider is imported correctly
- Verify 'use client' is at top of CartContext.js

### Error: "localStorage is not defined"
**Solution:**
- This happens on server-side rendering
- Use useEffect to access localStorage (already in code)
- Make sure component has 'use client' directive

### Error: Cart doesn't persist on refresh
**Solution:**
- Check localStorage is saving (open DevTools → Application → Local Storage)
- Verify useEffect is running
- Check JSON.parse/stringify is working

### Error: Can't click Add to Cart
**Solution:**
- Make sure ProductActions has 'use client'
- Check onClick handler is attached
- Verify useCart hook is working
- Check console for errors

### Error: Cart count doesn't update
**Solution:**
- Make sure Header has 'use client'
- Verify useCart is called in Header
- Check that addToCart is updating state
- Look for console errors

---

## 📚 What You Learned Today

- ✅ React Context API for global state
- ✅ useState hook for local state
- ✅ useContext hook to access context
- ✅ useEffect hook for side effects
- ✅ localStorage for data persistence
- ✅ Client vs Server Components in Next.js
- ✅ Event handlers in React
- ✅ Conditional rendering
- ✅ Array methods (map, filter, reduce)
- ✅ Immutable state updates

---

## 💡 Key Concepts

### Context API
Provides global state without prop drilling:
```javascript
// Create context
const CartContext = createContext();

// Provide value
<CartContext.Provider value={data}>

// Use in any component
const data = useContext(CartContext);
```

### 'use client' Directive
Next.js 14 has two types of components:
- **Server Components**: Run on server (default)
- **Client Components**: Run in browser (need 'use client')

Use 'use client' when you need:
- useState, useEffect, useContext
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, window)

### localStorage
Saves data in browser:
```javascript
// Save
localStorage.setItem('key', JSON.stringify(data));

// Load
const data = JSON.parse(localStorage.getItem('key'));
```

### Immutable Updates
Never mutate state directly:
```javascript
// ❌ Wrong
cart.push(item);

// ✅ Correct
setCart([...cart, item]);
```

---

## 🎉 Congratulations!

You've completed Day 6! You now have a fully functional shopping cart. Users can add products, adjust quantities, and see their cart total. This is a major feature!

**Tomorrow:** We'll add search and filter functionality to help users find products!

---

## 📖 Additional Reading (Optional)

- [React Context](https://react.dev/learn/passing-data-deeply-with-context)
- [useState Hook](https://react.dev/reference/react/useState)
- [useEffect Hook](https://react.dev/reference/react/useEffect)
- [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)

---

[← Day 5: Product Details](./day-05-product-details.md) | [Back to Overview](./README.md) | [Day 7: Search & Filter →](./day-07-search-filter.md)
