# Complete Sign-In Fix Solution

## Problem
After sign-in, you're seeing "Invalid email or password" error. The backend is returning a **500 Internal Server Error** during authentication.

## Root Cause
The Strapi backend has an internal error when trying to authenticate users. Registration works, but login crashes.

## COMPLETE SOLUTION - Follow These Steps Exactly

### Step 1: Stop Both Servers

Stop the backend and frontend servers (press Ctrl+C in both terminals).

### Step 2: Reset Backend Database

Open a terminal and run:

```bash
# Navigate to backend
cd backend

# Delete the corrupted database
del .tmp\data.db

# Verify it's deleted
dir .tmp
```

### Step 3: Start Backend

```bash
# Still in backend folder
npm run develop
```

Wait for this message:
```
[INFO] Server started on http://localhost:1337
```

### Step 4: Create Strapi Admin Account

1. Open browser: http://localhost:1337/admin
2. You'll see "Create the first administrator"
3. Fill in:
   - First name: Admin
   - Last name: User
   - Email: admin@example.com
   - Password: Admin123456
   - Confirm Password: Admin123456
4. Click "Let's start"

### Step 5: Enable Public Registration

In Strapi admin panel:

1. Click **Settings** (left sidebar, bottom)
2. Click **Users & Permissions plugin** → **Roles**
3. Click **Public** role
4. Scroll down to **Users-permissions** section
5. Check these boxes:
   - ✅ `auth.callback`
   - ✅ `auth.connect`
   - ✅ `auth.forgotPassword`
   - ✅ `auth.register`
   - ✅ `auth.resetPassword`
   - ✅ `auth.emailConfirmation`
6. Click **Save** (top right)

### Step 6: Start Frontend

Open a NEW terminal:

```bash
cd frontend
npm run dev
```

Wait for:
```
✓ Ready in X.Xs
○ Local: http://localhost:3000
```

### Step 7: Create User Account

1. Open browser: http://localhost:3000/auth/signup
2. Fill in:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test123456`
   - Confirm Password: `Test123456`
3. Click "Sign Up"
4. You should see: "Account created successfully!"

### Step 8: Test Sign In

1. Go to: http://localhost:3000/auth/signin
2. Enter:
   - Email: `test@example.com`
   - Password: `Test123456`
3. Click "Sign In"
4. You should be redirected to home page

### Step 9: Verify It Works

Run this test:

```bash
node test-signin-flow.js
```

Expected output:
```
✅ Direct authentication works!
✅ JWT token works!
```

## If You Want to Use Your Email (magar11rupa@gmail.com)

After completing steps 1-6 above:

1. Go to: http://localhost:3000/auth/signup
2. Fill in:
   - Username: `magar11rupa`
   - Email: `magar11rupa@gmail.com`
   - Password: `YourPassword123` (choose a password you'll remember)
   - Confirm Password: `YourPassword123`
3. Click "Sign Up"

Then sign in with:
- Email: `magar11rupa@gmail.com`
- Password: `YourPassword123`

## Troubleshooting

### If Step 5 (Enable Public Registration) is Missing

The permissions might be in a different location:

1. In Strapi admin, go to **Settings**
2. Look for **USERS & PERMISSIONS PLUGIN**
3. Click **Roles**
4. Click **Public**
5. Find the **Permissions** section
6. Expand **Users-permissions**
7. Enable all auth-related permissions

### If Sign-Up Still Fails

Check backend terminal for errors. Common issues:

**Error: "Email is already taken"**
- Solution: Use a different email or delete the database again

**Error: "Password must be at least 6 characters"**
- Solution: Use a longer password (at least 6 characters)

### If Sign-In Still Shows "Invalid email or password"

1. **Verify the account exists:**
   - Go to Strapi admin: http://localhost:1337/admin
   - Click **Content Manager** (left sidebar)
   - Click **User** (under Collection Types)
   - You should see your user account

2. **Check you're using the EXACT password:**
   - Passwords are case-sensitive
   - No extra spaces
   - Must match what you entered during sign-up

3. **Check backend terminal for errors:**
   - Look for red error messages
   - If you see "500" errors, the backend has issues

4. **Restart everything:**
   - Stop both servers
   - Delete database again: `del backend\.tmp\data.db`
   - Start from Step 3

## Quick Verification Commands

```bash
# Test backend is running
curl http://localhost:1337/api/users/me

# Should return 401 (expected without auth)

# Test registration works
node check-account.js

# Test authentication works
node diagnose-backend.js
```

## Why This Fixes It

The 500 error during login indicates:
1. Database corruption
2. Missing JWT configuration
3. Password hashing issues

Resetting the database and properly configuring Strapi fixes all these issues.

## After Fix - Normal Usage

Once fixed, you can:

1. **Sign Up**: http://localhost:3000/auth/signup
2. **Sign In**: http://localhost:3000/auth/signin
3. **Add to cart** and proceed to checkout
4. **Checkout** will require sign-in if not logged in

## Need More Help?

If this doesn't work:

1. Copy the EXACT error from backend terminal
2. Copy the EXACT error from browser console (F12 → Console)
3. Share both errors

The backend terminal error will tell us exactly what's wrong.
