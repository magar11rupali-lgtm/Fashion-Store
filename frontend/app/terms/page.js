'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: February 20, 2026</p>

          <div className="bg-white shadow-md rounded-lg p-8 space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Agreement to Terms</h2>
              <p className="leading-relaxed">
                By accessing and using this website, you accept and agree to be bound by the terms and provision 
                of this agreement. If you do not agree to these Terms of Service, please do not use our website 
                or services. We reserve the right to modify these terms at any time, and such modifications shall 
                be effective immediately upon posting.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Use of Our Service</h2>
              <p className="leading-relaxed mb-3">
                You agree to use our service only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the service in any way that violates any applicable law or regulation</li>
                <li>Impersonate or attempt to impersonate the company, an employee, another user, or any other person</li>
                <li>Engage in any conduct that restricts or inhibits anyone's use of the service</li>
                <li>Use any robot, spider, or other automatic device to access the service</li>
                <li>Introduce any viruses, trojan horses, worms, or other malicious code</li>
                <li>Attempt to gain unauthorized access to any portion of the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Account Registration</h2>
              <p className="leading-relaxed">
                To access certain features of our service, you must register for an account. You agree to provide 
                accurate, current, and complete information during registration and to update such information to 
                keep it accurate, current, and complete. You are responsible for safeguarding your password and 
                for all activities that occur under your account. You must notify us immediately of any unauthorized 
                use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Product Information and Pricing</h2>
              <p className="leading-relaxed">
                We strive to provide accurate product descriptions and pricing. However, we do not warrant that 
                product descriptions, pricing, or other content is accurate, complete, reliable, current, or 
                error-free. We reserve the right to correct any errors, inaccuracies, or omissions and to change 
                or update information at any time without prior notice. In the event of a pricing error, we reserve 
                the right to cancel any orders placed for products listed at the incorrect price.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Orders and Payment</h2>
              <p className="leading-relaxed mb-3">
                By placing an order, you represent that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You are legally capable of entering into binding contracts</li>
                <li>You are at least 18 years of age</li>
                <li>The information you provide is accurate and complete</li>
                <li>You have the legal right to use any payment method provided</li>
              </ul>
              <p className="leading-relaxed mt-4">
                We reserve the right to refuse or cancel any order for any reason, including but not limited to 
                product availability, errors in pricing or product information, or suspected fraudulent activity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Shipping and Delivery</h2>
              <p className="leading-relaxed">
                We will make reasonable efforts to deliver products within the estimated timeframes. However, 
                delivery times are estimates only and we are not liable for any delays. Title and risk of loss 
                pass to you upon delivery to the carrier. You are responsible for providing accurate shipping 
                information. We are not responsible for delays or non-delivery due to incorrect addresses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Returns and Refunds</h2>
              <p className="leading-relaxed">
                Our return policy allows returns within 30 days of delivery for most items. Products must be 
                unused, in original packaging, and with all tags attached. Some items are not eligible for return, 
                including intimate apparel, final sale items, and personalized products. Refunds will be issued 
                to the original payment method within 5-7 business days of receiving the return. Shipping costs 
                are non-refundable unless the return is due to our error.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Intellectual Property Rights</h2>
              <p className="leading-relaxed">
                The service and its entire contents, features, and functionality (including but not limited to 
                all information, software, text, displays, images, video, and audio) are owned by us, our licensors, 
                or other providers of such material and are protected by copyright, trademark, patent, trade secret, 
                and other intellectual property laws. You may not reproduce, distribute, modify, create derivative 
                works of, publicly display, or exploit any of our content without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">User Content</h2>
              <p className="leading-relaxed">
                You may be able to submit reviews, comments, and other content. By submitting content, you grant 
                us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such 
                content. You represent that you own or have the necessary rights to the content you submit and 
                that it does not violate any third-party rights or applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Disclaimer of Warranties</h2>
              <p className="leading-relaxed">
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, 
                EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR 
                ERROR-FREE. WE DO NOT WARRANT THE ACCURACY OR COMPLETENESS OF ANY CONTENT ON THE SERVICE. YOUR 
                USE OF THE SERVICE IS AT YOUR OWN RISK.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Limitation of Liability</h2>
              <p className="leading-relaxed">
                TO THE FULLEST EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED 
                DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES. OUR TOTAL 
                LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE MONTHS PRECEDING THE CLAIM.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Indemnification</h2>
              <p className="leading-relaxed">
                You agree to indemnify, defend, and hold harmless the company and its officers, directors, employees, 
                and agents from any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' 
                fees, arising out of or in any way connected with your access to or use of the service, your violation 
                of these Terms, or your violation of any third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Governing Law and Jurisdiction</h2>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State of New York, 
                without regard to its conflict of law provisions. Any legal action or proceeding arising under these 
                Terms will be brought exclusively in the federal or state courts located in New York, and you consent 
                to personal jurisdiction in such courts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Dispute Resolution</h2>
              <p className="leading-relaxed">
                Any dispute arising from these Terms or your use of the service shall first be resolved through 
                good faith negotiations. If the dispute cannot be resolved through negotiation, it shall be resolved 
                through binding arbitration in accordance with the rules of the American Arbitration Association.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Severability</h2>
              <p className="leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision will be 
                limited or eliminated to the minimum extent necessary so that these Terms will otherwise remain 
                in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Termination</h2>
              <p className="leading-relaxed">
                We may terminate or suspend your account and access to the service immediately, without prior 
                notice or liability, for any reason, including if you breach these Terms. Upon termination, your 
                right to use the service will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Contact Information</h2>
              <p className="leading-relaxed mb-3">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                <p><span className="font-medium">Email:</span> legal@ecommerce.com</p>
                <p><span className="font-medium">Phone:</span> +1 (555) 123-4567</p>
                <p><span className="font-medium">Address:</span> 123 Commerce Street, Suite 100, New York, NY 10001</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
