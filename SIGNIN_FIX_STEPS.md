# Sign In Issue - Fix Steps

## Current Problem
The sign-in functionality is not working. Backend is returning 500 Internal Server Error for authentication requests.

## Root Cause
The backend is experiencing internal errors when processing authentication requests. This could be due to:
1. Backend not properly restarted after recent changes
2. Database connection issues
3. Missing or corrupted user data
4. Configuration issues

## Fix Steps

### Step 1: Restart the Backend Server
The backend needs to be restarted to apply the recent changes to the wishlist controller.

```bash
# Stop the current backend server (Ctrl+C in the terminal running it)
# Then restart it:
cd backend
npm run develop
```

### Step 2: Check Backend Logs
When you restart the backend, watch for any error messages in the terminal. Look for:
- Database connection errors
- Missing environment variables
- Plugin initialization errors
- TypeScript compilation errors

### Step 3: Verify Backend is Running Properly
Once restarted, check:
1. Backend admin panel: http://localhost:1337/admin
2. If you can access the admin panel, the backend is working

### Step 4: Create a Test User (if needed)
If no users exist in the database:

**Option A: Via Strapi Admin Panel**
1. Go to http://localhost:1337/admin
2. Navigate to Content Manager → Users (under Users & Permissions Plugin)
3. Create a new user with:
   - Username: testuser
   - Email: test@example.com
   - Password: Test123456
   - Confirmed: Yes
   - Blocked: No

**Option B: Via Frontend Signup**
1. Go to http://localhost:3000/auth/signup
2. Create a new account
3. Then try signing in

### Step 5: Test Sign In
After the backend is restarted and a user exists:

```bash
node test-signin-issue.js
```

This will test:
- Backend connectivity
- Authentication endpoint
- Protected endpoints (wishlist)

### Step 6: Test Frontend Sign In
1. Go to http://localhost:3000/auth/signin
2. Enter credentials:
   - Email: test@example.com
   - Password: Test123456
3. Click "Sign In"

## What We Fixed

### 1. Wishlist API Query (frontend/lib/wishlist.js)
**Problem:** The frontend was passing the JWT token as a user ID filter
```javascript
// BEFORE (incorrect)
`${API_URL}/wishlists?populate=product.image&filters[user][id][$eq]=${userToken}`

// AFTER (correct)
`${API_URL}/wishlists?populate=product.image`
```

### 2. Wishlist Controller Response Format (backend/src/api/wishlist/controllers/wishlist.ts)
**Problem:** The controller was returning raw entities instead of properly formatted Strapi API responses

**Fixed all methods to use:**
```typescript
const sanitizedResults = await this.sanitizeOutput(entities, ctx);
return this.transformResponse(sanitizedResults);
```

This ensures responses have the correct structure:
```json
{
  "data": [...],
  "meta": {...}
}
```

## Next Steps

1. **Restart the backend server** - This is the most critical step
2. Check backend logs for any errors
3. Verify you can access http://localhost:1337/admin
4. Create a test user if needed
5. Test sign in with the test script
6. Test sign in from the frontend

## If Issues Persist

If sign-in still doesn't work after restarting:

1. **Check backend terminal logs** - Look for specific error messages
2. **Check browser console** (F12) - Look for network errors or JavaScript errors
3. **Check frontend terminal** - Look for NextAuth logs
4. **Verify environment variables:**
   - Backend: Check `backend/.env` has all required keys
   - Frontend: Check `frontend/.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:1337/api`
5. **Try rebuilding:**
   ```bash
   cd backend
   npm run build
   npm run develop
   ```

## Testing Commands

```bash
# Test backend authentication
node test-signin-issue.js

# Test wishlist endpoint (after signing in)
node test-wishlist-backend.js
```
