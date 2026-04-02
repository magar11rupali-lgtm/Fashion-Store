'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Cart from './Cart';
import WishlistDrawer from './WishlistDrawer';

export default function Header() {
  const { data: session } = useSession();
  const { totalItems, setIsOpen } = useCart();
  const { totalItems: wishlistCount, setIsOpen: setWishlistOpen } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-30">
        <nav className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-2 sm:gap-4">
            {/* Logo */}
            <Link href="/" className="text-xl sm:text-2xl font-bold text-gray-800 whitespace-nowrap">
              Fashion Store
            </Link>
            
            {/* Navigation Menu - Desktop */}
            <div className="hidden lg:flex space-x-6 xl:space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-blue-600 transition-colors">
                Shop
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
                Contact
              </Link>
              <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">
                Admin
              </Link>
            </div>
            
            {/* Icons and User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* User Account Icon with Dropdown */}
              {session ? (
                <div className="relative group">
                  <button className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:text-blue-600 transition-colors min-h-[44px] px-2 touch-manipulation">
                    <span className="text-lg sm:text-xl">👤</span>
                    <span className="hidden md:inline text-sm lg:text-base">{session.user.name}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg min-h-[44px] flex items-center"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 min-h-[44px] flex items-center"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-lg min-h-[44px] flex items-center"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-blue-600 transition-colors flex items-center min-h-[44px] px-2 touch-manipulation"
                >
                  <span className="text-lg sm:text-xl">👤</span>
                  <span className="hidden md:inline ml-2 text-sm lg:text-base">Sign In</span>
                </Link>
              )}
              
              {/* Wishlist Icon with Badge */}
              <button
                onClick={() => setWishlistOpen(true)}
                className="relative text-gray-700 hover:text-blue-600 transition-colors flex items-center min-h-[44px] min-w-[44px] justify-center touch-manipulation"
                aria-label="Wishlist"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>
              
              {/* Cart Icon with Badge */}
              <button
                onClick={() => setIsOpen(true)}
                className="relative text-gray-700 hover:text-blue-600 transition-colors flex items-center min-h-[44px] min-w-[44px] justify-center touch-manipulation"
                aria-label="Shopping Cart"
              >
                <span className="text-xl sm:text-2xl">🛒</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-gray-700 hover:text-blue-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col space-y-3">
                <Link 
                  href="/" 
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2 min-h-[44px] flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/products" 
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2 min-h-[44px] flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Shop
                </Link>
                <Link 
                  href="/about" 
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2 min-h-[44px] flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  href="/contact" 
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2 min-h-[44px] flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link 
                  href="/admin" 
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2 min-h-[44px] flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>
      
      <Cart />
      <WishlistDrawer />
    </>
  );
}