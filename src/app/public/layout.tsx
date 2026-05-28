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
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919740322413';

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
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
              <a href="/public" className="hover:text-white transition-colors">Home</a>
              <a href="/public/about" className="hover:text-white transition-colors">About</a>
              <a href="/public/services" className="hover:text-white transition-colors">Services</a>
              <a href="/public/blog" className="hover:text-white transition-colors">Blog</a>
              <a href="https://akshara-pulse.lovable.app/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors font-semibold text-cyan-400/80">🚀 Products</a>
            </div>
            {/* Social media icons - desktop */}
            <div className="flex items-center gap-3">
              {/* Instagram */}
              <a href="https://www.instagram.com/aksharaworld" target="_blank" rel="noopener noreferrer" title="Instagram"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/50 transition-all text-gray-400 hover:text-pink-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>
                </svg>
              </a>
              {/* Facebook */}
              <a href="https://www.facebook.com/aksharaworld" target="_blank" rel="noopener noreferrer" title="Facebook"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/50 transition-all text-gray-400 hover:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
                </svg>
              </a>
              {/* YouTube */}
              <a href="https://www.youtube.com/@AksharaAI" target="_blank" rel="noopener noreferrer" title="YouTube"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 transition-all text-gray-400 hover:text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z"/>
                </svg>
              </a>
              {/* WhatsApp */}
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" title="WhatsApp"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-green-500/20 border border-white/10 hover:border-green-500/50 transition-all text-gray-400 hover:text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                </svg>
              </a>
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
