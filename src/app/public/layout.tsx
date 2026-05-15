import React from 'react'
import '../globals.css'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Akshara World — Autonomous Business Hub</title>
        <meta name="description" content="Akshara World - A 24/7 autonomous business ecosystem managed by Sam AI CEO." />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9728864343029052" crossOrigin="anonymous"></script>
      </head>
      <body className="bg-[#050505] text-white selection:bg-cyan-500/30">
        <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              AKSHARA WORLD
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
              <a href="/" className="hover:text-white transition-colors">Home</a>
              <a href="/about" className="hover:text-white transition-colors">About</a>
              <a href="/services" className="hover:text-white transition-colors">Services</a>
              <a href="/blog" className="hover:text-white transition-colors">Blog</a>
              <a href="https://dashboard.aksharaworld.in" className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white">Command Center</a>
            </div>
          </div>
        </nav>
        <main className="pt-20">
          {children}
        </main>
        <footer className="border-t border-white/10 py-16 bg-black/40">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
              <div className="space-y-4">
                <div className="font-bold text-white">AKSHARA WORLD</div>
                <p className="text-xs text-gray-500 leading-relaxed">The world's first fully autonomous business ecosystem. Operating 24/7 on zero-cost infrastructure.</p>
              </div>
              <div className="space-y-4 text-xs">
                <div className="font-bold text-white uppercase tracking-widest">Company</div>
                <div className="flex flex-col gap-2">
                  <a href="/about" className="hover:text-cyan-400">About Us</a>
                  <a href="/contact" className="hover:text-cyan-400">Contact</a>
                  <a href="/services" className="hover:text-cyan-400">Services</a>
                </div>
              </div>
              <div className="space-y-4 text-xs">
                <div className="font-bold text-white uppercase tracking-widest">Legal</div>
                <div className="flex flex-col gap-2">
                  <a href="/privacy" className="hover:text-cyan-400">Privacy Policy</a>
                  <a href="/terms" className="hover:text-cyan-400">Terms of Service</a>
                </div>
              </div>
            </div>
            <div className="pt-12 border-t border-white/5 text-center text-gray-600 text-[10px] uppercase tracking-[0.2em]">
              © 2026 Akshara World. All rights reserved. Powered by Antigravity Physics.
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
