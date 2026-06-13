export const runtime = 'edge';

import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Thank You for Your Order — Akshara World',
  description: 'Your payment was successful. Our team will contact you within 24 hours to get started.',
  alternates: { canonical: 'https://aksharaworld.in/public/thank-you' },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_id?: string; status?: string }>;
}) {
  const params = await searchParams;
  const paymentId = params.payment_id || '';
  const status = params.status || 'paid';

  return (
    <main className="min-h-screen bg-[#030712] text-slate-200 flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">

      {/* Background glows */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.04] blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-10%] w-[400px] h-[400px] rounded-full bg-cyan-500/[0.03] blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full text-center">

        {/* Success Icon */}
        <div className="mx-auto mb-8 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-4xl shadow-[0_0_60px_rgba(52,211,153,0.35)] animate-pulse">
          ✅
        </div>

        {/* Headline */}
        <h1
          className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight"
          style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}
        >
          Thank You for{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Your Order!
          </span>
        </h1>

        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8 max-w-md mx-auto font-medium">
          We&apos;ve received your payment successfully.{' '}
          <span className="text-slate-300 font-semibold">
            Our team will contact you within 24 hours
          </span>{' '}
          via the email or phone you provided to Razorpay to collect any additional details needed
          to deliver your service.
        </p>

        {/* Payment ID badge */}
        {paymentId && (
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-xs font-mono text-slate-400 mb-10">
            <span className="text-emerald-400 font-bold">Payment ID:</span>
            <code className="text-slate-300">{paymentId}</code>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-black uppercase tracking-widest text-[9px]">
              {status}
            </span>
          </div>
        )}

        {/* What happens next */}
        <div className="text-left rounded-[2rem] bg-white/[0.02] border border-white/[0.06] p-8 mb-8 space-y-5">
          <h2
            className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 text-center"
            style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}
          >
            What Happens Next
          </h2>
          {[
            {
              icon: '📩',
              title: 'Check your inbox',
              desc: 'Razorpay sends a payment confirmation email within minutes.',
            },
            {
              icon: '📞',
              title: 'We reach out within 24 hrs',
              desc: 'Our team contacts you via the email/phone provided at checkout to begin your service.',
            },
            {
              icon: '🚀',
              title: 'Delivery begins',
              desc: 'For Resume & ATS services: 2-hour turnaround. For Avatar & Design: 24–48 hours.',
            },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <span className="text-2xl mt-0.5 flex-shrink-0">{step.icon}</span>
              <div>
                <div className="text-sm font-bold text-white mb-1">{step.title}</div>
                <div className="text-xs text-slate-500 font-medium leading-relaxed">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp CTA */}
        <div className="rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/[0.15] p-6 mb-10 text-center">
          <p className="text-xs text-slate-400 font-medium mb-3">
            Have a question right now?
          </p>
          <a
            href="https://wa.me/919740322413"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-colors duration-200 shadow-[0_4px_20px_rgba(52,211,153,0.25)]"
          >
            <span>💬</span> WhatsApp Us — +91 97403 22413
          </a>
        </div>

        {/* Nav links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/#services"
            className="px-6 py-3 border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all duration-200"
          >
            ← Browse More Services
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-cyan-500 text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-colors duration-200 shadow-[0_4px_20px_rgba(6,182,212,0.2)]"
          >
            Go to Homepage
          </Link>
        </div>

        <p className="mt-10 text-[10px] text-slate-600 font-semibold">
          © {new Date().getFullYear()} Akshara World · aksharaworld.in
        </p>
      </div>
    </main>
  );
}
