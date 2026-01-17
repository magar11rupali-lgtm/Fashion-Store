'use client';

import { useState, useEffect } from 'react';
import { getAllProducts } from '../../lib/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  useEffect(() => {
    async function fetchProducts() {
      const data = await getAllProducts();
      setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const { name, description, category, price } = product;

    // Search filter
  const matchesSearch =
  (name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
  (description || "").toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(category);

    // Price filter
    const matchesPrice = price >= priceRange.min && price <= priceRange.max;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-6 py-12 text-center">
          <p className="text-gray-600">Loading products...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Our Products</h1>

        <SearchBar searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} />

        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar
            products={products}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />

          <div className="flex-1">
            <div className="mb-4 text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </div>

            {filteredProducts.length === 0 ? (
              <p className="text-gray-600 text-center py-12">
                No products found. Try adjusting your filters.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}