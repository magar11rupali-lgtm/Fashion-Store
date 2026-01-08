# Day 5: Product Details Page & Routing

## 🎯 Learning Objectives

By the end of today, you will:
- Understand dynamic routing in Next.js
- Create individual product pages
- Learn about URL parameters
- Build detailed product views

## ⏱️ Estimated Time: 4-5 hours

---

## 📝 Tasks & Subtasks

### Task 5.1: Learn Next.js Routing

**Subtask 5.1.1: Understand file-based routing**

In Next.js, folders = routes:
- `app/page.js` → `/` (homepage)
- `app/products/page.js` → `/products`
- `app/about/page.js` → `/about`

**Subtask 5.1.2: Learn about dynamic routes [id]**

Square brackets = dynamic:
- `app/products/[id]/page.js` → `/products/1`, `/products/2`, etc.
- The `[id]` part can be any value!

**Subtask 5.1.3: Understand params**

Next.js passes the dynamic part as `params`:
```javascript
export default async function Page({ params }) {
  const { id } = params;
  // id will be "1", "2", "3", etc.
}
```

**Subtask 5.1.4: Learn about Link component**

Use `Link` for navigation (not `<a>`):
```jsx
import Link from 'next/link';

<Link href="/products/1">View Product</Link>
```

---

### Task 5.2: Create Product Detail Page

**Subtask 5.2.1: Create dynamic route folder**

Create this folder structure:
```
frontend/app/products/[id]/page.js
```

**Subtask 5.2.2-5.2.6: Create the page**

Create `frontend/app/products/[id]/page.js`:

