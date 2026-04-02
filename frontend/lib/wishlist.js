/**
 * Wishlist API helper functions
 * Handles communication with Strapi backend for wishlist operations
 */

import { handleFetchError, createApiError, logError } from './errors';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Fetch user's wishlist from backend
 * @param {string} userToken - JWT authentication token
 * @returns {Promise<Object>} Wishlist data from backend
 */
export async function fetchWishlist(userToken) {
  if (!userToken) {
    const error = createApiError('No authentication token provided', 401);
    logError(error, { action: 'fetchWishlist', reason: 'missing_token' });
    throw error;
  }

  try {
    const res = await fetch(
      `${API_URL}/wishlists?populate[product][populate][0]=image`,
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      }
    );

    if (!res.ok) {
      const errorInfo = await handleFetchError(new Error('Failed to fetch wishlist'), res);
      const apiError = createApiError(errorInfo.message, errorInfo.status, errorInfo.data);
      logError(apiError, { action: 'fetchWishlist', status: res.status });
      throw apiError;
    }

    const response = await res.json();

    console.log('=== RAW WISHLIST API RESPONSE ===');
    console.log('Response structure:', {
      hasData: !!response?.data,
      dataLength: response?.data?.length,
      firstItem: response?.data?.[0] ? {
        id: response.data[0].id,
        hasAttributes: !!response.data[0].attributes,
        hasProduct: !!response.data[0].attributes?.product,
        productHasData: !!response.data[0].attributes?.product?.data,
      } : null
    });
    
    if (response?.data?.[0]) {
      console.log('First item full structure:', JSON.stringify(response.data[0], null, 2));
    }

    // 🔥 Normalize Strapi response into flat structure
    const normalized = (response?.data || []).map((item, index) => {
      console.log(`\n=== Normalizing item ${index + 1} ===`);
      console.log('Raw item:', JSON.stringify(item, null, 2));
      
      // Handle both nested (attributes) and flat structure
      const productData = item?.attributes?.product?.data?.attributes || item?.product;
      const productId = item?.attributes?.product?.data?.id || item?.product?.id;
      
      console.log('Extracted product data:', {
        productId,
        hasProductData: !!productData,
        productName: productData?.name,
        productPrice: productData?.price,
        imageStructure: productData?.image ? (
          productData.image.data ? 'has data property' :
          Array.isArray(productData.image) ? 'is array' :
          productData.image.url ? 'has url property' :
          typeof productData.image === 'string' ? 'is string' :
          'unknown structure'
        ) : 'no image'
      });
      
      // Handle image - can be array or single object
      let imageUrl = "";
      if (productData?.image) {
        // Check if image has data property (Strapi v4/v5 format)
        if (productData.image.data) {
          if (Array.isArray(productData.image.data)) {
            imageUrl = productData.image.data[0]?.attributes?.url || "";
            console.log('Image from array data:', imageUrl);
          } else {
            imageUrl = productData.image.data.attributes?.url || "";
            console.log('Image from single data:', imageUrl);
          }
        } 
        // Check if image is already an array of objects with url (direct format)
        else if (Array.isArray(productData.image)) {
          imageUrl = productData.image[0]?.url || productData.image[0]?.attributes?.url || "";
          console.log('Image from direct array:', imageUrl);
        }
        // Check if image is a direct object with url
        else if (productData.image.url) {
          imageUrl = productData.image.url;
          console.log('Image from direct url:', imageUrl);
        }
        // Check if image is a string (direct URL)
        else if (typeof productData.image === 'string') {
          imageUrl = productData.image;
          console.log('Image is string:', imageUrl);
        }
      }

      const normalizedItem = {
        id: item.id,
        productId: productId,
        name: productData?.name || "Unknown Product",
        price: productData?.price || 0,
        image: imageUrl,
        availableSizes: productData?.sizes || ['S', 'M', 'L', 'XL'],
        addedAt: item?.attributes?.addedAt || new Date().toISOString(),
      };
      
      console.log('Normalized result:', normalizedItem);
      
      return normalizedItem;
    });

    return {
      data: normalized,
      meta: response?.meta || {}
    };

  } catch (error) {
    if (error.status) {
      throw error;
    }

    const errorMessage = error?.message || 'Network error. Please check your connection.';
    const networkError = createApiError(errorMessage);
    logError(networkError, { action: 'fetchWishlist', errorType: 'network' });
    throw networkError;
  }
}

/**
 * Add product to wishlist in backend
 * @param {number} productId - Product ID to add
 * @param {string} userToken - JWT authentication token
 * @returns {Promise<Object>} Created wishlist item
 */
export async function addToWishlist(productId, userToken) {
  try {
    const res = await fetch(`${API_URL}/wishlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        data: {
          product: productId,
        },
      }),
    });

    if (!res.ok) {
      const errorInfo = await handleFetchError(new Error('Failed to add to wishlist'), res);
      const apiError = createApiError(errorInfo.message, errorInfo.status, errorInfo.data);
      logError(apiError, { action: 'addToWishlist', productId });
      throw apiError;
    }

    return res.json();
  } catch (error) {
    if (error.status) {
      throw error; // Re-throw API errors
    }
    // Handle network errors
    const networkError = createApiError('Network error. Please check your connection.');
    logError(networkError, { action: 'addToWishlist', productId });
    throw networkError;
  }
}

/**
 * Remove product from wishlist in backend
 * @param {number} wishlistItemId - Wishlist item ID to remove
 * @param {string} userToken - JWT authentication token
 * @returns {Promise<Object>} Deleted wishlist item
 */
export async function removeFromWishlist(wishlistItemId, userToken) {
  try {
    const res = await fetch(`${API_URL}/wishlists/${wishlistItemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
    });

    if (!res.ok) {
      const errorInfo = await handleFetchError(new Error('Failed to remove from wishlist'), res);
      const apiError = createApiError(errorInfo.message, errorInfo.status, errorInfo.data);
      logError(apiError, { action: 'removeFromWishlist', wishlistItemId });
      throw apiError;
    }

    return res.json();
  } catch (error) {
    if (error.status) {
      throw error; // Re-throw API errors
    }
    // Handle network errors
    const networkError = createApiError('Network error. Please check your connection.');
    logError(networkError, { action: 'removeFromWishlist', wishlistItemId });
    throw networkError;
  }
}
