
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import Cart from './Cart';

export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-800">
            Fashion Store
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="/" className="text-gray-700 hover:text-blue-600">Home</a>
            <a href="/products" className="text-gray-700 hover:text-blue-600">Shop</a>
            <a href="/about" className="text-gray-700 hover:text-blue-600">About</a>
            <a href="/contact" className="text-gray-700 hover:text-blue-600">Contact</a>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-700 hover:text-blue-600">
              🛒 Cart (0)
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
   function Header() {
  const { totalItems, setIsOpen } = useCart();

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-30">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-800">
               Fashion Store
            </Link>
            
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Home
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-blue-600">
                Shop
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600">
                Contact
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsOpen(true)}
                className="relative text-gray-700 hover:text-blue-600 flex items-center gap-2"
              >
                <span className="text-2xl">🛒</span>
                <span className="hidden md:inline">Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
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
}