//import Image from 'next/image';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ product }) {
  const { name, description, price, category, image, inStock } = product;

  // ✅ Strapi image safe handling
  const imageUrl = image?.[0]?.url
    ? image[0].url.startsWith('http')
      ? image[0].url
      : `http://localhost:1337${image[0].url}`
    : '/placeholder.jpg';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      
      {/* IMAGE SECTION */}
      <div className="relative h-64 bg-gray-200">
        {/* ✅ Use normal img (works 100%) */}
        <img
          src={imageUrl}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {!inStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Out of Stock
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-6">
        <div className="mb-2">
          <span className="text-xs font-semibold text-blue-600 uppercase">
            {category?.data?.attributes?.name}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {name}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {description?.[0]?.children?.[0]?.text || ''}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            ${price.toFixed(2)}
          </span>

          <button
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              inStock
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!inStock}
          >
            {inStock ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
 );
function ProductCard({ product }) {
  const { name, description, price, category, image, inStock } = product.attributes;
  
  const imageUrl = image?.data?.attributes?.url 
    ? `http://localhost:1337${image.data.attributes.url}`
    : '/placeholder.jpg';

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
        <div className="relative h-64 bg-gray-200">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {!inStock && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Out of Stock
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="mb-2">
            <span className="text-xs font-semibold text-blue-600 uppercase">
              {category}
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">
              ${price.toFixed(2)}
            </span>
            
            <span 
              className={`px-6 py-2 rounded-lg font-semibold ${
                inStock 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-300 text-gray-500'
              }`}
            >
              {inStock ? 'View Details' : 'Unavailable'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
}