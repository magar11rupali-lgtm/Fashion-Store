# Day 2: Understanding React Components & Building Homepage

## 🎯 Learning Objectives

By the end of today, you will:
- Learn what React components are
- Understand JSX syntax
- Create your first homepage layout
- Style components with Tailwind CSS

## ⏱️ Estimated Time: 4-5 hours

---

## 📝 Tasks & Subtasks

### Task 2.1: Learn React Basics

**Subtask 2.1.1: Read about React components (15 minutes)**
- A component is like a LEGO block for your website
- Each component is a reusable piece of UI
- Components can be combined to build complex pages

**Subtask 2.1.2: Understand props and state concepts**
- **Props**: Data passed TO a component (like function parameters)
- **State**: Data managed INSIDE a component (like variables)

**Subtask 2.1.3: Practice creating a simple component**
- We'll create Header, Footer, and Hero components today

---

### Task 2.2: Create Homepage Structure

**Subtask 2.2.1: Create `components` folder**

```bash
cd frontend
mkdir components
```

**Subtask 2.2.2: Build Header component**

Create `frontend/components/Header.jsx`:

```jsx
export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-800">
            Fashion Store
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="/" className="text-gray-700 hover:text-blue-600">Home</a>
            <a href="/products" className="text-gray-700 hover:text-blue-600">Shop</a>
            <a href="/about" className="text-gray-700 hover:text-blue-600">About</a>
            <a href="/contact" className="text-gray-700 hover:text-blue-600">Contact</a>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-700 hover:text-blue-600">
              🛒 Cart (0)
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
```

**Subtask 2.2.3: Build Footer component**

Create `frontend/components/Footer.jsx`:

```jsx
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-16">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Fashion Store</h3>
            <p className="text-gray-400">
              Your one-stop shop for trendy fashion.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white">Home</a></li>
              <li><a href="/products" className="text-gray-400 hover:text-white">Shop</a></li>
              <li><a href="/about" className="text-gray-400 hover:text-white">About</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">📘 Facebook</a>
              <a href="#" className="text-gray-400 hover:text-white">📷 Instagram</a>
              <a href="#" className="text-gray-400 hover:text-white">🐦 Twitter</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Fashion Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
```

**Subtask 2.2.4: Build Hero component**

Create `frontend/components/Hero.jsx`:

```jsx
export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-600">
      <div className="text-center text-white px-6">
        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          Welcome to Fashion Store
        </h1>
        <p className="text-xl md:text-2xl mb-8">
          Discover Your Style
        </p>
        <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
          Shop Now
        </button>
      </div>
    </section>
  );
}
```

**Subtask 2.2.5: Update `app/page.js`**

Replace the content of `frontend/app/page.js`:

```jsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';

export default function Home() {
  return (
    <div>
      <Header />
      <Hero />
      <Footer />
    </div>
  );
}
```

---

### Task 2.3: Style with Tailwind CSS

**Subtask 2.3.1: Learn basic Tailwind classes**

Common Tailwind classes you'll use:
- **Background**: `bg-white`, `bg-blue-500`, `bg-gradient-to-r`
- **Text**: `text-white`, `text-2xl`, `font-bold`
- **Padding**: `p-4`, `px-6`, `py-8`
- **Margin**: `m-4`, `mx-auto`, `mt-8`
- **Flexbox**: `flex`, `justify-between`, `items-center`
- **Grid**: `grid`, `grid-cols-3`, `gap-4`

**Subtask 2.3.2: Add colors and spacing to Header**
- Already done in the code above!
- Notice the `px-6 py-4` for padding
- `shadow-md` adds a nice shadow

**Subtask 2.3.3: Make Hero section attractive**
- We used `h-screen` for full screen height
- `bg-gradient-to-r` creates a gradient background
- `text-5xl` makes the heading large

**Subtask 2.3.4: Style Footer**
- `grid-cols-1 md:grid-cols-3` makes it responsive
- On mobile: 1 column
- On desktop: 3 columns

---

## 🤖 AI Prompts for Students

When you get stuck, try asking:

```
"Explain React components like I'm 14 years old with an example"

"How do I create a navigation bar in React with Tailwind CSS?"

"Show me a simple Hero section code for a fashion website"

"What are props in React? Give me a simple example"

"Help me center a div using Tailwind CSS"

"Why am I getting 'module not found' error for my component?"

"How do I make my navigation responsive for mobile?"
```

---

## 📖 Tutorial Steps

### Step 1: Start Your Development Server

```bash
cd frontend
npm run dev
```

Keep this running! Open `http://localhost:3000` in your browser.

