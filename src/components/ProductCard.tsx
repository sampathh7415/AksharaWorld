'use client';

import React from 'react';
import Link from 'next/link';

interface ProductCardProps {
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  features: string[];
  checkoutUrl: string;
  detailUrl?: string;
  badge?: string;
  isPopular?: boolean;
}

export default function ProductCard({
  title,
  description,
  price,
  originalPrice,
  features,
  checkoutUrl,
  detailUrl,
  badge,
  isPopular = false,
}: ProductCardProps) {
  return (
    <div className={`relative rounded-[2.5rem] p-8 backdrop-blur-3xl transition-all duration-500 flex flex-col justify-between h-full group ${
      isPopular 
        ? 'bg-gradient-to-b from-cyan-500/[0.05] to-indigo-500/[0.02] border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)]' 
        : 'bg-white/[0.02] border border-white/5 shadow-2xl hover:border-white/10 hover:bg-white/[0.04]'
    }`}>
      
      {/* Popular/Promo Badge */}
      {(badge || isPopular) && (
        <span className="absolute -top-3.5 left-8 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-black text-[9px] font-black uppercase tracking-widest shadow-lg">
          {badge || 'Recommended'}
        </span>
      )}

      <div>
        {/* Card Header */}
        <div className="mb-6">
          <h3 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors duration-300" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-medium">
            {description}
          </p>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-3xl font-black text-white tracking-tight">
            {price}
          </span>
          {originalPrice && (
            <span className="text-sm font-semibold text-slate-700 line-through">
              {originalPrice}
            </span>
          )}
        </div>

        {/* Bullet Features */}
        <ul className="space-y-3.5 mb-8">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-cyan-400 mt-0.5 text-xs flex-shrink-0">✓</span>
              <span className="text-xs text-slate-400 font-semibold leading-normal">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4 border-t border-white/5">
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 bg-cyan-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.01] transition-transform duration-300 shadow-[0_4px_25px_rgba(6,182,212,0.25)] flex items-center justify-center gap-2 group-hover:bg-white"
        >
          ⚡ Get Started Instantly
        </a>
        
        {detailUrl && (
          <Link
            href={detailUrl}
            className="w-full py-3.5 border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center"
          >
            Explore Blueprint Specs
          </Link>
        )}
      </div>
    </div>
  );
}
