# Fix for 401 Unauthorized Error

## The Problem

You're seeing this error when trying to sign in:
```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
Sign in error: CredentialsSignin
```

## What This Means

**401 Unauthorized** = The backend rejected your credentials because:
- ❌ The account doesn't exist in the database
- ❌ The password is incorrect

## The Solution

### Option 1: Create the Account (Recommended)

The account `magar11rupa@gmail.com` likely doesn't exist yet. Create it:

1. **Go to signup page:**
   ```
   http://localhost:3000/auth/signup
   ```

2. **Fill in the form:**
   - Username: `magar11rupa`
   - Email: `magar11rupa@gmail.com`
   - Password: `YourPassword123` (choose a password you'll remember!)
   - Confirm Password: `YourPassword123`

3. **Click "Sign Up"**

4. **Now try signing in** with those exact credentials

### Option 2: Use the Diagnostic Tool

I created a tool to check and fix the account:

```bash
node check-account.js
```

This will:
- ✅ Check if backend is running
- ✅ Try to create the account
- ✅ Test common passwords if account exists
- ✅ Give you the working credentials

### Option 3: Verify in Strapi Admin

1. **Open Strapi admin:**
   ```
   http://localhost:1337/admin
   ```

2. **Login** (create admin account if first time)

3. **Check users:**
   - Go to: Content Manager → User
   - Look for: `magar11rupa@gmail.com`

4. **If user doesn't exist:**
   - Create account via signup page

5. **If user exists but password wrong:**
   - Edit the user in Strapi admin
   - Set a new password
   - Try signing in with new password

## What I Fixed

I added better error logging to help diagnose issues:

**File:** `frontend/app/api/auth/[...nextauth]/route.js`

Now when you try to sign in, check your **frontend terminal** for detailed logs:

```
🔐 Attempting authentication for: magar11rupa@gmail.com
🌐 API URL: http://localhost:1337/api
📡 Response status: 401
📦 Response data: { error: { message: 'Invalid identifier or password' } }
❌ Authentication failed: Invalid identifier or password
```

This tells you exactly what's happening!

## Quick Test

Run this command to test backend authentication:

```bash
# Try to login (will fail if account doesn't exist)
curl -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "magar11rupa@gmail.com",
    "password": "Test123456"
  }'
```

**If you get 401:**
```json
{
  "error": {
    "message": "Invalid identifier or password"
  }
}
```
→ Account doesn't exist or password is wrong

**If you get 200:**
```json
{
  "jwt": "eyJhbGc...",
  "user": { ... }
}
```
→ Credentials work! Use them to sign in

## Step-by-Step Fix

1. **Ensure backend is running:**
   ```bash
   cd backend
   npm run develop
   ```

2. **Create account:**
   - Go to: http://localhost:3000/auth/signup
   - Use email: `magar11rupa@gmail.com`
   - Choose a password (at least 6 characters)
   - Remember the password!

3. **Sign in:**
   - Go to: http://localhost:3000/auth/signin
   - Use the EXACT email and password from step 2
   - Click "Sign In"

4. **Should work!** ✅

## Still Not Working?

### Check Backend Logs

When you try to sign in, look at the backend terminal. You should see:

```
POST /api/auth/local (XX ms) 401
```

This confirms the backend received the request but rejected it.

### Check Frontend Logs

Look at the frontend terminal for the new detailed logs I added.

### Run Diagnostic Tool

```bash
node check-account.js
```

This will automatically diagnose and try to fix the issue.

### Nuclear Option: Reset Database

If nothing works, reset everything:

```bash
# Stop backend (Ctrl+C)
cd backend
rm .tmp/data.db
npm run develop
```

Then create a fresh account via signup page.

## Summary

The 401 error means your credentials are invalid. The most likely cause is that the account doesn't exist yet. Simply create it via the signup page and then try signing in with those credentials.

## Files I Modified

- `frontend/app/api/auth/[...nextauth]/route.js` - Added detailed logging

## Files I Created

- `SIGNIN_DEBUG_GUIDE.md` - Detailed debugging guide
- `check-account.js` - Automated diagnostic tool
- `FIX_401_ERROR.md` - This file

## Next Steps

1. Run `node check-account.js` to diagnose
2. Or create account at `/auth/signup`
3. Then try signing in
4. Check the logs for detailed error messages

The authentication system is working correctly - you just need to create the account first! 🎉