### Step 2: Create Components Folder

In VS Code:
1. Right-click on `frontend` folder
2. Select "New Folder"
3. Name it `components`

### Step 3: Create Header Component

1. Right-click on `components` folder
2. Select "New File"
3. Name it `Header.jsx`
4. Copy the Header code from above
5. Save the file (`Ctrl + S` or `Cmd + S`)

### Step 4: Create Footer Component

1. Create new file `Footer.jsx` in `components`
2. Copy the Footer code from above
3. Save the file

### Step 5: Create Hero Component

1. Create new file `Hero.jsx` in `components`
2. Copy the Hero code from above
3. Save the file

### Step 6: Update Homepage

1. Open `app/page.js`
2. Delete all existing code
3. Copy the new code from above
4. Save the file

### Step 7: View Your Website

1. Go to `http://localhost:3000`
2. You should see:
   - Header with navigation
   - Hero section with gradient
   - Footer with links

---

## ✅ Testing & Validation

Check that everything works:

- [ ] Header displays at the top
- [ ] Navigation links are visible (Home, Shop, About, Contact)
- [ ] Cart icon shows in header
- [ ] Hero section is full-screen height
- [ ] "Welcome to Fashion Store" heading is large and centered
- [ ] "Shop Now" button is visible
- [ ] Footer displays at the bottom
- [ ] Footer has 3 columns on desktop
- [ ] No errors in browser console (Press F12 to check)
- [ ] Page looks good on mobile (resize browser window)

---

## 🎨 Customization Challenge

Make it your own! Try these:

1. **Change colors**: Replace `blue-500` with `pink-500` or `green-500`
2. **Change text**: Update "Fashion Store" to your brand name
3. **Add your logo**: Replace the text logo with an image
4. **Change gradient**: Try `from-pink-500 to-yellow-500`

Example:
```jsx
<div className="bg-gradient-to-r from-pink-500 to-yellow-500">
```

---

## 🏠 Homework

Before Day 3, complete these tasks:

1. **Customize colors** to match your fashion brand
   - Choose a primary color
   - Update all components to use it

2. **Find 3 free fashion images** from [Unsplash.com](https://unsplash.com)
   - Search for "fashion", "clothing", "model"
   - Download high-quality images
   - Save them in `frontend/public/images/`

3. **Write down 5 product categories**
   - Example: T-Shirts, Jeans, Shoes, Dresses, Accessories
   - You'll use these tomorrow in Strapi

4. **Add a Featured Products section** (Challenge!)
   - Create a new component `FeaturedProducts.jsx`
   - Add it between Hero and Footer
   - Display 3 placeholder product cards

---

## 🐛 Common Errors & Solutions

### Error: "Cannot find module '@/components/Header'"
**Solution:** Make sure:
- File is named exactly `Header.jsx` (capital H)
- File is in the `components` folder
- You saved the file

### Error: "Unexpected token '<'"
**Solution:** Make sure:
- File extension is `.jsx` not `.js`
- You're using `export default function`

### Error: Styles not showing
**Solution:** 
- Tailwind is already configured in Next.js
- Make sure you're using correct class names
- Check for typos in class names

### Error: Page is blank
**Solution:**
- Check browser console for errors (F12)
- Make sure all components are exported
- Make sure imports in `page.js` are correct

---

## 📚 What You Learned Today

- ✅ What React components are and how they work
- ✅ How to create reusable components
- ✅ JSX syntax for writing HTML in JavaScript
- ✅ Tailwind CSS classes for styling
- ✅ How to import and use components
- ✅ Responsive design basics (mobile vs desktop)

---

## 💡 Key Concepts

### Components
Think of components like LEGO blocks. Each block (component) can be used multiple times and combined to build something bigger (your website).

### JSX
JSX lets you write HTML-like code in JavaScript. It looks like HTML but it's actually JavaScript!

### Tailwind CSS
Instead of writing CSS files, you add class names directly to your HTML. `bg-blue-500` means "background color blue, shade 500".

### Responsive Design
`md:grid-cols-3` means "on medium screens and larger, use 3 columns". This makes your site look good on phones and computers!

---

## 🎉 Congratulations!

You've completed Day 2! You now have a beautiful homepage with a header, hero section, and footer. Your website is starting to take shape!

**Tomorrow:** We'll set up Strapi and create our product database!

---

## 📖 Additional Reading (Optional)

- [React Components](https://react.dev/learn/your-first-component)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

---

[← Day 1: Setup](./day-01-setup.md) | [Back to Overview](./README.md) | [Day 3: Strapi Backend →](./day-03-strapi.md)
