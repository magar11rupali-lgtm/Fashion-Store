'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import * as wishlistApi from '@/lib/wishlist';
import { useNotification } from '@/hooks/useNotification';
import { ERROR_MESSAGES, logError } from '@/lib/errors';

const WishlistContext = createContext();

const WISHLIST_STORAGE_KEY = 'wishlist';

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const { showNotification } = useNotification();

  /**
   * Get wishlist from localStorage
   */
  const getLocalStorageWishlist = () => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      logError(error, { action: 'getWishlistFromLocalStorage' });
      console.error('Failed to get wishlist from localStorage:', error);
      return [];
    }
  };

  /**
   * Load wishlist from localStorage
   */
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    } catch (error) {
      logError(error, { action: 'loadWishlistFromLocalStorage' });
      console.error('Failed to load wishlist from localStorage:', error);
    }
  };

  /**
   * Save wishlist to localStorage
   */
  const saveToLocalStorage = (items) => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      logError(error, { action: 'saveWishlistToLocalStorage' });
      console.error('Failed to save wishlist to localStorage:', error);
    }
  };

  // Load wishlist on mount and when authentication changes
  useEffect(() => {
    const loadWishlist = async () => {
      if (session?.accessToken) {
        // Authenticated: fetch from backend and merge with localStorage
        try {
          setIsLoading(true);
          
          // Get localStorage wishlist
          const localWishlist = getLocalStorageWishlist();
          
          // Fetch backend wishlist
          const response = await wishlistApi.fetchWishlist(session.accessToken);
          
          console.log('Wishlist API response:', response);
          
          // The response is already normalized by wishlist.js
          // It returns a flat structure with name, price, image directly on items
          const backendWishlist = Array.isArray(response?.data) ? response.data : [];
          
          console.log('Backend wishlist items:', backendWishlist);
          
          // Merge: add localStorage items that aren't in backend
          if (localWishlist.length > 0) {
            const backendProductIds = new Set(backendWishlist.map(item => item.productId));
            const itemsToAdd = localWishlist.filter(item => !backendProductIds.has(item.productId));
            
            // Add unique localStorage items to backend
            const addPromises = itemsToAdd.map(item =>
              wishlistApi.addToWishlist(item.productId, session.accessToken)
                .then(response => ({
                  id: response.data.id,
                  productId: item.productId,
                  name: item.name,
                  price: item.price,
                  image: item.image,
                  availableSizes: item.availableSizes,
                  addedAt: response.data.attributes.addedAt,
                }))
                .catch(error => {
                  logError(error, { action: 'addProductToBackend', productId: item.productId });
                  console.error(`Failed to add product ${item.productId} to backend:`, error);
                  return null;
                })
            );
            
            const addedItems = (await Promise.all(addPromises)).filter(item => item !== null);
            
            // Combine backend wishlist with newly added items
            const mergedWishlist = [...backendWishlist, ...addedItems];
            console.log('Setting merged wishlist:', mergedWishlist);
            setWishlist(mergedWishlist);
          } else {
            console.log('Setting backend wishlist directly:', backendWishlist);
            console.log('First item:', backendWishlist[0]);
            setWishlist(backendWishlist);
          }
          
          // Clear localStorage after successful merge
          localStorage.removeItem(WISHLIST_STORAGE_KEY);
        } catch (error) {
          const errorMessage = error?.message || 'Failed to load wishlist from backend';
          logError(error, { 
            action: 'loadWishlistFromBackend',
            errorMessage,
            hasSession: !!session,
            hasAccessToken: !!session?.accessToken
          });
          console.error('Failed to load wishlist from backend:', errorMessage);
          // Fallback to localStorage - don't show error notification for initial load
          loadFromLocalStorage();
        } finally {
          setIsLoading(false);
        }
      } else {
        // Unauthenticated: load from localStorage
        loadFromLocalStorage();
      }
    };

    loadWishlist();
  }, [session?.accessToken]); // Only re-run when token changes

  /**
   * Add product to wishlist
   */
  const addToWishlist = async (product) => {
    console.log('Adding to wishlist:', product);
    console.log('Product ID:', product.id);
    
    // Check if already in wishlist
    const exists = wishlist.some(item => item.productId === product.id);
    if (exists) {
      console.log('Product already in wishlist');
      showNotification('info', 'Product is already in your wishlist');
      return;
    }

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

    const wishlistItem = {
      id: session?.accessToken ? null : Date.now(), // Temporary ID for localStorage
      productId: product.id,
      name: product.attributes?.name || product.name,
      price: product.attributes?.price || product.price,
      image: extractImageUrl(),
      availableSizes: product.attributes?.sizes || ['S', 'M', 'L', 'XL'],
      addedAt: new Date().toISOString(),
    };

    console.log('Wishlist item to add:', wishlistItem);
    console.log('Image URL:', wishlistItem.image);

    if (session?.accessToken) {
      // Authenticated: save to backend
      try {
        console.log('Adding to backend wishlist, product ID:', product.id);
        const response = await wishlistApi.addToWishlist(product.id, session.accessToken);
        console.log('Backend add response:', response);
        
        // The backend returns the full structure, we need to normalize it
        const responseData = response.data || response;
        const productData = responseData.attributes?.product?.data;
        
        // Extract image URL
        let imageUrl = extractImageUrl();
        if (productData?.attributes?.image?.data) {
          const imgData = productData.attributes.image.data;
          imageUrl = Array.isArray(imgData) 
            ? imgData[0]?.attributes?.url 
            : imgData?.attributes?.url;
        }
        
        const backendItem = {
          id: responseData.id,
          productId: productData?.id || product.id,
          name: productData?.attributes?.name || product.attributes?.name || product.name,
          price: productData?.attributes?.price || product.attributes?.price || product.price,
          image: imageUrl,
          availableSizes: productData?.attributes?.sizes || product.attributes?.sizes || ['S', 'M', 'L', 'XL'],
          addedAt: responseData.attributes?.addedAt || new Date().toISOString(),
        };
        setWishlist(prev => [...prev, backendItem]);
        console.log('Added to wishlist (backend):', backendItem);
        showNotification('success', `${wishlistItem.name} added to wishlist!`);
      } catch (error) {
        logError(error, { action: 'addToWishlist', productId: wishlistItem.productId });
        console.error('Failed to add to wishlist:', error);
        // Show user-friendly error message
        const errorMsg = error.status === 401 
          ? 'Please sign in to add items to your wishlist'
          : error.status === 500
          ? 'Server error. Please try again later.'
          : error.message || ERROR_MESSAGES.GENERIC_ERROR;
        showNotification('error', errorMsg);
        throw error;
      }
    } else {
      // Unauthenticated: save to localStorage
      const newWishlist = [...wishlist, wishlistItem];
      setWishlist(newWishlist);
      saveToLocalStorage(newWishlist);
      console.log('Added to wishlist (localStorage):', wishlistItem);
      console.log('Current wishlist:', newWishlist);
      showNotification('success', `${wishlistItem.name} added to wishlist!`);
    }
  };

  /**
   * Remove product from wishlist
   */
  const removeFromWishlist = async (productId) => {
    console.log('Removing from wishlist, productId:', productId);
    
    if (session?.accessToken) {
      // Authenticated: remove from backend
      const item = wishlist.find(w => w.productId === productId);
      console.log('Found wishlist item:', item);
      
      if (!item) {
        console.warn('Item not found in wishlist');
        showNotification('error', 'Item not found in wishlist');
        return;
      }

      try {
        console.log('Removing from backend, wishlist item ID:', item.id);
        await wishlistApi.removeFromWishlist(item.id, session.accessToken);
        
        // Update state immediately after successful backend removal
        setWishlist(prev => {
          const updated = prev.filter(w => w.productId !== productId);
          console.log('Updated wishlist after removal:', updated.length, 'items');
          return updated;
        });
        
        console.log('Successfully removed from wishlist');
        showNotification('success', 'Removed from wishlist');
      } catch (error) {
        logError(error, { action: 'removeFromWishlist', productId });
        console.error('Failed to remove from wishlist:', error);
        // Show user-friendly error message
        const errorMsg = error.status === 401 
          ? 'Please sign in to manage your wishlist'
          : error.status === 500
          ? 'Server error. Please try again later.'
          : error.message || 'Failed to remove from wishlist';
        showNotification('error', errorMsg);
        throw error;
      }
    } else {
      // Unauthenticated: remove from localStorage
      const newWishlist = wishlist.filter(w => w.productId !== productId);
      setWishlist(newWishlist);
      saveToLocalStorage(newWishlist);
      console.log('Removed from localStorage wishlist');
      showNotification('success', 'Removed from wishlist');
    }
  };

  /**
   * Move product from wishlist to cart
   */
  const moveToCart = async (productId, size, addToCartFn) => {
    const item = wishlist.find(w => w.productId === productId);
    if (!item) return;

    // Add to cart (using CartContext's addToCart function)
    if (addToCartFn) {
      const product = {
        id: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        attributes: {
          name: item.name,
          price: item.price,
          image: { data: { attributes: { url: item.image } } },
        },
      };
      addToCartFn(product, 1, size);
    }

    // Remove from wishlist
    await removeFromWishlist(productId);
  };

  /**
   * Clear entire wishlist
   */
  const clearWishlist = async () => {
    if (session?.accessToken) {
      // Authenticated: remove all items from backend
      try {
        await Promise.all(
          wishlist.map(item => wishlistApi.removeFromWishlist(item.id, session.accessToken))
        );
        setWishlist([]);
      } catch (error) {
        logError(error, { action: 'clearWishlist' });
        console.error('Failed to clear wishlist:', error);
        throw error;
      }
    } else {
      // Unauthenticated: clear localStorage
      setWishlist([]);
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
    }
  };

  /**
   * Check if product is in wishlist
   */
  const isInWishlist = (productId) => {
    return wishlist.some(item => item.productId === productId);
  };

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    clearWishlist,
    isInWishlist,
    totalItems: wishlist.length,
    isOpen,
    setIsOpen,
    isLoading,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
