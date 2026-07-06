'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormSubmitted(true);
    e.currentTarget.reset();
    setTimeout(() => {
      setFormSubmitted(false);
    }, 4000);
  };

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

      {/* Experience / Timeline Section */}
      <section id="experience" className="py-20 bg-black/15 border-y border-white/5 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-3">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
              Experience Healing as the Sages Did — Within Moments
            </h2>
            <p className="text-xs text-slate-500 font-semibold max-w-xl mx-auto mt-4 leading-relaxed">
              Rest upon it and awaken your inner balance through a guided timeline of calm.
            </p>
          </div>

          <div className="flex flex-col max-w-2xl mx-auto relative">
            {[
              { time: '30 sec', text: 'Gentle tingling awakens your senses.' },
              { time: '1 min', text: 'A wave of vitality energizes you as blood flow increases.' },
              { time: '2 min', text: "A flow of warmth and relief as the day's stress melts away." },
              { time: '3 min', text: 'A sense of peace as your body starts to unwind.' },
              { time: '5 min', text: 'A gentle flood of happiness.' },
              { time: '10 min', text: 'A deep, intense calm.' },
              { time: '20 min', text: 'Rejuvenation and blissful tranquility for body and mind.' },
            ].map((item, i, arr) => (
              <div key={i} className="flex gap-6 py-4 items-start relative group">
                <div className="text-xs md:text-sm font-bold text-cyan-400 min-w-[70px] text-right pt-0.5">
                  {item.time}
                </div>
                <div className="relative flex flex-col items-center flex-shrink-0 mt-1">
                  <div className="w-3 h-3 rounded-full bg-[#030712] border-2 border-cyan-400 z-10 group-hover:scale-110 transition-transform duration-300" />
                  {i < arr.length - 1 && (
                    <div className="absolute top-3 w-[1px] h-[calc(100%+32px)] bg-white/10" />
                  )}
                </div>
                <div className="text-xs sm:text-sm text-slate-400 font-semibold leading-relaxed">
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-3">
            Get In Touch
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
            How Can We Help You?
          </h2>
          <p className="text-xs text-slate-500 font-semibold max-w-lg mx-auto mt-4 leading-relaxed">
            Ready to deploy your autonomous empire? Send us a message and Sam CEO will coordinate the right swarm wing for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 md:p-12 max-w-4xl mx-auto backdrop-blur-3xl shadow-2xl">
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-white" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
              Connect With Us
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              We're available 24/7 through our autonomous support system. Reach out for services, partnerships, or questions about our zero-cost digital infrastructure.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 text-xs text-slate-400 font-bold">
                <span className="text-cyan-400 text-base">📧</span> contact@aksharaworld.in
              </div>
              <div className="flex items-center gap-3.5 text-xs text-slate-400 font-bold">
                <span className="text-cyan-400 text-base">🌐</span> aksharaworld.in
              </div>
              <div className="flex items-center gap-3.5 text-xs text-slate-400 font-bold">
                <span className="text-cyan-400 text-base">⚡</span> Edge-deployed globally via Cloudflare
              </div>
              <div className="flex items-center gap-3.5 text-xs text-slate-400 font-bold">
                <span className="text-cyan-400 text-base">🤖</span> Managed by Sam CEO v2.2
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            <input
              type="text"
              placeholder="Your Name"
              required
              className="w-full px-4 py-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-xs font-semibold text-white placeholder-slate-600 outline-none focus:border-cyan-400/50 transition-colors"
            />
            <input
              type="email"
              placeholder="Your Email"
              required
              className="w-full px-4 py-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-xs font-semibold text-white placeholder-slate-600 outline-none focus:border-cyan-400/50 transition-colors"
            />
            <input
              type="text"
              placeholder="Subject (e.g. Resume ATS, 3D Avatar...)"
              className="w-full px-4 py-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-xs font-semibold text-white placeholder-slate-600 outline-none focus:border-cyan-400/50 transition-colors"
            />
            <textarea
              rows={4}
              placeholder="Tell us about your project..."
              required
              className="w-full px-4 py-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-xs font-semibold text-white placeholder-slate-600 outline-none focus:border-cyan-400/50 transition-colors resize-none"
            />
            <button
              type="submit"
              className={`w-full py-4 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-[0_4px_25px_rgba(6,182,212,0.25)] ${
                formSubmitted
                  ? 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                  : 'bg-cyan-500 hover:scale-[1.01] hover:bg-white'
              }`}
            >
              {formSubmitted ? '✓ Message Sent! Sam CEO is on it.' : 'Send Message →'}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}
