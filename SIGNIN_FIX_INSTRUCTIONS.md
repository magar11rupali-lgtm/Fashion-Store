# Sign-In Error Fix Instructions

## Current Issue
You're getting a "CredentialsSignin" error when trying to sign in. The backend is returning a **500 Internal Server Error** when attempting authentication.

## Root Cause
The Strapi backend is experiencing an internal error during the authentication process. This is NOT a credentials issue - the backend is crashing before it can validate credentials.

## Immediate Fix Steps

### Step 1: Check Backend Terminal
Look at your backend terminal (where you ran `npm run develop`). You should see error messages that explain what's going wrong. Common errors include:

- Database connection issues
- Missing dependencies
- Configuration errors
- Plugin errors

### Step 2: Restart Backend with Fresh Database

If you see errors in the backend terminal, try resetting the database:

```bash
# Stop the backend (Ctrl+C in the backend terminal)

# Navigate to backend folder
cd backend

# Delete the database
del .tmp\data.db

# Restart backend
npm run develop
```

Wait for the message: `Server started on http://localhost:1337`

### Step 3: Create Admin Account

After restarting with a fresh database:

1. Go to: http://localhost:1337/admin
2. Create an admin account (first time setup)
3. Complete the admin registration

### Step 4: Enable Public Registration

In Strapi admin panel:

1. Go to: **Settings** → **Users & Permissions Plugin** → **Roles** → **Public**
2. Find **Users-Permissions** section
3. Enable these permissions:
   - `auth.callback`
   - `auth.connect`
   - `auth.forgotPassword`
   - `auth.register`
   - `auth.resetPassword`
   - `auth.emailConfirmation`
4. Click **Save**

### Step 5: Create User Account

Now create a user account via the frontend:

1. Go to: http://localhost:3000/auth/signup
2. Fill in:
   - Username: `magar11rupa`
   - Email: `magar11rupa@gmail.com`
   - Password: `Test123456`
   - Confirm Password: `Test123456`
3. Click "Sign Up"

### Step 6: Test Sign In

1. Go to: http://localhost:3000/auth/signin
2. Enter:
   - Email: `magar11rupa@gmail.com`
   - Password: `Test123456`
3. Click "Sign In"

## Alternative: Check Backend Logs

If you don't want to reset the database, check the backend terminal for specific errors. Common issues:

### Issue: JWT Secret Missing
**Error:** `JWT secret is not defined`

**Fix:** Check `backend/.env` has:
```
JWT_SECRET=CXLaIp89HqFatFbm2drv5Q==
```

### Issue: Database Locked
**Error:** `database is locked`

**Fix:** 
```bash
# Stop backend
# Delete backend/.tmp/data.db
# Restart backend
```

### Issue: Plugin Error
**Error:** Related to users-permissions plugin

**Fix:**
```bash
cd backend
npm install @strapi/plugin-users-permissions
npm run develop
```

## Verify Backend is Working

Run this test:

```bash
node test-signin-flow.js
```

Expected output:
```
✅ Direct authentication works!
✅ JWT token works!
```

If you see `Status: 500`, the backend has an internal error. Check the backend terminal for details.

## Environment Variables Check

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:1337/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
```

### Backend (.env)
```
HOST=0.0.0.0
PORT=1337
JWT_SECRET=CXLaIp89HqFatFbm2drv5Q==
```

## Still Not Working?

1. **Copy the exact error from backend terminal** and share it
2. **Check browser console** (F12 → Console) for frontend errors
3. **Verify both servers are running:**
   - Backend: http://localhost:1337/admin (should load)
   - Frontend: http://localhost:3000 (should load)

## Quick Test Commands

```bash
# Test if backend is responding
curl http://localhost:1337/api/users/me

# Should return: {"data":null,"error":{"status":401...}}
# (401 is expected without auth token - means backend is working)

# Test registration
node check-account.js

# Test authentication
node test-signin-flow.js
```

## Most Likely Solution

Based on the 500 error, the most likely fix is:

1. **Stop the backend** (Ctrl+C)
2. **Delete the database:** `del backend\.tmp\data.db`
3. **Restart backend:** `cd backend && npm run develop`
4. **Setup admin account:** http://localhost:1337/admin
5. **Enable public registration** in Strapi admin
6. **Create user account:** http://localhost:3000/auth/signup
7. **Try signing in:** http://localhost:3000/auth/signin

The 500 error usually indicates a corrupted database or missing configuration that gets fixed with a fresh start.