```javascript
import { getProductById } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AddToCartButton from '@/components/AddToCartButton';

export default async function ProductDetailPage({ params }) {
  const { id } = params;
  const product = await getProductById(id);

  if (!product) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the product you're looking for.
          </p>
          <Link 
            href="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { name, description, price, category, image, inStock } = product.attributes;
  
  const imageUrl = image?.data?.attributes?.url 
    ? `http://localhost:1337${image.data.attributes.url}`
    : '/placeholder.jpg';

  return (
    <div>
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <Link href="/" className="text-blue-600 hover:underline">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/products" className="text-blue-600 hover:underline">Products</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">{name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="relative h-96 lg:h-[600px] bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            {/* Category Badge */}
            <div className="mb-4">
              <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full">
                {category}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {name}
            </h1>

            {/* Price */}
            <div className="text-3xl font-bold text-gray-900 mb-6">
              ${price.toFixed(2)}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {inStock ? (
                <span className="text-green-600 font-semibold flex items-center">
                  <span className="w-3 h-3 bg-green-600 rounded-full mr-2"></span>
                  In Stock
                </span>
              ) : (
                <span className="text-red-600 font-semibold flex items-center">
                  <span className="w-3 h-3 bg-red-600 rounded-full mr-2"></span>
                  Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Select Size
              </h3>
              <div className="flex space-x-3">
                {['S', 'M', 'L', 'XL'].map((size) => (
                  <button
                    key={size}
                    className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 font-semibold transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Quantity
              </h3>
              <div className="flex items-center space-x-4">
                <button className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-semibold">
                  -
                </button>
                <span className="text-xl font-semibold w-12 text-center">1</span>
                <button className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-semibold">
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              className={`w-full py-4 rounded-lg text-lg font-semibold transition-colors mb-4 ${
                inStock
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!inStock}
            >
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>

            {/* Back to Products */}
            <Link
              href="/products"
              className="text-center text-blue-600 hover:underline"
            >
              ← Back to Products
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

---

### Task 5.3: Link Products to Detail Pages

**Subtask 5.3.1-5.3.4: Update ProductCard**

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
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
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
            
            <span 
              className={`px-6 py-2 rounded-lg font-semibold ${
                inStock 
                  ? 'bg-blue-600 text-white' 
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

### Task 5.4: Enhance Product Details

All enhancements are already included in the code above! ✅

- ✅ Breadcrumb navigation
- ✅ "In Stock" / "Out of Stock" badge with colored dot
- ✅ Size selector (S, M, L, XL)
- ✅ Quantity selector with +/- buttons

---

## 🤖 AI Prompts for Students

When you get stuck, try asking:

```
"How does dynamic routing work in Next.js App Router?"

"Show me how to create a product detail page in Next.js"

"How do I get the ID from URL in Next.js 14?"

"How do I create a quantity selector in React?"

"Help me: Product detail page shows 404 error"

"How do I create a breadcrumb navigation?"

"Why is my Link component not working?"

"How do I make size buttons selectable in React?"
```

---

## 📖 Tutorial Steps

### Step 1: Create Dynamic Route Folder

In VS Code:
1. Navigate to `frontend/app/products/`
2. Create new folder: `[id]`
3. Inside `[id]`, create `page.js`

Your structure should be:
```
app/
  products/
    [id]/
      page.js
    page.js
```

### Step 2: Copy Product Detail Code

1. Open `app/products/[id]/page.js`
2. Copy the complete code from above
3. Save the file

### Step 3: Update ProductCard

1. Open `components/ProductCard.jsx`
2. Replace with the updated code
3. Save the file

### Step 4: Test Navigation

1. Go to `http://localhost:3000/products`
2. Click on any product card
3. You should navigate to `/products/1` (or 2, 3, etc.)
4. Product details should display

### Step 5: Test Different Products

1. Click different products
2. Notice the URL changes
3. Notice different product data loads
4. Test the "Back to Products" link

---

## ✅ Testing & Validation

Check that everything works:

- [ ] Clicking product card navigates to detail page
- [ ] URL shows correct product ID (e.g., `/products/1`)
- [ ] Product details load correctly
- [ ] Product image displays
- [ ] Name, price, category show correctly
- [ ] Description is readable
- [ ] Breadcrumb navigation works
- [ ] "Back to Products" link works
- [ ] Stock status shows correctly
- [ ] Size buttons are visible
- [ ] Quantity selector shows
- [ ] Add to Cart button displays
- [ ] Out of stock products show as unavailable
- [ ] Invalid product IDs show "Not Found" page
- [ ] No console errors

### Test Edge Cases

1. **Invalid ID**: Go to `/products/999` → Should show "Not Found"
2. **Out of Stock**: Product should show as unavailable
3. **Back Navigation**: Browser back button should work
4. **Direct URL**: Copy URL and paste in new tab → Should work

---

## 🎨 Understanding the Code

### Dynamic Routes

```javascript
// File: app/products/[id]/page.js
export default async function Page({ params }) {
  const { id } = params;  // Gets "1" from /products/1
  // Use id to fetch specific product
}
```

### Breadcrumb Navigation

```jsx
<nav>
  <Link href="/">Home</Link> / 
  <Link href="/products">Products</Link> / 
  <span>{name}</span>
</nav>
```

Shows user where they are: Home → Products → Product Name

### Conditional Rendering

```jsx
{inStock ? (
  <span className="text-green-600">In Stock</span>
) : (
  <span className="text-red-600">Out of Stock</span>
)}
```

Shows different content based on condition.

---

## 🏠 Homework

Before Day 6, complete these tasks:

1. **Add "Related Products" section**
   - Show 3 products from same category
   - Display at bottom of detail page
   - Reuse ProductCard component

2. **Make size selector interactive**
   - Highlight selected size
   - Use React state (we'll learn this tomorrow!)
   - For now, just add hover effects

3. **Make quantity selector functional**
   - Add state for quantity
   - Increase/decrease on button click
   - Don't allow quantity < 1

4. **Add social share buttons** (just UI)
   - Add buttons for Facebook, Twitter, Pinterest
   - Place below Add to Cart button
   - Use emojis or icons

Example for Related Products:

```jsx
// At bottom of page, before Footer
<section className="container mx-auto px-6 py-12">
  <h2 className="text-3xl font-bold mb-8">Related Products</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {/* Show 3 products from same category */}
  </div>
</section>
```

---

## 🐛 Common Errors & Solutions

### Error: "Page not found" when clicking product
**Solution:**
- Check folder name is exactly `[id]` with square brackets
- Make sure `page.js` is inside `[id]` folder
- Verify Link href is `/products/${product.id}`

### Error: "product is undefined"
**Solution:**
- Check that `getProductById` is working
- Console.log the product to see what's returned
- Make sure product exists in Strapi
- Check product is published (not draft)

### Error: Breadcrumb links don't work
**Solution:**
- Make sure you imported Link from 'next/link'
- Use Link component, not <a> tag
- Check href values are correct

### Error: Image not loading
**Solution:**
- Same as Day 4 - check next.config.js
- Verify image URL in console
- Check image exists in Strapi

### Error: "params is undefined"
**Solution:**
- Make sure function signature is: `async function Page({ params })`
- Check you're destructuring: `const { id } = params`
- Verify you're in a dynamic route folder `[id]`

---

## 📚 What You Learned Today

- ✅ How file-based routing works in Next.js
- ✅ How to create dynamic routes with [id]
- ✅ How to access URL parameters
- ✅ How to fetch single items from API
- ✅ How to create detailed product views
- ✅ How to use Link component for navigation
- ✅ How to create breadcrumb navigation
- ✅ How to handle 404 cases
- ✅ Conditional rendering in React

---

## 💡 Key Concepts

### File-Based Routing
The folder structure IS your routing:
```
app/
  page.js           → /
  about/
    page.js         → /about
  products/
    page.js         → /products
    [id]/
      page.js       → /products/:id
```

### Dynamic Segments
`[id]` can be any value:
- `/products/1` → id = "1"
- `/products/abc` → id = "abc"
- `/products/blue-jeans` → id = "blue-jeans"

### Link vs <a>
- `<Link>`: Client-side navigation (fast, no page reload)
- `<a>`: Full page reload (slow)

Always use `<Link>` for internal navigation!

---

## 🎉 Congratulations!

You've completed Day 5! You now have individual product pages with detailed information. Users can click any product and see full details. Your e-commerce site is really coming together!

**Tomorrow:** We'll add shopping cart functionality so users can actually add products to their cart!

---

## 📖 Additional Reading (Optional)

- [Next.js Routing](https://nextjs.org/docs/app/building-your-application/routing)
- [Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Link Component](https://nextjs.org/docs/app/api-reference/components/link)

---

[← Day 4: API Integration](./day-04-api-integration.md) | [Back to Overview](./README.md) | [Day 6: Shopping Cart →](./day-06-shopping-cart.md)
