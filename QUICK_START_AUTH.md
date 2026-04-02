# Quick Start: Authentication Setup

## Problem
You're unable to sign in when proceeding to checkout, getting "Invalid email or password" error.

## Solution Steps

### Step 1: Start the Backend (Required!)

Open a terminal and run:

```bash
cd backend
npm run develop
```

Wait until you see:
```
[INFO] Server started on http://localhost:1337
```

**Keep this terminal running!**

### Step 2: Start the Frontend

Open another terminal and run:

```bash
cd frontend
npm run dev
```

### Step 3: Create Your Account

1. Open browser: `http://localhost:3000/auth/signup`
2. Fill in the form:
   - Username: `yourname`
   - Email: `your@email.com`
   - Password: `password123` (at least 6 characters)
   - Confirm Password: `password123`
3. Click "Sign Up"
4. You should see: "Account created successfully!"

### Step 4: Test Sign In

1. Go to: `http://localhost:3000/auth/signin`
2. Enter:
   - Email: `your@email.com` (same as signup)
   - Password: `password123` (same as signup)
3. Click "Sign In"
4. You should be redirected to the home page

### Step 5: Test Checkout

1. Add items to cart
2. Click "Proceed to Checkout"
3. If not signed in, you'll be redirected to sign in page
4. Sign in with your credentials
5. You'll be redirected back to checkout

## Verify Backend is Working

Run this test script:

```bash
node test-auth.js
```

This will:
- Check if backend is running
- Create a test user
- Test login
- Verify authentication works

## Common Issues

### "Invalid email or password"
- **Cause**: No account exists or wrong credentials
- **Fix**: Create account first at `/auth/signup`

### "Network error" or "Failed to fetch"
- **Cause**: Backend not running
- **Fix**: Start backend with `cd backend && npm run develop`

### Backend won't start
- **Cause**: Port 1337 already in use
- **Fix**: Kill the process using port 1337 or change port in `backend/config/server.ts`

### Frontend won't start
- **Cause**: Port 3000 already in use
- **Fix**: Kill the process or run on different port: `npm run dev -- -p 3001`

## What Changed

I've made these improvements:

1. **Sign In Page** (`frontend/app/auth/signin/page.js`):
   - Now properly handles callback URL from checkout
   - Shows helpful message when redirected from checkout
   - Added "Sign Up" link for new users
   - Added console logging for debugging

2. **Backend CORS** (`backend/config/middlewares.ts`):
   - Explicitly allows frontend origin
   - Enables credentials for authentication
   - Proper security headers

3. **Documentation**:
   - Created `AUTH_TROUBLESHOOTING.md` for detailed troubleshooting
   - Created `test-auth.js` to verify authentication works
   - Created this quick start guide

## Test Your Setup

1. Backend running? → Check `http://localhost:1337/admin`
2. Frontend running? → Check `http://localhost:3000`
3. Can create account? → Go to `/auth/signup`
4. Can sign in? → Go to `/auth/signin`
5. Can checkout? → Add items and proceed to checkout

## Need Help?

Check the browser console (F12 → Console) for error messages. The signin page now logs helpful debugging information.
