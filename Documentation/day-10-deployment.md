# Day 10: Testing, Bug Fixes & Deployment

## 🎯 Learning Objectives

By the end of today, you will:
- Learn to test websites thoroughly
- Fix bugs and issues
- Deploy your website online
- Share your project with the world!

## ⏱️ Estimated Time: 4-5 hours

---

## 📝 Tasks & Subtasks

### Task 10.1: Comprehensive Testing

**Subtask 10.1.1: Create testing checklist**

Use the [Testing Checklist](../resources/testing-checklist.md) to test all features.

**Subtask 10.1.2-10.1.5: Test systematically**

Test each page:

1. **Homepage**
   - Header displays
   - Hero section loads
   - Footer displays
   - All links work

2. **Products Page**
   - All products load
   - Images display
   - Search works
   - Filters work
   - Pagination works (if added)

3. **Product Detail**
   - Product loads
   - Image displays
   - Add to cart works
   - Size selection works
   - Quantity selector works

4. **Cart**
   - Items display
   - Quantity updates
   - Remove works
   - Total calculates
   - Checkout button works

5. **Checkout**
   - Form displays
   - Validation works
   - Order submits
   - Success message shows

6. **Mobile**
   - All pages responsive
   - Menu works
   - Touch interactions work

---

### Task 10.2: Bug Fixing

**Common bugs to check:**

**Bug 1: Images not loading**
```javascript
// Fix: Update next.config.js
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

**Bug 2: Cart not persisting**
```javascript
// Already fixed in CartContext with localStorage
// If not working, check browser console for errors
```

**Bug 3: Products not loading**
```javascript
// Check Strapi is running
// Check API permissions
// Check products are published
```

---

### Task 10.3: Final Polish

**Subtask 10.3.1: Add favicon**

1. Create or download a favicon (16x16 or 32x32 PNG)
2. Save as `frontend/app/favicon.ico`
3. Next.js will automatically use it

**Subtask 10.3.2: Update page titles and meta**

Update `frontend/app/layout.js`:

```javascript
export const metadata = {
  title: 'Fashion Store - Your Style Destination',
  description: 'Discover trendy fashion at amazing prices. Shop the latest styles in clothing, shoes, and accessories.',
  keywords: 'fashion, clothing, online shopping, trendy clothes',
}
```

For individual pages, add metadata:

```javascript
// In app/products/page.js
export const metadata = {
  title: 'Shop All Products - Fashion Store',
  description: 'Browse our complete collection of fashion items',
}
```

**Subtask 10.3.3: Add Open Graph images**

```javascript
export const metadata = {
  title: 'Fashion Store',
  description: 'Your one-stop shop for trendy fashion',
  openGraph: {
    title: 'Fashion Store',
    description: 'Your one-stop shop for trendy fashion',
    images: ['/og-image.jpg'],
  },
}
```

**Subtask 10.3.4-10.3.5: Check links and content**

- Click every link
- Read all text for typos
- Check all images load
- Verify all buttons work

---

### Task 10.4: Prepare for Deployment

**Subtask 10.4.1: Create production build**

```bash
cd frontend
npm run build
```

This checks for errors before deployment.

**Subtask 10.4.2: Test production build locally**

```bash
npm run start
```

Test the production version on `localhost:3000`

**Subtask 10.4.3: Set up environment variables**

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:1337/api
```

For production, you'll update this to your deployed Strapi URL.

---

### Task 10.5: Deploy Website

**Subtask 10.5.1: Deploy Strapi to Railway**

1. **Create Railway account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create new project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your repository
   - Choose `backend` folder

3. **Add PostgreSQL database**
   - Click "New"
   - Select "Database"
   - Choose "PostgreSQL"
   - Railway will create and connect it

4. **Set environment variables**
   - Click on your Strapi service
   - Go to "Variables"
   - Add these variables:
     ```
     NODE_ENV=production
     DATABASE_CLIENT=postgres
     ```

5. **Deploy**
   - Railway will automatically deploy
   - Wait 5-10 minutes
   - Get your Strapi URL (e.g., `https://your-app.railway.app`)

6. **Create admin account**
   - Visit `https://your-app.railway.app/admin`
   - Create admin account
   - Add your products again

**Subtask 10.5.2: Deploy Next.js to Vercel**

1. **Create Vercel account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import project**
   - Click "New Project"
   - Import your GitHub repository
   - Select `frontend` folder as root directory

