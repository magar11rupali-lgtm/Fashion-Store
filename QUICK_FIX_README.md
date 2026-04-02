# Quick Fix for Sign-In Error

## The Problem
"Invalid email or password" error when signing in.

## The Solution (3 Commands)

### 1. Reset Database
```bash
reset-backend.bat
```

### 2. Restart Backend
```bash
cd backend
npm run develop
```

Wait for: `Server started on http://localhost:1337`

### 3. Setup Strapi

Go to: **http://localhost:1337/admin**

- Create admin account
- Settings → Roles → Public
- Enable all **auth** permissions
- Click **Save**

### 4. Test It Works
```bash
node fix-auth-automated.js
```

Should show: `✅ AUTHENTICATION IS WORKING!`

### 5. Create Your Account

Go to: **http://localhost:3000/auth/signup**

Fill in your details and sign up.

### 6. Sign In

Go to: **http://localhost:3000/auth/signin**

Use the credentials you just created.

---

## Done! 🎉

For detailed instructions, see: **STEP_BY_STEP_FIX.md**

For troubleshooting, see: **COMPLETE_FIX_SOLUTION.md**
