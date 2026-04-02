# Day 9: Styling, Animations & Mobile Responsiveness

## 🎯 Learning Objectives

By the end of today, you will:
- Make website fully responsive
- Add animations and transitions
- Improve user experience
- Polish the overall design

## ⏱️ Estimated Time: 4-5 hours

---

## 📝 Tasks & Subtasks

### Task 9.1: Mobile Responsiveness Audit

**Subtask 9.1.1-9.1.5: Test and fix mobile issues**

Open Chrome DevTools (F12) and test each page:
1. Click the device toolbar icon (or Ctrl+Shift+M)
2. Test different screen sizes:
   - Mobile: 375px
   - Tablet: 768px
   - Desktop: 1920px

**Common Issues to Fix:**

1. **Header on Mobile** - Already responsive, but let's enhance it

Update `frontend/components/Header.jsx` with mobile menu:

```jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Cart from './Cart';

export default function Header() {
  const { totalItems, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-30">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-gray-800">
              Fashion Store
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-blue-600 transition-colors">
                Shop
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
                Contact
              </Link>
            </div>
            
            {/* Cart and Mobile Menu Button */}
            <div className="flex items-center space-x-4">
              {/* Cart Button */}
              <button
                onClick={() => setIsOpen(true)}
                className="relative text-gray-700 hover:text-blue-600 flex items-center gap-2 transition-colors"
              >
                <span className="text-2xl">🛒</span>
                <span className="hidden md:inline">Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-gray-700 hover:text-blue-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4 animate-slideDown">
              <div className="flex flex-col space-y-4">
                <Link 
                  href="/" 
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/products" 
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Shop
                </Link>
                <Link 
                  href="/about" 
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  href="/contact" 
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>
      
      <Cart />
    </>
  );
}
```

---

### Task 9.2: Add Animations

**Subtask 9.2.1-9.2.5: Add custom animations**

Update `frontend/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'slideIn': 'slideIn 0.3s ease-out',
        'slideDown': 'slideDown 0.3s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
```

**Add animations to ProductCard:**

Update `frontend/components/ProductCard.jsx`:

```jsx
import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ product }) {
  const { name, description, price, category, image, inStock } = product.attributes;
  
  const imageUrl = image?.data?.attributes?.url 
    ? `http://localhost:1337${image.data.attributes.url}`
    : '/placeholder.jpg';

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 animate-fadeIn">
        <div className="relative h-64 bg-gray-200 overflow-hidden group">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {!inStock && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
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
          
          <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 transition-colors">
            {name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">
              ${price.toFixed(2)}
            </span>
            
            <span 
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                inStock 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg' 
                  : 'bg-gray-300 text-gray-500'
              }`}
            >
              {inStock ? 'View Details' : 'Unavailable'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

---

### Task 9.3: Create Loading Spinner

Create `frontend/components/LoadingSpinner.jsx`:

```jsx
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
```

Use it in pages:

```jsx
import LoadingSpinner from '@/components/LoadingSpinner';

// In component:
{loading && <LoadingSpinner />}
```

---

### Task 9.4: Improve Visual Design

**Subtask 9.4.1-9.4.5: Update color scheme and styling**

Create `frontend/app/globals.css` with custom styles:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:shadow-lg;
  }

  .btn-secondary {
    @apply bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300;
  }

  .input-field {
    @apply w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none transition-colors;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300;
  }
}

@layer utilities {
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
```

---

### Task 9.5: Performance Optimization

**Already optimized with:**
- ✅ Next.js Image component (automatic optimization)
- ✅ Server Components (faster loading)
- ✅ Lazy loading images
- ✅ Efficient state management

**Additional optimization:**

Create `frontend/next.config.js`:

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
    formats: ['image/avif', 'image/webp'],
  },
  // Enable compression
  compress: true,
}

module.exports = nextConfig
```

---

## 🤖 AI Prompts for Students

```
"How do I make a website responsive in Tailwind CSS?"

"Show me how to create a hamburger menu in React"

"How do I add fade-in animations with Tailwind?"

"How do I optimize images in Next.js?"

"Help me: Website looks broken on mobile"

"How do I create a loading spinner in React?"

"What are good color schemes for a fashion website?"

"How do I add smooth transitions to buttons?"

