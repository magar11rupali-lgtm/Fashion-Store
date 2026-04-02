# Troubleshooting Guide

Common errors and solutions for the Fashion E-Commerce project.

## 🔧 Installation Issues

### Error: "node is not recognized"

**Problem:** Node.js is not installed or not in PATH

**Solution:**
1. Download Node.js from [nodejs.org](https://nodejs.org)
2. Install with default settings
3. Restart your terminal/command prompt
4. Run `node --version` to verify

---

### Error: "npm install" fails

**Problem:** Network issues or permission errors

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try installing again
npm install

# If permission error on Mac/Linux:
sudo npm install
```

---

### Error: "Port 3000 already in use"

**Problem:** Another application is using port 3000

**Solution:**
```bash
# Find and kill the process
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill

# Or use a different port:
npm run dev -- -p 3001
```

---

## 🖼️ Image Issues

### Error: Images not loading

**Problem:** Next.js image configuration or wrong URL

**Solution:**

1. **Check next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
    ],
  },
}

module.exports = nextConfig
```

2. **Restart dev server** after changing config

3. **Check image URL:**
```javascript
// Correct:
const imageUrl = `http://localhost:1337${image.data.attributes.url}`;

// Wrong:
const imageUrl = image.data.attributes.url; // Missing base URL
```

---

### Error: "Invalid src prop"

**Problem:** Image URL is undefined or malformed

**Solution:**
```javascript
// Add fallback
const imageUrl = image?.data?.attributes?.url 
  ? `http://localhost:1337${image.data.attributes.url}`
  : '/placeholder.jpg';
```

---

## 🔌 API Issues

### Error: "Failed to fetch products"

**Problem:** Strapi not running or API permissions not set

**Solution:**

1. **Check Strapi is running:**
```bash
cd backend
npm run develop
```

2. **Check API permissions:**
   - Go to Strapi admin: `http://localhost:1337/admin`
   - Settings → Roles → Public
   - Enable `find` and `findOne` for Product
   - Save

3. **Check products are published:**
   - Content Manager → Product
   - Make sure products are "Published" not "Draft"

---

### Error: "CORS policy" error

**Problem:** Cross-Origin Resource Sharing blocked

**Solution:**

Strapi should allow localhost by default. If not:

1. Open `backend/config/middlewares.js`
2. Update CORS settings:
```javascript
module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'http:', 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'http://localhost:1337'],
          'media-src': ["'self'", 'data:', 'blob:', 'http://localhost:1337'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  // ... rest of middlewares
];
```

---

### Error: API returns empty array

**Problem:** No products or products not published

**Solution:**
1. Check products exist in Strapi
2. Check products are Published
3. Check API URL is correct
4. Test API directly: `http://localhost:1337/api/products`

---

## ⚛️ React/Next.js Issues

### Error: "Cannot find module '@/components/Header'"

**Problem:** File doesn't exist or wrong path

**Solution:**
1. Check file exists: `frontend/components/Header.jsx`
2. Check file name is exact (case-sensitive)
3. Check you saved the file
4. Restart dev server

---

### Error: "Unexpected token '<'"

**Problem:** Wrong file extension or syntax error

**Solution:**
1. Make sure file is `.jsx` not `.js` (if using JSX)
2. Check for syntax errors
3. Make sure you're using `export default`

---

### Error: "useCart must be used within CartProvider"

**Problem:** Component not wrapped in CartProvider

**Solution:**

Check `app/layout.js`:
```javascript
import { CartProvider } from '@/context/CartContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
```

---

### Error: "localStorage is not defined"

**Problem:** Accessing localStorage on server-side

**Solution:**

Use `useEffect`:
```javascript
'use client';

useEffect(() => {
  // Safe to use localStorage here
  const cart = localStorage.getItem('cart');
}, []);
```

Make sure component has `'use client'` directive.

---

### Error: Hydration error

**Problem:** Server and client render differently

**Solution:**
1. Don't use `Date.now()` or `Math.random()` in render
2. Use `useEffect` for client-only code
3. Make sure data is consistent
4. Check for conditional rendering based on window/document

---

## 🛒 Shopping Cart Issues

### Error: Cart items disappear on refresh

**Problem:** localStorage not saving

**Solution:**

Check CartContext has:
```javascript
useEffect(() => {
  localStorage.setItem('cart', JSON.stringify(cart));
}, [cart]);
```

Check browser allows localStorage:
- Open DevTools → Application → Local Storage
- Check if data is saved

---

### Error: Cart count doesn't update

**Problem:** State not updating or component not re-rendering

**Solution:**
1. Make sure Header has `'use client'`
2. Check useCart is called
3. Verify addToCart updates state
4. Check for console errors

**Detailed debugging steps:**
```javascript
// In Header.jsx, add console.log
'use client';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { totalItems } = useCart();
  console.log('Header totalItems:', totalItems); // Debug log
  
  return (
    // ... rest of component
  );
}
```

If you see the log but count doesn't update:
- Check cart icon code has `{totalItems}` 
- Verify no CSS hiding the badge
- Check if badge has proper conditional rendering

---

### Error: Can't add to cart

**Problem:** Event handler not working

**Solution:**
1. Check onClick is attached to button
2. Verify function is defined
3. Check for console errors
4. Make sure component has `'use client'`

**Step-by-step debugging:**

```javascript
// In ProductActions.jsx
const handleAddToCart = () => {
  console.log('Button clicked!'); // 1. Does this log?
  console.log('Product:', product); // 2. Is product defined?
  console.log('Quantity:', quantity); // 3. Is quantity defined?
  
  if (inStock) {
    console.log('Adding to cart...'); // 4. Does this log?
    addToCart(product, quantity, selectedSize);
    console.log('Added successfully!'); // 5. Does this log?
  } else {
    console.log('Product is out of stock'); // 6. Are we hitting this?
  }
};
```

Common issues:
- If #1 doesn't log: onClick not attached or button disabled
- If #2 shows undefined: product prop not passed correctly
- If #4 doesn't log: inStock is false
- If #5 doesn't log: error in addToCart function

---

### Error: Items added with wrong quantity

**Problem:** Quantity state not being read correctly

**Solution:**

Check your ProductActions component:
```javascript
const [quantity, setQuantity] = useState(1);

const handleAddToCart = () => {
  console.log('Adding with quantity:', quantity); // Debug
  addToCart(product, quantity, selectedSize); // Make sure passing quantity
};
```

Verify the + and - buttons update state:
```javascript
const increaseQuantity = () => {
  setQuantity((prev) => {
    const newQty = prev + 1;
    console.log('New quantity:', newQty); // Debug
    return newQty;
  });
};
```

---

### Error: Same product with different sizes creates separate items

**Problem:** This is actually **correct behavior**! Different sizes should be separate cart items.

**Expected:**
- T-Shirt (Size M) - 2 items
- T-Shirt (Size L) - 1 item

If you want to combine them (not recommended):
```javascript
// In CartContext.js, change the existing item check
const existingItem = prevCart.find(
  (item) => item.id === product.id // Remove: && item.size === size
);
```

---

### Error: Cart total price is incorrect

**Problem:** Price calculation or data type issues

**Solution:**

1. **Check price is a number:**
```javascript
// In CartContext.js
const addToCart = (product, quantity = 1, size = 'M') => {
  const price = Number(product.attributes.price); // Ensure it's a number
  console.log('Price:', price, typeof price); // Should be "number"
  
  // ... rest of function
};
```

2. **Verify total calculation:**
```javascript
const totalPrice = cart.reduce(
  (sum, item) => {
    console.log(`Item: ${item.name}, Price: ${item.price}, Qty: ${item.quantity}`);
    return sum + (item.price * item.quantity);
  },
  0
);
console.log('Total Price:', totalPrice);
```

3. **Check for NaN:**
```javascript
// If you see NaN in total
console.log('Cart items:', cart);
// Look for items with price: NaN or price: "string"
```

---

### Error: Cart sidebar doesn't open

**Problem:** State management or z-index issues

**Solution:**

1. **Check isOpen state:**
```javascript
// In Header.jsx
const { setIsOpen } = useCart();

<button
  onClick={() => {
    console.log('Cart button clicked'); // Debug
    setIsOpen(true);
  }}
>
```

2. **Check Cart component:**
```javascript
// In Cart.jsx
export default function Cart() {
  const { isOpen } = useCart();
  console.log('Cart isOpen:', isOpen); // Debug
  
  if (!isOpen) return null; // Make sure this is present
  
  return (/* ... cart sidebar ... */);
}
```

3. **Check z-index and positioning:**
```jsx
// Cart should have high z-index
<div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-xl z-50">
```

4. **Verify Cart is rendered:**
```jsx
// In Header.jsx, make sure you have:
return (
  <>
    <header>...</header>
    <Cart /> {/* Must be here! */}
  </>
);
```

---

### Error: Remove from cart doesn't work

**Problem:** Filter function not matching item correctly

**Solution:**

```javascript
// In CartContext.js
const removeFromCart = (id, size) => {
  console.log('Removing:', id, size); // Debug
  
  setCart((prevCart) => {
    console.log('Before remove:', prevCart); // Debug
    const newCart = prevCart.filter((item) => {
      const shouldKeep = !(item.id === id && item.size === size);
      console.log(`Item ${item.id}-${item.size}: keep=${shouldKeep}`);
      return shouldKeep;
    });
    console.log('After remove:', newCart); // Debug
    return newCart;
  });
};
```

Check the remove button passes correct parameters:
```jsx
<button
  onClick={() => {
    console.log('Removing item:', item.id, item.size);
    removeFromCart(item.id, item.size);
  }}
>
  Remove
</button>
```

---

## 🔍 Search \u0026 Filter Issues

### Error: Search not working at all

**Problem:** State not updating or filter logic broken

**Solution:**

1. **Check search state updates:**
```javascript
// In products page
const [searchTerm, setSearchTerm] = useState('');

// In SearchBar component
<input
  value={searchTerm}
  onChange={(e) => {
    console.log('Search term:', e.target.value); // Debug
    onSearchChange(e.target.value);
  }}
/>
```

2. **Verify filter logic:**
```javascript
const filteredProducts = products.filter((product) => {
  const name = product.attributes.name;
  const description = product.attributes.description;
  
  console.log('Checking:', name); // Debug
  console.log('Search term:', searchTerm);
  console.log('Includes?', name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const matchesSearch =
    name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    description.toLowerCase().includes(searchTerm.toLowerCase());
    
  return matchesSearch;
});

console.log('Filtered products:', filteredProducts.length); // Debug
```

3. **Common issues:**
- Products page not a client component (missing `'use client'`)
- SearchBar not receiving correct props
- Filter running before products load (check loading state)

---

### Error: Search is case-sensitive

**Problem:** Not using toLowerCase()

**Solution:**
```javascript
// ❌ Wrong
const matchesSearch = name.includes(searchTerm);

// ✅ Correct
const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
```

---

### Error: Category filter checkboxes don't respond

**Problem:** State not updating or onChange not connected

**Solution:**

1. **Check state updates:**
```javascript
const [selectedCategories, setSelectedCategories] = useState([]);

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
```

2. **Verify checkbox is controlled:**
```jsx
<input
  type="checkbox"
  checked={selectedCategories.includes(category)}
  onChange={() => {
    console.log('Checkbox clicked:', category);
    handleCategoryToggle(category);
  }}
/>
```

3. **Check if categories are generated correctly:**
```javascript
const categories = [...new Set(products.map((p) => p.attributes.category))].filter(Boolean);
console.log('Available categories:', categories);
```

---

### Error: Price range filter not working

**Problem:** Number conversion or comparison issues

**Solution:**

1. **Ensure values are numbers:**
```javascript
const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

// In input handler
onChange={(e) => {
  const value = Number(e.target.value); // Convert to number!
  console.log('New min price:', value, typeof value);
  setPriceRange({ ...priceRange, min: value });
}}
```

2. **Check filter logic:**
```javascript
const matchesPrice = price >= priceRange.min && price <= priceRange.max;
console.log(`Price ${price} between ${priceRange.min}-${priceRange.max}? ${matchesPrice}`);
```

3. **Verify product prices are numbers:**
```javascript
products.forEach(p => {
  console.log(`${p.attributes.name}: ${p.attributes.price} (${typeof p.attributes.price})`);
});
```

---

### Error: Filters not working together

**Problem:** Logical operator error (AND vs OR)

**Solution:**

```javascript
const filteredProducts = products.filter((product) => {
  const matchesSearch = /* ... */;
  const matchesCategory = /* ... */;
  const matchesPrice = /* ... */;
  
  // Debug each filter
  console.log(`Product: ${product.attributes.name}`);
  console.log(`  Search: ${matchesSearch}`);
  console.log(`  Category: ${matchesCategory}`);
  console.log(`  Price: ${matchesPrice}`);
  
  // ALL must be true (AND)
  const result = matchesSearch && matchesCategory && matchesPrice;
  console.log(`  Final: ${result}`);
  
  return result;
});
```

**Common mistake:**
```javascript
// ❌ Wrong - uses OR, shows too many products
return matchesSearch || matchesCategory || matchesPrice;

// ✅ Correct - uses AND, shows only matching products
return matchesSearch && matchesCategory && matchesPrice;
```

---

### Error: No products showing when filters are active

**Problem:** Filters too restrictive or no products match

**Solution:**

1. **Check each filter individually:**
```javascript
console.log('Total products:', products.length);
console.log('After search:', products.filter(matchesSearch).length);
console.log('After category:', products.filter(matchesCategory).length);
console.log('After price:', products.filter(matchesPrice).length);
console.log('After all:', filteredProducts.length);
```

2. **Verify filter values:**
```javascript
console.log('Search term:', searchTerm);
console.log('Selected categories:', selectedCategories);
console.log('Price range:', priceRange);
```

3. **Add "No results" handling:**
```jsx
{filteredProducts.length === 0 ? (
  <div className="text-center py-12">
    <p>No products found. Try adjusting your filters.</p>
    <button onClick={clearAllFilters}>Clear Filters</button>
  </div>
) : (
  // ... show products
)}
```

---

### Error: Filters reset when typing in search

**Problem:** Component re-mounting or state in wrong place

**Solution:**

1. **Make sure state is at page level, not in child components:**
```javascript
// ✅ Correct - in ProductsPage
export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  return (
    <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
    <FilterSidebar selectedCategories={selectedCategories} ... />
  );
}

// ❌ Wrong - state in child component
export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState(''); // Don't do this
}
```

2. **Check for key prop that might cause re-mount:**
```jsx
// ❌ Wrong - changing key causes re-mount
<FilterSidebar key={searchTerm} ... />

// ✅ Correct - stable key or no key
<FilterSidebar ... />
```

---

### Error: Clear filters button doesn't work

**Problem:** Not resetting all states

**Solution:**

```javascript
const clearFilters = () => {
  console.log('Clearing filters...'); // Debug
  
  setSearchTerm('');
  setSelectedCategories([]);
  setPriceRange({ min: 0, max: 1000 });
  
  console.log('Filters cleared!');
  
  // Verify they're cleared
  setTimeout(() => {
    console.log('Search term:', searchTerm);
    console.log('Categories:', selectedCategories);
    console.log('Price:', priceRange);
  }, 100);
};
```

Make sure to pass the function correctly:
```jsx
<button onClick={clearFilters}>Clear All</button>
// NOT onClick={clearFilters()} - this calls it immediately!
```

---

## 📝 Form Issues

### Error: Form validation not working

**Problem:** Validation logic or state issues

**Solution:**

1. **Check validation function:**
```javascript
const validateForm = () => {
  const newErrors = {};
  
  if (!formData.email) {
    newErrors.email = 'Email is required';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

2. **Call validation on submit:**
```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return; // Stop if invalid
  }
  
  // Process form
};
```

---

### Error: Form submits even with errors

**Problem:** Not preventing default or not checking validation

**Solution:**
```javascript
const handleSubmit = (e) => {
  e.preventDefault(); // Important!
  
  if (!validateForm()) {
    return; // Stop here if invalid
  }
  
  // Continue with submission
};
```

---

## 🎨 Styling Issues

### Error: Tailwind classes not working

**Problem:** Tailwind not configured or dev server not restarted

**Solution:**
1. Check `tailwind.config.js` exists
2. Check `globals.css` has Tailwind directives:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
3. Restart dev server
4. Clear browser cache

---

### Error: Custom animations not working

**Problem:** Config not updated or syntax error

**Solution:**

1. **Check tailwind.config.js:**
```javascript
theme: {
  extend: {
    animation: {
      'fadeIn': 'fadeIn 0.5s ease-in-out',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
    },
  },
}
```

2. **Restart dev server**

---

## 🚀 Deployment Issues

### Error: Build fails on Vercel

**Problem:** Build errors or missing dependencies

**Solution:**

1. **Test build locally:**
```bash
npm run build
```

2. **Check for errors in output**

3. **Common fixes:**
   - Add missing dependencies
   - Fix TypeScript errors
   - Remove console.log statements
   - Check environment variables

---

### Error: "Application error" after deployment

**Problem:** Runtime error in production

**Solution:**

1. **Check Vercel logs:**
   - Go to Vercel dashboard
   - Click on deployment
   - View "Functions" logs

2. **Common issues:**
   - Missing environment variables
   - API URL not updated
   - CORS issues
   - Database connection

---

### Error: Images not loading in production

**Problem:** Wrong API URL or CORS

**Solution:**

1. **Update environment variable:**
```
NEXT_PUBLIC_API_URL=https://your-api.railway.app/api
```

2. **Redeploy**

3. **Check Strapi CORS allows your Vercel domain**

---

## 🔍 Debugging Tips

### How to debug effectively:

1. **Check Browser Console (F12)**
   - Look for red errors
   - Read error messages carefully
   - Check Network tab for failed requests

2. **Use console.log**
```javascript
console.log('Product:', product);
console.log('Cart:', cart);
```

3. **Check React DevTools**
   - Install React DevTools extension
   - Inspect component state
   - Check props being passed

4. **Check Network Tab**
   - See all API requests
   - Check request/response
   - Look for 404 or 500 errors

5. **Simplify the problem**
   - Comment out code
   - Test one thing at a time
   - Isolate the issue

---

## 🆘 Still Stuck?

If you're still having issues:

1. **Read the error message carefully**
   - It usually tells you what's wrong
   - Google the exact error message

2. **Check the tutorial steps**
   - Did you skip a step?
   - Did you save all files?
   - Did you restart the server?

3. **Ask for help**
   - Use the AI prompts in each day's tutorial
   - Ask your teacher or classmates
   - Search on Stack Overflow

4. **Take a break**
   - Sometimes stepping away helps
   - Come back with fresh eyes
   - Don't get frustrated!

---

## 📚 Helpful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Strapi Documentation](https://docs.strapi.io)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MDN Web Docs](https://developer.mozilla.org)
- [Stack Overflow](https://stackoverflow.com)

---

**Remember: Every developer encounters errors. Debugging is a skill you'll get better at with practice!** 🚀
