export const runtime = 'edge';
import React from 'react'

const DELIVERABLES = [
  'Access to Akshara World Command Center (/internal) for 30 days',
  'Google Sheets SOT configured: SalesPipeline, Transactions, WeeklyScorecard',
  'Razorpay checkout link for your own offer (or use Akshara template)',
  'Sam AI CEO daily cron with human-in-the-loop approval (max 2 directives/day)',
  'Onboarding via Google Chat group (<24h weekday response SLA)',
  '1× 15-minute Command Center walkthrough (Week 3 demo format)',
];

const TIERS = [
  {
    name: 'Early-Bird Pilot',
    price: '₹999',
    tag: 'First 5 seats only',
    color: 'from-amber-500 to-orange-500',
    badge: 'bg-amber-50 text-amber-700',
    border: 'border-amber-200',
    highlight: false,
  },
  {
    name: 'Standard',
    price: '₹1,500',
    tag: 'Default from Week 4',
    color: 'from-indigo-600 to-violet-600',
    badge: 'bg-indigo-50 text-indigo-700',
    border: 'border-indigo-300',
    highlight: true,
  },
  {
    name: 'Premium',
    price: '₹4,999',
    tag: '+1 live strategy session',
    color: 'from-slate-700 to-slate-900',
    badge: 'bg-slate-100 text-slate-700',
    border: 'border-slate-300',
    highlight: false,
  },
];

export default function LaunchPilotPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-24">

        {/* ── Hero ── */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-indigo-700 bg-indigo-50 rounded-full uppercase">
            Akshara Launch Pilot — 30-Day Real-Time Business
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight tracking-tighter">
            Launch a zero-capex digital<br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              business in 30 days
            </span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Sam AI CEO runs 8 departments on your Command Center. Setup, funnel, and first sales — all on ₹0 infrastructure.
          </p>
        </div>

        {/* ── Pricing Tiers ── */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-3xl border-2 ${t.border} bg-white p-8 shadow-sm ${t.highlight ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105' : ''} transition-transform hover:scale-[1.02]`}
            >
              {t.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">
                  Most Popular
                </div>
              )}
              <div className={`inline-block px-3 py-1 mb-4 text-xs font-bold rounded-full ${t.badge}`}>
                {t.tag}
              </div>
              <div className="text-3xl font-black mb-1">{t.price}</div>
              <div className="text-lg font-bold text-slate-700 mb-6">{t.name}</div>
              <a
                href="https://rzp.io/rzp/9O1zMeI"
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center py-3 rounded-2xl font-bold text-white bg-gradient-to-r ${t.color} hover:opacity-90 transition-opacity`}
              >
                Get Access — {t.price}
              </a>
            </div>
          ))}
        </div>

        {/* ── Deliverables ── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-10 mb-16 shadow-sm">
          <h2 className="text-2xl font-black mb-8 text-slate-900">What you get</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {DELIVERABLES.map((d) => (
              <div key={d} className="flex items-start gap-4">
                <div className="w-6 h-6 mt-0.5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm font-bold flex-shrink-0">✓</div>
                <span className="text-slate-700">{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Policies ── */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <div className="text-2xl mb-3">🔄</div>
            <h3 className="font-bold text-lg mb-2">Refund Policy</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Full refund within 7 days if Command Center access was not provisioned. No refund after live demo or data export. Razorpay handles payment disputes per gateway rules.</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <div className="text-2xl mb-3">💬</div>
            <h3 className="font-bold text-lg mb-2">Support SLA</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Weekdays (Mon–Sat): first response within 24 hours via Google Chat. Critical payment/API incidents: Telegram alert acknowledgment within 4 hours.</p>
          </div>
        </div>

        {/* ── CTA Bottom ── */}
        <div className="text-center bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-black mb-3">Ready to start?</h2>
          <p className="text-white/70 mb-8 text-lg">First 5 seats at ₹999 early-bird. Then ₹1,500 standard.</p>
          <a
            href="https://rzp.io/rzp/9O1zMeI"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 py-4 bg-white text-indigo-700 font-black rounded-2xl hover:bg-indigo-50 transition-colors shadow-xl"
          >
            Pay with Razorpay →
          </a>
          <p className="mt-4 text-white/50 text-xs">Access provisioned within 48 hours · Secure payment via Razorpay</p>
        </div>

      </div>
    </div>
  )
}
