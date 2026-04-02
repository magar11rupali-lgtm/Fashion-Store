'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '../components/LoadingSpinner';
import BackToTop from '../components/BackToTop';
import { logError } from '../../lib/errors';

const API_URL = 'http://localhost:1337/api';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(`${API_URL}/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        logError(error, { action: 'fetchCategories' });
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function searchProducts() {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let url = `${API_URL}/products?filters[name][$containsi]=${encodeURIComponent(query)}&populate=*`;
        
        if (filterCategory !== 'all') {
          url += `&filters[category][id][$eq]=${filterCategory}`;
        }

        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          let results = data.data || [];
          
          // Sort results
          results = sortProducts(results, sortBy);
          
          setProducts(results);
        }
      } catch (error) {
        logError(error, { action: 'searchProducts', query });
        console.error('Error searching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    searchProducts();
  }, [query, sortBy, filterCategory]);

  const sortProducts = (products, sortBy) => {
    const sorted = [...products];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => 
          (a.attributes?.price || 0) - (b.attributes?.price || 0)
        );
      case 'price-high':
        return sorted.sort((a, b) => 
          (b.attributes?.price || 0) - (a.attributes?.price || 0)
        );
      case 'name':
      default:
        return sorted.sort((a, b) => 
          (a.attributes?.name || '').localeCompare(b.attributes?.name || '')
        );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Search Results
        </h1>
        {query && (
          <p className="text-gray-600">
            Showing results for: <span className="font-semibold">&quot;{query}&quot;</span>
          </p>
        )}
        <p className="text-gray-500 mt-1">
          {products.length} {products.length === 1 ? 'product' : 'products'} found
        </p>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Category Filter */}
        <div className="flex-1">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Category
          </label>
          <select
            id="category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.attributes?.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex-1">
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
            Sort by
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Name (A-Z)</option>
            <option value="price-low">Price (Low to High)</option>
            <option value="price-high">Price (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            No results found
          </h2>
          <p className="text-gray-600 mb-6">
            {query 
              ? `We couldn't find any products matching "${query}"`
              : 'Please enter a search query'
            }
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const imageUrl = product.attributes?.image?.data?.attributes?.url
              ? `http://localhost:1337${product.attributes.image.data.attributes.url}`
              : '/placeholder.png';

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={product.attributes?.name || 'Product'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {product.attributes?.name}
                  </h3>
                  <p className="text-xl font-bold text-blue-600">
                    ${product.attributes?.price}
                  </p>
                  {product.attributes?.category?.data?.attributes?.name && (
                    <p className="text-sm text-gray-500 mt-1">
                      {product.attributes.category.data.attributes.name}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
      <BackToTop />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SearchResults />
    </Suspense>
  );
}
