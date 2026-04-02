# Day 4: Connecting Frontend to Backend (API Integration)

## 🎯 Learning Objectives

By the end of today, you will:
- Understand APIs and how they work
- Learn to fetch data from Strapi
- Display products on your website
- Handle loading states and errors

## ⏱️ Estimated Time: 4-5 hours

---

## 📝 Tasks & Subtasks

### Task 4.1: Learn About APIs

**Subtask 4.1.1: Understand what REST APIs are**

Think of an API like a restaurant:
- **Frontend (You)**: The customer who orders food
- **API (Waiter)**: Takes your order to the kitchen
- **Backend (Kitchen)**: Prepares the food (data)
- **Response**: Waiter brings food back to you

**Subtask 4.1.2: Test Strapi API in browser**

1. Make sure Strapi is running: `cd backend && npm run develop`
2. Open browser to: `http://localhost:1337/api/products?populate=*`
3. You should see JSON data with your products!

**Subtask 4.1.3: Learn about fetch() function**

`fetch()` is how JavaScript gets data from APIs:
```javascript
fetch('http://localhost:1337/api/products')
  .then(response => response.json())
  .then(data => console.log(data))
```

**Subtask 4.1.4: Understand async/await**

A cleaner way to write fetch:
```javascript
async function getProducts() {
  const response = await fetch('http://localhost:1337/api/products');
  const data = await response.json();
  return data;
}
```

---

### Task 4.2: Create API Service

**Subtask 4.2.1: Create `lib` folder**

```bash
cd frontend
mkdir lib
```

**Subtask 4.2.2: Create `api.js` file**

Create `frontend/lib/api.js`:

```javascript
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
```

**Subtask 4.2.3-4.2.5: Functions created above**
- ✅ getAllProducts() - Gets all products
- ✅ getProductById() - Gets single product
- ✅ Error handling with try-catch

---

### Task 4.3: Create Products Page

**Subtask 4.3.1: Create products page**

Create `frontend/app/products/page.js`:

```javascript
import { getAllProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <Header />
      <main className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Our Products
        </h1>
        
        {products.length === 0 ? (
          <p className="text-gray-600 text-center py-12">
            No products found. Add some products in Strapi!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
```

**Subtask 4.3.2: Fetch products** - ✅ Done with getAllProducts()

**Subtask 4.3.3: Create ProductCard component**

Create `frontend/components/ProductCard.jsx`:

