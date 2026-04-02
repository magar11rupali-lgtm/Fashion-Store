# Fix Server Error - Forbidden Access

## Problem
You're getting a 500 Internal Server Error when trying to remove items from wishlist:
```
error: Forbidden access
ForbiddenError: Forbidden access
http: DELETE /api/wishlists/1 (24 ms) 500
```

## Root Cause
Your JWT authentication token has expired or is invalid. Strapi is rejecting the request because it can't verify your identity.

## Quick Fix (Recommended)

### Step 1: Sign Out and Sign In Again
1. Open your browser at http://localhost:3000
2. Click on your profile/account icon
3. Click "Sign Out"
4. Go to http://localhost:3000/auth/signin
5. Sign in with your credentials
6. Try removing wishlist items again

This will refresh your JWT token and fix the authentication issue.

## Alternative Fix: Clear Browser Storage

If signing out/in doesn't work:

1. Open browser DevTools (F12)
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Under "Local Storage", select http://localhost:3000
4. Delete all items or just the session-related ones
5. Refresh the page
6. Sign in again

## Technical Details

### What's Happening
- The frontend is sending a JWT token with the DELETE request
- Strapi's authentication middleware is rejecting the token
- The `is-authenticated` policy is returning false
- This causes a 500 error instead of a proper 401 Unauthorized

### Why This Happens
- JWT tokens have an expiration time (usually 30 days)
- If you haven't signed in recently, your token may have expired
- Browser storage can also become corrupted

### The Fix
Signing out and signing in again generates a fresh JWT token that Strapi will accept.

## Verify the Fix

After signing in again, test wishlist removal:

1. Add some products to your wishlist
2. Open the wishlist drawer
3. Click "Remove" on any item
4. You should see:
   - ✅ Item disappears immediately
   - ✅ Green notification: "Removed from wishlist"
   - ✅ No errors in console

## Check Backend Logs

After the fix, your backend logs should show:
```
http: DELETE /api/wishlists/1 (24 ms) 200
```

Instead of:
```
error: Forbidden access
http: DELETE /api/wishlists/1 (24 ms) 500
```

## Still Having Issues?

If the problem persists after signing in again:

### Check 1: Verify Backend is Running
```bash
cd backend
npm run develop
```

### Check 2: Check JWT Secret
Make sure `backend/.env` has:
```
JWT_SECRET=your-secret-key-here
```

### Check 3: Verify User Exists
1. Go to http://localhost:1337/admin
2. Navigate to Content Manager → Users
3. Verify your user account exists

### Check 4: Test Authentication Manually
```bash
# Test login
curl -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "your-email@example.com",
    "password": "your-password"
  }'
```

You should get a response with a JWT token.

## Prevention

To avoid this issue in the future:
- Sign in regularly (tokens expire after 30 days by default)
- Don't manually edit browser localStorage
- Keep your backend running while using the app

## Summary

The "Forbidden access" error is an authentication issue. Simply sign out and sign in again to get a fresh JWT token, and the wishlist removal will work perfectly.
