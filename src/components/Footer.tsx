'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/5 bg-[#030712] py-12 relative overflow-hidden">
      
      {/* Background soft lighting */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 items-start pb-10 border-b border-white/5">
          
          {/* Brand Outreach Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-black text-black text-sm">
                A
              </div>
              <span className="font-extrabold tracking-wider text-white uppercase text-sm" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
                Akshara World
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs font-semibold">
              The world's premier blueprint for launching and running fully autonomous, zero-cost digital empires powered by Gemini AI and Cloudflare Edge.
            </p>
          </div>

          {/* Site Navigation Links */}
          <div className="space-y-3.5">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block">
              Enterprise Specs
            </span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-slate-400 font-semibold">
              <Link href="/public/services" className="hover:text-cyan-400 transition-colors">Services</Link>
              <Link href="/public/products/ai-blueprint" className="hover:text-cyan-400 transition-colors">AI Blueprint</Link>
              <Link href="/public/blog" className="hover:text-cyan-400 transition-colors">SEO Insights</Link>
              <Link href="/public/about" className="hover:text-cyan-400 transition-colors">Our Vision</Link>
              <Link href="/public/contact" className="hover:text-cyan-400 transition-colors">Direct Desk</Link>
            </div>
          </div>

          {/* Legal Compliance & Ownership */}
          <div className="space-y-3.5">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block">
              Grounded Governance
            </span>
            <div className="space-y-2 text-xs text-slate-400 font-semibold">
              <Link href="/public/privacy" className="block hover:text-cyan-400 transition-colors">Privacy Policy</Link>
              <Link href="/public/terms" className="block hover:text-cyan-400 transition-colors">Terms of Service</Link>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold pt-1">
                Owner & Operator: Sampathkumar <br />
                Address: Bengaluru, Karnataka, India
              </p>
            </div>
          </div>

        </div>

        {/* Footer Meta Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 gap-4">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center sm:text-left">
            © {year} Akshara World. All operational systems logged & secured.
          </span>
          <span className="text-[9px] text-cyan-400/60 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> Sam CEO Core v2.2 Edge-Active
          </span>
        </div>

      </div>
    </footer>
  );
}
