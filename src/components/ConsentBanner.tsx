'use client';

import { useState, useEffect } from 'react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

const CONSENT_KEY = 'akshara_consent_v1';
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-QZ4L9XW64F';

/* ─────────────────────────────────────────────
   Grant/Deny helpers — Google Consent Mode v2
───────────────────────────────────────────── */
function grantConsent() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage:   'granted',
      ad_storage:          'denied',   // no ads yet
      ad_user_data:        'denied',
      ad_personalization:  'denied',
      functionality_storage: 'granted',
    });
  }
}

function denyConsent() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage:   'denied',
      ad_storage:          'denied',
      ad_user_data:        'denied',
      ad_personalization:  'denied',
      functionality_storage: 'granted', // keep for basic site function
    });
  }
}

/* ─────────────────────────────────────────────
   Default consent state (before user chooses)
   Must be called before gtag loads — see layout.tsx
───────────────────────────────────────────── */
export function initConsentDefaults() {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) { window.dataLayer.push(args); }
    // @ts-ignore
    gtag('consent', 'default', {
      analytics_storage:    'denied',
      ad_storage:           'denied',
      ad_user_data:         'denied',
      ad_personalization:   'denied',
      functionality_storage: 'granted',
      wait_for_update:       500,
    });
  }
}

/* ─────────────────────────────────────────────
   Banner Component
───────────────────────────────────────────── */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      // Show banner after 1.5s delay (let page load first)
      const timer = setTimeout(() => {
        setVisible(true);
        setAnimating(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      // Restore previous consent on load
      if (stored === 'granted') grantConsent();
      else denyConsent();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'granted');
    grantConsent();
    setAnimating(false);
    setTimeout(() => setVisible(false), 400);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'denied');
    denyConsent();
    setAnimating(false);
    setTimeout(() => setVisible(false), 400);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9999] transition-transform duration-500 ${
        animating ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* Backdrop blur strip */}
      <div className="bg-[#020617]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

          {/* Left — Text */}
          <div className="flex items-start gap-3 flex-1">
            <span className="text-xl flex-shrink-0 mt-0.5">🍪</span>
            <div>
              <div className="text-sm font-bold text-white mb-1">
                We use cookies to improve your experience
              </div>
              <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
                Akshara World uses Google Analytics to understand how visitors use our site.
                Your data helps us improve our AI systems and business tools. We never sell your data.{' '}
                <a href="/public/privacy" className="text-cyan-400 hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>

          {/* Right — Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleDecline}
              id="consent-decline-btn"
              className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              id="consent-accept-btn"
              className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-cyan-500 text-black hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
            >
              Accept Analytics ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
