'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ShippingPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Shipping & Returns</h1>

          <div className="space-y-8">
            {/* Shipping Information */}
            <div className="bg-white shadow-md rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>

              <div className="space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-3">Shipping Methods & Rates</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left">Shipping Method</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Delivery Time</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">Standard Shipping</td>
                          <td className="border border-gray-300 px-4 py-2">5-7 business days</td>
                          <td className="border border-gray-300 px-4 py-2">$10 (Free on orders $100+)</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">Express Shipping</td>
                          <td className="border border-gray-300 px-4 py-2">2-3 business days</td>
                          <td className="border border-gray-300 px-4 py-2">$25</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">Overnight Shipping</td>
                          <td className="border border-gray-300 px-4 py-2">1 business day</td>
                          <td className="border border-gray-300 px-4 py-2">$45</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">International Shipping</td>
                          <td className="border border-gray-300 px-4 py-2">10-15 business days</td>
                          <td className="border border-gray-300 px-4 py-2">Varies by destination</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    * Delivery times are estimates and may vary based on location and carrier delays.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">Order Processing</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Orders are typically processed within 1-2 business days (Monday-Friday, excluding holidays). 
                    Orders placed on weekends or holidays will be processed on the next business day.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    You will receive a confirmation email when your order is placed and a shipping confirmation 
                    with tracking information once your order ships.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">Tracking Your Order</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Once your order ships, you'll receive a tracking number via email. You can also track your 
                    order by:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>Logging into your account and visiting the Order History page</li>
                    <li>Using the tracking number on the carrier's website</li>
                    <li>Contacting our customer support team</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">International Shipping</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    We ship to most countries worldwide. International orders may be subject to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>Customs duties and import taxes (customer's responsibility)</li>
                    <li>Longer delivery times due to customs processing</li>
                    <li>Additional documentation requirements</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-3">
                    Please check with your local customs office for specific requirements and potential fees.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">Shipping Restrictions</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We currently do not ship to P.O. boxes or APO/FPO addresses. We also cannot ship to certain 
                    restricted countries due to legal or logistical limitations.
                  </p>
                </section>
              </div>
            </div>

            {/* Returns Information */}
            <div className="bg-white shadow-md rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-6">Returns & Exchanges</h2>

              <div className="space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-3">Return Policy</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    We want you to be completely satisfied with your purchase. If you're not happy with your order, 
                    you can return most items within 30 days of delivery for a full refund.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-semibold text-blue-900 mb-2">Return Requirements:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                      <li>Items must be unused and in original condition</li>
                      <li>Original packaging and tags must be intact</li>
                      <li>Return must be initiated within 30 days of delivery</li>
                      <li>Proof of purchase required</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">Non-Returnable Items</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    The following items cannot be returned:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>Intimate apparel and undergarments</li>
                    <li>Personalized or custom-made items</li>
                    <li>Final sale items (marked as such at time of purchase)</li>
                    <li>Gift cards</li>
                    <li>Items damaged due to misuse or normal wear</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">How to Return an Item</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center mr-3 font-semibold">
                        1
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Log into Your Account</p>
                        <p className="text-gray-700 text-sm">Go to Order History and select the order you want to return</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center mr-3 font-semibold">
                        2
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Request a Return</p>
                        <p className="text-gray-700 text-sm">Click "Request Return" and select the items you wish to return</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center mr-3 font-semibold">
                        3
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Print Return Label</p>
                        <p className="text-gray-700 text-sm">Download and print the prepaid return shipping label</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center mr-3 font-semibold">
                        4
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Pack and Ship</p>
                        <p className="text-gray-700 text-sm">Securely pack the items and attach the return label. Drop off at any carrier location</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center mr-3 font-semibold">
                        5
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Receive Refund</p>
                        <p className="text-gray-700 text-sm">Refund will be processed within 5-7 business days after we receive your return</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">Exchanges</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Need a different size or color? We make exchanges easy:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>Request an exchange through your Order History</li>
                    <li>We'll send the new item as soon as we receive your return</li>
                    <li>No additional shipping charges for exchanges (domestic only)</li>
                    <li>Subject to availability of the requested item</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">Refund Processing</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Once we receive your return:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>We'll inspect the items to ensure they meet return requirements</li>
                    <li>Refunds are processed within 5-7 business days</li>
                    <li>Refund will be credited to your original payment method</li>
                    <li>Allow 3-5 additional business days for the credit to appear in your account</li>
                    <li>Shipping costs are non-refundable (unless return is due to our error)</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">Damaged or Defective Items</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    If you receive a damaged or defective item:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>Contact us within 48 hours of delivery</li>
                    <li>Provide photos of the damage or defect</li>
                    <li>We'll arrange a free replacement or full refund</li>
                    <li>No need to return the damaged item unless requested</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">International Returns</h3>
                  <p className="text-gray-700 leading-relaxed">
                    International returns are accepted but customers are responsible for return shipping costs. 
                    We recommend using a trackable shipping method. Customs duties and taxes are non-refundable.
                  </p>
                </section>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-semibold mb-3">Need Help?</h2>
              <p className="text-gray-700 mb-6">
                Have questions about shipping or returns? Our customer support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
                >
                  Contact Support
                </a>
                <a
                  href="/faq"
                  className="inline-block bg-white text-black border border-black px-6 py-3 rounded hover:bg-gray-100 transition"
                >
                  View FAQ
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
