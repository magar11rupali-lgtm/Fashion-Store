# Wishlist Removal Internal Server Error - Fix Guide

## Problem Summary

The wishlist removal feature is failing with "Internal Server Error" (500). Investigation reveals that the Strapi backend's JWT authentication system is completely broken.

## Root Cause

The backend is throwing "Forbidden access" errors during JWT token verification. This affects:
- User login (`/api/auth/local`)
- User registration (`/api/auth/local/register`)
- Protected endpoints (`/api/users/me`, `/api/wishlists/*`)

Error location: `@strapi/plugin-users-permissions/dist/server/strategies/users-permissions.js:102`

## Diagnosis

All authentication operations are failing:
```
error: Forbidden access
ForbiddenError: Forbidden access
    at Object.verify (users-permissions\dist\server\strategies\users-permissions.js:102:19)
```

This indicates the JWT_SECRET configuration is invalid or missing.

## Solution

### Step 1: Fix the JWT_SECRET in backend/.env

1. Open `backend/.env` file
2. Check if `JWT_SECRET` is set to a proper value (NOT "tobemodified")
3. If it's set to "tobemodified" or is missing, generate a new secret:

```bash
# Generate a new JWT secret (run in backend directory)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

4. Update the `.env` file with the new secret:

```env
JWT_SECRET=<your-generated-secret-here>
```

### Step 2: Verify all required environment variables

Ensure these are all set in `backend/.env`:

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS="<random-key-1>,<random-key-2>"
API_TOKEN_SALT=<random-salt>
ADMIN_JWT_SECRET=<random-secret>
TRANSFER_TOKEN_SALT=<random-salt>
JWT_SECRET=<random-secret>
```

To generate random values:
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

### Step 3: Restart the backend

```bash
cd backend
npm run develop
```

### Step 4: Test authentication

Run this test to verify authentication works:

```bash
node test-basic-auth.js
```

Expected output:
- ✓ API is accessible
- ✓ Protected endpoint correctly requires auth (401/403)
- ✓ Login successful
- ✓ Token works!

### Step 5: Test wishlist removal

Once authentication is working, test the wishlist removal:

1. Sign in to the frontend
2. Add items to wishlist
3. Try to remove an item
4. Should work without "Internal Server Error"

## Alternative Solution: Reset the Database

If the above doesn't work, the database might be corrupted:

```bash
cd backend
# Backup current database
copy .tmp\data.db .tmp\data.db.backup

# Delete the database
del .tmp\data.db

# Restart Strapi (it will create a new database)
npm run develop
```

Note: This will delete all data including users, products, etc.

## Prevention

1. Never commit `.env` files with default values
2. Always generate strong random secrets for production
3. Document the required environment variables in `.env.example`

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Can create new user account
- [ ] Can login with credentials
- [ ] JWT token works for protected endpoints
- [ ] Can add items to wishlist
- [ ] Can remove items from wishlist
- [ ] Frontend shows success/error messages correctly

## Additional Notes

The frontend error handling is working correctly - it's catching the 500 error and displaying "Internal Server Error". The issue is entirely on the backend side with JWT verification.

Once the JWT_SECRET is fixed, all authentication-dependent features (wishlist, orders, profile, etc.) should work properly.
