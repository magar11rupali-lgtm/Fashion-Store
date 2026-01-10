import { getAllProducts } from '../../lib/api';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <Header />
      <main className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Our Products
        </h1>
        
        {products.length === 0 ? (
          <p className="text-gray-600 text-center py-12">
            No products found. Add some products in Strapi!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
                console.log(product);            
               return<ProductCard key={product.id} product={product} />
 } )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}