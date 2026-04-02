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
        try {
          console.log('🔐 Attempting authentication for:', credentials.email);
          console.log('🌐 API URL:', process.env.NEXT_PUBLIC_API_URL);
          
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
          
          console.log('📡 Response status:', res.status);
          console.log('📦 Response data:', data);

          if (res.ok && data.user) {
            console.log('✅ Authentication successful for:', data.user.email);
            return {
              id: data.user.id,
              name: data.user.username,
              email: data.user.email,
              token: data.jwt,
            };
          }

          console.error('❌ Authentication failed:', data.error?.message || 'Unknown error');
          return null;
        } catch (error) {
          console.error('❌ Authentication exception:', error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Store JWT token from Strapi in the session token
      if (user) {
        token.id = user.id;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      // Make JWT token accessible in session for API calls
      session.user.id = token.id;
      session.accessToken = token.accessToken;
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };