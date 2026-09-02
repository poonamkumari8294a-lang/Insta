import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { ShieldCheck, Mail, Send, CheckCircle2, AlertCircle, Instagram } from 'lucide-react';

interface LegalPagesProps {
  pageType: 'terms' | 'privacy' | 'refund' | 'contact';
  settings: SiteSettings;
  onNavigate: (route: string) => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({
  pageType,
  settings,
  onNavigate,
}) => {
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {pageType === 'terms' && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/80 space-y-6 text-purple-900/80 text-xs sm:text-sm leading-relaxed shadow-lg">
          <h1 className="font-display font-black text-2xl sm:text-3xl text-purple-950">
            Terms & Conditions
          </h1>
          <p className="text-purple-900/60 font-semibold">Last updated: August 2026</p>

          <section className="space-y-2">
            <h3 className="font-bold text-purple-950 text-base">1. Creator Content Ownership</h3>
            <p>
              All photos, video clips, reels, text, audio recordings, and media distributed on this platform are the exclusive intellectual property of {settings.creatorName}. Purchasing access grants you a personal, revocable, non-exclusive, non-transferable license to view the unlocked media for private entertainment purposes only.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-purple-950 text-base">2. Strict Anti-Piracy & Redistribution Prohibition</h3>
            <p>
              You are strictly prohibited from downloading for redistribution, screen-recording, re-uploading, broadcasting, selling, or circulating any paid content on external websites, forums, Telegram channels, or social media platforms. Any infringement is actively tracked using digital forensics and subject to immediate legal action and DMCA enforcement.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-purple-950 text-base">3. Payment Verification & No Fake Claims</h3>
            <p>
              Orders are fulfilled exclusively through automated server-verified UPI merchant webhooks to the creator's configured UPI destination ({settings.upiId}). Submitting fake UTRs, altered payment screenshots, or false claims will not unlock media and may result in a permanent block.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-purple-950 text-base">4. Age Requirements</h3>
            <p>
              You must be at least 18 years of age or the age of legal majority in your jurisdiction to access and purchase content on this website.
            </p>
          </section>
        </div>
      )}

