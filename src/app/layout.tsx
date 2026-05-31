import type { Metadata } from 'next';
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';
import { Inter, Outfit } from 'next/font/google';
import Script from 'next/script';
import { ConsentBanner } from '../components/ConsentBanner';
import AksharaChatWidget from '../components/AksharaChatWidget';
import './globals.css';

// ── Google Fonts (self-hosted by Next.js — zero layout shift) ──
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  // ── Core SEO ──
  title:       'Akshara World – AI-Powered Autonomous Business | Zero Cost Digital Empire',
  description: 'Run a 24/7 autonomous digital business with zero recurring costs. AI CEO Sam manages operations, revenue, and growth using Google Sheets, Cloudflare Workers, and Gemini AI.',
  keywords:    ['autonomous business', 'zero cost startup', 'AI CEO', 'Sam CEO', 'Cloudflare Workers', 'Google Sheets database', 'Gemini AI', 'aksharaworld'],
  authors:     [{ name: 'Sampathkumar', url: 'https://aksharaworld.in' }],
  creator:     'Akshara World',
  publisher:   'Akshara World',
  robots:      { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },

  // ── Icons ──
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },

  // ── Google Search Console Verification ──
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || 'OncBqpSQj_mCxvK-6s6w0bKFJCHTlCF8SXFdl_AhOks',
  },

  // ── Open Graph (WhatsApp, LinkedIn, Facebook) ──
  openGraph: {
    type:        'website',
    locale:      'en_IN',
    url:         'https://aksharaworld.in',
    siteName:    'Akshara World',
    title:       'Akshara World – AI Autonomous Business | Zero Cost Digital Empire',
    description: 'Run a 24/7 autonomous business with AI CEO Sam. Zero recurring costs. Live in India.',
    images:      [{ url: 'https://aksharaworld.in/og-image.jpg', width: 1200, height: 630, alt: 'Akshara World – AI CEO Dashboard' }],
  },

  // ── Twitter / X Card ──
  twitter: {
    card:        'summary_large_image',
    title:       'Akshara World – Autonomous Business at Zero Cost',
    description: 'AI CEO Sam runs the entire business. Powered by Gemini, Cloudflare, Google Sheets.',
    images:      ['https://aksharaworld.in/og-image.jpg'],
  },

  // ── Canonical ──
  alternates: { canonical: 'https://aksharaworld.in' },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        {/* ✅ Google reCAPTCHA Enterprise — Score-based v3, invisible to users */}
        <Script
          src={`https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6Lfv9vYsAAAAAH_t85p2PGbGHD1JsPbA2YyZ2Y85'}`}
          strategy="afterInteractive"
        />
        {/* Hide reCAPTCHA badge (score-based = no challenge shown) */}
        <style>{`.grecaptcha-badge { visibility: hidden !important; }`}</style>

        {/* ✅ Google Consent Mode v2 — defaults BEFORE GA4 loads */}
        <Script id="consent-mode-defaults" strategy="beforeInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            functionality_storage: 'granted',
            wait_for_update: 500
          });
        `}</Script>

        {/* ✅ Google Analytics GA4 — G-QZ4L9XW64F */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-QZ4L9XW64F'}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-QZ4L9XW64F'}', {
            page_path: window.location.pathname,
            send_page_view: true,
          });
        `}</Script>

        {/* ✅ Google AdSense — ca-pub-9728864343029052 (Auto Ads) */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-9728864343029052'}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <ClerkProvider>
          <header style={{
            position: 'fixed',
            top: 0,
            right: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
          }}>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button style={{
                  background: 'rgba(59,130,246,0.15)',
                  border: '1px solid rgba(59,130,246,0.4)',
                  color: '#93c5fd',
                  padding: '6px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}>
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button style={{
                  background: 'rgba(59,130,246,0.9)',
                  border: 'none',
                  color: '#fff',
                  padding: '6px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}>
                  Sign Up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          {children}
          {/* ✅ Cookie Consent Banner — Google Consent Mode v2 */}
          <ConsentBanner />
          {/* ✅ Floating AI Support Specialist Widget (Akshara) */}
          <AksharaChatWidget />
        </ClerkProvider>
      </body>
    </html>
  );
}
