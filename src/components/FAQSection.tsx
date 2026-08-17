import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Do I need to create an account or enter a password to buy content?',
      a: 'No! You do not need any registration or login. Simply select any photo or video, scan the dynamic UPI QR code with any payment app (PhonePe, Google Pay, Paytm, BHIM), and the content will automatically unlock immediately upon bank verification.'
    },
    {
      q: 'How does the UPI Dynamic QR payment work?',
      a: 'When you tap "Unlock Now", our secure server generates a dedicated order with a unique QR code pre-filled with the exact item amount and order ID. Once you complete the payment on your UPI app, our system receives the bank webhook and instantly issues your secure viewing token.'
    },
    {
      q: 'How long do I keep access to my unlocked photos and videos?',
      a: 'Your access tokens are automatically saved to your current browser storage for 30 days. You can view all your purchased items anytime under the "My Unlocks" tab at the top of the page.'
    },
    {
      q: 'What payment apps are supported?',
      a: 'All NPCI-supported UPI apps in India are supported, including PhonePe, Google Pay (GPay), Paytm, BHIM UPI, Amazon Pay, and CRED UPI.'
    },
    {
      q: 'Is my transaction safe and authentic?',
      a: 'Yes, 100%. All orders are processed using end-to-end encrypted bank-to-bank UPI transfers directly to the creator. No card numbers or passwords are ever stored.'
    },
    {
      q: 'What if I need customer support or have a query?',
      a: 'You can email our official support address directly or message our verified Telegram support link listed in the footer.'
    }
  ];

  return (
    <section className="py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-pink-100/80 border border-pink-200 text-pink-700 uppercase tracking-wider inline-flex items-center gap-1.5 mb-3 shadow-sm">
            <HelpCircle className="w-3.5 h-3.5 text-pink-600" />
            Clear & Transparent
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-purple-950 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-purple-900/70 mt-2 font-medium">
            Everything you need to know about instant access, UPI payments, and privacy.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden border border-white/80 transition-all duration-200 shadow-md"
              >
                <button
                  id={`faq-toggle-${idx}`}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-display font-bold text-sm sm:text-base text-purple-950 hover:text-pink-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-pink-600 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-pink-700' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-purple-950/80 leading-relaxed border-t border-purple-100/80 pt-3 animate-in fade-in duration-200 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
