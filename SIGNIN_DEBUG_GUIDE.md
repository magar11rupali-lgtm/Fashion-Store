# Sign In Debug Guide - 401 Unauthorized Error

## The Problem

You're getting a **401 Unauthorized** error when trying to sign in with `magar11rupa@gmail.com`. This means:

❌ The backend is rejecting the credentials
❌ Either the account doesn't exist OR the password is wrong

## Quick Fix Steps

### Step 1: Verify Backend is Running

Open a terminal and check:

```bash
cd backend
npm run develop
```

You should see:
```
Server started on http://localhost:1337
```

### Step 2: Check if Account Exists in Strapi

1. Open: http://localhost:1337/admin
2. Login to Strapi admin panel (create admin account if first time)
3. Go to: **Content Manager** → **User** (under Collection Types)
4. Look for user with email: `magar11rupa@gmail.com`

**If you DON'T see the user:**
- The account doesn't exist
- You need to create it via signup page

**If you DO see the user:**
- The password you're entering is wrong
- Try resetting or creating a new account

### Step 3: Create Account via Signup

Since the account might not exist, create it:

1. Go to: http://localhost:3000/auth/signup
2. Fill in:
   - Username: `magar11rupa` (or any username)
   - Email: `magar11rupa@gmail.com`
   - Password: `YourPassword123` (remember this!)
   - Confirm Password: `YourPassword123`
3. Click "Sign Up"
4. Should see: "Account created successfully!"

### Step 4: Try Signing In Again

1. Go to: http://localhost:3000/auth/signin
2. Enter:
   - Email: `magar11rupa@gmail.com`
   - Password: `YourPassword123` (the EXACT password you just created)
3. Click "Sign In"

## Test Backend Directly

Run this command to test if backend authentication works:

```bash
# Test registration
curl -X POST http://localhost:1337/api/auth/local/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "magar11rupa",
    "email": "magar11rupa@gmail.com",
    "password": "Test123456"
  }'
```

Expected response:
```json
{
  "jwt": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "magar11rupa",
    "email": "magar11rupa@gmail.com"
  }
}
```

If you get an error like "Email is already taken", the account exists but you're using the wrong password.

## Test Login Directly

```bash
# Test login
curl -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "magar11rupa@gmail.com",
    "password": "Test123456"
  }'
```

Expected response:
```json
{
  "jwt": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "magar11rupa",
    "email": "magar11rupa@gmail.com"
  }
}
```

If you get 401 error:
```json
{
  "error": {
    "message": "Invalid identifier or password"
  }
}
```

This means the password is wrong or account doesn't exist.

## Common Causes of 401 Error

### 1. Account Doesn't Exist
**Solution:** Create account at `/auth/signup`

### 2. Wrong Password
**Solution:** 
- Try the password you remember
- Or create a new account with a different email
- Or reset password in Strapi admin panel

### 3. Backend Not Running
**Solution:** Start backend with `cd backend && npm run develop`

### 4. Database Issue
**Solution:** Check if `backend/.tmp/data.db` exists

## Reset Everything (Nuclear Option)

If nothing works, reset the database:

```bash
# Stop backend
# Delete database
cd backend
rm -rf .tmp/data.db

# Restart backend
npm run develop

# Create new account
# Go to http://localhost:3000/auth/signup
```

## Check Backend Logs

When you try to sign in, check the backend terminal for logs. You should see:

```
[2024-XX-XX XX:XX:XX.XXX] info: POST /api/auth/local (XX ms) 200
```

If you see `400` or `401`, the credentials are wrong.

## Improved Logging

I've added better logging to the NextAuth handler. Check your terminal running the frontend for these logs:

```
🔐 Attempting authentication for: magar11rupa@gmail.com
🌐 API URL: http://localhost:1337/api
📡 Response status: 401
📦 Response data: { error: { message: 'Invalid identifier or password' } }
❌ Authentication failed: Invalid identifier or password
```

This will tell you exactly what's happening.

## Most Likely Solution

Based on the 401 error, the most likely issue is:

**The account `magar11rupa@gmail.com` doesn't exist in the Strapi database yet.**

**Fix:**
1. Go to http://localhost:3000/auth/signup
2. Create account with email `magar11rupa@gmail.com`
3. Use a password you'll remember (at least 6 characters)
4. Then try signing in with those exact credentials

## Verify Account Creation

After creating account via signup, verify it exists:

1. Go to: http://localhost:1337/admin
2. Navigate to: Content Manager → User
3. You should see your user with email `magar11rupa@gmail.com`
4. If you see it, the account exists
5. Now try signing in with the password you used during signup

## Still Not Working?

If you've created the account and still getting 401:

1. **Double-check the password** - It's case-sensitive
2. **Check for typos** in the email
3. **Try a different browser** - Clear cache
4. **Check backend logs** - Look for error messages
5. **Run the test script**: `node test-auth.js`

## Contact Support

If none of this works, provide:
- Backend terminal output when you try to sign in
- Frontend terminal output (with the new logging)
- Screenshot of Strapi admin showing the user exists
- The exact steps you followed
