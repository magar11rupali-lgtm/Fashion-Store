import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Inter } from 'next/font/google';
import { CartProvider } from './context/CartContext';
import SessionProvider from './components/SessionProvider';
import { NotificationProvider } from '@/hooks/useNotification';
import Notification from './components/Notification';
import ErrorBoundary from './components/ErrorBoundary';
import { WishlistProvider } from "./context/WishlistContext";


const inter = Inter({ subsets: ['latin'] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Fashion Store',
  description: 'Your one-stop shop for trendy fashion',
  openGraph: {
    title: 'Fashion Store',
    description: 'Your one-stop shop for trendy fashion',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <SessionProvider>
            <NotificationProvider>
              <WishlistProvider>
                <CartProvider>
                  {children}
                  <Notification />
                </CartProvider>
              </WishlistProvider>
            </NotificationProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
 }