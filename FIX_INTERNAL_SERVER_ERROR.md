# Fix for Internal Server Error

## Problem
Multiple "Internal Server Error" messages appearing on the page, likely caused by:
1. Failed API calls to the backend
2. Authentication token issues
3. Error notifications stacking up

## Quick Fix Steps

### Step 1: Check Backend is Running
```bash
cd backend
npm run develop
```

Make sure the backend is running on `http://localhost:1337`

### Step 2: Check Frontend Environment Variables
Verify `frontend/.env.local` has:
```
NEXT_PUBLIC_API_URL=http://localhost:1337/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### Step 3: Clear Browser Data
1. Open browser DevTools (F12)
2. Go to Application tab
3. Clear:
   - Local Storage
   - Session Storage
   - Cookies
4. Refresh the page

### Step 4: Check Network Tab
1. Open DevTools Network tab
2. Look for failed requests (red status codes)
3. Check which endpoints are failing:
   - `/api/wishlists` - Wishlist operations
   - `/api/products` - Product loading
   - `/api/auth` - Authentication

### Step 5: Test Authentication
1. Sign out if logged in
2. Sign in again
3. Check if errors persist

## Common Causes & Solutions

### Cause 1: Backend Not Running
**Solution:** Start the backend server
```bash
cd backend
npm run develop
```

### Cause 2: CORS Issues
**Solution:** Check `backend/config/middlewares.ts` has proper CORS settings:
```typescript
origin: ['http://localhost:3000']
```

### Cause 3: Invalid Authentication Token
**Solution:** 
1. Sign out
2. Clear browser storage
3. Sign in again

### Cause 4: Database Issues
**Solution:** Check backend console for database errors

### Cause 5: Missing Product Data
**Solution:** Ensure products have all required fields (name, price, image)

## Debug Script

Run this in browser console to diagnose:
```javascript
// Check session
console.log('Session:', sessionStorage);

// Check API URL
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

// Test API connection
fetch('http://localhost:1337/api/products')
  .then(r => r.json())
  .then(d => console.log('Products:', d))
  .catch(e => console.error('API Error:', e));
```

## Prevention

### Add Error Boundary
The app already has an ErrorBoundary component. Make sure it's wrapping your pages.

### Limit Notification Stack
The notification system auto-dismisses after 3 seconds, but you can limit the number of visible notifications by modifying `useNotification.js`:

```javascript
const MAX_NOTIFICATIONS = 3;

setNotifications(prev => {
  const updated = [...prev, notification];
  return updated.slice(-MAX_NOTIFICATIONS); // Keep only last 3
});
```

## Next Steps

1. Check backend console for specific error messages
2. Check frontend console for detailed error logs
3. Verify all environment variables are set correctly
4. Test each feature individually to isolate the issue
