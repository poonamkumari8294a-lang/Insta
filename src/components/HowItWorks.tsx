import React from 'react';
import { QrCode, Sparkles, ShieldCheck, Zap, Smartphone, CheckCircle } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <Sparkles className="w-6 h-6 text-pink-600" />,
      step: '01',
      title: 'Choose Exclusive Content',
      desc: 'Browse through private VIP photos, uncut dance reels, and full photosets. No account registration needed.'
    },
    {
      icon: <QrCode className="w-6 h-6 text-purple-600" />,
      step: '02',
      title: 'Scan Dynamic UPI QR',
      desc: 'Scan the dynamic QR code with any UPI app (GPay, PhonePe, Paytm, BHIM, Cred) or tap to pay directly on mobile.'
    },
    {
      icon: <Zap className="w-6 h-6 text-pink-500" />,
      step: '03',
      title: 'Instant Automatic Unlock',
      desc: 'Our server instantly verifies the bank transaction and unlocks crystal clear 1080p video & uncompressed HD photos.'
    }
  ];

  return (
    <section className="py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-pink-100/80 border border-pink-200 text-pink-700 uppercase tracking-wider inline-block mb-3 shadow-sm">
            Frictionless Access
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-purple-950 tracking-tight">
            How It Works in 3 Simple Steps
          </h2>
          <p className="text-sm sm:text-base text-purple-900/70 mt-2 font-medium">
            No lengthy forms, no password memorization. Direct creator support with 100% verified instant delivery.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group border border-white/80 hover:border-pink-300 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/90 border border-pink-200/80 flex items-center justify-center shadow-md shadow-pink-500/10">
                  {s.icon}
                </div>
                <span className="font-display text-2xl sm:text-3xl font-black text-purple-900/20 group-hover:text-pink-600/40 transition-colors">
                  {s.step}
                </span>
              </div>

              <div>
                <h3 className="font-display font-bold text-lg text-purple-950 group-hover:text-pink-600 transition-colors">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-purple-900/70 mt-2 leading-relaxed font-medium">
                  {s.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-purple-100 flex items-center gap-1.5 text-[11px] font-bold text-pink-700">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant Verification</span>
              </div>
            </div>
          ))}
        </div>

        {/* Security Feature Row */}
        <div className="mt-8 p-4 rounded-2xl bg-white/70 border border-white/80 shadow-md flex flex-wrap items-center justify-around gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-950">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero Account Required</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-950">
            <Smartphone className="w-4 h-4 text-pink-600" />
            <span>Works on All Indian UPI Apps</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-950">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>30-Day Session Storage</span>
          </div>
        </div>

      </div>
    </section>
  );
};
