import React from 'react'
import Script from 'next/script'
import '../globals.css'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const gscVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

  return (
    <html lang="en">
      <head>
        <title>Akshara World — Autonomous Business Hub</title>
        <meta name="description" content="Akshara World - A 24/7 autonomous business ecosystem managed by Sam AI CEO. Explore the future of digital services." />
        <meta property="og:title" content="Akshara World — Autonomous Business Hub" />
        <meta property="og:description" content="24/7 Autonomous Digital Services powered by SAM AI CEO." />
        <meta property="og:image" content="https://aksharaworld.in/og-image.png" />
        <meta property="og:url" content="https://aksharaworld.in" />
        <meta name="twitter:card" content="summary_large_image" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9728864343029052" crossOrigin="anonymous"></script>
        
        {/* Google Analytics 4 */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}

        {/* Google Tag Manager */}
        {gtmId && (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
        )}

        {/* Google Search Console site verification */}
        {gscVerification && (
          <meta name="google-site-verification" content={gscVerification} />
        )}
      </head>
      <body className="bg-[#050505] text-white selection:bg-cyan-500/30">
        {/* Google Tag Manager (noscript) */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Akshara World Logo" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                AKSHARA WORLD
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
              <a href="/" className="hover:text-white transition-colors">Home</a>
              <a href="/about" className="hover:text-white transition-colors">About</a>
              <a href="/services" className="hover:text-white transition-colors">Services</a>
              <a href="/blog" className="hover:text-white transition-colors">Blog</a>
              <a href="/public/products/launch-pilot" className="hover:text-cyan-400 transition-colors font-semibold text-cyan-400/80">🚀 Launch Pilot</a>
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
                <div className="flex items-center gap-2 font-bold text-white">
                  <img src="/logo.png" alt="Akshara World Logo" className="w-6 h-6 rounded-full border border-white/20 object-cover" />
                  <span>AKSHARA WORLD</span>
                </div>
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
                <div className="font-bold text-white uppercase tracking-widest">Products</div>
                <div className="flex flex-col gap-2">
                  <a href="/public/products/launch-pilot" className="hover:text-cyan-400">🚀 Akshara Launch Pilot</a>
                  <a href="/public/products/ai-blueprint" className="hover:text-cyan-400">📘 AI Blueprint v1.0</a>
                </div>
              </div>
              <div className="space-y-4 text-xs">
                <div className="font-bold text-white uppercase tracking-widest">Legal</div>
                <div className="flex flex-col gap-2">
                  <a href="/public/privacy" className="hover:text-cyan-400">Privacy Policy</a>
                  <a href="/public/terms" className="hover:text-cyan-400">Terms of Service</a>
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
