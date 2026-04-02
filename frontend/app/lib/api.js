import { handleFetchError, createApiError, logError } from '@/lib/errors';

const API_URL = 'http://localhost:1337/api';

export async function getAllProducts() {
  try {
    const response = await fetch(`${API_URL}/products?populate=*`);
    
    if (!response.ok) {
      const error = await handleFetchError(new Error('Failed to fetch products'), response);
      logError(error, { action: 'getAllProducts' });
      throw createApiError(error.message, error.status, error.data);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    if (error.status) {
      // API error - log and return empty array for graceful degradation
      console.error('Error fetching products:', error.message);
      return [];
    }
    // Network error
    logError(error, { action: 'getAllProducts' });
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductById(id) {
  try {
    const response = await fetch(`${API_URL}/products/${id}?populate=*`);
    
    if (!response.ok) {
      const error = await handleFetchError(new Error('Failed to fetch product'), response);
      logError(error, { action: 'getProductById', productId: id });
      throw createApiError(error.message, error.status, error.data);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    if (error.status) {
      // API error - log and return null for graceful degradation
      console.error('Error fetching product:', error.message);
      return null;
    }
    // Network error
    logError(error, { action: 'getProductById', productId: id });
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function getAllCategories() {
  try {
    const response = await fetch(`${API_URL}/categories?populate=*`);
    
    if (!response.ok) {
      const error = await handleFetchError(new Error('Failed to fetch categories'), response);
      logError(error, { action: 'getAllCategories' });
      throw createApiError(error.message, error.status, error.data);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    if (error.status) {
      // API error - log and return empty array for graceful degradation
      console.error('Error fetching categories:', error.message);
      return [];
    }
    // Network error
    logError(error, { action: 'getAllCategories' });
    console.error('Error fetching categories:', error);
    return [];
  }
}