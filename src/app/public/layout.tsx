import React from 'react'
import '../globals.css'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
              <a href="https://dashboard.aksharaworld.in" className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all">Command Center</a>
            </div>
          </div>
        </nav>
        <main className="pt-20">
          {children}
        </main>
        <footer className="border-t border-white/10 py-12 bg-black/40">
          <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
            © 2026 Akshara World. All rights reserved. Powered by Antigravity Physics.
          </div>
        </footer>
      </body>
    </html>
  )
}
