# Day 7: Search & Filter Functionality

## 🎯 Learning Objectives

By the end of today, you will:
- Implement search functionality
- Create category filters
- Learn about array methods (filter, map)
- Combine multiple filters

## ⏱️ Estimated Time: 4-5 hours

---

## 📝 Tasks & Subtasks

### Task 7.1: Create Search Bar

**Subtask 7.1.1-7.1.5: Build SearchBar component**

Create `frontend/components/SearchBar.jsx`:

```jsx
'use client';

export default function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="mb-8">
      <div className="relative">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
        />
        <span className="absolute left-4 top-3.5 text-xl">🔍</span>
      </div>
    </div>
  );
}
```

---

### Task 7.2: Implement Search Logic

**Subtask 7.2.1-7.2.5: Add search to products page**

Update `frontend/app/products/page.js` to be a client component with search:

```javascript
'use client';

import { useState, useEffect } from 'react';
import { getAllProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import FilterSidebar from '@/components/FilterSidebar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
    const { name, description, category, price } = product.attributes;

    // Search filter
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase());

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

        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

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
```

---

### Task 7.3: Create Category Filter

**Subtask 7.3.1-7.3.5: Build FilterSidebar component**

Create `frontend/components/FilterSidebar.jsx`:

```jsx
'use client';

export default function FilterSidebar({
  products,
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
}) {
  // Get unique categories
  const categories = [
    ...new Set(products.map((p) => p.attributes.category)),
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
    selectedCategories.length + (priceRange.min > 0 || priceRange.max < 1000 ? 1 : 0);

  return (
    <aside className="w-full lg:w-64 space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Filters</h2>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:underline"
          >
            Clear All ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Min Price</label>
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange({ ...priceRange, min: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border rounded-lg focus:border-blue-600 focus:outline-none"
              min="0"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Max Price</label>
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange({ ...priceRange, max: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border rounded-lg focus:border-blue-600 focus:outline-none"
              min="0"
            />
          </div>
          <div className="text-sm text-gray-600">
            ${priceRange.min} - ${priceRange.max}
          </div>
        </div>
      </div>
    </aside>
  );
}
```

---

### Task 7.4: Add Price Range Filter

Already implemented in FilterSidebar above! ✅

---

### Task 7.5: Combine Filters

Already implemented in the products page! ✅

The filtering logic combines all three filters:
```javascript
const filteredProducts = products.filter((product) => {
  return matchesSearch && matchesCategory && matchesPrice;
});
```

---

## 🤖 AI Prompts for Students

When you get stuck, try asking:

```
"How do I create a search bar in React?"

"Show me how to filter an array of products by name"

"How do I create checkboxes for categories in React?"

"How do I filter products by multiple criteria?"

"Help me: Search is not working properly"

"How do I create a price range slider in React?"

"How do I make filters work on mobile?"

"What is the filter() method in JavaScript?"

"How do I get unique values from an array?"
```

---

## 📖 Tutorial Steps

### Step 1: Create SearchBar Component

1. Create `SearchBar.jsx` in `components`
2. Copy the code
3. Save the file

### Step 2: Create FilterSidebar Component

1. Create `FilterSidebar.jsx` in `components`
2. Copy the code
3. Save the file

### Step 3: Update Products Page

1. Open `app/products/page.js`
2. Replace with the new client component code
3. Save the file

### Step 4: Test Search

1. Go to `/products`
2. Type in search bar
3. Products should filter in real-time

### Step 5: Test Category Filter

1. Check/uncheck categories
2. Products should filter
3. Try multiple categories

### Step 6: Test Price Filter

1. Adjust min/max prices
2. Products should filter
3. Try different ranges

### Step 7: Test Combined Filters

1. Use search + category + price together
2. All filters should work simultaneously
3. Clear all filters button should reset everything

---

## ✅ Testing & Validation

Check that everything works:

- [ ] Search bar filters products in real-time
- [ ] Search is case-insensitive
- [ ] Search checks both name and description
- [ ] Category checkboxes filter correctly
- [ ] Multiple categories can be selected
- [ ] Price range filter works
- [ ] Min and max price inputs work
- [ ] All filters work together
- [ ] Product count updates correctly
- [ ] Clear filters button resets everything
- [ ] "No results" shows when appropriate
- [ ] Filters are responsive on mobile
- [ ] No console errors

