'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">About Us</h1>

          <div className="bg-white shadow-md rounded-lg p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to our e-commerce store, where quality meets style. Founded with a passion for delivering 
                exceptional products and outstanding customer service, we've been serving customers worldwide since our inception. 
                Our journey began with a simple mission: to make premium fashion accessible to everyone.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                We believe that everyone deserves access to high-quality, stylish products at fair prices. 
                Our mission is to curate a collection of the finest items, ensuring that every purchase brings 
                joy and satisfaction to our customers. We're committed to sustainability, ethical sourcing, 
                and creating a positive impact in the communities we serve.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Quality Products</h3>
                  <p className="text-gray-600 text-sm">
                    Every item in our collection is carefully selected for quality, durability, and style.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Fast Shipping</h3>
                  <p className="text-gray-600 text-sm">
                    We process orders quickly and ship worldwide with reliable carriers.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Customer Support</h3>
                  <p className="text-gray-600 text-sm">
                    Our dedicated team is here to help with any questions or concerns.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Secure Shopping</h3>
                  <p className="text-gray-600 text-sm">
                    Your privacy and security are our top priorities with encrypted transactions.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Behind every great store is a passionate team. Our diverse group of professionals brings together 
                expertise in fashion, technology, customer service, and logistics to create an exceptional shopping 
                experience for you.
              </p>
              <p className="text-gray-700 leading-relaxed">
                From our buyers who source the latest trends to our customer service representatives who ensure 
                your satisfaction, every team member is dedicated to making your experience memorable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-black font-bold mr-3">•</span>
                  <div>
                    <span className="font-semibold">Quality First:</span>
                    <span className="text-gray-700"> We never compromise on the quality of our products.</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-black font-bold mr-3">•</span>
                  <div>
                    <span className="font-semibold">Customer Satisfaction:</span>
                    <span className="text-gray-700"> Your happiness is our success metric.</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-black font-bold mr-3">•</span>
                  <div>
                    <span className="font-semibold">Sustainability:</span>
                    <span className="text-gray-700"> We're committed to environmentally responsible practices.</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-black font-bold mr-3">•</span>
                  <div>
                    <span className="font-semibold">Innovation:</span>
                    <span className="text-gray-700"> We continuously improve our products and services.</span>
                  </div>
                </li>
              </ul>
            </section>

            <section className="bg-gray-50 rounded-lg p-6 text-center">
              <h2 className="text-2xl font-semibold mb-3">Join Our Journey</h2>
              <p className="text-gray-700 mb-4">
                Thank you for choosing us. We're excited to be part of your shopping experience and look forward 
                to serving you for years to come.
              </p>
              <a
                href="/contact"
                className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
              >
                Get in Touch
              </a>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
