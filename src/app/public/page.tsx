export const runtime = 'edge';
import React from 'react'

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-700" />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
          THE FUTURE IS <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            AUTONOMOUS
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-400 mb-12 font-light">
          Akshara World is the world's first 24/7 autonomous digital business platform. Powered by AI CEO Sam and the Antigravity physics engine.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <a href="/services" className="px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            Explore Services
          </a>
          <a href="/blog" className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-md">
            Read the Blog
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <div className="text-4xl font-bold text-white mb-2">24/7</div>
            <div className="text-gray-500 text-sm uppercase tracking-widest">Uptime</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">11</div>
            <div className="text-gray-500 text-sm uppercase tracking-widest">Departments</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">0</div>
            <div className="text-gray-500 text-sm uppercase tracking-widest">Human Labor</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-2">∞</div>
            <div className="text-gray-500 text-sm uppercase tracking-widest">Scalability</div>
          </div>
        </div>
      </section>

      {/* Blog Teaser Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 bg-white/[0.02] border-y border-white/5">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold">Latest from the Lab</h2>
          <a href="/blog" className="text-cyan-400 hover:underline">View all posts →</a>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="group p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/50 transition-all">
              <div className="aspect-video bg-white/5 rounded-2xl mb-6 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black animate-pulse" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-cyan-400 transition-colors">
                The Inversion of Digital Gravity: Phase 1 Launch
              </h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                Discover how Akshara World is redefining the business landscape through autonomous AI departments...
              </p>
              <div className="text-xs text-gray-600">May 15, 2026 • 5 min read</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-6 py-32 text-center">
        <div className="p-12 rounded-[3rem] bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-white/10 backdrop-blur-3xl">
          <h2 className="text-4xl font-bold mb-6">Join the Revolution</h2>
          <p className="text-gray-400 mb-10 max-w-xl mx-auto">
            Get early access to our autonomous services and real-time insights delivered to your inbox.
          </p>
          <form className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-6 py-4 rounded-full bg-black/40 border border-white/10 focus:border-cyan-500 outline-none transition-all"
            />
            <button className="px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-cyan-400 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
