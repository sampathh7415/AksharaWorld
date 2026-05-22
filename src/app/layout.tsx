import type { Metadata } from 'next';
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';
import { Inter, Outfit } from 'next/font/google';
import Script from 'next/script';
import { ConsentBanner } from '../components/ConsentBanner';
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
  title: 'Akshara World – Command Center',
  description: '24/7 Autonomous Digital Business Dashboard | AI CEO: Sam',
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
        </ClerkProvider>
      </body>
    </html>
  );
}