"How do I make my navigation sticky?"
```

---

## 📖 Tutorial Steps

### Step 1: Update Tailwind Config

1. Open `tailwind.config.js`
2. Add custom animations
3. Save the file

### Step 2: Update Header with Mobile Menu

1. Open `components/Header.jsx`
2. Replace with mobile-friendly version
3. Test on mobile view

### Step 3: Add Animations to Components

1. Update ProductCard with hover effects
2. Add transitions to buttons
3. Test animations

### Step 4: Create Loading Spinner

1. Create `LoadingSpinner.jsx`
2. Use in loading states
3. Test loading experience

### Step 5: Update Global Styles

1. Open `app/globals.css`
2. Add custom utility classes
3. Apply to components

### Step 6: Test Everything

1. Test on mobile (375px)
2. Test on tablet (768px)
3. Test on desktop (1920px)
4. Check all animations work
5. Verify no layout breaks

---

## ✅ Testing & Validation

Test on different screen sizes:

**Mobile (375px):**
- [ ] Header shows hamburger menu
- [ ] Mobile menu works
- [ ] Product grid shows 1 column
- [ ] Cart is full width
- [ ] All text is readable
- [ ] Buttons are tappable (min 44px)
- [ ] No horizontal scroll

**Tablet (768px):**
- [ ] Header shows some nav items
- [ ] Product grid shows 2 columns
- [ ] Cart is appropriate width
- [ ] Layout looks balanced

**Desktop (1920px):**
- [ ] All navigation visible
- [ ] Product grid shows 3-4 columns
- [ ] Cart is sidebar
- [ ] Content is centered
- [ ] Max width applied

**Animations:**
- [ ] Products fade in on load
- [ ] Hover effects work smoothly
- [ ] Cart slides in from right
- [ ] Mobile menu slides down
- [ ] Transitions are smooth (not jerky)
- [ ] Loading spinner shows when loading

---

## 🏠 Homework

1. **Add "Back to Top" button**
   - Shows when scrolled down
   - Smooth scroll to top
   - Fixed position bottom-right

2. **Create a 404 error page**
   - Custom design
   - Link back to home
   - Helpful message

3. **Add a loading screen**
   - Show on initial page load
   - Fade out when ready
   - Brand logo animation

4. **Add toast notifications**
   - "Added to cart" message
   - Auto-dismiss after 3 seconds
   - Slide in from top

---

## 🐛 Common Errors & Solutions

### Error: Animations not working
**Solution:**
- Check tailwind.config.js is saved
- Restart dev server
- Clear browser cache
- Verify class names are correct

### Error: Mobile menu doesn't close
**Solution:**
- Check onClick handlers
- Verify state is updating
- Make sure setMobileMenuOpen is called

### Error: Layout breaks on mobile
**Solution:**
- Use responsive classes (sm:, md:, lg:)
- Test with DevTools device toolbar
- Check for fixed widths
- Use max-w-full for images

### Error: Images not optimized
**Solution:**
- Use Next.js Image component
- Configure next.config.js
- Add remotePatterns for Strapi
- Restart dev server after config changes

---

## 📚 What You Learned Today

- ✅ Responsive design principles
- ✅ Mobile-first approach
- ✅ CSS animations and transitions
- ✅ Tailwind custom animations
- ✅ Performance optimization
- ✅ Image optimization
- ✅ Loading states
- ✅ Mobile navigation patterns
- ✅ Custom utility classes

---

## 💡 Key Concepts

### Responsive Design

Use Tailwind breakpoints:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  // 1 column on mobile
  // 2 columns on tablet
  // 3 columns on desktop
</div>
```

### CSS Transitions

```jsx
className="transition-all duration-300 hover:scale-105"
// Smoothly animates all properties over 300ms
```

### Mobile-First

Start with mobile styles, add larger screens:
```jsx
// Mobile first (default)
<div className="text-sm md:text-base lg:text-lg">
  // Small text on mobile
  // Medium on tablet
  // Large on desktop
</div>
```

---

## 🎉 Congratulations!

You've completed Day 9! Your website now looks professional, works smoothly on all devices, and has beautiful animations. It's almost ready to launch!

**Tomorrow:** We'll test everything, fix bugs, and deploy your website live!

---

## 📖 Additional Reading (Optional)

- [Responsive Design](https://web.dev/responsive-web-design-basics/)
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)

---

[← Day 8: Checkout](./day-08-checkout.md) | [Back to Overview](./README.md) | [Day 10: Deployment →](./day-10-deployment.md)
