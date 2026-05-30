'use client';

import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#030712]/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl h-20 items-center justify-between px-6 md:px-8">
        
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-black text-black text-lg transition-transform group-hover:scale-105 duration-300 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            A
          </div>
          <div>
            <span className="font-extrabold tracking-wider text-white uppercase text-base block" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
              Akshara World
            </span>
            <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest block">
              Autonomous Business
            </span>
          </div>
        </Link>

        {/* Navigation - Centered Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-slate-400">
          <Link href="/public/services" className="hover:text-cyan-400 transition-colors duration-200">
            Services
          </Link>
          <Link href="/public/products/ai-blueprint" className="hover:text-cyan-400 transition-colors duration-200">
            AI Blueprint
          </Link>
          <Link href="/public/blog" className="hover:text-cyan-400 transition-colors duration-200">
            Blog
          </Link>
          <Link href="/public/about" className="hover:text-cyan-400 transition-colors duration-200">
            About
          </Link>
          <Link href="/public/contact" className="hover:text-cyan-400 transition-colors duration-200">
            Contact
          </Link>
        </nav>

        {/* Action Buttons & Social Icons */}
        <div className="flex items-center gap-5">
          {/* Social Icons */}
          <div className="hidden sm:flex items-center gap-3.5">
            {/* WhatsApp */}
            <a 
              href="https://wa.me/919740322413" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="text-slate-500 hover:text-emerald-400 transition-colors duration-200"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.437.002 9.861-4.416 9.863-9.864.001-2.639-1.03-5.12-2.903-6.995C16.359 1.871 13.88 .843 11.247.843 5.81.843 1.383 5.26 1.381 10.697c-.001 1.564.415 3.09 1.208 4.417l-.989 3.612 3.702-.971 group-hover:scale-105" />
              </svg>
            </a>
            {/* YouTube */}
            <a 
              href="https://youtube.com/@sampathkumar-aksharaworld" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="text-slate-500 hover:text-red-500 transition-colors duration-200"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.948.502 5.837a3.003 3.003 0 0 0 2.11 2.107c1.883.511 9.388.511 9.388.511s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107C24 15.948 24 12 24 12s0-3.948-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            {/* Instagram */}
            <a 
              href="https://instagram.com/sampathh_7" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-slate-500 hover:text-pink-500 transition-colors duration-200"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </a>
          </div>

          {/* Call-to-Action Dashboard */}
          <Link
            href="/dashboard"
            className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all duration-300"
          >
            Command Center
          </Link>
        </div>
      </div>
    </header>
  );
}
