# Sign In Error Fix - "CredentialsSignin"

## Problem
You're getting a "CredentialsSignin" error when trying to sign in. The root cause is that the Strapi backend is returning a **500 Internal Server Error** when the authentication endpoint is called.

## Root Cause Analysis

1. **Backend Error**: The Strapi backend at `http://localhost:1337/api/auth/local` is returning a 500 error
2. **NextAuth Behavior**: When the `authorize` function in NextAuth returns `null` (due to the failed API call), NextAuth throws a "CredentialsSignin" error
3. **Frontend Display**: The error appears in the browser console but the user sees "Invalid email or password"

## Diagnostic Steps Performed

```powershell
# Test 1: Check if backend is running
curl http://localhost:1337/api/users/me
# Result: 500 Internal Server Error

# Test 2: Test authentication endpoint
Invoke-WebRequest -Uri "http://localhost:1337/api/auth/local" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"identifier":"test@example.com","password":"Test123456"}'
# Result: 500 Internal Server Error
```

## Solution Steps

### Step 1: Check Backend Logs

1. Open the terminal where your Strapi backend is running
2. Look for error messages when you try to sign in
3. Common issues to look for:
   - Database connection errors
   - Missing environment variables
   - Plugin configuration errors
   - JWT secret issues

### Step 2: Restart the Backend

Sometimes the backend needs a fresh restart:

```bash
cd backend
npm run develop
```

### Step 3: Verify Database

Check if the database file exists and is accessible:

```bash
# Check if database file exists
dir backend\.tmp\data.db

# If it doesn't exist, Strapi will create it on startup
```

### Step 4: Check Environment Variables

Verify that all required environment variables are set in `backend/.env`:

```env
# These are critical for authentication
JWT_SECRET=CXLaIp89HqFatFbm2drv5Q==
ADMIN_JWT_SECRET=r0u1haDkldUd16SQp6u65Q==
API_TOKEN_SALT=4lRrExYWJ2yFxVWxHULWeQ==
```

### Step 5: Verify User Exists

1. Go to http://localhost:1337/admin
2. Navigate to **Content Manager** > **User** (under Users-Permissions)
3. Check if a user exists with the email you're trying to sign in with
4. Verify the user has:
   - `confirmed: true`
   - `blocked: false`
   - A valid password set

### Step 6: Create a Test User

If no users exist, create one:

1. In Strapi admin (http://localhost:1337/admin)
2. Go to **Content Manager** > **User**
3. Click **Create new entry**
4. Fill in:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test123456`
   - Confirmed: `true`
   - Blocked: `false`
   - Role: `Authenticated`
5. Click **Save**

### Step 7: Test Authentication Manually

After creating a user, test the authentication endpoint:

```powershell
Invoke-WebRequest -Uri "http://localhost:1337/api/auth/local" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"identifier":"test@example.com","password":"Test123456"}' | Select-Object -ExpandProperty Content
```

Expected response:
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "confirmed": true,
    "blocked": false
  }
}
```

### Step 8: Check Strapi Permissions

Ensure the authentication routes are publicly accessible:

1. In Strapi admin, go to **Settings** > **Users & Permissions Plugin** > **Roles**
2. Click on **Public**
3. Under **Permissions**, expand **Users-Permissions**
4. Make sure these are checked:
   - ✅ `auth` > `callback`
   - ✅ `auth` > `connect`
   - ✅ `auth` > `emailConfirmation`
   - ✅ `auth` > `forgotPassword`
   - ✅ `auth` > `register`
   - ✅ `auth` > `resetPassword`
5. Click **Save**

## Common Issues and Solutions

### Issue 1: "Cannot find module" errors
**Solution**: Reinstall dependencies
```bash
cd backend
npm install
```

### Issue 2: Database locked
**Solution**: Stop all Strapi instances and restart
```bash
# Kill all node processes
taskkill /F /IM node.exe
# Restart Strapi
cd backend
npm run develop
```

### Issue 3: CORS errors
**Solution**: Already configured in `backend/config/middlewares.ts`:
```typescript
{
  name: 'strapi::cors',
  config: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  },
}
```

### Issue 4: JWT Secret mismatch
**Solution**: Make sure `JWT_SECRET` in `backend/.env` matches what Strapi expects

## Testing the Fix

After applying the fixes:

1. **Test Backend Directly**:
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:1337/api/auth/local" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"identifier":"test@example.com","password":"Test123456"}'
   ```
   Should return 200 with JWT token

2. **Test Frontend Sign In**:
   - Go to http://localhost:3000/auth/signin
   - Enter the test credentials
   - Should redirect to home page with success message

3. **Check Browser Console**:
   - Should see: "✅ Authentication successful for: test@example.com"
   - Should NOT see: "Sign in error: CredentialsSignin"

## Next Steps

Once the backend is returning successful responses:

1. The "CredentialsSignin" error will disappear
2. Users will be able to sign in successfully
3. The session will be properly created
4. Protected routes will work correctly

## Need More Help?

If the issue persists:

1. Share the **exact error message** from the Strapi backend terminal
2. Check if there are any errors in `backend/logs/` directory
3. Verify Node.js version compatibility (Strapi 5 requires Node.js 18.x or 20.x)
4. Try creating a fresh Strapi project to test if it's a configuration issue

## Summary

The "CredentialsSignin" error is a symptom, not the root cause. The real issue is the Strapi backend returning 500 errors. Focus on:

1. ✅ Backend is running without errors
2. ✅ Database is accessible
3. ✅ User exists and is confirmed
4. ✅ Authentication endpoint returns 200 with JWT
5. ✅ Frontend can successfully authenticate

Once these are verified, the sign-in will work correctly.
