# Immediate Steps to Fix Internal Server Errors

## What I've Done

1. **Limited notification stacking** - Now shows max 3 notifications and prevents duplicates
2. **Improved error messages** - More user-friendly error messages instead of generic "Internal Server Error"
3. **Better error handling** - Prevents error cascades in wishlist operations
4. **Created diagnostic tools** - Scripts to help identify the root cause

## What You Need to Do Now

### Step 1: Run Diagnostics (30 seconds)
```bash
node diagnose-errors.js
```

This will tell you exactly what's wrong.

### Step 2: Most Likely Fix - Restart Backend
```bash
cd backend
npm run develop
```

The backend might have crashed or lost database connection.

### Step 3: Clear Browser Data
1. Press F12 to open DevTools
2. Go to Application tab
3. Click "Clear storage" button
4. Refresh the page (Ctrl+R or Cmd+R)

### Step 4: Check What's Failing

Open DevTools Network tab and look for:
- Red/failed requests
- 500 status codes
- Which endpoint is failing

Common failing endpoints:
- `/api/wishlists` - Wishlist operations
- `/api/products` - Product loading  
- `/api/auth/callback` - Authentication

## Quick Checks

### Is Backend Running?
Visit: http://localhost:1337/admin
- If it loads → Backend is running
- If it doesn't → Start backend with `npm run develop`

### Is Frontend Connected?
Check `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:1337/api
```

### Are You Signed In?
- Try signing out and signing in again
- This refreshes your authentication token

## What Each Error Means

### "Internal Server Error" (500)
- Backend crashed or has a bug
- Check backend console for stack traces
- Usually fixed by restarting backend

### "Unauthorized" (401)
- Your session expired
- Sign out and sign in again

### "Forbidden" (403)
- You don't have permission
- Check if you're signed in
- Check backend policies

### Network Error
- Backend is not running
- Wrong API URL in .env.local
- CORS misconfiguration

## Still Not Working?

### Check Backend Console
Look for error messages like:
- Database connection errors
- Missing environment variables
- TypeScript compilation errors
- Port already in use

### Check Frontend Console
Look for:
- Failed fetch requests
- Authentication errors
- Missing environment variables

### Nuclear Option (Last Resort)
```bash
# Stop everything
# Close all terminals

# Backend
cd backend
rm -rf node_modules
rm -rf .tmp/data.db
npm install
npm run develop

# Frontend (in new terminal)
cd frontend
rm -rf .next
npm run dev

# Clear browser completely
# Close browser
# Reopen and go to http://localhost:3000
```

## Prevention

The fixes I made will prevent the error notification spam, but you still need to fix the root cause (likely backend issue).

## Need More Help?

Run the diagnostic script and share the output:
```bash
node diagnose-errors.js
```

Also check:
1. Backend console output
2. Frontend console errors
3. Network tab in DevTools
