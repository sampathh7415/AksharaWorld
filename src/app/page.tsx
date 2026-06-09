'use client';

import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 flex flex-col selection:bg-cyan-500/20 relative overflow-x-hidden">
      
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-[10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/[0.03] blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-500/[0.03] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-purple-500/[0.02] blur-[150px] pointer-events-none" />

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 px-6 overflow-hidden">
        <div className="mx-auto max-w-7xl flex flex-col items-center text-center relative z-10">
          
          {/* Animated Tech Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/5 shadow-2xl mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Sam CEO v2.2 Edge Engine Deployed
            </span>
          </div>

          {/* Visionary Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.08] tracking-tight max-w-5xl" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
            Deploy a 24/7 <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">Autonomous Empire</span> at Zero Recurring Cost
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-500 max-w-3xl mt-8 leading-relaxed font-semibold">
            Stop paying monthly SaaS bills. Leverage Google Sheets, Brevo transactional webhooks, and Cloudflare Edge micro-services to run a completely self-executing business managed by our custom AI CEO, Sam.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4.5 mt-10 w-full sm:w-auto">
            <a
              href="#services"
              className="w-full sm:w-auto px-8 py-4.5 bg-cyan-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-transform duration-300 shadow-[0_4px_30px_rgba(6,182,212,0.3)] text-center cursor-pointer"
            >
              Explore Digital Services
            </a>
            <a
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4.5 border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 text-center cursor-pointer"
            >
              Enter Command Center
            </a>
          </div>

          {/* Live Telemetry Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 max-w-4xl w-full mt-24 border-y border-white/5 py-8 bg-black/10 backdrop-blur-md rounded-[2rem] px-8 border border-white/5">
            <div>
              <span className="text-2xl md:text-3xl font-black text-white block">100%</span>
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 block">Edge Uptime</span>
            </div>
            <div>
              <span className="text-2xl md:text-3xl font-black text-cyan-400 block">8 Active</span>
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 block">Swarm Wings</span>
            </div>
            <div>
              <span className="text-2xl md:text-3xl font-black text-white block">₹0.00</span>
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 block">Infra SaaS Fees</span>
            </div>
            <div>
              <span className="text-2xl md:text-3xl font-black text-indigo-400 block">140+</span>
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 block">Deployments</span>
            </div>
          </div>

        </div>
      </section>

      {/* The Swarm Wings Section */}
      <section className="py-20 bg-black/25 relative border-y border-white/5 px-6">
        <div className="mx-auto max-w-7xl">
          
          <div className="text-center mb-16">
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-3">
              Operational Engines
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
              The 8 Autonomous Swarm Departments
            </h2>
            <p className="text-xs text-slate-500 font-semibold max-w-xl mx-auto mt-4 leading-relaxed">
              Sam CEO coordinates specialized software micro-agents operating concurrently within a unified edge telemetry mesh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Content_Forge', desc: 'Conducts automated semantic search and writes premium, highly-converting SEO content.' },
              { title: 'Tech_Core', desc: 'Manages database schema state adjustments on Sheets, builds edge-safe code, and tracks failures.' },
              { title: 'Growth_Engine', desc: 'Drives targeted distribution loops across YouTube, Instagram, and Brevo mailing pools.' },
              { title: 'Revenue_Vault', desc: 'Monetizes digital outputs, automates checkout, and keeps ledgers using Razorpay.' },
              { title: 'Guardian_Ops', desc: 'Performs self-healing loops, checks regulatory compliance, and coordinates system backups.' },
              { title: 'Insight_Lab', desc: 'Aggregates real-time GA4 metrics, traffic trends, and calculates conversion ratios.' },
              { title: 'Innovation_Scout', desc: 'Conducts daily search sweeps for new open-source software libraries and AI paradigms.' },
              { title: 'Media_Studio', desc: 'Generates premium images, renders videos, and produces programmatic thumbnail designs.' },
            ].map((wing, i) => (
              <div key={i} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider block mb-2">Wing 0{i + 1}</span>
                <h3 className="text-base font-extrabold text-white mb-2" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>{wing.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">{wing.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Services Catalog Showcase */}
      <section id="services" className="py-24 md:py-28 px-6">
        <div className="mx-auto max-w-7xl">
          
          <div className="text-center mb-20">
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-3">
              Professional Services
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
              Explore Our Digital Offerings
            </h2>
            <p className="text-xs text-slate-500 font-semibold max-w-lg mx-auto mt-4 leading-relaxed">
              We leverage zero-cost infrastructure and advanced Google AI layers to deliver high-quality, ATS-optimized, and creative digital solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* ATS Resume Pack */}
            <ProductCard
              title="Resume ATS Optimization Suite"
              description="Full document restructuring, translation, and ATS optimization directly within Google Docs to guarantee higher recruitment hits."
              price="₹999"
              originalPrice="₹2,999"
              isPopular={true}
              badge="Top Choice"
              checkoutUrl="https://rzp.io/rzp/0TOrciXs"
              detailUrl="#"
              features={[
                'Complete Google Docs ATS restructuring',
                'Core skills mapping & keywords inject',
                'Applicant Tracking System format tests',
                'Professional layout & typography design',
                'Delivery in PDF and editable outline',
                '2-Hour turnaround target'
              ]}
            />

            {/* AI Avatar Pack */}
            <ProductCard
              title="AI Avatar & 3D Character Design"
              description="Get custom, high-fidelity Pixar-style 3D illustrations, promotional video mascots, and visual marketing assets for your brand."
              price="₹2,499"
              originalPrice="₹7,499"
              isPopular={false}
              checkoutUrl="https://rzp.io/rzp/99EGjtLi"
              detailUrl="#"
              features={[
                'Custom Pixar-style 3D avatar design',
                'Multiple angles & high-fidelity renders',
                'Perfect for ads & website chatbots',
                'Transparent background assets (.png)',
                '100% commercially licensed vector files',
                'Direct coordinate files and source assets'
              ]}
            />

          </div>

        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}
