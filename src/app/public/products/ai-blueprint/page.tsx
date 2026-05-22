'use client';
export const runtime = 'edge';

import React, { useState } from 'react';
import { getRecaptchaToken } from '../../../../lib/recaptcha';
import { gaPurchaseInitiate } from '../../../../lib/analytics';

export default function ProductPage() {
  const [checking, setChecking] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const handleBuyClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setChecking(true);

    try {
      // 🛡️ reCAPTCHA Enterprise check before redirecting to Razorpay
      const token = await getRecaptchaToken('PURCHASE_INITIATE');

      const res = await fetch('/api/recaptcha/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'PURCHASE_INITIATE' }),
      });
      const data = await res.json();

      if (!data.valid) {
        setBlocked(true);
        setChecking(false);
        return;
      }

      // ✅ Human verified — track & redirect to Razorpay
      gaPurchaseInitiate('AI Productivity Blueprint v1.0', 499); // 📊 GA4
      window.open('https://rzp.io/rzp/9O1zMeI', '_blank');
    } catch {
      // On error, allow through (don't block legitimate users)
      window.open('https://rzp.io/rzp/9O1zMeI', '_blank');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-tight text-blue-600 bg-blue-50 rounded-full">
              PHASE 2 REVENUE ACTIVATED
            </div>
            <h1 className="text-6xl font-black mb-8 leading-[1.1] tracking-tighter text-slate-900" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
              AI Productivity <br />
              <span className="text-blue-600">Blueprint v1.0</span>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed mb-10">
              The exact system used to run Akshara World at zero cost.
              Learn how to automate 90% of your business operations using
              autonomous AI agents.
            </p>

            <div className="space-y-6 mb-12">
              {[
                '15+ Automated Agent Workflows',
                'Zero-Cost Tech Stack Blueprint',
                'Sam CEO Architecture (Cloudflare Workers)',
                'Real-time Dashboard Templates',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm">✓</div>
                  <span className="text-slate-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* reCAPTCHA-protected buy button */}
            {blocked ? (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                🤖 Our security system detected unusual activity. Please refresh and try again from a normal browser.
              </div>
            ) : (
              <div className="flex items-center gap-8">
                <button
                  onClick={handleBuyClick}
                  disabled={checking}
                  className={`px-10 py-5 font-black rounded-3xl transition-all shadow-2xl text-center ${
                    checking
                      ? 'bg-blue-300 text-white cursor-not-allowed animate-pulse'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                  }`}
                >
                  {checking ? '🛡️ Verifying...' : 'GET ACCESS NOW — ₹499'}
                </button>
                <div className="text-slate-400 text-sm font-medium">
                  <span className="text-[10px] text-green-600 font-bold block mb-1">🛡️ reCAPTCHA Protected</span>
                  <span className="text-slate-900 font-bold italic">Secure Razorpay Checkout</span>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="aspect-square rounded-[4rem] bg-gradient-to-br from-blue-600 to-indigo-700 shadow-3xl flex items-center justify-center p-20 transform hover:scale-[1.02] transition-transform">
              <div className="text-white text-9xl font-black opacity-20">AKSHARA</div>
              <div className="absolute inset-0 flex items-center justify-center text-center">
                <div className="space-y-2">
                  <div className="text-white text-5xl font-black">2026</div>
                  <div className="text-white/50 font-bold tracking-[0.5em]">EDITION</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
