const API_URL = 'http://localhost:1337/api';

export async function getAllProducts() {
  try {
    const response = await fetch(`${API_URL}/products?populate=*`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductById(id) {
  try {
    const response = await fetch(`${API_URL}/products/${id}?populate=*`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function getAllCategories() {
  try {
    const response = await fetch(`${API_URL}/categories?populate=*`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}