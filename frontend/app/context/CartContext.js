'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from '@/hooks/useNotification';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  console.log('Cart items:', cart);
  const [isOpen, setIsOpen] = useState(false);
  const { showNotification } = useNotification();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Ensure all items have a size property
        const migratedCart = parsedCart.map(item => ({
          ...item,
          size: item.size || 'M' // Add default size if missing
        }));
        setCart(migratedCart);
      } catch (error) {
        console.error('Error loading cart:', error);
        setCart([]);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addToCart = (product, quantity = 1, size = 'M') => {
    // Properly extract product data from attributes or direct properties
    const price = Number(product.attributes?.price || product.price);
    const name = product.attributes?.name || product.name;
    
    // Extract image URL properly
    const extractImageUrl = () => {
      // Try nested attributes structure first
      const nestedUrl = product.attributes?.image?.data?.attributes?.url;
      if (nestedUrl) return nestedUrl;
      
      // Try direct image property
      const directImage = product.image;
      if (typeof directImage === 'string') return directImage;
      
      // Try image data structure
      const imageData = directImage?.data?.attributes?.url;
      if (imageData) return imageData;
      
      // Try array structure
      const arrayUrl = directImage?.[0]?.url;
      if (arrayUrl) return arrayUrl;
      
      return null;
    };
    
    const image = extractImageUrl();
    
    console.log('Adding to cart - price:', price, typeof price);
    console.log('Adding to cart - size:', size, typeof size);
    console.log('Adding to cart - image:', image);

    setCart((prevCart) => {
      // Check if item already exists
      const existingItem = prevCart.find(
        (item) => item.id === product.id && item.size === size
      );

      if (existingItem) {
        // Increase quantity
        const updatedCart = prevCart.map((item) =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        console.log('Updated cart (existing item):', updatedCart);
        return updatedCart;
      } else {
        // Add new item
        const newItem = {
          id: product.id,
          name,
          price,
          image,
          size,
          quantity,
        };
        console.log('New cart item:', newItem);
        const updatedCart = [...prevCart, newItem];
        console.log('Updated cart (new item):', updatedCart);
        return updatedCart;
      }
    });

    // Show success notification
    showNotification('success', `${name} added to cart!`);
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
  (sum, item) => {
    console.log(`Item: ${item.name}, Price: ${item.price}, Qty: ${item.quantity}`);
    return sum + (item.price * item.quantity);
  },
  0
);
console.log('Total Price:', totalPrice);
  

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