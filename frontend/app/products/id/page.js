import { getProductById } from '../../lib/api';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Breadcrumb from '../../components/Breadcrumb';
//import AddToCartButton from '@/components/AddToCartButton';
import ProductActions from '../../components/ProductActions';


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

  const { name, description, price, category, image, inStock, inventory } = product.attributes;
  
  const imageUrl = image?.data?.attributes?.url 
    ? `http://localhost:1337${image.data.attributes.url}`
    : '/placeholder.jpg';

  // Determine availability status
  const getAvailabilityStatus = () => {
    if (!inStock || inventory === 0) {
      return { label: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-600' };
    } else if (inventory <= 10) {
      return { label: 'Low Stock', color: 'text-yellow-600', bgColor: 'bg-yellow-600' };
    } else {
      return { label: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-600' };
    }
  };

  const availabilityStatus = getAvailabilityStatus();

  return (
    <div>
      <Header />
      <Breadcrumb />
      
      <main className="container mx-auto px-6 py-12">
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
              <span className={`${availabilityStatus.color} font-semibold flex items-center`}>
                <span className={`w-3 h-3 ${availabilityStatus.bgColor} rounded-full mr-2`}></span>
                {availabilityStatus.label}
                {inventory > 0 && inventory <= 10 && (
                  <span className="ml-2 text-sm text-gray-600">
                    (Only {inventory} left)
                  </span>
                )}
              </span>
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

            {/* Product Actions (Size, Quantity, Add to Cart) */}
            <ProductActions product={product} inStock={inStock} />

            {/* Back to Products */}
            <Link
              href="/products"
              className="text-center text-blue-600 hover:underline mt-4"
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