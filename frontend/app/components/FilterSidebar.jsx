'use client';

export default function FilterSidebar({
  products,
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
  availabilityFilter,
  setAvailabilityFilter,
}) {
  // Get unique categories
  const categories = [
    ...new Set(products.map((p) => p.category)),
  ].filter(Boolean);

  const handleCategoryToggle = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 1000 });
  };

  const activeFiltersCount =
    selectedCategories.length + 
    (priceRange.min > 0 || priceRange.max < 1000 ? 1 : 0);

  return (
    <aside className="w-full lg:w-64 space-y-4 sm:space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Filters</h2>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs sm:text-sm text-blue-600 hover:underline min-h-[44px] px-2 touch-manipulation"
          >
            Clear All ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="bg-white p-3 sm:p-4 rounded-lg border">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category}
              className="flex items-center space-x-2 cursor-pointer min-h-[44px] py-1"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 touch-manipulation"
              />
              <span className="text-gray-700 text-sm sm:text-base">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="bg-white p-3 sm:p-4 rounded-lg border">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Price Range</h3>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-600">Min Price</label>
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange({ ...priceRange, min: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border rounded-lg focus:border-blue-600 focus:outline-none text-sm sm:text-base min-h-[44px]"
              min="0"
            />
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600">Max Price</label>
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange({ ...priceRange, max: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border rounded-lg focus:border-blue-600 focus:outline-none text-sm sm:text-base min-h-[44px]"
              min="0"
            />
          </div>
          <div className="text-xs sm:text-sm text-gray-600">
            ${priceRange.min} - ${priceRange.max}
          </div>
        </div>
      </div>
    </aside>
  );
}