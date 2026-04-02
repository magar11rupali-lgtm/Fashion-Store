'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:1337/api';

export default function SearchBar({ searchTerm, onSearchChange }) {
  const [query, setQuery] = useState(searchTerm || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();
  
  // Sync with parent component if controlled
  useEffect(() => {
    if (searchTerm !== undefined) {
      setQuery(searchTerm);
    }
  }, [searchTerm]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/products?filters[name][$containsi]=${encodeURIComponent(query)}&populate=*&pagination[limit]=5`
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Search suggestions data:', data.data);
          if (data.data && data.data.length > 0) {
            console.log('First product image structure:', data.data[0]?.attributes?.image);
          }
          setSuggestions(data.data || []);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      // If controlled by parent (products page), don't navigate
      if (onSearchChange) {
        onSearchChange(query.trim());
      } else {
        // Otherwise navigate to search page
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const handleSuggestionClick = (productId) => {
    setShowSuggestions(false);
    setQuery('');
    router.push(`/products/${productId}`);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              const newValue = e.target.value;
              setQuery(newValue);
              // If controlled by parent, update immediately
              if (onSearchChange) {
                onSearchChange(newValue);
              }
            }}
            placeholder="Search products..."
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label="Search"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </form>

      {/* Autocomplete dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-gray-500 text-sm">Loading...</div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((product) => {
                // Handle both array and single image structure
                let imageUrl = '/placeholder.png';
                const imageData = product.attributes?.image?.data;
                
                if (imageData) {
                  if (Array.isArray(imageData)) {
                    // Handle array of images
                    imageUrl = imageData[0]?.attributes?.url 
                      ? `http://localhost:1337${imageData[0].attributes.url}`
                      : '/placeholder.png';
                  } else {
                    // Handle single image object
                    imageUrl = imageData.attributes?.url
                      ? `http://localhost:1337${imageData.attributes.url}`
                      : '/placeholder.png';
                  }
                }

                return (
                  <li key={product.id}>
                    <button
                      onClick={() => handleSuggestionClick(product.id)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={product.attributes?.name || 'Product'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder.png';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.attributes?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${product.attributes?.price}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-3 text-gray-500 text-sm">
              No products found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
