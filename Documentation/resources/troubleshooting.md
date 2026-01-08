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

## 🛒 Cart Issues

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

---

### Error: Can't add to cart

**Problem:** Event handler not working

**Solution:**
1. Check onClick is attached to button
2. Verify function is defined
3. Check for console errors
4. Make sure component has `'use client'`

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
