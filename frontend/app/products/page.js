'use client';

import { useState, useEffect } from 'react';
import { getAllProducts } from '../lib/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumb from '../components/Breadcrumb';
import BackToTop from '../components/BackToTop';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('newest'); // 'price-asc', 'price-desc', 'name', 'newest'
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all', 'in-stock', 'low-stock'

const handleCategoryToggle = (category) => {
  console.log('Toggling category:', category); // Debug
  console.log('Current selected:', selectedCategories);
  
  if (selectedCategories.includes(category)) {
    const newCategories = selectedCategories.filter((c) => c !== category);
    console.log('Removing, new:', newCategories);
    setSelectedCategories(newCategories);
  } else {
    const newCategories = [...selectedCategories, category];
    console.log('Adding, new:', newCategories);
    setSelectedCategories(newCategories);
  }
};

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
    const { name, description, category, price, inStock, inventory } = product;

    // Search filter
  const descriptionText = description?.[0]?.children?.[0]?.text || "";
  const matchesSearch =
  (name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
  descriptionText.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(category);

    // Price filter
    const matchesPrice = price >= priceRange.min && price <= priceRange.max;

    // Availability filter
    let matchesAvailability = true;
    if (availabilityFilter === 'in-stock') {
      matchesAvailability = inStock && inventory > 10;
    } else if (availabilityFilter === 'low-stock') {
      matchesAvailability = inStock && inventory > 0 && inventory <= 10;
    }

    return matchesSearch && matchesCategory && matchesPrice && matchesAvailability;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
      default:
        // Assuming products have an id that increases with time
        return b.id - a.id;
    }
  });

  if (loading) {
    return (
      <div>
        <Header />
        <Breadcrumb />
        <div className="container mx-auto px-6 py-12 text-center">
          <p className="text-gray-600">Loading products...</p>
          {loading && <LoadingSpinner />}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <Breadcrumb />
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 sm:mb-8">Our Products</h1>

        <SearchBar searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} />

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          <FilterSidebar
            products={products}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            availabilityFilter={availabilityFilter}
            setAvailabilityFilter={setAvailabilityFilter}
          />

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
              <div className="text-gray-600 text-sm sm:text-base">
                Showing {sortedProducts.length} of {products.length} products
              </div>
              
              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <label htmlFor="sort" className="text-gray-700 font-medium text-sm sm:text-base whitespace-nowrap">
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none bg-white text-sm sm:text-base min-h-[44px]"
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>

            {sortedProducts.length === 0 ? (
              <p className="text-gray-600 text-center py-12 text-sm sm:text-base">
                No products found. Try adjusting your filters.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <BackToTop />
      <Footer />
    </div>
  );
}