3. **Configure build settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Add environment variables**
   - Add variable:
     ```
     NEXT_PUBLIC_API_URL=https://your-strapi-url.railway.app/api
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-5 minutes
   - Get your live URL!

**Subtask 10.5.3: Connect frontend to deployed backend**

Update your environment variable with the Railway Strapi URL.

**Subtask 10.5.4-10.5.5: Test and share**

1. Visit your live website
2. Test all features
3. Share the link!

---

### Task 10.6: Documentation

**Subtask 10.6.1-10.6.5: Create README**

Create `README.md` in your project root:

```markdown
# Fashion Store E-Commerce Website

A modern, full-stack e-commerce website built with Next.js and Strapi.

![Fashion Store Screenshot](./screenshot.png)

## 🌟 Features

- 🛍️ Product catalog with search and filters
- 🛒 Shopping cart with localStorage persistence
- 💳 Checkout process with form validation
- 📱 Fully responsive design
- ⚡ Fast and optimized with Next.js
- 🎨 Beautiful UI with Tailwind CSS

## 🛠️ Technologies Used

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Strapi CMS
- **Database**: PostgreSQL (production), SQLite (development)
- **Deployment**: Vercel (frontend), Railway (backend)

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/fashion-store.git
cd fashion-store
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd ../backend
npm install
```

4. Start the backend
```bash
npm run develop
```

5. Start the frontend (in a new terminal)
```bash
cd frontend
npm run dev
```

6. Open http://localhost:3000

## 🚀 Deployment

### Frontend (Vercel)
- Connected to GitHub for automatic deployments
- Live URL: https://your-site.vercel.app

### Backend (Railway)
- PostgreSQL database
- Live URL: https://your-api.railway.app

## 📸 Screenshots

### Homepage
![Homepage](./screenshots/homepage.png)

### Products Page
![Products](./screenshots/products.png)

### Shopping Cart
![Cart](./screenshots/cart.png)

### Checkout
![Checkout](./screenshots/checkout.png)

## 🎯 Future Enhancements

- [ ] User authentication
- [ ] Wishlist functionality
- [ ] Product reviews and ratings
- [ ] Order history
- [ ] Email notifications
- [ ] Payment gateway integration
- [ ] Admin dashboard

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built as part of the 10-Day Fashion E-Commerce Tutorial
- Icons from [Heroicons](https://heroicons.com)
- Images from [Unsplash](https://unsplash.com)
```

---

## 🤖 AI Prompts for Students

```
"What should I test on an e-commerce website?"

"How do I deploy Next.js to Vercel?"

"How do I deploy Strapi backend?"

"Help me: Website works locally but not after deployment"

"How do I add a favicon to Next.js?"

"How do I write a good README for my project?"

"What are environment variables and how do I use them?"

"How do I connect my deployed frontend to deployed backend?"

"How do I add custom domain to Vercel?"
```

---

## 📖 Tutorial Steps

### Step 1: Test Everything

1. Use the testing checklist
2. Test on different browsers
3. Test on different devices
4. Document any bugs

### Step 2: Fix Bugs

1. Prioritize critical bugs
2. Fix one at a time
3. Re-test after each fix
4. Check console for errors

### Step 3: Polish

1. Add favicon
2. Update meta tags
3. Check all content
4. Take screenshots

### Step 4: Build for Production

```bash
cd frontend
npm run build
npm run start
```

Test the production build.

### Step 5: Deploy Backend

1. Sign up for Railway
2. Create new project
3. Connect GitHub
4. Add PostgreSQL
5. Deploy
6. Create admin account
7. Add products

### Step 6: Deploy Frontend

1. Sign up for Vercel
2. Import project
3. Add environment variables
4. Deploy
5. Test live site

### Step 7: Document

1. Create README
2. Add screenshots
3. List features
4. Add installation instructions

### Step 8: Share!

1. Share with friends
2. Share on social media
3. Add to portfolio
4. Celebrate! 🎉

---

## ✅ Testing & Validation

Final checklist:

- [ ] All features work as expected
- [ ] No console errors
- [ ] Website is responsive
- [ ] All links work
- [ ] Forms validate properly
- [ ] Images load correctly
- [ ] Website is deployed successfully
- [ ] Live URL is accessible
- [ ] Backend API is connected
- [ ] README is complete
- [ ] Screenshots are added
- [ ] Project is on GitHub