      {pageType === 'privacy' && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/80 space-y-6 text-purple-900/80 text-xs sm:text-sm leading-relaxed shadow-lg">
          <h1 className="font-display font-black text-2xl sm:text-3xl text-purple-950">
            Privacy Policy
          </h1>
          <p className="text-purple-900/60 font-semibold">Last updated: August 2026</p>

          <section className="space-y-2">
            <h3 className="font-bold text-purple-950 text-base">1. No Mandatory User Registration</h3>
            <p>
              We respect your privacy. We do not require visitors to register an account, set up passwords, or provide extensive personal identifying details. Unlocked content is associated with a secure cryptographically signed session token stored locally in your browser.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-purple-950 text-base">2. Transaction Data</h3>
            <p>
              When an order is created, our payment gateway processes order reference numbers and transaction timestamps to confirm receipt of funds. We never store bank login passwords, UPI PINs, or confidential payment secrets on our servers.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-purple-950 text-base">3. Local Storage</h3>
            <p>
              Your browser stores temporary access tokens in local storage so you can easily view your purchased items when returning to the site. You may clear your browser cache at any time.
            </p>
          </section>
        </div>
      )}

      {pageType === 'refund' && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/80 space-y-6 text-purple-900/80 text-xs sm:text-sm leading-relaxed shadow-lg">
          <h1 className="font-display font-black text-2xl sm:text-3xl text-purple-950">
            Refund & Cancellation Policy
          </h1>
          <p className="text-purple-900/60 font-semibold">Last updated: August 2026</p>

          <section className="space-y-2">
            <h3 className="font-bold text-purple-950 text-base">1. Digital Media Delivery</h3>
            <p>
              Due to the immediate digital delivery nature of uncompressed high-resolution photos and master videos, all completed purchases are generally final once the content is unlocked and viewed.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-purple-950 text-base">2. Failed Bank Deductions & Double Charges</h3>
            <p>
              If your bank account was debited via UPI but your content was not unlocked within 15 minutes due to network delays, please contact us with your UPI Reference/UTR and order timestamp. Our team will verify the payment against our bank records and immediately issue an access token or process a full refund.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-purple-950 text-base">3. Contact for Assistance</h3>
            <p>
              For any billing disputes or payment queries, email us at <strong className="text-pink-600 font-bold">{settings.supportEmail}</strong> or message our Telegram support.
            </p>
          </section>
        </div>
      )}

      {pageType === 'contact' && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/80 space-y-6 shadow-lg">
          <div>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-pink-100 text-pink-700 border border-pink-200 uppercase tracking-wider inline-block mb-2 shadow-sm">
              Get in Touch
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-purple-950">
              Contact & Creator Support
            </h1>
            <p className="text-xs sm:text-sm text-purple-900/70 mt-1 font-medium">
              Have questions about an order, custom photoshoot requests, or brand collaborations? Reach out below.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <a
              href={settings.supportInstagram || settings.instagramUrl || 'https://www.instagram.com/ruma__cutegirl?igsi=cXo3ZmN3MWl0ZGQ3'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 hover:from-purple-100 hover:via-pink-100 hover:to-rose-100 border border-pink-200 text-center space-y-1 shadow-sm transition-transform active:scale-98 block group"
            >
              <Instagram className="w-5 h-5 text-pink-600 mx-auto group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-pink-950">Instagram Support</div>
              <div className="text-[11px] text-pink-700 font-black font-mono truncate">{settings.instagramHandle || '@ruma__cutegirl'}</div>
              <div className="text-[10px] text-pink-600 font-bold">DM 24/7 ⚡</div>
            </a>

            <div className="p-4 rounded-2xl bg-white/70 border border-purple-100 text-center space-y-1 shadow-sm">
              <Mail className="w-5 h-5 text-pink-600 mx-auto" />
              <div className="text-xs font-bold text-purple-950">Email Support</div>
              <div className="text-[11px] text-pink-700 font-medium truncate">{settings.supportEmail}</div>
            </div>

            <a
              href={settings.supportTelegram || 'https://t.me/rumakumari_vip'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-white/70 hover:bg-purple-50 border border-purple-100 text-center space-y-1 shadow-sm transition-transform active:scale-98 block"
            >
              <Send className="w-5 h-5 text-purple-600 mx-auto" />
              <div className="text-xs font-bold text-purple-950">Telegram VIP</div>
              <div className="text-[11px] text-purple-700 font-medium truncate">@rumakumari_vip</div>
            </a>

            <div className="p-4 rounded-2xl bg-white/70 border border-purple-100 text-center space-y-1 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto" />
              <div className="text-xs font-bold text-purple-950">UPI Destination</div>
              <div className="text-[11px] text-emerald-700 font-medium truncate">{settings.upiId}</div>
            </div>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-100/70 border border-emerald-300 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-purple-950">Message Sent Successfully</h3>
              <p className="text-xs text-purple-900/80 font-medium">
                Thank you for reaching out! Our team will respond to your inquiry within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitContact} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-purple-950 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 placeholder-purple-900/40 focus:outline-none focus:border-pink-500 shadow-sm font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-purple-950 block mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 placeholder-purple-900/40 focus:outline-none focus:border-pink-500 shadow-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">Subject / Order ID (if applicable)</label>
                <input
                  type="text"
                  required
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  placeholder="e.g. Order ORD_12345 or Collaboration"
                  className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 placeholder-purple-900/40 focus:outline-none focus:border-pink-500 shadow-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-purple-950 block mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Describe your inquiry..."
                  className="w-full bg-white/90 border border-purple-200 rounded-2xl px-3.5 py-2.5 text-xs text-purple-950 placeholder-purple-900/40 focus:outline-none focus:border-pink-500 shadow-sm font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full glow-pink-btn py-3 rounded-2xl text-xs font-black text-white flex items-center justify-center gap-2 shadow-md shadow-pink-500/20"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}

        </div>
      )}

    </div>
  );
};
