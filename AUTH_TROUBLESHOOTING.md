# Authentication Troubleshooting Guide

## Issue: Unable to Sign In During Checkout

If you're getting "Invalid email or password" when trying to sign in, follow these steps:

## Step 1: Verify Backend is Running

The Strapi backend must be running on `http://localhost:1337`

```bash
# Navigate to backend folder
cd backend

# Start Strapi
npm run develop
```

You should see:
```
[2024-XX-XX XX:XX:XX.XXX] info: Server started on http://localhost:1337
```

## Step 2: Create a User Account

Before signing in, you need to create an account:

1. Go to `http://localhost:3000/auth/signup`
2. Fill in the form:
   - Username: (any username)
   - Email: (your email)
   - Password: (at least 6 characters)
   - Confirm Password: (same as password)
3. Click "Sign Up"
4. You should see "Account created successfully!"

## Step 3: Verify User in Strapi Admin

1. Go to `http://localhost:1337/admin`
2. Login to Strapi admin panel
3. Navigate to Content Manager → Users
4. Verify your user account exists

## Step 4: Test Sign In

1. Go to `http://localhost:3000/auth/signin`
2. Enter the EXACT email and password you used during signup
3. Click "Sign In"

## Common Issues and Solutions

### Issue: "Invalid email or password"

**Possible Causes:**
1. No user account exists - Create one at `/auth/signup`
2. Wrong credentials - Double-check email and password
3. Backend not running - Start Strapi backend
4. Database issue - Check backend console for errors

**Solution:**
- Create a new account first
- Use the exact credentials you registered with
- Ensure backend is running on port 1337

### Issue: Backend Connection Error

**Symptoms:**
- Network error in browser console
- "Failed to fetch" error

**Solution:**
```bash
# Check if backend is running
cd backend
npm run develop
```

### Issue: CORS Error

**Symptoms:**
- CORS policy error in browser console

**Solution:**
Check `backend/config/middlewares.ts` has proper CORS settings:
```typescript
export default [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'http:', 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'http:', 'https:'],
          'media-src': ["'self'", 'data:', 'blob:', 'http:', 'https:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:3000'],
      credentials: true,
    },
  },
  // ... other middlewares
];
```

## Testing Authentication Flow

### Test 1: Create Account
```bash
# Using curl
curl -X POST http://localhost:1337/api/auth/local/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected: Returns user object with JWT token

### Test 2: Sign In
```bash
# Using curl
curl -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "password123"
  }'
```

Expected: Returns user object with JWT token

## Environment Variables

Verify these are set correctly:

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:1337/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### Backend (.env)
```
HOST=0.0.0.0
PORT=1337
JWT_SECRET=your-jwt-secret
```

## Quick Fix Checklist

- [ ] Backend is running on port 1337
- [ ] Frontend is running on port 3000
- [ ] User account has been created via signup
- [ ] Using correct email and password
- [ ] No CORS errors in browser console
- [ ] Environment variables are set correctly
- [ ] Database file exists at `backend/.tmp/data.db`

## Still Having Issues?

1. Check browser console for errors (F12 → Console)
2. Check backend terminal for errors
3. Try creating a new user account
4. Clear browser cache and cookies
5. Restart both frontend and backend servers

## Contact Support

If none of these solutions work, provide:
- Browser console errors
- Backend terminal output
- Steps you've already tried