```jsx
import Image from 'next/image';

export default function ProductCard({ product }) {
  const { name, description, price, category, image, inStock } = product.attributes;
  
  const imageUrl = image?.data?.attributes?.url 
    ? `http://localhost:1337${image.data.attributes.url}`
    : '/placeholder.jpg';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-64 bg-gray-200">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {!inStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Out of Stock
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="mb-2">
          <span className="text-xs font-semibold text-blue-600 uppercase">
            {category}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            ${price.toFixed(2)}
          </span>
          
          <button 
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              inStock 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!inStock}
          >
            {inStock ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Subtask 4.3.4: Grid layout** - ✅ Done with `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

**Subtask 4.3.5: Loading state**

Next.js 14 handles this automatically with Server Components, but we can add a loading.js:

Create `frontend/app/products/loading.js`:

```jsx
export default function Loading() {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200"></div>
              <div className="p-6 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="flex justify-between">
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

### Task 4.4: Style Product Cards

All styling is already done in the ProductCard component above! ✅

Key features:
- Product image with Next.js Image optimization
- Name, price, and category display
- "Add to Cart" button (we'll make it functional tomorrow)
- Responsive design
- "Out of Stock" badge
- Hover effects

---

## 🤖 AI Prompts for Students

When you get stuck, try asking:

```
"Explain what an API is using a restaurant analogy"

"How do I fetch data from Strapi in Next.js?"

"Show me a simple fetch example with async/await"

"How do I display a loading spinner while data is loading?"

"Help me fix: CORS error when calling Strapi API"

"How do I make a grid of product cards responsive in Tailwind?"

"Why is my image not showing from Strapi?"

"What does populate=* mean in Strapi API?"
```

---

## 📖 Tutorial Steps

### Step 1: Make Sure Both Servers Are Running

**Terminal 1 - Backend:**
```bash
cd backend
npm run develop
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 2: Create API Service

1. Create `lib` folder in `frontend`
2. Create `api.js` file
3. Copy the API service code
4. Save the file

### Step 3: Create Products Page

1. Create `products` folder in `app`
2. Create `page.js` inside it
3. Copy the products page code
4. Save the file

### Step 4: Create ProductCard Component

1. Create `ProductCard.jsx` in `components`
2. Copy the ProductCard code
3. Save the file

### Step 5: Create Loading Component

1. Create `loading.js` in `app/products`
2. Copy the loading code
3. Save the file

### Step 6: Test Your Products Page

1. Go to `http://localhost:3000/products`
2. You should see all your products!
3. Check that images load
4. Check that prices display correctly

---

## ✅ Testing & Validation

Check that everything works:

- [ ] Both servers are running (frontend and backend)
- [ ] Products page loads without errors
- [ ] All products from Strapi are displayed
- [ ] Product images show correctly
- [ ] Product names are displayed
- [ ] Prices are formatted with $ and 2 decimals
- [ ] Categories are shown
- [ ] "Out of Stock" badge shows for unavailable items
- [ ] Grid is responsive (test by resizing browser)
- [ ] Loading state appears briefly when page loads
- [ ] No console errors (Press F12 to check)
- [ ] Hover effects work on product cards

### Test Checklist

Open browser console (F12) and check:
- No red errors
- Network tab shows successful API calls
- Images load (check Network tab)

---

## 🎨 Understanding the Code

### API Service Pattern

```javascript
// Define base URL once
const API_URL = 'http://localhost:1337/api';

// Reusable function
export async function getAllProducts() {
  // Try to fetch
  try {
    const response = await fetch(`${API_URL}/products?populate=*`);
    // Check if successful
    if (!response.ok) throw new Error('Failed');
    // Convert to JSON
    const data = await response.json();
    // Return just the data array
    return data.data;
  } catch (error) {
    // Handle errors gracefully
    console.error(error);
    return [];
  }
}
```

### Why `populate=*`?

Strapi doesn't include images by default. `populate=*` tells Strapi to include all related data (like images).

### Next.js Image Component

```jsx
<Image
  src={imageUrl}
  alt={name}
  fill
  className="object-cover"
/>
```

Benefits:
- Automatic optimization
- Lazy loading
- Responsive images
- Better performance

---

## 🏠 Homework

Before Day 5, complete these tasks:

1. **Add a search bar above products** (just UI, no functionality yet)
   - Create a search input
   - Style it nicely
   - Place it above the product grid

2. **Create a "Featured Products" section on homepage**
   - Show 3 random products
   - Add to `app/page.js`
   - Reuse ProductCard component

3. **Add hover effects to product cards**
   - Already done! But try customizing:
   - Change shadow on hover
   - Add scale effect: `hover:scale-105`
   - Add border color change

4. **Handle missing images**
   - Create a placeholder image
   - Save it as `frontend/public/placeholder.jpg`
   - Update ProductCard to use it when no image exists

---

## 🐛 Common Errors & Solutions

### Error: "Failed to fetch products"
**Solution:**
- Make sure Strapi is running on port 1337
- Check API permissions in Strapi (Settings → Roles → Public)
- Verify products are published (not draft)

### Error: Images not showing
**Solution:**
- Check image URL in browser console
- Make sure URL starts with `http://localhost:1337`
- Verify image was uploaded to Strapi
- Check Next.js config allows localhost images

Add to `frontend/next.config.js`:
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

### Error: "CORS policy" error
**Solution:**
Strapi should allow localhost by default. If you see this:
1. Check `backend/config/middlewares.js`
2. Make sure CORS is configured for localhost:3000

### Error: Products show but no data
**Solution:**
- Check that you're accessing `product.attributes.name` (not `product.name`)
- Strapi wraps data in `attributes` object
- Console.log the product to see structure

### Error: Page is blank
**Solution:**
- Check browser console for errors
- Make sure you're using `export default async function`
- Verify imports are correct
- Check that Strapi has published products

---

## 📚 What You Learned Today

- ✅ How APIs work (request → response)
- ✅ How to fetch data with async/await
- ✅ How to create reusable API service functions
- ✅ How to display data from an API
- ✅ How to handle loading states
- ✅ How to handle errors gracefully
- ✅ How to use Next.js Image component
- ✅ How to create responsive grid layouts
- ✅ How to pass data via props

---

## 💡 Key Concepts

### Async/Await
Makes asynchronous code look synchronous:
```javascript
// Instead of this (callback hell):
fetch(url).then(res => res.json()).then(data => console.log(data))

// We write this (clean):
const res = await fetch(url);
const data = await res.json();
console.log(data);
```

### Server Components (Next.js 14)
In Next.js 14, components are Server Components by default:
- Fetch data on the server
- No loading spinners needed (handled automatically)
- Better performance
- SEO-friendly

### Props
Passing data to components:
```jsx
// Parent passes data
<ProductCard product={productData} />

// Child receives data
function ProductCard({ product }) {
  // Use product.attributes.name
}
```

---

## 🎉 Congratulations!

You've completed Day 4! Your frontend is now connected to your backend, and you're displaying real products from your database. This is a huge milestone!

**Tomorrow:** We'll create individual product detail pages with dynamic routing!

---

## 📖 Additional Reading (Optional)

- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Async/Await](https://javascript.info/async-await)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Strapi REST API](https://docs.strapi.io/dev-docs/api/rest)

---

[← Day 3: Strapi Backend](./day-03-strapi.md) | [Back to Overview](./README.md) | [Day 5: Product Details →](./day-05-product-details.md)
