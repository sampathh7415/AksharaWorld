'use client';
export const runtime = 'edge';

import React from 'react';
import { gaPurchaseInitiate } from '../../../../lib/analytics';

export default function ProductPage() {
  const handleBuyClick = (e: React.MouseEvent) => {
    // 📊 GA4 Telemetry Tracking
    try {
      gaPurchaseInitiate('AI Productivity Blueprint v1.0', 499);
    } catch (err) {
      console.warn('Analytics log failed:', err);
    }
    // Direct redirect to Razorpay to remove transaction friction
    window.location.href = 'https://rzp.io/rzp/9O1zMeI';
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500/20">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 py-24 relative z-10">
        
        {/* Navigation / Header */}
        <div className="flex justify-between items-center mb-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-black text-black">A</div>
            <span className="font-bold tracking-widest text-white uppercase text-sm">Akshara World</span>
          </div>
          <a href="/" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
            ← Brand Hub
          </a>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Content Column */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              🚀 Frictionless Fast-Checkout
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-black mb-6 leading-[1.1] tracking-tighter text-white" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
              AI Productivity <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Blueprint v1.0</span>
            </h1>
            
            <p className="text-lg text-slate-400 leading-relaxed mb-8">
              Unlock the complete architectural framework, direct prompt scripts, and serverless workflow schemas used to run Akshara World at ₹0 recurring infrastructure cost.
            </p>

            {/* Price Display */}
            <div className="mb-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5 inline-flex flex-col">
              <span className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Exclusive Value Price</span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black text-white">₹499</span>
                <span className="text-sm line-through text-slate-600">₹2,499</span>
                <span className="text-xs font-bold text-emerald-500">80% OFF</span>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              {[
                '15+ Pre-configured Autonomous Agent prompt schemas',
                'Serverless API Webhook setup & Google Sheets ledger configs',
                'Clerk Authentication & reCAPTCHA security blueprints',
                'Cloudflare Pages Edge compilation optimization guide',
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold mt-0.5">✓</div>
                  <span className="text-slate-300 text-sm font-medium leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
              <button
                onClick={handleBuyClick}
                className="px-10 py-5 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-black uppercase text-sm rounded-2xl transition-transform hover:scale-[1.02] shadow-[0_4px_30px_rgba(6,182,212,0.3)] text-center cursor-pointer"
              >
                Buy Now & Get Access
              </button>
              <div className="flex flex-col justify-center text-center sm:text-left">
                <span className="text-xs font-black text-slate-300 uppercase tracking-widest">⚡ Instant Access</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Secure live payment processed via Razorpay gateway</span>
              </div>
            </div>
          </div>

          {/* Visual Column */}
          <div className="relative">
            <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-white/10 shadow-[0_0_80px_rgba(6,182,212,0.05)] flex items-center justify-center p-16 relative overflow-hidden group">
              
              {/* Overlay graphics */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 text-[9rem] font-black tracking-tighter uppercase select-none pointer-events-none">
                AKSHARA
              </div>

              <div className="text-center relative z-10 space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center text-4xl mx-auto shadow-2xl">
                  📘
                </div>
                <div className="space-y-1">
                  <div className="text-white text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
                    Enterprise Edition
                  </div>
                  <div className="text-cyan-400 font-bold tracking-[0.4em] text-xs uppercase">
                    2026 RELEASE
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
