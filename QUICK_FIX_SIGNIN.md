# Quick Fix for "CredentialsSignin" Error

## The Problem
Your sign-in is failing with "CredentialsSignin" error because the Strapi backend is returning a **500 Internal Server Error**.

## Quick Fix (Do This Now)

### 1. Check Backend Terminal
Look at the terminal where Strapi is running. You should see error messages that explain what's wrong.

### 2. Restart Strapi Backend
```bash
# Stop the current backend (Ctrl+C in the terminal)
# Then restart it:
cd backend
npm run develop
```

### 3. Watch for Errors
When Strapi starts, watch for any error messages. Common issues:
- Database connection errors
- Missing dependencies
- Configuration errors

### 4. Create a Test User

Once Strapi is running without errors:

1. Go to: http://localhost:1337/admin
2. Log in to the admin panel
3. Go to: **Content Manager** → **User** (under Users-Permissions)
4. Click **Create new entry**
5. Fill in:
   ```
   Username: testuser
   Email: test@example.com
   Password: Test123456
   Confirmed: ✓ (check this box)
   Blocked: ☐ (leave unchecked)
   Role: Authenticated
   ```
6. Click **Save**

### 5. Test Sign In

Now try signing in at: http://localhost:3000/auth/signin

Use:
- Email: `test@example.com`
- Password: `Test123456`

## If It Still Doesn't Work

### Check Strapi Permissions

1. In Strapi admin: **Settings** → **Users & Permissions Plugin** → **Roles**
2. Click **Public**
3. Expand **Users-Permissions**
4. Make sure these are checked:
   - ✅ register
   - ✅ callback
   - ✅ connect
5. Click **Save**

### Verify Backend is Responding

Open PowerShell and run:

```powershell
Invoke-WebRequest -Uri "http://localhost:1337/api/auth/local" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"identifier":"test@example.com","password":"Test123456"}'
```

**Expected**: Should return status 200 with a JWT token
**If you get 500**: Check the Strapi terminal for the actual error

## What's Happening

1. Frontend calls NextAuth's `signIn('credentials', ...)`
2. NextAuth calls the `authorize` function in `/api/auth/[...nextauth]/route.js`
3. That function calls Strapi at `http://localhost:1337/api/auth/local`
4. **Strapi returns 500 error** ← This is the problem
5. `authorize` returns `null`
6. NextAuth throws "CredentialsSignin" error

## The Real Error

The "CredentialsSignin" is just NextAuth's way of saying "authentication failed". The real error is in the Strapi backend. Check the Strapi terminal output to see what's actually wrong.

## Common Backend Errors

### "Cannot find module"
```bash
cd backend
npm install
npm run develop
```

### "Database locked"
```bash
# Stop all Node processes
taskkill /F /IM node.exe
# Restart
cd backend
npm run develop
```

### "JWT_SECRET is required"
Check that `backend/.env` has:
```env
JWT_SECRET=CXLaIp89HqFatFbm2drv5Q==
```

## Success Indicators

When it's working, you'll see in the browser console:
```
🔐 Attempting authentication for: test@example.com
📡 Response status: 200
✅ Authentication successful for: test@example.com
```

And the user will be redirected to the home page.

## Still Stuck?

Share the **exact error message** from the Strapi backend terminal (not the browser console).
