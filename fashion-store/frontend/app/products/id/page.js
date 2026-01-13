import { getProductById } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AddToCartButton from '@/components/AddToCartButton';

export default async function ProductDetailPage({ params }) {
  const { id } = params;
  const product = await getProductById(id);

  if (!product) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the product you're looking for.
          </p>
          <Link 
            href="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { name, description, price, category, image, inStock } = product.attributes;
  
  const imageUrl = image?.data?.attributes?.url 
    ? `http://localhost:1337${image.data.attributes.url}`
    : '/placeholder.jpg';

  return (
    <div>
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <Link href="/" className="text-blue-600 hover:underline">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/products" className="text-blue-600 hover:underline">Products</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">{name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="relative h-96 lg:h-[600px] bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            {/* Category Badge */}
            <div className="mb-4">
              <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full">
                {category}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {name}
            </h1>

            {/* Price */}
            <div className="text-3xl font-bold text-gray-900 mb-6">
              ${price.toFixed(2)}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {inStock ? (
                <span className="text-green-600 font-semibold flex items-center">
                  <span className="w-3 h-3 bg-green-600 rounded-full mr-2"></span>
                  In Stock
                </span>
              ) : (
                <span className="text-red-600 font-semibold flex items-center">
                  <span className="w-3 h-3 bg-red-600 rounded-full mr-2"></span>
                  Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Select Size
              </h3>
              <div className="flex space-x-3">
                {['S', 'M', 'L', 'XL'].map((size) => (
                  <button
                    key={size}
                    className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 font-semibold transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Quantity
              </h3>
              <div className="flex items-center space-x-4">
                <button className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-semibold">
                  -
                </button>
                <span className="text-xl font-semibold w-12 text-center">1</span>
                <button className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-semibold">
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              className={`w-full py-4 rounded-lg text-lg font-semibold transition-colors mb-4 ${
                inStock
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!inStock}
            >
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>

            {/* Back to Products */}
            <Link
              href="/products"
              className="text-center text-blue-600 hover:underline"
            >
              ← Back to Products
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}