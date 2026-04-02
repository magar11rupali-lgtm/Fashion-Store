# Quick Reference Guide

A quick reference for common tasks and code snippets.

## 🚀 Getting Started

### Start Development Servers

```bash
# Terminal 1 - Backend (Strapi)
cd backend
npm run develop

# Terminal 2 - Frontend (Next.js)
cd frontend
npm run dev
```

### Access Applications

- **Frontend:** http://localhost:3000
- **Backend Admin:** http://localhost:1337/admin
- **API:** http://localhost:1337/api

---

## 📁 Project Structure

```
fashion-store/
├── frontend/               # Next.js application
│   ├── app/               # App router pages
│   │   ├── page.js        # Homepage
│   │   ├── products/      # Products pages
│   │   ├── checkout/      # Checkout page
│   │   └── layout.js      # Root layout
│   ├── components/        # React components
│   ├── context/           # Context providers
│   ├── lib/               # Utilities (API calls)
│   └── public/            # Static files
└── backend/               # Strapi CMS
    ├── src/               # Source code
    ├── config/            # Configuration
    └── public/            # Uploads
```

---

## ⚛️ React Basics

### Creating a Component

```jsx
export default function ComponentName() {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
}
```

### Using State

```jsx
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

### Using Effect

```jsx
'use client';

import { useEffect } from 'react';

export default function Component() {
  useEffect(() => {
    // Runs after component mounts
    console.log('Component mounted');
    
    // Cleanup function
    return () => {
      console.log('Component unmounted');
    };
  }, []); // Empty array = run once

  return <div>Component</div>;
}
```

---

## 🔗 Next.js Routing

### Creating Pages

```
app/
  page.js              → /
  about/
    page.js            → /about
  products/
    page.js            → /products
    [id]/
      page.js          → /products/:id
```

### Link Component

```jsx
import Link from 'next/link';

<Link href="/products">Shop Now</Link>
<Link href={`/products/${id}`}>View Product</Link>
```

### Navigation Hook

```jsx
'use client';

import { useRouter } from 'next/navigation';

export default function Component() {
  const router = useRouter();
  
  const handleClick = () => {
    router.push('/products');
  };
  
  return <button onClick={handleClick}>Go to Products</button>;
}
```

---

## 🎨 Tailwind CSS

### Common Classes

```jsx
// Layout
<div className="container mx-auto px-6 py-12">

// Flexbox
<div className="flex justify-between items-center">

// Grid
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">

// Spacing
<div className="p-4 m-4">        // Padding & margin
<div className="px-6 py-4">      // Horizontal & vertical

// Colors
<div className="bg-blue-600 text-white">

// Typography
<h1 className="text-4xl font-bold text-gray-900">

// Borders & Shadows
<div className="border rounded-lg shadow-md">

// Hover Effects
<button className="hover:bg-blue-700 transition-colors">
```

### Responsive Design

```jsx
// Mobile first approach
<div className="text-sm md:text-base lg:text-lg">
  // Small on mobile, medium on tablet, large on desktop
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  // 1 column mobile, 2 tablet, 3 desktop
</div>
```

---

## 🔌 API Calls

### Fetch Data

```javascript
// lib/api.js
const API_URL = 'http://localhost:1337/api';

export async function getAllProducts() {
  try {
    const response = await fetch(`${API_URL}/products?populate=*`);
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

export async function getProductById(id) {
  try {
    const response = await fetch(`${API_URL}/products/${id}?populate=*`);
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
```

### Using in Component

```jsx
// Server Component (default)
export default async function Page() {
  const products = await getAllProducts();
  
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.attributes.name}</div>
      ))}
    </div>
  );
}

// Client Component
'use client';

import { useState, useEffect } from 'react';

export default function Page() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    async function fetchData() {
      const data = await getAllProducts();
      setProducts(data);
    }
    fetchData();
  }, []);
  
  return <div>{/* render products */}</div>;
}
```

---

## 🛒 Context API

### Create Context

```javascript
// context/CartContext.js
'use client';

import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  
  const addToCart = (item) => {
    setCart([...cart, item]);
  };
  
  const value = { cart, addToCart };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
```

### Use Context

```jsx
// In layout.js
import { CartProvider } from '@/context/CartContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

// In any component
'use client';

import { useCart } from '@/context/CartContext';

export default function Component() {
  const { cart, addToCart } = useCart();
  
  return <button onClick={() => addToCart(item)}>Add</button>;
}
```

---

## 📝 Forms

### Controlled Form

```jsx
'use client';

import { useState } from 'react';

export default function Form() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.includes('@')) {
      newErrors.email = 'Invalid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    console.log('Form submitted:', formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
      />
      {errors.name && <p>{errors.name}</p>}
      
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
      />
      {errors.email && <p>{errors.email}</p>}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## 🖼️ Images

### Next.js Image Component

```jsx
import Image from 'next/image';

// With fill (for unknown dimensions)
<div className="relative h-64">
  <Image
    src="/image.jpg"
    alt="Description"
    fill
    className="object-cover"
  />
</div>

// With fixed dimensions
<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
/>

// From Strapi
<Image
  src={`http://localhost:1337${imageUrl}`}
  alt="Product"
  fill
  className="object-cover"
/>
```

---

## 🎯 Array Methods

### Map

```javascript
const products = [{ id: 1, name: 'Shirt' }, { id: 2, name: 'Pants' }];

products.map(product => (
  <div key={product.id}>{product.name}</div>
))
```

### Filter

```javascript
const filtered = products.filter(product => 
  product.price < 50
);
```

### Find

```javascript
const product = products.find(p => p.id === 1);
```

### Reduce

```javascript
const total = cart.reduce((sum, item) => 
  sum + (item.price * item.quantity), 0
);
```

---

## 🔧 Common Commands

### npm Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Install a package
npm install package-name

# Uninstall a package
npm uninstall package-name
```

### Git Commands

```bash
# Initialize repository
git init

# Add files
git add .

# Commit changes
git commit -m "Message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull

# Check status
git status
```

---

## 🐛 Debugging

### Console Methods

```javascript
console.log('Value:', value);
console.error('Error:', error);
console.table(array);
console.dir(object);
```

### React DevTools

1. Install React DevTools extension
2. Open DevTools (F12)
3. Go to "Components" tab
4. Inspect component state and props

### Network Tab

1. Open DevTools (F12)
2. Go to "Network" tab
3. See all API requests
4. Check request/response

---

## 📦 Environment Variables

### Create .env.local

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:1337/api
```

### Use in Code

```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL;
```

**Note:** Restart dev server after changing .env files!

---

## 🚀 Deployment

### Build for Production

```bash
cd frontend
npm run build
npm run start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## 💡 Quick Tips

1. **Always use `'use client'`** for components with hooks or events
2. **Restart dev server** after config changes
3. **Check console** for errors (F12)
4. **Use TypeScript** for better autocomplete (optional)
5. **Test on mobile** using DevTools device toolbar
6. **Save often** - Ctrl+S or Cmd+S
7. **Read error messages** - they usually tell you what's wrong
8. **Google errors** - someone has probably solved it
9. **Take breaks** - fresh eyes catch bugs
10. **Have fun** - enjoy building!

---

**Bookmark this page for quick reference! 📌**
