# Step-by-Step Fix for "Invalid Email or Password" Error

## What's Wrong?
Your backend database is corrupted, causing login to fail with a 500 error. This shows as "Invalid email or password" on the frontend.

## The Fix (5 Minutes)

### ⚠️ IMPORTANT: Read All Steps Before Starting

---

## Step 1: Stop Backend Server

In the terminal where backend is running, press:
```
Ctrl + C
```

Wait for it to stop completely.

---

## Step 2: Delete Database (Automated)

**Option A - Use the batch script:**
```bash
reset-backend.bat
```

**Option B - Manual deletion:**
```bash
del backend\.tmp\data.db
```

Verify it's deleted:
```bash
dir backend\.tmp
```

You should NOT see `data.db` in the list.

---

## Step 3: Start Backend

```bash
cd backend
npm run develop
```

**Wait for this message:**
```
[INFO] Server started on http://localhost:1337
```

**⚠️ Do NOT proceed until you see this message!**

---

## Step 4: Create Admin Account

1. Open browser
2. Go to: **http://localhost:1337/admin**
3. You'll see: "Create the first administrator"
4. Fill in:
   ```
   First name: Admin
   Last name: User
   Email: admin@example.com
   Password: Admin123456
   Confirm Password: Admin123456
   ```
5. Click: **"Let's start"**

You'll be logged into Strapi admin panel.

---

## Step 5: Enable Public Registration

**This is the MOST IMPORTANT step!**

1. In Strapi admin panel, look at left sidebar
2. Scroll down and click: **Settings** (gear icon)
3. Under "USERS & PERMISSIONS PLUGIN", click: **Roles**
4. Click on: **Public** (the role, not the button)
5. Scroll down to find: **Permissions** section
6. Find: **Users-permissions** (expand it if collapsed)
7. Check ALL these boxes:
   ```
   ✅ callback
   ✅ connect  
   ✅ emailConfirmation
   ✅ forgotPassword
   ✅ register
   ✅ resetPassword
   ```
8. Scroll to top right
9. Click: **Save** button

**⚠️ You MUST click Save or changes won't apply!**

---

## Step 6: Verify Fix

Run the test script:
```bash
node fix-auth-automated.js
```

**Expected output:**
```
✅ Registration works!
✅ Login works!
✅ AUTHENTICATION IS WORKING!
```

**If you see this, you're done! Skip to Step 8.**

**If you still see errors:**
- Go back to Step 5
- Make sure you clicked Save
- Make sure you enabled ALL the permissions
- Try refreshing the Strapi admin page

---

## Step 7: Start Frontend (if not running)

Open a NEW terminal:
```bash
cd frontend
npm run dev
```

Wait for:
```
✓ Ready in X.Xs
○ Local: http://localhost:3000
```

---

## Step 8: Create Your Account

1. Open browser
2. Go to: **http://localhost:3000/auth/signup**
3. Fill in:
   ```
   Username: magar11rupa
   Email: magar11rupa@gmail.com
   Password: Test123456
   Confirm Password: Test123456
   ```
4. Click: **"Sign Up"**
5. You should see: **"Account created successfully!"**

---

## Step 9: Test Sign In

1. Go to: **http://localhost:3000/auth/signin**
2. Enter:
   ```
   Email: magar11rupa@gmail.com
   Password: Test123456
   ```
3. Click: **"Sign In"**
4. You should be redirected to home page
5. You should see your username in the header

---

## ✅ Success!

You can now:
- Sign in and out
- Add items to cart
- Proceed to checkout
- View your profile
- Place orders

---

## Troubleshooting

### Problem: "Email is already taken" during signup

**Solution:** Use a different email or delete database again and restart from Step 2.

### Problem: Still getting "Invalid email or password"

**Check these:**

1. **Did you enable public registration?**
   - Go to http://localhost:1337/admin
   - Settings → Roles → Public
   - Verify all auth permissions are checked
   - Make sure you clicked Save

2. **Is the account created?**
   - In Strapi admin: Content Manager → User
   - You should see your user account
   - If not, try signing up again

3. **Are you using the correct password?**
   - Passwords are case-sensitive
   - Must be at least 6 characters
   - No extra spaces

4. **Check backend terminal for errors**
   - Look for red error messages
   - If you see "500" errors, restart from Step 1

### Problem: Backend won't start

**Error: "Port 1337 is already in use"**

Solution:
```bash
# Find process using port 1337
netstat -ano | findstr :1337

# Kill the process (replace XXXX with PID from above)
taskkill /PID XXXX /F

# Start backend again
cd backend
npm run develop
```

### Problem: Frontend won't start

**Error: "Port 3000 is already in use"**

Solution:
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace XXXX with PID from above)
taskkill /PID XXXX /F

# Start frontend again
cd frontend
npm run dev
```

---

## Quick Reference

**Backend:** http://localhost:1337/admin
**Frontend:** http://localhost:3000
**Sign Up:** http://localhost:3000/auth/signup
**Sign In:** http://localhost:3000/auth/signin

**Test Script:** `node fix-auth-automated.js`

---

## Why This Works

The 500 error during login indicates the database has corrupted password hashes or missing relations. Resetting the database and properly configuring Strapi creates a clean state where:

1. Password hashing works correctly
2. User roles are properly configured
3. JWT tokens are generated correctly
4. Authentication flow works end-to-end

---

## Need More Help?

If you're still stuck:

1. Run: `node fix-auth-automated.js`
2. Copy the output
3. Check backend terminal for errors
4. Check browser console (F12) for errors
5. Share all three outputs

The automated script will tell you exactly what's wrong.
