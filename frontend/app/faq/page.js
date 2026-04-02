'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: 'Orders & Shipping',
      questions: [
        {
          question: 'How long does shipping take?',
          answer: 'Standard shipping typically takes 5-7 business days. Express shipping is available and takes 2-3 business days. International orders may take 10-15 business days depending on the destination.'
        },
        {
          question: 'Do you ship internationally?',
          answer: 'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location. You can see the exact shipping cost at checkout before completing your order.'
        },
        {
          question: 'How can I track my order?',
          answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also view your order status and tracking information by logging into your account and visiting the Order History page.'
        },
        {
          question: 'What if my order arrives damaged?',
          answer: 'We\'re sorry if your order arrives damaged. Please contact us within 48 hours of delivery with photos of the damage, and we\'ll arrange a replacement or refund immediately.'
        }
      ]
    },
    {
      category: 'Returns & Refunds',
      questions: [
        {
          question: 'What is your return policy?',
          answer: 'We offer a 30-day return policy for most items. Products must be unused, in original packaging, and with all tags attached. Some items like intimate apparel and final sale items are not eligible for return.'
        },
        {
          question: 'How do I initiate a return?',
          answer: 'Log into your account, go to Order History, select the order you want to return, and click "Request Return". Follow the instructions to print your return label and ship the item back to us.'
        },
        {
          question: 'When will I receive my refund?',
          answer: 'Refunds are processed within 5-7 business days after we receive your return. The refund will be credited to your original payment method. Please allow an additional 3-5 business days for the credit to appear in your account.'
        },
        {
          question: 'Can I exchange an item?',
          answer: 'Yes! If you need a different size or color, you can request an exchange through your Order History. We\'ll send the new item as soon as we receive your return.'
        }
      ]
    },
    {
      category: 'Payment & Pricing',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and cash on delivery (COD) for eligible locations.'
        },
        {
          question: 'Is it safe to use my credit card on your site?',
          answer: 'Absolutely! We use industry-standard SSL encryption to protect your payment information. We never store your complete credit card details on our servers.'
        },
        {
          question: 'Do you offer discounts or promotions?',
          answer: 'Yes! Sign up for our newsletter to receive exclusive discounts, early access to sales, and special promotions. We also offer seasonal sales throughout the year.'
        },
        {
          question: 'Can I use multiple discount codes?',
          answer: 'Only one discount code can be applied per order. If you have multiple codes, we recommend using the one that provides the greatest savings.'
        }
      ]
    },
    {
      category: 'Account & Wishlist',
      questions: [
        {
          question: 'Do I need an account to place an order?',
          answer: 'Yes, you need to create an account to complete checkout. This allows you to track orders, save addresses, and manage your wishlist. Creating an account is quick and free!'
        },
        {
          question: 'How do I reset my password?',
          answer: 'Click "Sign In" and then "Forgot Password". Enter your email address, and we\'ll send you a link to reset your password.'
        },
        {
          question: 'What is a wishlist?',
          answer: 'A wishlist lets you save products you\'re interested in for later. You can add items to your wishlist by clicking the heart icon on any product. Your wishlist is saved to your account so you can access it from any device.'
        },
        {
          question: 'Can I update my account information?',
          answer: 'Yes! Log into your account and go to the Profile page where you can update your name, phone number, and saved addresses.'
        }
      ]
    },
    {
      category: 'Products',
      questions: [
        {
          question: 'How do I know what size to order?',
          answer: 'Each product page includes a size guide. Click "Size Guide" near the size selector to view detailed measurements. If you\'re between sizes, we recommend ordering the larger size.'
        },
        {
          question: 'Are your product photos accurate?',
          answer: 'We strive to display colors as accurately as possible, but please note that colors may vary slightly due to different monitor settings and lighting conditions.'
        },
        {
          question: 'When will out-of-stock items be available?',
          answer: 'Restocking times vary by product. You can sign up for restock notifications on the product page, and we\'ll email you when the item is back in stock.'
        },
        {
          question: 'Do you offer gift wrapping?',
          answer: 'Yes! Gift wrapping is available for a small additional fee. You can select this option at checkout and include a personalized message.'
        }
      ]
    }
  ];

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600 mb-8">
            Find answers to common questions about orders, shipping, returns, and more.
          </p>

          <div className="space-y-8">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">{category.category}</h2>
                <div className="space-y-3">
                  {category.questions.map((faq, questionIndex) => {
                    const index = `${categoryIndex}-${questionIndex}`;
                    const isOpen = openIndex === index;

                    return (
                      <div
                        key={questionIndex}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition"
                        >
                          <span className="font-medium text-gray-900">{faq.question}</span>
                          <svg
                            className={`w-5 h-5 text-gray-500 transition-transform ${
                              isOpen ? 'transform rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 text-gray-700 leading-relaxed">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gray-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-3">Still Have Questions?</h2>
            <p className="text-gray-700 mb-6">
              Can't find the answer you're looking for? Our customer support team is here to help.
            </p>
            <a
              href="/contact"
              className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
