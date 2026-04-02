# Day 12: User Authentication \u0026 Account Management

## 🎯 Learning Objectives

By the end of today, you will:
- Implement user authentication with NextAuth.js
- Create login and signup pages
- Protect routes with middleware
- Build user profile management

## ⏱️ Estimated Time: 5-6 hours

---

## 📝 Tasks \u0026 Subtasks

### Task 12.1: Set Up NextAuth.js

**Subtask 12.1.1: Install dependencies**

```bash
cd frontend
npm install next-auth@latest
npm install bcryptjs
```

**Subtask 12.1.2: Create authentication API route**

Create `frontend/app/api/auth/[...nextauth]/route.js`:

```javascript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Call your Strapi authentication endpoint
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: credentials.email,
            password: credentials.password,
          }),
        });

        const data = await res.json();

        if (res.ok && data.user) {
          return {
            id: data.user.id,
            name: data.user.username,
            email: data.user.email,
            token: data.jwt,
          };
        }

        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
```

**Subtask 12.1.3: Update environment variables**

Add to `frontend/.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

### Task 12.2: Create Strapi User System

**Subtask 12.2.1: Enable Strapi authentication**

In Strapi admin:
1. Go to Settings → Users & Permissions plugin → Providers
2. Enable Email provider
3. Go to Roles → Public
4. Enable `auth/local` and `auth/local/register` endpoints

**Subtask 12.2.2: Create user profile fields**

In Strapi Content-Type Builder:
1. Extend `User` collection type
2. Add fields:
   - `phone` (Text)
   - `address` (Text)
   - `city` (Text)
   - `postalCode` (Text)
   - `country` (Text)

---

### Task 12.3: Create Sign In Page

Create `frontend/app/auth/signin/page.js`:

```javascript
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    setIsLoading(false);

    if (result.error) {
      setError('Invalid email or password');
    } else {
      router.push('/');
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div>
      <Header />
      <main className=\"container mx-auto px-6 py-12\">
        <div className=\"max-w-md mx-auto bg-white p-8 rounded-lg border\">
          <h1 className=\"text-3xl font-bold text-gray-900 mb-6 text-center\">
            Sign In
          </h1>

          {error && (
            <div className=\"bg-red-50 text-red-600 p-3 rounded-lg mb-4\">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className=\"space-y-4\">
            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                Email
              </label>
              <input
                type=\"email\"
                name=\"email\"
                value={formData.email}
                onChange={handleChange}
                required
                className=\"w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500\"
              />
            </div>

            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                Password
              </label>
              <input
                type=\"password\"
                name=\"password\"
                value={formData.password}
                onChange={handleChange}
                required
                className=\"w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500\"
              />
            </div>

            <button
              type=\"submit\"
              disabled={isLoading}
              className=\"w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400\"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className=\"my-6 flex items-center\">
            <div className=\"flex-1 border-t border-gray-300\"></div>
            <span className=\"px-4 text-gray-500 text-sm\">OR</span>
            <div className=\"flex-1 border-t border-gray-300\"></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className=\"w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2\"
          >
            <svg className=\"w-5 h-5\" viewBox=\"0 0 24 24\">
              <path fill=\"#4285F4\" d=\"M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z\"/>
              <path fill=\"#34A853\" d=\"M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z\"/>
              <path fill=\"#FBBC05\" d=\"M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z\"/>
              <path fill=\"#EA4335\" d=\"M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z\"/>
            </svg>
            Continue with Google
          </button>

          <p className=\"mt-6 text-center text-gray-600\">
            Don't have an account?{' '}
            <Link href=\"/auth/signup\" className=\"text-blue-600 hover:underline\">
              Sign Up
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

---

### Task 12.4: Create Sign Up Page

Create `frontend/app/auth/signup/page.js`:

```javascript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/auth/signin?registered=true');
      } else {
        setErrors({ general: data.error?.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <main className=\"container mx-auto px-6 py-12\">
        <div className=\"max-w-md mx-auto bg-white p-8 rounded-lg border\">
          <h1 className=\"text-3xl font-bold text-gray-900 mb-6 text-center\">
            Create Account
          </h1>

          {errors.general && (
            <div className=\"bg-red-50 text-red-600 p-3 rounded-lg mb-4\">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className=\"space-y-4\">
            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                Username
              </label>
              <input
                type=\"text\"
                name=\"username\"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.username ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
              />
              {errors.username && (
                <p className=\"text-red-500 text-sm mt-1\">{errors.username}</p>
              )}
            </div>

            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                Email
              </label>
              <input
                type=\"email\"
                name=\"email\"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
              />
              {errors.email && (
                <p className=\"text-red-500 text-sm mt-1\">{errors.email}</p>
              )}
            </div>

            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                Password
              </label>
              <input
                type=\"password\"
                name=\"password\"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
              />
              {errors.password && (
                <p className=\"text-red-500 text-sm mt-1\">{errors.password}</p>
              )}
            </div>

            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                Confirm Password
              </label>
              <input
                type=\"password\"
                name=\"confirmPassword\"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
              />
              {errors.confirmPassword && (
                <p className=\"text-red-500 text-sm mt-1\">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type=\"submit\"
              disabled={isLoading}
              className=\"w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400\"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className=\"mt-6 text-center text-gray-600\">
            Already have an account?{' '}
            <Link href=\"/auth/signin\" className=\"text-blue-600 hover:underline\">
              Sign In
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

---

### Task 12.5: Create Session Provider

Create `frontend/components/SessionProvider.jsx`:

```jsx
'use client';

import { SessionProvider as NextAuthProvider } from 'next-auth/react';

export default function SessionProvider({ children }) {
  return <NextAuthProvider>{children}</NextAuthProvider>;
}
```

Update `frontend/app/layout.js`:

```javascript
import { CartProvider } from '@/context/CartContext';
import SessionProvider from '@/components/SessionProvider';

export default function RootLayout({ children }) {
  return (
    <html lang=\"en\">
      <body>
        <SessionProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

---

### Task 12.6: Update Header with Auth

Update `frontend/components/Header.jsx` to show user info:

```jsx
'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import Cart from './Cart';

export default function Header() {
  const { data: session } = useSession();
  const { totalItems, setIsOpen } = useCart();

  return (
    <>
      <header className=\"bg-white shadow-md sticky top-0 z-30\">
        <nav className=\"container mx-auto px-6 py-4\">
          <div className=\"flex justify-between items-center\">
            <Link href=\"/\" className=\"text-2xl font-bold text-gray-800\">
              Fashion Store
            </Link>
            
            <div className=\"hidden md:flex space-x-8\">
              <Link href=\"/\" className=\"text-gray-700 hover:text-blue-600\">
                Home
              </Link>
              <Link href=\"/products\" className=\"text-gray-700 hover:text-blue-600\">
                Shop
              </Link>
            </div>
            
            <div className=\"flex items-center space-x-4\">
              {session ? (
                <div className=\"relative group\">
                  <button className=\"flex items-center space-x-2 text-gray-700 hover:text-blue-600\">
                    <span>👤</span>
                    <span className=\"hidden md:inline\">{session.user.name}</span>
                  </button>
                  
                  <div className=\"absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all\">
                    <Link
                      href=\"/profile\"
                      className=\"block px-4 py-2 text-gray-700 hover:bg-gray-100\"
                    >
                      My Profile
                    </Link>
                    <Link
                      href=\"/orders\"
                      className=\"block px-4 py-2 text-gray-700 hover:bg-gray-100\"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className=\"w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100\"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href=\"/auth/signin\"
                  className=\"text-gray-700 hover:text-blue-600\"
                >
                  Sign In
                </Link>
              )}
              
              <button
                onClick={() => setIsOpen(true)}
                className=\"relative text-gray-700 hover:text-blue-600 flex items-center gap-2\"
              >
                <span className=\"text-2xl\">🛒</span>
                {totalItems > 0 && (
                  <span className=\"absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center\">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>
      
      <Cart />
    </>
  );
}
```

---

## 🤖 AI Prompts for Students

```
\"How do I set up NextAuth.js in Next.js 14?\"

\"Show me how to create a login form with validation\"

\"How do I integrate Google OAuth with NextAuth?\"

\"How do I protect routes in Next.js?\"

\"How do I check if a user is logged in with NextAuth?\"

\"Help me: NextAuth session is not persisting\"

\"How do I add custom fields to Strapi user model?\"
```

---

## ✅ Testing \u0026 Validation

- [ ] Sign up creates new user in Strapi
- [ ] Sign in works with email/password
- [ ] Google sign in works (if configured)
- [ ] Session persists across page refreshes
- [ ] User dropdown shows in header when logged in
- [ ] Sign out clears session
- [ ] Form validation works on signup
- [ ] Error messages display correctly
- [ ] Password mismatch is detected
- [ ] Invalid credentials show error
- [ ] Redirect to homepage after login

---

## 🏠 Homework

1. **Create a Profile Page**
   - Display user information
   - Edit profile form
   - Update user data in Strapi

2. **Add Protected Routes**
   - Create middleware to protect `/profile` and `/orders`
   - Redirect unauthorized users to login

3. **Add Email Verification**
   - Send verification email on signup
   - Verify email before allowing login

4. **Add Forgot Password**
   - Password reset form
   - Send reset link to email

---

## 📚 What You Learned Today

- ✅ NextAuth.js setup and configuration
- ✅ Email/password authentication
- ✅ OAuth integration (Google)
- ✅ Session management
- ✅ Protected routes
- ✅ User registration and login flows
- ✅ Strapi user management
- ✅ Form validation for auth forms

---

## 🎉 Congratulations!

You've completed Day 12! Your e-commerce site now has user authentication with both email/password and Google sign-in.

**Tomorrow:** We'll implement order management so users can track their purchases!

---

[← Day 11: Admin Dashboard](./day-11-admin-dashboard-shadcn.md) | [Back to Overview](./README.md) | [Day 13: Order Management →](./day-13-order-management.md)