---

## 🎨 Deployment Checklist

**Before Deployment:**
- [ ] Production build works locally
- [ ] All environment variables documented
- [ ] No hardcoded URLs
- [ ] All images optimized
- [ ] No console.log statements in production code

**After Deployment:**
- [ ] Frontend loads correctly
- [ ] Backend API is accessible
- [ ] Products display
- [ ] Cart works
- [ ] Checkout works
- [ ] Mobile version works
- [ ] SSL certificate active (https)

---

## 🏠 Final Presentation

Prepare a 5-minute demo:

1. **Introduction** (30 seconds)
   - Project name
   - What it does
   - Technologies used

2. **Homepage Demo** (1 minute)
   - Show hero section
   - Navigate to products

3. **Features Demo** (2 minutes)
   - Search products
   - Use filters
   - View product details
   - Add to cart

4. **Checkout Demo** (1 minute)
   - Show cart
   - Fill checkout form
   - Complete order

5. **Mobile Demo** (30 seconds)
   - Show responsive design
   - Mobile navigation

6. **Conclusion** (30 seconds)
   - Share live link
   - Mention future enhancements
   - Thank audience

---

## 🐛 Common Deployment Errors

### Error: "Module not found" after deployment
**Solution:**
- Check package.json includes all dependencies
- Run `npm install` to verify
- Redeploy

### Error: Images not loading in production
**Solution:**
- Update NEXT_PUBLIC_API_URL to production URL
- Check Strapi CORS settings
- Verify image URLs in browser console

### Error: API calls failing
**Solution:**
- Check environment variables in Vercel
- Verify Strapi is running on Railway
- Check API permissions in Strapi
- Look at Network tab in DevTools

### Error: "Application error" on Vercel
**Solution:**
- Check Vercel deployment logs
- Look for build errors
- Verify all dependencies are installed
- Check for syntax errors

---

## 📚 What You Learned Today

- ✅ How to test websites systematically
- ✅ How to debug and fix issues
- ✅ How to prepare for deployment
- ✅ How to deploy to Vercel
- ✅ How to deploy to Railway
- ✅ How to use environment variables
- ✅ How to write documentation
- ✅ How to create a portfolio project

---

## 💡 Key Concepts

### Environment Variables

Different URLs for development and production:
```javascript
// Development
NEXT_PUBLIC_API_URL=http://localhost:1337/api

// Production
NEXT_PUBLIC_API_URL=https://your-api.railway.app/api
```

### Production Build

```bash
npm run build  # Creates optimized build
npm run start  # Runs production server
```

### Continuous Deployment

When you push to GitHub:
- Vercel automatically rebuilds frontend
- Railway automatically rebuilds backend

---

## 🎉 CONGRATULATIONS!

You've completed the entire 10-day tutorial! You now have:

✅ A fully functional e-commerce website  
✅ Live deployment accessible to anyone  
✅ Portfolio project to showcase  
✅ Understanding of modern web development  
✅ Skills in React, Next.js, and Strapi  
✅ Experience with deployment and DevOps  

## 🌟 What's Next?

1. **Add to Portfolio**
   - Add to your GitHub profile
   - Include in resume
   - Share on LinkedIn

2. **Keep Learning**
   - Try the bonus challenges
   - Learn TypeScript
   - Explore other frameworks

3. **Build More Projects**
   - Blog platform
   - Social media app
   - Portfolio website

4. **Join Communities**
   - React Discord
   - Next.js Discussions
   - Dev.to

---

## 📖 Additional Reading

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Strapi Deployment](https://docs.strapi.io/dev-docs/deployment)

---

## 🎓 Certificate of Completion

You've successfully completed the **10-Day Fashion E-Commerce Tutorial**!

**Skills Acquired:**
- React & Next.js Development
- Strapi CMS
- Tailwind CSS
- API Integration
- State Management
- Form Handling
- Responsive Design
- Deployment & DevOps

**Project Stats:**
- 10 days of learning
- 40+ hours of coding
- 1 complete e-commerce website
- ∞ possibilities ahead!

---

## 🙏 Thank You!

Thank you for completing this tutorial. We hope you enjoyed building your fashion e-commerce website and learned valuable skills along the way.

**Keep coding, keep learning, and keep building amazing things!** 🚀

---

[← Day 9: Styling](./day-09-styling.md) | [Back to Overview](./README.md)