---

## 🎨 Understanding the Code

### Array Filter Method

```javascript
const filtered = products.filter((product) => {
  // Return true to keep, false to remove
  return product.attributes.name.includes(searchTerm);
});
```

### Multiple Conditions

```javascript
return matchesSearch && matchesCategory && matchesPrice;
// All three must be true to include product
```

### Unique Categories

```javascript
const categories = [...new Set(products.map(p => p.attributes.category))];
// 1. Map to get all categories
// 2. Set removes duplicates
// 3. Spread [...] converts back to array
```

### Checkbox State

```javascript
const handleToggle = (category) => {
  if (selected.includes(category)) {
    // Remove it
    setSelected(selected.filter(c => c !== category));
  } else {
    // Add it
    setSelected([...selected, category]);
  }
};
```

---

## 🏠 Homework

Before Day 8, complete these tasks:

1. **Add sort options**
   - Price: Low to High
   - Price: High to Low
   - Name: A-Z
   - Create dropdown selector

2. **Add "In Stock Only" checkbox**
   - Filter out products where inStock is false
   - Add to FilterSidebar

3. **Create a "Popular" or "Featured" filter**
   - Add a featured field in Strapi
   - Filter by featured products

4. **Make filters collapsible on mobile**
   - Add toggle button
   - Hide/show filters on small screens

Example sort implementation:

```javascript
const [sortBy, setSortBy] = useState('name-asc');

const sortedProducts = [...filteredProducts].sort((a, b) => {
  if (sortBy === 'price-asc') {
    return a.attributes.price - b.attributes.price;
  }
  if (sortBy === 'price-desc') {
    return b.attributes.price - a.attributes.price;
  }
  if (sortBy === 'name-asc') {
    return a.attributes.name.localeCompare(b.attributes.name);
  }
  return 0;
});
```

---

## 🐛 Common Errors & Solutions

### Error: Search not working
**Solution:**
- Check searchTerm state is updating
- Verify toLowerCase() is used
- Make sure includes() is spelled correctly
- Console.log searchTerm to debug

### Error: Categories not showing
**Solution:**
- Check products have category field
- Verify Set is removing duplicates correctly
- Make sure filter(Boolean) removes null/undefined
- Console.log categories array

### Error: Checkboxes don't update
**Solution:**
- Check onChange handler is attached
- Verify state is updating
- Make sure checked prop uses selectedCategories
- Look for console errors

### Error: Price filter not working
**Solution:**
- Check priceRange state is updating
- Verify Number() is converting strings to numbers
- Make sure >= and <= comparisons are correct
- Check min/max values are reasonable

### Error: Filters reset when typing
**Solution:**
- Make sure you're not recreating state on each render
- Check useState is at component level
- Verify you're not calling setProducts unnecessarily

---

## 📚 What You Learned Today

- ✅ Array filter() method
- ✅ Array map() method
- ✅ Set for unique values
- ✅ String methods (toLowerCase, includes)
- ✅ Controlled inputs in React
- ✅ Multiple state variables
- ✅ Combining multiple filters
- ✅ Real-time filtering
- ✅ Checkbox handling
- ✅ Number inputs

---

## 💡 Key Concepts

### Controlled Components

```javascript
// Input value comes from state
<input
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
```

The input is "controlled" by React state.

### Filter Chaining

```javascript
products
  .filter(matchesSearch)
  .filter(matchesCategory)
  .filter(matchesPrice)
```

Or combine in one filter:

```javascript
products.filter(p => 
  matchesSearch && matchesCategory && matchesPrice
)
```

### Derived State

```javascript
// Don't store filtered products in state
// Calculate them from existing state
const filteredProducts = products.filter(...);
```

This is "derived state" - calculated from other state.

---

## 🎉 Congratulations!

You've completed Day 7! Your e-commerce site now has powerful search and filter functionality. Users can easily find exactly what they're looking for!

**Tomorrow:** We'll create the checkout page with forms and validation!

---

## 📖 Additional Reading (Optional)

- [Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
- [Array.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
- [Set Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [Controlled Components](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable)

---

[← Day 6: Shopping Cart](./day-06-shopping-cart.md) | [Back to Overview](./README.md) | [Day 8: Checkout →](./day-08-checkout.md)
